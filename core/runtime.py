"""Public-API bridge to Hermes services (universal LLM routing, model discovery, tools, events, redaction).

Works identically when called from:
  1. `__init__.py` (`register(ctx)`) in-process or in `plugins.isolation: host`
  2. `dashboard/plugin_api.py` (loaded independently by Hermes's web server)
  3. Standalone `pytest` runs (graceful degradation when Hermes is absent)

Imports ONLY documented modules from Hermes's published plugin API (`hermes_cli/data/plugin_api.json`).
"""

from __future__ import annotations

import json
import logging
import re
import threading
from typing import Any, Optional

logger = logging.getLogger("sourcebook.runtime")

PLUGIN_ID = "sourcebook"

_LOCK = threading.Lock()
_LIVE_CTX: Any = None
_FALLBACK_LLM: Any = None

_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)```", re.IGNORECASE)
_TEMP_ERROR_MARKERS = ("temperature", "unsupported parameter", "unsupported_value", "reasoning")


class ModelOverrideDeniedError(PermissionError):
    """Raised when a notebook explicitly requests a provider/model override not yet allowed in Hermes config."""


def set_live_context(ctx: Any) -> None:
    """Record the active PluginContext from `register(ctx)` (cleared on unload)."""
    global _LIVE_CTX
    with _LOCK:
        _LIVE_CTX = ctx


def clear_live_context() -> None:
    global _LIVE_CTX
    with _LOCK:
        _LIVE_CTX = None


def get_live_context() -> Any:
    with _LOCK:
        return _LIVE_CTX


def _load_hermes_config() -> dict[str, Any]:
    try:
        from hermes_cli.config import load_config_readonly

        cfg = load_config_readonly()
        return cfg if isinstance(cfg, dict) else {}
    except Exception:
        return {}


def get_config(key: str, default: Any = None) -> Any:
    ctx = get_live_context()
    if ctx is not None and hasattr(ctx, "get_config"):
        try:
            return ctx.get_config(key, default)
        except Exception:
            pass
    cfg = _load_hermes_config()
    entry = ((cfg.get("plugins") or {}).get("entries") or {}).get(PLUGIN_ID) or {}
    settings = entry.get("settings") or entry.get("config") or {}
    if isinstance(settings, dict) and key in settings:
        return settings[key]
    return default


def get_llm_trust_policy() -> dict[str, Any]:
    """Read `plugins.entries.sourcebook` capability grants and legacy `llm.*` flags from Hermes config."""
    cfg = _load_hermes_config()
    entry = ((cfg.get("plugins") or {}).get("entries") or {}).get(PLUGIN_ID) or {}
    llm_cfg = entry.get("llm") if isinstance(entry, dict) else None
    if not isinstance(llm_cfg, dict):
        llm_cfg = {}
    raw_caps = entry.get("granted_capabilities") if isinstance(entry, dict) else None
    granted = set(raw_caps) if isinstance(raw_caps, list) else set()
    return {
        "allow_model_override": bool(llm_cfg.get("allow_model_override", False) or "llm.model_override" in granted),
        "allow_provider_override": bool(llm_cfg.get("allow_provider_override", False) or "llm.provider_override" in granted),
        "allow_task_override": bool(llm_cfg.get("allow_task_override", False) or "llm.task_override" in granted),
        "allowed_models": llm_cfg.get("allowed_models"),
        "allowed_providers": llm_cfg.get("allowed_providers"),
    }


def list_available_models() -> dict[str, Any]:
    """Discover the user's active Hermes model, fallback/custom providers, auxiliary routes, and configured models."""
    cfg = _load_hermes_config()
    model_cfg = cfg.get("model")
    if isinstance(model_cfg, dict):
        active_model = str(model_cfg.get("default") or model_cfg.get("name") or "").strip()
        active_provider = str(model_cfg.get("provider") or "").strip()
    else:
        active_model = str(model_cfg or "").strip()
        active_provider = ""

    options: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    def add_opt(provider: str, model: str, label: str = "", source: str = "config") -> None:
        p = (provider or "").strip()
        m = (model or "").strip()
        if not m:
            return
        key = (p.lower(), m.lower())
        if key in seen:
            return
        seen.add(key)
        options.append({
            "provider": p,
            "model": m,
            "label": label or (f"{m} ({p})" if p else m),
            "source": source,
        })

    if active_model:
        add_opt(active_provider, active_model, f"{active_model} (Active Hermes)", source="active")

    # Gather configured provider definitions and their declared models
    providers_cfg = cfg.get("providers") or {}
    configured_providers: list[str] = []
    if active_provider:
        configured_providers.append(active_provider)
    if isinstance(providers_cfg, dict):
        for pname, pentry in providers_cfg.items():
            if not isinstance(pentry, dict):
                continue
            if pname not in configured_providers:
                configured_providers.append(str(pname))
            dm = pentry.get("default_model")
            if isinstance(dm, str) and dm.strip():
                add_opt(str(pname), dm, source="provider")
            models_list = pentry.get("models")
            if isinstance(models_list, list):
                for item in models_list:
                    if isinstance(item, str):
                        add_opt(str(pname), item, source="provider")
                    elif isinstance(item, dict):
                        mid = item.get("id") or item.get("name") or item.get("model")
                        if mid:
                            add_opt(str(pname), str(mid), source="provider")
            elif isinstance(models_list, dict):
                for mid in models_list.keys():
                    add_opt(str(pname), str(mid), source="provider")

    # Gather custom_providers entries (local Ollama/vLLM/custom OpenAI-compatible endpoints)
    custom_provs = cfg.get("custom_providers") or []
    if isinstance(custom_provs, list):
        for cp in custom_provs:
            if not isinstance(cp, dict):
                continue
            cp_slug = str(cp.get("slug") or cp.get("name") or cp.get("id") or "").strip()
            if cp_slug and cp_slug not in configured_providers:
                configured_providers.append(cp_slug)
            if isinstance(cp.get("model"), str) and cp["model"].strip():
                add_opt(cp_slug or "custom", cp["model"], source="custom")
            if isinstance(cp.get("models"), list):
                for item in cp["models"]:
                    mid = item if isinstance(item, str) else (item.get("id") or item.get("name") if isinstance(item, dict) else "")
                    if mid:
                        add_opt(cp_slug or "custom", str(mid), source="custom")

    # Gather fallback_providers list (e.g. openai-codex, xai-oauth, openrouter fallbacks)
    fb_provs = cfg.get("fallback_providers") or []
    if isinstance(fb_provs, list):
        for fp in fb_provs:
            if not isinstance(fp, dict):
                continue
            fp_p = str(fp.get("provider") or "").strip()
            fp_m = str(fp.get("model") or "").strip()
            if fp_p and fp_p not in configured_providers:
                configured_providers.append(fp_p)
            if fp_m:
                add_opt(fp_p, fp_m, source="fallback")

    # Gather smart_model_routing cheap_model if configured
    smr = cfg.get("smart_model_routing") or {}
    if isinstance(smr, dict) and isinstance(smr.get("cheap_model"), dict):
        cm = smr["cheap_model"]
        if cm.get("model"):
            add_opt(str(cm.get("provider") or ""), str(cm.get("model") or ""), source="routing")

    # Gather models referenced in auxiliary task routes so users can reuse any authenticated provider/model
    aux_cfg = cfg.get("auxiliary") or {}
    sourcebook_tasks: dict[str, dict[str, str]] = {}
    if isinstance(aux_cfg, dict):
        for tname, tentry in aux_cfg.items():
            if not isinstance(tentry, dict):
                continue
            tp = str(tentry.get("provider") or "").strip()
            tm = str(tentry.get("model") or "").strip()
            if tp and tp != "auto" and tp not in configured_providers:
                configured_providers.append(tp)
            if tname.startswith("sourcebook_"):
                sourcebook_tasks[tname] = {"provider": tp or "auto", "model": tm}
            if tm:
                add_opt("" if tp == "auto" else tp, tm, source=f"aux:{tname}")

    # Include fallback model if configured
    fb = cfg.get("fallback_model")
    if isinstance(fb, dict) and fb.get("model"):
        add_opt(str(fb.get("provider") or ""), str(fb.get("model") or ""), source="fallback")

    trust = get_llm_trust_policy()
    return {
        "active": {"provider": active_provider, "model": active_model},
        "options": options,
        "providers": configured_providers,
        "tasks": sourcebook_tasks,
        "trust": trust,
        "override_ready": bool(trust["allow_model_override"]),
        "setup_commands": [
            "hermes config set plugins.entries.sourcebook.llm.allow_model_override true",
            "hermes config set plugins.entries.sourcebook.llm.allow_provider_override true",
        ],
    }


def get_llm(ctx: Any = None) -> Any:
    """Return a `PluginLlm` facade bound to `sourcebook`, even if `__init__.py` wasn't imported."""
    target = ctx or get_live_context()
    if target is not None and getattr(target, "llm", None) is not None:
        return target.llm
    global _FALLBACK_LLM
    with _LOCK:
        if _FALLBACK_LLM is None:
            from agent.plugin_llm import PluginLlm

            _FALLBACK_LLM = PluginLlm(plugin_id=PLUGIN_ID)
        return _FALLBACK_LLM


def llm_available(ctx: Any = None) -> bool:
    try:
        return get_llm(ctx) is not None
    except Exception:
        return False


def _is_trust_error(exc: Exception) -> bool:
    cls_name = type(exc).__name__
    if "TrustError" in cls_name:
        return True
    msg = str(exc).lower()
    return "allow_model_override" in msg or "allow_provider_override" in msg or "allow_task_override" in msg


def _is_temp_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(m in msg for m in _TEMP_ERROR_MARKERS)


def extract_json_object(raw_text: str) -> Optional[dict[str, Any]]:
    """Parse JSON cleanly from any provider's text output (handles code fences, preambles, trailing commas)."""
    text = (raw_text or "").strip()
    if not text:
        return None
    candidates = [text]
    for m in _FENCE_RE.finditer(text):
        candidates.append(m.group(1).strip())
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        candidates.append(text[first_brace : last_brace + 1])

    for cand in candidates:
        if not cand:
            continue
        try:
            obj = json.loads(cand)
            if isinstance(obj, dict):
                return obj
        except Exception:
            # Strip common trailing commas before } or ] from smaller/local models
            cleaned = re.sub(r",\s*([}\]])", r"\1", cand)
            try:
                obj = json.loads(cleaned)
                if isinstance(obj, dict):
                    return obj
            except Exception:
                continue
    return None


def _build_override_kwargs(
    *,
    task: Optional[str] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> dict[str, Any]:
    out: dict[str, Any] = {}
    p = (provider or "").strip()
    m = (model or "").strip()
    if p and p.lower() != "auto":
        out["provider"] = p
    if m and m.lower() != "auto":
        out["model"] = m
    # Only attach plugin auxiliary task when not overriding explicitly, and when live plugin context is registered
    if not out and task and get_live_context() is not None:
        out["task"] = task
    return out


def complete_chat(
    messages: list[dict[str, Any]],
    *,
    purpose: str = "sourcebook.chat",
    task: Optional[str] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = 0.2,
    max_tokens: Optional[int] = None,
    ctx: Any = None,
) -> tuple[str, dict[str, str]]:
    """Universal chat completion across any Hermes model/provider with temperature & task-route fallbacks."""
    llm = get_llm(ctx)
    route_kw = _build_override_kwargs(task=task, provider=provider, model=model)
    explicit_override = bool(route_kw.get("provider") or route_kw.get("model"))

    def _call(extra_kw: dict[str, Any]) -> Any:
        kw: dict[str, Any] = {"messages": messages, "purpose": purpose, **extra_kw}
        if max_tokens is not None:
            kw["max_tokens"] = max_tokens
        return llm.complete(**kw)

    attempts: list[dict[str, Any]] = []
    base = dict(route_kw)
    if temperature is not None:
        attempts.append({**base, "temperature": temperature})
    attempts.append(dict(base))
    if "task" in base:
        no_task = {k: v for k, v in base.items() if k != "task"}
        if temperature is not None:
            attempts.append({**no_task, "temperature": temperature})
        attempts.append(no_task)

    last_exc: Optional[Exception] = None
    for idx, kw in enumerate(attempts):
        try:
            res = _call(kw)
            meta = {
                "provider": str(getattr(res, "provider", "") or route_kw.get("provider") or ""),
                "model": str(getattr(res, "model", "") or route_kw.get("model") or ""),
            }
            return str(getattr(res, "text", "") or ""), meta
        except Exception as exc:
            last_exc = exc
            if _is_trust_error(exc):
                if explicit_override:
                    raise ModelOverrideDeniedError(
                        "Per-notebook model overrides are disabled in Hermes config. "
                        "Run `hermes config set plugins.entries.sourcebook.llm.allow_model_override true` "
                        "and `hermes config set plugins.entries.sourcebook.llm.allow_provider_override true`, "
                        "or switch the notebook model to Active Hermes."
                    ) from exc
                continue
            if idx == 0 and temperature is not None and _is_temp_error(exc):
                continue
            if "task" in kw:
                continue
            if idx < len(attempts) - 1:
                continue
    if last_exc is not None:
        raise last_exc
    raise RuntimeError("No LLM provider available")


def complete_json(
    *,
    instructions: str,
    input_blocks: list[dict[str, Any]],
    json_schema: dict[str, Any],
    schema_name: str,
    purpose: str,
    task: Optional[str] = None,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = 0.2,
    ctx: Any = None,
) -> tuple[dict[str, Any], dict[str, str]]:
    """Universal structured JSON completion that works with ANY Hermes model/provider.

    3-tier compatibility ladder:
      1. Native `complete_structured(json_schema=...)` (OpenAI, Gemini, Codex, OpenRouter structured)
      2. `complete_structured(json_mode=True)` with schema in instructions (Groq, DeepSeek, local vLLM/Ollama)
      3. Plain `complete(messages)` + strict JSON-only prompt + fence/brace extraction (Claude, older/custom models)
    """
    llm = get_llm(ctx)
    route_kw = _build_override_kwargs(task=task, provider=provider, model=model)
    explicit_override = bool(route_kw.get("provider") or route_kw.get("model"))
    schema_compact = json.dumps(json_schema, ensure_ascii=False)

    def _meta_from(res: Any) -> dict[str, str]:
        return {
            "provider": str(getattr(res, "provider", "") or route_kw.get("provider") or ""),
            "model": str(getattr(res, "model", "") or route_kw.get("model") or ""),
        }

    # Tier 1: Native JSON Schema
    for use_route in ([route_kw, {k: v for k, v in route_kw.items() if k != "task"}] if "task" in route_kw else [route_kw]):
        for temp in ([temperature, None] if temperature is not None else [None]):
            try:
                kw: dict[str, Any] = {
                    "instructions": instructions,
                    "input": input_blocks,
                    "json_schema": json_schema,
                    "schema_name": schema_name,
                    "purpose": purpose,
                    **use_route,
                }
                if temp is not None:
                    kw["temperature"] = temp
                res = llm.complete_structured(**kw)
                if isinstance(res.parsed, dict):
                    return res.parsed, _meta_from(res)
                parsed = extract_json_object(getattr(res, "text", ""))
                if parsed is not None:
                    return parsed, _meta_from(res)
            except Exception as exc:
                if _is_trust_error(exc):
                    if explicit_override:
                        raise ModelOverrideDeniedError(
                            "Per-notebook model overrides are disabled in Hermes config. "
                            "Enable `plugins.entries.sourcebook.llm.allow_model_override` and "
                            "`allow_provider_override`, or switch the notebook model to Active Hermes."
                        ) from exc
                    break
                if temp is not None and _is_temp_error(exc):
                    continue
                logger.debug("complete_json tier-1 (%s) fallback: %s", schema_name, exc)
                break

    # Tier 2: json_mode=True with inline schema
    json_mode_instr = (
        f"{instructions}\n\nReturn ONLY a single valid JSON object matching this JSON Schema (no markdown fences, no commentary):\n{schema_compact}"
    )
    no_task_kw = {k: v for k, v in route_kw.items() if k != "task"}
    try:
        res = llm.complete_structured(
            instructions=json_mode_instr,
            input=input_blocks,
            json_mode=True,
            schema_name=schema_name,
            purpose=purpose,
            **no_task_kw,
        )
        if isinstance(res.parsed, dict):
            return res.parsed, _meta_from(res)
        parsed = extract_json_object(getattr(res, "text", ""))
        if parsed is not None:
            return parsed, _meta_from(res)
    except Exception as exc:
        if _is_trust_error(exc) and explicit_override:
            raise ModelOverrideDeniedError(str(exc)) from exc
        logger.debug("complete_json tier-2 (%s) fallback: %s", schema_name, exc)

    # Tier 3: Plain chat completion + JSON extraction (works on every text model, including Claude & local Ollama)
    text_parts = [str(b.get("text") or "") for b in input_blocks if isinstance(b, dict) and b.get("type") == "text"]
    user_payload = "\n\n".join(p for p in text_parts if p)
    messages = [
        {"role": "system", "content": json_mode_instr},
        {"role": "user", "content": user_payload},
    ]
    raw_text, meta = complete_chat(
        messages,
        purpose=purpose,
        task=task,
        provider=provider,
        model=model,
        temperature=0.0 if temperature is not None else None,
        ctx=ctx,
    )
    parsed = extract_json_object(raw_text)
    if parsed is not None:
        return parsed, meta
    raise ValueError(f"{schema_name}: model did not return a parseable JSON object")


def dispatch_tool(tool_name: str, args: dict[str, Any], *, ctx: Any = None) -> str:
    """Dispatch a Hermes tool through `ctx.dispatch_tool` or the public `tools.registry`."""
    target = ctx or get_live_context()
    if target is not None and hasattr(target, "dispatch_tool"):
        return target.dispatch_tool(tool_name, args)
    from tools.registry import registry

    return registry.dispatch(tool_name, args)


def redact(text: str, *, force: bool = True) -> str:
    """Mask credentials/secrets before outbound LLM calls (public API: `agent.redact`)."""
    if not text:
        return text
    try:
        from agent.redact import redact_sensitive_text

        return redact_sensitive_text(text, force=force, file_read=True, secret_file=True, redact_url_credentials=True)
    except Exception:
        return text


def broadcast_event(event: str, payload: Optional[dict[str, Any]] = None) -> None:
    """Push `plugin.sourcebook.<event>` over Hermes Desktop's global event stream (no-op outside gateway)."""
    try:
        from hermes_cli.plugin_events import broadcast_plugin_event

        broadcast_plugin_event(PLUGIN_ID, event, payload or {})
    except Exception as exc:
        logger.debug("broadcast_event(%s) skipped: %s", event, exc)


def _probe_tool(tool_name: str) -> bool:
    try:
        from tools.registry import registry

        entry = registry.get_entry(tool_name)
        if entry is None:
            return False
        check_fn = getattr(entry, "check_fn", None)
        return bool(check_fn()) if callable(check_fn) else True
    except Exception:
        return False


def _probe_import(module_name: str) -> bool:
    try:
        __import__(module_name)
        return True
    except Exception:
        return False


def probe_capabilities(ctx: Any = None) -> dict[str, Any]:
    """Feature-detect optional Hermes tools, Python extractors, TTS/STT, and model routing for the Desktop UI."""
    models_info = list_available_models()
    return {
        "llm": llm_available(ctx),
        "active_model": models_info["active"],
        "model_override_allowed": models_info["trust"]["allow_model_override"],
        "provider_override_allowed": models_info["trust"]["allow_provider_override"],
        "web_extract": _probe_tool("web_extract"),
        "web_search": _probe_tool("web_search"),
        "image_generate": _probe_tool("image_generate"),
        "tts": _probe_tool("text_to_speech") or _probe_import("edge_tts"),
        "edge_tts": _probe_import("edge_tts"),
        "youtube_transcript": _probe_import("youtube_transcript_api"),
        "pypdf": _probe_import("pypdf"),
        "pymupdf": _probe_import("fitz"),
        "pdfplumber": _probe_import("pdfplumber"),
        "python_docx": _probe_import("docx"),
        "docx_stdlib": True,
        "hybrid_search": True,
        "numpy": _probe_import("numpy"),
    }


def generate_image(prompt: str, aspect_ratio: str = "landscape", *, ctx: Any = None) -> Optional[str]:
    """Call Hermes's `image_generate` tool and return the image URL/path, or None on failure."""
    if not prompt or not _probe_tool("image_generate"):
        return None
    try:
        raw = dispatch_tool("image_generate", {"prompt": prompt, "aspect_ratio": aspect_ratio}, ctx=ctx)
        data = json.loads(raw) if isinstance(raw, str) else raw
        if isinstance(data, dict) and data.get("success") and data.get("image"):
            return str(data["image"])
    except Exception as exc:
        logger.warning("SourceBook image_generate failed: %s", exc)
    return None
