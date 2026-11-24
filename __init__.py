"""SourceBook: Hermes Agent plugin half (register(ctx)).

Registers:
  - Auxiliary LLM task slots: sourcebook_chat, sourcebook_studio, sourcebook_ingest
  - Tools declared in plugin.yaml: sourcebook_search, sourcebook_list_notebooks, sourcebook_save_note, sourcebook_studio
  - Hook declared in plugin.yaml: pre_llm_call (active only on user-bound sessions)
  - Slash command /sourcebook (works across Desktop, CLI, TUI, Telegram, Discord, Slack)
  - Gateway RPC methods chat.ask and studio.run (bounded concurrency and profile-safe threads)
  - Agent skill sourcebook:research-notebook
"""

from __future__ import annotations

import contextvars
import json
import logging
import threading
import uuid
from pathlib import Path
from typing import Any, Optional

from .core import ground, ingest, runtime, store, studio

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
        chunks = store.search(nb, query, ids, k=12, per_source=4)
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
    extractive: bool = False,
    persist: bool = True,
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    nb_meta = store.get_notebook(nb)
    if progress:
        progress("Searching active sources...", 20)
    packed, allowed, used_ids, chunks, titles = context_for(nb, text, source_ids)
    eff_persona = persona or nb_meta.get("persona", "default")
    eff_length = length or nb_meta.get("length", "standard")
    eff_strict = bool(nb_meta.get("strict", False) if strict is None else strict)
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
            progress("Drafting grounded answer...", 55)
        llm = runtime.get_llm(ctx)
        call_kwargs: dict[str, Any] = {"messages": msgs, "purpose": "sourcebook.chat", "temperature": 0.15 if eff_strict else 0.25}
        if runtime.get_live_context() is not None:
            call_kwargs["task"] = "sourcebook_chat"
        try:
            res = llm.complete(**call_kwargs)
            answer, cites, grounding_info = ground.validate(res.text, allowed)
        except Exception:
            call_kwargs.pop("task", None)
            try:
                res = llm.complete(**call_kwargs)
                answer, cites, grounding_info = ground.validate(res.text, allowed)
            except Exception:
                ranked = store.search(nb, text, used_ids, k=10, per_source=4) or chunks[:10]
                answer, cites, grounding_info = ground.extractive_answer(text, ranked, titles, strict=eff_strict)

    if progress:
        progress("Verifying claims and citations...", 90)
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
        llm = runtime.get_llm(ctx)
        res = llm.complete_structured(
            instructions=(
                "Write a crisp 2 to 3 sentence Notebook Briefing overview of the sources, 3 to 6 short topic tags, "
                "and 3 sharp, specific questions the user should ask next."
            ),
            input=[{"type": "text", "text": packed}],
            json_schema=schema,
            schema_name="sourcebook.guide",
            purpose="sourcebook.guide",
            temperature=0.2,
        )
        guide = res.parsed if isinstance(res.parsed, dict) else _extractive_guide(chunks, titles)
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
    ctx: Any = None,
    progress: Any = None,
) -> dict[str, Any]:
    params = dict(params or {})
    if progress:
        progress(f"Gathering sources for {kind}...", 20)
    packed, allowed, used_ids, _, _ = context_for(nb, params.get("focus") or "key themes and facts", source_ids)
    spec, cites, grounding_info = studio.run(
        kind,
        packed,
        allowed,
        params,
        ctx=ctx,
        progress=progress,
    )
    store.record_chunk_hits(nb, cites, surface="studio")
    artifact = store.save_artifact(nb, kind, spec, params, source_ids=used_ids, grounding=grounding_info)
    runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
    return artifact


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
            "description": "List all SourceBook research notebooks with their IDs, titles, and source counts.",
            "parameters": {"type": "object", "properties": {}},
        },
        handler=lambda args, **kw: json.dumps(store.list_notebooks(), ensure_ascii=False),
    )

    ctx.register_tool(
        name="sourcebook_search",
        toolset="sourcebook",
        schema={
            "name": "sourcebook_search",
            "description": "Search a SourceBook notebook's enabled sources. Returns ranked chunks with IDs to cite using ::cite{nb=\"...\" chunk=\"...\"}.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "query": {"type": "string", "description": "Search query"},
                    "k": {"type": "integer", "default": 8, "minimum": 1, "maximum": 20},
                },
                "required": ["notebook", "query"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            store.search(args["notebook"], args["query"], k=int(args.get("k", 8))),
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
            "description": "Generate a Studio artifact (report, mindmap, flashcards, quiz, table, infographic, slides) from a SourceBook notebook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "notebook": {"type": "string", "description": "Notebook ID (nb_...)"},
                    "kind": {
                        "type": "string",
                        "enum": ["report", "mindmap", "flashcards", "quiz", "table", "infographic", "slides"],
                    },
                    "focus": {"type": "string", "description": "Topic or instructions to focus on"},
                    "template": {"type": "string", "description": "Optional report template (briefing, study_guide, faq, timeline, blog, exec_memo)"},
                    "count": {"type": "integer", "description": "Optional card, question, or slide count"},
                },
                "required": ["notebook", "kind"],
            },
        },
        handler=lambda args, **kw: json.dumps(
            make(
                args["notebook"],
                args["kind"],
                {k: args[k] for k in ("focus", "template", "count") if k in args and args[k] is not None},
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
                "  /sourcebook use <nb_id>        bind this chat to a notebook\n"
                "  /sourcebook unuse              unbind this chat\n"
                "  /sourcebook status             show active binding\n"
                "  /sourcebook add <nb_id> <url|text>\n"
                "  /sourcebook ask <nb_id> <question>\n"
                "  /sourcebook make <nb_id> <kind> [focus]"
            )
        sub = parts[0].lower()
        if sub == "list":
            nbs = store.list_notebooks()
            if not nbs:
                return "No SourceBook notebooks yet. Open SourceBook in Hermes Desktop to create one."
            return "\n".join(f"- `{n['id']}` **{n['title']}** ({n['source_count']} sources)" for n in nbs)
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
        if sub == "add" and len(parts) >= 3:
            nb_id, payload = parts[1].strip(), parts[2].strip()
            if payload.startswith(("http://", "https://")):
                src = ingest.ingest_url(nb_id, payload, ctx=ctx)
            else:
                src = store.add_source(nb_id, payload[:50], payload, kind="text")
            return f"Added source `{src['id']}` ({src['title']}, {src['chunk_count']} chunks)."
        if sub == "ask" and len(parts) >= 3:
            res = ask(parts[1].strip(), parts[2].strip(), ctx=ctx)
            return res["answer"]
        if sub == "make" and len(parts) >= 3:
            rest = parts[2].strip().split(maxsplit=1)
            kind = rest[0].lower()
            focus = rest[1] if len(rest) > 1 else ""
            art = make(parts[1].strip(), kind, {"focus": focus} if focus else {}, ctx=ctx)
            return f"Created {kind} artifact `{art['id']}` ({art['title']}). Open SourceBook to view."
        return "Invalid usage. Run `/sourcebook` with no arguments for help."

    ctx.register_command(
        "sourcebook",
        handle_command,
        description="Query, bind, or generate Studio artifacts from a SourceBook research notebook",
        args_hint="list | use <nb> | ask <nb> <question> | make <nb> <kind>",
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
                ctx=ctx,
            ),
        )
        _register_async_rpc(
            "studio.run",
            "studio.done",
            lambda p: make(p["nb"], p["kind"], p.get("params") or {}, source_ids=p.get("source_ids"), ctx=ctx),
        )

    skill_dir = Path(__file__).parent / "skills" / "research-notebook"
    if skill_dir.is_dir() and hasattr(ctx, "register_skill"):
        ctx.register_skill("research-notebook", skill_dir)
