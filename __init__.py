"""SourceBook: Hermes Agent plugin half (register(ctx)).

Registers:
  - Auxiliary LLM task slots: sourcebook_chat, sourcebook_studio, sourcebook_ingest, sourcebook_audio
  - Tools declared in plugin.yaml: sourcebook_search, sourcebook_list_notebooks, sourcebook_save_note, sourcebook_studio, sourcebook_analyze_data
  - Hook declared in plugin.yaml: pre_llm_call (active only on user-bound sessions)
  - Slash command /sourcebook (works across Desktop, CLI, TUI, Telegram, Discord, Slack)
  - Gateway RPC methods chat.ask and studio.run (bounded concurrency and profile-safe threads)
  - Agent skill sourcebook:research-notebook
"""

from __future__ import annotations

import contextvars
import json
import logging
import re
import threading
import uuid
from pathlib import Path
from typing import Any, Optional

from .core import analytics, audio, ground, ingest, runtime, store, studio

logger = logging.getLogger("sourcebook")

_RPC_SLOTS = threading.BoundedSemaphore(4)


def context_for(nb: str, query: str, source_ids: Optional[list[str]] = None) -> tuple[str, set[str], list[str], list[dict[str, Any]], dict[str, str]]:
    srcs = {s["id"]: s for s in store.list_sources(nb)}
    ids = source_ids if source_ids is not None else [sid for sid, s in srcs.items() if s.get("enabled")]
    if not ids:
        raise ValueError("No active sources in this notebook. Add or enable at least one source.")
    budget = int(runtime.get_config("context_budget_chars", 60000) or 60000)
    chunks = store.all_chunks(nb, ids)
    if sum(len(c["text"]) for c in chunks) > budget:
        chunks = store.search(nb, query, ids, k=16, per_source=5)
    titles = {sid: s["title"] for sid, s in srcs.items()}
    packed, allowed = ground.pack(chunks, titles, budget_chars=budget)
    return packed, allowed, ids, chunks, titles


def ask(
    nb: str,
    text: str,
    *,
    history: Optional[list[dict[str, Any]]] = None,
    source_ids: Optional[list[str]] = None,
    persona: Optional[str] = None,
    length: Optional[str] = None,
    strict: Optional[bool] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    extractive: bool = False,
    persist: bool = True,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    nb_meta = store.get_notebook(nb)
    if progress:
        progress("Searching active sources with hybrid retrieval...", 20)
    packed, allowed, used_ids, chunks, titles = context_for(nb, text, source_ids)
    eff_persona = persona or nb_meta.get("persona", "default")
    eff_length = length or nb_meta.get("length", "standard")
    eff_strict = bool(nb_meta.get("strict", False) if strict is None else strict)
    eff_provider = provider if provider is not None else (nb_meta.get("provider") or "")
    eff_model = model if model is not None else (nb_meta.get("model") or "")
    chunks_by_id = {str(c["id"]): c for c in chunks}

    answer: str
    cites: list[str]
    grounding_info: dict[str, Any]

    if extractive or not runtime.llm_available(ctx):
        if progress:
            progress("Synthesizing extractive answer...", 60)
        ranked = store.search(nb, text, used_ids, k=10, per_source=4) or chunks[:10]
        answer, cites, grounding_info = ground.extractive_answer(text, ranked, titles, strict=eff_strict)
    else:
        system_prompt = ground.build_system_prompt(eff_persona, eff_length, strict=eff_strict)
        msgs: list[dict[str, str]] = [
            {"role": "system", "content": f"{system_prompt}\n\n<sources>\n{packed}\n</sources>"}
        ]
        for h in (history or [])[-8:]:
            if h.get("role") in ("user", "assistant") and h.get("content"):
                msgs.append({"role": h["role"], "content": runtime.redact(str(h["content"]), force=True)})
        msgs.append({"role": "user", "content": runtime.redact(text, force=True)})

        if progress:
            target_lbl = eff_model or "active Hermes model"
            progress(f"Drafting grounded answer ({target_lbl})...", 55)
        try:
            raw_text, meta = runtime.complete_chat(
                msgs,
                purpose="sourcebook.chat",
                task="sourcebook_chat",
                provider=eff_provider or None,
                model=eff_model or None,
                temperature=0.15 if eff_strict else 0.25,
                ctx=ctx,
            )
            if progress:
                progress("Verifying claims and citations...", 82, partial_text=raw_text)
            answer, cites, grounding_info = ground.validate(raw_text, allowed)
            grounding_info.update({k: v for k, v in meta.items() if v})
        except runtime.ModelOverrideDeniedError:
            raise
        except Exception:
            ranked = store.search(nb, text, used_ids, k=10, per_source=4) or chunks[:10]
            answer, cites, grounding_info = ground.extractive_answer(text, ranked, titles, strict=eff_strict)

    if progress:
        progress("Verifying claims and citations...", 92, partial_text=answer)
    claims = ground.verify_claims(answer, chunks_by_id, titles)
    grounding_info["claims_supported"] = sum(1 for c in claims if c["verdict"] == "supported")
    grounding_info["claims_partial"] = sum(1 for c in claims if c["verdict"] == "partial")
    grounding_info["claims_unsupported"] = sum(1 for c in claims if c["verdict"] == "unsupported")
    store.record_chunk_hits(nb, cites, surface="chat")

    if persist:
        store.append_message(nb, "user", text)
        store.append_message(nb, "assistant", answer, citations=cites, grounding=grounding_info, claims=claims)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "messages"})

    return {
        "answer": answer,
        "citations": cites,
        "grounding": grounding_info,
        "claims": claims,
        "source_ids": used_ids,
    }


def _extractive_guide(chunks: list[dict[str, Any]], titles: dict[str, str]) -> dict[str, Any]:
    headings: list[str] = []
    sentences: list[str] = []
    for ch in chunks[:18]:
        hd = str(ch.get("heading") or "").strip()
        if hd and hd not in headings:
            headings.append(hd)
        for line in str(ch.get("text") or "").splitlines():
            clean = line.strip().lstrip("#-* ").strip()
            if len(clean) >= 45 and not clean.startswith("|") and not clean.startswith("<!--"):
                sentences.append(clean)
                break
    overview = " ".join(sentences[:2])[:360] or f"Contains {len(titles)} active source documents ready for cited search and Studio generation."
    topics = headings[:5] or list(titles.values())[:5]
    q1 = f"What are the primary findings across {topics[0]}?" if topics else "What are the key takeaways across these sources?"
    q2 = f"How do the sources compare metrics or tradeoffs in {topics[1] if len(topics) > 1 else 'these documents'}?"
    q3 = "Which claims have the strongest quantitative evidence, and what gaps remain?"
    return {
        "overview": overview,
        "topics": topics,
        "suggested_questions": [q1, q2, q3],
        "mode": "extractive",
    }


def build_guide(nb: str, *, ctx: Any = None, progress: Any = None) -> dict[str, Any]:
    nb_meta = store.get_notebook(nb)
    if progress:
        progress("Reading notebook sources...", 25)
    packed, _, _, chunks, titles = context_for(nb, "overview key themes main findings")
    if not runtime.llm_available(ctx):
        guide = _extractive_guide(chunks, titles)
        store.update_notebook(nb, guide=guide)
        return guide

    schema = {
        "type": "object",
        "properties": {
            "overview": {"type": "string"},
            "topics": {"type": "array", "items": {"type": "string"}},
            "suggested_questions": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["overview", "suggested_questions"],
    }
    if progress:
        progress("Synthesizing Notebook Briefing...", 65)
    try:
        parsed, _ = runtime.complete_json(
            instructions=(
                "Write a crisp 2 to 3 sentence Notebook Briefing overview of the sources, 3 to 6 short topic tags, "
                "and 3 sharp, specific questions the user should ask next."
            ),
            input_blocks=[{"type": "text", "text": packed}],
            json_schema=schema,
            schema_name="sourcebook.guide",
            purpose="sourcebook.guide",
            task="sourcebook_ingest",
            provider=nb_meta.get("provider") or None,
            model=nb_meta.get("model") or None,
            temperature=0.2,
            ctx=ctx,
        )
        guide = parsed if isinstance(parsed, dict) else _extractive_guide(chunks, titles)
    except runtime.ModelOverrideDeniedError:
        raise
    except Exception:
        guide = _extractive_guide(chunks, titles)
    store.update_notebook(nb, guide=guide)
    return guide


def make(
    nb: str,
    kind: str,
    params: Optional[dict[str, Any]] = None,
    *,
    source_ids: Optional[list[str]] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    nb_meta = store.get_notebook(nb)
    params = dict(params or {})
    eff_provider = provider if provider is not None else (nb_meta.get("provider") or "")
    eff_model = model if model is not None else (nb_meta.get("model") or "")
    eff_source_ids = source_ids if source_ids is not None else params.get("source_ids")
    if progress:
        progress(f"Gathering sources for {kind}...", 20)
    packed, allowed, used_ids, _, _ = context_for(nb, params.get("instructions") or params.get("focus") or "key themes and facts", eff_source_ids)
    spec, cites, grounding_info = studio.run(
        kind,
        packed,
        allowed,
        params,
        provider=eff_provider or None,
        model=eff_model or None,
        ctx=ctx,
        progress=progress,
    )
    media_files = grounding_info.pop("_media_files", None)

    audio_bytes: Optional[bytes] = None
    if kind == "audio" and not params.get("skip_audio") and isinstance(spec.get("turns"), list):
        if progress:
            progress("Synthesizing 2-host podcast audio...", 88)
        audio_bytes = audio.synthesize_dialogue_mp3(spec["turns"], language=str(params.get("language") or "English"), ctx=ctx)

    store.record_chunk_hits(nb, cites, surface="studio")
    artifact = store.save_artifact(
        nb,
        kind,
        spec,
        params,
        source_ids=used_ids,
        grounding=grounding_info,
        audio_bytes=audio_bytes,
        media_files=media_files,
    )
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return artifact


def outline_slides(
    nb: str,
    params: Optional[dict[str, Any]] = None,
    *,
    source_ids: Optional[list[str]] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
) -> dict[str, Any]:
    nb_meta = store.get_notebook(nb)
    params = dict(params or {})
    eff_provider = provider if provider is not None else (nb_meta.get("provider") or "")
    eff_model = model if model is not None else (nb_meta.get("model") or "")
    eff_source_ids = source_ids if source_ids is not None else params.get("source_ids")
    packed, allowed, used_ids, _, _ = context_for(nb, params.get("instructions") or params.get("focus") or "key themes and facts", eff_source_ids)
    res = studio.outline_slides(
        packed,
        allowed,
        params,
        provider=eff_provider or None,
        model=eff_model or None,
        ctx=ctx,
    )
    res["source_ids"] = used_ids
    return res


def revise_artifact(
    nb: str,
    aid: str,
    revision_prompt: str,
    params_patch: Optional[dict[str, Any]] = None,
    *,
    source_ids: Optional[list[str]] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    existing = store.get_artifact(nb, aid)
    if not existing:
        raise FileNotFoundError(f"artifact {aid!r} not found")
    kind = existing.get("kind", "slides")
    nb_meta = store.get_notebook(nb)
    merged_params = dict(existing.get("params") or {})
    if params_patch:
        merged_params.update(params_patch)
    merged_params["revision_prompt"] = revision_prompt.strip()
    merged_params["previous_spec"] = existing.get("spec") or {}
    eff_source_ids = source_ids if source_ids is not None else (merged_params.get("source_ids") or existing.get("source_ids") or None)
    eff_provider = provider if provider is not None else (nb_meta.get("provider") or "")
    eff_model = model if model is not None else (nb_meta.get("model") or "")
    if progress:
        progress("Revising slide deck from sources...", 25)
    packed, allowed, used_ids, _, _ = context_for(nb, revision_prompt or merged_params.get("focus") or existing.get("title") or "key themes", eff_source_ids)
    spec, cites, grounding_info = studio.run(
        kind,
        packed,
        allowed,
        merged_params,
        provider=eff_provider or None,
        model=eff_model or None,
        ctx=ctx,
        progress=progress,
    )
    media_files = grounding_info.pop("_media_files", None)
    # Strip transient previous_spec from saved params so artifact.json stays compact
    merged_params.pop("previous_spec", None)
    store.record_chunk_hits(nb, cites, surface="studio")
    updated = store.update_artifact(
        nb,
        aid,
        spec=spec,
        params=merged_params,
        source_ids=used_ids,
        grounding=grounding_info,
        media_files=media_files,
    )
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return updated


def update_slide(
    nb: str,
    aid: str,
    slide_index: int,
    patch: dict[str, Any],
) -> dict[str, Any]:
    """Inline edit, reorder, add, or delete an individual slide without regenerating the deck."""
    existing = store.get_artifact(nb, aid)
    if not existing or existing.get("kind") != "slides":
        raise FileNotFoundError(f"slide deck {aid!r} not found")
    spec = dict(existing.get("spec") or {})
    slides = [dict(s) for s in (spec.get("slides") or [])]

    action = str((patch or {}).get("action") or "edit").lower()
    if action == "add":
        insert_at = max(0, min(len(slides), int(slide_index) + 1))
        new_slide = {
            "id": f"sl_{uuid.uuid4().hex[:6]}",
            "layout": str(patch.get("layout") or "two-col"),
            "title": str(patch.get("title") or "New key takeaway from sources").strip()[:180],
            "body": str(patch.get("body") or "").strip(),
            "bullets": [str(b).strip() for b in (patch.get("bullets") or ["Supporting evidence point"]) if str(b).strip()][:6],
            "notes": str(patch.get("notes") or "").strip(),
            "cites": list(patch.get("cites") or []),
            "image_mode": "none",
        }
        slides.insert(insert_at, new_slide)
        spec["slides"] = slides
        updated = store.update_artifact(nb, aid, spec=spec)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
        return {"artifact": updated, "active_index": insert_at}

    if slide_index < 0 or slide_index >= len(slides):
        raise ValueError(f"Slide index {slide_index} out of range")

    if action == "delete":
        if len(slides) <= 1:
            raise ValueError("Cannot delete the last remaining slide in a deck")
        slides.pop(slide_index)
        spec["slides"] = slides
        updated = store.update_artifact(nb, aid, spec=spec)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
        return {"artifact": updated, "active_index": max(0, min(len(slides) - 1, slide_index))}

    if action == "move":
        delta = -1 if int(patch.get("delta") or 0) < 0 else 1
        target = slide_index + delta
        if 0 <= target < len(slides):
            slides[slide_index], slides[target] = slides[target], slides[slide_index]
            spec["slides"] = slides
            updated = store.update_artifact(nb, aid, spec=spec)
            runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
            return {"artifact": updated, "active_index": target}
        return {"artifact": existing, "active_index": slide_index}

    sl = slides[slide_index]
    for field in ("title", "body", "notes", "layout", "image_prompt", "image_mode"):
        if field in patch and patch[field] is not None:
            sl[field] = str(patch[field]).strip()
    if "bullets" in patch and isinstance(patch["bullets"], list):
        sl["bullets"] = [str(b).strip() for b in patch["bullets"] if str(b).strip()][:8]
    if "stat" in patch:
        if patch["stat"] is None:
            sl.pop("stat", None)
        elif isinstance(patch["stat"], dict):
            sl["stat"] = {
                "value": str(patch["stat"].get("value") or "").strip()[:40],
                "label": str(patch["stat"].get("label") or "").strip()[:120],
            }
    if patch.get("clear_image") or sl.get("image_mode") == "none":
        sl.pop("image_file", None)
        sl.pop("image_url", None)
        if sl.get("layout") == "image-full":
            sl["layout"] = "two-col"
    elif sl.get("image_mode") == "hybrid" and sl.get("layout") == "image-full":
        sl["layout"] = "two-col"
    elif sl.get("image_mode") == "full_slide" and (sl.get("image_file") or sl.get("image_url")):
        sl["layout"] = "image-full"

    slides[slide_index] = sl
    spec["slides"] = slides
    updated = store.update_artifact(nb, aid, spec=spec)
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return {"artifact": updated, "active_index": slide_index}


def regenerate_slide_visual(
    nb: str,
    aid: str,
    slide_index: int,
    *,
    prompt: Optional[str] = None,
    image_mode: Optional[str] = None,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    """Regenerate artwork for one individual slide via the user's configured Hermes ImageGen provider."""
    existing = store.get_artifact(nb, aid)
    if not existing or existing.get("kind") != "slides":
        raise FileNotFoundError(f"slide deck {aid!r} not found")
    spec = dict(existing.get("spec") or {})
    new_spec, media_files = studio.generate_single_slide_visual(
        spec,
        slide_index,
        prompt_override=prompt,
        image_mode=image_mode,
        ctx=ctx,
        progress=progress,
    )
    grounding = dict(existing.get("grounding") or {})
    grounding.pop("image_notice", None)
    grounding["images_generated"] = sum(
        1 for s in (new_spec.get("slides") or []) if s.get("image_file") or s.get("image_url")
    )
    updated = store.update_artifact(
        nb,
        aid,
        spec=new_spec,
        grounding=grounding,
        media_files=media_files,
    )
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return {"artifact": updated, "slide_index": slide_index}


def audio_followup(
    nb: str,
    aid: str,
    question: str,
    *,
    current_turn_idx: Optional[int] = None,
    ctx: Any = None,
) -> dict[str, Any]:
    """Spoken 'Join the Podcast' interrupt on an Audio Overview: cited 2-host Alex & Maya exchange + synthesized audio clip."""
    import base64

    art = store.get_artifact(nb, aid)
    if not art or art.get("kind") != "audio":
        raise FileNotFoundError(f"audio overview {aid!r} not found")
    q = (question or "").strip()
    if not q:
        raise ValueError("Follow-up question cannot be empty")

    nb_meta = store.get_notebook(nb)
    spec = dict(art.get("spec") or {})
    turns = list(spec.get("turns") or [])
    language = str((art.get("params") or {}).get("language") or "English")

    # Gather context around where the listener paused + grounded source passages
    recent_slice = turns[max(0, (current_turn_idx or len(turns)) - 3) : (current_turn_idx + 1 if current_turn_idx is not None else len(turns))]
    recent_context = "\n".join(f"{t.get('speaker', 'Host')}: {t.get('text', '')}" for t in recent_slice[-4:])

    host_turns: list[dict[str, Any]] = []
    cites: list[str] = []
    if runtime.llm_available(ctx):
        try:
            packed, allowed, _, _, _ = context_for(nb, q, art.get("source_ids") or None)
            schema = {
                "type": "object",
                "properties": {
                    "alex": {"type": "string"},
                    "maya": {"type": "string"},
                    "cites": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["alex", "maya", "cites"],
            }
            parsed, _ = runtime.complete_json(
                instructions=(
                    "You are Alex and Maya, two engaging podcast hosts recording a live Audio Overview. "
                    "A listener just interrupted the episode to ask a question. "
                    "Write a natural, concise spoken 2-turn exchange answering STRICTLY from the provided <sources>:\n"
                    "- 'alex': 2 to 3 crisp spoken sentences answering the listener directly with concrete facts (no markdown, no stage directions).\n"
                    "- 'maya': 1 to 2 warm spoken sentences adding a key nuance or practical takeaway and bridging back into the episode.\n"
                    "- 'cites': exact valid chunk IDs from <sources> supporting the answer.\n"
                    f"Language: {language}."
                ),
                input_blocks=[{
                    "type": "text",
                    "text": f"Recent episode dialogue:\n{recent_context or '(start of episode)'}\n\nListener question: {q}\n\n<sources>\n{packed}\n</sources>",
                }],
                json_schema=schema,
                schema_name="sourcebook.audio_interrupt",
                purpose="sourcebook.audio.interrupt",
                task="sourcebook_audio",
                provider=nb_meta.get("provider") or None,
                model=nb_meta.get("model") or None,
                temperature=0.3,
                ctx=ctx,
            )
            alex_txt = ground.CITE_RE.sub("", str(parsed.get("alex") or "")).strip()
            maya_txt = ground.CITE_RE.sub("", str(parsed.get("maya") or "")).strip()
            valid_cites = [str(c).strip() for c in (parsed.get("cites") or []) if str(c).strip() in allowed]
            if alex_txt:
                cites = valid_cites[:5]
                host_turns.append({"speaker": "Alex", "text": alex_txt[:420], "cites": cites[:3]})
                if maya_txt:
                    host_turns.append({"speaker": "Maya", "text": maya_txt[:320], "cites": cites[1:4] or cites[:2]})
        except Exception as exc:
            logger.debug("audio_followup LLM 2-host interrupt fallback: %s", exc)

    if not host_turns:
        res = ask(nb, q, persona="default", length="short", persist=False, ctx=ctx)
        clean_ans = ground.CITE_RE.sub("", res["answer"]).strip()
        cites = list(res.get("citations") or [])
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", clean_ans) if s.strip()]
        alex_part = " ".join(sentences[:2]) if sentences else clean_ans[:340]
        maya_part = (
            " ".join(sentences[2:4])
            if len(sentences) > 2
            else "That links directly back to the cited passages in your notebook — let's jump right back into the episode."
        )
        host_turns = [
            {"speaker": "Alex", "text": f"Great question. {alex_part[:380]}", "cites": cites[:3]},
            {"speaker": "Maya", "text": maya_part[:300], "cites": cites[1:4] or cites[:2]},
        ]

    # Synthesize real spoken reply MP3 via 3-tier TTS waterfall (Hermes TTS -> free Edge Neural TTS -> browser fallback)
    reply_mp3, tts_engine = audio.synthesize_dialogue_with_engine(host_turns, language=language, ctx=ctx)
    audio_fname = ""
    audio_b64 = ""
    media_files: Optional[dict[str, bytes]] = None
    if reply_mp3:
        audio_fname = f"followup_{uuid.uuid4().hex[:8]}.mp3"
        media_files = {audio_fname: reply_mp3}
        audio_b64 = base64.b64encode(reply_mp3).decode("ascii")

    base_idx = len(turns) + 1
    new_turns: list[dict[str, Any]] = [
        {"id": f"t_{base_idx}", "speaker": "Listener", "text": q, "cites": [], "interrupt": True}
    ]
    for offset, ht in enumerate(host_turns, start=1):
        entry: dict[str, Any] = {
            "id": f"t_{base_idx + offset}",
            "speaker": ht["speaker"],
            "text": ht["text"],
            "cites": ht.get("cites") or [],
            "interrupt": True,
        }
        if offset == 1 and audio_fname:
            entry["audio_file"] = audio_fname
        new_turns.append(entry)

    turns.extend(new_turns)
    spec["turns"] = turns
    updated = store.update_artifact(nb, aid, spec=spec, media_files=media_files)
    store.record_chunk_hits(nb, cites, surface="studio")
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return {
        "artifact": updated,
        "added_turns": new_turns,
        "audio_file": audio_fname,
        "audio_b64": audio_b64,
        "audio_mime": "audio/mpeg" if audio_b64 else "",
        "tts_engine": tts_engine,
    }


def deep_research(
    nb: str,
    topic: str,
    *,
    depth: str = "standard",
    auto_brief: bool = True,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    """Run multi-query Deep Research auto-ingest into a notebook, then optionally synthesize a cited Research Briefing."""
    nb_meta = store.get_notebook(nb)
    eff_provider = provider if provider is not None else (nb_meta.get("provider") or "")
    eff_model = model if model is not None else (nb_meta.get("model") or "")
    res = ingest.deep_research_ingest(
        nb,
        topic,
        depth=depth,
        provider=eff_provider or None,
        model=eff_model or None,
        ctx=ctx,
        progress=progress,
    )

    artifact = None
    if auto_brief and res["ingested"]:
        if progress:
            progress(f"Synthesizing cited Deep Research Briefing across {len(res['ingested'])} new sources...", 88)
        try:
            new_ids = [item["id"] for item in res["ingested"]]
            artifact = make(
                nb,
                "report",
                {"template": "briefing", "focus": f"Deep Research Briefing: {res['topic']}"},
                source_ids=new_ids,
                provider=eff_provider or None,
                model=eff_model or None,
                ctx=ctx,
            )
        except Exception as exc:
            logger.debug("Deep Research auto-brief skipped: %s", exc)
        try:
            build_guide(nb, ctx=ctx)
        except Exception:
            pass

    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
    return {**res, "artifact": artifact}


def save_to_memory(
    nb: str,
    content: str,
    *,
    title: str = "",
    citations: Optional[list[str]] = None,
    target: str = "memory",
    ctx: Any = None,
) -> dict[str, Any]:
    """Promote a verified SourceBook finding into Hermes's persistent curated memory with source attribution."""
    nb_meta = store.get_notebook(nb)
    clean_body = ground.CITE_RE.sub("", (content or "")).strip()
    clean_body = " ".join(clean_body.split())
    if not clean_body:
        raise ValueError("Cannot save empty text to Hermes Memory")

    src_titles: list[str] = []
    if citations:
        src_map = {s["id"]: s["title"] for s in store.list_sources(nb)}
        for cid in citations:
            sid = str(cid).split(":", 1)[0]
            st = src_map.get(sid)
            if st and st not in src_titles:
                src_titles.append(st)

    prefix = f"[SourceBook · {nb_meta['title']}] "
    if title and title.strip() and not clean_body.lower().startswith(title.strip().lower()[:24]):
        body = f"{title.strip()}: {clean_body}"
    else:
        body = clean_body
    suffix = f" (Sources: {', '.join(src_titles[:3])})" if src_titles else ""
    max_body = max(80, 400 - len(prefix) - len(suffix))
    entry = f"{prefix}{body[:max_body]}{suffix}"
    return runtime.save_to_hermes_memory(entry, target=target, ctx=ctx)


def _extract_user_text(user_message: Any) -> str:
    if isinstance(user_message, str):
        return user_message
    if isinstance(user_message, list):
        return " ".join(str(b.get("text", "")) for b in user_message if isinstance(b, dict) and b.get("type") == "text")
    return ""


def register(ctx: Any) -> None:
    runtime.set_live_context(ctx)
    if hasattr(ctx, "on_unload"):
        ctx.on_unload(runtime.clear_live_context)

    if hasattr(ctx, "register_auxiliary_task"):
        ctx.register_auxiliary_task(
            "sourcebook_chat",
            display_name="SourceBook Chat",
            description="Grounded Q&A against SourceBook notebook sources.",
        )
        ctx.register_auxiliary_task(
            "sourcebook_studio",
            display_name="SourceBook Studio",
            description="Structured generation for Reports, Mind Maps, Flashcards, Quizzes, Tables, Infographics, and Slide Decks.",
        )
        ctx.register_auxiliary_task(
            "sourcebook_audio",
            display_name="SourceBook Audio Overview",
            description="Two-host podcast scripting for SourceBook Audio Overviews.",
            inherit_from="sourcebook_studio",
        )
        ctx.register_auxiliary_task(
            "sourcebook_ingest",
            display_name="SourceBook Ingest",
            description="Fast source summaries, topic tags, and claim extraction.",
            inherit_from="compression",
        )

    ctx.register_tool(
        name="sourcebook_list_notebooks",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_list_notebooks",
            "description": "List all SourceBook research notebooks with their IDs, titles, models, and source counts.",
            "parameters": {"type": "object", "properties": {}},
        },
        handler=lambda args, **kw: json.dumps(store.list_notebooks(), ensure_ascii=False),
    )

    ctx.register_tool(
        name="sourcebook_search",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_search",
            "description": "Hybrid semantic + BM25 search across a SourceBook notebook's enabled sources (or pass notebook='all' to search across EVERY notebook). Returns ranked chunks with IDs to cite using ::cite{nb=\"...\" chunk=\"...\"}.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...) or 'all' for cross-notebook search"},
                    "query": {"type": "string", "description": "Search query"},
                    "k": {"type": "integer", "default": 8, "minimum": 1, "maximum": 24},
                },
                "required": ["notebook", "query"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            store.search_all_notebooks(args["query"], limit=int(args.get("k", 12)))
            if str(args.get("notebook", "")).strip().lower() in ("all", "*", "")
            else store.search(args["notebook"], args["query"], k=int(args.get("k", 8))),
            ensure_ascii=False,
        ),
    )

    ctx.register_tool(
        name="sourcebook_save_note",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_save_note",
            "description": "Save a Markdown research note inside a SourceBook notebook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "title": {"type": "string", "description": "Note title"},
                    "markdown": {"type": "string", "description": "Note body in Markdown"},
                    "citations": {"type": "array", "items": {"type": "string"}, "description": "Optional cited chunk IDs"},
                },
                "required": ["notebook", "title", "markdown"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            store.create_note(
                args["notebook"],
                args["title"],
                args["markdown"],
                from_chat=True,
                citations=args.get("citations") or [],
            ),
            ensure_ascii=False,
        ),
    )

    ctx.register_tool(
        name="sourcebook_studio",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_studio",
            "description": "Generate a Studio artifact (report, audio, mindmap, flashcards, quiz, table, infographic, slides) from a SourceBook notebook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "kind": {
                        "type": "string",
                        "enum": ["report", "audio", "mindmap", "flashcards", "quiz", "table", "infographic", "slides"],
                    },
                    "focus": {"type": "string", "description": "Topic or instructions to focus on"},
                    "template": {"type": "string", "description": "Optional report template (briefing, study_guide, faq, timeline, blog, exec_memo)"},
                    "style": {"type": "string", "description": "Optional Audio Overview style (deep_dive, debate, brief, critique)"},
                    "count": {"type": "integer", "description": "Optional card, question, turn, or slide count"},
                    "language": {"type": "string", "description": "Output language (default English)"},
                },
                "required": ["notebook", "kind"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            make(
                args["notebook"],
                args["kind"],
                {k: args[k] for k in ("focus", "template", "style", "count", "language") if k in args and args[k] is not None},
                ctx=ctx,
            ),
            ensure_ascii=False,
        ),
    )

    ctx.register_tool(
        name="sourcebook_analyze_data",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_analyze_data",
            "description": "Run exact statistical profiling (count, min, max, mean, median, p95, sum, chart series) on a CSV, TSV, JSON, or tabular source in a SourceBook notebook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "source": {"type": "string", "description": "Source ID (s_...)"},
                    "metric_col": {"type": "string", "description": "Optional numeric column to chart"},
                    "label_col": {"type": "string", "description": "Optional category/label column"},
                },
                "required": ["notebook", "source"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            analytics.analyze_source(
                args["notebook"],
                args["source"],
                metric_col=args.get("metric_col"),
                label_col=args.get("label_col"),
            ),
            ensure_ascii=False,
        ),
    )

    ctx.register_tool(
        name="sourcebook_deep_research",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_deep_research",
            "description": "Run multi-query Deep Research on a topic: expands complementary web queries, discovers and deduplicates sources, ingests them into a SourceBook notebook, and generates a cited Research Briefing.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "topic": {"type": "string", "description": "Research topic or question"},
                    "depth": {"type": "string", "enum": ["quick", "standard", "deep"], "default": "standard"},
                    "auto_brief": {"type": "boolean", "default": True},
                },
                "required": ["notebook", "topic"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            deep_research(
                args["notebook"],
                args["topic"],
                depth=str(args.get("depth") or "standard"),
                auto_brief=bool(args.get("auto_brief", True)),
                ctx=ctx,
            ),
            ensure_ascii=False,
        ),
    )

    def on_pre_llm_call(session_id: str = "", user_message: Any = "", **kwargs: Any) -> Optional[dict[str, str]]:
        binding = store.get_session_binding(session_id)
        if not binding:
            return None
        nb_id = binding["nb_id"]
        query = _extract_user_text(user_message).strip()
        if not query or query.startswith("/sourcebook"):
            return None
        srcs = {s["id"]: s for s in store.list_sources(nb_id) if s.get("enabled")}
        if not srcs:
            return None
        chunks = store.search(nb_id, query, source_ids=list(srcs.keys()), k=6, per_source=3)
        if not chunks:
            return None
        titles = {sid: s["title"] for sid, s in srcs.items()}
        packed, _ = ground.pack(chunks, titles, budget_chars=7500)
        return {
            "context": (
                f"[SourceBook Notebook Bound: {nb_id}]\n"
                "Ground your answer in the retrieved excerpts below. "
                "When citing a passage in Hermes Desktop, add a standalone citation directive paragraph at the end "
                f'like ::cite{{nb="{nb_id}" chunk="<chunk_id>"}}.\n\n'
                f"<sources>\n{packed}\n</sources>"
            )
        }

    ctx.register_hook("pre_llm_call", on_pre_llm_call)

    def handle_command(raw_args: str, **kw: Any) -> str:
        session_id = kw.get("session_id") or ""
        parts = raw_args.strip().split(maxsplit=2)
        if not parts:
            return (
                "SourceBook commands:\n"
                "  /sourcebook list\n"
                "  /sourcebook use <nb_id>                 bind this chat to a notebook\n"
                "  /sourcebook unuse                       unbind this chat\n"
                "  /sourcebook status                      show active binding\n"
                "  /sourcebook model <nb_id> <prov/model|auto>  pin a Hermes model to a notebook\n"
                "  /sourcebook add <nb_id> <url|text>\n"
                "  /sourcebook sync <nb_id> <local_path>   ingest/sync a local file or folder\n"
                "  /sourcebook ask <nb_id> <question>\n"
                "  /sourcebook make <nb_id> <kind> [focus]"
            )
        sub = parts[0].lower()
        if sub == "list":
            nbs = store.list_notebooks()
            if not nbs:
                return "No SourceBook notebooks yet. Open SourceBook in Hermes Desktop to create one."
            return "\n".join(
                f"- `{n['id']}` **{n['title']}** ({n['source_count']} sources{', model: ' + n['model'] if n.get('model') else ''})"
                for n in nbs
            )
        if sub == "status":
            b = store.get_session_binding(session_id)
            if not b:
                return "This session is not bound to any SourceBook notebook. Use `/sourcebook use <nb_id>`."
            meta = store.get_notebook(b["nb_id"])
            return f"Bound to `{meta['id']}` **{meta['title']}**."
        if sub == "unuse":
            return "Unbound SourceBook notebook from this session." if store.unbind_session(session_id) else "No active binding."
        if sub == "use" and len(parts) >= 2:
            nb_id = parts[1].strip()
            if not session_id:
                return f"Cannot bind without a session id. Use `/sourcebook ask {nb_id} <question>` directly."
            store.bind_session(session_id, nb_id)
            meta = store.get_notebook(nb_id)
            return f"Bound this session to `{meta['id']}` **{meta['title']}**."
        if sub == "model" and len(parts) >= 3:
            nb_id, spec_str = parts[1].strip(), parts[2].strip()
            if spec_str.lower() in ("auto", "default", "none", "clear"):
                store.update_notebook(nb_id, provider="", model="")
                return f"Reset notebook `{nb_id}` to use your active Hermes model."
            if "/" in spec_str and ":" not in spec_str.split("/", 1)[0]:
                prov, mod = spec_str.split("/", 1)
                store.update_notebook(nb_id, provider=prov.strip(), model=mod.strip())
                return f"Pinned notebook `{nb_id}` to `{prov.strip()} / {mod.strip()}`."
            store.update_notebook(nb_id, model=spec_str)
            return f"Pinned notebook `{nb_id}` to model `{spec_str}`."
        if sub == "add" and len(parts) >= 3:
            nb_id, payload = parts[1].strip(), parts[2].strip()
            if payload.startswith(("http://", "https://")):
                src = ingest.ingest_url(nb_id, payload, ctx=ctx)
            else:
                src = store.add_source(nb_id, payload[:50], payload, kind="text")
            return f"Added source `{src['id']}` ({src['title']}, {src['chunk_count']} chunks)."
        if sub == "sync" and len(parts) >= 3:
            nb_id, lpath = parts[1].strip(), parts[2].strip()
            res = ingest.ingest_local_path(nb_id, lpath, ctx=ctx)
            return f"Synced {len(res['added'])} source(s) from `{res['root']}`."
        if sub == "ask" and len(parts) >= 3:
            res = ask(parts[1].strip(), parts[2].strip(), ctx=ctx)
            return res["answer"]
        if sub == "make" and len(parts) >= 3:
            rest = parts[2].strip().split(maxsplit=1)
            kind = rest[0].lower()
            focus = rest[1] if len(rest) > 1 else ""
            art = make(parts[1].strip(), kind, {"focus": focus} if focus else {}, ctx=ctx)
            return f"Created {kind} artifact `{art['id']}` ({art['title']}). Open SourceBook to view."
        if sub == "research" and len(parts) >= 3:
            res = deep_research(parts[1].strip(), parts[2].strip(), depth="standard", auto_brief=True, ctx=ctx)
            brief_note = f" and synthesized briefing `{res['artifact']['id']}`" if res.get("artifact") else ""
            return f"Deep Research ingested {len(res['ingested'])} source(s) across {len(res['queries'])} queries{brief_note}."
        return "Invalid usage. Run `/sourcebook` with no arguments for help."

    ctx.register_command(
        "sourcebook",
        handle_command,
        description="Query, bind, sync, select model, or generate Studio artifacts from a SourceBook research notebook",
        args_hint="list | use <nb> | model <nb> <model> | sync <nb> <path> | ask <nb> <q> | make <nb> <kind>",
    )

    if hasattr(ctx, "register_rpc"):
        def _register_async_rpc(method_name: str, done_event: str, worker_fn: Any) -> None:
            def rpc_handler(params: dict[str, Any], *, session_id: Optional[str] = None, **kwargs: Any) -> dict[str, Any]:
                if not _RPC_SLOTS.acquire(blocking=False):
                    raise RuntimeError(f"sourcebook.{method_name} is busy: wait for an in-flight job to complete")
                job_id = uuid.uuid4().hex[:12]

                def run_bg() -> None:
                    try:
                        result = worker_fn(params)
                        payload = {"job": job_id, "ok": True, "result": result}
                    except Exception as exc:
                        payload = {"job": job_id, "ok": False, "error": str(exc)}
                    finally:
                        _RPC_SLOTS.release()
                    if session_id and hasattr(ctx, "emit_to_session"):
                        ctx.emit_to_session(session_id, done_event, payload)
                    else:
                        runtime.broadcast_event(done_event, payload)

                try:
                    threading.Thread(target=contextvars.copy_context().run, args=(run_bg,), daemon=True).start()
                except Exception:
                    _RPC_SLOTS.release()
                    raise
                return {"job": job_id}

            ctx.register_rpc(method_name, rpc_handler)

        _register_async_rpc(
            "chat.ask",
            "chat.done",
            lambda p: ask(
                p["nb"],
                p["text"],
                history=p.get("history") or [],
                source_ids=p.get("source_ids"),
                provider=p.get("provider"),
                model=p.get("model"),
                ctx=ctx,
            ),
        )
        _register_async_rpc(
            "studio.run",
            "studio.done",
            lambda p: make(
                p["nb"],
                p["kind"],
                p.get("params") or {},
                source_ids=p.get("source_ids"),
                provider=p.get("provider"),
                model=p.get("model"),
                ctx=ctx,
            ),
        )

    skill_dir = Path(__file__).parent / "skills" / "research-notebook"
    if skill_dir.is_dir() and hasattr(ctx, "register_skill"):
        ctx.register_skill("research-notebook", skill_dir)
