import { useMemo, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { bakeSvgVariables, copyText, downloadTextFile } from '../../api.js'

function layoutTree(root, collapsed) {
  const nodes = []
  const edges = []
  let leafY = 0
  const xStep = 192
  const yStep = 58

  function walk(node, depth, parentId) {
    const id = node.id || `${depth}-${nodes.length}`
    const kids = !collapsed[id] && Array.isArray(node.children) ? node.children : []
    const item = {
      id,
      label: String(node.label || 'Node'),
      summary: String(node.summary || ''),
      cites: node.cites || [],
      depth,
      hasChildren: Array.isArray(node.children) && node.children.length > 0,
      collapsed: Boolean(collapsed[id]),
      x: 40 + depth * xStep,
      y: 0
    }
    if (!kids.length) {
      item.y = 44 + leafY * yStep
      leafY += 1
      nodes.push(item)
    } else {
      const childPositions = kids.map(k => walk(k, depth + 1, id))
      item.y = (childPositions[0].y + childPositions[childPositions.length - 1].y) / 2
      nodes.push(item)
    }
    if (parentId) {
      edges.push({ from: parentId, to: id })
    }
    return item
  }

  if (root) walk(root, 0, null)
  const byId = new Map(nodes.map(n => [n.id, n]))
  const maxX = Math.max(540, ...nodes.map(n => n.x + 170))
  const maxY = Math.max(320, ...nodes.map(n => n.y + 48))
  return { nodes, edges, byId, width: maxX, height: maxY }
}

export function MindMapView({ artifact, onOpenChunk }) {
  const root = artifact?.spec?.root
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [selected, setSelected] = useState(null)
  const svgRef = useRef(null)

  const graph = useMemo(() => layoutTree(root, collapsed), [root, collapsed])
  const titleId = `fl-mm-title-${artifact?.id || 'map'}`
  const descId = `fl-mm-desc-${artifact?.id || 'map'}`

  if (!root) {
    return <div className="fl-empty">No mind map structure available.</div>
  }

  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    await copyText(svgText)
    sdk.host?.notify?.({ kind: 'success', title: 'Folio', message: 'Copied standalone SVG to clipboard.' })
  }

  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    downloadTextFile(`${artifact.id || 'mindmap'}.svg`, svgText, 'image/svg+xml;charset=utf-8')
  }

  const activeNode = selected ? graph.byId.get(selected) : graph.nodes.find(n => n.depth === 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="fl-btn fl-btn-icon" title="Zoom out" onClick={() => setZoom(z => Math.max(0.45, Number((z - 0.15).toFixed(2))))}>
            <Icon name="Minus" size={13} />
          </button>
          <button type="button" className="fl-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
            <span className="fl-mono">{Math.round(zoom * 100)}%</span>
          </button>
          <button type="button" className="fl-btn fl-btn-icon" title="Zoom in" onClick={() => setZoom(z => Math.min(2, Number((z + 0.15).toFixed(2))))}>
            <Icon name="Plus" size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" className="fl-btn" onClick={handleCopySvg}>
            <Icon name="Copy" size={12} /> Copy SVG
          </button>
          <button type="button" className="fl-btn" onClick={handleDownloadSvg}>
            <Icon name="Download" size={12} /> SVG
          </button>
        </div>
      </div>

      <div
        className="fl-svg-stage"
        style={{ height: 340, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
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
          style={{ display: 'block', background: 'var(--ui-bg-secondary)' }}
        >
          <title id={titleId}>{artifact?.spec?.title || 'Concept Mind Map'}</title>
          <desc id={descId}>Interactive hierarchical concept map with {graph.nodes.length} nodes grounded in notebook sources.</desc>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {graph.edges.map((ed, i) => {
              const a = graph.byId.get(ed.from)
              const b = graph.byId.get(ed.to)
              if (!a || !b) return null
              const sx = a.x + 150
              const sy = a.y
              const tx = b.x
              const ty = b.y
              const mx = (sx + tx) / 2
              return (
                <path
                  key={i}
                  d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
                  fill="none"
                  stroke="var(--ui-stroke-secondary)"
                  strokeWidth="1.5"
                />
              )
            })}
            {graph.nodes.map(n => {
              const isRoot = n.depth === 0
              const isSel = activeNode && activeNode.id === n.id
              const label = n.label.length > 22 ? `${n.label.slice(0, 21)}...` : n.label
              return (
                <g
                  key={n.id}
                  data-node={n.id}
                  transform={`translate(${n.x}, ${n.y - 18})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(n.id)}
                  onDoubleClick={() => {
                    if (n.hasChildren) setCollapsed(prev => ({ ...prev, [n.id]: !prev[n.id] }))
                  }}
                >
                  <rect
                    width="150"
                    height="36"
                    rx="8"
                    fill={isRoot || isSel ? 'var(--fl-accent-soft)' : 'var(--ui-bg-primary)'}
                    stroke={isRoot || isSel ? 'var(--ui-accent)' : 'var(--ui-stroke-secondary)'}
                    strokeWidth={isRoot || isSel ? '1.6' : '1'}
                  />
                  <text
                    x="12"
                    y="22"
                    fill="var(--ui-text-primary)"
                    fontSize="12"
                    fontWeight={isRoot ? '650' : '500'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {label}
                  </text>
                  {n.hasChildren ? (
                    <g
                      transform="translate(136, 18)"
                      onClick={e => {
                        e.stopPropagation()
                        setCollapsed(prev => ({ ...prev, [n.id]: !prev[n.id] }))
                      }}
                    >
                      <circle r="7" fill="var(--ui-bg-secondary)" stroke="var(--ui-stroke-secondary)" strokeWidth="1" />
                      <text textAnchor="middle" y="3.5" fill="var(--ui-text-secondary)" fontSize="10" fontWeight="700">
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
        <div className="fl-ledger-row">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 12.5 }}>{activeNode.label}</strong>
            <div style={{ display: 'flex', gap: 4 }}>
              {(activeNode.cites || []).map((cid, idx) => (
                <button key={cid} type="button" className="fl-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          {activeNode.summary ? (
            <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>{activeNode.summary}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
