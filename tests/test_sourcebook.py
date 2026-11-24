"""Integration tests for SourceBook (store, FTS5, ingest, Claim Ledger, Studio, FastAPI, agent register)."""

from __future__ import annotations

import importlib.util
import io
import json
import subprocess
import sys
import time
import zipfile
from pathlib import Path
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


def test_docx_csv_json_and_html_ingestion(isolated_data_dir: Path) -> None:
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

    csv_src = sourcebook.ingest.ingest_bytes(nb["id"], "metrics.csv", b"region,latency_ms,uptime\nus-east,14,99.95\neu-west,21,99.91\n")
    assert csv_src["kind"] == "csv"

    json_src = sourcebook.ingest.ingest_bytes(nb["id"], "nodes.json", json.dumps([{"node": "alpha", "rps": 4200}]).encode())
    assert json_src["kind"] == "json"

    title, md = sourcebook.ingest.extract_html_to_markdown("<html><head><title>Doc</title></head><body><h1>Intro</h1><p>Grounded text.</p><script>bad()</script></body></html>")
    assert title == "Doc"
    assert "Grounded text." in md
    assert "bad()" not in md


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


def test_extractive_studio_all_seven_kinds_and_exports(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    nb = sourcebook.store.create_notebook("Studio Deck")
    sourcebook.store.add_source(
        nb["id"],
        "Engine Notes",
        "# Architecture\n\nHermes Desktop loads plugins inside an explicit SDK surface with zero app markup patching.\n\n## Latency\n\nLocal FTS5 queries finish in 6ms on 400 indexed chunks and support 99.2% recall on exact phrase lookups.",
        kind="markdown",
    )
    for kind in ("report", "mindmap", "flashcards", "quiz", "table", "infographic", "slides"):
        art = sourcebook.make(nb["id"], kind, {"focus": "Hermes plugin architecture", "extractive": True})
        assert art["kind"] == kind
        assert art["spec"]
        fname, mtype, body = sourcebook.studio.export_artifact(art, "md")
        assert fname and mtype and body

    # Verify specialized exports
    arts = {a["kind"]: sourcebook.store.get_artifact(nb["id"], a["id"]) for a in sourcebook.store.list_artifacts(nb["id"])}
    assert sourcebook.studio.export_artifact(arts["table"], "csv")[0].endswith(".csv")
    assert sourcebook.studio.export_artifact(arts["flashcards"], "anki")[0].endswith(".tsv")
    assert sourcebook.studio.export_artifact(arts["mindmap"], "opml")[0].endswith(".opml")
    assert sourcebook.studio.export_artifact(arts["slides"], "html")[0].endswith(".deck.html")


def test_register_matches_plugin_yaml_and_pre_llm_call(isolated_data_dir: Path) -> None:
    sourcebook = _load_sourcebook_pkg()
    manifest = yaml.safe_load((REPO_ROOT / "plugin.yaml").read_text(encoding="utf-8"))

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

    nb = sourcebook.store.create_notebook("Bound Session")
    sourcebook.store.add_source(nb["id"], "Notes", "Quantum error correction uses surface codes with logical error rates below 1%.", kind="text")
    assert ctx.hooks["pre_llm_call"](session_id="sess_unbound", user_message="surface codes") is None
    sourcebook.store.bind_session("sess_bound", nb["id"])
    injected = ctx.hooks["pre_llm_call"](session_id="sess_bound", user_message="surface codes")
    assert injected is not None and "surface codes" in injected["context"]


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

    assert client.get("/api/plugins/sourcebook/ping").json()["ok"] is True
    nb = client.post("/api/plugins/sourcebook/notebooks", json={"title": "API Test"}).json()

    up = client.post(
        f"/api/plugins/sourcebook/notebooks/{nb['id']}/sources/upload",
        files={"file": ("notes.md", b"# Caching\n\nContent-addressed caching cuts rebuild time by 74%.", "text/markdown")},
    )
    assert up.status_code == 200
    assert up.json()["chunk_count"] >= 1

    ask_job = client.post(
        f"/api/plugins/sourcebook/notebooks/{nb['id']}/ask",
        json={"text": "How much does caching cut rebuild time?", "extractive": True},
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


def test_desktop_bundle_passes_syntax_and_house_lint() -> None:
    bundle = REPO_ROOT / "desktop" / "plugin.js"
    assert bundle.is_file()
    r1 = subprocess.run(["node", "--check", str(bundle)], capture_output=True, text=True, check=False)
    assert r1.returncode == 0, r1.stderr
    r2 = subprocess.run(["node", str(REPO_ROOT / "tests" / "lint_desktop.mjs")], capture_output=True, text=True, check=False)
    assert r2.returncode == 0, r2.stdout + r2.stderr
