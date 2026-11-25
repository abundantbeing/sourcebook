import { useEffect, useState } from 'react'
import { Icon } from '../../sdk.js'
import { api, downloadTextFile } from '../../api.js'
import { DitherCanvas } from '../DitherSurface.jsx'

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

function fmtInterval(days) {
  if (days <= 1) return '1d'
  if (days < 30) return `${days}d`
  const mo = (days / 30).toFixed(1).replace(/\.0$/, '')
  return `${mo}mo`
}

export function FlashcardsView({ nbId, artifact, onOpenChunk, onArtifactUpdated, onStateSaved }) {
  const cards = artifact?.spec?.cards || []
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [cursor, setCursor] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [viewMode, setViewMode] = useState('deck')
  const [sessionReviewed, setSessionReviewed] = useState(0)
  const [sm2, setSm2] = useState(() => artifact?.state?.sm2 || {})

  useEffect(() => {
    setOrder(cards.map((_, i) => i))
    setCursor(0)
    setFlipped(false)
    setShowHint(false)
    setViewMode('deck')
    setSessionReviewed(0)
    setSm2(artifact?.state?.sm2 || {})
  }, [artifact?.id])

  if (!cards.length) {
    return <div className="sb-empty">No flashcards in this deck.</div>
  }

  const card = cards[order[cursor] ?? 0] || cards[0]
  const cardId = card.id || String(order[cursor] ?? 0)
  const cardState = sm2[cardId]
  const nowSec = Date.now() / 1000
  const mastered = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) >= 2).length
  const learning = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) === 1).length
  const due = cards.filter((c, i) => {
    const s = sm2[c.id || String(i)]
    return !s || !s.due_at || s.due_at <= nowSec
  }).length

  const masteredPct = Math.round((mastered / cards.length) * 100)
  const learningPct = Math.round((learning / cards.length) * 100)

  const gradePreviews = [
    { q: 1, label: 'Again', tone: 'bad', interval: fmtInterval(nextSm2(cardState, 1).interval), key: '1' },
    { q: 3, label: 'Hard', tone: 'warn', interval: fmtInterval(nextSm2(cardState, 3).interval), key: '2' },
    { q: 4, label: 'Good', tone: 'accent', interval: fmtInterval(nextSm2(cardState, 4).interval), key: '3' },
    { q: 5, label: 'Easy', tone: 'ok', interval: fmtInterval(nextSm2(cardState, 5).interval), key: '4' }
  ]

  async function grade(quality) {
    const updated = { ...sm2, [cardId]: nextSm2(sm2[cardId], quality) }
    setSm2(updated)
    setSessionReviewed(n => n + 1)
    setFlipped(false)
    setShowHint(false)
    setCursor(c => (c + 1) % order.length)
    try {
      const savedState = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/state`, {
        method: 'PATCH',
        body: { sm2: updated }
      })
      onArtifactUpdated?.({ ...artifact, state: savedState && typeof savedState === 'object' ? savedState : { ...artifact.state, sm2: updated } })
      onStateSaved?.()
    } catch {
      // keep optimistic SM-2 schedule in local state
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

  function exportAnki() {
    const lines = cards.map(c => {
      const front = String(c.front || '').replace(/\t/g, ' ').replace(/\n/g, '<br>')
      const back = String(c.back || '').replace(/\t/g, ' ').replace(/\n/g, '<br>')
      const tags = (c.tags || []).map(t => String(t).replace(/\s+/g, '_')).join(' ')
      return `${front}\t${back}\t${tags}`
    })
    downloadTextFile(`${artifact.id || 'flashcards'}-anki.tsv`, lines.join('\n'), 'text/tab-separated-values;charset=utf-8')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Mastery Header */}
      <div className="sb-dt-kpis">
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Deck</div>
          <div className="sb-dt-kpi-val sb-mono">{cursor + 1} / {cards.length}</div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Due Now</div>
          <div className="sb-dt-kpi-val sb-mono" style={{ color: due > 0 ? '#f59e0b' : '#10b981' }}>{due}</div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Mastered</div>
          <div className="sb-dt-kpi-val sb-mono" style={{ color: '#10b981' }}>{mastered}</div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Session</div>
          <div className="sb-dt-kpi-val sb-mono" style={{ color: 'var(--ui-accent)' }}>{sessionReviewed}</div>
        </div>
      </div>

      {/* Controls & 3-Segment Mastery Bar */}
      <div className="sb-inf-toolbar">
        <div className="sb-seg" role="group" aria-label="Flashcard mode">
          <button type="button" className="sb-seg-btn" data-active={viewMode === 'deck'} onClick={() => setViewMode('deck')}>
            <Icon name="Layers" size={12} /> Study Deck
          </button>
          <button type="button" className="sb-seg-btn" data-active={viewMode === 'browse'} onClick={() => setViewMode('browse')}>
            <Icon name="LayoutGrid" size={12} /> Browse All ({cards.length})
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button type="button" className="sb-btn" onClick={shuffle}>
            <Icon name="Shuffle" size={12} /> Shuffle
          </button>
          <button type="button" className="sb-btn" onClick={exportCsv}>
            <Icon name="Download" size={12} /> CSV
          </button>
          <button type="button" className="sb-btn" onClick={exportAnki} title="Export tab-separated deck ready for Anki import">
            <Icon name="Download" size={12} /> Anki TSV
          </button>
        </div>
      </div>

      <div className="sb-fc-mastery-bar" title={`Mastered ${mastered} | Learning ${learning} | New/Due ${Math.max(0, cards.length - mastered - learning)}`}>
        <div style={{ width: `${masteredPct}%`, background: '#10b981' }} />
        <div style={{ width: `${learningPct}%`, background: 'var(--ui-accent)' }} />
      </div>

      {viewMode === 'browse' ? (
        <div className="sb-dt-cards-grid">
          {cards.map((c, cIdx) => {
            const st = sm2[c.id || String(cIdx)]
            const status = (st?.reps || 0) >= 2 ? 'Mastered' : (st?.reps || 0) === 1 ? 'Learning' : 'Due'
            return (
              <div
                key={c.id || cIdx}
                className="sb-dt-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const pos = order.indexOf(cIdx)
                  if (pos >= 0) setCursor(pos)
                  setFlipped(false)
                  setViewMode('deck')
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-text-tertiary)' }}>CARD 0{cIdx + 1}</span>
                  <span className="sb-verdict" data-v={status === 'Mastered' ? 'supported' : status === 'Learning' ? 'partial' : undefined} style={{ fontSize: 10 }}>
                    {status}
                  </span>
                </div>
                <div style={{ fontWeight: 650, fontSize: 13, color: 'var(--ui-text-primary)', lineHeight: 1.4 }}>{c.front}</div>
                <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', lineHeight: 1.5, paddingTop: 6, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
                  {c.back}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <>
          {/* Tactile Layered Card Stack */}
          <div className="sb-fc-stack">
            <div className="sb-fc-layer sb-fc-layer-2" aria-hidden="true" />
            <div className="sb-fc-layer sb-fc-layer-1" aria-hidden="true" />
            <div
              className="sb-fc-card sb-fc-card-rich"
              data-flipped={flipped}
              role="button"
              tabIndex={0}
              onClick={() => setFlipped(f => !f)}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  setFlipped(f => !f)
                } else if (e.key.toLowerCase() === 'h' && !flipped && card.hint) {
                  setShowHint(h => !h)
                } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
                  const qMap = { '1': 1, '2': 3, '3': 4, '4': 5 }
                  grade(qMap[e.key])
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
              <div
                className="sb-sl-top-ribbon"
                style={{ background: flipped ? '#10b981' : 'var(--ui-accent)' }}
              />
              <DitherCanvas
                variant="mesh"
                animated={false}
                color={flipped ? '#10b981' : 'var(--ui-accent)'}
                secondaryColor="var(--ui-accent)"
                opacity={0.18}
                cols={110}
                rows={28}
                style={{ position: 'absolute', inset: '0 0 auto 0', width: '100%', height: 92, pointerEvents: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span
                  className="sb-kind-tag"
                  style={
                    flipped
                      ? { color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.35)', background: 'rgba(16, 185, 129, 0.12)' }
                      : { color: 'var(--ui-accent)', borderColor: 'var(--sb-accent-border)', background: 'var(--sb-accent-soft)' }
                  }
                >
                  {flipped ? 'VERIFIED ANSWER' : 'STUDY PROMPT'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {(card.tags || []).slice(0, 2).map(t => (
                    <span key={t} className="sb-dt-tag" style={{ fontSize: 10 }}>
                      #{t}
                    </span>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Space to flip</span>
                </div>
              </div>

              <div
                style={{
                  position: 'relative',
                  marginBlock: 'auto',
                  padding: '14px 4px',
                  fontSize: flipped ? 15 : 18,
                  fontWeight: flipped ? 460 : 660,
                  lineHeight: 1.55,
                  letterSpacing: flipped ? undefined : '-0.015em',
                  color: 'var(--ui-text-primary)'
                }}
              >
                {flipped ? card.back : card.front}
              </div>

              {!flipped && showHint && card.hint ? (
                <div className="sb-quote-box" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <strong style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--ui-text-tertiary)', display: 'block' }}>HINT</strong>
                  {card.hint}
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, position: 'relative', paddingTop: 10, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Sources:</span>
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
                    {showHint ? 'Hide hint' : 'Show hint (H)'}
                  </button>
                ) : (
                  <span className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-text-tertiary)' }}>
                    {cardState?.reps ? `Reps: ${cardState.reps} · Ease ${cardState.ease}` : 'New card'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {flipped ? (
            <div className="sb-fc-grade-row">
              {gradePreviews.map(g => (
                <button
                  key={g.q}
                  type="button"
                  className="sb-fc-grade-btn"
                  data-tone={g.tone}
                  onClick={() => grade(g.q)}
                >
                  <span style={{ fontWeight: 650, fontSize: 12.5 }}>{g.label}</span>
                  <span className="sb-mono" style={{ fontSize: 10.5, opacity: 0.78 }}>
                    {g.interval} · [{g.key}]
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
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
              <button type="button" className="sb-btn sb-btn-primary" style={{ minWidth: 156 }} onClick={() => setFlipped(true)}>
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
        </>
      )}
    </div>
  )
}
