import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../sdk.js'
import { api, copyText, pollJob } from '../api.js'

const CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g
const CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/

function renderInlineCited(text, citeIndexMap, onOpenChunk) {
  const renderSpan = line => {
    const tokens = line.split(CITE_SPLIT_RE)
    return tokens.map((tok, tIdx) => {
      const m = CITE_EXTRACT_RE.exec(tok)
      if (m) {
        const cid = m[1]
        const num = citeIndexMap.get(cid) || '?'
        return (
          <button
            key={`${tIdx}-${cid}`}
            type="button"
            className="sb-cite"
            title={`Inspect cited passage ${cid}`}
            onClick={() => onOpenChunk(cid)}
          >
            {num}
          </button>
        )
      }
      const boldParts = tok.split(/(\*\*[^*]+\*\*)/g)
      return boldParts.map((bp, bIdx) => {
        if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
          return <strong key={`${tIdx}-${bIdx}`}>{bp.slice(2, -2)}</strong>
        }
        return bp
      })
    })
  }

  const lines = String(text || '').split('\n')
  const out = []
  let listBuf = []
  const flushList = key => {
    if (!listBuf.length) return
    out.push(
      <ul key={`ul-${key}`}>
        {listBuf.map((item, i) => <li key={i}>{renderSpan(item)}</li>)}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((raw, idx) => {
    const t = raw.trim()
    if (!t) {
      flushList(idx)
      return
    }
    if (/^[-*+]\s+/.test(t)) {
      listBuf.push(t.replace(/^[-*+]\s+/, ''))
      return
    }
    flushList(idx)
    if (t.startsWith('### ')) {
      out.push(<h3 key={idx}>{renderSpan(t.slice(4))}</h3>)
    } else if (t.startsWith('## ')) {
      out.push(<h2 key={idx}>{renderSpan(t.slice(3))}</h2>)
    } else {
      out.push(<p key={idx}>{renderSpan(t)}</p>)
    }
  })
  flushList('end')
  return out
}

export function ChatPanel({
  ctx,
  notebook,
  sources,
  messages,
  claims,
  coverage,
  centerTab,
  onChangeCenterTab,
  onOpenChunk,
  onOpenSource,
  onRefresh,
  onError
}) {
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [stage, setStage] = useState('')
  const [briefingBusy, setBriefingBusy] = useState(false)
  const [claimFilter, setClaimFilter] = useState('all')
  const endRef = useRef(null)
  const cancelPollRef = useRef(null)

  const enabledSources = sources.filter(s => s.enabled)

  useEffect(() => {
    return () => cancelPollRef.current?.()
  }, [])

  useEffect(() => {
    if (centerTab === 'chat' && endRef.current) {
      endRef.current.scrollIntoView({ block: 'end' })
    }
  }, [messages.length, centerTab])

  async function sendQuestion(promptText) {
    const q = String(promptText ?? input).trim()
    if (!q || !notebook?.id || asking) return
    if (enabledSources.length === 0) {
      onError?.('Enable at least one source before asking a question.')
      return
    }
    setInput('')
    setAsking(true)
    setStage('Searching active sources...')
    onChangeCenterTab('chat')
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/ask`, {
        method: 'POST',
        body: {
          text: q,
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          strict: Boolean(notebook.strict)
        }
      })
      cancelPollRef.current?.()
      cancelPollRef.current = pollJob(
        ctx,
        job,
        j => setStage(j.stage || 'Working...'),
        async () => {
          setAsking(false)
          setStage('')
          await onRefresh()
        },
        err => {
          setAsking(false)
          setStage('')
          onError?.(err.message || 'Could not answer question.')
        }
      )
    } catch (err) {
      setAsking(false)
      setStage('')
      onError?.(err.message || 'Could not start grounded query.')
    }
  }

  async function generateBriefing() {
    if (!notebook?.id || briefingBusy || enabledSources.length === 0) return
    setBriefingBusy(true)
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/guide`, { method: 'POST' })
      pollJob(
        ctx,
        job,
        () => {},
        async () => {
          setBriefingBusy(false)
          await onRefresh()
        },
        err => {
          setBriefingBusy(false)
          onError?.(err.message || 'Could not generate briefing.')
        }
      )
    } catch (err) {
      setBriefingBusy(false)
      onError?.(err.message || 'Could not generate briefing.')
    }
  }

  async function saveAsNote(msg) {
    if (!notebook?.id) return
    try {
      const firstLine = (msg.content || '').split('\n')[0].replace(/\[\[c:[^\]]+\]\]/g, '').trim()
      await api(`/notebooks/${encodeURIComponent(notebook.id)}/notes`, {
        method: 'POST',
        body: {
          title: firstLine.slice(0, 64) || 'Saved answer',
          markdown: msg.content || '',
          from_chat: true,
          citations: msg.citations || []
        }
      })
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Saved reply to Notes.' })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not save note.')
    }
  }

  async function clearChat() {
    if (!notebook?.id) return
    try {
      await api(`/notebooks/${encodeURIComponent(notebook.id)}/messages`, { method: 'DELETE' })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not clear conversation.')
    }
  }

  const supportedCount = claims.filter(c => c.verdict === 'supported').length
  const partialCount = claims.filter(c => c.verdict === 'partial').length
  const unsupportedCount = claims.filter(c => c.verdict === 'unsupported').length
  const filteredClaims = claimFilter === 'all' ? claims : claims.filter(c => c.verdict === claimFilter)

  const guide = notebook?.guide

  return (
    <main className="sb-pane sb-pane-center" aria-label="Research Workspace">
      <div className="sb-center-tabs">
        <div className="sb-seg" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={centerTab === 'chat'}
            className="sb-seg-btn"
            data-active={centerTab === 'chat'}
            onClick={() => onChangeCenterTab('chat')}
          >
            <Icon name="MessageSquare" size={12} /> Grounded Chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={centerTab === 'claims'}
            className="sb-seg-btn"
            data-active={centerTab === 'claims'}
            onClick={() => onChangeCenterTab('claims')}
          >
            <Icon name="ShieldCheck" size={12} /> Claim Ledger <span className="sb-num" style={{ opacity: 0.7 }}>{claims.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={centerTab === 'coverage'}
            className="sb-seg-btn"
            data-active={centerTab === 'coverage'}
            onClick={() => onChangeCenterTab('coverage')}
          >
            <Icon name="BarChart3" size={12} /> Coverage Map
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {centerTab === 'chat' && messages.length > 0 ? (
            <button type="button" className="sb-btn sb-btn-ghost" onClick={clearChat}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {centerTab === 'chat' ? (
        <>
          <div className="sb-chat-stream sb-scroll">
            {sources.length > 0 ? (
              <section className="sb-briefing" style={{ margin: 0 }}>
                <div className="sb-briefing-head">
                  <span className="sb-briefing-title">
                    <Icon name="BookOpen" size={14} /> Notebook Briefing
                  </span>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={briefingBusy || enabledSources.length === 0}
                    onClick={generateBriefing}
                  >
                    <Icon name="RefreshCw" size={12} /> {briefingBusy ? 'Updating...' : guide ? 'Refresh' : 'Generate briefing'}
                  </button>
                </div>
                {guide?.overview ? (
                  <>
                    <p className="sb-briefing-text">{guide.overview}</p>
                    {guide.topics?.length ? (
                      <div className="sb-chips">
                        {guide.topics.map((t, idx) => (
                          <span key={idx} className="sb-kind-tag" style={{ textTransform: 'none', padding: '2px 7px' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {guide.suggested_questions?.length ? (
                      <div className="sb-chips">
                        {guide.suggested_questions.map((sq, idx) => (
                          <button key={idx} type="button" className="sb-chip-q" onClick={() => sendQuestion(sq)}>
                            {sq}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="sb-briefing-text">
                    {enabledSources.length} active source{enabledSources.length === 1 ? '' : 's'} indexed. Generate a briefing for starter questions or ask directly below.
                  </p>
                )}
              </section>
            ) : null}

            {messages.length === 0 && sources.length === 0 ? (
              <div className="sb-empty" style={{ marginTop: 48 }}>
                <Icon name="Library" size={26} />
                <div style={{ fontWeight: 650, fontSize: 14, color: 'var(--ui-text-primary)' }}>
                  Add sources to begin
                </div>
                <div style={{ maxWidth: 380, fontSize: 12.5 }}>
                  Upload PDFs, DOCX files, Markdown, CSVs, or web URLs in the left rail. Every reply links inline citations back to the exact passage.
                </div>
              </div>
            ) : null}

            {messages.map(msg => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="sb-msg sb-msg-user">
                    {msg.content}
                  </div>
                )
              }
              const citeIndex = new Map()
              ;(msg.citations || []).forEach((cid, i) => citeIndex.set(cid, i + 1))
              const gr = msg.grounding || {}
              const sup = gr.claims_supported ?? (msg.claims || []).filter(c => c.verdict === 'supported').length
              const unsup = gr.claims_unsupported ?? (msg.claims || []).filter(c => c.verdict === 'unsupported').length

              return (
                <article key={msg.id} className="sb-msg sb-msg-assistant">
                  <div className="sb-msg-body">{renderInlineCited(msg.content, citeIndex, onOpenChunk)}</div>
                  <div className="sb-msg-foot">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {typeof gr.score === 'number' ? (
                        <span
                          className="sb-verdict"
                          data-v={gr.score >= 0.8 ? 'supported' : gr.score >= 0.5 ? 'partial' : 'unsupported'}
                        >
                          <span className="sb-num">{Math.round(gr.score * 100)}%</span> cited
                        </span>
                      ) : null}
                      {sup > 0 ? (
                        <span className="sb-verdict" data-v="supported">
                          <span className="sb-num">{sup}</span> verified
                        </span>
                      ) : null}
                      {unsup > 0 ? (
                        <span className="sb-verdict" data-v="unsupported">
                          <span className="sb-num">{unsup}</span> uncited
                        </span>
                      ) : null}
                      {gr.mode === 'extractive' ? (
                        <span className="sb-kind-tag" title="Generated locally from indexed chunks without an external model call">
                          Local extractive
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost"
                        onClick={() => copyText(msg.content)}
                      >
                        <Icon name="Copy" size={12} /> Copy
                      </button>
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost"
                        onClick={() => saveAsNote(msg)}
                      >
                        <Icon name="BookmarkPlus" size={12} /> Save note
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}

            {asking ? (
              <div className="sb-msg sb-msg-assistant" aria-busy="true">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ui-text-secondary)', fontSize: 12.5 }}>
                  <Icon name="Search" size={14} /> {stage || 'Searching active sources...'}
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="sb-composer-wrap">
            <div className="sb-composer">
              <textarea
                className="sb-textarea"
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={
                  enabledSources.length > 0
                    ? 'Ask a question across your active sources...'
                    : 'Add or check a source in the left rail to ask questions...'
                }
                disabled={asking || enabledSources.length === 0}
                onKeyDown={e => {
                  const isSubmit = typeof sdk.isSubmitEnter === 'function'
                    ? sdk.isSubmitEnter(e)
                    : (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent?.isComposing)
                  if (isSubmit) {
                    e.preventDefault()
                    sendQuestion()
                  }
                }}
              />
              <div className="sb-composer-bar">
                <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                  <span className="sb-num">{enabledSources.length}</span> of <span className="sb-num">{sources.length}</span> sources active
                  {notebook?.strict ? ' | Strict mode' : ''}
                </span>
                <button
                  type="button"
                  className="sb-btn sb-btn-primary"
                  disabled={asking || !input.trim() || enabledSources.length === 0}
                  onClick={() => sendQuestion()}
                >
                  <Icon name="ArrowUp" size={13} /> Ask
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {centerTab === 'claims' ? (
        <div className="sb-panel-pad sb-scroll" style={{ flex: 1 }}>
          <div className="sb-kpi-strip">
            <div className="sb-kpi">
              <div className="sb-kpi-label">Verified claims</div>
              <div className="sb-kpi-val" style={{ color: 'var(--sb-ok)' }}>{supportedCount}</div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Partial overlap</div>
              <div className="sb-kpi-val" style={{ color: 'var(--sb-warn)' }}>{partialCount}</div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Uncited claims</div>
              <div className="sb-kpi-val" style={{ color: unsupportedCount > 0 ? 'var(--sb-bad)' : 'var(--ui-text-primary)' }}>
                {unsupportedCount}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div className="sb-seg">
              {['all', 'supported', 'partial', 'unsupported'].map(f => (
                <button
                  key={f}
                  type="button"
                  className="sb-seg-btn"
                  data-active={claimFilter === f}
                  onClick={() => setClaimFilter(f)}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
              Click any citation to verify the original passage
            </span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="sb-empty">
              <Icon name="ShieldCheck" size={24} />
              <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No claims recorded yet</div>
              <div style={{ fontSize: 12 }}>Ask a grounded question to populate the Claim Ledger with verifiable evidence.</div>
            </div>
          ) : (
            filteredClaims.map(cl => (
              <article key={cl.id} className="sb-ledger-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span className="sb-verdict" data-v={cl.verdict}>
                    {cl.verdict} {typeof cl.overlap === 'number' ? `(${Math.round(cl.overlap * 100)}%)` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {cl.source_title ? (
                      <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>{cl.source_title}</span>
                    ) : null}
                    {(cl.citations || []).map(cid => (
                      <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk(cid)}>
                        {cid.split(':')[1] || cid}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ui-text-primary)' }}>{cl.text}</div>
                {cl.quote ? <div className="sb-quote-box">{cl.quote}</div> : null}
              </article>
            ))
          )}
        </div>
      ) : null}

      {centerTab === 'coverage' ? (
        <div className="sb-panel-pad sb-scroll" style={{ flex: 1 }}>
          <div className="sb-kpi-strip">
            <div className="sb-kpi">
              <div className="sb-kpi-label">Corpus coverage</div>
              <div className="sb-kpi-val">
                {coverage?.total_chunks ? Math.round((coverage.touched_chunks / coverage.total_chunks) * 100) : 0}%
              </div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Interrogated chunks</div>
              <div className="sb-kpi-val">
                {coverage?.touched_chunks || 0} / {coverage?.total_chunks || 0}
              </div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Blind spots</div>
              <div className="sb-kpi-val">
                {Math.max(0, (coverage?.total_chunks || 0) - (coverage?.touched_chunks || 0))}
              </div>
            </div>
          </div>

          {(coverage?.sources || []).length === 0 ? (
            <div className="sb-empty">Add sources to measure how thoroughly you have explored your corpus.</div>
          ) : (
            (coverage?.sources || []).map(item => {
              const pct = item.total_chunks > 0 ? Math.round((item.touched_chunks / item.total_chunks) * 100) : 0
              return (
                <article key={item.source_id} className="sb-ledger-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="sb-src-title">{item.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                        <span className="sb-num">{item.touched_chunks}</span> of <span className="sb-num">{item.total_chunks}</span> passages cited
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="sb-mono" style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                      <button
                        type="button"
                        className="sb-btn"
                        onClick={() => onOpenSource?.({ sourceId: item.source_id, chunkId: null })}
                      >
                        Inspect
                      </button>
                      {pct < 100 ? (
                        <button
                          type="button"
                          className="sb-btn"
                          onClick={() => sendQuestion(`Summarize the key facts and figures from ${item.title}.`)}
                        >
                          Explore gap
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="sb-src-bar" style={{ height: 5 }}>
                    <div className="sb-src-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </article>
              )
            })
          )}
        </div>
      ) : null}
    </main>
  )
}
