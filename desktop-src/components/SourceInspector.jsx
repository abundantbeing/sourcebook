import { useEffect, useRef, useState } from 'react'
import { Icon } from '../sdk.js'
import { api, copyText } from '../api.js'
import { HermesSpinner } from './DitherSurface.jsx'

function fmtTime(sec) {
  const s = Math.max(0, Number(sec) || 0)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

function highlightMatch(text, term) {
  const q = String(term || '').trim()
  if (!q || q.length < 2) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = String(text || '').split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, idx) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={idx} className="sb-mark">{part}</mark>
      : part
  )
}

export function SourceInspector({ nbId, target, onClose, onPromoteQuote, onSaveMemory }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [pdfPage, setPdfPage] = useState(1)
  const [pdfPreview, setPdfPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const hitRef = useRef(null)

  const sourceId = target?.sourceId || (target?.chunkId ? String(target.chunkId).split(':')[0] : null)
  const focusChunkId = target?.chunkId || null
  const highlightText = target?.highlight || ''

  useEffect(() => {
    if (!nbId || !sourceId) return
    let alive = true
    setLoading(true)
    setError('')
    setAnalysis(null)
    setPdfPreview(null)
    setZoomOpen(false)
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/text`)
      .then(res => {
        if (!alive) return
        setData(res)
        const chunks = res?.chunks || []
        const hit = focusChunkId ? chunks.find(c => c.id === focusChunkId) : chunks[0]
        setPdfPage(Math.max(1, Number(hit?.page_start) || 1))
      })
      .catch(err => {
        if (alive) setError(err.message || 'Could not load source text.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [nbId, sourceId, focusChunkId])

  const srcMeta = data?.source || {}
  const chunks = data?.chunks || []
  const focusedChunk = focusChunkId ? chunks.find(c => c.id === focusChunkId) : chunks[0]

  // Fetch rendered PDF page preview (with cited passage highlighting!) when source is a PDF with PyMuPDF available
  useEffect(() => {
    if (!nbId || !sourceId || !srcMeta.has_pdf_preview) {
      setPdfPreview(null)
      return undefined
    }
    let alive = true
    setLoadingPreview(true)
    const querySeed =
      highlightText ||
      (focusedChunk && Number(focusedChunk.page_start || 1) === pdfPage
        ? String(focusedChunk.text || '').replace(/<!--\s*[pt]:\d+\s*-->\n?/g, '').slice(0, 260)
        : '')
    const qs = new URLSearchParams({ page: String(pdfPage), ...(querySeed ? { q: querySeed } : {}) })
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/page-preview?${qs.toString()}`)
      .then(res => {
        if (alive && res?.available && res?.b64) {
          setPdfPreview(res)
        } else if (alive) {
          setPdfPreview(null)
        }
      })
      .catch(() => {
        if (alive) setPdfPreview(null)
      })
      .finally(() => {
        if (alive) setLoadingPreview(false)
      })
    return () => {
      alive = false
    }
  }, [nbId, sourceId, srcMeta.has_pdf_preview, pdfPage, focusChunkId, highlightText])

  useEffect(() => {
    if (hitRef.current) {
      hitRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [data, focusChunkId])

  if (!target || !sourceId) return null

  const isTabular = srcMeta.kind === 'csv' || srcMeta.kind === 'json' || (data?.text || '').includes('\n| ---')
  const ytId = srcMeta.youtube_id || ''

  async function runAnalyze(metricCol) {
    if (!nbId || !sourceId || analyzing) return
    setAnalyzing(true)
    setError('')
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/analyze`, {
        method: 'POST',
        body: metricCol ? { metric_col: metricCol } : {}
      })
      setAnalysis(res)
    } catch (err) {
      setError(err.message || 'Could not profile tabular data.')
    } finally {
      setAnalyzing(false)
    }
  }

  const q = filter.trim().toLowerCase()
  const visible = q
    ? chunks.filter(c => (c.text || '').toLowerCase().includes(q) || (c.heading || '').toLowerCase().includes(q))
    : chunks
  const previewSrc = pdfPreview?.b64 ? `data:${pdfPreview.mime || 'image/png'};base64,${pdfPreview.b64}` : ''
  const totalPages = pdfPreview?.total_pages || srcMeta.pages || 1

  return (
    <section className="sb-inspector" aria-label="Passage Inspector">
      <div className="sb-pane-head">
        <div style={{ minWidth: 0 }}>
          <div className="sb-pane-title">Passage Inspector</div>
          <div className="sb-src-title" style={{ marginTop: 2 }} title={srcMeta.title || sourceId}>
            {srcMeta.title || sourceId}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {isTabular ? (
            <button
              type="button"
              className="sb-btn"
              data-active={Boolean(analysis)}
              disabled={analyzing}
              onClick={() => (analysis ? setAnalysis(null) : runAnalyze())}
              title="Run exact statistical profiling and bar chart on this tabular source"
            >
              <Icon name="BarChart3" size={12} /> {analyzing ? 'Profiling...' : analysis ? 'Hide stats' : 'Analyze data'}
            </button>
          ) : null}
          <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={onClose} aria-label="Close inspector">
            <Icon name="X" size={15} />
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--ui-stroke-tertiary)', display: 'flex', gap: 6 }}>
        <input
          className="sb-input"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter passages in this source..."
          aria-label="Filter passages"
        />
      </div>

      <div className="sb-scroll" style={{ flex: 1, padding: '10px 12px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? <div className="sb-empty">Loading passages...</div> : null}
        {error ? <div className="sb-error-bar" style={{ margin: 0 }}>{error}</div> : null}

        {/* Visual PDF Page Preview with Cited Passage Highlight Boxes */}
        {srcMeta.has_pdf_preview ? (
          <div className="sb-pdf-preview-card">
            <div className="sb-pdf-preview-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="FileText" size={12} style={{ color: 'var(--ui-accent)' }} />
                <strong style={{ color: 'var(--ui-text-primary)' }}>PDF Page Preview</strong>
                {pdfPreview?.highlighted ? (
                  <span className="sb-verdict" data-v="supported" style={{ fontSize: 10, padding: '1px 5px' }}>
                    Highlighted
                  </span>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <button
                  type="button"
                  className="sb-btn sb-btn-ghost sb-btn-icon"
                  disabled={pdfPage <= 1 || loadingPreview}
                  onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  <Icon name="ChevronLeft" size={12} />
                </button>
                <span className="sb-mono" style={{ fontSize: 11, color: 'var(--ui-text-secondary)', padding: '0 3px' }}>
                  {pdfPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="sb-btn sb-btn-ghost sb-btn-icon"
                  disabled={pdfPage >= totalPages || loadingPreview}
                  onClick={() => setPdfPage(p => Math.min(totalPages, p + 1))}
                  title="Next page"
                >
                  <Icon name="ChevronRight" size={12} />
                </button>
                {previewSrc ? (
                  <button
                    type="button"
                    className="sb-btn sb-btn-ghost sb-btn-icon"
                    onClick={() => setZoomOpen(true)}
                    title="Expand full page preview"
                  >
                    <Icon name="ZoomIn" size={12} />
                  </button>
                ) : null}
              </div>
            </div>
            <div
              className="sb-pdf-preview-stage"
              onClick={() => {
                if (previewSrc) setZoomOpen(true)
              }}
            >
              {loadingPreview && !previewSrc ? (
                <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                  <HermesSpinner size={12} /> Rendering page {pdfPage}...
                </div>
              ) : previewSrc ? (
                <img src={previewSrc} alt={`${srcMeta.title} page ${pdfPage}`} className="sb-pdf-preview-img" />
              ) : (
                <div style={{ padding: 14, fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>Page preview unavailable.</div>
              )}
            </div>
          </div>
        ) : null}

        {analysis ? (
          <div className="sb-ledger-row" style={{ gap: 10, borderColor: 'var(--sb-accent-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 12.5 }}>
                Data Profile ({analysis.row_count} rows, {analysis.column_count} cols)
              </strong>
              {(analysis.numeric_columns || []).length > 1 ? (
                <select
                  className="sb-select"
                  value={analysis.chart?.metric || ''}
                  onChange={e => runAnalyze(e.target.value)}
                  aria-label="Chart metric column"
                >
                  {analysis.numeric_columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : null}
            </div>

            {analysis.chart?.series?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>{analysis.chart.title}</div>
                {analysis.chart.series.slice(0, 10).map((pt, idx) => {
                  const pct = Math.max(4, Math.round((Math.abs(pt.value) / (analysis.chart.max_value || 1)) * 100))
                  return (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 56px', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                      <span className="sb-src-title" title={pt.label}>{pt.label}</span>
                      <div className="sb-src-bar" style={{ height: 8, marginTop: 0 }}>
                        <div className="sb-src-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="sb-mono" style={{ textAlign: 'right', color: 'var(--ui-text-secondary)' }}>{pt.value}</span>
                    </div>
                  )
                })}
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
              {(analysis.profiles || []).filter(p => p.type === 'number').slice(0, 4).map(p => (
                <div key={p.column} className="sb-kpi" style={{ padding: '7px 9px' }}>
                  <div className="sb-kpi-label">{p.column}</div>
                  <div className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-primary)', marginTop: 3 }}>
                    mean {p.mean} | med {p.median}
                  </div>
                  <div className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-text-tertiary)' }}>
                    min {p.min} | max {p.max}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && !error && visible.length === 0 ? (
          <div className="sb-empty">No matching passages.</div>
        ) : null}
        {visible.map(ch => {
          const isHit = focusChunkId && ch.id === focusChunkId
          const cleanText = String(ch.text || '').replace(/<!--\s*[pt]:\d+\s*-->\n?/g, '')
          const ytHref = ytId && typeof ch.timestamp_sec === 'number'
            ? `https://youtu.be/${encodeURIComponent(ytId)}?t=${ch.timestamp_sec}`
            : ''
          return (
            <article
              key={ch.id}
              ref={isHit ? hitRef : null}
              className="sb-chunk-card"
              data-hit={isHit ? 'true' : undefined}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-accent)', fontWeight: 600 }}>
                    {ch.id}
                  </span>
                  {ch.page_start > 1 || srcMeta.pages > 1 ? (
                    <button
                      type="button"
                      className="sb-kind-tag"
                      style={{ cursor: srcMeta.has_pdf_preview ? 'pointer' : 'default', border: '1px solid var(--ui-stroke-tertiary)' }}
                      onClick={() => {
                        if (srcMeta.has_pdf_preview) setPdfPage(Math.max(1, Number(ch.page_start) || 1))
                      }}
                      title={srcMeta.has_pdf_preview ? `Jump PDF preview to page ${ch.page_start}` : undefined}
                    >
                      p.{ch.page_start}
                    </button>
                  ) : null}
                  {ytHref ? (
                    <a href={ytHref} target="_blank" rel="noopener noreferrer" className="sb-kind-tag sb-link" title="Open video at timestamp">
                      {fmtTime(ch.timestamp_sec)}
                    </a>
                  ) : null}
                  {ch.heading ? (
                    <span className="sb-src-title" style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)' }}>
                      {ch.heading}
                    </span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <button
                    type="button"
                    className="sb-btn sb-btn-ghost sb-btn-icon"
                    title="Copy passage"
                    onClick={() => copyText(cleanText)}
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                  {onPromoteQuote ? (
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon"
                      title="Save passage as note"
                      onClick={() => onPromoteQuote(ch, srcMeta.title || sourceId)}
                    >
                      <Icon name="BookmarkPlus" size={12} />
                    </button>
                  ) : null}
                  {onSaveMemory ? (
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon"
                      title="Save verified excerpt to Hermes persistent memory"
                      onClick={() => onSaveMemory({ title: ch.heading || srcMeta.title || sourceId, content: cleanText.slice(0, 320), citations: [ch.id] })}
                    >
                      <Icon name="Brain" size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: 'var(--ui-text-primary)' }}>
                {highlightMatch(cleanText, filter.trim() || (isHit ? highlightText : ''))}
              </div>
            </article>
          )
        })}
      </div>

      {zoomOpen && previewSrc ? (
        <div className="sb-modal-backdrop" style={{ zIndex: 90, padding: 20 }} onClick={() => setZoomOpen(false)}>
          <div
            className="sb-modal"
            style={{ width: 'min(920px, 95vw)', maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sb-modal-head">
              <span>{srcMeta.title} · Page {pdfPage} / {totalPages}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" className="sb-btn" disabled={pdfPage <= 1} onClick={() => setPdfPage(p => Math.max(1, p - 1))}>Prev</button>
                <button type="button" className="sb-btn" disabled={pdfPage >= totalPages} onClick={() => setPdfPage(p => Math.min(totalPages, p + 1))}>Next</button>
                <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setZoomOpen(false)}>
                  <Icon name="X" size={14} />
                </button>
              </div>
            </div>
            <div className="sb-modal-body sb-scroll" style={{ maxHeight: '80vh', alignItems: 'center' }}>
              <img src={previewSrc} alt={`${srcMeta.title} page ${pdfPage}`} style={{ maxWidth: '100%', borderRadius: 8, background: '#fff' }} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
