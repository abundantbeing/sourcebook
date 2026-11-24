import { useEffect, useRef, useState } from 'react'
import { Icon } from '../sdk.js'
import { api, pollJob } from '../api.js'
import { StudyGuideView } from './renderers/StudyGuideView.jsx'
import { FlashcardsView } from './renderers/FlashcardsView.jsx'
import { QuizView } from './renderers/QuizView.jsx'
import { MindMapView } from './renderers/MindMapView.jsx'
import { InfographicView } from './renderers/InfographicView.jsx'
import { DataTableView } from './renderers/DataTableView.jsx'
import { SlideDeckView } from './renderers/SlideDeckView.jsx'

const STUDIO_FORMATS = [
  { kind: 'report', label: 'Study Guide', icon: 'FileText' },
  { kind: 'mindmap', label: 'Mind Map', icon: 'GitBranch' },
  { kind: 'flashcards', label: 'Flashcards', icon: 'Layers' },
  { kind: 'quiz', label: 'Quiz', icon: 'CheckSquare' },
  { kind: 'infographic', label: 'Infographic', icon: 'LayoutGrid' },
  { kind: 'table', label: 'Data Table', icon: 'Table' },
  { kind: 'slides', label: 'Slide Deck', icon: 'Presentation', wide: true }
]

const KIND_META = Object.fromEntries(STUDIO_FORMATS.map(f => [f.kind, f]))

export function StudioPanel({
  ctx,
  nbId,
  hasActiveSources,
  artifacts,
  selectedArtifactId,
  expanded,
  onToggleExpand,
  onSelectArtifact,
  onOpenChunk,
  onRefresh,
  onError
}) {
  const [activeArt, setActiveArt] = useState(null)
  const [loadingArt, setLoadingArt] = useState(false)
  const [runningKind, setRunningKind] = useState('')
  const [stage, setStage] = useState('')
  const [focusPrompt, setFocusPrompt] = useState('')
  const cancelPollRef = useRef(null)

  useEffect(() => {
    return () => cancelPollRef.current?.()
  }, [])

  useEffect(() => {
    if (!nbId || !selectedArtifactId) {
      setActiveArt(null)
      return
    }
    let alive = true
    setLoadingArt(true)
    api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(selectedArtifactId)}`)
      .then(res => {
        if (alive) setActiveArt(res)
      })
      .catch(err => {
        if (alive) onError?.(err.message || 'Could not load artifact.')
      })
      .finally(() => {
        if (alive) setLoadingArt(false)
      })
    return () => {
      alive = false
    }
  }, [nbId, selectedArtifactId])

  async function runGenerator(kind) {
    if (!nbId || !hasActiveSources || runningKind) return
    setRunningKind(kind)
    setStage(`Generating ${KIND_META[kind]?.label || kind}...`)
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/studio`, {
        method: 'POST',
        body: {
          kind,
          params: focusPrompt.trim() ? { focus: focusPrompt.trim() } : {}
        }
      })
      cancelPollRef.current?.()
      cancelPollRef.current = pollJob(
        ctx,
        job,
        j => setStage(j.stage || 'Working...'),
        async result => {
          setRunningKind('')
          setStage('')
          await onRefresh()
          if (result?.id) {
            onSelectArtifact?.(result.id)
          }
        },
        err => {
          setRunningKind('')
          setStage('')
          onError?.(err.message || `Could not generate ${kind}.`)
        }
      )
    } catch (err) {
      setRunningKind('')
      setStage('')
      onError?.(err.message || `Could not start ${kind}.`)
    }
  }

  async function deleteArtifact(e, aid) {
    e.stopPropagation()
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(aid)}`, { method: 'DELETE' })
      if (selectedArtifactId === aid) {
        onSelectArtifact?.(null)
        setActiveArt(null)
      }
      await onRefresh()
    } catch (err) {
      onError?.(err.message || 'Could not delete artifact.')
    }
  }

  function renderViewer() {
    if (loadingArt) return <div className="sb-empty">Loading artifact...</div>
    if (!activeArt) return null
    switch (activeArt.kind) {
      case 'report':
        return <StudyGuideView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'flashcards':
        return <FlashcardsView nbId={nbId} artifact={activeArt} onOpenChunk={onOpenChunk} onArtifactUpdated={setActiveArt} />
      case 'quiz':
        return <QuizView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'mindmap':
        return <MindMapView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'infographic':
        return <InfographicView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'table':
        return <DataTableView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'slides':
        return <SlideDeckView artifact={activeArt} onOpenChunk={onOpenChunk} />
      default:
        return <pre className="sb-mono" style={{ fontSize: 11 }}>{JSON.stringify(activeArt.spec, null, 2)}</pre>
    }
  }

  return (
    <aside className="sb-pane sb-pane-right" aria-label="Studio">
      {selectedArtifactId && activeArt ? (
        <div className="sb-viewer">
          <div className="sb-viewer-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <button
                type="button"
                className="sb-btn sb-btn-ghost sb-btn-icon"
                title="Back to Studio"
                onClick={() => {
                  onSelectArtifact?.(null)
                  if (expanded) onToggleExpand?.()
                }}
              >
                <Icon name="ArrowLeft" size={14} />
              </button>
              <div style={{ minWidth: 0 }}>
                <div className="sb-src-title" title={activeArt.title}>{activeArt.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                  {KIND_META[activeArt.kind]?.label || activeArt.kind}
                  {activeArt.grounding?.mode === 'extractive' ? ' | Local extractive' : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="sb-btn sb-btn-icon"
                title={expanded ? 'Dock Studio rail' : 'Expand Studio canvas'}
                onClick={onToggleExpand}
              >
                <Icon name={expanded ? 'Minimize2' : 'Maximize2'} size={13} />
              </button>
            </div>
          </div>
          <div className="sb-viewer-body sb-scroll">{renderViewer()}</div>
        </div>
      ) : (
        <>
          <div className="sb-pane-head">
            <span className="sb-pane-title">Studio</span>
            <span className="sb-num" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
              {artifacts.length} saved
            </span>
          </div>

          <div style={{ padding: '10px 12px 0' }}>
            <input
              className="sb-input"
              value={focusPrompt}
              onChange={e => setFocusPrompt(e.target.value)}
              placeholder="Optional focus topic for next artifact..."
              aria-label="Studio focus topic"
            />
          </div>

          <div className="sb-studio-grid">
            {STUDIO_FORMATS.map(fmt => (
              <button
                key={fmt.kind}
                type="button"
                className={`sb-studio-tile${fmt.wide ? ' sb-studio-tile-wide' : ''}`}
                disabled={!hasActiveSources || Boolean(runningKind)}
                onClick={() => runGenerator(fmt.kind)}
              >
                <Icon name={fmt.icon} size={14} style={{ color: 'var(--ui-accent)', flexShrink: 0 }} />
                <span>{runningKind === fmt.kind ? 'Generating...' : fmt.label}</span>
              </button>
            ))}
          </div>

          {runningKind ? (
            <div style={{ padding: '0 12px 8px', fontSize: 11.5, color: 'var(--ui-text-secondary)' }}>
              {stage}
            </div>
          ) : null}

          <div className="sb-pane-head" style={{ borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
            <span className="sb-pane-title">Artifacts</span>
          </div>

          <div className="sb-art-list sb-scroll">
            {artifacts.length === 0 ? (
              <div className="sb-empty">
                <Icon name="Layers" size={22} />
                <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No artifacts yet</div>
                <div style={{ fontSize: 11.5 }}>
                  Pick any format above to turn your active sources into an interactive artifact.
                </div>
              </div>
            ) : (
              artifacts.map(art => {
                const meta = KIND_META[art.kind] || { label: art.kind, icon: 'FileText' }
                return (
                  <div
                    key={art.id}
                    className="sb-art-item"
                    data-active={selectedArtifactId === art.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectArtifact?.(art.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectArtifact?.(art.id)
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <Icon name={meta.icon} size={14} style={{ color: 'var(--ui-accent)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div className="sb-src-title" title={art.title}>{art.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>{meta.label}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger"
                      title="Delete artifact"
                      onClick={e => deleteArtifact(e, art.id)}
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </aside>
  )
}
