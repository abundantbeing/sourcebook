"""Integration tests for SourceBook (store, hybrid search, contradictions, ingest, Claim Ledger, Audio Overview, Studio, analytics, universal model routing, FastAPI, agent register)."""

from __future__ import annotations

import importlib.util
import io
import json
import subprocess
import sys
import time
import zipfile
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_sourcebook_pkg():
    pkg_name = "_sourcebook_repo_test_pkg"
    if pkg_name in sys.modules:
        return sys.modules[pkg_name]
    spec = importlib.util.spec_from_file_location(
        pkg_name, REPO_ROOT / "__init__.py", submodule_search_locations=[str(REPO_ROOT)]
    )
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    mod.__package__ = pkg_name
    mod.__path__ = [str(REPO_ROOT)]  # type: ignore[attr-defined]
    sys.modules[pkg_name] = mod
    spec.loader.exec_module(mod)
    return mod


@pytest.fixture()
def isolated_data_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    data_dir = tmp_path / "sourcebook_data"
    data_dir.mkdir()
    monkeypatch.setenv("SOURCEBOOK_DATA_DIR", str(data_dir))
    return data_dir


def test_notebook_source_note_crud_and_promote(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    store = sourcebook.store

    nb = store.create_notebook("Systems Study", icon="book-open")
    assert nb["id"].startswith("nb_")
    assert nb["icon"] == "book-open"

    src = store.add_source(
        nb["id"],
        "Consensus Notes",
        "# Raft\n\nRaft decomposes consensus into leader election, log replication, and safety guarantees.\n\n## Snapshots\n\nLog compaction prevents unbounded disk growth by snapshotting committed state.",
        kind="markdown",
    )
    assert src["chunk_count"] >= 1
    assert store.get_notebook(nb["id"])["source_count"] == 1

    note = store.create_note(nb["id"], "Safety Summary", "Leader completeness requires every committed entry to appear in future leaders.")
    assert len(store.list_notes(nb["id"])) == 1
    promoted = store.promote_note_to_source(nb["id"], note["id"])
    assert promoted["kind"] == "note"
    assert store.get_notebook(nb["id"])["source_count"] == 2

    assert store.delete_note(nb["id"], note["id"]) is True
    assert store.delete_notebook(nb["id"]) is True


def test_path_traversal_rejected(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    with pytest.raises(ValueError):
        sourcebook.store.get_notebook("../escape")
    with pytest.raises(ValueError):
        sourcebook.store.nb_dir("nb_../../etc")


@pytest.mark.parametrize(
    "query",
    [
        "AND OR NOT NEAR",
        "Compare C++ AND NOT Java (v2.0): why?",
        '"""unclosed quote AND -dash:colon*star^caret',
        "???",
        "",
        "latency:18ms + throughput",
    ],
)
def test_fts5_handles_reserved_keywords_and_punctuation(isolated_data_dir: Path, query: str) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("FTS Safety")
    sourcebook.store.add_source(
        nb["id"],
        "Benchmarks",
        "Latency dropped to 18ms at p99 while throughput doubled across C++ and Java workers.",
        kind="text",
    )
    hits = sourcebook.store.search(nb["id"], query, k=5)
    assert isinstance(hits, list)


def test_hybrid_semantic_search_matches_paraphrases_and_synonyms(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Hybrid Search")
    s1 = sourcebook.store.add_source(
        nb["id"],
        "Q3 Finance",
        "# Q3 Bookings\n\nEnterprise bookings contracted sharply due to seasonal churn in Europe.",
        kind="markdown",
    )
    sourcebook.store.add_source(
        nb["id"],
        "Gardening",
        "# Tomatoes\n\nHeirloom tomatoes prefer full sun and well-drained compost soil.",
        kind="markdown",
    )
    # Conceptual query with zero exact keyword match ("revenue" -> "bookings", "dropped" -> "contracted")
    hits = sourcebook.store.search(nb["id"], "Why did revenue drop?", k=2)
    assert hits
    assert hits[0]["source_id"] == s1["id"]


def test_cross_source_contradictions_and_consensus(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Contradictions")
    sourcebook.store.add_source(
        nb["id"],
        "Report 2024",
        "Query latency is 18 ms under load in 2024. The engine supports streaming.",
        kind="text",
    )
    sourcebook.store.add_source(
        nb["id"],
        "Audit 2026",
        "Query latency is 42 ms under load in 2026. The engine does not support streaming.",
        kind="text",
    )
    contra = sourcebook.store.find_contradictions(nb["id"])
    assert contra["total_claims"] >= 2
    assert any(c["kind"] == "numeric" for c in contra["conflicts"])


def test_semantic_claim_ledger_flags_numeric_hallucination(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    chunks_by_id = {
        "s_abc123:0": {
            "id": "s_abc123:0",
            "source_id": "s_abc123",
            "text": "Enterprise bookings contracted by 14% after the pricing migration.",
        }
    }
    titles = {"s_abc123": "Q3 Memo"}
    # Paraphrased claim with accurate number -> supported
    good = sourcebook.ground.verify_claims(
        "Enterprise revenue declined by 14% following the pricing migration [[c:s_abc123:0]].",
        chunks_by_id,
        titles,
    )
    assert good and good[0]["verdict"] == "supported"
    assert good[0]["numeric_mismatch"] is False

    # Claim with fabricated number -> flagged as partial + numeric_mismatch
    bad = sourcebook.ground.verify_claims(
        "Enterprise revenue declined by 88% following the pricing migration [[c:s_abc123:0]].",
        chunks_by_id,
        titles,
    )
    assert bad and bad[0]["verdict"] == "partial"
    assert bad[0]["numeric_mismatch"] is True


def test_local_folder_sync_refresh_and_staleness(isolated_data_dir: Path, tmp_path: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Sync Vault")
    vault = tmp_path / "vault"
    vault.mkdir()
    doc = vault / "spec.md"
    doc.write_text("# Spec\n\nInitial cache limit is 256 MB.", encoding="utf-8")

    synced = sourcebook.ingest.ingest_local_path(nb["id"], str(vault))
    assert len(synced["added"]) == 1
    src = synced["added"][0]

    note = sourcebook.store.create_note(nb["id"], "Cache Note", "Cache is 256 MB.", citations=[f"{src['id']}:0"])
    art = sourcebook.make(nb["id"], "report", {"focus": "Cache", "extractive": True})
    assert sourcebook.store.list_notes(nb["id"])[0]["stale"] is False
    assert sourcebook.store.list_artifacts(nb["id"])[0]["stale"] is False

    # Mutate file on disk and refresh in place -> Living Note and Artifact become stale!
    doc.write_text("# Spec\n\nUpdated cache limit is 512 MB.", encoding="utf-8")
    refreshed = sourcebook.ingest.refresh_source(nb["id"], src["id"])
    assert refreshed["changed"] is True
    assert sourcebook.store.list_notes(nb["id"])[0]["stale"] is True
    assert sourcebook.store.list_artifacts(nb["id"])[0]["stale"] is True

    # Resyncing note hashes clears stale flag
    sourcebook.store.update_note(nb["id"], note["id"], resync_hashes=True)
    assert sourcebook.store.list_notes(nb["id"])[0]["stale"] is False


def test_docx_csv_json_html_youtube_id_and_analytics(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Formats")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr(
            "word/document.xml",
            '<?xml version="1.0"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Quarterly Review</w:t></w:r></w:p>'
            '<w:p><w:r><w:t>Revenue grew 42% year over year with 98.4% uptime.</w:t></w:r></w:p></w:body></w:document>',
        )
    docx_src = sourcebook.ingest.ingest_bytes(nb["id"], "report.docx", buf.getvalue())
    assert docx_src["kind"] == "docx"

    csv_src = sourcebook.ingest.ingest_bytes(nb["id"], "metrics.csv", b"region,latency_ms,uptime\nus-east,14,99.95\neu-west,21,99.91\nap-south,28,99.88\n")
    assert csv_src["kind"] == "csv"

    prof = sourcebook.analytics.analyze_source(nb["id"], csv_src["id"])
    assert prof["row_count"] == 3
    assert "latency_ms" in prof["numeric_columns"]
    assert prof["chart"] and len(prof["chart"]["series"]) == 3

    json_src = sourcebook.ingest.ingest_bytes(nb["id"], "nodes.json", json.dumps([{"node": "alpha", "rps": 4200}]).encode())
    assert json_src["kind"] == "json"

    title, md = sourcebook.ingest.extract_html_to_markdown("<html><head><title>Doc</title></head><body><h1>Intro</h1><p>Grounded text.</p><script>bad()</script></body></html>")
    assert title == "Doc"
    assert "Grounded text." in md
    assert "bad()" not in md

    assert sourcebook.ingest.extract_youtube_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert sourcebook.ingest.extract_youtube_id("https://youtu.be/dQw4w9WgXcQ?t=42") == "dQw4w9WgXcQ"


def test_universal_any_model_json_fallback_and_trust_gating(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    runtime = sourcebook.runtime

    # Simulate a provider (e.g. Claude / Ollama) that rejects json_schema & json_mode and returns fenced JSON via plain complete()
    class PlainTextOnlyLlm:
        def complete_structured(self, **kw: Any) -> Any:
            raise RuntimeError("json_schema response_format unsupported on this provider")

        def complete(self, **kw: Any) -> Any:
            return SimpleNamespace(
                text='Here is your result:\n```json\n{"overview": "Works on every model.", "suggested_questions": ["What next?"]}\n```',
                provider="ollama",
                model="qwen3:32b",
            )

    fake_ctx = SimpleNamespace(llm=PlainTextOnlyLlm())
    parsed, meta = runtime.complete_json(
        instructions="Summarize",
        input_blocks=[{"type": "text", "text": "hello"}],
        json_schema={"type": "object", "properties": {"overview": {"type": "string"}}},
        schema_name="test.schema",
        purpose="test",
        ctx=fake_ctx,
    )
    assert parsed["overview"] == "Works on every model."
    assert meta["provider"] == "ollama"
    assert meta["model"] == "qwen3:32b"


def test_claim_ledger_and_extractive_chat(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Claim Ledger Test")
    src = sourcebook.store.add_source(
        nb["id"],
        "Storage Spec",
        "# WAL Mode\n\nSQLite WAL mode allows concurrent readers while a single writer appends pages to the write-ahead log.\n\nFTS5 tokenizes chunks with Porter stemming for fast BM25 ranking.",
        kind="markdown",
    )
    res = sourcebook.ask(nb["id"], "How does SQLite WAL mode handle concurrency?", extractive=True)
    assert res["citations"]
    assert res["grounding"]["mode"] == "extractive"
    assert res["claims"]
    assert any(c["verdict"] == "supported" for c in res["claims"])

    saved_claims = sourcebook.store.list_verified_claims(nb["id"])
    assert len(saved_claims) == len(res["claims"])
    assert src["id"] in res["source_ids"]


def test_extractive_studio_all_eight_kinds_audio_followup_and_exports(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Studio Deck")
    sourcebook.store.add_source(
        nb["id"],
        "Engine Notes",
        "# Architecture\n\nHermes Desktop loads plugins inside an explicit SDK surface with zero app markup patching.\n\n## Latency\n\nLocal FTS5 queries finish in 6ms on 400 indexed chunks and support 99.2% recall on exact phrase lookups.",
        kind="markdown",
    )
    for kind in ("report", "audio", "mindmap", "flashcards", "quiz", "table", "infographic", "slides"):
        art = sourcebook.make(nb["id"], kind, {"focus": "Hermes plugin architecture", "extractive": True, "skip_audio": True})
        assert art["kind"] == kind
        assert art["spec"]
        fname, mtype, body = sourcebook.studio.export_artifact(art, "md")
        assert fname and mtype and body

    arts = {a["kind"]: sourcebook.store.get_artifact(nb["id"], a["id"]) for a in sourcebook.store.list_artifacts(nb["id"])}
    assert sourcebook.studio.export_artifact(arts["table"], "csv")[0].endswith(".csv")
    assert sourcebook.studio.export_artifact(arts["flashcards"], "anki")[0].endswith(".tsv")
    assert sourcebook.studio.export_artifact(arts["mindmap"], "opml")[0].endswith(".opml")
    assert sourcebook.studio.export_artifact(arts["slides"], "html")[0].endswith(".deck.html")

    # Verify interactive Audio Overview "Join the Podcast" follow-up appends Listener + 2-host reply turns cleanly
    before_turns = len(arts["audio"]["spec"]["turns"])
    fu = sourcebook.audio_followup(nb["id"], arts["audio"]["id"], "What is the FTS5 latency?")
    assert len(fu["artifact"]["spec"]["turns"]) == before_turns + 3
    speakers = [t["speaker"] for t in fu["artifact"]["spec"]["turns"][-3:]]
    assert speakers == ["Listener", "Alex", "Maya"]


def test_register_matches_plugin_yaml_and_pre_llm_call(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    manifest = yaml.safe_load((REPO_ROOT / "plugin.yaml").read_text(encoding="utf-8"))
    assert manifest["version"] == "0.1.0"

    class FakeCtx:
        def __init__(self) -> None:
            self.tools: list[str] = []
            self.hooks: dict[str, Any] = {}
            self.commands: dict[str, Any] = {}
            self.aux_tasks: list[str] = []
            self.rpcs: list[str] = []
            self.skills: list[str] = []

        def register_auxiliary_task(self, name: str, **kw: Any) -> None:
            self.aux_tasks.append(name)

        def register_tool(self, name: str, **kw: Any) -> None:
            self.tools.append(name)

        def register_hook(self, event: str, fn: Any) -> None:
            self.hooks[event] = fn

        def register_command(self, name: str, fn: Any, **kw: Any) -> None:
            self.commands[name] = fn

        def register_rpc(self, name: str, fn: Any) -> None:
            self.rpcs.append(name)

        def register_skill(self, name: str, path: Path) -> None:
            self.skills.append(name)

    ctx = FakeCtx()
    sourcebook.register(ctx)

    assert sorted(ctx.tools) == sorted(manifest["provides_tools"])
    assert sorted(ctx.hooks.keys()) == sorted(manifest["provides_hooks"])
    assert "sourcebook" in ctx.commands
    assert "sourcebook_chat" in ctx.aux_tasks
    assert "sourcebook_audio" in ctx.aux_tasks

    nb = sourcebook.store.create_notebook("Bound Session")
    sourcebook.store.add_source(nb["id"], "Notes", "Quantum error correction uses surface codes with logical error rates below 1%.", kind="text")
    assert ctx.hooks["pre_llm_call"](session_id="sess_unbound", user_message="surface codes") is None
    sourcebook.store.bind_session("sess_bound", nb["id"])
    injected = ctx.hooks["pre_llm_call"](session_id="sess_bound", user_message="surface codes")
    assert injected is not None and "surface codes" in injected["context"]

    # Slash command model pin
    msg = ctx.commands["sourcebook"](f"model {nb['id']} ollama/qwen3:32b")
    assert "qwen3:32b" in msg
    assert sourcebook.store.get_notebook(nb["id"])["model"] == "qwen3:32b"


def test_dashboard_plugin_api_routes(isolated_data_dir: Path) -> None:
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    spec = importlib.util.spec_from_file_location("sourcebook_api_test_mod", REPO_ROOT / "dashboard" / "plugin_api.py")
    assert spec and spec.loader
    api_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(api_mod)

    app = FastAPI()
    app.include_router(api_mod.router, prefix="/api/plugins/sourcebook")
    client = TestClient(app)

    ping = client.get("/api/plugins/sourcebook/ping").json()
    assert ping["ok"] is True
    assert ping["version"] == "0.1.0"
    assert "active" in client.get("/api/plugins/sourcebook/models").json()

    nb = client.post("/api/plugins/sourcebook/notebooks", json={"title": "API Test"}).json()

    up = client.post(
        f"/api/plugins/sourcebook/notebooks/{nb['id']}/sources/upload",
        files={"file": ("notes.csv", b"region,latency_ms\nus-east,18\neu-west,42\n", "text/csv")},
    )
    assert up.status_code == 200
    src_id = up.json()["id"]

    prof = client.post(f"/api/plugins/sourcebook/notebooks/{nb['id']}/sources/{src_id}/analyze").json()
    assert prof["row_count"] == 2

    contra = client.get(f"/api/plugins/sourcebook/notebooks/{nb['id']}/contradictions").json()
    assert "conflicts" in contra

    ask_job = client.post(
        f"/api/plugins/sourcebook/notebooks/{nb['id']}/ask",
        json={"text": "What is the us-east latency?", "extractive": True},
    ).json()["job"]
    for _ in range(40):
        st = client.get(f"/api/plugins/sourcebook/jobs/{ask_job}").json()
        if st["status"] in ("done", "error"):
            break
        time.sleep(0.05)
    assert st["status"] == "done"

    claims = client.get(f"/api/plugins/sourcebook/notebooks/{nb['id']}/claims").json()
    assert len(claims) >= 1
    cov = client.get(f"/api/plugins/sourcebook/notebooks/{nb['id']}/coverage").json()
    assert cov["touched_chunks"] >= 1


def test_slide_deck_outline_revise_rename_and_pptx_pdf_exports(isolated_data_dir: Path) -> None:
    import base64
    import io
    import zipfile

    import sourcebook

    nb = sourcebook.store.create_notebook("Pitch Deck Verification")
    s1 = sourcebook.store.add_source(
        nb["id"],
        "Benchmarks.md",
        "# Storage Benchmarks\n\nWAL checkpointing reduced crash replay time by 84% under concurrent load.\n\nQuery latency dropped from 42 ms to 6 ms across 10,000 indexed chunks.\n",
        kind="markdown",
    )
    s2 = sourcebook.store.add_source(
        nb["id"],
        "Architecture.md",
        "# Core Architecture\n\nSourceBook runs locally on SQLite WAL with FTS5 BM25 and hybrid semantic retrieval.\n\nPhase 1 ingests documents. Phase 2 verifies claims. Phase 3 synthesizes 8 Studio formats.\n",
        kind="markdown",
    )

    # 1. Draft outline with subset source selection
    out_res = sourcebook.outline_slides(
        nb["id"],
        {"deck_format": "presenter", "deck_purpose": "pitch", "count": 6, "instructions": "Investor pitch deck"},
        source_ids=[s1["id"], s2["id"]],
    )
    outline_slides = out_res["outline"]["slides"]
    assert len(outline_slides) >= 3
    outline_slides[0]["title"] = "Custom Edited Cover Headline"

    # 2. Generate deck from approved outline + simulate a cached ImageGen PNG on slide 1
    png_1x1 = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    art = sourcebook.make(
        nb["id"],
        "slides",
        {
            "deck_format": "detailed",
            "deck_purpose": "pitch",
            "theme": "keynote",
            "approved_outline": outline_slides,
            "include_images": False,
        },
        source_ids=[s1["id"], s2["id"]],
    )
    assert art["spec"]["slides"][0]["title"] == "Custom Edited Cover Headline"

    # Attach a test generated PNG to verify full-bleed & hybrid media embedding inside PPTX + PDF
    spec_with_img = dict(art["spec"])
    spec_with_img["slides"][0]["image_file"] = "slide_01.png"
    spec_with_img["slides"][0]["image_mode"] = "full_slide"
    art = sourcebook.store.update_artifact(
        nb["id"],
        art["id"],
        title="Synapse Pitch Master",
        spec=spec_with_img,
        media_files={"slide_01.png": png_1x1},
    )
    assert art["title"] == "Synapse Pitch Master"
    assert sourcebook.store.get_artifact_media_path(nb["id"], art["id"], "slide_01.png") is not None

    # 3. Export native PowerPoint (.pptx) and inspect valid OOXML structure, embedded media & speaker notes
    media_dir = sourcebook.store.get_artifact_media_dir(nb["id"], art["id"])
    pptx_name, pptx_mime, pptx_bytes = sourcebook.studio.export_artifact_binary(art, "pptx", media_dir=media_dir, theme="keynote")
    assert pptx_name.endswith(".pptx")
    assert "presentationml" in pptx_mime
    with zipfile.ZipFile(io.BytesIO(pptx_bytes)) as zf:
        names = set(zf.namelist())
        assert "ppt/presentation.xml" in names
        assert "ppt/slides/slide1.xml" in names
        assert "ppt/media/image1.png" in names
        assert "ppt/notesSlides/notesSlide1.xml" in names
        s1_xml = zf.read("ppt/slides/slide1.xml").decode("utf-8")
        assert "<p:pic>" in s1_xml

    # 4. Export native 16:9 PDF (.pdf)
    pdf_name, pdf_mime, pdf_bytes = sourcebook.studio.export_artifact_binary(art, "pdf", media_dir=media_dir, theme="keynote")
    assert pdf_name.endswith(".pdf")
    assert pdf_mime == "application/pdf"
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 800

    # 5. Revise deck in place
    revised = sourcebook.revise_artifact(nb["id"], art["id"], "Make it concise for executives", {"deck_format": "presenter"})
    assert revised["id"] == art["id"]
    assert revised["params"]["revision_prompt"] == "Make it concise for executives"
    assert len(revised["spec"]["slides"]) >= 3


def test_per_slide_inline_edit_and_single_slide_regenerate_visual(isolated_data_dir: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import base64
    import sourcebook

    nb = sourcebook.store.create_notebook("Single Slide Studio")
    sourcebook.store.add_source(
        nb["id"],
        "Overview.md",
        "# Hybrid Architecture\n\nLocal SQLite WAL delivers 6 ms median latency across 10k indexed chunks.\n",
        kind="markdown",
    )
    art = sourcebook.make(nb["id"], "slides", {"count": 4, "include_images": False})
    orig_count = len(art["spec"]["slides"])

    # 1. Inline edit slide 0 title, bullets, notes
    res_edit = sourcebook.update_slide(
        nb["id"],
        art["id"],
        0,
        {"title": "Edited Inline Headline", "bullets": ["Point A", "Point B"], "notes": "Updated presenter cue"},
    )
    assert res_edit["artifact"]["spec"]["slides"][0]["title"] == "Edited Inline Headline"
    assert res_edit["artifact"]["spec"]["slides"][0]["bullets"] == ["Point A", "Point B"]

    # 2. Add, move, and delete a slide cleanly
    res_add = sourcebook.update_slide(nb["id"], art["id"], 0, {"action": "add", "title": "Inserted Evidence Slide"})
    assert len(res_add["artifact"]["spec"]["slides"]) == orig_count + 1
    assert res_add["active_index"] == 1

    res_move = sourcebook.update_slide(nb["id"], art["id"], 1, {"action": "move", "delta": 1})
    assert res_move["active_index"] == 2
    assert res_move["artifact"]["spec"]["slides"][2]["title"] == "Inserted Evidence Slide"

    res_del = sourcebook.update_slide(nb["id"], art["id"], 2, {"action": "delete"})
    assert len(res_del["artifact"]["spec"]["slides"]) == orig_count

    # 3. Single-slide visual regeneration via mocked Hermes ImageGen provider (leaves sibling slides untouched!)
    png_1x1 = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    monkeypatch.setattr(
        sourcebook.runtime,
        "probe_capabilities",
        lambda ctx=None: {"image_generate": True, "image_gen_provider": "OpenAI (Codex auth)", "image_gen_model": "gpt-image-2-high"},
    )
    monkeypatch.setattr(sourcebook.runtime, "generate_image", lambda prompt, aspect="landscape", **kw: "data:image/png;base64,fake")
    monkeypatch.setattr(sourcebook.runtime, "fetch_image_bytes", lambda ref: (png_1x1, "png"))

    regen = sourcebook.regenerate_slide_visual(
        nb["id"],
        art["id"],
        1,
        prompt="Swiss horology optical glass cutaway prism on matte obsidian",
        image_mode="full_slide",
    )
    updated_slides = regen["artifact"]["spec"]["slides"]
    assert updated_slides[1]["image_file"].startswith("slide_02_r")
    assert updated_slides[1]["layout"] == "image-full"
    assert not updated_slides[0].get("image_file")
    assert sourcebook.store.get_artifact_media_path(nb["id"], art["id"], updated_slides[1]["image_file"]) is not None


def test_spoken_podcast_interrupt_followup_audio(isolated_data_dir: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import sourcebook

    nb = sourcebook.store.create_notebook("Podcast Interrupt")
    sourcebook.store.add_source(
        nb["id"],
        "Consensus.md",
        "# Raft Consensus\n\nRaft guarantees leader election safety through randomized 150 ms election timeouts.\n",
        kind="markdown",
    )
    art = sourcebook.make(nb["id"], "audio", {"count": 4, "skip_audio": True})
    fake_mp3 = b"ID3" + (b"\x00" * 1024)
    monkeypatch.setattr(sourcebook.audio, "synthesize_dialogue_with_engine", lambda turns, **kw: (fake_mp3, "edge_tts"))

    res = sourcebook.audio_followup(nb["id"], art["id"], "How does Raft avoid split votes?", current_turn_idx=1)
    assert res["tts_engine"] == "edge_tts"
    assert res["audio_file"].startswith("followup_") and res["audio_file"].endswith(".mp3")
    assert len(res["audio_b64"]) > 100
    assert any(t["speaker"] == "Listener" for t in res["added_turns"])
    assert any(t["speaker"] == "Alex" for t in res["added_turns"])
    assert any(t["speaker"] == "Maya" for t in res["added_turns"])
    assert sourcebook.store.get_artifact_media_path(nb["id"], art["id"], res["audio_file"]) is not None


def test_deep_research_auto_ingest_and_briefing(isolated_data_dir: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import sourcebook

    nb = sourcebook.store.create_notebook("Deep Research Lab")
    monkeypatch.setattr(
        sourcebook.ingest,
        "discover_web_sources",
        lambda q, limit=8, ctx=None: [
            {"title": f"Primary Study on {q[:20]}", "url": "https://example.org/study-a", "domain": "example.org", "snippet": "Benchmark results"},
            {"title": "Architecture Paper", "url": "https://docs.example.net/arch", "domain": "docs.example.net", "snippet": "WAL & FTS5"},
        ],
    )
    monkeypatch.setattr(
        sourcebook.ingest,
        "extract_url",
        lambda url, ctx=None: (
            f"Fetched {url}",
            f"# Research Paper from {url}\n\nHybrid BM25 and vector retrieval improves recall by 31% while staying local.\n",
            {},
        ),
    )

    res = sourcebook.deep_research(nb["id"], "local-first hybrid RAG", depth="quick", auto_brief=True)
    assert len(res["queries"]) >= 2
    assert len(res["ingested"]) == 2
    assert res["artifact"] is not None
    assert res["artifact"]["kind"] == "report"
    assert len(sourcebook.store.list_sources(nb["id"])) == 2


def test_visual_pdf_page_preview_with_highlight(isolated_data_dir: Path) -> None:
    import sourcebook

    fitz = pytest.importorskip("fitz")
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((72, 100), "SourceBook Visual Verification", fontsize=18)
    page.insert_text((72, 140), "WAL checkpointing cuts crash recovery latency by 84% under concurrent reads.", fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()

    nb = sourcebook.store.create_notebook("PDF Preview Test")
    src = sourcebook.ingest.ingest_bytes(nb["id"], "report.pdf", pdf_bytes, content_type="application/pdf")
    detail = sourcebook.store.get_source_text(nb["id"], src["id"])
    assert detail["source"]["has_pdf_preview"] is True

    preview = sourcebook.ingest.render_pdf_page_preview(
        nb["id"],
        src["id"],
        page_num=1,
        highlight_text="WAL checkpointing cuts crash recovery latency by 84%",
    )
    assert preview["available"] is True
    assert preview["page"] == 1
    assert preview["total_pages"] == 1
    assert preview["highlighted"] is True
    assert preview["bytes"] > 1000


def test_cross_notebook_search_and_hermes_memory_bridge(isolated_data_dir: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import sourcebook

    monkeypatch.setenv("HERMES_HOME", str(tmp_path / "hermes_home"))
    monkeypatch.setattr(sourcebook.runtime, "_probe_tool", lambda name: False)

    nb1 = sourcebook.store.create_notebook("Alpha Storage")
    nb2 = sourcebook.store.create_notebook("Beta Security")
    s1 = sourcebook.store.add_source(nb1["id"], "WAL.md", "Write-ahead logging enables concurrent snapshot isolation with 6 ms p95 latency.", kind="markdown")
    sourcebook.store.add_source(nb2["id"], "Auth.md", "OAuth tokens are redacted before every outbound LLM request.", kind="markdown")

    all_hits = sourcebook.store.search_all_notebooks("snapshot isolation latency")
    assert any(h["notebook_id"] == nb1["id"] for h in all_hits)
    scoped_hits = sourcebook.store.search_all_notebooks("OAuth tokens redacted", nb_filter=nb1["id"])
    assert all(h["notebook_id"] == nb1["id"] for h in scoped_hits)

    mem_res = sourcebook.save_to_memory(
        nb1["id"],
        "WAL snapshot isolation maintains 6 ms p95 latency under mixed workloads [[c:s_123456:0]].",
        title="WAL Latency",
        citations=[f"{s1['id']}:0"],
    )
    assert mem_res["saved"] is True
    mem_file = tmp_path / "hermes_home" / "memories" / "MEMORY.md"
    assert mem_file.is_file()
    txt = mem_file.read_text(encoding="utf-8")
    assert "[SourceBook · Alpha Storage]" in txt
    assert "WAL.md" in txt
    assert "[[c:" not in txt


def test_desktop_bundle_passes_syntax_and_house_lint() -> None:
    bundle = REPO_ROOT / "desktop" / "plugin.js"
    assert bundle.is_file()
    r1 = subprocess.run(["node", "--check", str(bundle)], capture_output=True, text=True, check=False)
    assert r1.returncode == 0, r1.stderr
    r2 = subprocess.run(["node", str(REPO_ROOT / "tests" / "lint_desktop.mjs")], capture_output=True, text=True, check=False)
    assert r2.returncode == 0, r2.stdout + r2.stderr
