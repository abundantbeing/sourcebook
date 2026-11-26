import { useMemo, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { bakeSvgVariables, copyText, downloadSvgAsPng, downloadTextFile } from '../../api.js'

const BRANCH_COLORS = ['#3b82f6', '#10b981', '#38bdf8', '#f59e0b', '#f43f5e', '#8b5cf6']

function clipNode(label, maxChars = 25) {
  const s = String(label || '').trim()
  if (s.length <= maxChars) return s
  return `${s.slice(0, maxChars - 1).trimEnd().replace(/[.,;:\-]+$/, '')}...`
}

function layoutTree(root, collapsed) {
  const nodes = []
  const edges = []
  let leafY = 0
  const xStep = 232
  const yStep = 56

  function walk(node, depth, parentId, branchIdx) {
    const id = node.id || `${depth}-${nodes.length}`
    const kids = !collapsed[id] && Array.isArray(node.children) ? node.children : []
    const item = {
      id,
      label: String(node.label || 'Node'),
      summary: String(node.summary || ''),
      cites: node.cites || [],
      depth,
      branchIdx,
      color: depth === 0 ? 'var(--ui-accent)' : BRANCH_COLORS[branchIdx % BRANCH_COLORS.length],
      hasChildren: Array.isArray(node.children) && node.children.length > 0,
      collapsed: Boolean(collapsed[id]),
      x: 34 + depth * xStep,
      y: 0
    }
    if (!kids.length) {
      item.y = 48 + leafY * yStep
      leafY += 1
      nodes.push(item)
    } else {
      const childPositions = kids.map((k, kIdx) => walk(k, depth + 1, id, depth === 0 ? kIdx : branchIdx))
      item.y = (childPositions[0].y + childPositions[childPositions.length - 1].y) / 2
      nodes.push(item)
    }
    if (parentId) {
      edges.push({ from: parentId, to: id, color: item.color })
    }
    return item
  }

  if (root) walk(root, 0, null, 0)
  const byId = new Map(nodes.map(n => [n.id, n]))
  const maxX = Math.max(720, ...nodes.map(n => n.x + 226))
  const maxY = Math.max(380, ...nodes.map(n => n.y + 54))
  return { nodes, edges, byId, width: maxX, height: maxY }
}

export function MindMapView({ artifact, onOpenChunk }) {
  const root = artifact?.spec?.root
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [selected, setSelected] = useState(null)
  const [exportingPng, setExportingPng] = useState(false)
  const svgRef = useRef(null)

  const graph = useMemo(() => layoutTree(root, collapsed), [root, collapsed])
  const uid = String(artifact?.id || 'map').replace(/[^a-zA-Z0-9_-]/g, '')
  const titleId = `sb-mm-title-${uid}`
  const descId = `sb-mm-desc-${uid}`

  if (!root) {
    return <div className="sb-empty">No mind map structure available.</div>
  }

  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    await copyText(svgText)
    sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied standalone SVG to clipboard.' })
  }

  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    downloadTextFile(`${artifact.id || 'mindmap'}.svg`, svgText, 'image/svg+xml;charset=utf-8')
  }

  async function handleDownloadPng() {
    if (exportingPng) return
    setExportingPng(true)
    try {
      await downloadSvgAsPng(svgRef.current, `${artifact.id || 'mindmap'}.png`, 2)
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Downloaded 2x PNG mind map.' })
    } catch {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: 'Could not render PNG export.' })
    } finally {
      setExportingPng(false)
    }
  }

  function handleDownloadOpml() {
    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const walk = node => {
      const kids = (node.children || []).map(walk).join('')
      return kids
        ? `<outline text="${esc(node.label)}" _note="${esc(node.summary)}">${kids}</outline>`
        : `<outline text="${esc(node.label)}" _note="${esc(node.summary)}" />`
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0"><head><title>${esc(artifact?.spec?.title || 'Mind Map')}</title></head><body>${walk(root)}</body></opml>`
    downloadTextFile(`${artifact.id || 'mindmap'}.opml`, xml, 'text/xml;charset=utf-8')
  }

  const activeNode = selected ? graph.byId.get(selected) : graph.nodes.find(n => n.depth === 0)
  const hasCollapsed = Object.values(collapsed).some(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="sb-inf-toolbar">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button type="button" className="sb-btn sb-btn-icon" title="Zoom out" onClick={() => setZoom(z => Math.max(0.45, Number((z - 0.15).toFixed(2))))}>
            <Icon name="Minus" size={13} />
          </button>
          <button type="button" className="sb-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
            <span className="sb-mono">{Math.round(zoom * 100)}%</span>
          </button>
          <button type="button" className="sb-btn sb-btn-icon" title="Zoom in" onClick={() => setZoom(z => Math.min(2, Number((z + 0.15).toFixed(2))))}>
            <Icon name="Plus" size={13} />
          </button>
          {hasCollapsed ? (
            <button type="button" className="sb-btn" onClick={() => setCollapsed({})}>
              Expand all
            </button>
          ) : null}
          <span className="sb-mono" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)', marginLeft: 4 }}>
            {graph.nodes.length} nodes
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button type="button" className="sb-btn" onClick={handleCopySvg}>
            <Icon name="Copy" size={12} /> Copy SVG
          </button>
          <button type="button" className="sb-btn" onClick={handleDownloadSvg}>
            <Icon name="Download" size={12} /> SVG
          </button>
          <button type="button" className="sb-btn" onClick={handleDownloadOpml} title="Export outline for XMind, MindNode, or FreeMind">
            <Icon name="Download" size={12} /> OPML
          </button>
          <button type="button" className="sb-btn sb-btn-primary" disabled={exportingPng} onClick={handleDownloadPng}>
            <Icon name="ImageDown" size={12} /> {exportingPng ? 'Exporting...' : 'PNG'}
          </button>
        </div>
      </div>

      <div
        className="sb-svg-stage"
        style={{ height: 'clamp(240px, 46vh, 480px)', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onPointerDown={e => {
          if (e.target.closest('g[data-node]')) return
          setDragging({ sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y })
        }}
        onPointerMove={e => {
          if (!dragging) return
          setPan({ x: dragging.ox + (e.clientX - dragging.sx), y: dragging.oy + (e.clientY - dragging.sy) })
        }}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
      >
        <svg
          ref={svgRef}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          width="100%"
          height="100%"
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          style={{ display: 'block', background: 'var(--sb-bg)' }}
        >
          <title id={titleId}>{artifact?.spec?.title || 'Concept Mind Map'}</title>
          <desc id={descId}>Interactive hierarchical concept map with {graph.nodes.length} nodes grounded in notebook sources.</desc>
          <defs>
            <pattern id={`sb-mm-dots-${uid}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.9" fill="var(--ui-stroke-tertiary)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={graph.width} height={graph.height} fill="var(--sb-bg)" />
          <rect x="0" y="0" width={graph.width} height={graph.height} fill={`url(#sb-mm-dots-${uid})`} opacity="0.65" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {graph.edges.map((ed, i) => {
              const a = graph.byId.get(ed.from)
              const b = graph.byId.get(ed.to)
              if (!a || !b) return null
              const sx = a.x + 194
              const sy = a.y
              const tx = b.x
              const ty = b.y
              const mx = (sx + tx) / 2
              return (
                <path
                  key={i}
                  d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
                  fill="none"
                  stroke={ed.color}
                  strokeOpacity="0.58"
                  strokeWidth={a.depth === 0 ? '2' : '1.5'}
                />
              )
            })}
            {graph.nodes.map(n => {
              const isRoot = n.depth === 0
              const isSel = activeNode && activeNode.id === n.id
              const label = clipNode(n.label, 24)
              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  transform={`translate(${n.x}, ${n.y - 19})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(n.id)}
                  onDoubleClick={() => {
                    if (n.hasChildren) setCollapsed(prev => ({ ...prev, [n.id]: !prev[n.id] }))
                  }}
                >
                  <rect
                    width="194"
                    height="38"
                    rx="9"
                    fill={isRoot ? 'var(--sb-accent-soft)' : isSel ? n.color : 'var(--sb-surface)'}
                    fillOpacity={isRoot ? '1' : isSel ? '0.16' : '1'}
                    stroke={isRoot || isSel ? n.color : 'var(--ui-stroke-secondary)'}
                    strokeWidth={isRoot || isSel ? '1.8' : '1'}
                  />
                  {!isRoot ? (
                    <rect x="0" y="7" width="3" height="24" rx="1.5" fill={n.color} />
                  ) : null}
                  <text
                    x="13"
                    y="23"
                    fill="var(--ui-text-primary)"
                    fontSize="12"
                    fontWeight={isRoot || n.depth === 1 ? '650' : '500'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {label}
                  </text>
                  {n.hasChildren ? (
                    <g
                      transform="translate(194, 19)"
                      onClick={e => {
                        e.stopPropagation()
                        setCollapsed(prev => ({ ...prev, [n.id]: !prev[n.id] }))
                      }}
                    >
                      <circle r="8.5" fill="var(--sb-surface)" stroke={n.color} strokeWidth="1.4" />
                      <text textAnchor="middle" y="3.5" fill={n.color} fontSize="11" fontWeight="700">
                        {n.collapsed ? '+' : '-'}
                      </text>
                    </g>
                  ) : null}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {activeNode ? (
        <div className="sb-ledger-row" style={{ borderLeft: `3px solid ${activeNode.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 13 }}>{activeNode.label}</strong>
            <div style={{ display: 'flex', gap: 4 }}>
              {(activeNode.cites || []).map((cid, idx) => (
                <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          {activeNode.summary ? (
            <div style={{ fontSize: 12.5, color: 'var(--ui-text-secondary)', lineHeight: 1.55 }}>{activeNode.summary}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
