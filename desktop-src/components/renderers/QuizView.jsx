import { useEffect, useState } from 'react'
import { Icon } from '../../sdk.js'
import { downloadTextFile } from '../../api.js'
import { DitherCanvas } from '../DitherSurface.jsx'

function isCorrectChoice(q, chosen) {
  if (chosen === undefined || chosen === null) return false
  if (typeof q.answer === 'number') return chosen === q.answer
  if (typeof q.answer === 'boolean') return String(chosen).toLowerCase() === String(q.answer).toLowerCase()
  const opts = q.options || []
  if (typeof chosen === 'number' && opts[chosen] !== undefined) {
    return String(opts[chosen]).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
  }
  return String(chosen).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
}

function questionTypeLabel(q) {
  if (q.type === 'tf') return 'TRUE OR FALSE'
  if (q.type === 'short') return 'SHORT ANSWER'
  return 'MULTIPLE CHOICE'
}

export function QuizView({ artifact, onOpenChunk }) {
  const questions = artifact?.spec?.questions || []
  const [answers, setAnswers] = useState({})
  const [cursor, setCursor] = useState(0)
  const [viewMode, setViewMode] = useState('focus')
  const [retryMissedOnly, setRetryMissedOnly] = useState(false)
  const [shortDraft, setShortDraft] = useState('')

  useEffect(() => {
    setAnswers({})
    setCursor(0)
    setViewMode('focus')
    setRetryMissedOnly(false)
    setShortDraft('')
  }, [artifact?.id])

  if (!questions.length) {
    return <div className="sb-empty">No questions in this quiz.</div>
  }

  const answeredCount = Object.keys(answers).length
  const correctCount = questions.filter((q, idx) => isCorrectChoice(q, answers[q.id || idx])).length
  const missedCount = Math.max(0, answeredCount - correctCount)
  const accuracyPct = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
  const allDone = answeredCount === questions.length

  // Compute current streak of consecutive right answers
  let streak = 0
  for (let i = 0; i < questions.length; i += 1) {
    const k = questions[i].id || i
    if (answers[k] === undefined) continue
    if (isCorrectChoice(questions[i], answers[k])) streak += 1
    else streak = 0
  }

  const visibleList = retryMissedOnly
    ? questions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q, idx }) => {
          const key = q.id || idx
          return answers[key] !== undefined && !isCorrectChoice(q, answers[key])
        })
    : questions.map((q, idx) => ({ q, idx }))

  const activeEntry = visibleList[Math.min(cursor, Math.max(0, visibleList.length - 1))] || visibleList[0]

  // SVG circular score ring geometry
  const ringR = 24
  const ringCirc = 2 * Math.PI * ringR
  const ringDash = ringCirc * (answeredCount ? accuracyPct / 100 : 0)
  const ringColor = answeredCount === 0 ? 'var(--ui-accent)' : accuracyPct >= 75 ? '#10b981' : accuracyPct >= 50 ? '#f59e0b' : '#f43f5e'

  function downloadKey() {
    const lines = [`# ${artifact?.spec?.title || 'Quiz'}`, '']
    const keyLines = ['## Answer Key', '']
    questions.forEach((q, i) => {
      lines.push(`### ${i + 1}. ${q.prompt || ''}`)
      ;(q.options || []).forEach((opt, oi) => lines.push(`- ${String.fromCharCode(65 + oi)}. ${opt}`))
      lines.push('')
      const ansLabel =
        typeof q.answer === 'number' && q.options?.[q.answer]
          ? `${String.fromCharCode(65 + q.answer)} (${q.options[q.answer]})`
          : String(q.answer)
      keyLines.push(`${i + 1}. **${ansLabel}**: ${q.explanation || ''}`)
    })
    downloadTextFile(`${artifact.id || 'quiz'}-key.md`, [...lines, ...keyLines].join('\n'), 'text/markdown;charset=utf-8')
  }

  function renderQuestionCard(q, origIdx, isFocus) {
    const key = q.id || origIdx
    const chosen = answers[key]
    const answered = chosen !== undefined
    const ok = answered && isCorrectChoice(q, chosen)
    const opts = q.options && q.options.length ? q.options : q.type === 'tf' ? ['True', 'False'] : []
    const useGrid = opts.length === 2 || (isFocus && opts.length === 4 && opts.every(o => String(o).length < 95))

    return (
      <article key={key} className={isFocus ? 'sb-qz-stage' : 'sb-ledger-row'} style={isFocus ? undefined : { gap: 10 }}>
        {isFocus ? (
          <div className="sb-qz-stage-top">
            <span className="sb-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ui-accent)' }}>
              QUESTION {origIdx + 1} OF {questions.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sb-kind-tag">{questionTypeLabel(q)}</span>
              {answered ? (
                <span className="sb-verdict" data-v={ok ? 'supported' : 'unsupported'}>
                  {ok ? 'Correct' : 'Missed'}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="sb-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ui-accent)' }}>
                Q{origIdx + 1}
              </span>
              <span className="sb-kind-tag">{questionTypeLabel(q)}</span>
            </div>
            {answered ? (
              <span className="sb-verdict" data-v={ok ? 'supported' : 'unsupported'}>
                {ok ? 'Correct' : 'Missed'}
              </span>
            ) : null}
          </div>
        )}

        <div
          style={{
            fontWeight: 650,
            fontSize: isFocus ? 16 : 13.5,
            lineHeight: 1.45,
            color: 'var(--ui-text-primary)',
            letterSpacing: isFocus ? '-0.01em' : undefined
          }}
        >
          {q.prompt}
        </div>

        {opts.length > 0 ? (
          <div className="sb-qz-options" style={{ gridTemplateColumns: useGrid ? 'repeat(2, minmax(0, 1fr))' : '1fr' }}>
            {opts.map((opt, oi) => {
              const isSelected = chosen === oi
              const isRight = isCorrectChoice(q, oi)
              let state = 'idle'
              if (answered && isRight) state = 'correct'
              else if (answered && isSelected && !isRight) state = 'wrong'
              else if (answered) state = 'dim'
              return (
                <button
                  key={oi}
                  type="button"
                  className="sb-qz-opt"
                  data-state={state}
                  onClick={() => setAnswers(prev => ({ ...prev, [key]: oi }))}
                >
                  <span className="sb-qz-keycap sb-mono">{String.fromCharCode(65 + oi)}</span>
                  <span style={{ flex: 1, textAlign: 'left', lineHeight: 1.48 }}>{opt}</span>
                  {state === 'correct' ? (
                    <Icon name="Check" size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                  ) : state === 'wrong' ? (
                    <Icon name="X" size={14} style={{ color: 'var(--sb-bad)', flexShrink: 0 }} />
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="sb-input"
              value={shortDraft}
              onChange={e => setShortDraft(e.target.value)}
              placeholder="Type your answer and press Enter..."
              onKeyDown={e => {
                if (e.key === 'Enter' && shortDraft.trim()) {
                  setAnswers(prev => ({ ...prev, [key]: shortDraft.trim() }))
                }
              }}
            />
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              disabled={!shortDraft.trim()}
              onClick={() => setAnswers(prev => ({ ...prev, [key]: shortDraft.trim() }))}
            >
              Submit
            </button>
          </div>
        )}

        {answered ? (
          <div className="sb-qz-explain" data-ok={ok}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span className="sb-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: ok ? '#10b981' : 'var(--sb-bad)' }}>
                {ok ? 'VERIFIED EXPLANATION' : 'CORRECTION & SOURCE'}
              </span>
              {(q.cites || []).length > 0 ? (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {(q.cites || []).map((cid, cIdx) => (
                    <button key={cid} type="button" className="sb-btn" style={{ height: 24, fontSize: 11 }} onClick={() => onOpenChunk?.(cid)}>
                      <Icon name="BookOpen" size={11} /> Passage [{cIdx + 1}]
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--ui-text-primary)' }}>
              {q.explanation || `Expected answer: ${String(q.answer)}`}
            </div>
          </div>
        ) : null}
      </article>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      tabIndex={0}
      onKeyDown={e => {
        if (viewMode !== 'focus' || !activeEntry) return
        const { q, idx } = activeEntry
        const key = q.id || idx
        const opts = q.options && q.options.length ? q.options : q.type === 'tf' ? ['True', 'False'] : []
        const kLow = e.key.toLowerCase()
        if (opts.length > 0) {
          const mapIdx = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2, '4': 3, d: 3 }[kLow]
          if (mapIdx !== undefined && mapIdx < opts.length) {
            setAnswers(prev => ({ ...prev, [key]: mapIdx }))
            return
          }
        }
        if (e.key === 'ArrowRight') setCursor(c => Math.min(visibleList.length - 1, c + 1))
        if (e.key === 'ArrowLeft') setCursor(c => Math.max(0, c - 1))
      }}
    >
      {/* Visual Mastery Header with Live Score Ring */}
      <div className="sb-qz-hero">
        <DitherCanvas
          variant="mesh"
          animated={false}
          color={ringColor}
          secondaryColor="var(--ui-accent)"
          opacity={0.18}
          cols={120}
          rows={26}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
          <svg width="62" height="62" viewBox="0 0 62 62" style={{ flexShrink: 0 }} aria-hidden="true">
            <circle cx="31" cy="31" r={ringR} fill="none" stroke="var(--ui-stroke-tertiary)" strokeWidth="5.5" />
            <circle
              cx="31"
              cy="31"
              r={ringR}
              fill="none"
              stroke={ringColor}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray={`${ringDash.toFixed(1)} ${ringCirc.toFixed(1)}`}
              transform="rotate(-90 31 31)"
            />
            <text x="31" y="35" textAnchor="middle" fill={ringColor} fontSize="13.5" fontWeight="800" fontFamily="ui-monospace, SFMono-Regular, monospace">
              {accuracyPct}%
            </text>
          </svg>

          <div className="sb-qz-stats">
            <div>
              <div className="sb-dt-kpi-lbl">Progress</div>
              <div className="sb-dt-kpi-val sb-mono">{answeredCount} / {questions.length}</div>
            </div>
            <div>
              <div className="sb-dt-kpi-lbl">Correct</div>
              <div className="sb-dt-kpi-val sb-mono" style={{ color: '#10b981' }}>{correctCount}</div>
            </div>
            <div>
              <div className="sb-dt-kpi-lbl">Streak</div>
              <div className="sb-dt-kpi-val sb-mono" style={{ color: 'var(--ui-accent)' }}>{streak}</div>
            </div>
            <div>
              <div className="sb-dt-kpi-lbl">Missed</div>
              <div className="sb-dt-kpi-val sb-mono" style={{ color: missedCount > 0 ? 'var(--sb-bad)' : 'var(--ui-text-secondary)' }}>{missedCount}</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="sb-seg" role="group" aria-label="Quiz mode">
            <button type="button" className="sb-seg-btn" data-active={viewMode === 'focus'} onClick={() => setViewMode('focus')}>
              Focus
            </button>
            <button type="button" className="sb-seg-btn" data-active={viewMode === 'all'} onClick={() => setViewMode('all')}>
              All ({questions.length})
            </button>
          </div>
          <button
            type="button"
            className="sb-btn"
            data-active={retryMissedOnly}
            disabled={missedCount <= 0}
            onClick={() => {
              setRetryMissedOnly(v => !v)
              setCursor(0)
            }}
          >
            Missed ({missedCount})
          </button>
          <button
            type="button"
            className="sb-btn"
            onClick={() => {
              setAnswers({})
              setRetryMissedOnly(false)
              setCursor(0)
            }}
          >
            <Icon name="RotateCcw" size={12} /> Reset
          </button>
          <button type="button" className="sb-btn" onClick={downloadKey}>
            <Icon name="Download" size={12} /> Key .md
          </button>
        </div>
      </div>

      {/* Interactive Question Stepper Pills */}
      <div className="sb-qz-stepper">
        {questions.map((q, idx) => {
          const k = q.id || idx
          const ans = answers[k]
          const st = ans === undefined ? 'idle' : isCorrectChoice(q, ans) ? 'correct' : 'wrong'
          const isCur = viewMode === 'focus' && activeEntry?.idx === idx
          return (
            <button
              key={k}
              type="button"
              className="sb-qz-step"
              data-state={st}
              data-active={isCur}
              onClick={() => {
                setRetryMissedOnly(false)
                setViewMode('focus')
                setCursor(idx)
              }}
              title={`Jump to Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          )
        })}
        {viewMode === 'focus' ? (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
            Keys: A-D to answer · Left/Right to navigate
          </span>
        ) : null}
      </div>

      {/* Completion Mastery Callout */}
      {allDone ? (
        <div className="sb-qz-complete">
          <div>
            <div className="sb-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: '#10b981' }}>
              QUIZ COMPLETE
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ui-text-primary)', marginTop: 2 }}>
              Scored {correctCount} / {questions.length} ({accuracyPct}%)
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {missedCount > 0 ? (
              <button
                type="button"
                className="sb-btn sb-btn-primary"
                onClick={() => {
                  const nextAns = { ...answers }
                  questions.forEach((q, i) => {
                    const k = q.id || i
                    if (!isCorrectChoice(q, nextAns[k])) delete nextAns[k]
                  })
                  setAnswers(nextAns)
                  setRetryMissedOnly(false)
                  setCursor(0)
                }}
              >
                Retry {missedCount} missed
              </button>
            ) : null}
            <button type="button" className="sb-btn" onClick={downloadKey}>
              <Icon name="Download" size={12} /> Export Answer Key
            </button>
          </div>
        </div>
      ) : null}

      {/* Focus Stage OR All-Questions Stack */}
      {viewMode === 'focus' && activeEntry ? (
        <>
          {renderQuestionCard(activeEntry.q, activeEntry.idx, true)}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="sb-btn"
              disabled={cursor <= 0}
              onClick={() => setCursor(c => Math.max(0, c - 1))}
            >
              <Icon name="ChevronLeft" size={13} /> Previous
            </button>
            <span className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
              {cursor + 1} / {visibleList.length}
            </span>
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              disabled={cursor >= visibleList.length - 1}
              onClick={() => setCursor(c => Math.min(visibleList.length - 1, c + 1))}
            >
              Next question <Icon name="ChevronRight" size={13} />
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleList.map(({ q, idx }) => renderQuestionCard(q, idx, false))}
        </div>
      )}
    </div>
  )
}
