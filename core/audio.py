"""2-Host Podcast Audio Overview synthesis: Hermes configured TTS tool first (ElevenLabs, OpenAI, Gemini, Piper, etc.), then Edge TTS fallback."""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
from pathlib import Path
from typing import Any, Optional

from . import runtime

logger = logging.getLogger("sourcebook.audio")

VOICE_PAIRS: dict[str, tuple[str, str]] = {
    "english": ("en-US-AndrewMultilingualNeural", "en-US-AvaMultilingualNeural"),
    "spanish": ("es-ES-AlvaroNeural", "es-ES-ElviraNeural"),
    "french": ("fr-FR-HenriNeural", "fr-FR-DeniseNeural"),
    "german": ("de-DE-ConradNeural", "de-DE-KatjaNeural"),
    "japanese": ("ja-JP-KeitaNeural", "ja-JP-NanamiNeural"),
    "portuguese": ("pt-BR-AntonioNeural", "pt-BR-FranciscaNeural"),
}


def _synth_via_hermes_tts(turns: list[dict[str, Any]], *, ctx: Any = None) -> Optional[bytes]:
    """Use Hermes's own configured `text_to_speech` tool (ElevenLabs, OpenAI, Gemini, Piper, etc.)."""
    if not runtime._probe_tool("text_to_speech"):
        return None
    out = bytearray()
    with tempfile.TemporaryDirectory(prefix="sb_tts_") as tmpdir:
        for idx, turn in enumerate(turns[:16]):
            text = str(turn.get("text") or "").strip()
            if not text:
                continue
            speaker = str(turn.get("speaker") or "").strip().lower()
            is_b = speaker in ("maya", "host b", "host_b", "b") or (speaker not in ("alex", "host a", "host_a", "a") and idx % 2 == 1)
            out_file = Path(tmpdir) / f"turn_{idx:02d}.mp3"
            args: dict[str, Any] = {
                "text": text,
                "output_path": str(out_file),
                "instructions": (
                    "Speak warmly and curiously as podcast co-host Maya."
                    if is_b
                    else "Speak clearly and analytically as podcast host Alex."
                ),
            }
            try:
                runtime.dispatch_tool("text_to_speech", args, ctx=ctx)
                if out_file.is_file() and out_file.stat().st_size > 256:
                    out.extend(out_file.read_bytes())
                else:
                    return None
            except Exception as exc:
                logger.debug("Hermes text_to_speech turn %d skipped: %s", idx, exc)
                return None
    return bytes(out) if len(out) > 512 else None


async def _synth_edge_turn(edge_tts_mod: Any, text: str, voice: str) -> bytes:
    comm = edge_tts_mod.Communicate(text=text, voice=voice)
    buf = bytearray()
    async for chunk in comm.stream():
        if chunk.get("type") == "audio" and chunk.get("data"):
            buf.extend(chunk["data"])
    return bytes(buf)


async def _render_edge_async(turns: list[dict[str, Any]], language: str = "English") -> bytes:
    import edge_tts  # type: ignore

    lang_key = (language or "english").strip().lower()
    voice_a, voice_b = VOICE_PAIRS.get(lang_key, VOICE_PAIRS["english"])
    out = bytearray()
    for idx, turn in enumerate(turns[:24]):
        text = str(turn.get("text") or "").strip()
        if not text:
            continue
        speaker = str(turn.get("speaker") or "").strip().lower()
        use_b = speaker in ("maya", "host b", "host_b", "b", "co-host") or (speaker not in ("alex", "host a", "host_a", "a") and idx % 2 == 1)
        voice = voice_b if use_b else voice_a
        audio_chunk = await _synth_edge_turn(edge_tts, text, voice)
        if audio_chunk:
            out.extend(audio_chunk)
    return bytes(out)


def synthesize_dialogue_with_engine(
    turns: list[dict[str, Any]],
    *,
    language: str = "English",
    ctx: Any = None,
) -> tuple[Optional[bytes], str]:
    """Synthesize a 2-host dialogue MP3 and report which TTS tier succeeded (`hermes_tts`, `edge_tts`, or `browser`)."""
    if not turns:
        return None, "browser"

    # Tier 1: User's configured Hermes TTS provider (ElevenLabs, OpenAI, Gemini, Piper, etc.)
    hermes_mp3 = _synth_via_hermes_tts(turns, ctx=ctx)
    if hermes_mp3:
        return hermes_mp3, "hermes_tts"

    # Tier 2: Free Edge Neural TTS fallback (Andrew & Ava multilingual neural voices, zero API key required)
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        return None, "browser"

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                data = pool.submit(asyncio.run, _render_edge_async(turns, language)).result(timeout=90)
        else:
            data = asyncio.run(_render_edge_async(turns, language))
        if data and len(data) > 512:
            return data, "edge_tts"
    except Exception as exc:
        logger.debug("Audio Overview Edge TTS synthesis skipped: %s", exc)
    return None, "browser"


def synthesize_dialogue_mp3(
    turns: list[dict[str, Any]],
    *,
    language: str = "English",
    ctx: Any = None,
) -> Optional[bytes]:
    """Synthesize a 2-host podcast MP3 via Hermes's configured TTS tool or Edge TTS fallback."""
    data, _ = synthesize_dialogue_with_engine(turns, language=language, ctx=ctx)
    return data
