"""Multi-format source ingestion: PDF (+ scanned OCR), DOCX, Markdown, TXT, CSV, JSON, HTML, URL, YouTube transcripts, Audio/Video, Images, local folders, and Web Discovery."""

from __future__ import annotations

import csv
import io
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Optional
from urllib.parse import parse_qs, urlparse

from . import runtime, store

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MiB

_IMAGE_EXTS = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}
_AUDIO_VIDEO_EXTS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".mp4", ".webm"}
_TEXT_EXTS = {
    ".txt", ".md", ".markdown", ".yaml", ".yml", ".toml", ".ini", ".cfg",
    ".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".go", ".rs", ".java",
    ".c", ".cpp", ".h", ".hpp", ".cs", ".rb", ".php", ".sh", ".sql", ".css",
    ".rst", ".tex", ".log",
}
_SYNCABLE_EXTS = _TEXT_EXTS | {".pdf", ".docx", ".csv", ".tsv", ".json", ".html", ".htm"}
_SKIP_DIRS = frozenset({
    ".git", ".hg", ".svn", "node_modules", "__pycache__", ".venv", "venv",
    "dist", "build", ".next", ".nuxt", ".pytest_cache", ".mypy_cache", "target",
})

_YT_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{11}$")


def sanitize_filename(name: str) -> str:
    base = Path(name or "upload.txt").name
    clean = re.sub(r"[^\w.\- ]+", "_", base).strip(" .")
    return clean[:140] or "upload.txt"


def _check_local_path_safe(path: Path) -> None:
    """Enforce Hermes's public `agent.file_safety` policy before reading any local path."""
    try:
        from agent.file_safety import get_read_block_error

        err = get_read_block_error(str(path))
        if err:
            raise PermissionError(str(err))
    except ImportError:
        pass


class _ReadabilityHTMLParser(HTMLParser):
    _SKIP_TAGS = frozenset({"script", "style", "noscript", "svg", "nav", "footer", "header", "aside"})
    _BLOCK_TAGS = frozenset({"p", "div", "section", "article", "li", "tr", "blockquote", "pre", "br"})
    _HEADING_TAGS = {"h1": "# ", "h2": "## ", "h3": "### ", "h4": "#### "}

    def __init__(self) -> None:
        super().__init__()
        self._skip_depth = 0
        self._in_title = False
        self.title = ""
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]) -> None:
        t = tag.lower()
        if t in self._SKIP_TAGS:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return
        if t == "title":
            self._in_title = True
        elif t in self._HEADING_TAGS:
            self._parts.append(f"\n\n{self._HEADING_TAGS[t]}")
        elif t == "li":
            self._parts.append("\n- ")
        elif t in self._BLOCK_TAGS:
            self._parts.append("\n\n")

    def handle_endtag(self, tag: str) -> None:
        t = tag.lower()
        if t in self._SKIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
            return
        if t == "title":
            self._in_title = False
        elif t in self._HEADING_TAGS or t in ("p", "blockquote", "pre"):
            self._parts.append("\n\n")

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        if self._in_title:
            self.title += data
            return
        text = re.sub(r"\s+", " ", data)
        if text.strip():
            self._parts.append(text)

    def markdown(self) -> str:
        raw = "".join(self._parts)
        return re.sub(r"\n{3,}", "\n\n", raw).strip()


def extract_html_to_markdown(html: str) -> tuple[str, str]:
    parser = _ReadabilityHTMLParser()
    parser.feed(html or "")
    return parser.title.strip(), parser.markdown()


def extract_csv_to_markdown(raw_text: str, filename: str, delimiter: str = ",") -> str:
    """Convert CSV/TSV rows into a structured Markdown table for clean chunking and retrieval."""
    reader = csv.reader(io.StringIO(raw_text), delimiter=delimiter)
    rows = [r for r in reader if any(cell.strip() for cell in r)]
    if not rows:
        return raw_text.strip()
    headers = [h.strip() or f"Column {i + 1}" for i, h in enumerate(rows[0])]
    lines = [f"# {filename}", "", "| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for row in rows[1:500]:
        padded = [str(row[i]).strip().replace("|", "\\|") if i < len(row) else "" for i in range(len(headers))]
        lines.append("| " + " | ".join(padded) + " |")
    if len(rows) > 501:
        lines.append(f"\nShowing first 500 of {len(rows) - 1} rows.")
    return "\n".join(lines).strip()


def extract_json_to_markdown(raw_text: str, filename: str) -> str:
    """Render structured JSON cleanly as Markdown sections or formatted JSON."""
    try:
        parsed = json.loads(raw_text)
    except Exception:
        return raw_text.strip()
    if isinstance(parsed, list) and parsed and all(isinstance(r, dict) for r in parsed[:20]):
        keys = list(dict.fromkeys(k for r in parsed[:50] for k in r.keys()))[:12]
        lines = [f"# {filename}", "", "| " + " | ".join(str(k) for k in keys) + " |", "| " + " | ".join("---" for _ in keys) + " |"]
        for r in parsed[:300]:
            vals = [str(r.get(k, "")).replace("\n", " ").replace("|", "\\|")[:140] for k in keys]
            lines.append("| " + " | ".join(vals) + " |")
        return "\n".join(lines).strip()
    pretty = json.dumps(parsed, indent=2, ensure_ascii=False)
    return f"# {filename}\n\n```json\n{pretty}\n```"


def extract_pdf_bytes(raw: bytes, *, filename: str = "document.pdf", ctx: Any = None) -> tuple[str, dict[str, Any]]:
    """Extract PDF pages via PyMuPDF (fitz), pdfplumber, or pypdf — with automatic vision OCR for scanned pages."""
    pages: list[str] = []
    empty_indices: list[int] = []
    total_pages = 0
    ocr_pages = 0

    # Tier 1: PyMuPDF (best layout fidelity + native page rendering for OCR)
    try:
        import fitz  # type: ignore

        doc = fitz.open(stream=raw, filetype="pdf")
        total_pages = len(doc)
        for idx, page in enumerate(doc, start=1):
            txt = (page.get_text("text") or "").strip()
            if len(txt) < 40 and runtime.llm_available(ctx) and ocr_pages < 12:
                try:
                    pix = page.get_pixmap(dpi=150)
                    txt = extract_image_bytes(pix.tobytes("png"), "image/png", f"{filename} (p.{idx})", ctx=ctx)
                    ocr_pages += 1
                except Exception:
                    empty_indices.append(idx)
            elif len(txt) < 40:
                empty_indices.append(idx)
            pages.append(f"<!-- p:{idx} -->\n{txt}")
        doc.close()
    except ImportError:
        # Tier 2: pdfplumber (strong table extraction)
        try:
            import pdfplumber  # type: ignore

            with pdfplumber.open(io.BytesIO(raw)) as pdf:
                total_pages = len(pdf.pages)
                for idx, page in enumerate(pdf.pages, start=1):
                    txt = (page.extract_text() or "").strip()
                    if len(txt) < 40:
                        empty_indices.append(idx)
                    pages.append(f"<!-- p:{idx} -->\n{txt}")
        except ImportError:
            # Tier 3: pypdf
            try:
                import pypdf
            except ImportError as exc:
                raise RuntimeError(
                    "PDF extraction requires pymupdf, pdfplumber, or pypdf. "
                    "Install one in Hermes's environment (uv pip install pypdf) "
                    "or upload Markdown, TXT, CSV, JSON, or DOCX."
                ) from exc
            reader = pypdf.PdfReader(io.BytesIO(raw))
            total_pages = len(reader.pages)
            for idx, page in enumerate(reader.pages, start=1):
                txt = (page.extract_text() or "").strip()
                if len(txt) < 40:
                    empty_indices.append(idx)
                pages.append(f"<!-- p:{idx} -->\n{txt}")

    full = "\n\n".join(pages).strip()
    needs_ocr = total_pages > 0 and (len(empty_indices) / total_pages) > 0.7 and ocr_pages == 0
    if not full or len(re.sub(r"<!--\s*p:\d+\s*-->", "", full).strip()) < 10:
        raise ValueError(
            "This PDF appears to be scanned or image-only with no extractable text layer. "
            "Install `pymupdf` (`uv pip install pymupdf`) to enable automatic vision OCR on scanned PDFs."
        )
    return full, {"pages": total_pages, "needs_ocr": needs_ocr, "ocr_pages": ocr_pages}


def extract_docx_bytes(raw: bytes) -> str:
    """Extract DOCX to Markdown via python-docx if installed, else zero-dep stdlib ZIP/XML."""
    try:
        import docx  # type: ignore

        doc = docx.Document(io.BytesIO(raw))
        blocks: list[str] = []
        for para in doc.paragraphs:
            txt = para.text.strip()
            if not txt:
                continue
            style = (para.style.name or "").lower() if para.style else ""
            if style.startswith("heading"):
                m = re.search(r"(\d+)", style)
                lvl = min(6, max(1, int(m.group(1)))) if m else 2
                blocks.append(f"{'#' * lvl} {txt}")
            else:
                blocks.append(txt)
        for tbl in doc.tables:
            rows = [[c.text.strip().replace("\n", " ") for c in row.cells] for row in tbl.rows]
            if rows:
                header = "| " + " | ".join(rows[0]) + " |"
                sep = "| " + " | ".join("---" for _ in rows[0]) + " |"
                body = ["| " + " | ".join(r) + " |" for r in rows[1:]]
                blocks.append("\n".join([header, sep, *body]))
        return "\n\n".join(blocks).strip()
    except ImportError:
        pass

    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
        if "word/document.xml" not in zf.namelist():
            raise ValueError("Invalid DOCX archive: missing word/document.xml")
        xml_bytes = zf.read("word/document.xml")
    root = ET.fromstring(xml_bytes)
    paragraphs: list[str] = []
    for p in root.findall(".//w:p", ns):
        texts = [t.text for t in p.findall(".//w:t", ns) if t.text]
        line = "".join(texts).strip()
        if not line:
            continue
        pstyle = p.find("./w:pPr/w:pStyle", ns)
        style_val = (pstyle.attrib.get(f"{{{ns['w']}}}val", "") if pstyle is not None else "").lower()
        if style_val.startswith("heading"):
            m = re.search(r"(\d+)", style_val)
            lvl = min(6, max(1, int(m.group(1)))) if m else 2
            paragraphs.append(f"{'#' * lvl} {line}")
        else:
            paragraphs.append(line)
    return "\n\n".join(paragraphs).strip()


def extract_image_bytes(raw: bytes, mime_type: str, filename: str, *, ctx: Any = None) -> str:
    """Caption and OCR an uploaded image via Hermes's universal vision-routed complete_json."""
    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "summary": {"type": "string"},
            "extracted_text": {"type": "string"},
            "key_details": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["summary", "extracted_text"],
    }
    parsed, _ = runtime.complete_json(
        instructions=(
            "Analyze this image thoroughly for a research notebook. Transcribe ALL visible text, "
            "tables, numbers, labels, and diagram relationships accurately into extracted_text, "
            "and summarize the visual content in summary."
        ),
        input_blocks=[
            {"type": "text", "text": f"Filename: {filename}"},
            {"type": "image", "data": raw, "mime_type": mime_type},
        ],
        json_schema=schema,
        schema_name="sourcebook.image_ingest",
        purpose="sourcebook.ingest.image",
        temperature=0.0,
        ctx=ctx,
    )
    summary = str(parsed.get("summary") or "")
    extracted = str(parsed.get("extracted_text") or "")
    details = parsed.get("key_details") or []
    parts = [f"# {parsed.get('title') or filename}", "", summary]
    if details:
        parts.append("\n## Key Visual Details\n" + "\n".join(f"- {d}" for d in details))
    if extracted:
        parts.append("\n## Extracted Text\n" + extracted)
    return "\n".join(parts).strip()


def _fmt_ts(seconds: float) -> str:
    sec = max(0, int(seconds))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def extract_audio_bytes(raw: bytes, filename: str) -> str:
    """Transcribe an uploaded audio/video file into timestamped Markdown chunks using local Whisper when installed."""
    import tempfile

    ext = Path(filename).suffix.lower() or ".mp3"
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tf:
        tf.write(raw)
        tmp_path = tf.name
    try:
        # Try faster-whisper first (Hermes local STT backend)
        try:
            from faster_whisper import WhisperModel  # type: ignore

            model = WhisperModel("small", device="cpu", compute_type="int8")
            segments, _ = model.transcribe(tmp_path, vad_filter=True)
            lines = [f"# {filename}", ""]
            bucket_start = 0.0
            bucket: list[str] = []
            for seg in segments:
                txt = (seg.text or "").strip()
                if not txt:
                    continue
                if not bucket:
                    bucket_start = float(seg.start or 0.0)
                bucket.append(txt)
                if float(seg.end or 0.0) - bucket_start >= 45.0:
                    lines.append(f"## [{_fmt_ts(bucket_start)}]")
                    lines.append(f"<!-- t:{int(bucket_start)} -->")
                    lines.append(" ".join(bucket))
                    lines.append("")
                    bucket = []
            if bucket:
                lines.append(f"## [{_fmt_ts(bucket_start)}]")
                lines.append(f"<!-- t:{int(bucket_start)} -->")
                lines.append(" ".join(bucket))
            return "\n".join(lines).strip()
        except ImportError:
            pass

        raise RuntimeError(
            "Audio/video transcription requires `faster-whisper` installed in Hermes's environment "
            "(uv pip install faster-whisper), or upload a transcript Markdown/TXT file."
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def extract_youtube_id(url: str) -> Optional[str]:
    parsed = urlparse((url or "").strip())
    host = (parsed.hostname or "").lower()
    if host in ("youtu.be", "www.youtu.be"):
        vid = parsed.path.lstrip("/").split("/")[0]
        return vid if _YT_ID_RE.fullmatch(vid) else None
    if host.endswith("youtube.com"):
        if parsed.path == "/watch":
            vid = (parse_qs(parsed.query).get("v") or [""])[0]
            return vid if _YT_ID_RE.fullmatch(vid) else None
        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) >= 2 and parts[0] in ("shorts", "embed", "live") and _YT_ID_RE.fullmatch(parts[1]):
            return parts[1]
    return None


def _fetch_youtube_title(url: str) -> str:
    try:
        oembed = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url, safe='')}&format=json"
        req = urllib.request.Request(oembed, headers={"User-Agent": "Hermes-SourceBook/0.1"})
        with urllib.request.urlopen(req, timeout=8) as resp:  # noqa: S310
            data = json.loads(resp.read(65536).decode("utf-8", errors="replace"))
            title = str(data.get("title") or "").strip()
            author = str(data.get("author_name") or "").strip()
            if title and author:
                return f"{title} ({author})"
            return title
    except Exception:
        return ""


def extract_youtube_transcript(url: str, video_id: str) -> tuple[str, str, dict[str, Any]]:
    """Extract a real timestamped YouTube transcript using youtube-transcript-api (v1.x or v0.6.x)."""
    from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore

    segments: list[dict[str, Any]] = []
    if hasattr(YouTubeTranscriptApi, "fetch"):
        api_obj = YouTubeTranscriptApi()
        fetched = api_obj.fetch(video_id, languages=("en", "en-US", "en-GB"))
        for item in fetched:
            segments.append({
                "text": str(getattr(item, "text", item["text"] if isinstance(item, dict) else "")),
                "start": float(getattr(item, "start", item["start"] if isinstance(item, dict) else 0.0)),
                "duration": float(getattr(item, "duration", item["duration"] if isinstance(item, dict) else 0.0)),
            })
    else:
        raw_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US", "en-GB"])
        for item in raw_list:
            segments.append({
                "text": str(item.get("text", "")),
                "start": float(item.get("start", 0.0)),
                "duration": float(item.get("duration", 0.0)),
            })

    if not segments:
        raise ValueError("YouTube video has no available caption track.")

    title = _fetch_youtube_title(url) or f"YouTube Video ({video_id})"
    lines = [f"# {title}", f"Source URL: {url}", ""]
    bucket_start = 0.0
    bucket: list[str] = []
    for seg in segments:
        txt = re.sub(r"\s+", " ", seg["text"]).strip()
        if not txt:
            continue
        if not bucket:
            bucket_start = seg["start"]
        bucket.append(txt)
        if seg["start"] - bucket_start >= 45.0 or len(" ".join(bucket)) >= 700:
            lines.append(f"## [{_fmt_ts(bucket_start)}]")
            lines.append(f"<!-- t:{int(bucket_start)} -->")
            lines.append(" ".join(bucket))
            lines.append("")
            bucket = []
    if bucket:
        lines.append(f"## [{_fmt_ts(bucket_start)}]")
        lines.append(f"<!-- t:{int(bucket_start)} -->")
        lines.append(" ".join(bucket))

    duration_sec = int(segments[-1]["start"] + segments[-1]["duration"])
    return title, "\n".join(lines).strip(), {"youtube_id": video_id, "duration_sec": duration_sec}


def _is_url_safe(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return False
    try:
        from tools.url_safety import is_safe_url

        return bool(is_safe_url(url))
    except Exception:
        host = (parsed.hostname or "").lower()
        blocked = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"}
        if host in blocked or host.startswith(("10.", "192.168.", "127.")):
            return False
        return True


def extract_url(url: str, *, ctx: Any = None) -> tuple[str, str, dict[str, Any]]:
    """Fetch YouTube transcript, Hermes web_extract Markdown, or SSRF-checked stdlib HTTP readability."""
    clean_url = (url or "").strip()
    if not _is_url_safe(clean_url):
        raise ValueError(f"URL is invalid or blocked by SSRF policy: {clean_url!r}")

    # Dedicated YouTube transcript extraction with clickable timestamps
    yt_id = extract_youtube_id(clean_url)
    if yt_id:
        try:
            return extract_youtube_transcript(clean_url, yt_id)
        except Exception:
            pass

    try:
        raw = runtime.dispatch_tool("web_extract", {"urls": [clean_url], "char_limit": 50000}, ctx=ctx)
        data = json.loads(raw) if isinstance(raw, str) else raw
        if isinstance(data, dict) and isinstance(data.get("results"), list) and data["results"]:
            first = data["results"][0]
            content = (first.get("content") or first.get("text") or first.get("markdown") or "").strip()
            title = (first.get("title") or "").strip()
            if content and not content.lower().startswith("blocked:"):
                return title or clean_url, content, {}
    except Exception:
        pass

    req = urllib.request.Request(clean_url, headers={"User-Agent": "Hermes-SourceBook/0.1 (+https://github.com/abundantbeing/sourcebook)"})
    with urllib.request.urlopen(req, timeout=15) as resp:  # noqa: S310 - validated above with is_safe_url
        ctype = (resp.headers.get("Content-Type") or "").lower()
        body = resp.read(MAX_UPLOAD_BYTES)
    if "application/pdf" in ctype or clean_url.lower().endswith(".pdf"):
        text, meta = extract_pdf_bytes(body, filename=Path(urlparse(clean_url).path).name or "remote.pdf", ctx=ctx)
        meta["_pdf_bytes"] = body
        return Path(urlparse(clean_url).path).name or clean_url, text, meta
    decoded = body.decode("utf-8", errors="replace")
    if "html" in ctype or "<html" in decoded[:512].lower():
        title, md = extract_html_to_markdown(decoded)
        if not md:
            raise ValueError("Extracted empty content from web page")
        return title or clean_url, md, {}
    return clean_url, decoded, {}


def _extract_bytes_payload(
    filename: str,
    raw: bytes,
    *,
    content_type: Optional[str] = None,
    ctx: Any = None,
) -> tuple[str, str, dict[str, Any]]:
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError(f"File exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} MiB upload limit")
    safe_name = sanitize_filename(filename)
    ext = Path(safe_name).suffix.lower()
    extra_meta: dict[str, Any] = {}

    if ext == ".pdf" or content_type == "application/pdf":
        text, extra_meta = extract_pdf_bytes(raw, filename=safe_name, ctx=ctx)
        kind = "pdf"
    elif ext == ".docx" or (content_type and "wordprocessingml" in content_type):
        text = extract_docx_bytes(raw)
        kind = "docx"
    elif ext in (".html", ".htm") or (content_type and "text/html" in content_type):
        decoded = raw.decode("utf-8-sig", errors="replace")
        _, text = extract_html_to_markdown(decoded)
        kind = "url"
    elif ext in (".csv", ".tsv"):
        decoded = raw.decode("utf-8-sig", errors="replace")
        text = extract_csv_to_markdown(decoded, safe_name, delimiter="\t" if ext == ".tsv" else ",")
        kind = "csv"
    elif ext == ".json" or (content_type and "application/json" in content_type):
        decoded = raw.decode("utf-8-sig", errors="replace")
        text = extract_json_to_markdown(decoded, safe_name)
        kind = "json"
    elif ext in _IMAGE_EXTS or (content_type and content_type.startswith("image/")):
        mime = content_type or _IMAGE_EXTS.get(ext, "image/png")
        text = extract_image_bytes(raw, mime, safe_name, ctx=ctx)
        kind = "image"
    elif ext in _AUDIO_VIDEO_EXTS or (content_type and content_type.startswith(("audio/", "video/"))):
        text = extract_audio_bytes(raw, safe_name)
        kind = "audio"
    elif ext in _TEXT_EXTS or (content_type and content_type.startswith("text/")):
        text = raw.decode("utf-8-sig", errors="replace")
        kind = "markdown" if ext in (".md", ".markdown") else "text"
    else:
        try:
            text = raw.decode("utf-8-sig")
            kind = "text"
        except UnicodeDecodeError as exc:
            raise ValueError(f"Unsupported binary file type: {ext or content_type or 'unknown'}") from exc
    return text, kind, extra_meta


def ingest_bytes(
    nb: str,
    filename: str,
    raw: bytes,
    *,
    content_type: Optional[str] = None,
    ctx: Any = None,
) -> dict[str, Any]:
    safe_name = sanitize_filename(filename)
    ext = Path(safe_name).suffix.lower()
    chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)
    text, kind, extra_meta = _extract_bytes_payload(safe_name, raw, content_type=content_type, ctx=ctx)

    return store.add_source(
        nb,
        title=safe_name,
        text=text,
        kind=kind,
        origin=safe_name,
        raw_bytes=raw,
        raw_ext=ext,
        chunk_chars=chunk_chars,
        extra_meta=extra_meta,
    )


def ingest_url(nb: str, url: str, *, title: Optional[str] = None, ctx: Any = None) -> dict[str, Any]:
    chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)
    extracted_title, text, extra_meta = extract_url(url, ctx=ctx)
    pdf_bytes = extra_meta.pop("_pdf_bytes", None)
    kind = (
        "pdf"
        if pdf_bytes is not None
        else ("youtube" if extract_youtube_id(url) or any(h in url.lower() for h in ("youtube.com/", "youtu.be/")) else "url")
    )
    return store.add_source(
        nb,
        title=(title or extracted_title or url).strip(),
        text=text,
        kind=kind,
        origin=url.strip(),
        raw_bytes=pdf_bytes,
        raw_ext=".pdf" if pdf_bytes is not None else None,
        chunk_chars=chunk_chars,
        extra_meta=extra_meta,
    )


def ingest_local_path(
    nb: str,
    local_path: str,
    *,
    max_files: int = 40,
    ctx: Any = None,
) -> dict[str, Any]:
    """Ingest a local file or recursively sync a local folder / Obsidian vault / codebase into the notebook."""
    target = Path((local_path or "").strip()).expanduser()
    if not target.exists():
        raise FileNotFoundError(f"Local path not found: {local_path!r}")
    resolved = target.resolve()
    _check_local_path_safe(resolved)
    chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)

    if resolved.is_file():
        raw = resolved.read_bytes()
        text, kind, extra = _extract_bytes_payload(resolved.name, raw, ctx=ctx)
        extra["origin_path"] = str(resolved)
        extra["mtime"] = resolved.stat().st_mtime
        src = store.add_source(
            nb,
            title=resolved.name,
            text=text,
            kind=kind,
            origin=str(resolved),
            raw_bytes=raw if resolved.suffix.lower() in (".csv", ".tsv", ".json") else None,
            raw_ext=resolved.suffix.lower() if resolved.suffix.lower() in (".csv", ".tsv", ".json") else None,
            chunk_chars=chunk_chars,
            extra_meta=extra,
        )
        return {"added": [src], "skipped": [], "errors": [], "root": str(resolved)}

    added: list[dict[str, Any]] = []
    skipped: list[str] = []
    errors: list[str] = []
    count = 0

    for root_dir, dirnames, filenames in os.walk(resolved):
        dirnames[:] = sorted(d for d in dirnames if d not in _SKIP_DIRS and not d.startswith("."))
        for fname in sorted(filenames):
            if count >= max_files:
                break
            fpath = Path(root_dir) / fname
            ext = fpath.suffix.lower()
            if ext not in _SYNCABLE_EXTS:
                continue
            try:
                _check_local_path_safe(fpath)
                st = fpath.stat()
                if st.st_size == 0 or st.st_size > MAX_UPLOAD_BYTES:
                    skipped.append(str(fpath.relative_to(resolved)))
                    continue
                raw = fpath.read_bytes()
                rel = str(fpath.relative_to(resolved)).replace("\\", "/")
                text, kind, extra = _extract_bytes_payload(fpath.name, raw, ctx=ctx)
                extra["origin_path"] = str(fpath.resolve())
                extra["mtime"] = st.st_mtime
                src = store.add_source(
                    nb,
                    title=rel,
                    text=text,
                    kind=kind,
                    origin=str(fpath.resolve()),
                    raw_bytes=raw if ext in (".csv", ".tsv", ".json") else None,
                    raw_ext=ext if ext in (".csv", ".tsv", ".json") else None,
                    chunk_chars=chunk_chars,
                    extra_meta=extra,
                )
                added.append(src)
                count += 1
            except Exception as exc:
                errors.append(f"{fname}: {exc}")
        if count >= max_files:
            break

    return {"added": added, "skipped": skipped, "errors": errors, "root": str(resolved)}


def refresh_source(nb: str, src: str, *, ctx: Any = None) -> dict[str, Any]:
    """Re-fetch a URL source or re-read a linked local file in place to detect changes & update Living Notes."""
    meta = store.get_source(nb, src)
    if not meta:
        raise FileNotFoundError(f"source {src!r} not found")
    chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)

    origin_path = meta.get("origin_path")
    if origin_path:
        p = Path(str(origin_path))
        if not p.is_file():
            raise FileNotFoundError(f"Linked local file no longer exists: {origin_path}")
        _check_local_path_safe(p)
        raw = p.read_bytes()
        text, _, extra = _extract_bytes_payload(p.name, raw, ctx=ctx)
        extra["mtime"] = p.stat().st_mtime
        return store.refresh_source_content(nb, src, text, chunk_chars=chunk_chars, extra_meta=extra)

    origin = str(meta.get("origin") or "")
    if origin.startswith(("http://", "https://")):
        extracted_title, text, extra = extract_url(origin, ctx=ctx)
        return store.refresh_source_content(nb, src, text, title=meta.get("title") or extracted_title, chunk_chars=chunk_chars, extra_meta=extra)

    raise ValueError("Only URL, YouTube, and linked local file sources can be refreshed in place.")


class _DDGResultParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.results: list[dict[str, str]] = []
        self._in_link = False
        self._in_snip = False
        self._cur: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, Optional[str]]]) -> None:
        amap = dict(attrs)
        cls = amap.get("class") or ""
        if tag == "a" and "result__a" in cls:
            href = amap.get("href") or ""
            if "uddg=" in href:
                qs = parse_qs(urlparse(href).query)
                href = (qs.get("uddg") or [href])[0]
            self._cur = {"url": href, "title": "", "snippet": ""}
            self._in_link = True
        elif tag in ("a", "div", "span") and "result__snippet" in cls and self._cur:
            self._in_snip = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._in_link:
            self._in_link = False
            if self._cur.get("url") and self._cur.get("title"):
                self.results.append(self._cur)
        elif self._in_snip:
            self._in_snip = False

    def handle_data(self, data: str) -> None:
        if self._in_link:
            self._cur["title"] += data
        elif self._in_snip and self.results:
            self.results[-1]["snippet"] += data


def discover_web_sources(query: str, *, limit: int = 8, ctx: Any = None) -> list[dict[str, str]]:
    """Search the web via Hermes `web_search` tool (or DuckDuckGo HTML fallback) to suggest sources to import."""
    q = (query or "").strip()
    if not q:
        raise ValueError("Discovery query cannot be empty")
    limit = max(1, min(15, int(limit)))

    # Prefer Hermes's configured web_search tool
    try:
        raw = runtime.dispatch_tool("web_search", {"query": q, "limit": limit}, ctx=ctx)
        data = json.loads(raw) if isinstance(raw, str) else raw
        items = data.get("results") if isinstance(data, dict) else (data if isinstance(data, list) else [])
        out: list[dict[str, str]] = []
        for it in items or []:
            if not isinstance(it, dict):
                continue
            url = str(it.get("url") or it.get("link") or "").strip()
            if not url or not _is_url_safe(url):
                continue
            out.append({
                "title": str(it.get("title") or url).strip()[:160],
                "url": url,
                "domain": (urlparse(url).hostname or "").replace("www.", ""),
                "snippet": str(it.get("snippet") or it.get("description") or it.get("content") or "").strip()[:240],
            })
            if len(out) >= limit:
                break
        if out:
            return out
    except Exception:
        pass

    # Clean zero-key DuckDuckGo HTML fallback
    try:
        ddg_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(q)}"
        req = urllib.request.Request(ddg_url, headers={"User-Agent": "Mozilla/5.0 (compatible; Hermes-SourceBook/0.1)"})
        with urllib.request.urlopen(req, timeout=12) as resp:  # noqa: S310
            body = resp.read(512 * 1024).decode("utf-8", errors="replace")
        parser = _DDGResultParser()
        parser.feed(body)
        out = []
        for r in parser.results:
            u = (r.get("url") or "").strip()
            if not u or not _is_url_safe(u):
                continue
            out.append({
                "title": re.sub(r"\s+", " ", r.get("title", "")).strip()[:160],
                "url": u,
                "domain": (urlparse(u).hostname or "").replace("www.", ""),
                "snippet": re.sub(r"\s+", " ", r.get("snippet", "")).strip()[:240],
            })
            if len(out) >= limit:
                break
        if out:
            return out
    except Exception:
        pass

    # Secondary zero-key Wikipedia REST fallback for research resilience
    try:
        wiki_url = f"https://en.wikipedia.org/w/rest.php/v1/search/page?q={urllib.parse.quote_plus(q)}&limit={limit}"
        req = urllib.request.Request(wiki_url, headers={"User-Agent": "Hermes-SourceBook/0.1 (+https://github.com/abundantbeing/sourcebook)"})
        with urllib.request.urlopen(req, timeout=10) as resp:  # noqa: S310
            wdata = json.loads(resp.read(256 * 1024).decode("utf-8", errors="replace"))
        out = []
        for page in (wdata.get("pages") or [])[:limit]:
            key = str(page.get("key") or "").strip()
            if not key:
                continue
            url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(key, safe='/_()-')}"
            if not _is_url_safe(url):
                continue
            excerpt = re.sub(r"<[^>]+>", "", str(page.get("excerpt") or page.get("description") or "")).strip()
            out.append({
                "title": str(page.get("title") or key)[:160],
                "url": url,
                "domain": "en.wikipedia.org",
                "snippet": excerpt[:240],
            })
        return out
    except Exception:
        return []


def render_pdf_page_preview(
    nb: str,
    src: str,
    page_num: int = 1,
    *,
    highlight_text: str = "",
    scale: float = 1.5,
) -> dict[str, Any]:
    """Render a PDF page to PNG (with optional amber/cobalt highlight rectangles over cited phrases) via PyMuPDF."""
    import base64
    import hashlib

    pdf_path = store.get_source_pdf_path(nb, src)
    if pdf_path is None:
        return {"available": False, "reason": "No local PDF file stored for this source."}
    try:
        import fitz  # type: ignore
    except ImportError:
        return {"available": False, "reason": "Install `pymupdf` (`uv pip install pymupdf`) for visual PDF page previews."}

    clean_hl = re.sub(r"<!--\s*[pt]:\d+\s*-->", "", (highlight_text or "")).strip()
    clean_hl = re.sub(r"\s+", " ", clean_hl)[:360]
    cache_key = hashlib.sha256(f"{pdf_path.stat().st_mtime}:{page_num}:{clean_hl}:{scale:.2f}".encode("utf-8")).hexdigest()[:12]
    cache_dir = store.nb_dir(nb, must_exist=True) / "sources" / src / "previews"
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"p{max(1, int(page_num))}_{cache_key}.png"

    doc = fitz.open(str(pdf_path))
    try:
        total_pages = len(doc)
        if total_pages <= 0:
            return {"available": False, "reason": "PDF has zero pages."}
        clamped = max(1, min(total_pages, int(page_num)))
        if cache_file.is_file():
            raw = cache_file.read_bytes()
            return {
                "available": True,
                "page": clamped,
                "total_pages": total_pages,
                "highlighted": bool(clean_hl),
                "mime": "image/png",
                "bytes": len(raw),
                "b64": base64.b64encode(raw).decode("ascii"),
            }

        page = doc[clamped - 1]
        hit_count = 0
        if clean_hl:
            # Extract up to 4 crisp search needles (full sentence snippets + 4-6 word phrases) for reliable bbox hits
            needles: list[str] = []
            for seg in re.split(r"(?<=[.!?])\s+|\n+", clean_hl):
                seg = seg.strip(" \"'()[]{}-•*")
                if len(seg) >= 14:
                    words = seg.split()
                    if len(words) > 8:
                        needles.append(" ".join(words[:7]))
                        needles.append(" ".join(words[3:10]))
                    else:
                        needles.append(seg[:72])
                if len(needles) >= 4:
                    break
            if not needles and len(clean_hl) >= 4:
                needles.append(clean_hl[:64])

            seen_rects: list[Any] = []
            for needle in needles:
                try:
                    rects = page.search_for(needle)
                except Exception:
                    rects = []
                for r in rects[:6]:
                    seen_rects.append(r)
                    if len(seen_rects) >= 12:
                        break
                if len(seen_rects) >= 12:
                    break

            if seen_rects:
                shape = page.new_shape()
                for r in seen_rects:
                    padded = fitz.Rect(r.x0 - 2, r.y0 - 1.5, r.x1 + 2, r.y1 + 1.5)
                    shape.draw_rect(padded)
                shape.finish(color=(0.23, 0.51, 0.96), fill=(0.23, 0.51, 0.96), fill_opacity=0.24, width=1.1)
                shape.commit()
                hit_count = len(seen_rects)

        mat = fitz.Matrix(max(1.0, min(2.2, scale)), max(1.0, min(2.2, scale)))
        pix = page.get_pixmap(matrix=mat, alpha=False)
        raw = pix.tobytes("png")
        try:
            cache_file.write_bytes(raw)
        except OSError:
            pass
        return {
            "available": True,
            "page": clamped,
            "total_pages": total_pages,
            "highlighted": hit_count > 0,
            "highlight_rects": hit_count,
            "mime": "image/png",
            "bytes": len(raw),
            "b64": base64.b64encode(raw).decode("ascii"),
        }
    finally:
        doc.close()


def plan_research_queries(
    topic: str,
    *,
    num_queries: int = 4,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
) -> list[str]:
    """Expand a research topic into complementary web-search queries using Hermes LLM (with deterministic fallback)."""
    clean_topic = (topic or "").strip()
    if not clean_topic:
        raise ValueError("Research topic cannot be empty")
    n = max(2, min(6, int(num_queries)))

    fallback = [
        clean_topic,
        f"{clean_topic} architecture benchmarks empirical study",
        f"{clean_topic} limitations tradeoffs comparison",
        f"{clean_topic} documentation specification overview",
    ][:n]

    if not runtime.llm_available(ctx):
        return fallback

    schema = {
        "type": "object",
        "properties": {
            "queries": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 2,
                "maxItems": 6,
            }
        },
        "required": ["queries"],
    }
    try:
        parsed, _ = runtime.complete_json(
            instructions=(
                f"Generate {n} distinct, high-signal web search queries to thoroughly research this topic from complementary angles "
                "(primary documentation, quantitative benchmarks/studies, technical architecture, and critical tradeoffs/counterarguments). "
                "Keep each query concise (4-10 words) and search-engine ready."
            ),
            input_blocks=[{"type": "text", "text": f"Research topic: {clean_topic}"}],
            json_schema=schema,
            schema_name="sourcebook.research_plan",
            purpose="sourcebook.deep_research.plan",
            task="sourcebook_ingest",
            provider=provider,
            model=model,
            temperature=0.25,
            ctx=ctx,
        )
        qs = [str(q).strip() for q in (parsed.get("queries") or []) if isinstance(q, str) and q.strip()]
        deduped: list[str] = []
        seen: set[str] = set()
        for q in [clean_topic, *qs]:
            low = q.lower()
            if low not in seen:
                seen.add(low)
                deduped.append(q)
            if len(deduped) >= n:
                break
        return deduped if len(deduped) >= 2 else fallback
    except Exception:
        return fallback


def deep_research_ingest(
    nb: str,
    topic: str,
    *,
    depth: str = "standard",
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    """Multi-hop web discovery, URL deduplication, SSRF-checked extraction, and auto-ingestion into a notebook."""
    store.get_notebook(nb)
    clean_topic = (topic or "").strip()
    if not clean_topic:
        raise ValueError("Deep Research topic cannot be empty")

    depth_key = (depth or "standard").strip().lower()
    target_sources = {"quick": 5, "standard": 10, "deep": 15}.get(depth_key, 10)
    num_queries = {"quick": 3, "standard": 4, "deep": 5}.get(depth_key, 4)

    if progress:
        progress(f"Planning {num_queries} complementary research queries...", 10)
    queries = plan_research_queries(clean_topic, num_queries=num_queries, provider=provider, model=model, ctx=ctx)

    # Multi-query discovery & deduplication with cross-query frequency boost + domain diversity
    existing_origins = {str(s.get("origin") or "").strip().rstrip("/").lower() for s in store.list_sources(nb)}
    candidates: dict[str, dict[str, Any]] = {}
    for qi, q in enumerate(queries, start=1):
        if progress:
            pct = 14 + int(22 * (qi / max(1, len(queries))))
            progress(f"Searching ({qi}/{len(queries)}): {q[:60]}...", pct)
        try:
            hits = discover_web_sources(q, limit=8, ctx=ctx)
        except Exception:
            hits = []
        for rank, item in enumerate(hits):
            url = (item.get("url") or "").strip()
            canon = url.rstrip("/").lower()
            if not url or not _is_url_safe(url) or canon in existing_origins:
                continue
            rec = candidates.get(canon)
            if rec is None:
                candidates[canon] = {
                    **item,
                    "hits": 1,
                    "best_rank": rank,
                    "queries": [q],
                }
            else:
                rec["hits"] += 1
                rec["best_rank"] = min(rec["best_rank"], rank)
                if q not in rec["queries"]:
                    rec["queries"].append(q)

    # Rank candidates preferring multi-query corroboration + domain diversity
    ranked = sorted(candidates.values(), key=lambda c: (-c["hits"], c["best_rank"]))
    selected: list[dict[str, Any]] = []
    domain_counts: dict[str, int] = {}
    for cand in ranked:
        dom = cand.get("domain") or ""
        if domain_counts.get(dom, 0) >= 2 and len(ranked) > target_sources:
            continue
        domain_counts[dom] = domain_counts.get(dom, 0) + 1
        selected.append(cand)
        if len(selected) >= target_sources + 4:  # small buffer in case a URL fails to extract
            break

    ingested: list[dict[str, Any]] = []
    skipped: list[str] = []
    errors: list[str] = []
    for idx, item in enumerate(selected, start=1):
        if len(ingested) >= target_sources:
            break
        if progress:
            pct = 38 + int(44 * (len(ingested) / max(1, target_sources)))
            progress(f"Ingesting source {len(ingested) + 1}/{target_sources}: {item.get('domain') or item['url'][:48]}...", pct)
        try:
            src = ingest_url(nb, item["url"], title=item.get("title") or None, ctx=ctx)
            ingested.append({
                "id": src["id"],
                "title": src["title"],
                "url": item["url"],
                "domain": item.get("domain", ""),
                "word_count": src.get("word_count", 0),
                "chunk_count": src.get("chunk_count", 0),
            })
        except Exception as exc:
            errors.append(f"{item.get('domain') or item['url']}: {str(exc)[:110]}")
            skipped.append(item["url"])

    return {
        "topic": clean_topic,
        "depth": depth_key,
        "target_sources": target_sources,
        "queries": queries,
        "discovered_count": len(candidates),
        "ingested": ingested,
        "skipped": skipped,
        "errors": errors[:8],
    }
