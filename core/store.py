"""Profile-safe notebook storage, SQLite WAL + FTS5 + hybrid semantic vector index, claims graph, notes, chat, artifacts & bindings.

Zero mandatory third-party dependencies. Resolves `<HERMES_HOME>/plugin-data/sourcebook/` dynamically
on every call via `plugins.plugin_storage.plugin_data_dir("sourcebook")` so multi-profile gateways stay isolated.
"""

from __future__ import annotations

import array
import hashlib
import json
import math
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
_TIME_MARKER_RE = re.compile(r"<!--\s*t:(\d+)\s*-->")
_METRIC_CLAIM_RE = re.compile(
    r"\b([A-Za-z][A-Za-z0-9 _/-]{2,42}?)\s+(?:is|are|was|were|reached|hit|measured|averages?|averaged|remains?|dropped to|rose to|takes?|costs?|uses?|requires?|:)\s+"
    r"(?:about|around|approximately|~|roughly|at least|up to|over|under)?\s*"
    r"(\$?\d+(?:[.,]\d+)?\s*(?:%|ms|s|sec|seconds|min|minutes|hours|x|GB|MB|KB|MiB|TB|k|M|B|px|req/s|rps|tok/s|tokens|USD|dollars)?)\b",
    re.IGNORECASE,
)
_POLARITY_CLAIM_RE = re.compile(
    r"\b([A-Za-z][A-Za-z0-9 _-]{3,36}?)\s+(does not|doesn't|cannot|can't|never|fails to|is not|isn't|supports|enables|requires|uses|provides|includes)\s+([A-Za-z0-9 _-]{3,48})",
    re.IGNORECASE,
)
_YEAR_RE = re.compile(r"\b(19\d{2}|20\d{2})\b")

_VEC_DIM = 192

_STOPWORDS = frozenset({
    "the", "and", "for", "that", "this", "with", "from", "have", "what", "when", "where",
    "which", "who", "whom", "whose", "why", "how", "are", "was", "were", "been", "being",
    "into", "about", "than", "then", "them", "they", "their", "there", "these", "those",
    "your", "you", "our", "its", "can", "could", "would", "should", "will", "not", "but",
    "all", "any", "some", "does", "did", "has", "had", "may", "might", "also", "very",
})

_SYN_GROUPS = [
    {"drop", "decline", "decrease", "fall", "contract", "reduce", "lower", "shrink", "dip"},
    {"rise", "increase", "grow", "expand", "climb", "surge", "gain", "boost", "higher"},
    {"fast", "quick", "rapid", "speed", "throughput", "latency", "delay", "performance"},
    {"cost", "price", "spend", "expense", "budget", "fee", "revenue", "margin", "booking"},
    {"error", "fail", "failure", "bug", "defect", "crash", "outage", "fault", "issue"},
    {"safe", "secure", "security", "protect", "guard", "privacy", "redact", "encrypt"},
    {"store", "storage", "persist", "save", "index", "database", "sqlite", "cache"},
    {"user", "customer", "client", "reader", "researcher", "operator"},
    {"model", "llm", "provider", "engine", "assistant", "agent"},
    {"verify", "verified", "confirm", "validate", "check", "audit", "ground", "cite", "citation"},
    {"source", "document", "file", "passage", "excerpt", "paper", "article", "report"},
    {"conflict", "contradict", "disagree", "differ", "mismatch", "inconsistent", "oppose"},
    {"auth", "authentication", "login", "credential", "token", "oauth", "permission"},
]
_SYN_MAP: dict[str, str] = {}
for _g in _SYN_GROUPS:
    _r = sorted(_g)[0]
    for _w in _g:
        _SYN_MAP[_w] = _r


def _stem_token(tok: str) -> str:
    w = tok.lower()
    if w in _SYN_MAP:
        return _SYN_MAP[w]
    for suf in ("ingly", "ation", "tion", "ment", "ness", "able", "ible", "ing", "ied", "ies", "ers", "ed", "es", "ly", "s"):
        if len(w) > len(suf) + 2 and w.endswith(suf):
            b = w[: -len(suf)]
            return _SYN_MAP.get(b, b)
    return w


def _hash_embed(text: str, dim: int = _VEC_DIM) -> bytes:
    """Zero-dependency local semantic vector combining stemmed canonical tokens, bigrams, and char 4-grams."""
    vec = [0.0] * dim
    raw_toks = [t.lower() for t in _TOKEN_RE.findall(text or "") if t.lower() not in _STOPWORDS]
    stems = [_stem_token(t) for t in raw_toks]

    def _add(feature: str, weight: float) -> None:
        h = hashlib.blake2b(feature.encode("utf-8", errors="ignore"), digest_size=4).digest()
        val = int.from_bytes(h, "little")
        idx = val % dim
        sign = 1.0 if (val & 1) else -1.0
        vec[idx] += sign * weight

    for st in stems[:400]:
        _add(f"w:{st}", 2.0)
        if len(st) >= 4:
            for i in range(len(st) - 3):
                _add(f"g:{st[i:i+4]}", 0.45)
    for i in range(min(250, max(0, len(stems) - 1))):
        _add(f"b:{stems[i]}_{stems[i+1]}", 1.2)

    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    arr = array.array("f", (v / norm for v in vec))
    return arr.tobytes()


def _dot_bytes(a_bytes: bytes, b_bytes: bytes) -> float:
    if not a_bytes or not b_bytes or len(a_bytes) != len(b_bytes):
        return 0.0
    a = array.array("f")
    b = array.array("f")
    a.frombytes(a_bytes)
    b.frombytes(b_bytes)
    return float(sum(x * y for x, y in zip(a, b)))


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


# --- SQLite WAL + FTS5 + Hybrid Vectors + Claims ----------------------------

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
        CREATE TABLE IF NOT EXISTS chunk_vectors (
          chunk_id  TEXT PRIMARY KEY REFERENCES chunks(id) ON DELETE CASCADE,
          source_id TEXT NOT NULL,
          dim       INTEGER NOT NULL DEFAULT 192,
          vec       BLOB NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_chunk_vectors_source ON chunk_vectors(source_id);
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
    """Turn arbitrary user input into a crash-proof FTS5 MATCH query."""
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
        chunk_text_str = "".join(buf)
        if chunk_text_str.strip():
            blocks.append((chunk_text_str, buf_start, end_pos))
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
    """Structure-aware chunker preserving headings, page/timestamp markers, tables, code blocks, and offsets."""
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

    buf_blocks: list[tuple[str, int, int, int, str]] = []
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


# --- Claim Extraction & Cross-Source Contradiction Engine -------------------

def _norm_subject_key(text: str) -> str:
    toks = [_stem_token(t) for t in _TOKEN_RE.findall(text or "") if t.lower() not in _STOPWORDS and len(t) >= 3]
    return " ".join(toks[:4])


def _extract_claims_for_chunk(cid: str, src_id: str, text: str) -> list[dict[str, Any]]:
    """Extract structured metric & polarity claims from a source chunk for cross-source contradiction detection."""
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for raw_line in (text or "").splitlines():
        line = raw_line.strip().lstrip("#-*+ ")
        if len(line) < 18 or line.startswith(("<!--", "```")):
            continue
        year_m = _YEAR_RE.search(line)
        date_ref = year_m.group(1) if year_m else None

        for m in _METRIC_CLAIM_RE.finditer(line):
            subj = m.group(1).strip(" ,.;:()-")
            val = re.sub(r"\s+", " ", m.group(2).strip())
            nk = _norm_subject_key(subj)
            if len(nk) < 3 or (nk, val.lower()) in seen:
                continue
            seen.add((nk, val.lower()))
            out.append({
                "id": f"cl_{uuid.uuid4().hex[:10]}",
                "chunk_id": cid,
                "source_id": src_id,
                "subject": subj[:80],
                "predicate": "metric",
                "object": val[:48],
                "polarity": 1,
                "date_ref": date_ref,
                "norm_key": f"m:{nk}",
            })
            if len(out) >= 10:
                return out

        for m in _POLARITY_CLAIM_RE.finditer(line):
            subj = m.group(1).strip(" ,.;:()-")
            verb = m.group(2).strip().lower()
            obj = m.group(3).strip(" ,.;:()-")
            pol = -1 if any(neg in verb for neg in ("not", "n't", "never", "fail")) else 1
            nk = f"{_norm_subject_key(subj)}|{_norm_subject_key(obj)}"
            if len(nk) < 7 or (nk, str(pol)) in seen:
                continue
            seen.add((nk, str(pol)))
            out.append({
                "id": f"cl_{uuid.uuid4().hex[:10]}",
                "chunk_id": cid,
                "source_id": src_id,
                "subject": subj[:80],
                "predicate": verb[:28],
                "object": obj[:80],
                "polarity": pol,
                "date_ref": date_ref,
                "norm_key": f"p:{nk}",
            })
            if len(out) >= 12:
                return out
    return out


def _index_source_rows(con: sqlite3.Connection, src_id: str, parts: list[dict[str, Any]]) -> None:
    for i, p in enumerate(parts):
        cid = f"{src_id}:{i}"
        con.execute(
            "INSERT INTO chunks(id, source_id, ord, heading, page_start, page_end, char_start, char_end, text, tokens) "
            "VALUES(?,?,?,?,?,?,?,?,?,?)",
            (cid, src_id, i, p["heading"], p["page_start"], p["page_end"], p["char_start"], p["char_end"], p["text"], p["tokens"]),
        )
        con.execute(
            "INSERT INTO chunks_fts(id, source_id, text, heading) VALUES(?,?,?,?)",
            (cid, src_id, p["text"], p["heading"]),
        )
        vec_blob = _hash_embed(f"{p['heading']}\n{p['text']}")
        con.execute(
            "INSERT OR REPLACE INTO chunk_vectors(chunk_id, source_id, dim, vec) VALUES(?,?,?,?)",
            (cid, src_id, _VEC_DIM, vec_blob),
        )
        for cl in _extract_claims_for_chunk(cid, src_id, p["text"]):
            con.execute(
                "INSERT INTO claims(id, chunk_id, source_id, subject, predicate, object, polarity, date_ref, norm_key) "
                "VALUES(?,?,?,?,?,?,?,?,?)",
                (cl["id"], cl["chunk_id"], cl["source_id"], cl["subject"], cl["predicate"], cl["object"], cl["polarity"], cl["date_ref"], cl["norm_key"]),
            )


def _ensure_vectors_and_claims(con: sqlite3.Connection) -> None:
    """Backfill chunk_vectors and claims automatically for older notebooks created prior to hybrid search."""
    missing_vecs = con.execute(
        "SELECT c.id, c.source_id, c.heading, c.text FROM chunks c "
        "LEFT JOIN chunk_vectors v ON v.chunk_id = c.id WHERE v.chunk_id IS NULL LIMIT 400"
    ).fetchall()
    if missing_vecs:
        for r in missing_vecs:
            con.execute(
                "INSERT OR REPLACE INTO chunk_vectors(chunk_id, source_id, dim, vec) VALUES(?,?,?,?)",
                (r["id"], r["source_id"], _VEC_DIM, _hash_embed(f"{r['heading']}\n{r['text']}")),
            )
        con.commit()

    has_chunks = con.execute("SELECT 1 FROM chunks LIMIT 1").fetchone()
    has_claims = con.execute("SELECT 1 FROM claims LIMIT 1").fetchone()
    if has_chunks and not has_claims:
        rows = con.execute("SELECT id, source_id, text FROM chunks").fetchall()
        for r in rows:
            for cl in _extract_claims_for_chunk(r["id"], r["source_id"], r["text"]):
                con.execute(
                    "INSERT INTO claims(id, chunk_id, source_id, subject, predicate, object, polarity, date_ref, norm_key) "
                    "VALUES(?,?,?,?,?,?,?,?,?)",
                    (cl["id"], cl["chunk_id"], cl["source_id"], cl["subject"], cl["predicate"], cl["object"], cl["polarity"], cl["date_ref"], cl["norm_key"]),
                )
        con.commit()


def find_contradictions(nb: str) -> dict[str, Any]:
    """Compare structured claims across distinct active sources to detect numeric/polarity conflicts & consensus."""
    sources = {s["id"]: s for s in list_sources(nb) if s.get("enabled")}
    if len(sources) < 2:
        return {"conflicts": [], "consensus": [], "total_claims": 0}

    with closing(_open_db(nb)) as con:
        _ensure_vectors_and_claims(con)
        rows = con.execute(
            "SELECT cl.*, c.text AS chunk_text FROM claims cl JOIN chunks c ON c.id = cl.chunk_id"
        ).fetchall()

    grouped: dict[str, list[dict[str, Any]]] = {}
    total_claims = 0
    for r in rows:
        sid = r["source_id"]
        if sid not in sources:
            continue
        total_claims += 1
        item = dict(r)
        item["source_title"] = sources[sid]["title"]
        grouped.setdefault(r["norm_key"], []).append(item)

    conflicts: list[dict[str, Any]] = []
    consensus: list[dict[str, Any]] = []

    for norm_key, items in grouped.items():
        by_src: dict[str, dict[str, Any]] = {}
        for it in items:
            by_src.setdefault(it["source_id"], it)
        if len(by_src) < 2:
            continue
        distinct = list(by_src.values())
        if norm_key.startswith("m:"):
            # Compare numeric metric values across sources
            vals = {(re.sub(r"\s+", "", d["object"].lower())): d for d in distinct}
            if len(vals) >= 2:
                pair = list(vals.values())[:2]
                conflicts.append({
                    "id": f"cf_{hashlib.md5(norm_key.encode()).hexdigest()[:8]}",
                    "kind": "numeric",
                    "topic": pair[0]["subject"],
                    "summary": f"{pair[0]['source_title']} states {pair[0]['object']}, whereas {pair[1]['source_title']} states {pair[1]['object']}.",
                    "side_a": {
                        "source_id": pair[0]["source_id"],
                        "source_title": pair[0]["source_title"],
                        "chunk_id": pair[0]["chunk_id"],
                        "value": pair[0]["object"],
                        "date_ref": pair[0]["date_ref"],
                        "excerpt": pair[0]["chunk_text"][:220],
                    },
                    "side_b": {
                        "source_id": pair[1]["source_id"],
                        "source_title": pair[1]["source_title"],
                        "chunk_id": pair[1]["chunk_id"],
                        "value": pair[1]["object"],
                        "date_ref": pair[1]["date_ref"],
                        "excerpt": pair[1]["chunk_text"][:220],
                    },
                })
            else:
                consensus.append({
                    "topic": distinct[0]["subject"],
                    "value": distinct[0]["object"],
                    "sources": [{"source_title": d["source_title"], "chunk_id": d["chunk_id"]} for d in distinct[:4]],
                })
        elif norm_key.startswith("p:"):
            pos = [d for d in distinct if int(d["polarity"]) > 0]
            neg = [d for d in distinct if int(d["polarity"]) < 0]
            if pos and neg:
                a, b = pos[0], neg[0]
                conflicts.append({
                    "id": f"cf_{hashlib.md5(norm_key.encode()).hexdigest()[:8]}",
                    "kind": "polarity",
                    "topic": a["subject"],
                    "summary": f"{a['source_title']} states '{a['subject']} {a['predicate']} {a['object']}', while {b['source_title']} states '{b['subject']} {b['predicate']} {b['object']}'.",
                    "side_a": {
                        "source_id": a["source_id"],
                        "source_title": a["source_title"],
                        "chunk_id": a["chunk_id"],
                        "value": f"{a['predicate']} {a['object']}",
                        "date_ref": a["date_ref"],
                        "excerpt": a["chunk_text"][:220],
                    },
                    "side_b": {
                        "source_id": b["source_id"],
                        "source_title": b["source_title"],
                        "chunk_id": b["chunk_id"],
                        "value": f"{b['predicate']} {b['object']}",
                        "date_ref": b["date_ref"],
                        "excerpt": b["chunk_text"][:220],
                    },
                })

    return {"conflicts": conflicts[:25], "consensus": consensus[:15], "total_claims": total_claims}


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
        meta.setdefault("model", "")
        meta.setdefault("provider", "")
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
    meta.setdefault("model", "")
    meta.setdefault("provider", "")
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
        "provider": "",
        "model": "",
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
    allowed = {"title", "icon", "emoji", "color", "persona", "length", "strict", "provider", "model", "guide"}
    for k, v in patch.items():
        if k in allowed and v is not None:
            if k == "title" and isinstance(v, str):
                meta[k] = v.strip()[:160]
            elif k in ("provider", "model") and isinstance(v, str):
                meta[k] = v.strip()[:160]
            else:
                meta[k] = v
    meta["updated"] = time.time()
    _write_json_atomic(d / "notebook.json", meta)
    return get_notebook(nb)


def delete_notebook(nb: str) -> bool:
    d = nb_dir(nb, must_exist=False)
    if not d.exists():
        return False
    shutil.rmtree(d)
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


# --- Sources CRUD + In-Place Refresh ----------------------------------------

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
    for c in chunks:
        m = _TIME_MARKER_RE.search(c.get("text") or "")
        if m:
            c["timestamp_sec"] = int(m.group(1))
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

    # If a linked local path or URL already exists in this notebook, refresh it in place if content changed
    origin_path = (extra_meta or {}).get("origin_path")
    for existing in list_sources(nb):
        if existing.get("sha256") == digest:
            return existing
        if origin_path and existing.get("origin_path") == origin_path:
            return refresh_source_content(
                nb, existing["id"], clean_text, title=title or existing.get("title"),
                raw_bytes=raw_bytes, raw_ext=raw_ext, chunk_chars=chunk_chars, extra_meta=extra_meta,
            )

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
        _index_source_rows(con, src, parts)
        con.commit()
    _touch_notebook(nb)
    return meta


def refresh_source_content(
    nb: str,
    src: str,
    text: str,
    *,
    title: Optional[str] = None,
    raw_bytes: Optional[bytes] = None,
    raw_ext: Optional[str] = None,
    chunk_chars: int = 3200,
    extra_meta: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Update a source's content & index in place, updating `sha256` so Living Notes & Artifacts detect staleness."""
    _validate_id(src, "s")
    d = nb_dir(nb, must_exist=True)
    sdir = _confined(d, d / "sources" / src)
    meta_path = sdir / "meta.json"
    meta = _read_json(meta_path)
    if not isinstance(meta, dict):
        raise FileNotFoundError(f"source {src!r} not found")
    clean_text = (text or "").strip()
    if not clean_text:
        raise ValueError("refreshed source text is empty")
    digest = hashlib.sha256(clean_text.encode("utf-8")).hexdigest()
    changed = digest != meta.get("sha256")
    (sdir / "text.md").write_text(clean_text, encoding="utf-8")
    if raw_bytes is not None and raw_ext:
        safe_ext = re.sub(r"[^a-zA-Z0-9]", "", raw_ext.lstrip("."))[:10]
        if safe_ext:
            (sdir / f"original.{safe_ext}").write_bytes(raw_bytes)

    parts = chunk_text(clean_text, target_chars=chunk_chars)
    now = time.time()
    if title:
        meta["title"] = title.strip()[:200]
    meta.update({
        "sha256": digest,
        "chars": len(clean_text),
        "word_count": len(clean_text.split()),
        "tokens": max(1, len(clean_text) // 4),
        "chunk_count": len(parts),
        "pages": max((p["page_end"] for p in parts), default=1),
        "status": "ready",
        "error": None,
        "updated": now,
        "last_synced": now,
    })
    if extra_meta:
        meta.update(extra_meta)
    _write_json_atomic(meta_path, meta)

    if changed:
        with closing(_open_db(nb)) as con:
            con.execute("DELETE FROM chunks_fts WHERE source_id=?", (src,))
            con.execute("DELETE FROM chunks WHERE source_id=?", (src,))
            _index_source_rows(con, src, parts)
            con.commit()
    _touch_notebook(nb)
    return {**meta, "changed": changed}


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


# --- Hybrid Semantic + BM25 RRF Search, Chunks & Coverage Map ---------------

def search(
    nb: str,
    query: str,
    source_ids: Optional[Iterable[str]] = None,
    *,
    k: int = 12,
    per_source: int = 4,
) -> list[dict[str, Any]]:
    """Hybrid search fusing SQLite FTS5 BM25 + local semantic vector similarity via Reciprocal Rank Fusion."""
    allowed = set(source_ids) if source_ids is not None else None
    fts_q = build_fts_query(query)
    q_vec = _hash_embed(query or "")
    q_stems = {_stem_token(t) for t in _TOKEN_RE.findall(query or "") if t.lower() not in _STOPWORDS}

    with closing(_open_db(nb)) as con:
        _ensure_vectors_and_claims(con)

        # 1. BM25 keyword ranks
        bm25_ranks: dict[str, int] = {}
        if fts_q:
            try:
                rows = con.execute(
                    "SELECT id, source_id, bm25(chunks_fts) AS score "
                    "FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT 80",
                    (fts_q,),
                ).fetchall()
            except sqlite3.OperationalError:
                rows = []
            rank = 1
            for r in rows:
                if allowed is not None and r["source_id"] not in allowed:
                    continue
                bm25_ranks[r["id"]] = rank
                rank += 1

        # 2. Semantic vector cosine ranks (handles paraphrases & synonyms missed by exact keywords)
        vec_scores: list[tuple[float, str]] = []
        if q_stems:
            vrows = con.execute("SELECT chunk_id, source_id, vec FROM chunk_vectors").fetchall()
            for vr in vrows:
                if allowed is not None and vr["source_id"] not in allowed:
                    continue
                sim = _dot_bytes(q_vec, vr["vec"])
                if sim > 0.08:
                    vec_scores.append((sim, vr["chunk_id"]))
            vec_scores.sort(key=lambda x: x[0], reverse=True)
        vec_ranks: dict[str, int] = {cid: idx + 1 for idx, (_, cid) in enumerate(vec_scores[:80])}

        # 3. Reciprocal Rank Fusion (RRF, k=40)
        rrf: dict[str, float] = {}
        for cid, r in bm25_ranks.items():
            rrf[cid] = rrf.get(cid, 0.0) + (1.0 / (40.0 + r))
        for cid, r in vec_ranks.items():
            rrf[cid] = rrf.get(cid, 0.0) + (0.85 / (40.0 + r))

        ranked_ids = [cid for cid, _ in sorted(rrf.items(), key=lambda kv: kv[1], reverse=True)]

        out: list[dict[str, Any]] = []
        seen: dict[str, int] = {}
        for cid in ranked_ids:
            row = con.execute("SELECT * FROM chunks WHERE id=?", (cid,)).fetchone()
            if not row:
                continue
            sid = row["source_id"]
            if allowed is not None and sid not in allowed:
                continue
            if seen.get(sid, 0) >= per_source:
                continue
            seen[sid] = seen.get(sid, 0) + 1
            item = dict(row)
            item["page"] = item["page_start"]
            item["rrf_score"] = round(rrf.get(cid, 0.0), 4)
            out.append(item)
            if len(out) >= k:
                break

        # Graceful fallback when query has no searchable tokens or zero hits
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
    if not (query or "").strip():
        return []
    hits: list[dict[str, Any]] = []
    for nb_meta in list_notebooks():
        nb = nb_meta["id"]
        titles = {s["id"]: s["title"] for s in list_sources(nb)}
        matched = search(nb, query, k=5, per_source=3)
        for idx, c in enumerate(matched):
            if not c.get("rrf_score"):
                continue
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
                "score": -float(c.get("rrf_score", 0.0)),
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
    if patch.get("resync_hashes"):
        cited_src_ids = {c.split(":", 1)[0] for c in (note.get("citations") or []) if ":" in c}
        note["source_hashes"] = source_hashes_map(nb, cited_src_ids) if cited_src_ids else {}
        note["stale"] = False
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


# --- Artifacts CRUD + Mutable UI State (SM-2 / Quiz) + Audio Files ----------

def artifact_dir(nb: str, aid: str) -> Path:
    _validate_id(aid, "a")
    d = nb_dir(nb, must_exist=True)
    return _confined(d, d / "artifacts" / aid)


def save_artifact(
    nb: str,
    kind: str,
    spec: dict[str, Any],
    params: Optional[dict[str, Any]] = None,
    *,
    source_ids: Optional[list[str]] = None,
    grounding: Optional[dict[str, Any]] = None,
    audio_bytes: Optional[bytes] = None,
    media_files: Optional[dict[str, bytes]] = None,
) -> dict[str, Any]:
    d = nb_dir(nb, must_exist=True)
    aid = _mint_id("a")
    adir = _confined(d, d / "artifacts" / aid)
    adir.mkdir(parents=True, exist_ok=True)
    has_audio = False
    if audio_bytes:
        (adir / "overview.mp3").write_bytes(audio_bytes)
        has_audio = True
    if media_files:
        mdir = adir / "media"
        mdir.mkdir(parents=True, exist_ok=True)
        for fname, raw in media_files.items():
            safe = Path(str(fname)).name
            if safe and raw:
                _confined(adir, mdir / safe).write_bytes(raw)
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
        "has_audio": has_audio,
        "created": time.time(),
    }
    _write_json_atomic(adir / "artifact.json", art)
    _touch_notebook(nb)
    return art


def update_artifact(
    nb: str,
    aid: str,
    *,
    title: Optional[str] = None,
    spec: Optional[dict[str, Any]] = None,
    params: Optional[dict[str, Any]] = None,
    source_ids: Optional[list[str]] = None,
    grounding: Optional[dict[str, Any]] = None,
    media_files: Optional[dict[str, bytes]] = None,
) -> dict[str, Any]:
    adir = artifact_dir(nb, aid)
    art = _read_json(adir / "artifact.json")
    if not isinstance(art, dict):
        raise FileNotFoundError(f"artifact {aid!r} not found")
    if title is not None:
        clean = str(title).strip()
        if not clean:
            raise ValueError("artifact title cannot be empty")
        art["title"] = clean[:160]
        if isinstance(art.get("spec"), dict) and "title" in art["spec"]:
            art["spec"]["title"] = clean[:160]
    if spec is not None:
        art["spec"] = spec
        if title is None and (spec.get("title") or spec.get("deck")):
            art["title"] = str(spec.get("title") or spec.get("deck"))[:160]
    if params is not None:
        art["params"] = params
    if source_ids is not None:
        art["source_ids"] = source_ids
        art["source_hashes"] = source_hashes_map(nb, source_ids) if source_ids else {}
    if grounding is not None:
        art["grounding"] = grounding
    if media_files:
        mdir = adir / "media"
        mdir.mkdir(parents=True, exist_ok=True)
        for fname, raw in media_files.items():
            safe = Path(str(fname)).name
            if safe and raw:
                _confined(adir, mdir / safe).write_bytes(raw)
    art["updated"] = time.time()
    _write_json_atomic(adir / "artifact.json", art)
    _touch_notebook(nb)
    return get_artifact(nb, aid) or art


def get_artifact_media_dir(nb: str, aid: str) -> Path:
    adir = artifact_dir(nb, aid)
    return _confined(adir, adir / "media")


def get_artifact_media_path(nb: str, aid: str, fname: str) -> Optional[Path]:
    adir = artifact_dir(nb, aid)
    safe = Path(str(fname)).name
    if not safe:
        return None
    p = _confined(adir, adir / "media" / safe)
    return p if p.is_file() else None


def get_artifact_audio_path(nb: str, aid: str) -> Optional[Path]:
    adir = artifact_dir(nb, aid)
    p = adir / "overview.mp3"
    return p if p.is_file() else None


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
        a["has_audio"] = bool(a.get("has_audio") or (p.parent / "overview.mp3").is_file())
        out.append(a)
    out.sort(key=lambda a: a.get("created", 0), reverse=True)
    return out


def get_artifact(nb: str, aid: str) -> Optional[dict[str, Any]]:
    adir = artifact_dir(nb, aid)
    art = _read_json(adir / "artifact.json")
    if not isinstance(art, dict):
        return None
    live_hashes = source_hashes_map(nb)
    snap = art.get("source_hashes") or {}
    art["stale"] = any(live_hashes.get(sid) != h for sid, h in snap.items() if sid in live_hashes)
    art["state"] = _read_json(adir / "state.json", {}) or {}
    art["has_audio"] = bool(art.get("has_audio") or (adir / "overview.mp3").is_file())
    return art


def update_artifact_state(nb: str, aid: str, state_patch: dict[str, Any]) -> dict[str, Any]:
    adir = artifact_dir(nb, aid)
    if not (adir / "artifact.json").is_file():
        raise FileNotFoundError(f"artifact {aid!r} not found")
    cur = _read_json(adir / "state.json", {}) or {}
    cur.update(state_patch)
    _write_json_atomic(adir / "state.json", cur)
    return cur


def delete_artifact(nb: str, aid: str) -> bool:
    adir = artifact_dir(nb, aid)
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
