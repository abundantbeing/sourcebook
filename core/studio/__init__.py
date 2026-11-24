"""Studio generators, schema repair, citation verification, extractive fallback, and offline exporters."""

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
            "Write a thorough {template} report in Markdown using headings, concise prose, and bullet takeaways. "
            "Cite every factual sentence inline with [[c:<chunk_id>]]."
        ),
        schema_file=None,
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
        description="Multi-layout 16:9 presentation with speaker notes, presenter mode, and offline HTML/Marp export.",
        instructions=(
            "Create a {count}-slide presentation deck starting with a 'title' slide and ending with a 'closing' slide. "
            "Every content slide headline must be a complete-sentence claim (never a vague label) expressing ONE core idea per slide. "
            "Lead with the strongest takeaway. Vary layouts across bullets, two-col, quote, stat, section, image-left. "
            "Keep bullets tight (<= 4 bullets/slide, <= 14 words each), write rich speaker notes, include cites, "
            "and add image_prompt only on 1 to 3 visual slides."
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
        sents: list[str] = []
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
                    sents.append(s)
        for s in sents[:6]:
            num_match = re.search(r"\b(\d+(?:[.,]\d+)?(?:\s*(?:%|ms|s|x|GB|MB|KB|MiB|k|M|B|px)))\b", s)
            facts.append(
                {
                    "chunk_id": ch["id"],
                    "source_title": ch["source_title"],
                    "heading": heading,
                    "sentence": s,
                    "metric": num_match.group(1) if num_match else "",
                }
            )
    return facts


def _extractive_studio(kind: str, context: str, allowed_ids: set[str], p: dict[str, Any]) -> tuple[dict[str, Any], list[str], dict[str, Any]]:
    """Deterministic local synthesis for all 7 Studio formats when no LLM provider is configured."""
    chunks = _parse_packed_chunks(context)
    facts = _extract_facts(chunks)
    focus = str(p.get("focus") or "Key Findings").strip()
    count = max(3, min(12, int(p.get("count") or 6)))
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

    if kind == "mindmap":
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
        spec: dict[str, Any] = {
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
        for idx, f in enumerate(facts[: min(count, 6)]):
            distractors = [other["sentence"][:110] for other in facts if other["chunk_id"] != f["chunk_id"]][:3]
            while len(distractors) < 3:
                distractors.append("This claim is not supported by the active notebook sources.")
            correct = f["sentence"][:110]
            opts = [correct, *distractors[:3]]
            rotate = idx % 4
            opts = opts[rotate:] + opts[:rotate]
            ans_idx = opts.index(correct)
            questions.append(
                {
                    "id": f"q_{idx + 1}",
                    "type": "mcq",
                    "prompt": f"According to {f['source_title']} ({f['heading']}), which statement is accurate?",
                    "options": opts,
                    "answer": ans_idx,
                    "explanation": f["sentence"],
                    "cites": [f["chunk_id"]],
                }
            )
        spec = {"title": f"Quiz: {focus[:48]}", "questions": questions}
    elif kind == "table":
        rows = []
        for idx, f in enumerate(facts[:10]):
            rows.append(
                {
                    "id": f"r_{idx + 1}",
                    "cells": {
                        "source": f["source_title"],
                        "section": f["heading"],
                        "metric": f["metric"] or "Qualitative",
                        "finding": f["sentence"][:150],
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
        metric_facts = [f for f in facts if f["metric"]]
        chosen = (metric_facts + [f for f in facts if f not in metric_facts])[:6]
        layout = "stat-grid" if len(metric_facts) >= 2 else "process"
        blocks = []
        for idx, f in enumerate(chosen):
            blocks.append(
                {
                    "id": f"b_{idx + 1}",
                    "heading": " ".join(f["heading"].split()[:6]) or f"Highlight {idx + 1}",
                    "value": f["metric"] or f"0{idx + 1}",
                    "body": f["sentence"][:170],
                    "cites": [f["chunk_id"]],
                }
            )
        spec = {
            "title": f"{focus[:56]}",
            "subtitle": f"Synthesized from {len(sources_grouped)} active sources",
            "layout": layout,
            "blocks": blocks,
        }
    elif kind == "slides":
        slides: list[dict[str, Any]] = [
            {
                "layout": "title",
                "title": focus[:72],
                "body": f"Source-grounded deck synthesized from {len(sources_grouped)} active sources.",
                "bullets": [],
                "notes": "Introduce the notebook scope and the active source documents.",
                "cites": [facts[0]["chunk_id"]] if facts else [],
            }
        ]
        for stitle, items in list(sources_grouped.items())[: max(2, count - 2)]:
            lead = items[0]
            has_stat = next((x for x in items if x["metric"]), None)
            if has_stat and len(slides) % 2 == 1:
                slides.append(
                    {
                        "layout": "stat",
                        "title": lead["sentence"][:88],
                        "stat": {"value": has_stat["metric"], "label": has_stat["heading"]},
                        "bullets": [it["sentence"][:110] for it in items[1:4]],
                        "notes": f"Source: {stitle}. Highlight the measured figure before walking through supporting context.",
                        "cites": sorted({it["chunk_id"] for it in items[:3]}),
                    }
                )
            else:
                slides.append(
                    {
                        "layout": "bullets",
                        "title": lead["sentence"][:88],
                        "bullets": [it["sentence"][:115] for it in items[:4]],
                        "notes": f"Drawn from {stitle}. Verify exact wording against the cited passages.",
                        "cites": sorted({it["chunk_id"] for it in items[:4]}),
                    }
                )
        slides.append(
            {
                "layout": "closing",
                "title": "Every finding links back to a verifiable source passage.",
                "bullets": [f"{st}: {len(its)} cited observations" for st, its in list(sources_grouped.items())[:4]],
                "notes": "Open any citation in Folio to inspect the original passage.",
                "cites": sorted({f["chunk_id"] for f in facts[:4]}),
            }
        )
        spec = {"title": focus[:56], "slides": slides}
    else:
        raise ValueError(f"Unsupported Studio kind: {kind}")

    valid_cites: set[str] = set()
    dropped_cites: set[str] = set()
    spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
    return spec, sorted(valid_cites), {"dropped": sorted(dropped_cites), "mode": "extractive"}


def _maybe_attach_images(kind: str, spec: dict[str, Any], params: dict[str, Any], *, ctx: Any = None, progress: Any = None) -> None:
    if not params.get("include_images"):
        return
    max_imgs = min(
        int(params.get("max_images", runtime.get_config("max_images_per_deck", 4)) or 4),
        int(runtime.get_config("max_images_per_deck", 4) or 4),
    )
    if max_imgs <= 0:
        return
    if kind == "infographic" and spec.get("hero_image_prompt"):
        if progress:
            progress("Generating infographic hero illustration...", 85)
        img = runtime.generate_image(str(spec["hero_image_prompt"]), "landscape", ctx=ctx)
        if img:
            spec["hero_image_url"] = img
    elif kind == "slides" and isinstance(spec.get("slides"), list):
        generated = 0
        for slide in spec["slides"]:
            if generated >= max_imgs:
                break
            prompt = slide.get("image_prompt")
            if prompt:
                if progress:
                    progress(f"Generating slide illustration ({generated + 1}/{max_imgs})...", 80)
                img = runtime.generate_image(str(prompt), "landscape", ctx=ctx)
                if img:
                    slide["image_url"] = img
                    generated += 1


def run(
    kind: str,
    context: str,
    allowed_ids: set[str],
    params: Optional[dict[str, Any]] = None,
    *,
    ctx: Any = None,
    progress: Optional[Callable[[str, Optional[int]], None]] = None,
) -> tuple[dict[str, Any], list[str], dict[str, Any]]:
    """Run a Studio generator, validate/repair schema, verify citations, and return (spec, cites, grounding)."""
    gen = get_generator(kind)
    p = {
        "template": "briefing",
        "count": 8,
        "focus": "the most important ideas",
        "audience": "general",
        "length": "standard",
        "language": "English",
        **(params or {}),
    }
    if gen.custom_runner is not None:
        spec = gen.custom_runner(context=context, params=p, ctx=ctx)
        valid_cites: set[str] = set()
        dropped_cites: set[str] = set()
        spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
        return spec, sorted(valid_cites), {"dropped": sorted(dropped_cites)}

    if p.get("extractive") or not runtime.llm_available(ctx):
        if progress:
            progress(f"Synthesizing {gen.label.lower()} locally...", 65)
        return _extractive_studio(kind, context, allowed_ids, p)

    instructions = (gen.instructions + SHARED_RULES).format(**p)
    llm = runtime.get_llm(ctx)
    use_task = "folio_studio" if runtime.get_live_context() is not None else None

    if gen.schema_file is None and gen.schema is None:
        if progress:
            progress("Writing cited study guide...", 55)
        kwargs: dict[str, Any] = {
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": f"<sources>\n{context}\n</sources>"},
            ],
            "purpose": f"folio.studio.{kind}",
            "temperature": 0.25,
        }
        if use_task:
            kwargs["task"] = use_task
        try:
            res = llm.complete(**kwargs)
        except Exception:
            kwargs.pop("task", None)
            try:
                res = llm.complete(**kwargs)
            except Exception:
                return _extractive_studio(kind, context, allowed_ids, p)
        clean, cites, grounding_info = ground.validate(res.text, allowed_ids)
        return {"title": f"{p['template'].replace('_', ' ').title()}: {p['focus'][:60]}", "markdown": clean}, cites, grounding_info

    schema = gen.schema or json.loads((SCHEMAS_DIR / str(gen.schema_file)).read_text(encoding="utf-8"))
    last_error = ""
    spec: Optional[dict[str, Any]] = None

    for attempt in range(2):
        if progress:
            stage = f"Generating structured {gen.label.lower()}..." if attempt == 0 else f"Repairing {gen.label.lower()} JSON..."
            progress(stage, 55 if attempt == 0 else 72)
        prompt_instr = instructions if attempt == 0 else (
            instructions + f"\n\nIMPORTANT: Your previous output failed validation ({last_error}). "
            "Return ONLY valid JSON matching the exact schema."
        )
        kwargs = {
            "instructions": prompt_instr,
            "input": [{"type": "text", "text": f"<sources>\n{context}\n</sources>"}],
            "json_schema": schema,
            "schema_name": f"folio.{kind}",
            "purpose": f"folio.studio.{kind}",
            "temperature": 0.25 if attempt == 0 else 0.0,
        }
        if use_task:
            kwargs["task"] = use_task
        try:
            res = llm.complete_structured(**kwargs)
        except ValueError as exc:
            last_error = str(exc)
            continue
        except Exception as exc:
            kwargs.pop("task", None)
            try:
                res = llm.complete_structured(**kwargs)
            except ValueError as v_exc:
                last_error = str(v_exc)
                continue
            except Exception:
                # Provider unavailable (e.g. offline/no API key): fall back cleanly to local synthesis
                return _extractive_studio(kind, context, allowed_ids, p)
        if isinstance(res.parsed, dict):
            spec = res.parsed
            break
        last_error = "Model response was not valid JSON"

    if spec is None:
        raise ValueError(f"{kind}: model could not produce valid JSON ({last_error})")

    if progress:
        progress("Verifying citations...", 82)
    valid_cites = set()
    dropped_cites = set()
    spec = _filter_spec_cites(spec, allowed_ids, valid_cites, dropped_cites)
    _maybe_attach_images(kind, spec, p, ctx=ctx, progress=progress)

    return spec, sorted(valid_cites), {"dropped": sorted(dropped_cites)}


def export_artifact(artifact: dict[str, Any], fmt: str) -> tuple[str, str, str]:
    """Return (filename, media_type, text_content) for an artifact export."""
    kind = artifact.get("kind", "artifact")
    spec = artifact.get("spec") or {}
    slug = "".join(c if c.isalnum() or c in "-_" else "-" for c in str(artifact.get("title") or kind).lower()).strip("-")[:48] or kind
    f = (fmt or "md").lower()

    if kind == "report" or f == "md":
        if kind == "report":
            return f"{slug}.md", "text/markdown; charset=utf-8", str(spec.get("markdown") or "")
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
    title = html_lib.escape(str(spec.get("title") or "Folio Deck"))
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


__all__ = ["list_generators", "register_generator", "get_generator", "run", "export_artifact"]
