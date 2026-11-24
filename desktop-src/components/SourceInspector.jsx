import { useEffect, useRef, useState } from 'react'
import { Icon } from '../sdk.js'
import { api, copyText } from '../api.js'

export function SourceInspector({ nbId, target, onClose, onPromoteQuote }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const hitRef = useRef(null)

  const sourceId = target?.sourceId || (target?.chunkId ? String(target.chunkId).split(':')[0] : null)
  const focusChunkId = target?.chunkId || null

  useEffect(() => {
    if (!nbId || !sourceId) return
    let alive = true
    setLoading(true)
    setError('')
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/text`)
      .then(res => {
        if (alive) setData(res)
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
  }, [nbId, sourceId])

  useEffect(() => {
    if (hitRef.current) {
      hitRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [data, focusChunkId])

  if (!target || !sourceId) return null

  const chunks = data?.chunks || []
  const q = filter.trim().toLowerCase()
  const visible = q
    ? chunks.filter(c => (c.text || '').toLowerCase().includes(q) || (c.heading || '').toLowerCase().includes(q))
    : chunks

  return (
    <section className="sb-inspector" aria-label="Passage Inspector">
      <div className="sb-pane-head">
        <div style={{ minWidth: 0 }}>
          <div className="sb-pane-title">Passage Inspector</div>
          <div className="sb-src-title" style={{ marginTop: 2 }} title={data?.source?.title || sourceId}>
            {data?.source?.title || sourceId}
          </div>
        </div>
        <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={onClose} aria-label="Close inspector">
          <Icon name="X" size={15} />
        </button>
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
        {!loading && !error && visible.length === 0 ? (
          <div className="sb-empty">No matching passages.</div>
        ) : null}
        {visible.map(ch => {
          const isHit = focusChunkId && ch.id === focusChunkId
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
                    onClick={() => copyText(ch.text)}
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                  {onPromoteQuote ? (
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost sb-btn-icon"
                      title="Save passage as note"
                      onClick={() => onPromoteQuote(ch, data?.source?.title || sourceId)}
                    >
                      <Icon name="BookmarkPlus" size={12} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: 'var(--ui-text-primary)' }}>
                {ch.text}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
