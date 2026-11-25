import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { api, copyText, downloadTextFile } from '../../api.js'

function b64ToBlobUrl(b64, mime = 'audio/mpeg') {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i)
  const blob = new Blob([arr], { type: mime })
  return { url: URL.createObjectURL(blob), blob }
}

export function AudioOverviewView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const spec = artifact?.spec || {}
  const turns = spec.turns || []
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [rate, setRate] = useState(1)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    let alive = true
    let createdUrl = ''
    setAudioUrl('')
    setAudioBlob(null)
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
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [nbId, artifact?.id, artifact?.has_audio])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [rate, audioUrl])

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
    setAsking(true)
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/followup`, {
        method: 'POST',
        body: { question: q }
      })
      setQuestion('')
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact)
      }
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Hosts answered your follow-up.' })
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not ask hosts.' })
    } finally {
      setAsking(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="sb-kind-tag">{(spec.style || 'deep_dive').replace('_', ' ')}</span>
          <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
            {(spec.hosts || ['Alex', 'Maya']).join(' & ')}
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

      <div className="sb-ledger-row" style={{ gap: 8 }}>
        {audioUrl ? (
          <>
            <audio ref={audioRef} controls src={audioUrl} style={{ width: '100%', height: 36 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
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
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="Headphones" size={14} style={{ color: 'var(--ui-accent)' }} />
            <span>
              {loadingAudio
                ? 'Loading neural podcast audio...'
                : 'Interactive cited transcript ready (offline or TTS skipped). Click any citation pill to inspect its source.'}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {turns.map((t, idx) => {
          const sp = String(t.speaker || 'Host')
          const isHostB = sp.toLowerCase() === 'maya' || sp.toLowerCase() === 'host b'
          const isListener = sp.toLowerCase() === 'listener'
          return (
            <article
              key={t.id || idx}
              className="sb-ledger-row"
              style={{
                borderLeft: `3px solid ${isListener ? 'var(--sb-ok)' : isHostB ? 'var(--sb-warn)' : 'var(--ui-accent)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 650, color: 'var(--ui-text-primary)' }}>{sp}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(t.cites || []).map((cid, cIdx) => (
                    <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                      {cIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--ui-text-secondary)' }}>{t.text}</div>
            </article>
          )
        })}
      </div>

      <form onSubmit={askHosts} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <input
          className="sb-input"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Interrupt & ask the hosts a follow-up question..."
          disabled={asking}
        />
        <button type="submit" className="sb-btn sb-btn-primary" disabled={asking || !question.trim()}>
          {asking ? 'Asking...' : 'Ask Hosts'}
        </button>
      </form>
    </div>
  )
}
