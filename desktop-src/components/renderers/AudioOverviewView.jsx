import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { api, copyText, downloadTextFile, getContext } from '../../api.js'
import { DitherCanvas, HermesSpinner } from '../DitherSurface.jsx'

function b64ToBlobUrl(b64, mime = 'audio/mpeg') {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i)
  const blob = new Blob([arr], { type: mime })
  return { url: URL.createObjectURL(blob), blob }
}

const ENGINE_LABELS = {
  hermes_tts: 'Hermes TTS',
  edge_tts: 'Edge Neural TTS',
  browser: 'Desktop Voices'
}

export function AudioOverviewView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const spec = artifact?.spec || {}
  const turns = spec.turns || []
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [speakingIdx, setSpeakingIdx] = useState(-1)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [replyUrl, setReplyUrl] = useState('')
  const [replyPlaying, setReplyPlaying] = useState(false)
  const [replyEngine, setReplyEngine] = useState('')
  const [canResumeEpisode, setCanResumeEpisode] = useState(false)

  const audioRef = useRef(null)
  const replyAudioRef = useRef(null)
  const resumeTimeRef = useRef(0)
  const resumeTurnRef = useRef(-1)
  const stopSpeakRef = useRef(false)
  const replyUrlRef = useRef('')

  const canBrowserSpeak = typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
  const isActivelyPlaying = audioPlaying || replyPlaying || speakingIdx >= 0

  useEffect(() => {
    stopSpeech()
    let alive = true
    let createdUrl = ''
    setAudioUrl('')
    setAudioBlob(null)
    setAudioPlaying(false)
    setCanResumeEpisode(false)
    if (replyUrlRef.current) {
      URL.revokeObjectURL(replyUrlRef.current)
      replyUrlRef.current = ''
    }
    setReplyUrl('')
    setReplyPlaying(false)
    if (!nbId || !artifact?.id || !artifact?.has_audio) return undefined
    setLoadingAudio(true)
    api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/audio-data`)
      .then(res => {
        if (!alive || !res?.available || !res?.b64) return
        const { url, blob } = b64ToBlobUrl(res.b64, res.mime || 'audio/mpeg')
        createdUrl = url
        setAudioUrl(url)
        setAudioBlob(blob)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingAudio(false)
      })
    return () => {
      alive = false
      stopSpeech()
      if (createdUrl) URL.revokeObjectURL(createdUrl)
      if (replyUrlRef.current) {
        URL.revokeObjectURL(replyUrlRef.current)
        replyUrlRef.current = ''
      }
    }
  }, [nbId, artifact?.id, artifact?.has_audio])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate
    if (replyAudioRef.current) replyAudioRef.current.playbackRate = rate
  }, [rate, audioUrl, replyUrl])

  function stopSpeech() {
    stopSpeakRef.current = true
    setSpeakingIdx(-1)
    if (canBrowserSpeak) {
      try { window.speechSynthesis.cancel() } catch {}
    }
  }

  function playBrowserSpeech(startAt = 0, turnList = turns, endExclusive = null) {
    if (!canBrowserSpeak || !turnList.length) return
    stopSpeech()
    stopSpeakRef.current = false
    const voices = window.speechSynthesis.getVoices() || []
    const enVoices = voices.filter(v => /^en/i.test(v.lang || ''))
    const voiceA = enVoices[0] || voices[0] || null
    const voiceB = enVoices[1] || enVoices[0] || voices[1] || voiceA
    const limit = endExclusive != null ? Math.min(turnList.length, endExclusive) : turnList.length

    const speakTurn = i => {
      if (stopSpeakRef.current || i >= limit) {
        setSpeakingIdx(-1)
        return
      }
      const t = turnList[i]
      if (String(t?.speaker || '').toLowerCase() === 'listener') {
        speakTurn(i + 1)
        return
      }
      setSpeakingIdx(i)
      const utt = new SpeechSynthesisUtterance(String(t?.text || ''))
      const sp = String(t?.speaker || '').toLowerCase()
      const isB = sp === 'maya' || sp === 'host b' || (sp !== 'alex' && i % 2 === 1)
      if (isB && voiceB) utt.voice = voiceB
      else if (voiceA) utt.voice = voiceA
      utt.rate = rate
      utt.pitch = isB ? 1.08 : 0.95
      utt.onend = () => speakTurn(i + 1)
      utt.onerror = () => setSpeakingIdx(-1)
      window.speechSynthesis.speak(utt)
    }
    speakTurn(startAt)
  }

  function pauseMainForInterrupt() {
    let wasPlaying = false
    if (audioRef.current && !audioRef.current.paused) {
      resumeTimeRef.current = audioRef.current.currentTime || 0
      audioRef.current.pause()
      setAudioPlaying(false)
      wasPlaying = true
    }
    if (speakingIdx >= 0) {
      resumeTurnRef.current = speakingIdx
      stopSpeech()
      wasPlaying = true
    }
    if (wasPlaying) setCanResumeEpisode(true)
  }

  function resumeEpisode() {
    if (replyAudioRef.current && !replyAudioRef.current.paused) {
      replyAudioRef.current.pause()
    }
    setReplyPlaying(false)
    stopSpeech()
    setCanResumeEpisode(false)
    if (audioRef.current && audioUrl) {
      if (resumeTimeRef.current > 0) {
        audioRef.current.currentTime = resumeTimeRef.current
      }
      audioRef.current.play().catch(() => {})
      return
    }
    if (canBrowserSpeak && resumeTurnRef.current >= 0) {
      playBrowserSpeech(resumeTurnRef.current)
    }
  }

  function playReplyAudioB64(b64, mime = 'audio/mpeg') {
    if (replyUrlRef.current) URL.revokeObjectURL(replyUrlRef.current)
    const { url } = b64ToBlobUrl(b64, mime)
    replyUrlRef.current = url
    setReplyUrl(url)
    const startReply = () => {
      if (replyAudioRef.current) {
        replyAudioRef.current.playbackRate = rate
        replyAudioRef.current.play().catch(() => {})
      }
    }
    const ctx = getContext()
    if (ctx && typeof ctx.setTimeout === 'function') {
      ctx.setTimeout(startReply, 60)
    } else {
      startReply()
    }
  }

  async function replaySavedReply(audioFile, turnIdx) {
    pauseMainForInterrupt()
    if (audioFile && nbId && artifact?.id) {
      try {
        const res = await api(
          `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/media-data/${encodeURIComponent(audioFile)}`
        )
        if (res?.available && res.b64) {
          playReplyAudioB64(res.b64, res.mime || 'audio/mpeg')
          return
        }
      } catch {}
    }
    if (canBrowserSpeak) {
      playBrowserSpeech(turnIdx, turns, turnIdx + 2)
    }
  }

  function toMarkdown() {
    const lines = [`# ${spec.title || 'Audio Overview'}`, '']
    if (spec.subtitle) lines.push(`*${spec.subtitle}*`, '')
    for (const t of turns) {
      const cites = (t.cites || []).length ? ` (${t.cites.join(', ')})` : ''
      lines.push(`**${t.speaker || 'Host'}:** ${t.text || ''}${cites}`, '')
    }
    return lines.join('\n').trim()
  }

  function downloadMp3() {
    if (!audioBlob) return
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.id || 'audio-overview'}.mp3`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function askHosts(e) {
    e.preventDefault()
    const q = question.trim()
    if (!q || asking || !nbId || !artifact?.id) return
    pauseMainForInterrupt()
    setAsking(true)
    const estTurn =
      speakingIdx >= 0
        ? speakingIdx
        : audioRef.current && audioRef.current.duration > 0
          ? Math.min(turns.length - 1, Math.floor((audioRef.current.currentTime / audioRef.current.duration) * turns.length))
          : null
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/followup`, {
        method: 'POST',
        body: { question: q, current_turn_idx: estTurn }
      })
      setQuestion('')
      const updatedArt = res?.artifact
      if (updatedArt) {
        onArtifactUpdated?.(updatedArt)
      }
      const engine = res?.tts_engine || 'browser'
      setReplyEngine(engine)
      if (res?.audio_b64) {
        playReplyAudioB64(res.audio_b64, res.audio_mime || 'audio/mpeg')
      } else if (canBrowserSpeak && updatedArt?.spec?.turns?.length) {
        const allTurns = updatedArt.spec.turns
        const startIdx = Math.max(0, allTurns.length - (res?.added_turns?.length || 2))
        playBrowserSpeech(startIdx, allTurns, allTurns.length)
      }
      sdk.host?.notify?.({
        kind: 'success',
        title: 'SourceBook',
        message: `Alex & Maya answered aloud (${ENGINE_LABELS[engine] || 'Spoken Reply'}).`
      })
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not ask hosts.' })
    } finally {
      setAsking(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sb-inf-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sb-kind-tag">{(spec.style || 'deep_dive').replace('_', ' ')}</span>
          <span style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>
            {(spec.hosts || ['Alex', 'Maya']).join(' & ')} · <span className="sb-mono">{turns.length}</span> turns
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button type="button" className="sb-btn" onClick={() => copyText(toMarkdown())}>
            <Icon name="Copy" size={12} /> Script
          </button>
          <button
            type="button"
            className="sb-btn"
            onClick={() => downloadTextFile(`${artifact.id || 'audio-overview'}.md`, toMarkdown(), 'text/markdown;charset=utf-8')}
          >
            <Icon name="Download" size={12} /> .md
          </button>
          {audioBlob ? (
            <button type="button" className="sb-btn sb-btn-primary" onClick={downloadMp3}>
              <Icon name="Download" size={12} /> MP3
            </button>
          ) : null}
        </div>
      </div>

      {/* Studio Audio Stage with Bayer Ordered-Dither Live Waveform (animates ONLY while playing) */}
      <div className="sb-audio-stage">
        <DitherCanvas
          variant="wave"
          animated={isActivelyPlaying}
          color={replyPlaying ? '#10b981' : 'var(--ui-accent)'}
          secondaryColor="#f59e0b"
          opacity={isActivelyPlaying ? 0.58 : 0.28}
          cols={168}
          rows={32}
          style={{ width: '100%', height: 64, display: 'block', borderRadius: 7 }}
        />

        {audioUrl ? (
          <audio
            ref={audioRef}
            controls
            src={audioUrl}
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
            onEnded={() => setAudioPlaying(false)}
            style={{ width: '100%', height: 36 }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="Headphones" size={14} style={{ color: 'var(--ui-accent)' }} />
              <span>
                {loadingAudio
                  ? 'Loading podcast audio...'
                  : 'Listen instantly with dual desktop voices, or install free edge-tts / configure Hermes TTS for MP3 episodes & spoken Q&A.'}
              </span>
            </div>
            {canBrowserSpeak && turns.length > 0 ? (
              speakingIdx >= 0 ? (
                <button type="button" className="sb-btn" onClick={stopSpeech}>
                  <Icon name="X" size={12} /> Stop
                </button>
              ) : (
                <button type="button" className="sb-btn sb-btn-primary" onClick={() => playBrowserSpeech(0)}>
                  <Icon name="Play" size={12} /> Listen aloud
                </button>
              )
            ) : null}
          </div>
        )}

        {/* Spoken Host Reply Mini-Player (Join the Podcast Interruption!) */}
        {replyUrl || canResumeEpisode ? (
          <div className="sb-audio-reply-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: '#10b981' }}>
                <Icon name="Volume2" size={13} />
                <span>Alex &amp; Maya Live Reply</span>
                {replyEngine ? <span className="sb-kind-tag">{ENGINE_LABELS[replyEngine] || replyEngine}</span> : null}
              </div>
              {canResumeEpisode ? (
                <button type="button" className="sb-btn sb-btn-primary" style={{ padding: '3px 9px', fontSize: 11 }} onClick={resumeEpisode}>
                  <Icon name="Play" size={11} /> Resume Episode
                </button>
              ) : null}
            </div>
            {replyUrl ? (
              <audio
                ref={replyAudioRef}
                controls
                src={replyUrl}
                onPlay={() => setReplyPlaying(true)}
                onPause={() => setReplyPlaying(false)}
                onEnded={() => setReplyPlaying(false)}
                style={{ width: '100%', height: 32 }}
              />
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingTop: 4, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
          <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Playback speed</span>
          <div className="sb-seg">
            {[0.75, 1, 1.25, 1.5, 2].map(v => (
              <button
                key={v}
                type="button"
                className="sb-seg-btn"
                data-active={rate === v}
                onClick={() => setRate(v)}
              >
                {v}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Join the Podcast / Interrupt Input right below Stage for immediate live Q&A */}
      <form onSubmit={askHosts} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <input
          className="sb-input"
          style={{ flex: '1 1 180px', minWidth: 0 }}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Join the podcast - interrupt Alex & Maya with a question..."
          disabled={asking}
        />
        <button type="submit" className="sb-btn sb-btn-primary" disabled={asking || !question.trim()}>
          {asking ? <HermesSpinner size={12} /> : <Icon name="Mic" size={12} />}{' '}
          {asking ? 'Hosts replying...' : 'Interrupt & Ask'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {turns.map((t, idx) => {
          const sp = String(t.speaker || 'Host')
          const isHostB = sp.toLowerCase() === 'maya' || sp.toLowerCase() === 'host b'
          const isListener = sp.toLowerCase() === 'listener'
          const isSpeaking = speakingIdx === idx
          const accent = isListener ? '#10b981' : isHostB ? '#f59e0b' : 'var(--ui-accent)'
          return (
            <article
              key={t.id || idx}
              className="sb-ledger-row"
              style={{
                borderLeft: `3px solid ${accent}`,
                background: isSpeaking ? 'var(--sb-accent-soft)' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    className="sb-mono"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10.5,
                      fontWeight: 750,
                      background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                      color: accent,
                      border: `1px solid color-mix(in srgb, ${accent} 36%, transparent)`
                    }}
                  >
                    {sp.slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--ui-text-primary)' }}>
                    {sp}
                  </span>
                  {t.interrupt && !isListener ? <span className="sb-kind-tag" style={{ color: '#10b981' }}>Live Q&amp;A</span> : null}
                  {isSpeaking ? <span className="sb-kind-tag" style={{ color: accent }}>Speaking</span> : null}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {t.audio_file || (t.interrupt && sp.toLowerCase() === 'alex' && canBrowserSpeak) ? (
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost"
                      style={{ padding: '2px 6px', fontSize: 10.5 }}
                      onClick={() => replaySavedReply(t.audio_file, idx)}
                      title="Play spoken host answer"
                    >
                      <Icon name="Volume2" size={11} /> Play
                    </button>
                  ) : null}
                  {(t.cites || []).map((cid, cIdx) => (
                    <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                      {cIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.58, color: 'var(--ui-text-secondary)' }}>{t.text}</div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
