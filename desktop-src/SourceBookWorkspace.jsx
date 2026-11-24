import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, sdk } from './sdk.js'
import { Styles } from './styles.js'
import { api, currentEpoch, currentScopeKey } from './api.js'
import { SidebarSources } from './components/SidebarSources.jsx'
import { SourceInspector } from './components/SourceInspector.jsx'
import { ChatPanel } from './components/ChatPanel.jsx'
import { StudioPanel } from './components/StudioPanel.jsx'

export function SourceBookWorkspace({ ctx, externalState }) {
  const profile = typeof sdk.useValue === 'function' && sdk.host?.state?.profile
    ? sdk.useValue(sdk.host.state.profile)
    : 'default'
  const connectionId = typeof sdk.useValue === 'function' && sdk.host?.state?.connectionId
    ? sdk.useValue(sdk.host.state.connectionId)
    : 'local'
  const epoch = typeof sdk.useGatewayActivationEpoch === 'function' ? sdk.useGatewayActivationEpoch() : 0

  const [notebooks, setNotebooks] = useState([])
  const [nbId, setNbId] = useState('')
  const [notebook, setNotebook] = useState(null)
  const [sources, setSources] = useState([])
  const [notes, setNotes] = useState([])
  const [messages, setMessages] = useState([])
  const [claims, setClaims] = useState([])
  const [coverage, setCoverage] = useState(null)
  const [artifacts, setArtifacts] = useState([])

  const [centerTab, setCenterTab] = useState('chat')
  const [selectedArtifactId, setSelectedArtifactId] = useState(null)
  const [inspectorTarget, setInspectorTarget] = useState(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [studioExpanded, setStudioExpanded] = useState(false)
  const [nbMenuOpen, setNbMenuOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHits, setSearchHits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reqSeqRef = useRef(0)

  const storageKey = `activeNotebook::${connectionId || 'local'}::${profile || 'default'}`

  const loadNotebookData = useCallback(async targetNb => {
    if (!targetNb) {
      setNotebook(null)
      setSources([])
      setNotes([])
      setMessages([])
      setClaims([])
      setCoverage(null)
      setArtifacts([])
      return
    }
    const seq = ++reqSeqRef.current
    const startScope = currentScopeKey()
    const startEpoch = currentEpoch()
    try {
      const [nbMeta, srcList, noteList, msgList, claimList, covData, artList] = await Promise.all([
        api(`/notebooks/${encodeURIComponent(targetNb)}`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/sources`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/notes`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/messages`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/claims`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/coverage`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/artifacts`)
      ])
      if (seq !== reqSeqRef.current || currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return
      setNotebook(nbMeta)
      setSources(srcList || [])
      setNotes(noteList || [])
      setMessages(msgList || [])
      setClaims(claimList || [])
      setCoverage(covData || null)
      setArtifacts(artList || [])
      setError('')
      externalState?.set({ title: nbMeta?.title || '', dueCards: nbMeta?.due_cards || 0, nbId: targetNb })
    } catch (err) {
      if (seq === reqSeqRef.current) setError(err.message || 'Could not load notebook data.')
    }
  }, [externalState])

  const loadNotebooks = useCallback(async preferredId => {
    const startScope = currentScopeKey()
    const startEpoch = currentEpoch()
    setLoading(true)
    try {
      const list = await api('/notebooks')
      if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return
      const rows = Array.isArray(list) ? list : []
      setNotebooks(rows)
      const saved = ctx?.storage?.get?.(storageKey, '') || ''
      const pick = preferredId && rows.some(r => r.id === preferredId)
        ? preferredId
        : saved && rows.some(r => r.id === saved)
          ? saved
          : rows[0]?.id || ''
      setNbId(pick)
      if (pick) {
        ctx?.storage?.set?.(storageKey, pick)
        await loadNotebookData(pick)
      } else {
        await loadNotebookData('')
      }
      setError('')
    } catch (err) {
      setError(err.message || 'Could not reach SourceBook backend API.')
    } finally {
      setLoading(false)
    }
  }, [ctx, storageKey, loadNotebookData])

  // Re-scope cleanly whenever profile, connection, or gateway epoch changes
  useEffect(() => {
    setSelectedArtifactId(null)
    setInspectorTarget(null)
    loadNotebooks()
  }, [profile, connectionId, epoch, loadNotebooks])

  // Listen to backend notebook.changed events
  useEffect(() => {
    if (!ctx?.onEvent) return undefined
    return ctx.onEvent('plugin.sourcebook.notebook.changed', ev => {
      const target = ev?.payload?.nb || ev?.nb
      if (!target || target === nbId) {
        loadNotebookData(nbId)
      }
    })
  }, [ctx, nbId, loadNotebookData])

  // Keyboard shortcuts (Ctrl+K cross-notebook search, Escape closes modals/inspector)
  useEffect(() => {
    if (!ctx?.addEventListener) return undefined
    return ctx.addEventListener(window, 'keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setCreateOpen(false)
        setNbMenuOpen(false)
        setInspectorTarget(null)
      }
    })
  }, [ctx])

  // Handle pending deep-link citation jump from ::cite directive
  useEffect(() => {
    const pending = externalState?.get?.()?.pendingJump
    if (pending && pending.nb) {
      externalState.set({ ...externalState.get(), pendingJump: null })
      if (pending.nb !== nbId) {
        selectNotebook(pending.nb).then(() => {
          if (pending.chunk) setInspectorTarget({ sourceId: pending.chunk.split(':')[0], chunkId: pending.chunk })
        })
      } else if (pending.chunk) {
        setInspectorTarget({ sourceId: pending.chunk.split(':')[0], chunkId: pending.chunk })
      }
    }
  })

  async function selectNotebook(id) {
    setNbMenuOpen(false)
    setNbId(id)
    setSelectedArtifactId(null)
    setInspectorTarget(null)
    ctx?.storage?.set?.(storageKey, id)
    await loadNotebookData(id)
  }

  async function handleCreateNotebook(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const created = await api('/notebooks', { method: 'POST', body: { title: newTitle.trim(), icon: 'book-open' } })
      setNewTitle('')
      setCreateOpen(false)
      await loadNotebooks(created.id)
    } catch (err) {
      setError(err.message || 'Could not create notebook.')
    }
  }

  async function handleDeleteNotebook(targetId) {
    try {
      await api(`/notebooks/${encodeURIComponent(targetId)}`, { method: 'DELETE' })
      setNbMenuOpen(false)
      await loadNotebooks()
    } catch (err) {
      setError(err.message || 'Could not delete notebook.')
    }
  }

  async function toggleStrict() {
    if (!notebook?.id) return
    try {
      await api(`/notebooks/${encodeURIComponent(notebook.id)}`, {
        method: 'PATCH',
        body: { strict: !notebook.strict }
      })
      await loadNotebookData(notebook.id)
    } catch (err) {
      setError(err.message || 'Could not update grounding mode.')
    }
  }

  async function runCrossSearch(q) {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchHits([])
      return
    }
    try {
      const hits = await api(`/search?q=${encodeURIComponent(q.trim())}`)
      setSearchHits(Array.isArray(hits) ? hits : [])
    } catch {
      setSearchHits([])
    }
  }

  async function handlePromoteQuote(chunk, sourceTitle) {
    if (!nbId || !chunk) return
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes`, {
        method: 'POST',
        body: {
          title: `Excerpt from ${sourceTitle}`,
          markdown: `> ${chunk.text}\n\nCited chunk: \`${chunk.id}\``,
          citations: [chunk.id]
        }
      })
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Saved passage to Notes.' })
      await loadNotebookData(nbId)
    } catch (err) {
      setError(err.message || 'Could not save passage.')
    }
  }

  const covPct = coverage?.total_chunks ? Math.round((coverage.touched_chunks / coverage.total_chunks) * 100) : 0
  const hasActiveSources = sources.some(s => s.enabled)

  return (
    <div className="sb-root" style={{ position: 'relative' }}>
      <Styles />

      <header className="sb-topbar">
        <div className="sb-topbar-left">
          <div className="sb-brand">
            <span className="sb-brand-mark">
              <Icon name="BookOpen" size={13} />
            </span>
            <span>SourceBook</span>
          </div>

          <button
            type="button"
            className="sb-btn sb-btn-ghost sb-btn-icon"
            title={leftCollapsed ? 'Show Sources rail' : 'Hide Sources rail'}
            onClick={() => setLeftCollapsed(v => !v)}
          >
            <Icon name="PanelLeft" size={14} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="sb-nb-select"
              onClick={() => setNbMenuOpen(v => !v)}
              aria-expanded={nbMenuOpen}
            >
              <span className="sb-nb-select-label">{notebook?.title || (loading ? 'Loading...' : 'Select notebook')}</span>
              <Icon name="ChevronDown" size={13} />
            </button>
            {nbMenuOpen ? (
              <div
                style={{
                  position: 'absolute',
                  top: 34,
                  left: 0,
                  width: 280,
                  borderRadius: 10,
                  border: '1px solid var(--ui-stroke-secondary)',
                  background: 'var(--ui-bg-elevated, var(--ui-bg-primary))',
                  padding: 6,
                  zIndex: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {notebooks.map(nb => (
                  <div
                    key={nb.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '6px 8px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      background: nb.id === nbId ? 'var(--sb-accent-soft)' : 'transparent'
                    }}
                    onClick={() => selectNotebook(nb.id)}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="sb-src-title">{nb.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                        <span className="sb-num">{nb.source_count || 0}</span> sources | <span className="sb-num">{nb.artifact_count || 0}</span> artifacts
                      </div>
                    </div>
                    {notebooks.length > 1 ? (
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger"
                        title="Delete notebook"
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteNotebook(nb.id)
                        }}
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    ) : null}
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--ui-stroke-tertiary)', marginTop: 4, paddingTop: 4 }}>
                  <button
                    type="button"
                    className="sb-btn"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => {
                      setNbMenuOpen(false)
                      setCreateOpen(true)
                    }}
                  >
                    <Icon name="Plus" size={13} /> New notebook
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button type="button" className="sb-btn" onClick={() => setCreateOpen(true)}>
            <Icon name="Plus" size={13} /> New
          </button>
        </div>

        <div className="sb-topbar-right">
          {notebook ? (
            <>
              <button
                type="button"
                className="sb-cov-meter"
                title="Open Coverage Map"
                onClick={() => setCenterTab('coverage')}
              >
                <span>Coverage</span>
                <span className="sb-cov-track">
                  <span className="sb-cov-fill" style={{ width: `${covPct}%` }} />
                </span>
                <span className="sb-mono" style={{ fontWeight: 600 }}>{covPct}%</span>
              </button>

              <button
                type="button"
                className="sb-btn"
                data-active={Boolean(notebook.strict)}
                onClick={toggleStrict}
                title="Strict grounding refuses any claim unsupported by active sources"
              >
                <Icon name="Lock" size={12} /> {notebook.strict ? 'Strict' : 'Grounded'}
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="sb-btn"
            onClick={() => {
              setSearchQuery('')
              setSearchHits([])
              setSearchOpen(true)
            }}
            title="Search across all notebooks (Ctrl+K)"
          >
            <Icon name="Search" size={12} /> Search
          </button>
        </div>
      </header>

      {error ? (
        <div className="sb-error-bar" role="alert">
          <span>{error}</span>
          <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setError('')}>
            <Icon name="X" size={13} />
          </button>
        </div>
      ) : null}

      {!loading && !nbId ? (
        <div className="sb-empty" style={{ flex: 1, justifyContent: 'center' }}>
          <Icon name="BookOpen" size={32} style={{ color: 'var(--ui-accent)' }} />
          <div style={{ fontSize: 16, fontWeight: 650, color: 'var(--ui-text-primary)' }}>
            Create your first research notebook
          </div>
          <div style={{ maxWidth: 420, fontSize: 13 }}>
            Collect PDFs, DOCX files, Markdown, CSV tables, and URLs in one workspace. Every answer cites exact passages and turns sources into interactive Studio artifacts.
          </div>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => setCreateOpen(true)}>
            <Icon name="Plus" size={13} /> New notebook
          </button>
        </div>
      ) : (
        <div
          className="sb-workbench"
          data-left-collapsed={leftCollapsed}
          data-studio-expanded={studioExpanded}
        >
          <SidebarSources
            nbId={nbId}
            sources={sources}
            notes={notes}
            coverage={coverage}
            selectedSourceId={inspectorTarget?.sourceId || null}
            onSelectSource={setInspectorTarget}
            onRefresh={() => loadNotebookData(nbId)}
            onError={setError}
          />

          <ChatPanel
            ctx={ctx}
            notebook={notebook}
            sources={sources}
            messages={messages}
            claims={claims}
            coverage={coverage}
            centerTab={centerTab}
            onChangeCenterTab={setCenterTab}
            onOpenChunk={cid => setInspectorTarget({ sourceId: String(cid).split(':')[0], chunkId: cid })}
            onOpenSource={setInspectorTarget}
            onRefresh={() => loadNotebookData(nbId)}
            onError={setError}
          />

          <StudioPanel
            ctx={ctx}
            nbId={nbId}
            hasActiveSources={hasActiveSources}
            artifacts={artifacts}
            selectedArtifactId={selectedArtifactId}
            expanded={studioExpanded}
            onToggleExpand={() => setStudioExpanded(v => !v)}
            onSelectArtifact={setSelectedArtifactId}
            onOpenChunk={cid => setInspectorTarget({ sourceId: String(cid).split(':')[0], chunkId: cid })}
            onRefresh={() => loadNotebookData(nbId)}
            onError={setError}
          />
        </div>
      )}

      <SourceInspector
        nbId={nbId}
        target={inspectorTarget}
        onClose={() => setInspectorTarget(null)}
        onPromoteQuote={handlePromoteQuote}
      />

      {createOpen ? (
        <div className="sb-modal-backdrop" onClick={() => setCreateOpen(false)}>
          <form className="sb-modal" onClick={e => e.stopPropagation()} onSubmit={handleCreateNotebook}>
            <div className="sb-modal-head">
              <span>New research notebook</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setCreateOpen(false)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">Notebook title</span>
                <input
                  className="sb-input"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Distributed Systems Review, Q4 Market Research..."
                  required
                  autoFocus
                />
              </label>
            </div>
            <div className="sb-modal-foot">
              <button type="button" className="sb-btn" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button type="submit" className="sb-btn sb-btn-primary" disabled={!newTitle.trim()}>Create</button>
            </div>
          </form>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="sb-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="sb-modal" onClick={e => e.stopPropagation()}>
            <div className="sb-modal-head">
              <span>Search across all notebooks</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setSearchOpen(false)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <input
                className="sb-input"
                value={searchQuery}
                onChange={e => runCrossSearch(e.target.value)}
                placeholder="Search passages across every notebook..."
                autoFocus
              />
              {searchHits.length === 0 && searchQuery.trim() ? (
                <div className="sb-empty">No matching passages found.</div>
              ) : null}
              {searchHits.map(hit => (
                <div
                  key={`${hit.notebook_id}-${hit.chunk_id}`}
                  className="sb-ledger-row"
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    setSearchOpen(false)
                    if (hit.notebook_id !== nbId) await selectNotebook(hit.notebook_id)
                    setInspectorTarget({ sourceId: hit.source_id, chunkId: hit.chunk_id })
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <strong>{hit.notebook_title} / {hit.source_title}</strong>
                    <span className="sb-mono" style={{ color: 'var(--ui-accent)' }}>{hit.chunk_id}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>{hit.snippet}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
