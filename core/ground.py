"""Grounded prompt assembly, secret redaction, citation verification, Claim Ledger, and extractive synthesis."""

from __future__ import annotations

import html
import re
from typing import Any, Iterable, Optional

from . import runtime

CITE_RE = re.compile(r"\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]")
_WORD_RE = re.compile(r"[a-z0-9]{3,}")
_STOPWORDS = frozenset({
    "the", "and", "for", "that", "this", "with", "from", "have", "what", "when", "where",
    "which", "who", "why", "how", "are", "was", "were", "been", "being", "into", "about",
    "than", "then", "them", "they", "their", "there", "these", "those", "your", "you",
    "our", "its", "can", "could", "would", "should", "will", "not", "but", "all", "any",
    "some", "does", "did", "has", "had", "may", "might", "also", "such", "more", "most",
})

PERSONA_HINTS = {
    "default": "Be clear, direct, and analytical.",
    "tutor": "Teach step by step with intuition, analogies, and quick comprehension checks.",
    "critic": "Stress-test claims, point out missing evidence, assumptions, and contradictions across sources.",
    "analyst": "Synthesize structured takeaways, metrics, and decision implications concisely.",
    "socratic": "Guide understanding by explaining core concepts and posing 1 to 2 probing follow-up questions.",
}

LENGTH_HINTS = {
    "short": "Keep the answer tight (1 to 2 short paragraphs or a compact bullet list).",
    "standard": "Give a balanced, thorough answer without fluff.",
    "long": "Provide a deep, comprehensive synthesis covering edge cases and nuances.",
}

BASE_SYSTEM = """You are SourceBook, a strictly source-grounded research assistant.
Rules:
1. Answer ONLY using facts present inside the <sources> XML blocks below.
2. Cite EVERY factual sentence using [[c:<chunk_id>]] with exact chunk ids from the context (e.g. [[c:s_a1b2c3d4:0]]). Multiple citations are encouraged when synthesizing across chunks.
3. NEVER invent, guess, or alter chunk ids.
4. If the provided sources do not cover the user's question, state clearly: "This is not covered in your active sources." and suggest what source to add.
5. Format cleanly in Markdown."""


def build_system_prompt(persona: str = "default", length: str = "standard", *, strict: bool = False) -> str:
    extra = [
        PERSONA_HINTS.get(persona, PERSONA_HINTS["default"]),
        LENGTH_HINTS.get(length, LENGTH_HINTS["standard"]),
    ]
    if strict:
        extra.append("STRICT MODE: Do not extrapolate or infer anything not explicitly stated in the quoted chunks.")
    return BASE_SYSTEM + "\n\nStyle:\n- " + "\n- ".join(extra)


def pack(chunks: Iterable[dict[str, Any]], titles: dict[str, str], budget_chars: int = 60000) -> tuple[str, set[str]]:
    """Pack retrieved chunks into XML source blocks with secret redaction and strict budget."""
    out: list[str] = []
    allowed: set[str] = set()
    used = 0
    cur_src: Optional[str] = None

    for c in chunks:
        cid = str(c["id"])
        src_id = str(c["source_id"])
        page = c.get("page_start", c.get("page", 1))
        heading = html.escape(str(c.get("heading") or ""), quote=True)
        body = runtime.redact(str(c.get("text") or "").strip(), force=True)
        block = f'<chunk id="{cid}" page="{page}" heading="{heading}">\n{body}\n</chunk>'
        if used + len(block) > budget_chars and allowed:
            break
        if src_id != cur_src:
            if cur_src is not None:
                out.append("</source>")
            cur_src = src_id
            safe_title = html.escape(str(titles.get(src_id, src_id)), quote=True)
            out.append(f'<source id="{src_id}" title="{safe_title}">')
        out.append(block)
        allowed.add(cid)
        used += len(block)

    if cur_src is not None:
        out.append("</source>")
    return "\n".join(out), allowed


def _content_tokens(text: str) -> set[str]:
    return {t for t in _WORD_RE.findall(text.lower()) if t not in _STOPWORDS}


def _split_sentences(text: str) -> list[str]:
    clean = re.sub(r"\s+", " ", (text or "").strip())
    if not clean:
        return []
    parts = re.split(r"(?<=[.!?])\s+(?!\[\[c:)", clean)
    return [p.strip() for p in parts if len(p.strip()) >= 20]


def validate(answer: str, allowed_ids: set[str]) -> tuple[str, list[str], dict[str, Any]]:
    """Strip hallucinated chunk IDs and compute a sentence-level grounding score."""
    raw = answer or ""
    cited_all = CITE_RE.findall(raw)
    bad = sorted({c for c in cited_all if c not in allowed_ids})
    valid = sorted({c for c in cited_all if c in allowed_ids})
    clean = CITE_RE.sub(lambda m: m.group(0) if m.group(1) in allowed_ids else "", raw)
    clean = re.sub(r"[ \t]{2,}", " ", clean).strip()

    if "not covered in your active sources" in clean.lower():
        return clean, valid, {"score": 1.0, "dropped": bad, "refusal": True}

    lines = [ln.strip() for ln in clean.splitlines() if ln.strip() and not ln.strip().startswith("#")]
    factual: list[str] = []
    for ln in lines:
        for sent in re.split(r"(?<=[.!?])\s+(?!\[\[c:)", ln):
            if len(sent.strip()) >= 35:
                factual.append(sent)
    if not factual:
        score = 1.0 if (valid or not bad) else 0.0
    else:
        grounded = sum(1 for s in factual if CITE_RE.search(s))
        score = grounded / len(factual)
    return clean, valid, {"score": round(score, 2), "dropped": bad, "refusal": False}


def verify_claims(
    answer: str,
    chunks_by_id: dict[str, dict[str, Any]],
    titles: Optional[dict[str, str]] = None,
) -> list[dict[str, Any]]:
    """Build a Claim Ledger: verify each factual sentence against its cited source chunks."""
    titles = titles or {}
    claims: list[dict[str, Any]] = []
    lines = [ln.strip() for ln in (answer or "").splitlines() if ln.strip() and not ln.strip().startswith("#")]
    for ln in lines:
        ln_clean = re.sub(r"^[-*+]\s+", "", ln)
        for sent in re.split(r"(?<=[.!?])\s+(?!\[\[c:)", ln_clean):
            raw_sent = sent.strip()
            if len(raw_sent) < 28:
                continue
            cites = [c for c in CITE_RE.findall(raw_sent) if c in chunks_by_id]
            claim_text = CITE_RE.sub("", raw_sent).strip()
            claim_text = re.sub(r"\*\*([^*]+)\*\*", r"\1", claim_text)
            claim_text = re.sub(r"\s{2,}", " ", claim_text).strip(" -:")
            if len(claim_text) < 20:
                continue
            claim_toks = _content_tokens(claim_text)
            best_overlap = 0.0
            best_quote = ""
            best_chunk = cites[0] if cites else None
            best_source = ""
            for cid in cites:
                ch = chunks_by_id[cid]
                ch_text = str(ch.get("text") or "")
                ch_toks = _content_tokens(ch_text)
                if claim_toks:
                    overlap = len(claim_toks & ch_toks) / len(claim_toks)
                else:
                    overlap = 1.0
                if overlap >= best_overlap:
                    best_overlap = overlap
                    best_chunk = cid
                    best_source = titles.get(str(ch.get("source_id") or ""), str(ch.get("source_id") or ""))
                    best_s = ""
                    best_s_score = -1.0
                    for s in _split_sentences(ch_text):
                        s_clean = re.sub(r"^#+\s*", "", s).strip()
                        st = _content_tokens(s_clean)
                        sc = len(claim_toks & st) / max(1, len(claim_toks))
                        if sc > best_s_score:
                            best_s_score = sc
                            best_s = s_clean
                    best_quote = (best_s or re.sub(r"^#+\s*", "", ch_text)[:220]).strip()[:260]
            if not cites:
                verdict = "unsupported"
            elif best_overlap >= 0.35:
                verdict = "supported"
            else:
                verdict = "partial"
            claims.append(
                {
                    "text": claim_text,
                    "verdict": verdict,
                    "overlap": round(best_overlap, 2),
                    "citations": cites,
                    "chunk_id": best_chunk,
                    "source_title": best_source,
                    "quote": best_quote,
                }
            )
    return claims


def extractive_answer(
    query: str,
    chunks: list[dict[str, Any]],
    titles: dict[str, str],
    *,
    strict: bool = False,
) -> tuple[str, list[str], dict[str, Any]]:
    """Deterministic local synthesis over FTS5 chunks when no LLM provider is configured."""
    q_toks = _content_tokens(query)
    scored: list[tuple[float, str, str, str]] = []
    for ch in chunks:
        cid = str(ch["id"])
        src_title = titles.get(str(ch.get("source_id") or ""), str(ch.get("source_id") or ""))
        for sent in _split_sentences(str(ch.get("text") or "")):
            cleaned = re.sub(r"^#+\s*", "", sent).strip()
            if len(cleaned) < 28 or cleaned.startswith("|") or cleaned.startswith("<!--"):
                continue
            s_toks = _content_tokens(cleaned)
            overlap = len(q_toks & s_toks) if q_toks else 1
            score = (overlap * 3.0) + (0.4 if any(ch.isdigit() for ch in cleaned) else 0.0)
            scored.append((score, cid, src_title, cleaned))

    scored.sort(key=lambda x: x[0], reverse=True)
    picked: list[tuple[str, str, str]] = []
    seen_text: set[str] = set()
    for sc, cid, stitle, sent in scored:
        if strict and q_toks and sc < 1.0:
            continue
        key = sent[:80].lower()
        if key in seen_text:
            continue
        seen_text.add(key)
        picked.append((cid, stitle, sent))
        if len(picked) >= 5:
            break

    if not picked:
        msg = "This is not covered in your active sources. Try adding a source that addresses this topic."
        return msg, [], {"score": 1.0, "dropped": [], "refusal": True, "mode": "extractive"}

    lead_cid, _, lead_sent = picked[0]
    lines = [f"{lead_sent} [[c:{lead_cid}]]", ""]
    if len(picked) > 1:
        lines.append("### Supporting passages")
        lines.append("")
        for cid, stitle, sent in picked[1:]:
            lines.append(f"- **{stitle}**: {sent} [[c:{cid}]]")
    raw_ans = "\n".join(lines).strip()
    allowed = {str(c["id"]) for c in chunks}
    clean, cites, info = validate(raw_ans, allowed)
    info["mode"] = "extractive"
    return clean, cites, info
