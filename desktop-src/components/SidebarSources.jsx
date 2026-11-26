import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../sdk.js'
import { api, getContext, pollJob, uploadFile } from '../api.js'
import { HermesSpinner } from './DitherSurface.jsx'

const KIND_ICONS = {
  pdf: 'FileText',
  docx: 'FileText',
  markdown: 'FileCode',
  text: 'AlignLeft',
  csv: 'Table',
  json: 'Braces',
  url: 'Globe',
  youtube: 'PlayCircle',
  image: 'Image',
  audio: 'Headphones',
  note: 'StickyNote'
}

function fmtWords(n) {
  const v = Number(n) || 0
  if (typeof sdk.compactNumber === 'function') return sdk.compactNumber(v)
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}

export function SidebarSources({
  ctx,
  nbId,
  sources,
  notes,
  coverage,
  selectedSourceId,
  onSelectSource,
  onOpenArtifact,
  onSaveMemory,
  onRefresh,
  onError
}) {
  const [tab, setTab] = useState('sources')
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [refreshingId, setRefreshingId] = useState('')
  const [modal, setModal] = useState(null) // 'paste' | 'url' | 'folder' | 'discover' | 'note' | { editNote }
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [folderPath, setFolderPath] = useState('')
  const [discoverMode, setDiscoverMode] = useState('quick') // 'quick' | 'deep'
  const [discoverQuery, setDiscoverQuery] = useState('')
  const [discoverResults, setDiscoverResults] = useState([])
  const [discoverChecked, setDiscoverChecked] = useState({})
  const [deepDepth, setDeepDepth] = useState('standard')
  const [deepAutoBrief, setDeepAutoBrief] = useState(true)
  const [deepRunning, setDeepRunning] = useState(false)
  const [deepStage, setDeepStage] = useState('')
  const [deepPct, setDeepPct] = useState(0)
  const [deepResult, setDeepResult] = useState(null)
  const fileRef = useRef(null)
  const cancelDeepRef = useRef(null)

  useEffect(() => {
    return () => cancelDeepRef.current?.()
  }, [])

  const covBySource = {}
  for (const item of coverage?.sources || []) {
    covBySource[item.source_id] = item
  }

  const enabledCount = sources.filter(s => s.enabled).length
  const allEnabled = sources.length > 0 && enabledCount === sources.length

  async function toggleAll() {
    if (!nbId || !sources.length) return
    const next = !allEnabled
    try {
      await Promise.all(
        sources.map(s => api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(s.id)}`, {
          method: 'PATCH',
          body: { enabled: next }
        }))
      )
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not update sources.')
    }
  }

  async function toggleSource(e, src) {
    e.stopPropagation()
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}`, {
        method: 'PATCH',
        body: { enabled: !src.enabled }
      })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not toggle source.')
    }
  }

  async function handleFiles(fileList) {
    if (!nbId || !fileList?.length) return
    setBusy(true)
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(nbId, file)
      }
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Upload failed.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submitPaste(e) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
        method: 'POST',
        body: { title: title.trim() || body.trim().slice(0, 48), text: body, kind: 'markdown' }
      })
      setModal(null)
      setTitle('')
      setBody('')
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not add source.')
    } finally {
      setBusy(false)
    }
  }

  async function submitUrl(e) {
    e.preventDefault()
    if (!urlInput.trim()) return
    setBusy(true)
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
        method: 'POST',
        body: { url: urlInput.trim(), title: title.trim() }
      })
      setModal(null)
      setTitle('')
      setUrlInput('')
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not ingest URL.')
    } finally {
      setBusy(false)
    }
  }

  async function submitFolder(e) {
    e.preventDefault()
    if (!folderPath.trim()) return
    setBusy(true)
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/sync-path`, {
        method: 'POST',
        body: { path: folderPath.trim(), max_files: 40 }
      })
      setModal(null)
      setFolderPath('')
      sdk.host?.notify?.({
        kind: 'success',
        title: 'SourceBook',
        message: `Synced ${res?.added?.length || 0} source(s) from disk.`
      })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not sync local path.')
    } finally {
      setBusy(false)
    }
  }

  async function runDiscover(e) {
    e.preventDefault()
    if (!discoverQuery.trim()) return
    setBusy(true)
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/discover`, {
        method: 'POST',
        body: { query: discoverQuery.trim(), limit: 8 }
      })
      const list = Array.isArray(res?.results) ? res.results : []
      setDiscoverResults(list)
      const initial = {}
      list.slice(0, 3).forEach(r => { initial[r.url] = true })
      setDiscoverChecked(initial)
    } catch (err) {
      onError?.(err.message || 'Web source discovery failed.')
    } finally {
      setBusy(false)
    }
  }

  async function runDeepResearch(e) {
    e.preventDefault()
    if (!discoverQuery.trim() || deepRunning || !nbId) return
    setDeepRunning(true)
    setDeepResult(null)
    setDeepStage('Planning complementary research queries...')
    setDeepPct(10)
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/deep-research`, {
        method: 'POST',
        body: {
          topic: discoverQuery.trim(),
          depth: deepDepth,
          auto_brief: deepAutoBrief
        }
      })
      const pollCtx = ctx || getContext()
      cancelDeepRef.current?.()
      cancelDeepRef.current = pollJob(
        pollCtx,
        job,
        j => {
          setDeepStage(j.stage || 'Researching...')
          if (typeof j.pct === 'number') setDeepPct(j.pct)
        },
        async result => {
          setDeepRunning(false)
          setDeepPct(100)
          setDeepStage('')
          setDeepResult(result || null)
          await onRefresh()
          const n = result?.ingested?.length || 0
          sdk.host?.notify?.({
            kind: 'success',
            title: 'SourceBook Deep Research',
            message: `Auto-ingested ${n} source${n === 1 ? '' : 's'}${result?.artifact ? ' and synthesized a Research Briefing' : ''}.`
          })
        },
        err => {
          setDeepRunning(false)
          setDeepStage('')
          onError?.(err.message || 'Deep Research run failed.')
        }
      )
    } catch (err) {
      setDeepRunning(false)
      setDeepStage('')
      onError?.(err.message || 'Could not start Deep Research.')
    }
  }

  async function importDiscovered() {
    const selected = discoverResults.filter(r => discoverChecked[r.url])
    if (!selected.length) return
    setBusy(true)
    let ok = 0
    try {
      for (const item of selected) {
        try {
          await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
            method: 'POST',
            body: { url: item.url, title: item.title }
          })
          ok += 1
        } catch {
          // continue importing remaining checked sources
        }
      }
      setModal(null)
      setDiscoverResults([])
      setDiscoverQuery('')
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: `Imported ${ok} discovered source(s).` })
      await onRefresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleRefreshSource(e, src) {
    e.stopPropagation()
    if (refreshingId) return
    setRefreshingId(src.id)
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}/refresh`, {
        method: 'POST'
      })
      sdk.host?.notify?.({
        kind: 'success',
        title: 'SourceBook',
        message: res?.changed ? `Updated "${src.title}" from origin.` : `"${src.title}" is already up to date.`
      })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not refresh source.')
    } finally {
      setRefreshingId('')
    }
  }

  async function submitNote(e) {
    e.preventDefault()
    if (!title.trim() && !body.trim()) return
    setBusy(true)
    try {
      if (modal && typeof modal === 'object' && modal.id) {
        await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(modal.id)}`, {
          method: 'PATCH',
          body: { title: title.trim() || 'Untitled note', markdown: body, resync_hashes: true }
        })
      } else {
        await api(`/notebooks/${encodeURIComponent(nbId)}/notes`, {
          method: 'POST',
          body: { title: title.trim() || 'Untitled note', markdown: body }
        })
      }
      setModal(null)
      setTitle('')
      setBody('')
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not save note.')
    } finally {
      setBusy(false)
    }
  }

  async function resyncNote(note) {
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}`, {
        method: 'PATCH',
        body: { resync_hashes: true }
      })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not mark note synced.')
    }
  }

  async function promoteNote(note) {
    setBusy(true)
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}/promote`, { method: 'POST' })
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: `Promoted "${note.title}" to sources.` })
      setTab('sources')
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not promote note.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteNote(note) {
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}`, { method: 'DELETE' })
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not delete note.')
    }
  }

  async function deleteSource(e, src) {
    e.stopPropagation()
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}`, { method: 'DELETE' })
      if (selectedSourceId === src.id) onSelectSource?.(null)
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not remove source.')
    }
  }

  return (
    <aside className="sb-pane sb-pane-left" aria-label="Sources and Notes">
      <div className="sb-pane-head">
        <div className="sb-seg" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sources'}
            className="sb-seg-btn"
            data-active={tab === 'sources'}
            onClick={() => setTab('sources')}
          >
            Sources <span className="sb-num" style={{ opacity: 0.7 }}>{sources.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'notes'}
            className="sb-seg-btn"
            data-active={tab === 'notes'}
            onClick={() => setTab('notes')}
          >
            Notes <span className="sb-num" style={{ opacity: 0.7 }}>{notes.length}</span>
          </button>
        </div>
        {tab === 'sources' && sources.length > 0 ? (
          <button type="button" className="sb-btn sb-btn-ghost" onClick={toggleAll} title="Toggle all sources">
            <span className="sb-num">{enabledCount}/{sources.length}</span>
          </button>
        ) : null}
        {tab === 'notes' ? (
          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={() => {
              setTitle('')
              setBody('')
              setModal('note')
            }}
          >
            <Icon name="Plus" size={13} /> New
          </button>
        ) : null}
      </div>

      {tab === 'sources' ? (
        <>
          <div
            className="sb-dropzone"
            data-over={dragOver}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer?.files)
            }}
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".txt,.md,.markdown,.pdf,.docx,.csv,.tsv,.json,.html,.htm,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.mp4,.webm,.py,.ts,.tsx,.js,.yaml,.yml"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="sb-dropzone-actions" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="Upload" size={12} /> File
              </button>
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => {
                  setTitle('')
                  setUrlInput('')
                  setModal('url')
                }}
              >
                <Icon name="Link" size={12} /> URL/YT
              </button>
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => {
                  setFolderPath('')
                  setModal('folder')
                }}
                title="Sync a local folder, Obsidian vault, or Git repository"
              >
                <Icon name="FolderOpen" size={12} /> Folder
              </button>
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => {
                  setDiscoverQuery('')
                  setDiscoverResults([])
                  setModal('discover')
                }}
                title="Search the web and bulk-import sources"
              >
                <Icon name="Globe" size={12} /> Discover
              </button>
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => {
                  setTitle('')
                  setBody('')
                  setModal('paste')
                }}
              >
                <Icon name="FilePlus" size={12} /> Paste
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)', textAlign: 'center' }}>
              {busy ? 'Indexing source...' : 'Drop PDF, DOCX, Markdown, CSV, audio, or URLs'}
            </div>
          </div>

          <div className="sb-src-list sb-scroll">
            {sources.length === 0 ? (
              <div className="sb-empty">
                <Icon name="BookOpen" size={22} />
                <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No sources yet</div>
                <div style={{ fontSize: 11.5 }}>
                  Add documents, YouTube videos, local folders, or discover web sources.
                </div>
              </div>
            ) : (
              sources.map(src => {
                const cov = covBySource[src.id]
                const pct = cov && cov.total_chunks > 0 ? Math.round((cov.touched_chunks / cov.total_chunks) * 100) : 0
                const canRefresh = Boolean(src.origin_path) || (typeof src.origin === 'string' && /^https?:\/\//i.test(src.origin))
                return (
                  <div
                    key={src.id}
                    className="sb-src-row"
                    data-selected={selectedSourceId === src.id}
                    data-disabled={!src.enabled}
                    onClick={() => onSelectSource?.({ sourceId: src.id, chunkId: null })}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectSource?.({ sourceId: src.id, chunkId: null })
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      className="sb-checkbox"
                      checked={Boolean(src.enabled)}
                      onClick={e => e.stopPropagation()}
                      onChange={e => toggleSource(e, src)}
                      aria-label={`Include ${src.title}`}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="sb-src-title" title={src.title}>
                        {src.title}
                      </div>
                      <div className="sb-src-meta">
                        <Icon name={KIND_ICONS[src.kind] || 'FileText'} size={11} />
                        <span className="sb-kind-tag">{src.kind}</span>
                        <span className="sb-num">{fmtWords(src.word_count ?? Math.round((src.chars || 0) / 5))} w</span>
                        <span className="sb-num">{src.chunk_count} ch</span>
                      </div>
                      <div className="sb-src-bar" title={`Coverage: ${pct}%`}>
                        <div className="sb-src-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                      {canRefresh ? (
                        <button
                          type="button"
                          className="sb-btn sb-btn-ghost sb-btn-icon"
                          title="Refresh source from disk or URL"
                          disabled={refreshingId === src.id}
                          onClick={e => handleRefreshSource(e, src)}
                        >
                          <Icon name="RefreshCw" size={12} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger"
                        title="Remove source"
                        aria-label={`Remove ${src.title}`}
                        onClick={e => deleteSource(e, src)}
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div className="sb-src-list sb-scroll">
          {notes.length === 0 ? (
            <div className="sb-empty">
              <Icon name="StickyNote" size={22} />
              <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No notes saved</div>
              <div style={{ fontSize: 11.5 }}>
                Capture findings or save any cited chat reply as a reusable Living Note.
              </div>
              <button
                type="button"
                className="sb-btn"
                onClick={() => {
                  setTitle('')
                  setBody('')
                  setModal('note')
                }}
              >
                <Icon name="Plus" size={13} /> Write a note
              </button>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className="sb-ledger-row"
                style={{ cursor: 'pointer', borderColor: note.stale ? 'var(--sb-warn)' : undefined }}
                onClick={() => {
                  setTitle(note.title || '')
                  setBody(note.markdown || '')
                  setModal(note)
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <div className="sb-src-title" style={{ flex: 1 }} title={note.title}>
                    {note.title}
                  </div>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    {note.stale ? (
                      <button
                        type="button"
                        className="sb-verdict"
                        data-v="partial"
                        style={{ border: 0, cursor: 'pointer' }}
                        title="Cited source changed since this note was saved. Click to mark reviewed."
                        onClick={() => resyncNote(note)}
                      >
                        Stale
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon"
                      title="Promote note to active source"
                      onClick={() => promoteNote(note)}
                    >
                      <Icon name="ArrowUpRight" size={13} />
                    </button>
                    {onSaveMemory ? (
                      <button
                        type="button"
                        className="sb-btn sb-btn-ghost sb-btn-icon"
                        title="Save note insight to Hermes persistent memory"
                        onClick={() => onSaveMemory({ title: note.title, content: note.markdown, citations: note.citations || [] })}
                      >
                        <Icon name="Brain" size={12} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger"
                      title="Delete note"
                      onClick={() => deleteNote(note)}
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--ui-text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {note.markdown || 'Empty note'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modal === 'paste' ? (
        <div className="sb-modal-backdrop" onClick={() => setModal(null)}>
          <form className="sb-modal" onClick={e => e.stopPropagation()} onSubmit={submitPaste}>
            <div className="sb-modal-head">
              <span>Paste text or Markdown</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">Title</span>
                <input
                  className="sb-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Architecture notes, benchmark table, transcript..."
                  autoFocus
                />
              </label>
              <label className="sb-field">
                <span className="sb-label">Content</span>
                <textarea
                  className="sb-input"
                  style={{ height: 200, padding: '8px 10px', resize: 'vertical' }}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Paste text or Markdown here..."
                  required
                />
              </label>
            </div>
            <div className="sb-modal-foot">
              <button type="button" className="sb-btn" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="sb-btn sb-btn-primary" disabled={busy || !body.trim()}>
                {busy ? 'Indexing...' : 'Add source'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {modal === 'url' ? (
        <div className="sb-modal-backdrop" onClick={() => setModal(null)}>
          <form className="sb-modal" onClick={e => e.stopPropagation()} onSubmit={submitUrl}>
            <div className="sb-modal-head">
              <span>Add web page or YouTube video</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">Web or YouTube URL</span>
                <input
                  className="sb-input"
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article or https://youtu.be/..."
                  required
                  autoFocus
                />
              </label>
              <label className="sb-field">
                <span className="sb-label">Optional custom title</span>
                <input
                  className="sb-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Leave blank to use page or video title"
                />
              </label>
            </div>
            <div className="sb-modal-foot">
              <button type="button" className="sb-btn" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="sb-btn sb-btn-primary" disabled={busy || !urlInput.trim()}>
                {busy ? 'Fetching...' : 'Ingest URL'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {modal === 'folder' ? (
        <div className="sb-modal-backdrop" onClick={() => setModal(null)}>
          <form className="sb-modal" onClick={e => e.stopPropagation()} onSubmit={submitFolder}>
            <div className="sb-modal-head">
              <span>Sync local file, folder, vault, or repo</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">Absolute path on disk</span>
                <input
                  className="sb-input"
                  value={folderPath}
                  onChange={e => setFolderPath(e.target.value)}
                  placeholder="/path/to/docs or Obsidian vault or repo folder"
                  required
                  autoFocus
                />
              </label>
              <div style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                Indexes up to 40 Markdown, code, PDF, DOCX, CSV, and JSON files (skipping .git and node_modules). Refresh any linked file later to flag stale notes and artifacts.
              </div>
            </div>
            <div className="sb-modal-foot">
              <button type="button" className="sb-btn" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="sb-btn sb-btn-primary" disabled={busy || !folderPath.trim()}>
                {busy ? 'Syncing...' : 'Sync path'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {modal === 'discover' ? (
        <div className="sb-modal-backdrop" onClick={() => { if (!deepRunning) setModal(null) }}>
          <div className="sb-modal" style={{ width: 'min(580px, 94vw)' }} onClick={e => e.stopPropagation()}>
            <div className="sb-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>Discover &amp; Deep Research</span>
                <div className="sb-seg">
                  <button
                    type="button"
                    className="sb-seg-btn"
                    data-active={discoverMode === 'quick'}
                    disabled={deepRunning}
                    onClick={() => setDiscoverMode('quick')}
                  >
                    Quick Search
                  </button>
                  <button
                    type="button"
                    className="sb-seg-btn"
                    data-active={discoverMode === 'deep'}
                    disabled={deepRunning}
                    onClick={() => setDiscoverMode('deep')}
                  >
                    <Icon name="Compass" size={11} /> Deep Research
                  </button>
                </div>
              </div>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" disabled={deepRunning} onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              {discoverMode === 'deep' ? (
                <form onSubmit={runDeepResearch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="sb-field">
                    <span className="sb-label">Research question or topic</span>
                    <input
                      className="sb-input"
                      value={discoverQuery}
                      onChange={e => setDiscoverQuery(e.target.value)}
                      placeholder="e.g. Local-first hybrid RAG retrieval benchmarks vs managed vector DBs"
                      disabled={deepRunning}
                      autoFocus
                    />
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="sb-label">Depth</span>
                      <div className="sb-seg">
                        {[
                          { id: 'quick', label: 'Quick (5)' },
                          { id: 'standard', label: 'Standard (10)' },
                          { id: 'deep', label: 'Deep (15)' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            className="sb-seg-btn"
                            data-active={deepDepth === opt.id}
                            disabled={deepRunning}
                            onClick={() => setDeepDepth(opt.id)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ui-text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        className="sb-checkbox"
                        checked={deepAutoBrief}
                        disabled={deepRunning}
                        onChange={e => setDeepAutoBrief(e.target.checked)}
                      />
                      Auto-synthesize cited Briefing
                    </label>
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)', lineHeight: 1.45 }}>
                    Hermes expands your topic into complementary sub-queries, discovers &amp; deduplicates primary web sources, ingests them into this notebook automatically, and builds a cited briefing.
                  </div>

                  {deepRunning ? (
                    <div className="sb-dr-progress">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <HermesSpinner size={12} /> {deepStage || 'Running Deep Research...'}
                        </span>
                        <span className="sb-mono" style={{ fontSize: 11 }}>{deepPct}%</span>
                      </div>
                      <div className="sb-dr-bar">
                        <div className="sb-dr-fill" style={{ width: `${Math.max(8, deepPct)}%` }} />
                      </div>
                    </div>
                  ) : null}

                  {deepResult ? (
                    <div className="sb-ledger-row" style={{ gap: 8, borderColor: 'var(--sb-accent-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: 12.5 }}>
                          Ingested {deepResult.ingested?.length || 0} source{(deepResult.ingested?.length || 0) === 1 ? '' : 's'} across {deepResult.queries?.length || 0} queries
                        </strong>
                        {deepResult.artifact?.id && onOpenArtifact ? (
                          <button
                            type="button"
                            className="sb-btn sb-btn-primary"
                            style={{ padding: '3px 9px', fontSize: 11 }}
                            onClick={() => {
                              setModal(null)
                              onOpenArtifact(deepResult.artifact.id)
                            }}
                          >
                            Open Briefing
                          </button>
                        ) : null}
                      </div>
                      {(deepResult.ingested || []).slice(0, 6).map(src => (
                        <div key={src.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, gap: 8 }}>
                          <span className="sb-src-title">{src.title}</span>
                          <span className="sb-mono" style={{ color: 'var(--ui-accent)', flexShrink: 0 }}>{src.domain}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button type="button" className="sb-btn" disabled={deepRunning} onClick={() => setModal(null)}>Close</button>
                    <button type="submit" className="sb-btn sb-btn-primary" disabled={deepRunning || !discoverQuery.trim()}>
                      {deepRunning ? <HermesSpinner size={12} /> : <Icon name="Compass" size={12} />}{' '}
                      {deepRunning ? 'Researching...' : 'Start Deep Research'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <form onSubmit={runDiscover} style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="sb-input"
                      value={discoverQuery}
                      onChange={e => setDiscoverQuery(e.target.value)}
                      placeholder="Describe a topic to search for primary sources..."
                      autoFocus
                    />
                    <button type="submit" className="sb-btn sb-btn-primary" disabled={busy || !discoverQuery.trim()}>
                      {busy ? 'Searching...' : 'Search'}
                    </button>
                  </form>
                  {discoverResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflow: 'auto' }}>
                      {discoverResults.map(item => (
                        <label
                          key={item.url}
                          className="sb-ledger-row"
                          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            className="sb-checkbox"
                            style={{ marginTop: 2 }}
                            checked={Boolean(discoverChecked[item.url])}
                            onChange={() => setDiscoverChecked(prev => ({ ...prev, [item.url]: !prev[item.url] }))}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="sb-src-title">{item.title}</div>
                            <div className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-accent)' }}>{item.domain}</div>
                            {item.snippet ? (
                              <div style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)', marginTop: 2 }}>{item.snippet}</div>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
            {discoverMode === 'quick' ? (
              <div className="sb-modal-foot">
                <button type="button" className="sb-btn" onClick={() => setModal(null)}>Close</button>
                {discoverResults.length > 0 ? (
                  <button
                    type="button"
                    className="sb-btn sb-btn-primary"
                    disabled={busy || !discoverResults.some(r => discoverChecked[r.url])}
                    onClick={importDiscovered}
                  >
                    {busy ? 'Importing...' : `Import selected (${discoverResults.filter(r => discoverChecked[r.url]).length})`}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {modal === 'note' || (modal && typeof modal === 'object') ? (
        <div className="sb-modal-backdrop" onClick={() => setModal(null)}>
          <form className="sb-modal" onClick={e => e.stopPropagation()} onSubmit={submitNote}>
            <div className="sb-modal-head">
              <span>{typeof modal === 'object' ? 'Edit note' : 'New research note'}</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">Title</span>
                <input
                  className="sb-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Working hypothesis, synthesis..."
                  autoFocus
                />
              </label>
              <label className="sb-field">
                <span className="sb-label">Markdown</span>
                <textarea
                  className="sb-input"
                  style={{ height: 220, padding: '8px 10px', resize: 'vertical' }}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your note..."
                />
              </label>
            </div>
            <div className="sb-modal-foot">
              <button type="button" className="sb-btn" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="sb-btn sb-btn-primary" disabled={busy}>
                {busy ? 'Saving...' : 'Save note'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </aside>
  )
}
