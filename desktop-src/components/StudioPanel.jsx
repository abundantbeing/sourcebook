import { useEffect, useRef, useState } from 'react'
import { Icon } from '../sdk.js'
import { api, pollJob } from '../api.js'
import { HermesSpinner } from './DitherSurface.jsx'
import { StudyGuideView } from './renderers/StudyGuideView.jsx'
import { AudioOverviewView } from './renderers/AudioOverviewView.jsx'
import { FlashcardsView } from './renderers/FlashcardsView.jsx'
import { QuizView } from './renderers/QuizView.jsx'
import { MindMapView } from './renderers/MindMapView.jsx'
import { InfographicView } from './renderers/InfographicView.jsx'
import { DataTableView } from './renderers/DataTableView.jsx'
import { SlideDeckView } from './renderers/SlideDeckView.jsx'

const STUDIO_FORMATS = [
  { kind: 'report', label: 'Study Guide', icon: 'FileText' },
  { kind: 'audio', label: 'Audio Overview', icon: 'Headphones' },
  { kind: 'mindmap', label: 'Mind Map', icon: 'GitBranch' },
  { kind: 'flashcards', label: 'Flashcards', icon: 'Layers' },
  { kind: 'quiz', label: 'Quiz', icon: 'CheckSquare' },
  { kind: 'infographic', label: 'Infographic', icon: 'LayoutGrid' },
  { kind: 'table', label: 'Data Table', icon: 'Table' },
  { kind: 'slides', label: 'Slide Deck', icon: 'Presentation' }
]

const KIND_META = Object.fromEntries(STUDIO_FORMATS.map(f => [f.kind, f]))

export function StudioPanel({
  ctx,
  nbId,
  hasActiveSources,
  capabilities,
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
  const [showOpts, setShowOpts] = useState(false)
  const [template, setTemplate] = useState('briefing')
  const [audioStyle, setAudioStyle] = useState('deep_dive')
  const [count, setCount] = useState(8)
  const [language, setLanguage] = useState('English')
  const [includeImages, setIncludeImages] = useState(false)
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

  async function runGenerator(kind, overrideParams) {
    if (!nbId || !hasActiveSources || runningKind) return
    setRunningKind(kind)
    setStage(`Generating ${KIND_META[kind]?.label || kind}...`)
    const params = overrideParams || {
      ...(focusPrompt.trim() ? { focus: focusPrompt.trim() } : {}),
      template,
      style: audioStyle,
      count: Number(count) || 8,
      language,
      ...(includeImages && capabilities?.image_generate ? { include_images: true } : {})
    }
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/studio`, {
        method: 'POST',
        body: { kind, params }
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
      case 'audio':
        return (
          <AudioOverviewView
            nbId={nbId}
            artifact={activeArt}
            onOpenChunk={onOpenChunk}
            onArtifactUpdated={setActiveArt}
          />
        )
      case 'flashcards':
        return (
          <FlashcardsView
            nbId={nbId}
            artifact={activeArt}
            onOpenChunk={onOpenChunk}
            onArtifactUpdated={setActiveArt}
            onStateSaved={onRefresh}
          />
        )
      case 'quiz':
        return <QuizView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'mindmap':
        return <MindMapView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'infographic':
        return <InfographicView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'table':
        return <DataTableView artifact={activeArt} onOpenChunk={onOpenChunk} />
      case 'slides':
        return <SlideDeckView nbId={nbId} artifact={activeArt} onOpenChunk={onOpenChunk} />
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
                <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{KIND_META[activeArt.kind]?.label || activeArt.kind}</span>
                  {activeArt.grounding?.model ? <span>| {activeArt.grounding.model}</span> : null}
                  {!activeArt.grounding?.model && activeArt.grounding?.mode === 'extractive' ? <span>| Local extractive</span> : null}
                  {activeArt.stale ? <span className="sb-verdict" data-v="partial">Stale</span> : null}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {activeArt.stale ? (
                <button
                  type="button"
                  className="sb-btn"
                  disabled={Boolean(runningKind)}
                  onClick={() => runGenerator(activeArt.kind, activeArt.params || {})}
                  title="Underlying source changed: regenerate artifact from updated sources"
                >
                  <Icon name="RefreshCw" size={12} /> Refresh
                </button>
              ) : null}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="sb-btn sb-btn-ghost"
                data-active={showOpts}
                onClick={() => setShowOpts(v => !v)}
                title="Configure report template, audio style, item count, language, and AI illustrations"
              >
                <Icon name="SlidersHorizontal" size={12} /> Options
              </button>
              <span className="sb-num" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                {artifacts.length}
              </span>
            </div>
          </div>

          <div style={{ padding: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="sb-input"
              value={focusPrompt}
              onChange={e => setFocusPrompt(e.target.value)}
              placeholder="Optional focus topic for next artifact..."
              aria-label="Studio focus topic"
            />

            {showOpts ? (
              <div className="sb-ledger-row" style={{ gap: 7, padding: '8px 10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <label className="sb-field">
                    <span className="sb-label" style={{ fontSize: 10.5 }}>Report template</span>
                    <select className="sb-select" value={template} onChange={e => setTemplate(e.target.value)}>
                      <option value="briefing">Briefing</option>
                      <option value="study_guide">Study Guide</option>
                      <option value="faq">FAQ</option>
                      <option value="timeline">Timeline</option>
                      <option value="blog">Blog Post</option>
                      <option value="exec_memo">Exec Memo</option>
                    </select>
                  </label>
                  <label className="sb-field">
                    <span className="sb-label" style={{ fontSize: 10.5 }}>Audio style</span>
                    <select className="sb-select" value={audioStyle} onChange={e => setAudioStyle(e.target.value)}>
                      <option value="deep_dive">Deep Dive</option>
                      <option value="debate">Debate</option>
                      <option value="brief">Quick Brief</option>
                      <option value="critique">Critique</option>
                    </select>
                  </label>
                  <label className="sb-field">
                    <span className="sb-label" style={{ fontSize: 10.5 }}>Items / slides</span>
                    <select className="sb-select" value={count} onChange={e => setCount(Number(e.target.value))}>
                      <option value={5}>5</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                    </select>
                  </label>
                  <label className="sb-field">
                    <span className="sb-label" style={{ fontSize: 10.5 }}>Language</span>
                    <select className="sb-select" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </label>
                </div>
                {capabilities?.image_generate ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--ui-text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="sb-checkbox"
                      checked={includeImages}
                      onChange={e => setIncludeImages(e.target.checked)}
                    />
                    Generate AI illustrations for Slides &amp; Infographics
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="sb-studio-grid">
            {STUDIO_FORMATS.map(fmt => (
              <button
                key={fmt.kind}
                type="button"
                className="sb-studio-tile"
                disabled={!hasActiveSources || Boolean(runningKind)}
                onClick={() => runGenerator(fmt.kind)}
              >
                <Icon name={fmt.icon} size={14} style={{ color: 'var(--ui-accent)', flexShrink: 0 }} />
                <span>{runningKind === fmt.kind ? 'Generating...' : fmt.label}</span>
              </button>
            ))}
          </div>

          {runningKind ? (
            <div style={{ padding: '0 12px 8px', fontSize: 11.5, color: 'var(--ui-text-secondary)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <HermesSpinner size={12} />
              <span>{stage}</span>
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
                  Pick any format above to turn your active sources into an interactive artifact or Audio Overview.
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
                        <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{meta.label}</span>
                          {art.stale ? <span className="sb-verdict" data-v="partial">Stale</span> : null}
                        </div>
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
