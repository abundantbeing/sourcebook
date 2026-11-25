"""Grounded prompt assembly, secret redaction, citation verification, semantic Claim Ledger, and extractive synthesis."""

from __future__ import annotations

import html
import re
from typing import Any, Iterable, Optional

from . import runtime

CITE_RE = re.compile(r"\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]")
_WORD_RE = re.compile(r"[a-z0-9]{2,}")
_NUM_RE = re.compile(r"\b\d+(?:[.,]\d+)?%?\b")

_STOPWORDS = frozenset({
    "the", "and", "for", "that", "this", "with", "from", "have", "what", "when", "where",
    "which", "who", "why", "how", "are", "was", "were", "been", "being", "into", "about",
    "than", "then", "them", "they", "their", "there", "these", "those", "your", "you",
    "our", "its", "can", "could", "would", "should", "will", "not", "but", "all", "any",
    "some", "does", "did", "has", "had", "may", "might", "also", "such", "more", "most",
    "very", "only", "just", "over", "each", "both", "between", "through", "while", "using",
})

# Lightweight domain-agnostic synonym groups so paraphrased LLM answers verify cleanly
_SYNONYM_GROUPS = [
    {"drop", "decline", "decrease", "fall", "contract", "reduce", "lower", "shrink", "dip"},
    {"rise", "increase", "grow", "expand", "climb", "surge", "gain", "boost", "higher"},
    {"fast", "quick", "rapid", "low-latency", "speed", "throughput", "latency", "delay"},
    {"cost", "price", "spend", "expense", "budget", "fee", "revenue", "margin", "booking"},
    {"error", "fail", "failure", "bug", "defect", "crash", "outage", "fault", "issue"},
    {"safe", "secure", "security", "protect", "guard", "privacy", "redact", "encrypt"},
    {"store", "storage", "persist", "save", "index", "database", "sqlite", "cache"},
    {"user", "customer", "client", "reader", "researcher", "operator"},
    {"model", "llm", "provider", "engine", "assistant", "agent"},
    {"verify", "verified", "confirm", "validate", "check", "audit", "ground", "cite", "citation"},
    {"source", "document", "file", "passage", "excerpt", "paper", "article", "report"},
    {"conflict", "contradict", "disagree", "differ", "mismatch", "inconsistent", "oppose"},
]
_CANON_MAP: dict[str, str] = {}
for _grp in _SYNONYM_GROUPS:
    _rep = sorted(_grp)[0]
    for _w in _grp:
        _CANON_MAP[_w] = _rep

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
5. Format cleanly in Markdown (headings, bullet lists, tables, and fenced code blocks when helpful)."""


def _stem(word: str) -> str:
    w = word.lower()
    if w in _CANON_MAP:
        return _CANON_MAP[w]
    for suf in ("ingly", "edly", "ation", "tion", "ment", "ness", "able", "ible", "less", "ing", "ied", "ies", "ers", "ed", "es", "ly", "s"):
        if len(w) > len(suf) + 2 and w.endswith(suf):
            base = w[: -len(suf)]
            if base in _CANON_MAP:
                return _CANON_MAP[base]
            return base
    return w


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
    return {_stem(t) for t in _WORD_RE.findall(text.lower()) if t not in _STOPWORDS and len(t) >= 3}


def _bigrams(text: str) -> set[tuple[str, str]]:
    toks = [_stem(t) for t in _WORD_RE.findall(text.lower()) if t not in _STOPWORDS and len(t) >= 3]
    return {(toks[i], toks[i + 1]) for i in range(len(toks) - 1)}


def _extract_numbers(text: str) -> set[str]:
    return {m.group(0).replace(",", "") for m in _NUM_RE.finditer(text or "")}


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

    lines = [ln.strip() for ln in clean.splitlines() if ln.strip() and not ln.strip().startswith(("#", "```", "|---"))]
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
    """Build a Claim Ledger using stemmed semantic-token + bigram + numeric-fact alignment.

    Handles paraphrased LLM prose accurately while explicitly flagging fabricated numbers.
    """
    titles = titles or {}
    claims: list[dict[str, Any]] = []
    in_code = False
    for raw_ln in (answer or "").splitlines():
        ln = raw_ln.strip()
        if ln.startswith("```"):
            in_code = not in_code
            continue
        if in_code or not ln or ln.startswith("#") or ln.startswith("|---"):
            continue
        ln_clean = re.sub(r"^(?:[-*+]|\d+\.)\s+", "", ln)
        for sent in re.split(r"(?<=[.!?])\s+(?!\[\[c:)", ln_clean):
            raw_sent = sent.strip()
            if len(raw_sent) < 28:
                continue
            cites = [c for c in CITE_RE.findall(raw_sent) if c in chunks_by_id]
            claim_text = CITE_RE.sub("", raw_sent).strip()
            claim_text = re.sub(r"\*\*([^*]+)\*\*", r"\1", claim_text)
            claim_text = re.sub(r"`([^`]+)`", r"\1", claim_text)
            claim_text = re.sub(r"\s{2,}", " ", claim_text).strip(" -:")
            if len(claim_text) < 20:
                continue

            claim_toks = _content_tokens(claim_text)
            claim_bi = _bigrams(claim_text)
            claim_nums = _extract_numbers(claim_text)

            best_score = 0.0
            best_quote = ""
            best_chunk = cites[0] if cites else None
            best_source = ""
            numeric_mismatch = False

            # Aggregate all cited chunks for multi-citation synthesis sentences
            combined_nums: set[str] = set()
            combined_toks: set[str] = set()
            for cid in cites:
                ch = chunks_by_id[cid]
                ch_text = str(ch.get("text") or "")
                ch_toks = _content_tokens(ch_text)
                ch_bi = _bigrams(ch_text)
                ch_nums = _extract_numbers(ch_text)
                combined_nums |= ch_nums
                combined_toks |= ch_toks

                tok_overlap = (len(claim_toks & ch_toks) / len(claim_toks)) if claim_toks else 1.0
                bi_bonus = (0.18 * len(claim_bi & ch_bi) / max(1, len(claim_bi))) if claim_bi else 0.0
                num_score = 1.0
                if claim_nums:
                    matched_nums = sum(1 for n in claim_nums if n in ch_nums or n.rstrip("%") in ch_nums)
                    num_score = matched_nums / len(claim_nums)
                score = min(1.0, tok_overlap * 0.85 + bi_bonus + (0.15 * num_score if claim_nums else 0.0))

                if score >= best_score:
                    best_score = score
                    best_chunk = cid
                    best_source = titles.get(str(ch.get("source_id") or ""), str(ch.get("source_id") or ""))
                    best_s = ""
                    best_s_score = -1.0
                    for s in _split_sentences(ch_text):
                        s_clean = re.sub(r"^#+\s*", "", s).strip()
                        st = _content_tokens(s_clean)
                        sn = _extract_numbers(s_clean)
                        sc = len(claim_toks & st) / max(1, len(claim_toks))
                        if claim_nums and (claim_nums & sn):
                            sc += 0.25
                        if sc > best_s_score:
                            best_s_score = sc
                            best_s = s_clean
                    best_quote = (best_s or re.sub(r"^#+\s*", "", ch_text)[:220]).strip()[:260]

            # Multi-citation combined score for sentences synthesizing across 2+ chunks
            if len(cites) > 1 and claim_toks:
                synth_overlap = len(claim_toks & combined_toks) / len(claim_toks)
                best_score = max(best_score, min(1.0, synth_overlap))

            if cites and claim_nums:
                missing_nums = [n for n in claim_nums if n not in combined_nums and n.rstrip("%") not in combined_nums]
                if missing_nums and len(missing_nums) == len(claim_nums):
                    numeric_mismatch = True

            if not cites:
                verdict = "unsupported"
            elif numeric_mismatch:
                verdict = "partial"
                best_score = min(best_score, 0.45)
            elif best_score >= 0.30:
                verdict = "supported"
            else:
                verdict = "partial"

            claims.append(
                {
                    "text": claim_text,
                    "verdict": verdict,
                    "overlap": round(best_score, 2),
                    "numeric_mismatch": numeric_mismatch,
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
    """Deterministic local synthesis over hybrid chunks when no LLM provider is configured."""
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
