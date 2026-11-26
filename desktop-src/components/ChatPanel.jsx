import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../sdk.js'
import { api, copyText, pollJob } from '../api.js'
import { MarkdownBody } from './MarkdownBody.jsx'
import { DitherCanvas, HermesSpinner } from './DitherSurface.jsx'

const PERSONAS = [
  { id: 'default', label: 'Default' },
  { id: 'analyst', label: 'Analyst' },
  { id: 'critic', label: 'Critic' },
  { id: 'tutor', label: 'Tutor' },
  { id: 'socratic', label: 'Socratic' }
]

const LENGTHS = [
  { id: 'short', label: 'Short' },
  { id: 'standard', label: 'Standard' },
  { id: 'long', label: 'Deep' }
]

export function ChatPanel({
  ctx,
  notebook,
  sources,
  messages,
  claims,
  contradictions,
  coverage,
  centerTab,
  onChangeCenterTab,
  onPatchNotebook,
  onOpenChunk,
  onOpenSource,
  onSaveMemory,
  onRefresh,
  onError
}) {
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [stage, setStage] = useState('')
  const [partialText, setPartialText] = useState('')
  const [briefingBusy, setBriefingBusy] = useState(false)
  const [claimFilter, setClaimFilter] = useState('all')
  const endRef = useRef(null)
  const cancelPollRef = useRef(null)
  const activeJobRef = useRef('')

  const enabledSources = sources.filter(s => s.enabled)

  useEffect(() => {
    return () => cancelPollRef.current?.()
  }, [])

  // Subscribe to live job progress / streaming deltas over Hermes event stream
  useEffect(() => {
    if (!ctx?.onEvent) return undefined
    return ctx.onEvent('plugin.sourcebook.job.progress', ev => {
      const payload = ev?.payload || ev || {}
      if (!activeJobRef.current || payload.job !== activeJobRef.current) return
      if (payload.stage) setStage(payload.stage)
      if (typeof payload.partial_text === 'string' && payload.partial_text) {
        setPartialText(payload.partial_text)
      }
    })
  }, [ctx])

  useEffect(() => {
    if (centerTab === 'chat' && endRef.current) {
      endRef.current.scrollIntoView({ block: 'end' })
    }
  }, [messages.length, partialText, centerTab])

  async function sendQuestion(promptText) {
    const q = String(promptText ?? input).trim()
    if (!q || !notebook?.id || asking) return
    if (enabledSources.length === 0) {
      onError?.('Enable at least one source before asking a question.')
      return
    }
    setInput('')
    setAsking(true)
    setStage('Searching active sources with hybrid retrieval...')
    setPartialText('')
    onChangeCenterTab('chat')
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/ask`, {
        method: 'POST',
        body: {
          text: q,
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          persona: notebook.persona || 'default',
          length: notebook.length || 'standard',
          strict: Boolean(notebook.strict)
        }
      })
      activeJobRef.current = job
      cancelPollRef.current?.()
      cancelPollRef.current = pollJob(
        ctx,
        job,
        j => {
          setStage(j.stage || 'Working...')
          if (j.partial_text) setPartialText(j.partial_text)
        },
        async () => {
          activeJobRef.current = ''
          setAsking(false)
          setStage('')
          setPartialText('')
          await onRefresh()
        },
        err => {
          activeJobRef.current = ''
          setAsking(false)
          setStage('')
          setPartialText('')
          onError?.(err.message || 'Could not answer question.')
        }
      )
    } catch (err) {
      activeJobRef.current = ''
      setAsking(false)
      setStage('')
      setPartialText('')
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

  const conflicts = contradictions?.conflicts || []
  const consensus = contradictions?.consensus || []
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
            <Icon name="ShieldCheck" size={12} /> Claim Ledger{' '}
            <span className="sb-num" style={{ opacity: 0.7 }}>{claims.length + conflicts.length}</span>
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
            <div className="sb-chat-track">
              {sources.length > 0 ? (
                <section className="sb-briefing" style={{ position: 'relative', overflow: 'hidden' }}>
                <DitherCanvas
                  variant="aurora"
                  animated={briefingBusy}
                  opacity={0.18}
                  cols={136}
                  rows={22}
                  style={{ position: 'absolute', inset: '0 0 auto 0', width: '100%', height: 68, pointerEvents: 'none' }}
                />
                <div className="sb-briefing-head" style={{ position: 'relative' }}>
                  <span className="sb-briefing-title">
                    <Icon name="BookOpen" size={14} /> Notebook Briefing
                  </span>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={briefingBusy || enabledSources.length === 0}
                    onClick={generateBriefing}
                  >
                    {briefingBusy ? <HermesSpinner size={11} /> : <Icon name="RefreshCw" size={12} />}{' '}
                    {briefingBusy ? 'Updating...' : guide ? 'Refresh' : 'Generate briefing'}
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
                <div style={{ maxWidth: 400, fontSize: 12.5 }}>
                  Upload PDFs, DOCX, Markdown, CSVs, audio, YouTube links, or sync a local folder in the left rail. Every reply links inline citations back to the exact passage.
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
                  <MarkdownBody text={msg.content} citeIndexMap={citeIndex} onOpenChunk={onOpenChunk} />
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
                      {gr.model ? (
                        <span className="sb-kind-tag" style={{ textTransform: 'none' }} title={`Answered by ${gr.provider ? `${gr.provider} / ` : ''}${gr.model}`}>
                          {gr.model}
                        </span>
                      ) : gr.mode === 'extractive' ? (
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
                      {onSaveMemory ? (
                        <button
                          type="button"
                          className="sb-btn sb-btn-ghost"
                          onClick={() =>
                            onSaveMemory({
                              title: (msg.content || '').split('\n')[0].replace(/\[\[c:[^\]]+\]\]/g, '').trim().slice(0, 56),
                              content: msg.content || '',
                              citations: msg.citations || []
                            })
                          }
                          title="Save this verified answer into Hermes persistent memory"
                        >
                          <Icon name="Brain" size={12} /> Memory
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}

            {asking ? (
              <div className="sb-msg sb-msg-assistant" aria-busy="true">
                {partialText ? (
                  <MarkdownBody text={partialText} citeIndexMap={new Map()} onOpenChunk={onOpenChunk} />
                ) : null}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ui-text-secondary)', fontSize: 12 }}>
                  <Icon name="Search" size={13} /> {stage || 'Searching active sources...'}
                </div>
              </div>
            ) : null}
              <div ref={endRef} />
            </div>
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
              <div className="sb-composer-bar" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                    <span className="sb-num">{enabledSources.length}</span>/{sources.length} active
                  </span>
                  {notebook ? (
                    <>
                      <select
                        className="sb-select"
                        aria-label="Response persona"
                        value={notebook.persona || 'default'}
                        onChange={e => onPatchNotebook?.({ persona: e.target.value })}
                      >
                        {PERSONAS.map(p => <option key={p.id} value={p.id}>Persona: {p.label}</option>)}
                      </select>
                      <select
                        className="sb-select"
                        aria-label="Response length"
                        value={notebook.length || 'standard'}
                        onChange={e => onPatchNotebook?.({ length: e.target.value })}
                      >
                        {LENGTHS.map(l => <option key={l.id} value={l.id}>Length: {l.label}</option>)}
                      </select>
                    </>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="sb-btn sb-btn-primary"
                  style={{ marginLeft: 'auto' }}
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
          <div className="sb-panel-track">
            <div className="sb-kpi-strip sb-kpi-strip-4">
            <div className="sb-kpi">
              <div className="sb-kpi-label">Verified</div>
              <div className="sb-kpi-val" style={{ color: 'var(--sb-ok)' }}>{supportedCount}</div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Partial</div>
              <div className="sb-kpi-val" style={{ color: 'var(--sb-warn)' }}>{partialCount}</div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Uncited</div>
              <div className="sb-kpi-val" style={{ color: unsupportedCount > 0 ? 'var(--sb-bad)' : 'var(--ui-text-primary)' }}>
                {unsupportedCount}
              </div>
            </div>
            <div className="sb-kpi">
              <div className="sb-kpi-label">Conflicts</div>
              <div className="sb-kpi-val" style={{ color: conflicts.length > 0 ? 'var(--sb-warn)' : 'var(--ui-text-primary)' }}>
                {conflicts.length}
              </div>
            </div>
          </div>

          {conflicts.length > 0 ? (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <span className="sb-pane-title">Cross-Source Contradictions ({conflicts.length})</span>
                <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                  Detected automatically across active sources
                </span>
              </div>
              {conflicts.map(cf => (
                <article key={cf.id} className="sb-conflict-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <strong style={{ fontSize: 12.5 }}>{cf.topic}</strong>
                    <span className="sb-verdict" data-v="partial">{cf.kind} conflict</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>{cf.summary}</div>
                  <div className="sb-conflict-sides">
                    {[cf.side_a, cf.side_b].map((side, idx) => (
                      <div key={idx} className="sb-quote-box" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                          <span className="sb-src-title" style={{ fontSize: 11.5 }}>{side.source_title}</span>
                          <button
                            type="button"
                            className="sb-cite"
                            onClick={() => onOpenSource?.({ sourceId: side.source_id, chunkId: side.chunk_id, highlight: side.value })}
                            title={`Inspect ${side.chunk_id}`}
                          >
                            {idx === 0 ? 'A' : 'B'}
                          </button>
                        </div>
                        <div className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-accent)', fontWeight: 600 }}>
                          {side.value}{side.date_ref ? ` (${side.date_ref})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {consensus.length > 0 ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Multi-source consensus:</span>
              {consensus.slice(0, 4).map((co, idx) => (
                <span key={idx} className="sb-verdict" data-v="supported">
                  {co.topic}: {co.value} ({co.sources.length} sources)
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div className="sb-seg" style={{ flexWrap: 'wrap' }}>
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
              Click any citation to inspect highlighted evidence
            </span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="sb-empty">
              <Icon name="ShieldCheck" size={24} />
              <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No chat claims recorded yet</div>
              <div style={{ fontSize: 12 }}>Ask a grounded question to populate the Claim Ledger with verifiable evidence.</div>
            </div>
          ) : (
            filteredClaims.map(cl => (
              <article key={cl.id} className="sb-ledger-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="sb-verdict" data-v={cl.verdict}>
                      {cl.verdict} {typeof cl.overlap === 'number' ? `(${Math.round(cl.overlap * 100)}%)` : ''}
                    </span>
                    {cl.numeric_mismatch ? (
                      <span className="sb-verdict" data-v="unsupported">number mismatch</span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    {cl.source_title ? (
                      <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>{cl.source_title}</span>
                    ) : null}
                    {(cl.citations || []).map(cid => (
                      <button
                        key={cid}
                        type="button"
                        className="sb-cite"
                        onClick={() => onOpenSource?.({ sourceId: String(cid).split(':')[0], chunkId: cid, highlight: (cl.quote || '').slice(0, 48) })}
                      >
                        {cid.split(':')[1] || cid}
                      </button>
                    ))}
                    {onSaveMemory && cl.verdict === 'supported' ? (
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost sb-btn-icon"
                        title="Promote verified claim to Hermes Memory"
                        onClick={() => onSaveMemory({ title: cl.source_title || '', content: cl.text, citations: cl.citations || [] })}
                      >
                        <Icon name="Brain" size={12} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ui-text-primary)' }}>{cl.text}</div>
                {cl.quote ? <div className="sb-quote-box">{cl.quote}</div> : null}
              </article>
            ))
          )}
          </div>
        </div>
      ) : null}

      {centerTab === 'coverage' ? (
        <div className="sb-panel-pad sb-scroll" style={{ flex: 1 }}>
          <div className="sb-panel-track">
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ minWidth: 0, flex: '1 1 160px' }}>
                      <div className="sb-src-title">{item.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                        <span className="sb-num">{item.touched_chunks}</span> of <span className="sb-num">{item.total_chunks}</span> passages cited
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
        </div>
      ) : null}
    </main>
  )
}
