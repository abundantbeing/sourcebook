"""Public-API bridge to Hermes services (LLM, tools, events, redaction).

Works identically when called from:
  1. `__init__.py` (`register(ctx)`) in-process or in `plugins.isolation: host`
  2. `dashboard/plugin_api.py` (loaded independently by Hermes's web server)
  3. Standalone `pytest` runs (graceful degradation when Hermes is absent)

Imports ONLY documented modules from `website/docs/developer-guide/plugins/public-api.md`.
"""

from __future__ import annotations

import json
import logging
import threading
from typing import Any, Optional

logger = logging.getLogger("sourcebook.runtime")

PLUGIN_ID = "sourcebook"

_LOCK = threading.Lock()
_LIVE_CTX: Any = None
_FALLBACK_LLM: Any = None


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


def get_config(key: str, default: Any = None) -> Any:
    ctx = get_live_context()
    if ctx is not None and hasattr(ctx, "get_config"):
        try:
            return ctx.get_config(key, default)
        except Exception:
            pass
    try:
        from hermes_cli.config import load_config_readonly

        cfg = load_config_readonly() or {}
        entry = ((cfg.get("plugins") or {}).get("entries") or {}).get(PLUGIN_ID) or {}
        settings = entry.get("settings") or entry.get("config") or {}
        if isinstance(settings, dict) and key in settings:
            return settings[key]
    except Exception:
        pass
    return default


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
    """Feature-detect optional Hermes tools and Python extractors for the Desktop UI."""
    return {
        "llm": llm_available(ctx),
        "web_extract": _probe_tool("web_extract"),
        "web_search": _probe_tool("web_search"),
        "image_generate": _probe_tool("image_generate"),
        "pypdf": _probe_import("pypdf"),
        "python_docx": _probe_import("docx"),
        "docx_stdlib": True,
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
