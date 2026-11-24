"""Bounded background job runner with profile-preserving contextvars & global event progress."""

from __future__ import annotations

import contextvars
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable, Optional

from . import runtime

_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="folio-job")
_LOCK = threading.Lock()
_JOBS: dict[str, dict[str, Any]] = {}
_MAX_RETAINED_JOBS = 200


def _prune_locked() -> None:
    if len(_JOBS) <= _MAX_RETAINED_JOBS:
        return
    ordered = sorted(_JOBS.items(), key=lambda kv: kv[1].get("updated", 0))
    for jid, rec in ordered[: len(_JOBS) - _MAX_RETAINED_JOBS]:
        if rec.get("status") != "running":
            _JOBS.pop(jid, None)


def get_job(jid: str) -> dict[str, Any]:
    with _LOCK:
        rec = _JOBS.get(jid)
        return dict(rec) if rec else {"id": jid, "status": "unknown"}


def spawn(
    fn: Callable[[Callable[[str, Optional[int]], None]], Any],
    *,
    nb: Optional[str] = None,
    kind: str = "task",
) -> dict[str, Any]:
    """Run `fn(progress_cb)` off-thread while preserving Hermes's active profile contextvars."""
    jid = uuid.uuid4().hex[:12]
    now = time.time()
    with _LOCK:
        _JOBS[jid] = {
            "id": jid,
            "nb": nb,
            "kind": kind,
            "status": "running",
            "stage": "Starting…",
            "progress": 5,
            "created": now,
            "updated": now,
        }
        _prune_locked()

    def progress(stage: str, percent: Optional[int] = None) -> None:
        with _LOCK:
            rec = _JOBS.get(jid)
            if rec is not None:
                rec["stage"] = stage
                if percent is not None:
                    rec["progress"] = max(0, min(100, int(percent)))
                rec["updated"] = time.time()
        runtime.broadcast_event("job.progress", {"job": jid, "nb": nb, "kind": kind, "stage": stage, "progress": percent})

    def runner() -> None:
        try:
            result = fn(progress)
            with _LOCK:
                _JOBS[jid].update(status="done", stage="Complete", progress=100, result=result, updated=time.time())
            runtime.broadcast_event("job.done", {"job": jid, "nb": nb, "kind": kind, "result": result})
        except Exception as exc:
            err = str(exc)
            with _LOCK:
                _JOBS[jid].update(status="error", stage="Failed", error=err, updated=time.time())
            runtime.broadcast_event("job.error", {"job": jid, "nb": nb, "kind": kind, "error": err})

    # Copy contextvars so `get_hermes_home()` / profile scope stays intact inside worker thread!
    ctx_copy = contextvars.copy_context()
    _EXECUTOR.submit(ctx_copy.run, runner)
    return {"job": jid}
