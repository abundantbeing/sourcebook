"""Profile-safe notebook storage, SQLite WAL + FTS5 index, notes, chat, artifacts & bindings.

Zero third-party dependencies. Resolves `<HERMES_HOME>/plugin-data/sourcebook/` dynamically on every
call via `plugins.plugin_storage.plugin_data_dir("sourcebook")` so multi-profile gateways stay isolated.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import sqlite3
import time
import uuid
from contextlib import closing
from pathlib import Path
from typing import Any, Iterable, Optional

_ID_RE = re.compile(r"^[a-z]+_[a-f0-9]{6,32}$")
_CHUNK_ID_RE = re.compile(r"^[a-z]+_[a-f0-9]{6,32}:\d+$")
_TOKEN_RE = re.compile(r"[^\W_]{2,}", re.UNICODE)
_PAGE_MARKER_RE = re.compile(r"<!--\s*p:(\d+)\s*-->")

_STOPWORDS = frozenset({
    "the", "and", "for", "that", "this", "with", "from", "have", "what", "when", "where",
    "which", "who", "whom", "whose", "why", "how", "are", "was", "were", "been", "being",
    "into", "about", "than", "then", "them", "they", "their", "there", "these", "those",
    "your", "you", "our", "its", "can", "could", "would", "should", "will", "not", "but",
    "all", "any", "some", "does", "did", "has", "had", "may", "might",
})


# --- Profile-safe dynamic paths ---------------------------------------------

def data_root() -> Path:
    """Dynamic durable data directory (never cached across profile switches)."""
    override = os.environ.get("SOURCEBOOK_DATA_DIR")
    if override:
        root = Path(override)
        root.mkdir(parents=True, exist_ok=True)
        return root
    try:
        from plugins.plugin_storage import plugin_data_dir

        return plugin_data_dir("sourcebook")
    except Exception:
        base = Path(os.environ.get("HERMES_HOME", Path.home() / ".hermes")) / "plugin-data" / "sourcebook"
        base.mkdir(parents=True, exist_ok=True)
        return base


def notebooks_root() -> Path:
    root = data_root() / "notebooks"
    root.mkdir(parents=True, exist_ok=True)
    return root


def _mint_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _validate_id(value: str, prefix: Optional[str] = None) -> str:
    if not isinstance(value, str) or not _ID_RE.fullmatch(value):
        raise ValueError(f"invalid id: {value!r}")
    if prefix and not value.startswith(f"{prefix}_"):
        raise ValueError(f"expected {prefix}_* id, got {value!r}")
    return value


def _validate_chunk_id(cid: str) -> str:
    if not isinstance(cid, str) or not _CHUNK_ID_RE.fullmatch(cid):
        raise ValueError(f"invalid chunk id: {cid!r}")
    return cid


def _confined(base: Path, target: Path) -> Path:
    resolved = target.resolve()
    resolved.relative_to(base.resolve())
    return resolved


def nb_dir(nb: str, *, must_exist: bool = False) -> Path:
    _validate_id(nb, "nb")
    root = notebooks_root()
    path = _confined(root, root / nb)
    if must_exist and not (path / "notebook.json").is_file():
        raise FileNotFoundError(f"notebook {nb!r} not found")
    return path


def _write_json_atomic(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".{uuid.uuid4().hex[:6]}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def _read_json(path: Path, default: Any = None) -> Any:
    if not path.is_file():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except Exception:
        return default


# --- SQLite WAL + FTS5 ------------------------------------------------------

def _open_db(nb: str) -> sqlite3.Connection:
    d = nb_dir(nb, must_exist=True)
    con = sqlite3.connect(str(d / "index.sqlite"), timeout=10.0, check_same_thread=False)
    con.row_factory = sqlite3.Row
    try:
        con.execute("PRAGMA journal_mode=WAL")
    except sqlite3.DatabaseError:
        pass
    con.execute("PRAGMA synchronous=NORMAL")
    con.execute("PRAGMA foreign_keys=ON")
    con.execute("PRAGMA busy_timeout=5000")
    con.executescript(
        """
        CREATE TABLE IF NOT EXISTS chunks (
          id         TEXT PRIMARY KEY,
          source_id  TEXT NOT NULL,
          ord        INTEGER NOT NULL,
          heading    TEXT NOT NULL DEFAULT '',
          page_start INTEGER NOT NULL DEFAULT 1,
          page_end   INTEGER NOT NULL DEFAULT 1,
          char_start INTEGER NOT NULL DEFAULT 0,
          char_end   INTEGER NOT NULL DEFAULT 0,
          text       TEXT NOT NULL,
          tokens     INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source_id, ord);
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
          id UNINDEXED,
          source_id UNINDEXED,
          text,
          heading,
          tokenize='porter unicode61'
        );
        CREATE TABLE IF NOT EXISTS chunk_hits (
          chunk_id    TEXT PRIMARY KEY REFERENCES chunks(id) ON DELETE CASCADE,
          chat_hits   INTEGER NOT NULL DEFAULT 0,
          studio_hits INTEGER NOT NULL DEFAULT 0,
          last_hit    REAL NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS claims (
          id        TEXT PRIMARY KEY,
          chunk_id  TEXT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
          source_id TEXT NOT NULL,
          subject   TEXT NOT NULL,
          predicate TEXT NOT NULL,
          object    TEXT NOT NULL,
          polarity  INTEGER NOT NULL DEFAULT 1,
          date_ref  TEXT DEFAULT NULL,
          norm_key  TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_claims_norm ON claims(norm_key);
        """
    )
    return con


def build_fts_query(raw: str, max_terms: int = 16) -> Optional[str]:
    """Turn arbitrary user input into a crash-proof FTS5 MATCH query.

    Every token is double-quoted so SQLite FTS5 reserved keywords (`AND`, `OR`, `NOT`, `NEAR`)
    and operator characters (`:`, `-`, `*`, `^`, `"`, `()`, `+`) can never raise OperationalError.
    Returns None when no searchable terms exist.
    """
    if not raw or not isinstance(raw, str):
        return None
    tokens = _TOKEN_RE.findall(raw)
    if not tokens:
        return None
    non_stop = [t for t in tokens if t.lower() not in _STOPWORDS]
    chosen = non_stop or tokens
    seen: set[str] = set()
    quoted: list[str] = []
    for tok in chosen:
        low = tok.lower()
        if low in seen:
            continue
        seen.add(low)
        safe = tok.replace('"', "")
        if safe:
            quoted.append(f'"{safe}"')
        if len(quoted) >= max_terms:
            break
    return " OR ".join(quoted) if quoted else None


# --- Structure-aware chunker ------------------------------------------------

def _split_atomic_blocks(text: str) -> list[tuple[str, int, int]]:
    """Split Markdown into atomic blocks while keeping fenced code blocks and tables intact."""
    blocks: list[tuple[str, int, int]] = []
    lines = text.splitlines(keepends=True)
    buf: list[str] = []
    buf_start = 0
    pos = 0
    in_fence = False
    in_table = False

    def flush(end_pos: int) -> None:
        nonlocal buf
        chunk_text = "".join(buf)
        if chunk_text.strip():
            blocks.append((chunk_text, buf_start, end_pos))
        buf = []

    for line in lines:
        stripped = line.strip()
        is_fence_line = stripped.startswith("```") or stripped.startswith("~~~")
        is_table_line = stripped.startswith("|") and stripped.endswith("|") and len(stripped) >= 3

        if in_fence:
            buf.append(line)
            if is_fence_line:
                in_fence = False
                flush(pos + len(line))
            pos += len(line)
            continue

        if is_fence_line:
            if buf:
                flush(pos)
            buf_start = pos
            buf = [line]
            in_fence = True
            in_table = False
            pos += len(line)
            continue

        if is_table_line:
            if not in_table and buf:
                flush(pos)
                buf_start = pos
            elif not buf:
                buf_start = pos
            buf.append(line)
            in_table = True
            pos += len(line)
            continue

        if in_table and not is_table_line:
            flush(pos)
            in_table = False

        if not stripped:
            if buf:
                flush(pos)
            pos += len(line)
            continue

        if stripped.startswith("#"):
            if buf:
                flush(pos)
            buf_start = pos
            buf = [line]
            flush(pos + len(line))
            pos += len(line)
            continue

        if not buf:
            buf_start = pos
        buf.append(line)
        pos += len(line)

    if buf:
        flush(pos)
    return blocks


def chunk_text(text: str, target_chars: int = 3200, overlap_chars: int = 400) -> list[dict[str, Any]]:
    """Structure-aware chunker preserving headings, page markers, tables, code blocks, and offsets."""
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    blocks = _split_atomic_blocks(normalized)
    if not blocks:
        if normalized.strip():
            return [{
                "heading": "",
                "page_start": 1,
                "page_end": 1,
                "char_start": 0,
                "char_end": len(normalized),
                "text": normalized.strip(),
                "tokens": max(1, len(normalized) // 4),
            }]
        return []

    heading_stack: list[tuple[int, str]] = []
    cur_page = 1
    parts: list[dict[str, Any]] = []

    buf_blocks: list[tuple[str, int, int, int, str]] = []  # (text, cstart, cend, page, heading)
    buf_len = 0

    def emit_buf() -> None:
        nonlocal buf_blocks, buf_len
        if not buf_blocks:
            return
        combined = "\n\n".join(b[0].strip() for b in buf_blocks).strip()
        if not combined:
            buf_blocks = []
            buf_len = 0
            return
        parts.append({
            "heading": buf_blocks[-1][4] or buf_blocks[0][4],
            "page_start": min(b[3] for b in buf_blocks),
            "page_end": max(b[3] for b in buf_blocks),
            "char_start": buf_blocks[0][1],
            "char_end": buf_blocks[-1][2],
            "text": combined,
            "tokens": max(1, len(combined) // 4),
        })
        # Keep trailing overlap blocks up to overlap_chars
        kept: list[tuple[str, int, int, int, str]] = []
        kept_len = 0
        for item in reversed(buf_blocks):
            if kept_len + len(item[0]) > overlap_chars and kept:
                break
            kept.append(item)
            kept_len += len(item[0])
            if kept_len >= overlap_chars:
                break
        kept.reverse()
        buf_blocks = kept if len(kept) < len(buf_blocks) else []
        buf_len = sum(len(b[0]) for b in buf_blocks)

    for btext, cstart, cend in blocks:
        for m in _PAGE_MARKER_RE.finditer(btext):
            cur_page = int(m.group(1))
        stripped = btext.lstrip()
        if stripped.startswith("#"):
            hashes = len(stripped) - len(stripped.lstrip("#"))
            title = stripped[hashes:].strip()[:100]
            heading_stack = [(lvl, h) for lvl, h in heading_stack if lvl < hashes]
            if title:
                heading_stack.append((hashes, title))
        breadcrumb = " > ".join(h for _, h in heading_stack)

        # If a single huge paragraph exceeds 1.5x target, slice cleanly on newline/space
        if len(btext) > int(target_chars * 1.5) and not stripped.startswith(("```", "~~~", "|")):
            if buf_blocks:
                emit_buf()
            step = max(800, target_chars - overlap_chars)
            i = 0
            while i < len(btext):
                sl = btext[i : i + target_chars]
                if sl.strip():
                    parts.append({
                        "heading": breadcrumb,
                        "page_start": cur_page,
                        "page_end": cur_page,
                        "char_start": cstart + i,
                        "char_end": min(cend, cstart + i + len(sl)),
                        "text": sl.strip(),
                        "tokens": max(1, len(sl) // 4),
                    })
                i += step
            continue

        if buf_blocks and buf_len + len(btext) > target_chars:
            emit_buf()

        buf_blocks.append((btext, cstart, cend, cur_page, breadcrumb))
        buf_len += len(btext)

    if buf_blocks:
        combined = "\n\n".join(b[0].strip() for b in buf_blocks).strip()
        if combined and (not parts or parts[-1]["text"] != combined):
            parts.append({
                "heading": buf_blocks[-1][4] or buf_blocks[0][4],
                "page_start": min(b[3] for b in buf_blocks),
                "page_end": max(b[3] for b in buf_blocks),
                "char_start": buf_blocks[0][1],
                "char_end": buf_blocks[-1][2],
                "text": combined,
                "tokens": max(1, len(combined) // 4),
            })

    return parts


# --- Notebooks CRUD ---------------------------------------------------------

def _count_due_flashcards(d: Path) -> int:
    now = time.time()
    due = 0
    for art_file in (d / "artifacts").glob("*/artifact.json"):
        art = _read_json(art_file)
        if not art or art.get("kind") != "flashcards":
            continue
        state = _read_json(art_file.parent / "state.json", {}) or {}
        schedule = state.get("sm2") or {}
        for card in (art.get("spec") or {}).get("cards") or []:
            cid = card.get("id")
            rec = schedule.get(cid)
            if rec is None or float(rec.get("due_at", 0)) <= now:
                due += 1
    return due


def list_notebooks() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for d in sorted(notebooks_root().iterdir()):
        if not d.is_dir():
            continue
        meta = _read_json(d / "notebook.json")
        if not isinstance(meta, dict):
            continue
        meta["source_count"] = sum(1 for _ in (d / "sources").glob("*/meta.json"))
        meta["note_count"] = sum(1 for _ in (d / "notes").glob("*.json"))
        meta["artifact_count"] = sum(1 for _ in (d / "artifacts").glob("*/artifact.json"))
        meta["due_cards"] = _count_due_flashcards(d)
        out.append(meta)
    out.sort(key=lambda x: x.get("updated", x.get("created", 0)), reverse=True)
    return out


def get_notebook(nb: str) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    meta = _read_json(d / "notebook.json")
    if not isinstance(meta, dict):
        raise FileNotFoundError(f"notebook {nb!r} not found")
    meta["source_count"] = sum(1 for _ in (d / "sources").glob("*/meta.json"))
    meta["note_count"] = sum(1 for _ in (d / "notes").glob("*.json"))
    meta["artifact_count"] = sum(1 for _ in (d / "artifacts").glob("*/artifact.json"))
    meta["due_cards"] = _count_due_flashcards(d)
    return meta


def create_notebook(
    title: str,
    emoji: str = "",
    color: Optional[str] = None,
    icon: str = "book-open",
) -> dict[str, Any]:
    clean_title = (title or "").strip()
    if not clean_title:
        raise ValueError("notebook title cannot be empty")
    nb = _mint_id("nb")
    d = nb_dir(nb, must_exist=False)
    for sub in ("sources", "notes", "chat", "artifacts"):
        (d / sub).mkdir(parents=True, exist_ok=True)
    now = time.time()
    meta = {
        "id": nb,
        "title": clean_title[:160],
        "icon": (icon or "book-open")[:32],
        "emoji": (emoji or "")[:8],
        "color": color,
        "persona": "default",
        "length": "standard",
        "strict": False,
        "guide": None,
        "created": now,
        "updated": now,
    }
    _write_json_atomic(d / "notebook.json", meta)
    with closing(_open_db(nb)):
        pass
    return get_notebook(nb)


def update_notebook(nb: str, **patch: Any) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    meta = _read_json(d / "notebook.json")
    allowed = {"title", "icon", "emoji", "color", "persona", "length", "strict", "guide"}
    for k, v in patch.items():
        if k in allowed and v is not None:
            meta[k] = v.strip()[:160] if k == "title" and isinstance(v, str) else v
    meta["updated"] = time.time()
    _write_json_atomic(d / "notebook.json", meta)
    return get_notebook(nb)


def delete_notebook(nb: str) -> bool:
    d = nb_dir(nb, must_exist=False)
    if not d.exists():
        return False
    shutil.rmtree(d)
    # Clean any session bindings referencing this notebook
    bindings = _load_bindings()
    changed = False
    for sid in [k for k, v in bindings.items() if v.get("nb_id") == nb]:
        bindings.pop(sid, None)
        changed = True
    if changed:
        _save_bindings(bindings)
    return True


def _touch_notebook(nb: str) -> None:
    try:
        d = nb_dir(nb, must_exist=True)
        meta = _read_json(d / "notebook.json")
        if isinstance(meta, dict):
            meta["updated"] = time.time()
            _write_json_atomic(d / "notebook.json", meta)
    except Exception:
        pass


# --- Sources CRUD -----------------------------------------------------------

def list_sources(nb: str) -> list[dict[str, Any]]:
    d = nb_dir(nb, must_exist=True)
    out = []
    for p in sorted((d / "sources").glob("*/meta.json")):
        m = _read_json(p)
        if isinstance(m, dict):
            out.append(m)
    out.sort(key=lambda s: s.get("created", 0))
    return out


def get_source(nb: str, src: str) -> Optional[dict[str, Any]]:
    _validate_id(src, "s")
    d = nb_dir(nb, must_exist=True)
    return _read_json(_confined(d, d / "sources" / src / "meta.json"))


def get_source_text(nb: str, src: str) -> dict[str, Any]:
    meta = get_source(nb, src)
    if not meta:
        raise FileNotFoundError(f"source {src!r} not found")
    d = nb_dir(nb, must_exist=True)
    text_path = _confined(d, d / "sources" / src / "text.md")
    text = text_path.read_text(encoding="utf-8-sig") if text_path.is_file() else ""
    with closing(_open_db(nb)) as con:
        chunks = [
            dict(r)
            for r in con.execute(
                "SELECT id, ord, heading, page_start, page_end, char_start, char_end, text, tokens FROM chunks WHERE source_id=? ORDER BY ord",
                (src,),
            ).fetchall()
        ]
    return {"source": meta, "text": text, "chunks": chunks}


def add_source(
    nb: str,
    title: str,
    text: str,
    *,
    kind: str = "text",
    origin: Optional[str] = None,
    raw_bytes: Optional[bytes] = None,
    raw_ext: Optional[str] = None,
    chunk_chars: int = 3200,
    extra_meta: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    clean_text = (text or "").strip()
    if not clean_text:
        raise ValueError("source text is empty")
    digest = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()

    # Deduplicate identical content inside the same notebook
    for existing in list_sources(nb):
        if existing.get("sha256") == digest:
            return existing

    src = _mint_id("s")
    sdir = _confined(d, d / "sources" / src)
    sdir.mkdir(parents=True, exist_ok=True)
    (sdir / "text.md").write_text(clean_text, encoding="utf-8")
    if raw_bytes is not None and raw_ext:
        safe_ext = re.sub(r"[^a-zA-Z0-9]", "", raw_ext.lstrip("."))[:10]
        if safe_ext:
            (sdir / f"original.{safe_ext}").write_bytes(raw_bytes)

    parts = chunk_text(clean_text, target_chars=chunk_chars)
    now = time.time()
    meta: dict[str, Any] = {
        "id": src,
        "title": (title or origin or "Untitled source").strip()[:200],
        "kind": kind,
        "origin": origin,
        "enabled": True,
        "sha256": digest,
        "chars": len(clean_text),
        "word_count": len(clean_text.split()),
        "tokens": max(1, len(clean_text) // 4),
        "chunk_count": len(parts),
        "pages": max((p["page_end"] for p in parts), default=1),
        "summary": None,
        "topics": [],
        "status": "ready",
        "error": None,
        "created": now,
        "updated": now,
    }
    if extra_meta:
        meta.update(extra_meta)
    _write_json_atomic(sdir / "meta.json", meta)

    with closing(_open_db(nb)) as con:
        for i, p in enumerate(parts):
            cid = f"{src}:{i}"
            con.execute(
                "INSERT INTO chunks(id, source_id, ord, heading, page_start, page_end, char_start, char_end, text, tokens) "
                "VALUES(?,?,?,?,?,?,?,?,?,?)",
                (cid, src, i, p["heading"], p["page_start"], p["page_end"], p["char_start"], p["char_end"], p["text"], p["tokens"]),
            )
            con.execute(
                "INSERT INTO chunks_fts(id, source_id, text, heading) VALUES(?,?,?,?)",
                (cid, src, p["text"], p["heading"]),
            )
        con.commit()
    _touch_notebook(nb)
    return meta


def set_source(nb: str, src: str, **patch: Any) -> dict[str, Any]:
    _validate_id(src, "s")
    d = nb_dir(nb, must_exist=True)
    p = _confined(d, d / "sources" / src / "meta.json")
    meta = _read_json(p)
    if not isinstance(meta, dict):
        raise FileNotFoundError(f"source {src!r} not found")
    allowed = {"enabled", "title", "summary", "topics", "status", "error"}
    for k, v in patch.items():
        if k in allowed and v is not None:
            meta[k] = v.strip()[:200] if k == "title" and isinstance(v, str) else v
    meta["updated"] = time.time()
    _write_json_atomic(p, meta)
    _touch_notebook(nb)
    return meta


def delete_source(nb: str, src: str) -> bool:
    _validate_id(src, "s")
    d = nb_dir(nb, must_exist=True)
    sdir = _confined(d, d / "sources" / src)
    if not sdir.exists():
        return False
    shutil.rmtree(sdir)
    with closing(_open_db(nb)) as con:
        con.execute("DELETE FROM chunks_fts WHERE source_id=?", (src,))
        con.execute("DELETE FROM chunks WHERE source_id=?", (src,))
        con.commit()
    _touch_notebook(nb)
    return True


def source_hashes_map(nb: str, source_ids: Optional[Iterable[str]] = None) -> dict[str, str]:
    allowed = set(source_ids) if source_ids is not None else None
    return {
        s["id"]: s.get("sha256", "")
        for s in list_sources(nb)
        if allowed is None or s["id"] in allowed
    }


# --- Search, Chunks & Coverage Map ------------------------------------------

def search(
    nb: str,
    query: str,
    source_ids: Optional[Iterable[str]] = None,
    *,
    k: int = 12,
    per_source: int = 4,
) -> list[dict[str, Any]]:
    allowed = set(source_ids) if source_ids is not None else None
    fts_q = build_fts_query(query)
    with closing(_open_db(nb)) as con:
        out: list[dict[str, Any]] = []
        seen: dict[str, int] = {}
        if fts_q:
            try:
                rows = con.execute(
                    "SELECT id, source_id, bm25(chunks_fts) AS score "
                    "FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT 80",
                    (fts_q,),
                ).fetchall()
            except sqlite3.OperationalError:
                rows = []
            for r in rows:
                sid = r["source_id"]
                if allowed is not None and sid not in allowed:
                    continue
                if seen.get(sid, 0) >= per_source:
                    continue
                seen[sid] = seen.get(sid, 0) + 1
                row = con.execute("SELECT * FROM chunks WHERE id=?", (r["id"],)).fetchone()
                if row:
                    item = dict(row)
                    item["page"] = item["page_start"]
                    out.append(item)
                if len(out) >= k:
                    break
        # Graceful fallback when query has no searchable tokens or zero BM25 hits:
        # return leading chunks across enabled sources so the model can still inspect/refuse honestly.
        if not out:
            rows = con.execute("SELECT * FROM chunks ORDER BY ord, source_id LIMIT 80").fetchall()
            for row in rows:
                sid = row["source_id"]
                if allowed is not None and sid not in allowed:
                    continue
                if seen.get(sid, 0) >= per_source:
                    continue
                seen[sid] = seen.get(sid, 0) + 1
                item = dict(row)
                item["page"] = item["page_start"]
                out.append(item)
                if len(out) >= k:
                    break
        return out


def search_all_notebooks(query: str, limit: int = 20) -> list[dict[str, Any]]:
    fts_q = build_fts_query(query)
    if not fts_q:
        return []
    hits: list[dict[str, Any]] = []
    for nb_meta in list_notebooks():
        nb = nb_meta["id"]
        titles = {s["id"]: s["title"] for s in list_sources(nb)}
        with closing(_open_db(nb)) as con:
            try:
                rows = con.execute(
                    "SELECT id, source_id, bm25(chunks_fts) AS score "
                    "FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT 5",
                    (fts_q,),
                ).fetchall()
            except sqlite3.OperationalError:
                continue
            for r in rows:
                c = con.execute("SELECT id, source_id, heading, page_start, text FROM chunks WHERE id=?", (r["id"],)).fetchone()
                if c:
                    hits.append({
                        "notebook_id": nb,
                        "notebook_title": nb_meta["title"],
                        "notebook_icon": nb_meta.get("icon", "book-open"),
                        "source_id": c["source_id"],
                        "source_title": titles.get(c["source_id"], c["source_id"]),
                        "chunk_id": c["id"],
                        "heading": c["heading"],
                        "page": c["page_start"],
                        "snippet": c["text"][:220],
                        "score": float(r["score"]),
                    })
    hits.sort(key=lambda h: h["score"])
    return hits[:limit]


def all_chunks(nb: str, source_ids: Optional[Iterable[str]] = None) -> list[dict[str, Any]]:
    allowed = set(source_ids) if source_ids is not None else None
    with closing(_open_db(nb)) as con:
        rows = con.execute("SELECT * FROM chunks ORDER BY source_id, ord").fetchall()
        out = []
        for r in rows:
            if allowed is not None and r["source_id"] not in allowed:
                continue
            item = dict(r)
            item["page"] = item["page_start"]
            out.append(item)
        return out


def get_chunk(nb: str, cid: str) -> Optional[dict[str, Any]]:
    _validate_chunk_id(cid)
    with closing(_open_db(nb)) as con:
        row = con.execute("SELECT * FROM chunks WHERE id=?", (cid,)).fetchone()
        if not row:
            return None
        item = dict(row)
        item["page"] = item["page_start"]
        src = get_source(nb, item["source_id"])
        item["source_title"] = src["title"] if src else item["source_id"]
        return item


def record_chunk_hits(nb: str, chunk_ids: Iterable[str], *, surface: str = "chat") -> None:
    ids = [cid for cid in set(chunk_ids) if _CHUNK_ID_RE.fullmatch(cid)]
    if not ids:
        return
    col = "studio_hits" if surface == "studio" else "chat_hits"
    now = time.time()
    with closing(_open_db(nb)) as con:
        for cid in ids:
            con.execute(
                f"INSERT INTO chunk_hits(chunk_id, {col}, last_hit) VALUES(?, 1, ?) "
                f"ON CONFLICT(chunk_id) DO UPDATE SET {col} = {col} + 1, last_hit = excluded.last_hit",
                (cid, now),
            )
        con.commit()


def coverage_map(nb: str) -> dict[str, Any]:
    """Return per-source chunk hit heatmap + coldest unread chunks."""
    sources = list_sources(nb)
    with closing(_open_db(nb)) as con:
        rows = con.execute(
            "SELECT c.id, c.source_id, c.ord, c.heading, c.page_start, "
            "COALESCE(h.chat_hits, 0) AS chat_hits, COALESCE(h.studio_hits, 0) AS studio_hits "
            "FROM chunks c LEFT JOIN chunk_hits h ON h.chunk_id = c.id "
            "ORDER BY c.source_id, c.ord"
        ).fetchall()
    by_src: dict[str, list[dict[str, Any]]] = {}
    cold: list[dict[str, Any]] = []
    for r in rows:
        total_hits = int(r["chat_hits"]) + int(r["studio_hits"])
        entry = {"id": r["id"], "ord": r["ord"], "hits": total_hits, "heading": r["heading"], "page": r["page_start"]}
        by_src.setdefault(r["source_id"], []).append(entry)
        if total_hits == 0:
            cold.append({"source_id": r["source_id"], **entry})
    per_source = []
    for s in sources:
        chunks = by_src.get(s["id"], [])
        cited = sum(1 for c in chunks if c["hits"] > 0)
        ratio = round(cited / len(chunks), 2) if chunks else 0.0
        per_source.append({
            "source_id": s["id"],
            "title": s["title"],
            "total_chunks": len(chunks),
            "cited_chunks": cited,
            "touched_chunks": cited,
            "coverage": ratio,
            "strip": [min(3, c["hits"]) for c in chunks],
        })
    total_chunks = sum(item["total_chunks"] for item in per_source)
    touched_chunks = sum(item["cited_chunks"] for item in per_source)
    return {
        "total_chunks": total_chunks,
        "touched_chunks": touched_chunks,
        "coverage": round(touched_chunks / total_chunks, 2) if total_chunks else 0.0,
        "sources": per_source,
        "cold_chunks": cold[:10],
    }


# --- Notes CRUD + Living Notes Staleness + Promote to Source ----------------

def list_notes(nb: str) -> list[dict[str, Any]]:
    d = nb_dir(nb, must_exist=True)
    live_hashes = source_hashes_map(nb)
    out = []
    for p in sorted((d / "notes").glob("*.json")):
        n = _read_json(p)
        if not isinstance(n, dict):
            continue
        snap = n.get("source_hashes") or {}
        n["stale"] = any(live_hashes.get(sid) != h for sid, h in snap.items() if sid in live_hashes)
        out.append(n)
    out.sort(key=lambda n: (not bool(n.get("pinned")), -float(n.get("updated", n.get("created", 0)))))
    return out


def get_note(nb: str, note_id: str) -> Optional[dict[str, Any]]:
    _validate_id(note_id, "n")
    d = nb_dir(nb, must_exist=True)
    return _read_json(_confined(d, d / "notes" / f"{note_id}.json"))


def create_note(
    nb: str,
    title: str,
    markdown: str,
    *,
    pinned: bool = False,
    from_chat: bool = False,
    citations: Optional[list[str]] = None,
) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    nid = _mint_id("n")
    now = time.time()
    cites = list(citations or [])
    cited_src_ids = {c.split(":", 1)[0] for c in cites if ":" in c}
    note = {
        "id": nid,
        "title": (title or "Untitled note").strip()[:200],
        "markdown": markdown or "",
        "pinned": bool(pinned),
        "from_chat": bool(from_chat),
        "citations": cites,
        "source_hashes": source_hashes_map(nb, cited_src_ids) if cited_src_ids else {},
        "stale": False,
        "created": now,
        "updated": now,
    }
    _write_json_atomic(_confined(d, d / "notes" / f"{nid}.json"), note)
    _touch_notebook(nb)
    return note


def update_note(nb: str, note_id: str, **patch: Any) -> dict[str, Any]:
    _validate_id(note_id, "n")
    d = nb_dir(nb, must_exist=True)
    p = _confined(d, d / "notes" / f"{note_id}.json")
    note = _read_json(p)
    if not isinstance(note, dict):
        raise FileNotFoundError(f"note {note_id!r} not found")
    for k in ("title", "markdown", "pinned", "citations"):
        if k in patch and patch[k] is not None:
            note[k] = patch[k].strip()[:200] if k == "title" and isinstance(patch[k], str) else patch[k]
    note["updated"] = time.time()
    _write_json_atomic(p, note)
    _touch_notebook(nb)
    return note


def delete_note(nb: str, note_id: str) -> bool:
    _validate_id(note_id, "n")
    d = nb_dir(nb, must_exist=True)
    p = _confined(d, d / "notes" / f"{note_id}.json")
    if not p.is_file():
        return False
    p.unlink()
    _touch_notebook(nb)
    return True


def promote_note_to_source(nb: str, note_id: str) -> dict[str, Any]:
    note = get_note(nb, note_id)
    if not note:
        raise FileNotFoundError(f"note {note_id!r} not found")
    return add_source(nb, f"Note: {note['title']}", note["markdown"], kind="note", origin=f"note:{note_id}")


# --- Chat History -----------------------------------------------------------

def list_messages(nb: str, limit: int = 200) -> list[dict[str, Any]]:
    d = nb_dir(nb, must_exist=True)
    path = d / "chat" / "default.jsonl"
    if not path.is_file():
        return []
    out = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if not line.strip():
            continue
        try:
            out.append(json.loads(line))
        except Exception:
            continue
    return out[-limit:]


def append_message(
    nb: str,
    role: str,
    content: str,
    *,
    citations: Optional[list[str]] = None,
    grounding: Optional[dict[str, Any]] = None,
    claims: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    path = d / "chat" / "default.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    msg = {
        "id": _mint_id("m"),
        "role": role,
        "content": content,
        "citations": citations or [],
        "grounding": grounding,
        "claims": claims or [],
        "ts": time.time(),
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(msg, ensure_ascii=False) + "\n")
    _touch_notebook(nb)
    return msg


def list_verified_claims(nb: str, limit: int = 200) -> list[dict[str, Any]]:
    """Aggregate Claim Ledger entries from assistant replies in this notebook."""
    msgs = list_messages(nb, limit=limit)
    out: list[dict[str, Any]] = []
    for m in reversed(msgs):
        if m.get("role") != "assistant":
            continue
        for idx, cl in enumerate(m.get("claims") or []):
            if isinstance(cl, dict):
                out.append({**cl, "id": f"{m['id']}:{idx}", "message_id": m["id"], "ts": m.get("ts")})
    return out[:limit]


def clear_messages(nb: str) -> None:
    d = nb_dir(nb, must_exist=True)
    path = d / "chat" / "default.jsonl"
    if path.is_file():
        path.unlink()


# --- Artifacts CRUD + Mutable UI State (SM-2 / Quiz) ------------------------

def save_artifact(
    nb: str,
    kind: str,
    spec: dict[str, Any],
    params: Optional[dict[str, Any]] = None,
    *,
    source_ids: Optional[list[str]] = None,
    grounding: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    aid = _mint_id("a")
    adir = _confined(d, d / "artifacts" / aid)
    adir.mkdir(parents=True, exist_ok=True)
    title = spec.get("title") or spec.get("deck") or (params or {}).get("focus") or kind.title()
    art = {
        "id": aid,
        "kind": kind,
        "title": str(title)[:160],
        "params": params or {},
        "source_ids": source_ids or [],
        "source_hashes": source_hashes_map(nb, source_ids) if source_ids else {},
        "spec": spec,
        "grounding": grounding,
        "created": time.time(),
    }
    _write_json_atomic(adir / "artifact.json", art)
    _touch_notebook(nb)
    return art


def list_artifacts(nb: str) -> list[dict[str, Any]]:
    d = nb_dir(nb, must_exist=True)
    live_hashes = source_hashes_map(nb)
    out = []
    for p in sorted((d / "artifacts").glob("*/artifact.json")):
        a = _read_json(p)
        if not isinstance(a, dict):
            continue
        snap = a.get("source_hashes") or {}
        a["stale"] = any(live_hashes.get(sid) != h for sid, h in snap.items() if sid in live_hashes)
        a["state"] = _read_json(p.parent / "state.json", {}) or {}
        out.append(a)
    out.sort(key=lambda a: a.get("created", 0), reverse=True)
    return out


def get_artifact(nb: str, aid: str) -> Optional[dict[str, Any]]:
    _validate_id(aid, "a")
    d = nb_dir(nb, must_exist=True)
    adir = _confined(d, d / "artifacts" / aid)
    art = _read_json(adir / "artifact.json")
    if not isinstance(art, dict):
        return None
    art["state"] = _read_json(adir / "state.json", {}) or {}
    return art


def update_artifact_state(nb: str, aid: str, state_patch: dict[str, Any]) -> dict[str, Any]:
    _validate_id(aid, "a")
    d = nb_dir(nb, must_exist=True)
    adir = _confined(d, d / "artifacts" / aid)
    if not (adir / "artifact.json").is_file():
        raise FileNotFoundError(f"artifact {aid!r} not found")
    cur = _read_json(adir / "state.json", {}) or {}
    cur.update(state_patch)
    _write_json_atomic(adir / "state.json", cur)
    return cur


def delete_artifact(nb: str, aid: str) -> bool:
    _validate_id(aid, "a")
    d = nb_dir(nb, must_exist=True)
    adir = _confined(d, d / "artifacts" / aid)
    if not adir.exists():
        return False
    shutil.rmtree(adir)
    _touch_notebook(nb)
    return True


# --- Session Bindings (`/sourcebook use <nb_id>` + `pre_llm_call`) ---------------

def _bindings_path() -> Path:
    return data_root() / "session_bindings.json"


def _load_bindings() -> dict[str, dict[str, Any]]:
    data = _read_json(_bindings_path(), {})
    return data if isinstance(data, dict) else {}


def _save_bindings(bindings: dict[str, dict[str, Any]]) -> None:
    _write_json_atomic(_bindings_path(), bindings)


def bind_session(session_id: str, nb: str, *, strict: bool = False) -> dict[str, Any]:
    if not session_id:
        raise ValueError("session_id is required")
    nb_dir(nb, must_exist=True)
    bindings = _load_bindings()
    rec = {"nb_id": nb, "strict": bool(strict), "bound_at": time.time()}
    bindings[str(session_id)] = rec
    _save_bindings(bindings)
    return rec


def unbind_session(session_id: str) -> bool:
    if not session_id:
        return False
    bindings = _load_bindings()
    removed = bindings.pop(str(session_id), None) is not None
    if removed:
        _save_bindings(bindings)
    return removed


def get_session_binding(session_id: Optional[str]) -> Optional[dict[str, Any]]:
    if not session_id:
        return None
    rec = _load_bindings().get(str(session_id))
    if not isinstance(rec, dict):
        return None
    try:
        nb_dir(rec["nb_id"], must_exist=True)
        return rec
    except Exception:
        return None
