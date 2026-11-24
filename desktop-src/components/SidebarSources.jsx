import { useRef, useState } from 'react'
import { Icon, sdk } from '../sdk.js'
import { api, uploadFile } from '../api.js'

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
  note: 'StickyNote'
}

function fmtWords(n) {
  const v = Number(n) || 0
  if (typeof sdk.compactNumber === 'function') return sdk.compactNumber(v)
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}

export function SidebarSources({
  nbId,
  sources,
  notes,
  coverage,
  selectedSourceId,
  onSelectSource,
  onRefresh,
  onError
}) {
  const [tab, setTab] = useState('sources')
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [modal, setModal] = useState(null) // 'paste' | 'url' | 'note' | { editNote }
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const fileRef = useRef(null)

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

  async function submitNote(e) {
    e.preventDefault()
    if (!title.trim() && !body.trim()) return
    setBusy(true)
    try {
      if (modal && typeof modal === 'object' && modal.id) {
        await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(modal.id)}`, {
          method: 'PATCH',
          body: { title: title.trim() || 'Untitled note', markdown: body }
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
              accept=".txt,.md,.markdown,.pdf,.docx,.csv,.tsv,.json,.html,.htm,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="sb-dropzone-actions">
              <button
                type="button"
                className="sb-btn"
                disabled={!nbId || busy}
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="Upload" size={13} /> File
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
                <Icon name="Link" size={13} /> URL
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
                <Icon name="FilePlus" size={13} /> Paste
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)', textAlign: 'center' }}>
              {busy ? 'Indexing source...' : 'Drop PDF, DOCX, Markdown, CSV, or text'}
            </div>
          </div>

          <div className="sb-src-list sb-scroll">
            {sources.length === 0 ? (
              <div className="sb-empty">
                <Icon name="BookOpen" size={22} />
                <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No sources yet</div>
                <div style={{ fontSize: 11.5 }}>
                  Add documents, URLs, or pasted notes to start cited research.
                </div>
              </div>
            ) : (
              sources.map(src => {
                const cov = covBySource[src.id]
                const pct = cov && cov.total_chunks > 0 ? Math.round((cov.touched_chunks / cov.total_chunks) * 100) : 0
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
                Capture findings or save any cited chat reply as a reusable note.
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
                style={{ cursor: 'pointer' }}
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
                  <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon"
                      title="Promote note to active source"
                      onClick={() => promoteNote(note)}
                    >
                      <Icon name="ArrowUpRight" size={13} />
                    </button>
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
              <span>Add web page or article</span>
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setModal(null)}>
                <Icon name="X" size={14} />
              </button>
            </div>
            <div className="sb-modal-body">
              <label className="sb-field">
                <span className="sb-label">URL</span>
                <input
                  className="sb-input"
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
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
                  placeholder="Leave blank to use page title"
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
