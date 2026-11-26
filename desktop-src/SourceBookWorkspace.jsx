import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon, sdk } from './sdk.js'
import { Styles } from './styles.js'
import { api, currentEpoch, currentScopeKey } from './api.js'
import { SidebarSources } from './components/SidebarSources.jsx'
import { SourceInspector } from './components/SourceInspector.jsx'
import { ChatPanel } from './components/ChatPanel.jsx'
import { StudioPanel } from './components/StudioPanel.jsx'
import { BrandMark } from './components/BrandMark.jsx'
import { DitherCanvas } from './components/DitherSurface.jsx'

export function SourceBookWorkspace({ ctx, externalState }) {
  const profile = typeof sdk.useValue === 'function' && sdk.host?.state?.profile
    ? sdk.useValue(sdk.host.state.profile)
    : 'default'
  const connectionId = typeof sdk.useValue === 'function' && sdk.host?.state?.connectionId
    ? sdk.useValue(sdk.host.state.connectionId)
    : 'local'
  const epoch = typeof sdk.useGatewayActivationEpoch === 'function' ? sdk.useGatewayActivationEpoch() : 0
  const liveHostModel = typeof sdk.useValue === 'function' && sdk.host?.state?.model
    ? sdk.useValue(sdk.host.state.model)
    : ''

  const [notebooks, setNotebooks] = useState([])
  const [nbId, setNbId] = useState('')
  const [notebook, setNotebook] = useState(null)
  const [sources, setSources] = useState([])
  const [notes, setNotes] = useState([])
  const [messages, setMessages] = useState([])
  const [claims, setClaims] = useState([])
  const [contradictions, setContradictions] = useState(null)
  const [coverage, setCoverage] = useState(null)
  const [artifacts, setArtifacts] = useState([])
  const [modelsInfo, setModelsInfo] = useState(null)
  const [gatewayModelCatalog, setGatewayModelCatalog] = useState([])
  const [capabilities, setCapabilities] = useState(null)

  const [centerTab, setCenterTab] = useState('chat')
  const [selectedArtifactId, setSelectedArtifactId] = useState(null)
  const [inspectorTarget, setInspectorTarget] = useState(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)
  const [compactPane, setCompactPane] = useState('workspace') // 'sources' | 'workspace' | 'studio'
  const [layoutTier, setLayoutTier] = useState('standard') // 'compact' | 'split' | 'standard' | 'wide'
  const [nbMenuOpen, setNbMenuOpen] = useState(false)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [modelSearch, setModelSearch] = useState('')
  const [showCustomModel, setShowCustomModel] = useState(false)
  const [customProvider, setCustomProvider] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchScope, setSearchScope] = useState('all') // 'all' | 'current'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHits, setSearchHits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [studioExpanded, setStudioExpanded] = useState(false)

  const reqSeqRef = useRef(0)
  const rootRef = useRef(null)

  // Track the ACTUAL plugin container width (handles both OS window resizing AND Hermes split-screen panes!)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const resolveTier = width => {
      if (width < 740) return 'compact'
      if (width < 1080) return 'split'
      if (width >= 1600) return 'wide'
      return 'standard'
    }
    const update = w => {
      if (!w || w <= 0) return
      const next = resolveTier(w)
      setLayoutTier(prev => {
        if (prev !== next && next !== 'split') {
          setLeftDrawerOpen(false)
        }
        return next
      })
    }
    update(el.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280))
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          update(entry.contentRect?.width || el.clientWidth)
        }
      })
      ro.observe(el)
      return () => ro.disconnect()
    }
    if (ctx?.addEventListener) {
      return ctx.addEventListener(window, 'resize', () => update(el.clientWidth || window.innerWidth))
    }
    return undefined
  }, [ctx])

  const storageKey = `activeNotebook::${connectionId || 'local'}::${profile || 'default'}`

  // Fetch the user's FULL live Hermes authenticated model catalog via gateway `model.options` RPC
  const loadGatewayCatalog = useCallback(async () => {
    if (typeof sdk.host?.request !== 'function') return
    try {
      const res = await sdk.host.request('model.options', {
        include_unconfigured: false,
        explicit_only: false
      })
      const providers = Array.isArray(res?.providers) ? res.providers : []
      const flat = []
      for (const p of providers) {
        if (!p || !p.slug) continue
        const pName = p.name || p.slug
        const mList = Array.isArray(p.models) ? p.models : []
        for (const m of mList) {
          const mid = typeof m === 'string' ? m : (m?.id || m?.name || '')
          if (!mid) continue
          flat.push({
            provider: p.slug,
            providerLabel: pName,
            model: mid,
            source: 'hermes'
          })
        }
      }
      setGatewayModelCatalog(flat)
    } catch {
      // Fallback gracefully to backend /models list
    }
  }, [])

  const loadNotebookData = useCallback(async targetNb => {
    if (!targetNb) {
      setNotebook(null)
      setSources([])
      setNotes([])
      setMessages([])
      setClaims([])
      setContradictions(null)
      setCoverage(null)
      setArtifacts([])
      return
    }
    const seq = ++reqSeqRef.current
    const startScope = currentScopeKey()
    const startEpoch = currentEpoch()
    try {
      const [nbMeta, srcList, noteList, msgList, claimList, contraData, covData, artList] = await Promise.all([
        api(`/notebooks/${encodeURIComponent(targetNb)}`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/sources`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/notes`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/messages`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/claims`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/contradictions`).catch(() => ({ conflicts: [], consensus: [] })),
        api(`/notebooks/${encodeURIComponent(targetNb)}/coverage`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/artifacts`)
      ])
      if (seq !== reqSeqRef.current || currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return
      setNotebook(nbMeta)
      setSources(srcList || [])
      setNotes(noteList || [])
      setMessages(msgList || [])
      setClaims(claimList || [])
      setContradictions(contraData || { conflicts: [], consensus: [] })
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
      const [list, mInfo, caps] = await Promise.all([
        api('/notebooks'),
        api('/models').catch(() => null),
        api('/capabilities').catch(() => null)
      ])
      loadGatewayCatalog()
      if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return
      if (mInfo) setModelsInfo(mInfo)
      if (caps) setCapabilities(caps)
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
  }, [ctx, storageKey, loadNotebookData, loadGatewayCatalog])

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
        setModelMenuOpen(false)
        setLeftDrawerOpen(false)
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
    setModelMenuOpen(false)
    setNbId(id)
    setSelectedArtifactId(null)
    setInspectorTarget(null)
    ctx?.storage?.set?.(storageKey, id)
    await loadNotebookData(id)
  }

  async function patchNotebook(patch) {
    if (!notebook?.id) return
    try {
      const updated = await api(`/notebooks/${encodeURIComponent(notebook.id)}`, {
        method: 'PATCH',
        body: patch
      })
      setNotebook(updated)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not update notebook settings.')
    }
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

  async function runCrossSearch(q, scopeOverride) {
    const scope = scopeOverride || searchScope
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchHits([])
      return
    }
    try {
      const qs = new URLSearchParams({ q: q.trim() })
      if (scope === 'current' && nbId) qs.set('nb', nbId)
      const hits = await api(`/search?${qs.toString()}`)
      setSearchHits(Array.isArray(hits) ? hits : [])
    } catch {
      setSearchHits([])
    }
  }

  async function handleSaveMemory({ title = '', content = '', citations = [], targetNb = nbId }) {
    const destNb = targetNb || nbId
    if (!destNb || !String(content || '').trim()) return
    try {
      const res = await api(`/notebooks/${encodeURIComponent(destNb)}/memory/save`, {
        method: 'POST',
        body: { title, content, citations, target: 'memory' }
      })
      sdk.host?.notify?.({
        kind: 'success',
        title: 'Hermes Memory',
        message: res?.message || 'Saved verified insight to Hermes Memory.'
      })
    } catch (err) {
      sdk.host?.notify?.({
        kind: 'error',
        title: 'Hermes Memory',
        message: err.message || 'Could not save insight to Hermes Memory.'
      })
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

  // Merge live Hermes gateway catalog (`model.options`) + backend config options into a deduplicated searchable list
  const mergedCatalog = useMemo(() => {
    const seen = new Set()
    const out = []
    const push = item => {
      const p = String(item.provider || '').trim()
      const m = String(item.model || '').trim()
      if (!m) return
      const key = `${p.toLowerCase()}::${m.toLowerCase()}`
      if (seen.has(key)) return
      seen.add(key)
      out.push({
        provider: p,
        providerLabel: item.providerLabel || p || 'Hermes',
        model: m,
        source: item.source || 'config'
      })
    }
    for (const row of gatewayModelCatalog) push(row)
    for (const row of (modelsInfo?.options || [])) {
      if (row.source !== 'active') push(row)
    }
    const q = modelSearch.trim().toLowerCase()
    if (!q) return out
    return out.filter(
      it => it.model.toLowerCase().includes(q) || it.provider.toLowerCase().includes(q) || it.providerLabel.toLowerCase().includes(q)
    )
  }, [gatewayModelCatalog, modelsInfo, modelSearch])

  const groupedCatalog = useMemo(() => {
    const groups = new Map()
    for (const item of mergedCatalog) {
      const gKey = item.provider || 'configured'
      if (!groups.has(gKey)) {
        groups.set(gKey, { slug: gKey, label: item.providerLabel || gKey, items: [] })
      }
      groups.get(gKey).items.push(item)
    }
    return Array.from(groups.values())
  }, [mergedCatalog])

  const hasNativeCatalogMenu =
    typeof sdk.ModelCatalogMenu === 'function' &&
    Boolean(sdk.ModelMenuCloseContext) &&
    typeof sdk.DropdownMenu === 'function' &&
    typeof sdk.DropdownMenuTrigger === 'function' &&
    typeof sdk.DropdownMenuContent === 'function'
  const NativeModelCatalogMenu = sdk.ModelCatalogMenu
  const NativeModelMenuCloseContext = sdk.ModelMenuCloseContext
  const NativeDropdownMenu = sdk.DropdownMenu
  const NativeDropdownMenuTrigger = sdk.DropdownMenuTrigger
  const NativeDropdownMenuContent = sdk.DropdownMenuContent
  const NativeDropdownMenuItem = sdk.DropdownMenuItem
  const NativeDropdownMenuSeparator = sdk.DropdownMenuSeparator

  const nativeModelController = useMemo(() => {
    if (!hasNativeCatalogMenu || !notebook) return null
    return {
      allowSpeed: false,
      current: {
        effort: '',
        fast: false,
        model: notebook.model || modelsInfo?.active?.model || liveHostModel || '',
        provider: notebook.provider || modelsInfo?.active?.provider || ''
      },
      presetFor: () => ({}),
      applyPreset: (_preset, row) => {
        patchNotebook({ provider: row.provider || '', model: row.model || '' })
        setModelMenuOpen(false)
      },
      select: (model, provider) => {
        patchNotebook({ provider: provider || '', model: model || '' })
        setModelMenuOpen(false)
      },
      setOptions: (_patch, row) => {
        if (row?.model) {
          patchNotebook({ provider: row.provider || '', model: row.model })
        }
      }
    }
  }, [hasNativeCatalogMenu, notebook, modelsInfo, liveHostModel])

  const covPct = coverage?.total_chunks ? Math.round((coverage.touched_chunks / coverage.total_chunks) * 100) : 0
  const hasActiveSources = sources.some(s => s.enabled)
  const defaultModelName = modelsInfo?.active?.model || liveHostModel || ''
  const activeModelLabel = notebook?.model
    ? notebook.model
    : (defaultModelName ? `Auto: ${defaultModelName}` : 'Auto (Hermes)')

  const isCompact = layoutTier === 'compact'
  const isSplit = layoutTier === 'split'

  function handleSelectArtifact(aid) {
    setSelectedArtifactId(aid)
    if (aid) {
      if (isCompact) setCompactPane('studio')
      else if (rightCollapsed) setRightCollapsed(false)
    }
  }

  return (
    <div ref={rootRef} className="sb-root" data-layout={layoutTier} style={{ position: 'relative' }}>
      <Styles />

      <header className="sb-topbar">
        <div className="sb-topbar-left">
          <div className="sb-brand">
            <span className="sb-brand-mark">
              <BrandMark size={15} />
            </span>
            <span className="sb-brand-text">SourceBook</span>
          </div>

          {!isCompact ? (
            <button
              type="button"
              className="sb-btn sb-btn-ghost"
              style={isSplit ? { padding: '0 8px' } : { width: 28, padding: 0 }}
              data-active={isSplit ? leftDrawerOpen : !leftCollapsed}
              title={
                isSplit
                  ? (leftDrawerOpen ? 'Hide Sources drawer' : 'Show Sources drawer')
                  : (leftCollapsed ? 'Show Sources rail' : 'Hide Sources rail')
              }
              onClick={() => {
                if (isSplit) setLeftDrawerOpen(v => !v)
                else setLeftCollapsed(v => !v)
              }}
            >
              <Icon name="PanelLeft" size={14} />
              {isSplit ? <span className="sb-num" style={{ fontSize: 11 }}>{sources.length}</span> : null}
            </button>
          ) : null}

          <div style={{ position: 'relative', minWidth: 0 }}>
            <button
              type="button"
              className="sb-nb-select"
              onClick={() => {
                setModelMenuOpen(false)
                setNbMenuOpen(v => !v)
              }}
              aria-expanded={nbMenuOpen}
            >
              <span className="sb-nb-select-label">{notebook?.title || (loading ? 'Loading...' : 'Select notebook')}</span>
              <Icon name="ChevronDown" size={13} />
            </button>
            {nbMenuOpen ? (
              <div className="sb-model-menu" style={{ left: 0, right: 'auto' }}>
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

          <button type="button" className="sb-btn sb-top-new-btn" onClick={() => setCreateOpen(true)} title="Create new notebook">
            <Icon name="Plus" size={13} /> <span className="sb-top-label">New</span>
          </button>
        </div>

        <div className="sb-topbar-right">
          {notebook ? (
            <>
              {hasNativeCatalogMenu && nativeModelController ? (
                <NativeDropdownMenu open={modelMenuOpen} onOpenChange={open => {
                  setNbMenuOpen(false)
                  setModelMenuOpen(open)
                }}>
                  <NativeDropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="sb-btn sb-model-trigger"
                      data-active={Boolean(notebook.model)}
                      title={`Model: ${activeModelLabel} (click to switch across authenticated Hermes providers)`}
                    >
                      <Icon name="Cpu" size={12} />
                      <span className="sb-model-trigger-label">
                        {activeModelLabel}
                      </span>
                      <Icon name="ChevronDown" size={11} />
                    </button>
                  </NativeDropdownMenuTrigger>
                  <NativeDropdownMenuContent align="end" style={{ width: 'min(320px, calc(100vw - 24px))', padding: 0 }}>
                    {NativeDropdownMenuItem ? (
                      <div style={{ padding: '4px 4px 0' }}>
                        <NativeDropdownMenuItem
                          onSelect={async () => {
                            await patchNotebook({ provider: '', model: '' })
                            setModelMenuOpen(false)
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
                            <span style={{ fontWeight: !notebook.model ? 650 : 500 }}>Auto (Active Hermes)</span>
                            <span className="sb-mono" style={{ fontSize: 10.5, opacity: 0.72, maxWidth: 136, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {defaultModelName || 'default'}
                            </span>
                          </div>
                        </NativeDropdownMenuItem>
                      </div>
                    ) : null}
                    {NativeDropdownMenuSeparator ? <NativeDropdownMenuSeparator /> : null}
                    <NativeModelMenuCloseContext.Provider value={() => setModelMenuOpen(false)}>
                      <NativeModelCatalogMenu controller={nativeModelController} />
                    </NativeModelMenuCloseContext.Provider>
                    {modelsInfo && !modelsInfo.override_ready ? (
                      <div style={{ padding: '6px 10px 8px', fontSize: 10.5, color: 'var(--ui-text-tertiary)', borderTop: '1px solid var(--ui-stroke-tertiary)', lineHeight: 1.4 }}>
                        Enable <span className="sb-mono">allow_model_override</span> in Hermes config to pin overrides (see Settings).
                      </div>
                    ) : null}
                  </NativeDropdownMenuContent>
                </NativeDropdownMenu>
              ) : (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="sb-btn sb-model-trigger"
                    data-active={Boolean(notebook.model)}
                    onClick={() => {
                      setNbMenuOpen(false)
                      setCustomProvider(notebook.provider || '')
                      setCustomModel(notebook.model || '')
                      setModelSearch('')
                      if (!modelMenuOpen) loadGatewayCatalog()
                      setModelMenuOpen(v => !v)
                    }}
                    title={`Model: ${activeModelLabel} (click to switch across authenticated Hermes providers)`}
                  >
                    <Icon name="Cpu" size={12} />
                    <span className="sb-model-trigger-label">
                      {activeModelLabel}
                    </span>
                    <Icon name="ChevronDown" size={11} />
                  </button>
                  {modelMenuOpen ? (
                    <div className="sb-model-menu">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 2px' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 650, color: 'var(--ui-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Hermes Model Picker
                        </span>
                        {modelsInfo?.override_ready ? (
                          <span className="sb-verdict" data-v="supported" style={{ fontSize: 10, padding: '1px 6px' }}>
                            Any model ready
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost"
                        style={{ width: '100%', justifyContent: 'space-between' }}
                        data-active={!notebook.model}
                        onClick={async () => {
                          await patchNotebook({ provider: '', model: '' })
                          setModelMenuOpen(false)
                        }}
                      >
                        <span>Auto (Active Hermes)</span>
                        <span className="sb-mono" style={{ fontSize: 10.5, opacity: 0.72, maxWidth: 148, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {defaultModelName || 'default'}
                        </span>
                      </button>

                      {mergedCatalog.length > 0 ? (
                        <div style={{ padding: '4px 4px 2px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <input
                            className="sb-input"
                            style={{ height: 28, fontSize: 11.5 }}
                            value={modelSearch}
                            onChange={e => setModelSearch(e.target.value)}
                            placeholder={`Search ${mergedCatalog.length} Hermes models...`}
                          />
                          <div className="sb-scroll" style={{ maxHeight: 'min(240px, 42vh)', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
                            {groupedCatalog.map(grp => (
                              <div key={grp.slug} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <div style={{ fontSize: 10, fontWeight: 650, color: 'var(--ui-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px' }}>
                                  {grp.label} ({grp.items.length})
                                </div>
                                {grp.items.slice(0, 24).map(opt => {
                                  const active = notebook.model === opt.model && (notebook.provider || '') === (opt.provider || '')
                                  return (
                                    <button
                                      key={`${opt.provider}:${opt.model}`}
                                      type="button"
                                      className="sb-btn sb-btn-ghost"
                                      style={{ width: '100%', justifyContent: 'space-between', height: 26 }}
                                      data-active={active}
                                      onClick={async () => {
                                        await patchNotebook({ provider: opt.provider || '', model: opt.model })
                                        setModelMenuOpen(false)
                                      }}
                                    >
                                      <span className="sb-src-title" style={{ fontSize: 12 }}>{opt.model}</span>
                                      {active ? <Icon name="Check" size={12} style={{ color: 'var(--ui-accent)' }} /> : null}
                                    </button>
                                  )
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div style={{ borderTop: '1px solid var(--ui-stroke-tertiary)', marginTop: 4, paddingTop: 4 }}>
                        <button
                          type="button"
                          className="sb-btn sb-btn-ghost"
                          style={{ width: '100%', justifyContent: 'space-between', fontSize: 11 }}
                          onClick={() => setShowCustomModel(v => !v)}
                        >
                          <span>Custom provider / model ID</span>
                          <Icon name={showCustomModel ? 'ChevronDown' : 'ChevronRight'} size={11} />
                        </button>
                        {showCustomModel ? (
                          <form
                            style={{ padding: '6px 4px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}
                            onSubmit={async e => {
                              e.preventDefault()
                              await patchNotebook({ provider: customProvider.trim(), model: customModel.trim() })
                              setModelMenuOpen(false)
                            }}
                          >
                            <input
                              className="sb-input"
                              value={customProvider}
                              onChange={e => setCustomProvider(e.target.value)}
                              placeholder="Provider (e.g. openrouter, ollama, anthropic)"
                            />
                            <input
                              className="sb-input"
                              value={customModel}
                              onChange={e => setCustomModel(e.target.value)}
                              placeholder="Model ID (e.g. claude-opus-5-5, qwen3:32b)"
                            />
                            <button type="submit" className="sb-btn sb-btn-primary" disabled={!customModel.trim()}>
                              Apply model
                            </button>
                          </form>
                        ) : null}
                        {modelsInfo && !modelsInfo.override_ready ? (
                          <div style={{ padding: '4px 6px', fontSize: 10.5, color: 'var(--ui-text-tertiary)', lineHeight: 1.4 }}>
                            Enable <span className="sb-mono">allow_model_override</span> in Hermes config to pin overrides (see Settings).
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                type="button"
                className="sb-cov-meter sb-hide-compact"
                title="Open Coverage Map"
                onClick={() => {
                  setCenterTab('coverage')
                  if (isCompact) setCompactPane('workspace')
                }}
              >
                <span className="sb-cov-label">Coverage</span>
                <span className="sb-cov-track">
                  <span className="sb-cov-fill sb-dither-fill" style={{ width: `${covPct}%` }} />
                </span>
                <span className="sb-mono" style={{ fontWeight: 600 }}>{covPct}%</span>
              </button>

              <button
                type="button"
                className="sb-btn sb-top-strict-btn"
                data-active={Boolean(notebook.strict)}
                onClick={() => patchNotebook({ strict: !notebook.strict })}
                title="Strict grounding refuses any claim unsupported by active sources"
              >
                <Icon name="Lock" size={12} /> <span className="sb-top-label">{notebook.strict ? 'Strict' : 'Grounded'}</span>
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="sb-btn sb-top-search-btn"
            onClick={() => {
              setSearchQuery('')
              setSearchHits([])
              setSearchOpen(true)
            }}
            title="Search across all notebooks (Ctrl+K)"
          >
            <Icon name="Search" size={12} /> <span className="sb-top-label">Search</span>
          </button>

          {!isCompact && nbId ? (
            <button
              type="button"
              className="sb-btn sb-btn-ghost sb-btn-icon"
              data-active={!rightCollapsed}
              title={rightCollapsed ? 'Show Studio rail' : 'Hide Studio rail'}
              onClick={() => {
                if (studioExpanded) setStudioExpanded(false)
                setRightCollapsed(v => !v)
              }}
            >
              <Icon name="PanelRight" size={14} />
            </button>
          ) : null}
        </div>
      </header>

      {nbId && isCompact ? (
        <nav className="sb-compact-bar" aria-label="Workspace panes">
          <div className="sb-seg sb-compact-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={compactPane === 'sources'}
              className="sb-seg-btn"
              data-active={compactPane === 'sources'}
              onClick={() => setCompactPane('sources')}
            >
              <Icon name="Library" size={12} /> Sources <span className="sb-num" style={{ opacity: 0.72 }}>{sources.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={compactPane === 'workspace'}
              className="sb-seg-btn"
              data-active={compactPane === 'workspace'}
              onClick={() => setCompactPane('workspace')}
            >
              <Icon name="MessageSquare" size={12} /> Workspace
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={compactPane === 'studio'}
              className="sb-seg-btn"
              data-active={compactPane === 'studio'}
              onClick={() => setCompactPane('studio')}
            >
              <Icon name="Sparkles" size={12} /> Studio <span className="sb-num" style={{ opacity: 0.72 }}>{artifacts.length}</span>
            </button>
          </div>
        </nav>
      ) : null}

      {error ? (
        <div className="sb-error-bar" role="alert">
          <span>{error}</span>
          <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setError('')}>
            <Icon name="X" size={13} />
          </button>
        </div>
      ) : null}

      {!loading && !nbId ? (
        <div className="sb-empty" style={{ flex: 1, justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <DitherCanvas
            variant="aurora"
            animated={false}
            opacity={0.22}
            style={{ position: 'absolute', inset: '0 0 auto 0', width: '100%', height: 150, pointerEvents: 'none' }}
          />
          <BrandMark size={38} style={{ color: 'var(--ui-text-primary)', position: 'relative' }} />
          <div style={{ fontSize: 16, fontWeight: 650, color: 'var(--ui-text-primary)', position: 'relative' }}>
            Create your first research notebook
          </div>
          <div style={{ maxWidth: 440, fontSize: 13, position: 'relative' }}>
            Collect PDFs, DOCX files, Markdown, CSV tables, YouTube videos, local folders, and web URLs in one workspace. Every answer cites exact passages and runs on any model configured in Hermes.
          </div>
          <button type="button" className="sb-btn sb-btn-primary" style={{ position: 'relative' }} onClick={() => setCreateOpen(true)}>
            <Icon name="Plus" size={13} /> New notebook
          </button>
        </div>
      ) : (
        <div
          className="sb-workbench"
          data-tier={layoutTier}
          data-left-collapsed={!isCompact && !isSplit && leftCollapsed}
          data-right-collapsed={!isCompact && rightCollapsed}
          data-left-drawer={isSplit && leftDrawerOpen}
          data-compact-pane={compactPane}
          data-studio-expanded={!isCompact && studioExpanded}
        >
          {isSplit && leftDrawerOpen ? (
            <div className="sb-drawer-backdrop" onClick={() => setLeftDrawerOpen(false)} aria-hidden="true" />
          ) : null}

          <SidebarSources
            ctx={ctx}
            nbId={nbId}
            sources={sources}
            notes={notes}
            coverage={coverage}
            selectedSourceId={inspectorTarget?.sourceId || null}
            onSelectSource={target => {
              setInspectorTarget(target)
              if (isSplit) setLeftDrawerOpen(false)
            }}
            onOpenArtifact={handleSelectArtifact}
            onSaveMemory={handleSaveMemory}
            onRefresh={() => loadNotebookData(nbId)}
            onError={setError}
          />

          <ChatPanel
            ctx={ctx}
            notebook={notebook}
            sources={sources}
            messages={messages}
            claims={claims}
            contradictions={contradictions}
            coverage={coverage}
            centerTab={centerTab}
            onChangeCenterTab={setCenterTab}
            onPatchNotebook={patchNotebook}
            onOpenChunk={cid => setInspectorTarget({ sourceId: String(cid).split(':')[0], chunkId: cid })}
            onOpenSource={setInspectorTarget}
            onSaveMemory={handleSaveMemory}
            onRefresh={() => loadNotebookData(nbId)}
            onError={setError}
          />

          <StudioPanel
            ctx={ctx}
            nbId={nbId}
            sources={sources}
            hasActiveSources={hasActiveSources}
            capabilities={capabilities}
            artifacts={artifacts}
            selectedArtifactId={selectedArtifactId}
            expanded={!isCompact && studioExpanded}
            onToggleExpand={isCompact ? undefined : () => setStudioExpanded(v => !v)}
            onSelectArtifact={handleSelectArtifact}
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
        onSaveMemory={handleSaveMemory}
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
          <div className="sb-modal" style={{ width: 'min(620px, 94vw)' }} onClick={e => e.stopPropagation()}>
            <div className="sb-modal-head" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
                <span>Cross-Notebook Search</span>
                <div className="sb-seg">
                  <button
                    type="button"
                    className="sb-seg-btn"
                    data-active={searchScope === 'all'}
                    onClick={() => {
                      setSearchScope('all')
                      runCrossSearch(searchQuery, 'all')
                    }}
                  >
                    All ({notebooks.length})
                  </button>
                  <button
                    type="button"
                    className="sb-seg-btn"
                    data-active={searchScope === 'current'}
                    disabled={!nbId}
                    onClick={() => {
                      setSearchScope('current')
                      runCrossSearch(searchQuery, 'current')
                    }}
                  >
                    Current
                  </button>
                </div>
              </div>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setSearchOpen(false)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body sb-scroll" style={{ maxHeight: '68vh' }}>
              <input
                className="sb-input"
                value={searchQuery}
                onChange={e => runCrossSearch(e.target.value)}
                placeholder={
                  searchScope === 'all'
                    ? 'Hybrid semantic + BM25 search across every notebook...'
                    : 'Search passages inside this notebook...'
                }
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
                    setInspectorTarget({ sourceId: hit.source_id, chunkId: hit.chunk_id, highlight: searchQuery.trim() })
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <strong className="sb-src-title">{hit.notebook_title} / {hit.source_title}</strong>
                      {hit.source_kind ? <span className="sb-kind-tag">{hit.source_kind}</span> : null}
                      {hit.page > 1 ? <span className="sb-kind-tag">p.{hit.page}</span> : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <span className="sb-mono" style={{ color: 'var(--ui-accent)', fontSize: 10.5 }}>{hit.chunk_id}</span>
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost sb-btn-icon"
                        title="Save this passage to Hermes persistent memory"
                        onClick={() => handleSaveMemory({ title: hit.source_title, content: hit.snippet, citations: [hit.chunk_id], targetNb: hit.notebook_id })}
                      >
                        <Icon name="Brain" size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', lineHeight: 1.48 }}>{hit.snippet}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
