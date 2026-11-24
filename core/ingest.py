"""Multi-format source ingestion: TXT, Markdown, CSV, JSON, PDF, DOCX, HTML, URL, and Images."""

from __future__ import annotations

import csv
import io
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

from . import runtime, store

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MiB

_IMAGE_EXTS = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif"}
_TEXT_EXTS = {".txt", ".md", ".markdown", ".yaml", ".yml", ".py", ".ts", ".tsx", ".js", ".rst", ".tex"}


def sanitize_filename(name: str) -> str:
    base = Path(name or "upload.txt").name
    clean = re.sub(r"[^\w.\- ]+", "_", base).strip(" .")
    return clean[:140] or "upload.txt"


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


def extract_pdf_bytes(raw: bytes) -> tuple[str, dict[str, Any]]:
    try:
        import pypdf
    except ImportError as exc:
        raise RuntimeError(
            "PDF extraction requires pypdf. Install it in Hermes's environment (uv pip install pypdf) "
            "or upload Markdown, TXT, CSV, JSON, or DOCX."
        ) from exc
    reader = pypdf.PdfReader(io.BytesIO(raw))
    pages: list[str] = []
    empty_pages = 0
    for idx, page in enumerate(reader.pages, start=1):
        txt = (page.extract_text() or "").strip()
        if len(txt) < 40:
            empty_pages += 1
        pages.append(f"<!-- p:{idx} -->\n{txt}")
    full = "\n\n".join(pages).strip()
    needs_ocr = len(reader.pages) > 0 and empty_pages / len(reader.pages) > 0.7
    if not full or len(re.sub(r"<!--\s*p:\d+\s*-->", "", full).strip()) < 10:
        raise ValueError("This PDF appears to be scanned or image-only with no extractable text layer.")
    return full, {"pages": len(reader.pages), "needs_ocr": needs_ocr}


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
    """Caption and OCR an uploaded image via Hermes's vision-routed complete_structured."""
    llm = runtime.get_llm(ctx)
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
    res = llm.complete_structured(
        instructions=(
            "Analyze this image thoroughly for a research notebook. Transcribe ALL visible text, "
            "tables, numbers, labels, and diagram relationships accurately into extracted_text, "
            "and summarize the visual content in summary."
        ),
        input=[
            {"type": "text", "text": f"Filename: {filename}"},
            {"type": "image", "data": raw, "mime_type": mime_type},
        ],
        json_schema=schema,
        schema_name="folio.image_ingest",
        purpose="folio.ingest.image",
        temperature=0.0,
    )
    parsed = res.parsed if isinstance(res.parsed, dict) else {}
    summary = parsed.get("summary") or res.text or ""
    extracted = parsed.get("extracted_text") or ""
    details = parsed.get("key_details") or []
    parts = [f"# {parsed.get('title') or filename}", "", summary]
    if details:
        parts.append("\n## Key Visual Details\n" + "\n".join(f"- {d}" for d in details))
    if extracted:
        parts.append("\n## Extracted Text\n" + extracted)
    return "\n".join(parts).strip()


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


def extract_url(url: str, *, ctx: Any = None) -> tuple[str, str]:
    """Fetch clean Markdown via Hermes web_extract tool, falling back to SSRF-checked stdlib HTTP."""
    clean_url = (url or "").strip()
    if not _is_url_safe(clean_url):
        raise ValueError(f"URL is invalid or blocked by SSRF policy: {clean_url!r}")

    try:
        raw = runtime.dispatch_tool("web_extract", {"urls": [clean_url], "char_limit": 50000}, ctx=ctx)
        data = json.loads(raw) if isinstance(raw, str) else raw
        if isinstance(data, dict) and isinstance(data.get("results"), list) and data["results"]:
            first = data["results"][0]
            content = (first.get("content") or first.get("text") or first.get("markdown") or "").strip()
            title = (first.get("title") or "").strip()
            if content and not content.lower().startswith("blocked:"):
                return title or clean_url, content
    except Exception:
        pass

    req = urllib.request.Request(clean_url, headers={"User-Agent": "Hermes-Folio/0.1 (+https://github.com/abundantbeing/folio)"})
    with urllib.request.urlopen(req, timeout=15) as resp:  # noqa: S310 - validated above with is_safe_url
        ctype = (resp.headers.get("Content-Type") or "").lower()
        body = resp.read(MAX_UPLOAD_BYTES)
    if "application/pdf" in ctype or clean_url.lower().endswith(".pdf"):
        text, _ = extract_pdf_bytes(body)
        return Path(urlparse(clean_url).path).name or clean_url, text
    decoded = body.decode("utf-8", errors="replace")
    if "html" in ctype or "<html" in decoded[:512].lower():
        title, md = extract_html_to_markdown(decoded)
        if not md:
            raise ValueError("Extracted empty content from web page")
        return title or clean_url, md
    return clean_url, decoded


def ingest_bytes(
    nb: str,
    filename: str,
    raw: bytes,
    *,
    content_type: Optional[str] = None,
    ctx: Any = None,
) -> dict[str, Any]:
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError(f"File exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} MiB upload limit")
    safe_name = sanitize_filename(filename)
    ext = Path(safe_name).suffix.lower()
    chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)
    extra_meta: dict[str, Any] = {}

    if ext == ".pdf" or content_type == "application/pdf":
        text, extra_meta = extract_pdf_bytes(raw)
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
    elif ext in _TEXT_EXTS or (content_type and content_type.startswith("text/")):
        text = raw.decode("utf-8-sig", errors="replace")
        kind = "markdown" if ext in (".md", ".markdown") else "text"
    else:
        try:
            text = raw.decode("utf-8-sig")
            kind = "text"
        except UnicodeDecodeError as exc:
            raise ValueError(f"Unsupported binary file type: {ext or content_type or 'unknown'}") from exc

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
    extracted_title, text = extract_url(url, ctx=ctx)
    kind = "youtube" if any(h in url.lower() for h in ("youtube.com/", "youtu.be/")) else "url"
    return store.add_source(
        nb,
        title=(title or extracted_title or url).strip(),
        text=text,
        kind=kind,
        origin=url.strip(),
        chunk_chars=chunk_chars,
    )
