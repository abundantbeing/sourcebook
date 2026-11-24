import { useRef } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { bakeSvgVariables, copyText, downloadTextFile } from '../../api.js'

function wrapText(text, maxChars, maxLines = 4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const w of words) {
    if (!cur) {
      cur = w
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += ' ' + w
    } else {
      lines.push(cur)
      cur = w
      if (lines.length >= maxLines - 1) break
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  return lines
}

export function InfographicView({ artifact, onOpenChunk }) {
  const spec = artifact?.spec || {}
  const blocks = spec.blocks || []
  const layout = spec.layout || 'stat-grid'
  const svgRef = useRef(null)

  if (!blocks.length) {
    return <div className="fl-empty">No infographic blocks available.</div>
  }

  const W = 720
  const isTimeline = layout === 'timeline' || layout === 'process'
  const cols = isTimeline ? 1 : 2
  const rows = Math.ceil(blocks.length / cols)
  const cardH = isTimeline ? 94 : 138
  const gap = 14
  const headerH = 82
  const H = headerH + rows * cardH + Math.max(0, rows - 1) * gap + 28
  const titleId = `fl-inf-title-${artifact?.id || 'info'}`
  const descId = `fl-inf-desc-${artifact?.id || 'info'}`

  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    await copyText(svgText)
    sdk.host?.notify?.({ kind: 'success', title: 'Folio', message: 'Copied standalone infographic SVG.' })
  }

  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    downloadTextFile(`${artifact.id || 'infographic'}.svg`, svgText, 'image/svg+xml;charset=utf-8')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span className="fl-kind-tag">{layout}</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" className="fl-btn" onClick={handleCopySvg}>
            <Icon name="Copy" size={12} /> Copy SVG
          </button>
          <button type="button" className="fl-btn" onClick={handleDownloadSvg}>
            <Icon name="Download" size={12} /> SVG
          </button>
        </div>
      </div>

      <div className="fl-svg-stage">
        <svg
          ref={svgRef}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', background: 'var(--ui-bg-secondary)' }}
        >
          <title id={titleId}>{spec.title || 'Infographic'}</title>
          <desc id={descId}>{spec.subtitle || `Structured ${layout} infographic with ${blocks.length} cited items.`}</desc>

          <rect x="0" y="0" width={W} height={H} fill="var(--ui-bg-secondary)" />
          <text x="24" y="38" fill="var(--ui-text-primary)" fontSize="20" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
            {String(spec.title || 'Infographic').slice(0, 62)}
          </text>
          {spec.subtitle ? (
            <text x="24" y="59" fill="var(--ui-text-secondary)" fontSize="12.5" fontFamily="system-ui, -apple-system, sans-serif">
              {String(spec.subtitle).slice(0, 96)}
            </text>
          ) : null}
          <line x1="24" y1="72" x2={W - 24} y2="72" stroke="var(--ui-stroke-tertiary)" strokeWidth="1" />

          {isTimeline ? (
            <line x1="48" y1={headerH + 22} x2="48" y2={H - 36} stroke="var(--ui-stroke-secondary)" strokeWidth="2" />
          ) : null}

          {blocks.map((blk, idx) => {
            const col = idx % cols
            const row = Math.floor(idx / cols)
            const cardW = isTimeline ? W - 96 : (W - 48 - gap) / 2
            const x = isTimeline ? 72 : 24 + col * (cardW + gap)
            const y = headerH + row * (cardH + gap)
            const bodyLines = wrapText(blk.body, isTimeline ? 76 : 42, 4)
            return (
              <g key={blk.id || idx}>
                {isTimeline ? (
                  <>
                    <circle cx="48" cy={y + 28} r="13" fill="var(--fl-accent-soft)" stroke="var(--ui-accent)" strokeWidth="1.5" />
                    <text x="48" y={y + 32} textAnchor="middle" fill="var(--ui-accent)" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">
                      {idx + 1}
                    </text>
                  </>
                ) : null}
                <rect
                  x={x}
                  y={y}
                  width={cardW}
                  height={cardH}
                  rx="10"
                  fill="var(--ui-bg-primary)"
                  stroke="var(--ui-stroke-secondary)"
                  strokeWidth="1"
                />
                {blk.value ? (
                  <text
                    x={x + 14}
                    y={y + 30}
                    fill="var(--ui-accent)"
                    fontSize={isTimeline ? '15' : '22'}
                    fontWeight="750"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {String(blk.value).slice(0, 22)}
                  </text>
                ) : null}
                <text
                  x={x + 14}
                  y={y + (blk.value ? 50 : 28)}
                  fill="var(--ui-text-primary)"
                  fontSize="13"
                  fontWeight="650"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {String(blk.heading || `Item ${idx + 1}`).slice(0, isTimeline ? 64 : 36)}
                </text>
                <text
                  x={x + 14}
                  y={y + (blk.value ? 69 : 48)}
                  fill="var(--ui-text-secondary)"
                  fontSize="11.5"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {bodyLines.map((ln, lIdx) => (
                    <tspan key={lIdx} x={x + 14} dy={lIdx === 0 ? 0 : 15}>
                      {ln}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>Cited passages:</span>
        {Array.from(new Set(blocks.flatMap(b => b.cites || []))).map((cid, idx) => (
          <button key={cid} type="button" className="fl-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
