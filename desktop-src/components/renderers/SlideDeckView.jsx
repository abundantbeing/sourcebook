import { useEffect, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { api, copyText, downloadTextFile, getContext } from '../../api.js'

export function SlideDeckView({ nbId, artifact, onOpenChunk }) {
  const slides = artifact?.spec?.slides || []
  const [idx, setIdx] = useState(0)
  const [showNotes, setShowNotes] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    setIdx(0)
    setPresenting(false)
  }, [artifact?.id])

  useEffect(() => {
    if (!presenting) {
      setElapsedSec(0)
      return undefined
    }
    const ctx = getContext()
    if (ctx && typeof ctx.setInterval === 'function') {
      return ctx.setInterval(() => setElapsedSec(s => s + 1), 1000)
    }
    return undefined
  }, [presenting])

  if (!slides.length) {
    return <div className="sb-empty">No slides in this deck.</div>
  }

  const sl = slides[idx] || slides[0]
  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
  const secs = String(elapsedSec % 60).padStart(2, '0')

  function toMarp() {
    const lines = ['---', 'marp: true', `title: ${artifact?.spec?.title || 'SourceBook Deck'}`, 'paginate: true', '---', '']
    slides.forEach((s, i) => {
      if (i > 0) lines.push('\n---\n')
      lines.push(`# ${s.title || ''}\n`)
      if (s.stat?.value) lines.push(`## ${s.stat.value}\n${s.stat.label || ''}\n`)
      if (s.image_url) lines.push(`![${s.title || 'Slide illustration'}](${s.image_url})\n`)
      ;(s.bullets || []).forEach(b => lines.push(`- ${b}`))
      if (s.body) lines.push(`\n${s.body}`)
      if (s.notes) lines.push(`\n<!--\n${s.notes}\n-->`)
    })
    return lines.join('\n')
  }

  async function downloadHtmlDeck() {
    if (!nbId || !artifact?.id) return
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-payload?fmt=html`)
      if (res?.content) {
        downloadTextFile(res.filename || `${artifact.id}.deck.html`, res.content, res.media_type || 'text/html;charset=utf-8')
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not export HTML deck.' })
    }
  }

  function renderSlideCard(large = false) {
    return (
      <section className="sb-slide-stage" style={large ? { maxWidth: 960, width: '100%', padding: '32px 40px' } : undefined}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sb-kind-tag">{sl.layout || 'slide'}</span>
          <span className="sb-mono" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
            {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBlock: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: large ? (sl.layout === 'title' ? 32 : 24) : (sl.layout === 'title' ? 21 : 17), fontWeight: 700, lineHeight: 1.25 }}>
            {sl.title}
          </h2>
          {sl.stat?.value ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="sb-mono" style={{ fontSize: large ? 48 : 32, fontWeight: 750, color: 'var(--ui-accent)', lineHeight: 1 }}>
                {sl.stat.value}
              </span>
              <span style={{ fontSize: large ? 15 : 12.5, color: 'var(--ui-text-secondary)' }}>{sl.stat.label}</span>
            </div>
          ) : null}
          {sl.image_url ? (
            <img
              src={sl.image_url}
              alt={sl.title || 'Slide illustration'}
              style={{ width: '100%', maxHeight: large ? 240 : 150, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--ui-stroke-tertiary)' }}
            />
          ) : null}
          {sl.body ? (
            <p style={{ margin: 0, fontSize: large ? 15.5 : 13, color: 'var(--ui-text-secondary)', lineHeight: 1.5 }}>{sl.body}</p>
          ) : null}
          {(sl.bullets || []).length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: large ? 8 : 5, fontSize: large ? 15 : 12.5 }}>
              {sl.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
            </ul>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(sl.cites || []).map((cid, cIdx) => (
              <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                {cIdx + 1}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>{artifact?.spec?.title || 'SourceBook Deck'}</span>
        </div>
      </section>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') setIdx(i => Math.min(slides.length - 1, i + 1))
        if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
        if (e.key === 'Escape' && presenting) setPresenting(false)
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button type="button" className="sb-btn sb-btn-icon" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>
            <Icon name="ChevronLeft" size={13} />
          </button>
          <span className="sb-mono" style={{ fontSize: 12, color: 'var(--ui-text-secondary)', padding: '0 4px' }}>
            {idx + 1} / {slides.length}
          </span>
          <button type="button" className="sb-btn sb-btn-icon" disabled={idx >= slides.length - 1} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>
            <Icon name="ChevronRight" size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => setPresenting(true)} title="Launch full-window Presenter Mode">
            <Icon name="Play" size={12} /> Present
          </button>
          <button type="button" className="sb-btn" data-active={showNotes} onClick={() => setShowNotes(v => !v)}>
            Notes
          </button>
          <button type="button" className="sb-btn" onClick={() => copyText(toMarp())}>
            <Icon name="Copy" size={12} /> Marp
          </button>
          <button type="button" className="sb-btn" onClick={downloadHtmlDeck} title="Download self-contained offline HTML presentation">
            <Icon name="Download" size={12} /> HTML Deck
          </button>
        </div>
      </div>

      {renderSlideCard(false)}

      {showNotes && sl.notes ? (
        <div className="sb-quote-box">
          <strong style={{ display: 'block', fontSize: 11, color: 'var(--ui-text-tertiary)', marginBottom: 3 }}>
            SPEAKER NOTES
          </strong>
          {sl.notes}
        </div>
      ) : null}

      <div className="sb-slide-strip sb-scroll">
        {slides.map((s, sIdx) => (
          <button
            key={sIdx}
            type="button"
            className="sb-slide-thumb"
            data-active={sIdx === idx}
            onClick={() => setIdx(sIdx)}
          >
            <div className="sb-mono" style={{ fontSize: 10, color: 'var(--ui-text-tertiary)' }}>{sIdx + 1}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 550, marginTop: 2 }}>
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {presenting ? (
        <div
          className="sb-modal-backdrop"
          style={{ flexDirection: 'column', gap: 14, padding: 24, zIndex: 80 }}
          onClick={() => setPresenting(false)}
        >
          <div
            style={{ width: 'min(980px, 95vw)', display: 'flex', flexDirection: 'column', gap: 12 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="sb-kind-tag">Presenter Mode</span>
                <span className="sb-mono" style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>{mins}:{secs}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="sb-btn" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>Prev</button>
                <button type="button" className="sb-btn" disabled={idx >= slides.length - 1} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>Next</button>
                <button type="button" className="sb-btn" onClick={() => setPresenting(false)}>
                  <Icon name="X" size={13} /> Exit
                </button>
              </div>
            </div>
            {renderSlideCard(true)}
            {sl.notes ? (
              <div className="sb-quote-box" style={{ background: 'var(--sb-surface)' }}>
                <strong style={{ display: 'block', fontSize: 11, color: 'var(--ui-text-tertiary)', marginBottom: 3 }}>SPEAKER NOTES</strong>
                {sl.notes}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
