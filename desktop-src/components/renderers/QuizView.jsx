import { useEffect, useState } from 'react'
import { Icon } from '../../sdk.js'
import { downloadTextFile } from '../../api.js'

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

export function QuizView({ artifact, onOpenChunk }) {
  const questions = artifact?.spec?.questions || []
  const [answers, setAnswers] = useState({})
  const [retryMissedOnly, setRetryMissedOnly] = useState(false)

  useEffect(() => {
    setAnswers({})
    setRetryMissedOnly(false)
  }, [artifact?.id])

  if (!questions.length) {
    return <div className="sb-empty">No questions in this quiz.</div>
  }

  const answeredCount = Object.keys(answers).length
  const correctCount = questions.filter((q, idx) => isCorrectChoice(q, answers[q.id || idx])).length
  const visible = retryMissedOnly
    ? questions.filter((q, idx) => {
        const key = q.id || idx
        return answers[key] !== undefined && !isCorrectChoice(q, answers[key])
      })
    : questions

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sb-kpi-strip">
        <div className="sb-kpi">
          <div className="sb-kpi-label">Answered</div>
          <div className="sb-kpi-val">{answeredCount} / {questions.length}</div>
        </div>
        <div className="sb-kpi">
          <div className="sb-kpi-label">Score</div>
          <div className="sb-kpi-val" style={{ color: 'var(--sb-ok)' }}>
            {answeredCount ? `${Math.round((correctCount / answeredCount) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="sb-kpi">
          <div className="sb-kpi-label">Missed</div>
          <div className="sb-kpi-val">{Math.max(0, answeredCount - correctCount)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="sb-btn"
          data-active={retryMissedOnly}
          disabled={answeredCount - correctCount <= 0}
          onClick={() => setRetryMissedOnly(v => !v)}
        >
          Missed only
        </button>
        <button
          type="button"
          className="sb-btn"
          onClick={() => {
            setAnswers({})
            setRetryMissedOnly(false)
          }}
        >
          <Icon name="RotateCcw" size={12} /> Reset
        </button>
        <button
          type="button"
          className="sb-btn"
          onClick={() => {
            const lines = [`# ${artifact?.spec?.title || 'Quiz'}`, '']
            const keyLines = ['## Answer Key', '']
            questions.forEach((q, i) => {
              lines.push(`### ${i + 1}. ${q.prompt || ''}`)
              ;(q.options || []).forEach((opt, oi) => lines.push(`- ${String.fromCharCode(65 + oi)}. ${opt}`))
              lines.push('')
              const ansLabel = typeof q.answer === 'number' && q.options?.[q.answer] ? `${String.fromCharCode(65 + q.answer)} (${q.options[q.answer]})` : String(q.answer)
              keyLines.push(`${i + 1}. **${ansLabel}**: ${q.explanation || ''}`)
            })
            downloadTextFile(`${artifact.id || 'quiz'}-key.md`, [...lines, ...keyLines].join('\n'), 'text/markdown;charset=utf-8')
          }}
        >
          <Icon name="Download" size={12} /> Answer Key .md
        </button>
      </div>

      {visible.map((q, idx) => {
        const key = q.id || idx
        const chosen = answers[key]
        const answered = chosen !== undefined
        const ok = answered && isCorrectChoice(q, chosen)
        const opts = q.options && q.options.length ? q.options : q.type === 'tf' ? ['True', 'False'] : []

        return (
          <article key={key} className="sb-ledger-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>
                <span className="sb-mono" style={{ color: 'var(--ui-text-tertiary)', marginRight: 6 }}>Q{idx + 1}</span>
                {q.prompt}
              </div>
              {answered ? (
                <span className="sb-verdict" data-v={ok ? 'supported' : 'unsupported'}>
                  {ok ? 'Correct' : 'Missed'}
                </span>
              ) : null}
            </div>

            {opts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                {opts.map((opt, oi) => {
                  const isSelected = chosen === oi
                  const isRight = isCorrectChoice(q, oi)
                  let border = 'var(--ui-stroke-secondary)'
                  let bg = 'var(--ui-bg-primary)'
                  if (answered && isRight) {
                    border = 'var(--sb-ok)'
                    bg = 'color-mix(in srgb, var(--sb-ok) 12%, var(--ui-bg-primary))'
                  } else if (answered && isSelected && !isRight) {
                    border = 'var(--sb-bad)'
                    bg = 'color-mix(in srgb, var(--sb-bad) 12%, var(--ui-bg-primary))'
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      className="sb-btn"
                      style={{
                        height: 'auto',
                        minHeight: 32,
                        padding: '7px 10px',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        borderColor: border,
                        background: bg,
                        color: 'var(--ui-text-primary)'
                      }}
                      onClick={() => setAnswers(prev => ({ ...prev, [key]: oi }))}
                    >
                      <span className="sb-mono" style={{ color: 'var(--ui-text-tertiary)', marginRight: 6 }}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <input
                  className="sb-input"
                  placeholder="Type your answer and press Enter..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setAnswers(prev => ({ ...prev, [key]: e.currentTarget.value }))
                    }
                  }}
                />
              </div>
            )}

            {answered ? (
              <div className="sb-quote-box" style={{ marginTop: 4 }}>
                <div>{q.explanation || `Expected answer: ${String(q.answer)}`}</div>
                {(q.cites || []).length > 0 ? (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Source:</span>
                    {(q.cites || []).map((cid, cIdx) => (
                      <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)}>
                        {cIdx + 1}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
