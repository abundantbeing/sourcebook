import { useEffect, useState } from 'react'
import { Icon } from '../../sdk.js'
import { api, downloadTextFile } from '../../api.js'

function nextSm2(prev, quality) {
  const ease = Math.max(1.3, (prev?.ease ?? 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  let reps = prev?.reps ?? 0
  let interval = prev?.interval ?? 1
  if (quality < 3) {
    reps = 0
    interval = 1
  } else {
    reps += 1
    if (reps === 1) interval = 1
    else if (reps === 2) interval = 6
    else interval = Math.round(interval * ease)
  }
  return {
    ease: Number(ease.toFixed(2)),
    reps,
    interval,
    due_at: Date.now() / 1000 + interval * 86400
  }
}

export function FlashcardsView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const cards = artifact?.spec?.cards || []
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [cursor, setCursor] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [sm2, setSm2] = useState(() => artifact?.state?.sm2 || {})

  useEffect(() => {
    setOrder(cards.map((_, i) => i))
    setCursor(0)
    setFlipped(false)
    setShowHint(false)
    setSm2(artifact?.state?.sm2 || {})
  }, [artifact?.id])

  if (!cards.length) {
    return <div className="sb-empty">No flashcards in this deck.</div>
  }

  const card = cards[order[cursor] ?? 0] || cards[0]
  const cardId = card.id || String(order[cursor] ?? 0)
  const mastered = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) >= 2).length
  const due = cards.filter((c, i) => {
    const s = sm2[c.id || String(i)]
    return !s || !s.due_at || s.due_at <= Date.now() / 1000
  }).length

  async function grade(quality) {
    const updated = { ...sm2, [cardId]: nextSm2(sm2[cardId], quality) }
    setSm2(updated)
    setFlipped(false)
    setShowHint(false)
    setCursor(c => (c + 1) % order.length)
    try {
      const next = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/state`, {
        method: 'PATCH',
        body: { sm2: updated }
      })
      onArtifactUpdated?.(next)
    } catch {
      // keep optimistic state
    }
  }

  function shuffle() {
    const copy = [...order]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    setOrder(copy)
    setCursor(0)
    setFlipped(false)
    setShowHint(false)
  }

  function exportCsv() {
    const rows = [['Front', 'Back', 'Hint', 'Citations']]
    for (const c of cards) {
      rows.push([c.front || '', c.back || '', c.hint || '', (c.cites || []).join('; ')])
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadTextFile(`${artifact.id || 'flashcards'}.csv`, csv, 'text/csv;charset=utf-8')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ui-text-secondary)' }}>
          <span>Card <strong className="sb-num">{cursor + 1}/{cards.length}</strong></span>
          <span>Due <strong className="sb-num">{due}</strong></span>
          <span>Mastered <strong className="sb-num">{mastered}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" className="sb-btn" onClick={shuffle}>
            <Icon name="Shuffle" size={12} /> Shuffle
          </button>
          <button type="button" className="sb-btn" onClick={exportCsv}>
            <Icon name="Download" size={12} /> CSV
          </button>
        </div>
      </div>

      <div className="sb-src-bar" style={{ height: 4 }}>
        <div className="sb-src-bar-fill" style={{ width: `${Math.round(((cursor + 1) / cards.length) * 100)}%` }} />
      </div>

      <div
        className="sb-fc-card"
        role="button"
        tabIndex={0}
        onClick={() => setFlipped(f => !f)}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            setFlipped(f => !f)
          } else if (e.key === 'ArrowRight') {
            setFlipped(false)
            setShowHint(false)
            setCursor(c => (c + 1) % order.length)
          } else if (e.key === 'ArrowLeft') {
            setFlipped(false)
            setShowHint(false)
            setCursor(c => (c - 1 + order.length) % order.length)
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sb-kind-tag">{flipped ? 'Answer' : 'Prompt'}</span>
          <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Click or Space to flip</span>
        </div>

        <div style={{ fontSize: flipped ? 13.5 : 15, fontWeight: flipped ? 450 : 600, lineHeight: 1.55, color: 'var(--ui-text-primary)' }}>
          {flipped ? card.back : card.front}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
            {(card.cites || []).map((cid, idx) => (
              <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                {idx + 1}
              </button>
            ))}
          </div>
          {!flipped && card.hint ? (
            <button
              type="button"
              className="sb-btn sb-btn-ghost"
              onClick={e => {
                e.stopPropagation()
                setShowHint(h => !h)
              }}
            >
              {showHint ? card.hint : 'Show hint'}
            </button>
          ) : null}
        </div>
      </div>

      {flipped ? (
        <div className="sb-fc-grade-row">
          <button type="button" className="sb-btn" onClick={() => grade(1)}>Again (1d)</button>
          <button type="button" className="sb-btn" onClick={() => grade(3)}>Hard</button>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => grade(4)}>Good</button>
          <button type="button" className="sb-btn" onClick={() => grade(5)}>Easy</button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            type="button"
            className="sb-btn"
            onClick={() => {
              setFlipped(false)
              setShowHint(false)
              setCursor(c => (c - 1 + order.length) % order.length)
            }}
          >
            <Icon name="ChevronLeft" size={13} /> Prev
          </button>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => setFlipped(true)}>
            Reveal answer
          </button>
          <button
            type="button"
            className="sb-btn"
            onClick={() => {
              setFlipped(false)
              setShowHint(false)
              setCursor(c => (c + 1) % order.length)
            }}
          >
            Next <Icon name="ChevronRight" size={13} />
          </button>
        </div>
      )}
    </div>
  )
}
