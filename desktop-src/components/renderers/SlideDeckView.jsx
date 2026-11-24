import { useEffect, useState } from 'react'
import { Icon } from '../../sdk.js'
import { copyText, downloadTextFile } from '../../api.js'

export function SlideDeckView({ artifact, onOpenChunk }) {
  const slides = artifact?.spec?.slides || []
  const [idx, setIdx] = useState(0)
  const [showNotes, setShowNotes] = useState(true)

  useEffect(() => {
    setIdx(0)
  }, [artifact?.id])

  if (!slides.length) {
    return <div className="fl-empty">No slides in this deck.</div>
  }

  const sl = slides[idx] || slides[0]

  function toMarp() {
    const lines = ['---', 'marp: true', `title: ${artifact?.spec?.title || 'Folio Deck'}`, 'paginate: true', '---', '']
    slides.forEach((s, i) => {
      if (i > 0) lines.push('\n---\n')
      lines.push(`# ${s.title || ''}\n`)
      if (s.stat?.value) lines.push(`## ${s.stat.value}\n${s.stat.label || ''}\n`)
      ;(s.bullets || []).forEach(b => lines.push(`- ${b}`))
      if (s.body) lines.push(`\n${s.body}`)
      if (s.notes) lines.push(`\n<!--\n${s.notes}\n-->`)
    })
    return lines.join('\n')
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') setIdx(i => Math.min(slides.length - 1, i + 1))
        if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button type="button" className="fl-btn fl-btn-icon" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>
            <Icon name="ChevronLeft" size={13} />
          </button>
          <span className="fl-mono" style={{ fontSize: 12, color: 'var(--ui-text-secondary)', padding: '0 4px' }}>
            {idx + 1} / {slides.length}
          </span>
          <button type="button" className="fl-btn fl-btn-icon" disabled={idx >= slides.length - 1} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>
            <Icon name="ChevronRight" size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" className="fl-btn" data-active={showNotes} onClick={() => setShowNotes(v => !v)}>
            Speaker notes
          </button>
          <button type="button" className="fl-btn" onClick={() => copyText(toMarp())}>
            <Icon name="Copy" size={12} /> Marp
          </button>
          <button type="button" className="fl-btn" onClick={() => downloadTextFile(`${artifact.id || 'deck'}.marp.md`, toMarp(), 'text/markdown;charset=utf-8')}>
            <Icon name="Download" size={12} /> .md
          </button>
        </div>
      </div>

      <section className="fl-slide-stage">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="fl-kind-tag">{sl.layout || 'slide'}</span>
          <span className="fl-mono" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
            {String(idx + 1).padStart(2, '0')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, my: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: sl.layout === 'title' ? 21 : 17, fontWeight: 700, lineHeight: 1.25 }}>
            {sl.title}
          </h2>
          {sl.stat?.value ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="fl-mono" style={{ fontSize: 32, fontWeight: 750, color: 'var(--ui-accent)', lineHeight: 1 }}>
                {sl.stat.value}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--ui-text-secondary)' }}>{sl.stat.label}</span>
            </div>
          ) : null}
          {sl.body ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ui-text-secondary)', lineHeight: 1.5 }}>{sl.body}</p>
          ) : null}
          {(sl.bullets || []).length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
              {sl.bullets.map((b, bIdx) => <li key={bIdx}>{b}</li>)}
            </ul>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(sl.cites || []).map((cid, cIdx) => (
              <button key={cid} type="button" className="fl-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                {cIdx + 1}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>{artifact?.spec?.title || 'Folio Deck'}</span>
        </div>
      </section>

      {showNotes && sl.notes ? (
        <div className="fl-quote-box">
          <strong style={{ display: 'block', fontSize: 11, color: 'var(--ui-text-tertiary)', marginBottom: 3 }}>
            SPEAKER NOTES
          </strong>
          {sl.notes}
        </div>
      ) : null}

      <div className="fl-slide-strip fl-scroll">
        {slides.map((s, sIdx) => (
          <button
            key={sIdx}
            type="button"
            className="fl-slide-thumb"
            data-active={sIdx === idx}
            onClick={() => setIdx(sIdx)}
          >
            <div className="fl-mono" style={{ fontSize: 10, color: 'var(--ui-text-tertiary)' }}>{sIdx + 1}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 550, marginTop: 2 }}>
              {s.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
