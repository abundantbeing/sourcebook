"""2-Host Podcast Audio Overview synthesis via Edge neural TTS (free, zero-key) with graceful transcript-only fallback."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

logger = logging.getLogger("sourcebook.audio")

# Multilingual neural voice pairs (Host A / Host B)
VOICE_PAIRS: dict[str, tuple[str, str]] = {
    "english": ("en-US-AndrewMultilingualNeural", "en-US-AvaMultilingualNeural"),
    "spanish": ("es-ES-AlvaroNeural", "es-ES-ElviraNeural"),
    "french": ("fr-FR-HenriNeural", "fr-FR-DeniseNeural"),
    "german": ("de-DE-ConradNeural", "de-DE-KatjaNeural"),
    "japanese": ("ja-JP-KeitaNeural", "ja-JP-NanamiNeural"),
    "portuguese": ("pt-BR-AntonioNeural", "pt-BR-FranciscaNeural"),
}


async def _synth_turn(edge_tts_mod: Any, text: str, voice: str) -> bytes:
    comm = edge_tts_mod.Communicate(text=text, voice=voice)
    buf = bytearray()
    async for chunk in comm.stream():
        if chunk.get("type") == "audio" and chunk.get("data"):
            buf.extend(chunk["data"])
    return bytes(buf)


async def _render_dialogue_async(turns: list[dict[str, Any]], language: str = "English") -> bytes:
    import edge_tts  # type: ignore

    lang_key = (language or "english").strip().lower()
    voice_a, voice_b = VOICE_PAIRS.get(lang_key, VOICE_PAIRS["english"])
    out = bytearray()
    for idx, turn in enumerate(turns[:30]):
        text = str(turn.get("text") or "").strip()
        if not text:
            continue
        speaker = str(turn.get("speaker") or "").strip().lower()
        use_b = speaker in ("maya", "host b", "host_b", "b", "co-host") or (speaker not in ("alex", "host a", "host_a", "a") and idx % 2 == 1)
        voice = voice_b if use_b else voice_a
        audio_chunk = await _synth_turn(edge_tts, text, voice)
        if audio_chunk:
            out.extend(audio_chunk)
    return bytes(out)


def synthesize_dialogue_mp3(
    turns: list[dict[str, Any]],
    *,
    language: str = "English",
) -> Optional[bytes]:
    """Synthesize a 2-host podcast MP3 from dialogue turns. Returns None cleanly if TTS/network is unavailable."""
    if not turns:
        return None
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        return None

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                data = pool.submit(asyncio.run, _render_dialogue_async(turns, language)).result(timeout=90)
        else:
            data = asyncio.run(_render_dialogue_async(turns, language))
        return data if data and len(data) > 512 else None
    except Exception as exc:
        logger.debug("Audio Overview TTS synthesis skipped: %s", exc)
        return None
