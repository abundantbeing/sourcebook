"""SourceBook REST API routes mounted at /api/plugins/sourcebook/*.

Hermes's web server imports this file via import_user_code(path, "hermes_dashboard_plugin_sourcebook")
without putting the plugin root on sys.path. We therefore load the sibling plugin package
deterministically from Path(__file__).resolve().parents[1] so it works identically in-process,
under plugins.isolation: host, and in standalone pytest.
"""

import importlib.util
import sys
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field


def _load_plugin_pkg():
    """Load the sibling SourceBook package cleanly regardless of how Hermes imported plugin_api.py."""
    plugin_root = Path(__file__).resolve().parents[1]
    for mod_name in ("hermes_plugins.sourcebook", "_sourcebook_plugin_pkg"):
        existing = sys.modules.get(mod_name)
        if existing is not None and getattr(existing, "__file__", None):
            try:
                if Path(existing.__file__).resolve().parent == plugin_root:
                    return existing
            except OSError:
                pass
    pkg_name = "_sourcebook_plugin_pkg"
    init_file = plugin_root / "__init__.py"
    spec = importlib.util.spec_from_file_location(
        pkg_name, init_file, submodule_search_locations=[str(plugin_root)]
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load SourceBook package from {init_file}")
    mod = importlib.util.module_from_spec(spec)
    mod.__package__ = pkg_name
    mod.__path__ = [str(plugin_root)]  # type: ignore[attr-defined]
    sys.modules[pkg_name] = mod
    spec.loader.exec_module(mod)
    return mod


sourcebook = _load_plugin_pkg()
store = sourcebook.store
ingest = sourcebook.ingest
studio = sourcebook.studio
runtime = sourcebook.runtime
analytics = sourcebook.analytics

_jobs_spec = importlib.util.spec_from_file_location(
    f"{sourcebook.__name__}.core.jobs", Path(__file__).resolve().parents[1] / "core" / "jobs.py"
)
assert _jobs_spec and _jobs_spec.loader
jobs = importlib.util.module_from_spec(_jobs_spec)
sys.modules[_jobs_spec.name] = jobs
_jobs_spec.loader.exec_module(jobs)

router = APIRouter()


def _http_err(exc: Exception) -> HTTPException:
    if isinstance(exc, FileNotFoundError):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, PermissionError):
        return HTTPException(status_code=403, detail=str(exc))
    if isinstance(exc, ValueError):
        return HTTPException(status_code=400, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


@router.get("/ping")
async def ping() -> dict[str, Any]:
    return {"ok": True, "plugin": "sourcebook", "version": "0.1.0", "llm": runtime.llm_available()}


@router.get("/capabilities")
async def capabilities() -> dict[str, Any]:
    return runtime.probe_capabilities()


@router.get("/models")
async def models() -> dict[str, Any]:
    return runtime.list_available_models()


@router.get("/studio/kinds")
async def studio_kinds() -> list[dict[str, Any]]:
    return studio.list_generators()


@router.get("/search")
async def search_all(q: str = Query(..., min_length=1)) -> list[dict[str, Any]]:
    return store.search_all_notebooks(q)


class NewNotebookBody(BaseModel):
    title: str
    icon: str = "book-open"
    emoji: str = ""
    color: Optional[str] = None


class PatchNotebookBody(BaseModel):
    title: Optional[str] = None
    icon: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    persona: Optional[str] = None
    length: Optional[str] = None
    strict: Optional[bool] = None
    provider: Optional[str] = None
    model: Optional[str] = None


@router.get("/notebooks")
async def list_notebooks() -> list[dict[str, Any]]:
    return store.list_notebooks()


@router.post("/notebooks")
async def create_notebook(body: NewNotebookBody) -> dict[str, Any]:
    try:
        return store.create_notebook(body.title, emoji=body.emoji, color=body.color, icon=body.icon)
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}")
async def get_notebook(nb: str) -> dict[str, Any]:
    try:
        return store.get_notebook(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.patch("/notebooks/{nb}")
async def patch_notebook(nb: str, body: PatchNotebookBody) -> dict[str, Any]:
    try:
        return store.update_notebook(nb, **{k: v for k, v in body.model_dump().items() if v is not None})
    except Exception as exc:
        raise _http_err(exc)


@router.delete("/notebooks/{nb}")
async def delete_notebook(nb: str) -> dict[str, Any]:
    try:
        if not store.delete_notebook(nb):
            raise HTTPException(status_code=404, detail="notebook not found")
        return {"deleted": True, "id": nb}
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


class NewSourceBody(BaseModel):
    title: str = ""
    text: str = ""
    url: Optional[str] = None
    kind: str = "text"


class PatchSourceBody(BaseModel):
    enabled: Optional[bool] = None
    title: Optional[str] = None


class SyncPathBody(BaseModel):
    path: str
    max_files: int = 40


class DiscoverBody(BaseModel):
    query: str
    limit: int = 8


class AnalyzeSourceBody(BaseModel):
    metric_col: Optional[str] = None
    label_col: Optional[str] = None


@router.get("/notebooks/{nb}/sources")
async def list_sources(nb: str) -> list[dict[str, Any]]:
    try:
        return store.list_sources(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/sources")
async def add_source(nb: str, body: NewSourceBody) -> dict[str, Any]:
    try:
        if body.url and not body.text.strip():
            src = ingest.ingest_url(nb, body.url, title=body.title or None)
        else:
            chunk_chars = int(runtime.get_config("chunk_chars", 3200) or 3200)
            src = store.add_source(
                nb,
                body.title or (body.url or body.text.strip()[:50]),
                body.text,
                kind=body.kind,
                origin=body.url,
                chunk_chars=chunk_chars,
            )
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return src
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/sources/sync-path")
async def sync_local_path(nb: str, body: SyncPathBody) -> dict[str, Any]:
    try:
        res = ingest.ingest_local_path(nb, body.path, max_files=max(1, min(100, body.max_files)))
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return res
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/discover")
async def discover_sources(nb: str, body: DiscoverBody) -> dict[str, Any]:
    try:
        store.get_notebook(nb)
        results = ingest.discover_web_sources(body.query, limit=body.limit)
        return {"query": body.query, "results": results}
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/sources/upload")
async def upload_source(nb: str, file: UploadFile = File(...)) -> dict[str, Any]:
    """Stream-bounded multipart file upload supporting PDF, DOCX, CSV, JSON, TXT, Markdown, HTML, Audio/Video, and Images."""
    try:
        chunks_buf = bytearray()
        while True:
            piece = await file.read(1024 * 1024)
            if not piece:
                break
            chunks_buf.extend(piece)
            if len(chunks_buf) > ingest.MAX_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds {ingest.MAX_UPLOAD_BYTES // (1024 * 1024)} MiB limit",
                )
        src = ingest.ingest_bytes(
            nb,
            file.filename or "upload.txt",
            bytes(chunks_buf),
            content_type=file.content_type,
        )
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return src
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.patch("/notebooks/{nb}/sources/{src}")
async def patch_source(nb: str, src: str, body: PatchSourceBody) -> dict[str, Any]:
    try:
        out = store.set_source(nb, src, **{k: v for k, v in body.model_dump().items() if v is not None})
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return out
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/sources/{src}/refresh")
async def refresh_source(nb: str, src: str) -> dict[str, Any]:
    try:
        out = ingest.refresh_source(nb, src)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return out
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/sources/{src}/analyze")
async def analyze_source_data(nb: str, src: str, body: Optional[AnalyzeSourceBody] = None) -> dict[str, Any]:
    try:
        return analytics.analyze_source(
            nb,
            src,
            metric_col=body.metric_col if body else None,
            label_col=body.label_col if body else None,
        )
    except Exception as exc:
        raise _http_err(exc)


@router.delete("/notebooks/{nb}/sources/{src}")
async def delete_source(nb: str, src: str) -> dict[str, Any]:
    try:
        if not store.delete_source(nb, src):
            raise HTTPException(status_code=404, detail="source not found")
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return {"deleted": True, "id": src}
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/sources/{src}/text")
async def source_text(nb: str, src: str) -> dict[str, Any]:
    try:
        return store.get_source_text(nb, src)
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/chunks/{cid}")
async def get_chunk(nb: str, cid: str) -> dict[str, Any]:
    try:
        c = store.get_chunk(nb, cid)
        if not c:
            raise HTTPException(status_code=404, detail="chunk not found")
        return c
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/coverage")
async def coverage(nb: str) -> dict[str, Any]:
    try:
        return store.coverage_map(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/claims")
async def list_claims(nb: str) -> list[dict[str, Any]]:
    try:
        return store.list_verified_claims(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/contradictions")
async def list_contradictions(nb: str) -> dict[str, Any]:
    try:
        return store.find_contradictions(nb)
    except Exception as exc:
        raise _http_err(exc)


class NewNoteBody(BaseModel):
    title: str
    markdown: str = ""
    pinned: bool = False
    from_chat: bool = False
    citations: list[str] = Field(default_factory=list)


class PatchNoteBody(BaseModel):
    title: Optional[str] = None
    markdown: Optional[str] = None
    pinned: Optional[bool] = None
    citations: Optional[list[str]] = None
    resync_hashes: Optional[bool] = None


@router.get("/notebooks/{nb}/notes")
async def list_notes(nb: str) -> list[dict[str, Any]]:
    try:
        return store.list_notes(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/notes")
async def create_note(nb: str, body: NewNoteBody) -> dict[str, Any]:
    try:
        note = store.create_note(
            nb,
            body.title,
            body.markdown,
            pinned=body.pinned,
            from_chat=body.from_chat,
            citations=body.citations,
        )
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "notes"})
        return note
    except Exception as exc:
        raise _http_err(exc)


@router.patch("/notebooks/{nb}/notes/{nid}")
async def patch_note(nb: str, nid: str, body: PatchNoteBody) -> dict[str, Any]:
    try:
        note = store.update_note(nb, nid, **{k: v for k, v in body.model_dump().items() if v is not None})
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "notes"})
        return note
    except Exception as exc:
        raise _http_err(exc)


@router.delete("/notebooks/{nb}/notes/{nid}")
async def delete_note(nb: str, nid: str) -> dict[str, Any]:
    try:
        if not store.delete_note(nb, nid):
            raise HTTPException(status_code=404, detail="note not found")
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "notes"})
        return {"deleted": True, "id": nid}
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.post("/notebooks/{nb}/notes/{nid}/promote")
async def promote_note(nb: str, nid: str) -> dict[str, Any]:
    try:
        src = store.promote_note_to_source(nb, nid)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "sources"})
        return src
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/messages")
async def list_messages(nb: str) -> list[dict[str, Any]]:
    try:
        return store.list_messages(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.delete("/notebooks/{nb}/messages")
async def clear_messages(nb: str) -> dict[str, Any]:
    try:
        store.clear_messages(nb)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "messages"})
        return {"cleared": True}
    except Exception as exc:
        raise _http_err(exc)


class AskBody(BaseModel):
    text: str
    history: list[dict[str, Any]] = Field(default_factory=list)
    source_ids: Optional[list[str]] = None
    persona: Optional[str] = None
    length: Optional[str] = None
    strict: Optional[bool] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    extractive: bool = False


@router.post("/notebooks/{nb}/ask")
async def ask_notebook(nb: str, body: AskBody) -> dict[str, Any]:
    try:
        store.get_notebook(nb)
    except Exception as exc:
        raise _http_err(exc)
    return jobs.spawn(
        lambda progress: sourcebook.ask(
            nb,
            body.text,
            history=body.history,
            source_ids=body.source_ids,
            persona=body.persona,
            length=body.length,
            strict=body.strict,
            provider=body.provider,
            model=body.model,
            extractive=body.extractive,
            progress=progress,
        ),
        nb=nb,
        kind="chat",
    )


@router.post("/notebooks/{nb}/guide")
async def guide_notebook(nb: str) -> dict[str, Any]:
    try:
        store.get_notebook(nb)
    except Exception as exc:
        raise _http_err(exc)
    return jobs.spawn(lambda progress: sourcebook.build_guide(nb, progress=progress), nb=nb, kind="guide")


@router.get("/notebooks/{nb}/artifacts")
async def list_artifacts(nb: str) -> list[dict[str, Any]]:
    try:
        return store.list_artifacts(nb)
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}")
async def get_artifact(nb: str, aid: str) -> dict[str, Any]:
    try:
        art = store.get_artifact(nb, aid)
        if not art:
            raise HTTPException(status_code=404, detail="artifact not found")
        return art
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/audio")
async def get_artifact_audio(nb: str, aid: str) -> Response:
    try:
        p = store.get_artifact_audio_path(nb, aid)
        if not p:
            raise HTTPException(status_code=404, detail="audio file not available for this artifact")
        return Response(
            content=p.read_bytes(),
            media_type="audio/mpeg",
            headers={"Content-Disposition": f'inline; filename="{aid}.mp3"'},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/audio-data")
async def get_artifact_audio_data(nb: str, aid: str) -> dict[str, Any]:
    import base64

    try:
        p = store.get_artifact_audio_path(nb, aid)
        if not p:
            return {"available": False, "mime": "audio/mpeg", "b64": ""}
        raw = p.read_bytes()
        return {"available": True, "mime": "audio/mpeg", "bytes": len(raw), "b64": base64.b64encode(raw).decode("ascii")}
    except Exception as exc:
        raise _http_err(exc)


class AudioFollowupBody(BaseModel):
    question: str


@router.post("/notebooks/{nb}/artifacts/{aid}/followup")
async def audio_followup(nb: str, aid: str, body: AudioFollowupBody) -> dict[str, Any]:
    try:
        return sourcebook.audio_followup(nb, aid, body.question)
    except Exception as exc:
        raise _http_err(exc)


@router.delete("/notebooks/{nb}/artifacts/{aid}")
async def delete_artifact(nb: str, aid: str) -> dict[str, Any]:
    try:
        if not store.delete_artifact(nb, aid):
            raise HTTPException(status_code=404, detail="artifact not found")
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
        return {"deleted": True, "id": aid}
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.patch("/notebooks/{nb}/artifacts/{aid}/state")
async def patch_artifact_state(nb: str, aid: str, body: dict[str, Any]) -> dict[str, Any]:
    try:
        return store.update_artifact_state(nb, aid, body)
    except Exception as exc:
        raise _http_err(exc)


class PatchArtifactBody(BaseModel):
    title: Optional[str] = None
    theme: Optional[str] = None


@router.patch("/notebooks/{nb}/artifacts/{aid}")
async def patch_artifact(nb: str, aid: str, body: PatchArtifactBody) -> dict[str, Any]:
    try:
        art = store.get_artifact(nb, aid)
        if not art:
            raise HTTPException(status_code=404, detail="artifact not found")
        spec_patch = None
        if body.theme and isinstance(art.get("spec"), dict):
            spec_patch = dict(art["spec"])
            spec_patch["theme"] = body.theme
        updated = store.update_artifact(nb, aid, title=body.title, spec=spec_patch)
        runtime.broadcast_event("notebook.changed", {"nb": nb, "what": "artifacts"})
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/media/{fname}")
async def get_artifact_media(nb: str, aid: str, fname: str) -> Response:
    try:
        p = store.get_artifact_media_path(nb, aid, fname)
        if not p:
            raise HTTPException(status_code=404, detail="media file not found")
        raw = p.read_bytes()
        mime = "image/jpeg" if raw.startswith(b"\xff\xd8\xff") else "image/png"
        return Response(content=raw, media_type=mime)
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/media-data/{fname}")
async def get_artifact_media_data(nb: str, aid: str, fname: str) -> dict[str, Any]:
    import base64

    try:
        p = store.get_artifact_media_path(nb, aid, fname)
        if not p:
            return {"available": False, "mime": "image/png", "b64": ""}
        raw = p.read_bytes()
        mime = "image/jpeg" if raw.startswith(b"\xff\xd8\xff") else "image/png"
        return {"available": True, "mime": mime, "bytes": len(raw), "b64": base64.b64encode(raw).decode("ascii")}
    except Exception as exc:
        raise _http_err(exc)


class ReviseArtifactBody(BaseModel):
    prompt: str
    params: dict[str, Any] = Field(default_factory=dict)
    source_ids: Optional[list[str]] = None
    provider: Optional[str] = None
    model: Optional[str] = None


@router.post("/notebooks/{nb}/artifacts/{aid}/revise")
async def revise_artifact_route(nb: str, aid: str, body: ReviseArtifactBody) -> dict[str, Any]:
    try:
        if not store.get_artifact(nb, aid):
            raise HTTPException(status_code=404, detail="artifact not found")
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)
    return jobs.spawn(
        lambda progress: sourcebook.revise_artifact(
            nb,
            aid,
            body.prompt,
            body.params,
            source_ids=body.source_ids,
            provider=body.provider,
            model=body.model,
            progress=progress,
        ),
        nb=nb,
        kind="revise",
    )


class OutlineSlidesBody(BaseModel):
    params: dict[str, Any] = Field(default_factory=dict)
    source_ids: Optional[list[str]] = None
    provider: Optional[str] = None
    model: Optional[str] = None


@router.post("/notebooks/{nb}/slides/outline")
async def outline_slides_route(nb: str, body: OutlineSlidesBody) -> dict[str, Any]:
    try:
        store.get_notebook(nb)
        return sourcebook.outline_slides(
            nb,
            body.params,
            source_ids=body.source_ids,
            provider=body.provider,
            model=body.model,
        )
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/export")
async def export_artifact(nb: str, aid: str, fmt: str = Query("md"), theme: Optional[str] = Query(None)) -> Response:
    try:
        art = store.get_artifact(nb, aid)
        if not art:
            raise HTTPException(status_code=404, detail="artifact not found")
        if fmt.lower() in ("pptx", "pdf") and art.get("kind") == "slides":
            media_dir = store.get_artifact_media_dir(nb, aid)
            filename, media_type, raw = studio.export_artifact_binary(art, fmt, media_dir=media_dir, theme=theme)
            return Response(
                content=raw,
                media_type=media_type,
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )
        filename, media_type, content = studio.export_artifact(art, fmt)
        return Response(
            content=content,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/export-binary")
async def export_artifact_binary_route(nb: str, aid: str, fmt: str = Query("pptx"), theme: Optional[str] = Query(None)) -> dict[str, Any]:
    import base64

    try:
        art = store.get_artifact(nb, aid)
        if not art:
            raise HTTPException(status_code=404, detail="artifact not found")
        media_dir = store.get_artifact_media_dir(nb, aid)
        filename, media_type, raw = studio.export_artifact_binary(art, fmt, media_dir=media_dir, theme=theme)
        return {
            "filename": filename,
            "media_type": media_type,
            "bytes": len(raw),
            "b64": base64.b64encode(raw).decode("ascii"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


@router.get("/notebooks/{nb}/artifacts/{aid}/export-payload")
async def export_artifact_payload(nb: str, aid: str, fmt: str = Query("md")) -> dict[str, str]:
    try:
        art = store.get_artifact(nb, aid)
        if not art:
            raise HTTPException(status_code=404, detail="artifact not found")
        filename, media_type, content = studio.export_artifact(art, fmt)
        return {"filename": filename, "media_type": media_type, "content": content}
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_err(exc)


class StudioRunBody(BaseModel):
    kind: str
    params: dict[str, Any] = Field(default_factory=dict)
    source_ids: Optional[list[str]] = None
    provider: Optional[str] = None
    model: Optional[str] = None


@router.post("/notebooks/{nb}/studio")
async def run_studio(nb: str, body: StudioRunBody) -> dict[str, Any]:
    try:
        store.get_notebook(nb)
        studio.get_generator(body.kind)
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise _http_err(exc)
    return jobs.spawn(
        lambda progress: sourcebook.make(
            nb,
            body.kind,
            body.params,
            source_ids=body.source_ids,
            provider=body.provider,
            model=body.model,
            progress=progress,
        ),
        nb=nb,
        kind=body.kind,
    )


@router.get("/jobs/{jid}")
async def get_job(jid: str) -> dict[str, Any]:
    return jobs.get_job(jid)
