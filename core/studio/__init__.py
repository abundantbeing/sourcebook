"""Studio generators (8 formats including 2-Host Audio Overview), universal LLM JSON compatibility, citation verification, extractive fallback, and offline exporters."""

from __future__ import annotations

import csv
import html as html_lib
import io
import json
import re
from pathlib import Path
from typing import Any, Callable, Optional

from .. import ground, runtime
from .registry import StudioGenerator, get_generator, list_generators, register_generator

SCHEMAS_DIR = Path(__file__).parent.parent / "schemas"
_CHUNK_BLOCK_RE = re.compile(
    r'<chunk\s+id="([^"]+)"\s+page="([^"]*)"\s+heading="([^"]*)">\s*(.*?)\s*</chunk>',
    re.DOTALL,
)
_SOURCE_OPEN_RE = re.compile(r'<source\s+id="([^"]+)"\s+title="([^"]*)">')

SHARED_RULES = (
    "\nRules:\n"
    "- Use ONLY facts present in the provided <sources> chunks.\n"
    "- Include exact supporting chunk ids (e.g. 's_abc123:0') in cites on every factual item.\n"
    "- Never invent chunk ids.\n"
    "- Audience: {audience}. Length: {length}. Language: {language}. Focus: {focus}.\n"
    "- If the sources cannot support this request, still follow the schema and clearly note what is missing."
)

_BUILTINS = [
    StudioGenerator(
        kind="report",
        label="Study Guide",
        description="Structured Markdown report (Briefing, Study Guide, FAQ, Timeline, Blog, Exec Memo) with inline citations.",
        instructions=(
            "Write a thorough {template} report in Markdown using headings, concise prose, tables or code blocks when helpful, and bullet takeaways. "
            "Cite every factual sentence inline with [[c:<chunk_id>]]."
        ),
        schema_file=None,
    ),
    StudioGenerator(
        kind="audio",
        label="Audio Overview",
        description="Two-host spoken podcast discussion (Alex & Maya) with neural audio synthesis and synchronized cited transcript.",
        instructions=(
            "Write a crisp, engaging two-host spoken podcast script between 'Alex' (analytical host) and 'Maya' (curious questioner) "
            "in the '{style}' style (deep_dive | debate | brief | critique). Produce {count} to 14 natural conversational turns "
            "(2 to 3 spoken sentences per turn, no markdown formatting or stage directions). Every turn must cite supporting chunk ids in cites."
        ),
        schema_file="audio.json",
    ),
    StudioGenerator(
        kind="mindmap",
        label="Mind Map",
        description="Interactive hierarchical concept map (depth <= 4, <= 60 nodes) with summaries and citations.",
        instructions=(
            "Build a clear hierarchical mind map: depth <= 4, <= 7 children per node, <= 60 total nodes, "
            "concise node labels (<= 5 words), 1 to 2 sentence summary per node, and supporting cites."
        ),
        schema_file="mindmap.json",
    ),
    StudioGenerator(
        kind="flashcards",
        label="Flashcards",
        description="Spaced-repetition study deck (SM-2) with unique fronts, hints, and source citations.",
        instructions=(
            "Create {count} high-retention flashcards testing concrete facts, definitions, and relationships. "
            "Every front must be unique and unambiguous; every card must include cites."
        ),
        schema_file="flashcards.json",
    ),
    StudioGenerator(
        kind="quiz",
        label="Quiz",
        description="Mixed multiple-choice, true/false, and short-answer quiz with cited explanations.",
        instructions=(
            "Create a {count}-question quiz mixing 'mcq', 'tf', and 'short' questions. "
            "For 'mcq', provide 4 distinct options and set answer to the 0-based index or exact option text. "
            "Include clear cited explanations for every question."
        ),
        schema_file="quiz.json",
    ),
    StudioGenerator(
        kind="table",
        label="Data Table",
        description="Structured comparison matrix with typed sortable columns and per-row citations.",
        instructions=(
            "Build a comparison data table answering: {focus}. "
            "Pick clean typed columns ('text'|'number'|'date'|'url'). Every row must populate cells and include cites."
        ),
        schema_file="table.json",
    ),
    StudioGenerator(
        kind="infographic",
        label="Infographic",
        description="Multi-layout vector infographic (stat-grid, timeline, process, comparison, hub-spoke, pyramid).",
        instructions=(
            "Design a crisp infographic layout specification. Pick the best layout from "
            "stat-grid | timeline | process | comparison | hub-spoke | pyramid. "
            "Keep headings short (<= 6 words) and bodies concise (1 to 2 sentences). Include value for key metrics or dates. "
            "Every block must include cites."
        ),
        schema_file="infographic.json",
    ),
    StudioGenerator(
        kind="slides",
        label="Slide Deck",
        description="Multi-layout 16:9 presentation with Hermes ImageGen, outline review, speaker notes, presenter mode, and native PPTX/PDF/HTML export.",
        instructions=(
            "Create a {count}-slide presentation deck in {language} starting with a 'title' slide and ending with a 'closing' slide.\n"
            "Deck Format: {deck_format_desc}\n"
            "Deck Purpose & Narrative Arc: {deck_purpose_desc}\n"
            "Theme: {theme}\n"
            "Custom User Direction / Prompt: {user_prompt}\n"
            "{outline_directive}\n"
            "{revision_directive}\n"
            "PRESENTATION DESIGN CRAFT RULES (MANDATORY):\n"
            "1. ACTION TITLES: Every content slide title MUST be a crisp complete-sentence insight or claim (never a vague label like 'Overview' or 'Performance').\n"
            "2. ONE IDEA PER SLIDE: Focus every slide on one memorable point with generous whitespace.\n"
            "3. STRICT LAYOUT DIVERSITY: Never use the exact same layout on two consecutive slides. Rotate intentionally across: "
            "'title', 'stat' (single hero metric + 2-3 takeaways), 'bento' (3-4 modular pillar bullets), "
            "'comparison' (2 side-by-side 'columns' objects with 'heading' and 'points'), "
            "'timeline' (3-4 sequential 'steps' objects with 'label' and 'detail'), 'two-col', 'quote', 'image-left', 'image-full', and 'closing'.\n"
            "4. VISUAL BIBLE & IMAGE DIRECTION: Write a cohesive 'visual_bible' string describing the deck's unified palette, lighting, and graphic aesthetic. "
            "{image_directive}\n"
            "5. SPEAKER NOTES & CITATIONS: Write natural presenter speaker notes on every slide and cite ONLY valid source chunk IDs in 'cites'."
        ),
        schema_file="slides.json",
    ),
]

for _g in _BUILTINS:
    register_generator(_g)


def _filter_spec_cites(obj: Any, allowed_ids: set[str], valid_out: set[str], dropped_out: set[str]) -> Any:
    """Recursively verify every cites array inside a structured Studio spec."""
    if isinstance(obj, dict):
        out: dict[str, Any] = {}
        for k, v in obj.items():
            if k == "cites" and isinstance(v, list):
                kept = []
                for cid in v:
                    s = str(cid).strip()
                    if s in allowed_ids:
                        kept.append(s)
                        valid_out.add(s)
                    elif s:
                        dropped_out.add(s)
                out[k] = kept
            else:
                out[k] = _filter_spec_cites(v, allowed_ids, valid_out, dropped_out)
        return out
    if isinstance(obj, list):
        return [_filter_spec_cites(item, allowed_ids, valid_out, dropped_out) for item in obj]
    return obj


def _parse_packed_chunks(context: str) -> list[dict[str, str]]:
    """Parse packed <source>/<chunk> XML blocks for deterministic local synthesis."""
    chunks: list[dict[str, str]] = []
    source_positions = [(m.start(), m.group(1), html_lib.unescape(m.group(2))) for m in _SOURCE_OPEN_RE.finditer(context or "")]
    for m in _CHUNK_BLOCK_RE.finditer(context or ""):
        pos = m.start()
        src_id, src_title = "", "Source"
        for spos, sid, stitle in source_positions:
            if spos < pos:
                src_id, src_title = sid, stitle
            else:
                break
        chunks.append(
            {
                "id": m.group(1),
                "page": m.group(2) or "1",
                "heading": html_lib.unescape(m.group(3) or "").strip(),
                "source_id": src_id,
                "source_title": src_title,
                "text": m.group(4).strip(),
            }
        )
    return chunks


def _extract_facts(chunks: list[dict[str, str]]) -> list[dict[str, Any]]:
    facts: list[dict[str, Any]] = []
    for ch in chunks:
        heading = ch["heading"] or ch["source_title"]
        raw_lines = [ln.strip() for ln in ch["text"].splitlines() if ln.strip() and not ln.strip().startswith("<!--")]
        paired: list[tuple[str, str]] = []
        for ln in raw_lines:
            if ln.startswith("#"):
                heading = ln.lstrip("# ").strip() or heading
                continue
            if ln.startswith("|"):
                continue
            clean_ln = re.sub(r"^[-*+]\s+", "", ln)
            for s in re.split(r"(?<=[.!?])\s+", clean_ln):
                s = s.strip()
                if len(s) >= 26:
                    paired.append((heading, s))
        for hd, s in paired[:6]:
            num_match = re.search(r"\b(\d+(?:[.,]\d+)?(?:\s*(?:%|ms|s|x|GB|MB|KB|MiB|k|M|B|px)))(?=\s|[,.;:)]|$)", s)
            facts.append(
                {
                    "chunk_id": ch["id"],
                    "source_title": ch["source_title"],
                    "heading": hd,
                    "sentence": s,
                    "metric": num_match.group(1) if num_match else "",
                }
            )
    return facts


def _clip(text: str, limit: int) -> str:
    s = (text or "").strip()
    if len(s) <= limit:
        return s
    cut = s[:limit].rsplit(" ", 1)[0].rstrip(",.;:- ")
    return (cut or s[:limit]).rstrip() + "..."


def _extractive_studio(
    kind: str,
    context: str,
    allowed_ids: set[str],
    p: dict[str, Any],
    *,
    ctx: Any = None,
    progress: Any = None,
) -> tuple[dict[str, Any], list[str], dict[str, Any]]:
    """Deterministic local synthesis for all 8 Studio formats when no LLM provider is configured."""
    params = p
    chunks = _parse_packed_chunks(context)
    facts = _extract_facts(chunks)
    focus = str(p.get("focus") or "Key Findings").strip()
    count = max(3, min(14, int(p.get("count") or 6)))
    sources_grouped: dict[str, list[dict[str, Any]]] = {}
    for f in facts:
        sources_grouped.setdefault(f["source_title"], []).append(f)

    if kind == "report":
        lines = [f"# {p.get('template', 'briefing').replace('_', ' ').title()}: {focus}", ""]
        if facts:
            lines.append("## Executive Summary")
            for f in facts[:3]:
                lines.append(f"{f['sentence']} [[c:{f['chunk_id']}]]")
            lines.append("")
        for stitle, items in list(sources_grouped.items())[:5]:
            lines.append(f"## {stitle}")
            for f in items[:4]:
                lines.append(f"- {f['sentence']} [[c:{f['chunk_id']}]]")
            lines.append("")
        md = "\n".join(lines).strip()
        clean, cites, info = ground.validate(md, allowed_ids)
        info["mode"] = "extractive"
        return {"title": f"{p.get('template', 'briefing').replace('_', ' ').title()}: {focus[:56]}", "markdown": clean}, cites, info

    if kind == "audio":
        style = str(p.get("style") or "deep_dive")
        turns: list[dict[str, Any]] = []
        if facts:
            turns.append({
                "id": "t_1",
                "speaker": "Alex",
                "text": f"Welcome to your SourceBook Audio Overview on {focus}. We analyzed {len(sources_grouped)} active sources, and right away one finding stands out: {facts[0]['sentence']}",
                "cites": [facts[0]["chunk_id"]],
            })
            for idx, f in enumerate(facts[1 : min(len(facts), max(6, count))], start=2):
                speaker = "Maya" if idx % 2 == 0 else "Alex"
                lead = (
                    f"That ties directly into {f['source_title']}. Under {f['heading']}, it notes: "
                    if speaker == "Maya"
                    else f"And looking closely at {f['heading']}, the evidence adds another key piece: "
                )
                turns.append({
                    "id": f"t_{idx}",
                    "speaker": speaker,
                    "text": f"{lead}{f['sentence']}",
                    "cites": [f["chunk_id"]],
                })
            turns.append({
                "id": f"t_{len(turns) + 1}",
                "speaker": "Maya" if len(turns) % 2 == 1 else "Alex",
                "text": "Every point we covered links straight back to its exact passage in your notebook. Click any citation or ask us a follow-up question below to go deeper.",
                "cites": [facts[0]["chunk_id"]],
            })
        spec: dict[str, Any] = {
            "title": f"Audio Overview: {focus[:48]}",
            "subtitle": f"{style.replace('_', ' ').title()} across {len(sources_grouped)} sources",
            "style": style if style in ("deep_dive", "debate", "brief", "critique") else "deep_dive",
            "hosts": ["Alex", "Maya"],
            "turns": turns,
        }
    elif kind == "mindmap":
        children = []
        for s_idx, (stitle, items) in enumerate(list(sources_grouped.items())[:5]):
            by_head: dict[str, list[dict[str, Any]]] = {}
            for it in items:
                by_head.setdefault(it["heading"] or stitle, []).append(it)
            sub_nodes = []
            for h_idx, (hd, hitems) in enumerate(list(by_head.items())[:4]):
                first = hitems[0]
                label = " ".join(hd.split()[:5]) or f"Topic {h_idx + 1}"
                sub_nodes.append(
                    {
                        "id": f"n_{s_idx}_{h_idx}",
                        "label": label,
                        "summary": first["sentence"][:180],
                        "cites": [first["chunk_id"]],
                        "children": [
                            {
                                "id": f"n_{s_idx}_{h_idx}_{k}",
                                "label": " ".join(x["sentence"].split()[:4]).rstrip(",.;:"),
                                "summary": x["sentence"][:180],
                                "cites": [x["chunk_id"]],
                                "children": [],
                            }
                            for k, x in enumerate(hitems[1:3])
                        ],
                    }
                )
            children.append(
                {
                    "id": f"n_{s_idx}",
                    "label": " ".join(stitle.replace(".md", "").replace(".txt", "").split()[:4]),
                    "summary": items[0]["sentence"][:180],
                    "cites": sorted({it["chunk_id"] for it in items[:2]}),
                    "children": sub_nodes,
                }
            )
        spec = {
            "title": f"Concept Map: {focus[:48]}",
            "root": {
                "id": "root",
                "label": " ".join(focus.split()[:4]) or "Notebook",
                "summary": facts[0]["sentence"][:180] if facts else "Notebook source map.",
                "cites": [facts[0]["chunk_id"]] if facts else [],
                "children": children,
            },
        }
    elif kind == "flashcards":
        cards = []
        for idx, f in enumerate(facts[:count]):
            heading = f["heading"] or f["source_title"]
            cards.append(
                {
                    "id": f"fc_{idx + 1}",
                    "front": f"What do the sources state about {heading} ({f['source_title']})?" if idx % 2 == 0 else f"Key finding in {heading}: explain the primary mechanism or metric.",
                    "back": f["sentence"],
                    "hint": f"Check section: {heading}",
                    "tags": [re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")[:24] or "source"],
                    "cites": [f["chunk_id"]],
                }
            )
        spec = {"deck": f"Flashcards: {focus[:48]}", "cards": cards}
    elif kind == "quiz":
        questions = []
        # Interleave sources round-robin so quizzes test across the full corpus
        ordered_q: list[dict[str, Any]] = []
        q_buckets = [list(items) for items in sources_grouped.values()]
        while any(q_buckets) and len(ordered_q) < min(count, 8):
            for b in q_buckets:
                if b and len(ordered_q) < min(count, 8):
                    ordered_q.append(b.pop(0))
        for idx, f in enumerate(ordered_q):
            clean_src = re.sub(r"\.(md|markdown|txt|pdf|docx|csv|json)$", "", f["source_title"], flags=re.IGNORECASE)
            if idx % 3 == 2:
                questions.append(
                    {
                        "id": f"q_{idx + 1}",
                        "type": "tf",
                        "prompt": f"True or False ({clean_src}): {f['sentence']}",
                        "options": ["True", "False"],
                        "answer": 0,
                        "explanation": f"Verified directly from {clean_src} under '{f['heading']}': {f['sentence']}",
                        "cites": [f["chunk_id"]],
                    }
                )
            else:
                distractors = [
                    _clip(other["sentence"], 115)
                    for other in facts
                    if other["chunk_id"] != f["chunk_id"] and other["sentence"] != f["sentence"]
                ][:3]
                while len(distractors) < 3:
                    distractors.append("This claim is not supported by the active notebook sources.")
                correct = _clip(f["sentence"], 115)
                opts = [correct, *distractors[:3]]
                rotate = idx % 4
                opts = opts[rotate:] + opts[:rotate]
                ans_idx = opts.index(correct)
                questions.append(
                    {
                        "id": f"q_{idx + 1}",
                        "type": "mcq",
                        "prompt": f"According to {clean_src} ({f['heading']}), which statement is accurate?",
                        "options": opts,
                        "answer": ans_idx,
                        "explanation": f["sentence"],
                        "cites": [f["chunk_id"]],
                    }
                )
        spec = {"title": f"Quiz: {focus[:48]}", "questions": questions}
    elif kind == "table":
        # Interleave sources round-robin and surface quantified findings near the top so
        # multi-source evidence matrices immediately highlight diversity and hard numbers.
        ordered_facts: list[dict[str, Any]] = []
        buckets = [list(items) for items in sources_grouped.values()]
        for b in buckets:
            b.sort(key=lambda item: (0 if item["metric"] else 1))
        while any(buckets) and len(ordered_facts) < 12:
            for b in buckets:
                if b and len(ordered_facts) < 12:
                    ordered_facts.append(b.pop(0))
        rows = []
        for idx, f in enumerate(ordered_facts[:10]):
            rows.append(
                {
                    "id": f"r_{idx + 1}",
                    "cells": {
                        "source": f["source_title"],
                        "section": f["heading"],
                        "metric": f["metric"] or "Qualitative",
                        "finding": _clip(f["sentence"], 220),
                    },
                    "cites": [f["chunk_id"]],
                }
            )
        spec = {
            "title": f"Evidence Matrix: {focus[:48]}",
            "columns": [
                {"key": "source", "label": "Source", "type": "text"},
                {"key": "section", "label": "Section", "type": "text"},
                {"key": "metric", "label": "Metric", "type": "text"},
                {"key": "finding", "label": "Key Finding", "type": "text"},
            ],
            "rows": rows,
        }
    elif kind == "infographic":
        def _metric_rank(item: dict[str, Any]) -> tuple[int, float]:
            raw = str(item.get("metric") or "").strip()
            if not raw:
                return (2, 0.0)
            m = re.match(r"(\d+(?:\.\d+)?)\s*(%)", raw)
            if m:
                return (0, -float(m.group(1)))
            m2 = re.match(r"(\d+(?:\.\d+)?)", raw)
            return (1, -float(m2.group(1)) if m2 else 0.0)

        metric_facts = sorted([f for f in facts if f["metric"]], key=_metric_rank)
        chosen = (metric_facts + [f for f in facts if f not in metric_facts])[:6]
        layout = "stat-grid" if len(metric_facts) >= 2 else "process"
        distinct_sources = len({f["source_title"] for f in chosen if f.get("source_title")}) or len(sources_grouped)
        blocks = []
        for idx, f in enumerate(chosen):
            blocks.append(
                {
                    "id": f"b_{idx + 1}",
                    "kind": "metric" if f["metric"] else "insight",
                    "heading": " ".join(f["heading"].split()[:6]) or f"Highlight {idx + 1}",
                    "value": f["metric"] or "",
                    "body": _clip(f["sentence"], 210),
                    "cites": [f["chunk_id"]],
                }
            )
        spec = {
            "title": f"{focus[:56]}",
            "subtitle": f"Synthesized from {distinct_sources} active sources",
            "layout": layout,
            "blocks": blocks,
        }
    elif kind == "slides":
        deck_format = str(params.get("deck_format") or "detailed").lower()
        deck_purpose = str(params.get("deck_purpose") or "auto").lower()
        theme = str(params.get("theme") or "editorial").lower()
        image_mode = str(params.get("image_mode") or ("full_slide" if params.get("include_images") else "none")).lower()
        approved_outline = params.get("approved_outline") if isinstance(params.get("approved_outline"), list) else None
        user_prompt = str(params.get("instructions") or params.get("focus") or "").strip()
        visual_bible = (
            f"Cohesive {theme} widescreen 16:9 presentation aesthetic, crisp editorial hierarchy, "
            f"high-contrast typography, clean architectural diagrams"
            + (f", styled for: {user_prompt[:140]}" if user_prompt else "")
        )

        if approved_outline:
            slides = []
            for s_idx, item in enumerate(approved_outline):
                if not isinstance(item, dict):
                    continue
                sl_layout = str(item.get("layout") or ("title" if s_idx == 0 else ("closing" if s_idx == len(approved_outline) - 1 else "bullets")))
                sl_cites = [str(c) for c in (item.get("cites") or []) if str(c) in allowed_ids]
                if not sl_cites and facts:
                    sl_cites = [facts[s_idx % len(facts)]["chunk_id"]]
                sl_obj: dict[str, Any] = {
                    "id": str(item.get("id") or f"sl_{s_idx + 1}"),
                    "layout": sl_layout,
                    "title": str(item.get("title") or f"Slide {s_idx + 1}")[:120],
                    "body": str(item.get("body") or ""),
                    "bullets": [str(b) for b in (item.get("bullets") or []) if str(b).strip()][:5],
                    "notes": str(item.get("notes") or f"Walk through {item.get('title') or 'this slide'} with direct source references."),
                    "cites": sl_cites,
                    "image_mode": image_mode if params.get("include_images") else "none",
                }
                if isinstance(item.get("stat"), dict) and item["stat"].get("value"):
                    sl_obj["stat"] = item["stat"]
                if isinstance(item.get("columns"), list) and item["columns"]:
                    sl_obj["columns"] = item["columns"]
                if isinstance(item.get("steps"), list) and item["steps"]:
                    sl_obj["steps"] = item["steps"]
                if item.get("image_prompt"):
                    sl_obj["image_prompt"] = str(item["image_prompt"])
                elif params.get("include_images"):
                    sl_obj["image_prompt"] = _compose_slide_image_prompt(sl_obj, visual_bible, image_mode)
                slides.append(sl_obj)
        else:
            max_bullets = 3 if deck_format == "presenter" else 4
            bullet_cap = 90 if deck_format == "presenter" else 132
            slides = [
                {
                    "id": "sl_1",
                    "layout": "title",
                    "title": (user_prompt[:76] if user_prompt and len(user_prompt) <= 84 else focus[:72]),
                    "body": f"{deck_purpose.title() if deck_purpose != 'auto' else 'Source-grounded'} deck synthesized from {len(sources_grouped)} active sources.",
                    "bullets": [],
                    "notes": "Introduce the notebook scope, core thesis, and active source documents.",
                    "cites": [facts[0]["chunk_id"]] if facts else [],
                    "image_mode": image_mode if params.get("include_images") else "none",
                }
            ]
            grouped_list = list(sources_grouped.items())
            body_slots = max(2, count - 2)
            last_layout = "title"

            for g_idx, (stitle, items) in enumerate(grouped_list[:body_slots]):
                lead = items[0]
                clean_stitle = re.sub(r"\.(md|markdown|txt|pdf|docx|csv|json)$", "", stitle, flags=re.IGNORECASE)
                has_stat = next((x for x in items if x["metric"]), None)
                extra_bullets = [_clip(it["sentence"], bullet_cap) for it in items[1 : max_bullets + 1]]
                sl_cites = sorted({it["chunk_id"] for it in items[:4]})

                # Rotate across rich visual layouts — never repeat two identical layouts consecutively
                if has_stat and last_layout != "stat":
                    stat_bullets = [_clip(it["sentence"], bullet_cap) for it in items if it is not has_stat][:3]
                    sl_obj = {
                        "id": f"sl_{len(slides) + 1}",
                        "layout": "stat",
                        "title": _clip(has_stat["sentence"], 96),
                        "stat": {"value": has_stat["metric"], "label": f"{has_stat['heading']} ({clean_stitle})"},
                        "bullets": stat_bullets,
                        "notes": f"Source: {stitle}. Anchor the audience on {has_stat['metric']} before unpacking supporting evidence.",
                        "cites": sl_cites,
                    }
                elif g_idx == 2 and len(extra_bullets) >= 2 and last_layout != "comparison":
                    mid = max(1, len(extra_bullets) // 2)
                    sl_obj = {
                        "id": f"sl_{len(slides) + 1}",
                        "layout": "comparison",
                        "title": _clip(lead["sentence"], 96),
                        "columns": [
                            {"heading": f"Key Drivers ({clean_stitle})", "points": [lead["sentence"][:bullet_cap]] + extra_bullets[:mid]},
                            {"heading": "Operational Implications", "points": extra_bullets[mid:] or [_clip(items[-1]["sentence"], bullet_cap)]},
                        ],
                        "bullets": [],
                        "notes": f"Compare primary findings and operational implications drawn from {stitle}.",
                        "cites": sl_cites,
                    }
                elif g_idx == 3 and len(items) >= 3 and last_layout != "timeline":
                    sl_obj = {
                        "id": f"sl_{len(slides) + 1}",
                        "layout": "timeline",
                        "title": _clip(lead["sentence"], 96),
                        "steps": [
                            {"label": _clip(it["heading"] or f"Phase {k + 1}", 36), "detail": _clip(it["sentence"], 108)}
                            for k, it in enumerate(items[:4])
                        ],
                        "bullets": [],
                        "notes": f"Walk sequentially through each mechanism documented in {stitle}.",
                        "cites": sl_cites,
                    }
                elif len(extra_bullets) == 0 and last_layout != "quote":
                    sl_obj = {
                        "id": f"sl_{len(slides) + 1}",
                        "layout": "quote",
                        "title": lead["heading"] or clean_stitle,
                        "body": lead["sentence"],
                        "bullets": [],
                        "notes": f"Key verbatim insight from {stitle}.",
                        "cites": [lead["chunk_id"]],
                    }
                else:
                    chosen = "bento" if (len(extra_bullets) >= 3 and last_layout != "bento") else ("two-col" if last_layout != "two-col" else "bullets")
                    sl_obj = {
                        "id": f"sl_{len(slides) + 1}",
                        "layout": chosen,
                        "title": _clip(lead["sentence"], 96),
                        "bullets": extra_bullets[:max_bullets] or [_clip(lead["sentence"], bullet_cap)],
                        "notes": f"Drawn from {stitle}. Every takeaway maps directly to its cited passage.",
                        "cites": sl_cites,
                    }
                sl_obj["image_mode"] = image_mode if params.get("include_images") else "none"
                last_layout = sl_obj["layout"]
                slides.append(sl_obj)

            slides.append(
                {
                    "id": f"sl_{len(slides) + 1}",
                    "layout": "closing",
                    "title": "Every finding links back to a verifiable source passage.",
                    "bullets": [f"{st}: {len(its)} cited observations" for st, its in grouped_list[:4]],
                    "notes": "Open any citation in SourceBook to inspect the original passage.",
                    "cites": sorted({f["chunk_id"] for f in facts[:4]}),
                    "image_mode": image_mode if params.get("include_images") else "none",
                }
            )

        if params.get("include_images"):
            for sl_obj in slides:
                if not sl_obj.get("image_prompt"):
                    sl_obj["image_prompt"] = _compose_slide_image_prompt(sl_obj, visual_bible, image_mode)

        spec = {
            "title": (user_prompt[:64] if user_prompt and len(user_prompt) <= 68 else focus[:56]),
            "subtitle": f"{len(slides)} slides · {len(sources_grouped)} sources",
            "theme": theme,
            "deck_format": deck_format,
            "deck_purpose": deck_purpose,
            "visual_bible": visual_bible,
            "slides": slides,
        }
    else:
        raise ValueError(f"Unsupported Studio kind: {kind}")

    valid_cites: set[str] = set()
    dropped_cites: set[str] = set()
    spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
    media_files, img_meta = _maybe_attach_images(kind, spec, params, ctx=ctx, progress=progress)
    info: dict[str, Any] = {"dropped": sorted(dropped_cites), "mode": "extractive", **img_meta}
    if media_files:
        info["_media_files"] = media_files
    return spec, sorted(valid_cites), info


def _compose_slide_image_prompt(slide: dict[str, Any], visual_bible: str, image_mode: str) -> str:
    title = str(slide.get("title") or "").strip()
    layout = str(slide.get("layout") or "bullets")
    bullets = [str(b) for b in (slide.get("bullets") or [])[:4]]
    stat = slide.get("stat") if isinstance(slide.get("stat"), dict) else None
    if image_mode == "full_slide":
        parts = [
            f"Widescreen 16:9 presentation slide design. Visual style: {visual_bible}.",
            f"Layout archetype: {layout}. Headline: \"{title}\".",
        ]
        if stat and stat.get("value"):
            parts.append(f"Hero metric spotlight: {stat['value']} ({stat.get('label', '')}).")
        if bullets:
            parts.append("Key visual callouts: " + " | ".join(b[:70] for b in bullets[:3]) + ".")
        parts.append("Ultra-crisp editorial graphic design, clean typography, generous safe margins, balanced diagrams, zero watermarks or platform logos.")
        return " ".join(parts)
    return (
        f"Editorial minimalist illustration and conceptual technical diagram for a presentation slide about: {title}. "
        f"Style: {visual_bible}. Clean geometric forms, crisp lighting, NO embedded text, NO letters, NO watermarks."
    )


def _maybe_attach_images(
    kind: str,
    spec: dict[str, Any],
    params: dict[str, Any],
    *,
    ctx: Any = None,
    progress: Any = None,
) -> tuple[dict[str, bytes], dict[str, Any]]:
    """Generate and locally cache Hermes ImageGen artwork for Slides / Infographics when enabled."""
    media_files: dict[str, bytes] = {}
    if not params.get("include_images"):
        return media_files, {}
    if not runtime.probe_capabilities(ctx).get("image_generate"):
        return media_files, {"images_requested": True, "images_generated": 0, "image_notice": "No image generation provider configured in Hermes; rendered crisp native vector slides."}

    cfg_cap = int(runtime.get_config("max_images_per_deck", 12) or 12)
    req_cap = int(params.get("max_images", cfg_cap) or cfg_cap)
    max_imgs = max(0, min(req_cap, max(cfg_cap, 16)))
    if max_imgs <= 0:
        return media_files, {}

    image_mode = str(params.get("image_mode") or "full_slide").lower()
    visual_bible = str(spec.get("visual_bible") or "Sleek modern editorial presentation design, crisp lighting, clean geometric hierarchy")

    if kind == "infographic" and spec.get("hero_image_prompt"):
        if progress:
            progress("Generating infographic hero illustration via Hermes ImageGen...", 85)
        img_ref = runtime.generate_image(str(spec["hero_image_prompt"]), "landscape", ctx=ctx)
        if img_ref:
            fetched = runtime.fetch_image_bytes(img_ref)
            if fetched:
                raw, ext = fetched
                fname = f"hero.{ext}"
                media_files[fname] = raw
                spec["hero_image_file"] = fname
            spec["hero_image_url"] = img_ref
            return media_files, {"images_requested": True, "images_generated": 1}
        return media_files, {"images_requested": True, "images_generated": 0}

    if kind == "slides" and isinstance(spec.get("slides"), list):
        slides = spec["slides"]
        targets = []
        for s_idx, slide in enumerate(slides):
            if image_mode == "full_slide":
                targets.append((s_idx, slide))
            elif slide.get("image_prompt") or slide.get("layout") in ("title", "image-left", "image-full", "section"):
                targets.append((s_idx, slide))
        targets = targets[:max_imgs]
        generated = 0
        for t_i, (s_idx, slide) in enumerate(targets, start=1):
            prompt = str(slide.get("image_prompt") or _compose_slide_image_prompt(slide, visual_bible, image_mode))
            if progress:
                pct = 74 + int(22 * (t_i / max(1, len(targets))))
                progress(f"Generating slide artwork ({t_i}/{len(targets)}) via Hermes ImageGen...", pct)
            img_ref = runtime.generate_image(prompt, "landscape", ctx=ctx)
            if img_ref:
                slide["image_url"] = img_ref
                slide["image_mode"] = image_mode
                if image_mode == "full_slide":
                    slide["layout"] = "image-full"
                fetched = runtime.fetch_image_bytes(img_ref)
                if fetched:
                    raw, ext = fetched
                    fname = f"slide_{s_idx + 1:02d}.{ext}"
                    media_files[fname] = raw
                    slide["image_file"] = fname
                generated += 1
        return media_files, {"images_requested": True, "images_generated": generated, "image_mode": image_mode}
    return media_files, {}


def _build_slides_prompt_vars(p: dict[str, Any]) -> dict[str, Any]:
    deck_format = str(p.get("deck_format") or "detailed").lower()
    deck_purpose = str(p.get("deck_purpose") or "auto").lower()
    image_mode = str(p.get("image_mode") or ("full_slide" if p.get("include_images") else "none")).lower()
    user_prompt = str(p.get("instructions") or p.get("focus") or "the most important ideas").strip()

    fmt_desc = (
        "DETAILED DECK — comprehensive standalone slides with rich evidence bullets (up to 4 per slide, <=18 words each) and crisp body takeaways."
        if deck_format == "detailed"
        else "PRESENTER SLIDES — clean, minimal visual slides with short punchy talking points (max 3 per slide, <=11 words each); move rich explanations into speaker notes."
    )
    purpose_map = {
        "pitch": "Startup Pitch Deck (Hook -> Problem -> Solution -> Product Proof -> Traction/Metrics -> Advantage -> Roadmap -> Closing Ask).",
        "executive": "Executive Briefing (BLUF Cover -> Key Metric Spotlight -> Evidence Comparison -> Strategic Risks -> Action Plan -> Closing).",
        "technical": "Technical Architecture Deck (Thesis -> System Design -> Benchmark Stat Spotlight -> Protocol Timeline -> Tradeoffs -> Production Closing).",
        "editorial": "Editorial Keynote (Narrative Hook -> Core Insight -> Evidence Grid -> Pull Quote -> Synthesis -> Closing).",
        "workshop": "Workshop / Teaching Deck (Objectives -> Core Mental Model -> Step-by-Step Timeline -> Applied Examples -> Summary Checklist).",
    }
    purpose_desc = purpose_map.get(deck_purpose, "Choose the clearest narrative arc for the source material (Hook -> Key Insights -> Proof/Metrics -> Comparisons/Timeline -> Closing).")

    if p.get("include_images"):
        if image_mode == "full_slide":
            img_dir = (
                "Hermes Image Generation is ON in FULL-SLIDE ART mode. On EVERY slide, set image_mode='full_slide' and write a richly art-directed 16:9 "
                "'image_prompt' specifying the exact composition, diagrams/icons/visual metaphors, concise headline & key stat to render crisply, unified visual_bible palette, and zero third-party watermarks."
            )
        else:
            img_dir = (
                "Hermes Image Generation is ON in HYBRID VISUALS mode. On the title slide and 3-5 key visual slides, set image_mode='hybrid' and write text-free "
                "editorial illustration / conceptual diagram 'image_prompt' strings ('no embedded text, clean ground matching theme') that pair beside editable typography."
            )
    else:
        img_dir = (
            "Image Generation is OFF. Set image_mode='none' and focus on ultra-clean structural diversity across stat, comparison, timeline, bento, two-col, and quote layouts."
        )

    outline_dir = ""
    if isinstance(p.get("approved_outline"), list) and p["approved_outline"]:
        outline_json = json.dumps(p["approved_outline"], ensure_ascii=False)[:8000]
        outline_dir = f"FOLLOW THIS USER-APPROVED SLIDE OUTLINE CLOSELY (preserve slide count, order, titles, and layout choices):\n{outline_json}"

    rev_dir = ""
    if p.get("revision_prompt") and isinstance(p.get("previous_spec"), dict):
        prev_json = json.dumps(p["previous_spec"], ensure_ascii=False)[:9000]
        rev_dir = (
            f"REVISE THIS EXISTING SLIDE DECK according to the user's feedback while keeping all facts strictly grounded in the sources.\n"
            f"User revision request: {p['revision_prompt']}\nPrevious deck JSON:\n{prev_json}"
        )

    return {
        "deck_format_desc": fmt_desc,
        "deck_purpose_desc": purpose_desc,
        "user_prompt": user_prompt,
        "theme": str(p.get("theme") or "editorial"),
        "image_directive": img_dir,
        "outline_directive": outline_dir,
        "revision_directive": rev_dir,
    }


def outline_slides(
    context: str,
    allowed_ids: set[str],
    params: Optional[dict[str, Any]] = None,
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
) -> dict[str, Any]:
    """Generate a fast, editable slide-by-slide outline BEFORE committing to full deck + ImageGen."""
    p = {**(params or {}), "include_images": False}
    spec, cites, info = run(
        "slides",
        context,
        allowed_ids,
        p,
        provider=provider,
        model=model,
        ctx=ctx,
    )
    return {"outline": spec, "citations": cites, "grounding": info}


def run(
    kind: str,
    context: str,
    allowed_ids: set[str],
    params: Optional[dict[str, Any]] = None,
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
    progress: Optional[Callable[..., None]] = None,
) -> tuple[dict[str, Any], list[str], dict[str, Any]]:
    """Run a Studio generator across ANY Hermes model/provider with 3-tier JSON compatibility, citation verification, and extractive fallback."""
    gen = get_generator(kind)
    p = {
        "template": "briefing",
        "style": "deep_dive",
        "count": 8,
        "focus": "the most important ideas",
        "audience": "general",
        "length": "standard",
        "language": "English",
        "deck_format": "detailed",
        "deck_purpose": "auto",
        "theme": "editorial",
        **(params or {}),
    }
    if kind == "slides":
        p.update(_build_slides_prompt_vars(p))
    if gen.custom_runner is not None:
        spec = gen.custom_runner(context=context, params=p, ctx=ctx)
        valid_cites: set[str] = set()
        dropped_cites: set[str] = set()
        spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
        return spec, sorted(valid_cites), {"dropped": sorted(dropped_cites)}

    if p.get("extractive") or not runtime.llm_available(ctx):
        if progress:
            progress(f"Synthesizing {gen.label.lower()} locally...", 65)
        return _extractive_studio(kind, context, allowed_ids, p, ctx=ctx, progress=progress)

    instructions = (gen.instructions + SHARED_RULES).format(**p)
    aux_task = "sourcebook_audio" if kind == "audio" else "sourcebook_studio"

    if gen.schema_file is None and gen.schema is None:
        if progress:
            progress("Writing cited study guide...", 55)
        try:
            text_out, meta = runtime.complete_chat(
                [
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": f"<sources>\n{context}\n</sources>"},
                ],
                purpose=f"sourcebook.studio.{kind}",
                task=aux_task,
                provider=provider,
                model=model,
                temperature=0.25,
                ctx=ctx,
            )
        except runtime.ModelOverrideDeniedError:
            raise
        except Exception:
            return _extractive_studio(kind, context, allowed_ids, p, ctx=ctx, progress=progress)
        clean, cites, grounding_info = ground.validate(text_out, allowed_ids)
        grounding_info.update({k: v for k, v in meta.items() if v})
        return {"title": f"{p['template'].replace('_', ' ').title()}: {p['focus'][:60]}", "markdown": clean}, cites, grounding_info

    schema = gen.schema or json.loads((SCHEMAS_DIR / str(gen.schema_file)).read_text(encoding="utf-8"))
    spec: Optional[dict[str, Any]] = None
    model_meta: dict[str, str] = {}
    last_error = ""

    for attempt in range(2):
        if progress:
            stage = f"Generating structured {gen.label.lower()}..." if attempt == 0 else f"Repairing {gen.label.lower()} JSON..."
            progress(stage, 55 if attempt == 0 else 72)
        prompt_instr = instructions if attempt == 0 else (
            instructions + f"\n\nIMPORTANT: Previous output failed ({last_error}). Return ONLY valid JSON matching the exact schema."
        )
        try:
            parsed, meta = runtime.complete_json(
                instructions=prompt_instr,
                input_blocks=[{"type": "text", "text": f"<sources>\n{context}\n</sources>"}],
                json_schema=schema,
                schema_name=f"sourcebook.{kind}",
                purpose=f"sourcebook.studio.{kind}",
                task=aux_task,
                provider=provider,
                model=model,
                temperature=0.25 if attempt == 0 else 0.0,
                ctx=ctx,
            )
            spec = parsed
            model_meta = meta
            break
        except runtime.ModelOverrideDeniedError:
            raise
        except ValueError as exc:
            last_error = str(exc)
            continue
        except Exception:
            return _extractive_studio(kind, context, allowed_ids, p, ctx=ctx, progress=progress)

    if spec is None:
        return _extractive_studio(kind, context, allowed_ids, p, ctx=ctx, progress=progress)

    if progress:
        progress("Verifying citations...", 74)
    valid_cites = set()
    dropped_cites = set()
    spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
    media_files, img_meta = _maybe_attach_images(kind, spec, p, ctx=ctx, progress=progress)

    grounding_info: dict[str, Any] = {"dropped": sorted(dropped_cites), **img_meta}
    grounding_info.update({k: v for k, v in model_meta.items() if v})
    if media_files:
        grounding_info["_media_files"] = media_files
    return spec, sorted(valid_cites), grounding_info


def export_artifact(artifact: dict[str, Any], fmt: str) -> tuple[str, str, str]:
    """Return (filename, media_type, text_content) for an artifact export."""
    kind = artifact.get("kind", "artifact")
    spec = artifact.get("spec") or {}
    slug = "".join(c if c.isalnum() or c in "-_" else "-" for c in str(artifact.get("title") or kind).lower()).strip("-")[:48] or kind
    f = (fmt or "md").lower()

    if kind == "report" or f == "md":
        if kind == "report":
            return f"{slug}.md", "text/markdown; charset=utf-8", str(spec.get("markdown") or "")
        if kind == "audio":
            lines = [f"# {spec.get('title') or 'Audio Overview'}", ""]
            if spec.get("subtitle"):
                lines.append(f"*{spec['subtitle']}*\n")
            for t in spec.get("turns") or []:
                cites = " ".join(f"`{c}`" for c in (t.get("cites") or []))
                lines.append(f"**{t.get('speaker', 'Host')}:** {t.get('text', '')}" + (f" ({cites})" if cites else ""))
                lines.append("")
            return f"{slug}.md", "text/markdown; charset=utf-8", "\n".join(lines).strip()
        if kind == "table":
            cols = spec.get("columns") or []
            rows = spec.get("rows") or []
            header = "| " + " | ".join(str(c.get("label", c.get("key", ""))) for c in cols) + " | Sources |"
            sep = "| " + " | ".join("---" for _ in cols) + " | --- |"
            lines = [f"# {spec.get('title') or 'Data Table'}", "", header, sep]
            for r in rows:
                cells = r.get("cells") or {}
                vals = [str(cells.get(c["key"], "")).replace("|", "\\|") for c in cols]
                cites = ", ".join(r.get("cites") or [])
                lines.append("| " + " | ".join(vals) + f" | {cites} |")
            return f"{slug}.md", "text/markdown; charset=utf-8", "\n".join(lines)
        if kind == "mindmap":
            lines = [f"# {spec.get('title') or 'Mind Map'}", ""]
            def walk_md(node: dict[str, Any], depth: int) -> None:
                indent = "  " * depth
                summary = f": {node['summary']}" if node.get("summary") else ""
                lines.append(f"{indent}- **{node.get('label', '')}**{summary}")
                for ch in node.get("children") or []:
                    walk_md(ch, depth + 1)
            if isinstance(spec.get("root"), dict):
                walk_md(spec["root"], 0)
            return f"{slug}.md", "text/markdown; charset=utf-8", "\n".join(lines)
        if kind == "flashcards":
            lines = [f"# {spec.get('deck') or 'Flashcards'}", ""]
            for idx, c in enumerate(spec.get("cards") or [], start=1):
                lines.append(f"## {idx}. {c.get('front', '')}\n\n{c.get('back', '')}\n")
            return f"{slug}.md", "text/markdown; charset=utf-8", "\n".join(lines)
        if kind == "quiz":
            lines = [f"# {spec.get('title') or 'Quiz'}", ""]
            answers = ["## Answer Key", ""]
            for idx, q in enumerate(spec.get("questions") or [], start=1):
                lines.append(f"### {idx}. {q.get('prompt', '')}")
                for oi, opt in enumerate(q.get("options") or []):
                    lines.append(f"- {chr(65 + oi)}. {opt}")
                lines.append("")
                answers.append(f"{idx}. **{q.get('answer')}**: {q.get('explanation', '')}")
            return f"{slug}.md", "text/markdown; charset=utf-8", "\n".join(lines + answers)
        if kind == "slides" and f in ("md", "marp"):
            return _export_slides_marp(slug, spec)
        return f"{slug}.json", "application/json; charset=utf-8", json.dumps(spec, indent=2, ensure_ascii=False)

    if f == "marp" and kind == "slides":
        return _export_slides_marp(slug, spec)

    if f == "html" and kind == "slides":
        return _export_slides_html(slug, spec)

    if f == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf)
        if kind == "table":
            cols = spec.get("columns") or []
            writer.writerow([c.get("label", c.get("key", "")) for c in cols] + ["Citations"])
            for r in spec.get("rows") or []:
                cells = r.get("cells") or {}
                writer.writerow([cells.get(c["key"], "") for c in cols] + ["; ".join(r.get("cites") or [])])
        elif kind == "flashcards":
            writer.writerow(["Front", "Back", "Hint", "Tags", "Citations"])
            for c in spec.get("cards") or []:
                writer.writerow([c.get("front", ""), c.get("back", ""), c.get("hint", ""), " ".join(c.get("tags") or []), "; ".join(c.get("cites") or [])])
        else:
            raise ValueError(f"CSV export is not supported for {kind}")
        return f"{slug}.csv", "text/csv; charset=utf-8", buf.getvalue()

    if f == "anki" and kind == "flashcards":
        lines = []
        for c in spec.get("cards") or []:
            front = str(c.get("front", "")).replace("\t", " ").replace("\n", "<br>")
            back = str(c.get("back", "")).replace("\t", " ").replace("\n", "<br>")
            tags = " ".join(str(t).replace(" ", "_") for t in (c.get("tags") or []))
            lines.append(f"{front}\t{back}\t{tags}")
        return f"{slug}-anki.tsv", "text/tab-separated-values; charset=utf-8", "\n".join(lines)

    if f == "opml" and kind == "mindmap":
        def walk_opml(node: dict[str, Any]) -> str:
            lbl = html_lib.escape(str(node.get("label", "")), quote=True)
            note = html_lib.escape(str(node.get("summary", "")), quote=True)
            kids = "".join(walk_opml(ch) for ch in (node.get("children") or []))
            if kids:
                return f'<outline text="{lbl}" _note="{note}">{kids}</outline>'
            return f'<outline text="{lbl}" _note="{note}" />'
        title = html_lib.escape(str(spec.get("title") or "Mind Map"))
        body = walk_opml(spec.get("root") or {"label": title})
        xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0"><head><title>{title}</title></head><body>{body}</body></opml>'
        return f"{slug}.opml", "text/xml; charset=utf-8", xml

    return f"{slug}.json", "application/json; charset=utf-8", json.dumps(spec, indent=2, ensure_ascii=False)


def _export_slides_marp(slug: str, spec: dict[str, Any]) -> tuple[str, str, str]:
    lines = ["---", "marp: true", f"title: {spec.get('title') or 'Deck'}", "paginate: true", "---", ""]
    for idx, sl in enumerate(spec.get("slides") or []):
        if idx > 0:
            lines.append("\n---\n")
        lines.append(f"# {sl.get('title', '')}\n")
        if isinstance(sl.get("stat"), dict) and sl["stat"].get("value"):
            lines.append(f"## {sl['stat']['value']}\n{sl['stat'].get('label', '')}\n")
        for b in sl.get("bullets") or []:
            lines.append(f"- {b}")
        if sl.get("body"):
            lines.append(f"\n{sl['body']}")
        if sl.get("notes"):
            lines.append(f"\n<!--\n{sl['notes']}\n-->")
    return f"{slug}.marp.md", "text/markdown; charset=utf-8", "\n".join(lines)


def _export_slides_html(slug: str, spec: dict[str, Any]) -> tuple[str, str, str]:
    """Self-contained offline HTML presentation deck (zero external assets, printable to PDF)."""
    title = html_lib.escape(str(spec.get("title") or "SourceBook Deck"))
    slides_html: list[str] = []
    for idx, sl in enumerate(spec.get("slides") or [], start=1):
        layout = html_lib.escape(str(sl.get("layout") or "bullets"))
        stitle = html_lib.escape(str(sl.get("title") or ""))
        bullets = "".join(f"<li>{html_lib.escape(str(b))}</li>" for b in (sl.get("bullets") or []))
        body = f"<p class='body'>{html_lib.escape(str(sl['body']))}</p>" if sl.get("body") else ""
        stat_html = ""
        if isinstance(sl.get("stat"), dict) and sl["stat"].get("value"):
            stat_html = (
                f"<div class='stat'><div class='val'>{html_lib.escape(str(sl['stat']['value']))}</div>"
                f"<div class='lbl'>{html_lib.escape(str(sl['stat'].get('label', '')))}</div></div>"
            )
        notes = f"<aside class='notes'>{html_lib.escape(str(sl['notes']))}</aside>" if sl.get("notes") else ""
        slides_html.append(
            f"<section class='slide layout-{layout}' data-index='{idx}'>"
            f"<h2>{stitle}</h2>{stat_html}"
            f"{'<ul>' + bullets + '</ul>' if bullets else ''}{body}{notes}"
            f"<footer class='num'>{idx}</footer></section>"
        )
    doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
:root{{--bg:#0f1117;--fg:#eef1f6;--muted:#9aa4b2;--card:#181c26;--accent:#3b82f6;--border:#2a3142;}}
*{{box-sizing:border-box}}body{{margin:0;font:18px/1.5 system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--fg)}}
.deck{{width:100vw;height:100vh;display:grid;place-items:center;padding:24px}}
.slide{{display:none;width:min(1120px,94vw);aspect-ratio:16/9;background:var(--card);border:1px solid var(--border);
border-radius:16px;padding:56px 64px;position:relative;flex-direction:column;justify-content:center;gap:18px}}
.slide.active{{display:flex}} .slide h2{{margin:0;font-size:clamp(28px,3.2vw,44px);line-height:1.15}}
.slide.layout-title h2,.slide.layout-section h2{{font-size:clamp(38px,4.6vw,60px);text-align:center}}
.slide.layout-quote .body{{font-size:28px;font-style:italic;border-left:4px solid var(--accent);padding-left:20px}}
.stat .val{{font-size:68px;font-weight:800;color:var(--accent);line-height:1}} .stat .lbl{{color:var(--muted);margin-top:6px}}
ul{{margin:0;padding-left:26px;display:grid;gap:10px}} .layout-two-col ul{{grid-template-columns:1fr 1fr;gap:14px 32px}}
.body{{color:var(--muted);margin:0}} .notes{{display:none}} .num{{position:absolute;right:24px;bottom:18px;font-size:13px;color:var(--muted)}}
.bar{{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:10px;background:var(--card);
border:1px solid var(--border);padding:6px 12px;border-radius:999px;font-size:13px;color:var(--muted)}}
.bar button{{background:none;border:0;color:var(--fg);cursor:pointer;font-size:14px;padding:2px 8px}}
@media print{{.bar{{display:none}}.deck{{display:block;height:auto;padding:0}}.slide{{display:flex!important;page-break-after:always;width:100%;margin:0 0 12px;border-radius:0}}}}
</style></head><body>
<main class="deck">{"".join(slides_html)}</main>
<nav class="bar"><button id="p">Prev</button><span id="c">1</span><button id="n">Next</button></nav>
<script>
const S=[...document.querySelectorAll('.slide')];let i=0;
function show(k){{i=Math.max(0,Math.min(S.length-1,k));S.forEach((s,idx)=>s.classList.toggle('active',idx===i));document.getElementById('c').textContent=(i+1)+' / '+S.length;}}
document.getElementById('p').onclick=()=>show(i-1);document.getElementById('n').onclick=()=>show(i+1);
document.addEventListener('keydown',e=>{{if(e.key==='ArrowRight'||e.key===' ')show(i+1);if(e.key==='ArrowLeft')show(i-1);}});show(0);
</script></body></html>"""
    return f"{slug}.deck.html", "text/html; charset=utf-8", doc


def export_artifact_binary(
    artifact: dict[str, Any],
    fmt: str,
    *,
    media_dir: Optional[Path] = None,
    theme: Optional[str] = None,
) -> tuple[str, str, bytes]:
    """Return (filename, media_type, binary_bytes) for native PowerPoint (.pptx) or PDF (.pdf) Slide Deck exports."""
    from .. import slides_export

    kind = artifact.get("kind", "artifact")
    if kind != "slides":
        raise ValueError(f"Binary {fmt!r} export is only supported for Slide Decks")
    spec = artifact.get("spec") or {}
    slug = (
        "".join(c if c.isalnum() or c in "-_" else "-" for c in str(artifact.get("title") or "slide-deck").lower()).strip("-")[:56]
        or "slide-deck"
    )
    f = (fmt or "pptx").lower().strip(".")
    if f == "pptx":
        raw = slides_export.build_pptx_bytes(spec, media_dir=media_dir, theme_override=theme)
        return (
            f"{slug}.pptx",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            raw,
        )
    if f == "pdf":
        raw = slides_export.build_pdf_bytes(spec, media_dir=media_dir, theme_override=theme)
        return f"{slug}.pdf", "application/pdf", raw
    raise ValueError(f"Unsupported binary export format: {fmt}")


__all__ = [
    "list_generators",
    "register_generator",
    "get_generator",
    "run",
    "outline_slides",
    "export_artifact",
    "export_artifact_binary",
]
