import { useMemo, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { bakeSvgVariables, copyText, downloadSvgAsPng, downloadTextFile } from '../../api.js'

const LAYOUT_OPTIONS = [
  { id: 'stat-grid', label: 'Bento' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'comparison', label: 'Compare' },
  { id: 'hub-spoke', label: 'Hub' },
  { id: 'pyramid', label: 'Pyramid' }
]

const PALETTES = {
  adaptive: {
    label: 'Adaptive',
    accents: ['var(--ui-accent)', '#10b981', '#38bdf8', '#f59e0b', '#f43f5e', '#8b5cf6']
  },
  editorial: {
    label: 'Editorial',
    accents: ['#3b82f6', '#0d9488', '#d97706', '#e11d48', '#6366f1', '#0891b2']
  },
  emerald: {
    label: 'Emerald',
    accents: ['#10b981', '#06b6d4', '#84cc16', '#f59e0b', '#14b8a6', '#22c55e']
  },
  warm: {
    label: 'Warm',
    accents: ['#f97316', '#eab308', '#e11d48', '#10b981', '#f59e0b', '#ec4899']
  }
}

function clipLabel(text, maxChars) {
  const s = String(text || '').trim()
  if (s.length <= maxChars) return s
  const cut = s.slice(0, maxChars - 1).trimEnd()
  return `${cut.replace(/[.,;:\-]+$/, '')}...`
}

function wrapText(text, maxChars, maxLines = 4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  let consumed = 0
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i]
    if (!cur) {
      cur = w
      consumed = i + 1
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += ' ' + w
      consumed = i + 1
    } else {
      lines.push(cur)
      cur = w
      consumed = i + 1
      if (lines.length >= maxLines - 1) {
        for (let j = i + 1; j < words.length; j += 1) {
          if (cur.length + 1 + words[j].length <= maxChars - 3) {
            cur += ' ' + words[j]
            consumed = j + 1
          } else {
            break
          }
        }
        break
      }
    }
  }
  if (cur && lines.length < maxLines) {
    lines.push(consumed < words.length ? `${cur.replace(/[.,;:\-]+$/, '')}...` : cur)
  }
  return lines
}

function parseMetric(rawValue, idx, total) {
  const raw = String(rawValue ?? '').trim()
  if (!raw) return null
  // Ignore auto-generated sequential index fallbacks like "01", "06"
  if (/^0\d$/.test(raw) && Number(raw) === idx + 1 && total >= 2) {
    return null
  }
  const m = raw.match(/^([~$+<>=]*)\s*(\d+(?:[.,]\d+)?)\s*(%|ms|us|s|sec|min|hr|h|x|GB|MB|KB|MiB|GiB|TB|k|M|B|px|fps|rps|qps)?$/i)
  if (!m) {
    return {
      raw,
      display: raw.slice(0, 18),
      num: null,
      unit: '',
      group: 'label',
      isPct: false,
      tag: 'HIGHLIGHT'
    }
  }
  const prefix = m[1] || ''
  const num = parseFloat(m[2].replace(/,/g, ''))
  const unit = m[3] || ''
  const uLow = unit.toLowerCase()
  const isPct = unit === '%'
  let group = 'count'
  let tag = 'METRIC'
  if (isPct) {
    group = 'percent'
    tag = num >= 50 ? 'IMPACT' : 'THRESHOLD'
  } else if (uLow === 'ms' || uLow === 'us' || uLow === 's' || uLow === 'sec') {
    group = 'latency'
    tag = 'LATENCY'
  } else if (uLow === 'x') {
    group = 'multiplier'
    tag = 'SCALE'
  } else if (['gb', 'mb', 'kb', 'mib', 'gib', 'tb'].includes(uLow)) {
    group = 'memory'
    tag = 'CAPACITY'
  } else if (prefix.includes('$')) {
    group = 'currency'
    tag = 'VALUE'
  }
  return {
    raw,
    display: `${prefix}${m[2]}${unit}`,
    num: Number.isFinite(num) ? num : null,
    unit,
    group,
    isPct,
    tag
  }
}

function normalizeLayout(raw) {
  const k = String(raw || 'stat-grid').toLowerCase()
  if (k === 'process') return 'timeline'
  if (LAYOUT_OPTIONS.some(o => o.id === k)) return k
  return 'stat-grid'
}

export function InfographicView({ artifact, onOpenChunk }) {
  const spec = artifact?.spec || {}
  const blocks = spec.blocks || []
  const svgRef = useRef(null)
  const [layout, setLayout] = useState(() => normalizeLayout(spec.layout))
  const [paletteKey, setPaletteKey] = useState(() => (PALETTES[spec.palette] ? spec.palette : 'adaptive'))
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [exportingPng, setExportingPng] = useState(false)

  const enriched = useMemo(() => {
    const items = blocks.map((blk, idx) => {
      const metric = parseMetric(blk.value, idx, blocks.length)
      return {
        ...blk,
        _idx: idx,
        _metric: metric,
        _tag: metric ? metric.tag : (blk.kind && blk.kind !== 'metric' ? String(blk.kind).toUpperCase() : 'KEY INSIGHT')
      }
    })

    // Compute per-unit-group maximums so bars scale faithfully within unit families
    const maxByGroup = {}
    for (const it of items) {
      if (it._metric && it._metric.num != null) {
        const g = it._metric.group
        maxByGroup[g] = Math.max(maxByGroup[g] || 0, it._metric.num)
      }
    }

    // Determine hero block: highest percentage first, otherwise first numeric metric, else block 0
    let heroIdx = 0
    let bestScore = -1
    items.forEach((it, idx) => {
      if (!it._metric || it._metric.num == null) return
      const score = it._metric.isPct ? 10000 + it._metric.num : 1000 + it._metric.num
      if (score > bestScore) {
        bestScore = score
        heroIdx = idx
      }
    })

    const withRatios = items.map((it, idx) => {
      let ratio = 0
      if (it._metric && it._metric.num != null) {
        if (it._metric.isPct) {
          ratio = Math.max(0.05, Math.min(1, it._metric.num / 100))
        } else {
          const mx = maxByGroup[it._metric.group] || it._metric.num || 1
          ratio = Math.max(0.08, Math.min(1, it._metric.num / mx))
        }
      }
      return { ...it, _ratio: ratio, _isHero: idx === heroIdx }
    })

    const citeOrder = Array.from(new Set(items.flatMap(b => b.cites || [])))
    const citeNum = Object.fromEntries(citeOrder.map((cid, i) => [cid, i + 1]))
    return {
      items: withRatios,
      heroIdx,
      metricItems: withRatios.filter(it => it._metric && it._metric.num != null),
      citeOrder,
      citeNum
    }
  }, [blocks])

  if (!blocks.length) {
    return <div className="sb-empty">No infographic blocks available.</div>
  }

  const palette = PALETTES[paletteKey] || PALETTES.adaptive
  const accentAt = idx => palette.accents[idx % palette.accents.length]

  const W = 920
  const PAD = 32
  const CW = W - PAD * 2
  const HEADER_H = 92
  const FOOTER_H = 38
  const uid = String(artifact?.id || 'info').replace(/[^a-zA-Z0-9_-]/g, '')
  const titleId = `sb-inf-title-${uid}`
  const descId = `sb-inf-desc-${uid}`

  const items = enriched.items
  const hero = items[enriched.heroIdx] || items[0]
  const rest = items.filter((_, i) => i !== enriched.heroIdx)
  const metricCount = enriched.metricItems.length

  // Compute dynamic canvas height per layout so nothing ever clips or leaves dead voids
  function computeHeight() {
    if (layout === 'stat-grid') {
      const heroRowH = 204
      // Pack remaining blocks into zero-orphan rows (3+2 for 5, 2+2 for 4, 3 for 3, etc.)
      const rows = packBentoRows(rest)
      const gridH = rows.reduce((acc, r) => acc + r.height, 0) + Math.max(0, rows.length - 1) * 14
      return HEADER_H + 16 + heroRowH + (rows.length ? 16 + gridH : 0) + 18 + FOOTER_H
    }
    if (layout === 'timeline') {
      const cardH = 96
      const gap = 12
      return HEADER_H + 18 + items.length * cardH + Math.max(0, items.length - 1) * gap + 18 + FOOTER_H
    }
    if (layout === 'comparison') {
      const leftN = Math.ceil(items.length / 2)
      const rightN = items.length - leftN
      const maxRows = Math.max(leftN, rightN, 1)
      return HEADER_H + 56 + maxRows * 124 + Math.max(0, maxRows - 1) * 12 + 20 + FOOTER_H
    }
    if (layout === 'hub-spoke') {
      const satCount = Math.max(1, items.length - 1)
      const perSide = Math.ceil(satCount / 2)
      return HEADER_H + Math.max(410, perSide * 138 + 44) + FOOTER_H
    }
    if (layout === 'pyramid') {
      const n = Math.min(items.length, 6)
      return HEADER_H + 22 + n * 78 + Math.max(0, n - 1) * 10 + 20 + FOOTER_H
    }
    return 640
  }

  function packBentoRows(list) {
    const rows = []
    let i = 0
    while (i < list.length) {
      const left = list.length - i
      if (left === 5) {
        rows.push({ items: list.slice(i, i + 3), cols: 3, height: 152 })
        i += 3
      } else if (left === 3) {
        rows.push({ items: list.slice(i, i + 3), cols: 3, height: 152 })
        i += 3
      } else if (left >= 2) {
        rows.push({ items: list.slice(i, i + 2), cols: 2, height: 138 })
        i += 2
      } else {
        rows.push({ items: list.slice(i, i + 1), cols: 1, height: 122 })
        i += 1
      }
    }
    return rows
  }

  const H = computeHeight()

  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    await copyText(svgText)
    sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied standalone infographic SVG.' })
  }

  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current)
    downloadTextFile(`${artifact.id || 'infographic'}-${layout}.svg`, svgText, 'image/svg+xml;charset=utf-8')
  }

  async function handleDownloadPng() {
    if (exportingPng) return
    setExportingPng(true)
    try {
      await downloadSvgAsPng(svgRef.current, `${artifact.id || 'infographic'}-${layout}.png`, 2)
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Downloaded 2x PNG infographic.' })
    } catch {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: 'Could not render PNG export.' })
    } finally {
      setExportingPng(false)
    }
  }

  function handleBlockClick(it) {
    setSelectedIdx(prev => (prev === it._idx ? null : it._idx))
  }

  function renderCiteBadgesSvg(cites, rightX, y, accent) {
    const list = (cites || []).slice(0, 3)
    if (!list.length) return null
    return list.map((cid, i) => {
      const num = enriched.citeNum[cid] || i + 1
      const bw = 22
      const bx = rightX - (list.length - i) * (bw + 4) + 4
      return (
        <g
          key={cid}
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation()
            onOpenChunk?.(cid)
          }}
        >
          <rect x={bx} y={y} width={bw} height={18} rx="4" fill={accent} fillOpacity="0.16" stroke={accent} strokeOpacity="0.45" strokeWidth="1" />
          <text
            x={bx + bw / 2}
            y={y + 12.5}
            textAnchor="middle"
            fill={accent}
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            {num}
          </text>
        </g>
      )
    })
  }

  function renderHeader() {
    const primaryAccent = accentAt(0)
    const secondAccent = accentAt(1)
    const subtitle = String(spec.subtitle || `Synthesized from ${enriched.citeOrder.length} cited passages`)
    const summaryText = metricCount > 0 ? `${items.length} FINDINGS  |  ${metricCount} METRICS` : `${items.length} FINDINGS  |  ${enriched.citeOrder.length} CITATIONS`
    const badgeW = Math.max(154, summaryText.length * 6.8 + 24)
    return (
      <g>
        <rect x="0" y="0" width={W} height="3" fill={`url(#sb-top-grad-${uid})`} />
        <rect x={PAD} y="16" width="98" height="19" rx="9.5" fill={primaryAccent} fillOpacity="0.15" stroke={primaryAccent} strokeOpacity="0.35" strokeWidth="1" />
        <circle cx={PAD + 11} cy="25.5" r="3" fill={primaryAccent} />
        <text x={PAD + 20} y="29" fill={primaryAccent} fontSize="9.5" fontWeight="700" letterSpacing="0.9" fontFamily="ui-monospace, SFMono-Regular, monospace">
          VISUAL BRIEF
        </text>
        <text x={PAD + 110} y="29" fill="var(--ui-text-tertiary)" fontSize="10.5" fontFamily="ui-monospace, SFMono-Regular, monospace">
          {layout.toUpperCase()}
        </text>

        <rect
          x={W - PAD - badgeW}
          y="18"
          width={badgeW}
          height="24"
          rx="12"
          fill="var(--sb-surface)"
          stroke="var(--ui-stroke-secondary)"
          strokeWidth="1"
        />
        <text
          x={W - PAD - badgeW / 2}
          y="33.5"
          textAnchor="middle"
          fill="var(--ui-text-secondary)"
          fontSize="10"
          fontWeight="650"
          letterSpacing="0.4"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          {summaryText}
        </text>

        <text
          x={PAD}
          y="60"
          fill="var(--ui-text-primary)"
          fontSize="22"
          fontWeight="750"
          letterSpacing="-0.4"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {String(spec.title || 'Infographic').slice(0, 58)}
        </text>
        <text x={PAD} y="80" fill="var(--ui-text-secondary)" fontSize="12.5" fontFamily="system-ui, -apple-system, sans-serif">
          {subtitle.slice(0, 96)}
        </text>
        <line x1={PAD} y1={HEADER_H} x2={W - PAD} y2={HEADER_H} stroke="var(--ui-stroke-tertiary)" strokeWidth="1" />
        <rect x={PAD} y={HEADER_H - 1} width="84" height="2" rx="1" fill={secondAccent} fillOpacity="0.85" />
      </g>
    )
  }

  function renderFooter() {
    const fy = H - FOOTER_H
    return (
      <g>
        <line x1={PAD} y1={fy} x2={W - PAD} y2={fy} stroke="var(--ui-stroke-tertiary)" strokeWidth="1" />
        <text x={PAD} y={fy + 23} fill="var(--ui-text-tertiary)" fontSize="10" fontWeight="600" letterSpacing="0.8" fontFamily="ui-monospace, SFMono-Regular, monospace">
          SOURCEBOOK  |  GROUNDED VISUAL SYNTHESIS
        </text>
        <text
          x={W - PAD}
          y={fy + 23}
          textAnchor="end"
          fill="var(--ui-text-tertiary)"
          fontSize="10"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
        >
          {`${enriched.citeOrder.length} cited passage${enriched.citeOrder.length === 1 ? '' : 's'}  |  Click any card to inspect`}
        </text>
      </g>
    )
  }

  function renderBentoLayout() {
    const heroY = HEADER_H + 16
    const heroH = 204
    const heroW = 472
    const chartX = PAD + heroW + 16
    const chartW = CW - heroW - 16
    const heroAccent = accentAt(0)
    const isHeroSel = selectedIdx === hero._idx

    // Radial ring gauge geometry
    const cx = PAD + 92
    const cy = heroY + 106
    const r = 56
    const circ = 2 * Math.PI * r
    const gaugeRatio = hero._metric ? (hero._metric.isPct ? hero._ratio : 0.78) : 0.72
    const dashLen = circ * gaugeRatio
    const heroVal = hero._metric ? hero._metric.display : 'KEY'
    const heroFontSize = heroVal.length >= 6 ? 21 : heroVal.length >= 4 ? 25 : 29
    const heroTitleLines = wrapText(hero.heading || 'Primary Highlight', 26, 2)
    const heroBodyLines = wrapText(hero.body, 38, 4)

    // Quantified benchmark bars (up to 5 metrics)
    const barItems = enriched.metricItems.slice(0, 5)
    const bentoRows = packBentoRows(rest)

    let curY = heroY + heroH + 16

    return (
      <g>
        {/* Hero Feature Tile */}
        <g style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(hero)}>
          <rect
            x={PAD}
            y={heroY}
            width={heroW}
            height={heroH}
            rx="12"
            fill={`url(#sb-hero-wash-${uid})`}
            stroke={isHeroSel ? heroAccent : 'var(--ui-stroke-secondary)'}
            strokeWidth={isHeroSel ? '1.8' : '1'}
          />
          <rect x={PAD} y={heroY} width={heroW} height="3.5" rx="2" fill={heroAccent} />

          {/* Radial Gauge */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ui-stroke-tertiary)" strokeWidth="10" />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={heroAccent}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dashLen.toFixed(1)} ${circ.toFixed(1)}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <circle cx={cx} cy={cy} r={r - 12} fill="var(--sb-bg)" fillOpacity="0.65" />
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fill={heroAccent}
            fontSize={heroFontSize}
            fontWeight="800"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            {heroVal}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fill="var(--ui-text-tertiary)"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.8"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            {hero._tag}
          </text>

          {/* Hero Copy */}
          <rect x={PAD + 172} y={heroY + 20} width="108" height="18" rx="9" fill={heroAccent} fillOpacity="0.15" />
          <text
            x={PAD + 182}
            y={heroY + 32}
            fill={heroAccent}
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.7"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            HEADLINE METRIC
          </text>
          <text
            x={PAD + 172}
            y={heroY + 58}
            fill="var(--ui-text-primary)"
            fontSize="16"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {heroTitleLines.map((ln, li) => (
              <tspan key={li} x={PAD + 172} dy={li === 0 ? 0 : 20}>
                {ln}
              </tspan>
            ))}
          </text>
          <text
            x={PAD + 172}
            y={heroY + (heroTitleLines.length > 1 ? 100 : 82)}
            fill="var(--ui-text-secondary)"
            fontSize="12"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {heroBodyLines.map((ln, li) => (
              <tspan key={li} x={PAD + 172} dy={li === 0 ? 0 : 17}>
                {ln}
              </tspan>
            ))}
          </text>
          {renderCiteBadgesSvg(hero.cites, PAD + heroW - 16, heroY + heroH - 28, heroAccent)}
        </g>

        {/* Right Panel: Real Horizontal Metric Benchmark Bar Chart */}
        <g>
          <rect
            x={chartX}
            y={heroY}
            width={chartW}
            height={heroH}
            rx="12"
            fill="var(--sb-surface)"
            stroke="var(--ui-stroke-secondary)"
            strokeWidth="1"
          />
          <text
            x={chartX + 18}
            y={heroY + 26}
            fill="var(--ui-text-tertiary)"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="0.9"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            {barItems.length >= 2 ? 'METRIC COMPARISON' : 'KEY HIGHLIGHTS'}
          </text>
          <line x1={chartX + 18} y1={heroY + 36} x2={chartX + chartW - 18} y2={heroY + 36} stroke="var(--ui-stroke-tertiary)" strokeWidth="1" />

          {barItems.length >= 2 ? (
            barItems.map((bi, bIdx) => {
              const rowY = heroY + 48 + bIdx * 29
              const barColor = accentAt(bIdx)
              const trackW = chartW - 36
              const fillW = Math.max(12, Math.round(trackW * bi._ratio))
              const unitNote = bi._metric?.group === 'latency' ? ' (ms)' : ''
              return (
                <g key={bi.id || bIdx} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(bi)}>
                  <text
                    x={chartX + 18}
                    y={rowY + 9}
                    fill={selectedIdx === bi._idx ? 'var(--ui-text-primary)' : 'var(--ui-text-secondary)'}
                    fontSize="11"
                    fontWeight={selectedIdx === bi._idx ? '650' : '500'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {`${String(bi.heading || '').slice(0, 28)}${unitNote}`}
                  </text>
                  <text
                    x={chartX + chartW - 18}
                    y={rowY + 9}
                    textAnchor="end"
                    fill={barColor}
                    fontSize="11.5"
                    fontWeight="750"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {bi._metric?.display}
                  </text>
                  <rect x={chartX + 18} y={rowY + 14} width={trackW} height="7" rx="3.5" fill="var(--ui-stroke-tertiary)" />
                  <rect x={chartX + 18} y={rowY + 14} width={fillW} height="7" rx="3.5" fill={barColor} />
                </g>
              )
            })
          ) : (
            items.slice(0, 4).map((it, sIdx) => {
              const rowY = heroY + 52 + sIdx * 36
              const col = accentAt(sIdx)
              return (
                <g key={it.id || sIdx} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
                  <circle cx={chartX + 25} cy={rowY + 6} r="5" fill={col} fillOpacity="0.22" stroke={col} strokeWidth="1.5" />
                  <text x={chartX + 38} y={rowY + 10} fill="var(--ui-text-primary)" fontSize="11.5" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">
                    {String(it.heading || '').slice(0, 36)}
                  </text>
                </g>
              )
            })
          )}
        </g>

        {/* Modular Asymmetric Insight Grid (Zero orphan blank gaps) */}
        {bentoRows.map((row, rIdx) => {
          const gap = 14
          const cardW = (CW - gap * (row.cols - 1)) / row.cols
          const rowY = curY
          curY += row.height + 14
          const maxBodyChars = row.cols === 3 ? 33 : row.cols === 2 ? 54 : 112
          const maxTitleChars = row.cols === 3 ? 30 : 44
          return (
            <g key={`row-${rIdx}`}>
              {row.items.map((it, cIdx) => {
                const x = PAD + cIdx * (cardW + gap)
                const colorIdx = items.indexOf(it)
                const col = accentAt(colorIdx)
                const isSel = selectedIdx === it._idx
                const hasNum = Boolean(it._metric && it._metric.display)
                const bodyLines = wrapText(it.body, maxBodyChars, row.cols === 3 ? 3 : 3)
                const tagText = it._tag
                const tagW = Math.max(66, tagText.length * 6.2 + 16)
                return (
                  <g key={it.id || `${rIdx}-${cIdx}`} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
                    <rect
                      x={x}
                      y={rowY}
                      width={cardW}
                      height={row.height}
                      rx="11"
                      fill="var(--sb-surface)"
                      stroke={isSel ? col : 'var(--ui-stroke-secondary)'}
                      strokeWidth={isSel ? '1.8' : '1'}
                    />
                    {/* Crisp left accent strip */}
                    <rect x={x} y={rowY + 12} width="3" height={row.height - 24} rx="1.5" fill={col} />

                    {hasNum ? (
                      <>
                        <text
                          x={x + 16}
                          y={rowY + 34}
                          fill={col}
                          fontSize="22"
                          fontWeight="800"
                          fontFamily="ui-monospace, SFMono-Regular, monospace"
                        >
                          {it._metric.display}
                        </text>
                        <rect
                          x={x + cardW - tagW - 14}
                          y={rowY + 16}
                          width={tagW}
                          height="18"
                          rx="9"
                          fill={col}
                          fillOpacity="0.14"
                        />
                        <text
                          x={x + cardW - tagW / 2 - 14}
                          y={rowY + 28}
                          textAnchor="middle"
                          fill={col}
                          fontSize="8.5"
                          fontWeight="700"
                          letterSpacing="0.6"
                          fontFamily="ui-monospace, SFMono-Regular, monospace"
                        >
                          {tagText}
                        </text>
                        {/* Micro proportional bar */}
                        <rect x={x + 16} y={rowY + 43} width={cardW - 32} height="3.5" rx="2" fill="var(--ui-stroke-tertiary)" />
                        <rect x={x + 16} y={rowY + 43} width={Math.max(12, Math.round((cardW - 32) * it._ratio))} height="3.5" rx="2" fill={col} />
                      </>
                    ) : (
                      <>
                        <rect x={x + 16} y={rowY + 16} width={tagW + 8} height="19" rx="9.5" fill={col} fillOpacity="0.15" />
                        <text
                          x={x + 26}
                          y={rowY + 28.5}
                          fill={col}
                          fontSize="9"
                          fontWeight="700"
                          letterSpacing="0.7"
                          fontFamily="ui-monospace, SFMono-Regular, monospace"
                        >
                          {tagText}
                        </text>
                        <text
                          x={x + cardW - 16}
                          y={rowY + 29}
                          textAnchor="end"
                          fill="var(--ui-text-tertiary)"
                          fontSize="10.5"
                          fontWeight="650"
                          fontFamily="ui-monospace, SFMono-Regular, monospace"
                        >
                          {`0${colorIdx + 1}`}
                        </text>
                      </>
                    )}

                    <text
                      x={x + 16}
                      y={rowY + (hasNum ? 66 : 56)}
                      fill="var(--ui-text-primary)"
                      fontSize="13.5"
                      fontWeight="680"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {clipLabel(it.heading || `Highlight ${colorIdx + 1}`, maxTitleChars)}
                    </text>

                    <text
                      x={x + 16}
                      y={rowY + (hasNum ? 85 : 76)}
                      fill="var(--ui-text-secondary)"
                      fontSize="11.5"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {bodyLines.map((ln, lIdx) => (
                        <tspan key={lIdx} x={x + 16} dy={lIdx === 0 ? 0 : 16}>
                          {ln}
                        </tspan>
                      ))}
                    </text>

                    {renderCiteBadgesSvg(it.cites, x + cardW - 14, rowY + row.height - 24, col)}
                  </g>
                )
              })}
            </g>
          )
        })}
      </g>
    )
  }

  function renderTimelineLayout() {
    const startY = HEADER_H + 18
    const cardH = 96
    const gap = 12
    const spineX = PAD + 26
    const cardX = PAD + 68
    const cardW = CW - 68
    const lastY = startY + (items.length - 1) * (cardH + gap) + 34

    return (
      <g>
        <line x1={spineX} y1={startY + 34} x2={spineX} y2={lastY} stroke="var(--ui-stroke-secondary)" strokeWidth="2.5" strokeDasharray="4 4" />
        {items.map((it, idx) => {
          const y = startY + idx * (cardH + gap)
          const col = accentAt(idx)
          const isSel = selectedIdx === it._idx
          const hasNum = Boolean(it._metric && it._metric.display)
          const bodyLines = wrapText(it.body, hasNum ? 74 : 96, 2)
          return (
            <g key={it.id || idx} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
              <line x1={spineX + 16} y1={y + 34} x2={cardX} y2={y + 34} stroke={col} strokeOpacity="0.65" strokeWidth="1.5" />
              <circle cx={spineX} cy={y + 34} r="17" fill="var(--sb-bg)" stroke={col} strokeWidth="2" />
              <circle cx={spineX} cy={y + 34} r="12" fill={col} fillOpacity="0.18" />
              <text x={spineX} y={y + 38} textAnchor="middle" fill={col} fontSize="11" fontWeight="750" fontFamily="ui-monospace, SFMono-Regular, monospace">
                {`0${idx + 1}`}
              </text>

              <rect
                x={cardX}
                y={y}
                width={cardW}
                height={cardH}
                rx="11"
                fill="var(--sb-surface)"
                stroke={isSel ? col : 'var(--ui-stroke-secondary)'}
                strokeWidth={isSel ? '1.8' : '1'}
              />
              <rect x={cardX} y={y + 12} width="3" height={cardH - 24} rx="1.5" fill={col} />

              <text x={cardX + 18} y={y + 29} fill="var(--ui-text-primary)" fontSize="14.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
                {String(it.heading || `Step ${idx + 1}`).slice(0, 56)}
              </text>
              <text x={cardX + 18} y={y + 50} fill="var(--ui-text-secondary)" fontSize="12" fontFamily="system-ui, -apple-system, sans-serif">
                {bodyLines.map((ln, li) => (
                  <tspan key={li} x={cardX + 18} dy={li === 0 ? 0 : 17}>
                    {ln}
                  </tspan>
                ))}
              </text>

              {hasNum ? (
                <g>
                  <rect x={cardX + cardW - 146} y={y + 16} width="128" height="46" rx="8" fill={col} fillOpacity="0.12" stroke={col} strokeOpacity="0.32" strokeWidth="1" />
                  <text x={cardX + cardW - 82} y={y + 42} textAnchor="middle" fill={col} fontSize="20" fontWeight="800" fontFamily="ui-monospace, SFMono-Regular, monospace">
                    {it._metric.display}
                  </text>
                  <text x={cardX + cardW - 82} y={y + 55} textAnchor="middle" fill="var(--ui-text-tertiary)" fontSize="8.5" fontWeight="700" letterSpacing="0.7" fontFamily="ui-monospace, SFMono-Regular, monospace">
                    {it._tag}
                  </text>
                </g>
              ) : null}

              {renderCiteBadgesSvg(it.cites, cardX + cardW - 18, y + cardH - 24, col)}
            </g>
          )
        })}
      </g>
    )
  }

  function renderComparisonLayout() {
    const half = Math.ceil(items.length / 2)
    const leftItems = items.slice(0, half)
    const rightItems = items.slice(half)
    const gap = 28
    const colW = (CW - gap) / 2
    const topY = HEADER_H + 16
    const cardStartY = topY + 40
    const colA = accentAt(0)
    const colB = accentAt(1)
    const midX = PAD + colW + gap / 2
    const maxRows = Math.max(leftItems.length, rightItems.length, 1)
    const dividerBottom = cardStartY + maxRows * 124 + Math.max(0, maxRows - 1) * 12

    const renderCol = (list, x, color, label, offsetIdx) => (
      <g>
        <rect x={x} y={topY} width={colW} height="30" rx="8" fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.36" strokeWidth="1" />
        <circle cx={x + 14} cy={topY + 15} r="4" fill={color} />
        <text x={x + 26} y={topY + 19} fill={color} fontSize="11" fontWeight="750" letterSpacing="0.8" fontFamily="ui-monospace, SFMono-Regular, monospace">
          {label}
        </text>
        {list.map((it, idx) => {
          const y = cardStartY + idx * 136
          const isSel = selectedIdx === it._idx
          const hasNum = Boolean(it._metric && it._metric.display)
          const bodyLines = wrapText(it.body, 48, 3)
          return (
            <g key={it.id || idx} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
              <rect
                x={x}
                y={y}
                width={colW}
                height="124"
                rx="10"
                fill="var(--sb-surface)"
                stroke={isSel ? color : 'var(--ui-stroke-secondary)'}
                strokeWidth={isSel ? '1.8' : '1'}
              />
              <text x={x + 16} y={y + 26} fill="var(--ui-text-primary)" fontSize="13.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
                {String(it.heading || `Factor ${offsetIdx + idx + 1}`).slice(0, 34)}
              </text>
              {hasNum ? (
                <text x={x + colW - 16} y={y + 28} textAnchor="end" fill={color} fontSize="18" fontWeight="800" fontFamily="ui-monospace, SFMono-Regular, monospace">
                  {it._metric.display}
                </text>
              ) : null}
              {hasNum ? (
                <>
                  <rect x={x + 16} y={y + 36} width={colW - 32} height="4" rx="2" fill="var(--ui-stroke-tertiary)" />
                  <rect x={x + 16} y={y + 36} width={Math.max(12, Math.round((colW - 32) * it._ratio))} height="4" rx="2" fill={color} />
                </>
              ) : null}
              <text x={x + 16} y={y + (hasNum ? 58 : 48)} fill="var(--ui-text-secondary)" fontSize="11.5" fontFamily="system-ui, -apple-system, sans-serif">
                {bodyLines.map((ln, li) => (
                  <tspan key={li} x={x + 16} dy={li === 0 ? 0 : 16}>
                    {ln}
                  </tspan>
                ))}
              </text>
              {renderCiteBadgesSvg(it.cites, x + colW - 14, y + 98, color)}
            </g>
          )
        })}
      </g>
    )

    return (
      <g>
        <line x1={midX} y1={topY + 38} x2={midX} y2={dividerBottom} stroke="var(--ui-stroke-tertiary)" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx={midX} cy={topY + 15} r="13" fill="var(--sb-surface)" stroke="var(--ui-stroke-secondary)" strokeWidth="1" />
        <text x={midX} y={topY + 19} textAnchor="middle" fill="var(--ui-text-tertiary)" fontSize="9.5" fontWeight="750" fontFamily="ui-monospace, SFMono-Regular, monospace">
          VS
        </text>
        {renderCol(leftItems, PAD, colA, `GROUP A  (${leftItems.length})`, 0)}
        {renderCol(rightItems, PAD + colW + gap, colB, `GROUP B  (${rightItems.length})`, half)}
      </g>
    )
  }

  function renderHubSpokeLayout() {
    const satellites = rest.slice(0, 6)
    const leftSats = satellites.filter((_, i) => i % 2 === 0)
    const rightSats = satellites.filter((_, i) => i % 2 === 1)
    const stageTop = HEADER_H + 18
    const stageH = H - FOOTER_H - stageTop - 12
    const cx = W / 2
    const cy = stageTop + stageH / 2
    const hubR = 82
    const hubCol = accentAt(0)
    const cardW = 286
    const cardH = 112

    const renderSide = (list, side) => {
      const isLeft = side === 'left'
      const x = isLeft ? PAD : W - PAD - cardW
      const step = list.length ? stageH / list.length : stageH
      return list.map((it, idx) => {
        const y = stageTop + idx * step + (step - cardH) / 2
        const colorIdx = items.indexOf(it)
        const col = accentAt(colorIdx)
        const isSel = selectedIdx === it._idx
        const anchorX = isLeft ? x + cardW : x
        const anchorY = y + cardH / 2
        const hubEdgeX = isLeft ? cx - hubR : cx + hubR
        const ctrlOffset = isLeft ? -48 : 48
        const d = `M ${hubEdgeX} ${cy} C ${hubEdgeX + ctrlOffset} ${cy}, ${anchorX - ctrlOffset} ${anchorY}, ${anchorX} ${anchorY}`
        const bodyLines = wrapText(it.body, 36, 3)
        return (
          <g key={it.id || `${side}-${idx}`} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
            <path d={d} fill="none" stroke={col} strokeOpacity="0.55" strokeWidth="1.8" />
            <circle cx={anchorX} cy={anchorY} r="4" fill={col} />
            <rect
              x={x}
              y={y}
              width={cardW}
              height={cardH}
              rx="10"
              fill="var(--sb-surface)"
              stroke={isSel ? col : 'var(--ui-stroke-secondary)'}
              strokeWidth={isSel ? '1.8' : '1'}
            />
            <text x={x + 14} y={y + 25} fill="var(--ui-text-primary)" fontSize="12.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
              {clipLabel(it.heading || '', it._metric?.display ? 26 : 34)}
            </text>
            {it._metric?.display ? (
              <text x={x + cardW - 14} y={y + 26} textAnchor="end" fill={col} fontSize="15.5" fontWeight="800" fontFamily="ui-monospace, SFMono-Regular, monospace">
                {it._metric.display}
              </text>
            ) : null}
            <text x={x + 14} y={y + 45} fill="var(--ui-text-secondary)" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif">
              {bodyLines.map((ln, li) => (
                <tspan key={li} x={x + 14} dy={li === 0 ? 0 : 15}>
                  {ln}
                </tspan>
              ))}
            </text>
            {renderCiteBadgesSvg(it.cites, x + cardW - 12, y + cardH - 22, col)}
          </g>
        )
      })
    }

    const hubHeadingLines = wrapText(hero.heading || spec.title || 'Core Topic', 16, 2)
    return (
      <g>
        {renderSide(leftSats, 'left')}
        {renderSide(rightSats, 'right')}
        {/* Central Hub */}
        <g style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(hero)}>
          <circle cx={cx} cy={cy} r={hubR + 10} fill={hubCol} fillOpacity="0.08" stroke={hubCol} strokeOpacity="0.24" strokeDasharray="4 4" />
          <circle cx={cx} cy={cy} r={hubR} fill="var(--sb-surface)" stroke={hubCol} strokeWidth="2.5" />
          {hero._metric?.display ? (
            <text x={cx} y={cy - 10} textAnchor="middle" fill={hubCol} fontSize="26" fontWeight="800" fontFamily="ui-monospace, SFMono-Regular, monospace">
              {hero._metric.display}
            </text>
          ) : null}
          <text
            x={cx}
            y={cy + (hero._metric?.display ? 12 : -4)}
            textAnchor="middle"
            fill="var(--ui-text-primary)"
            fontSize="12"
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {hubHeadingLines.map((ln, li) => (
              <tspan key={li} x={cx} dy={li === 0 ? 0 : 15}>
                {ln}
              </tspan>
            ))}
          </text>
          <text x={cx} y={cy + 46} textAnchor="middle" fill="var(--ui-text-tertiary)" fontSize="8.5" fontWeight="700" letterSpacing="0.8" fontFamily="ui-monospace, SFMono-Regular, monospace">
            CORE HUB
          </text>
        </g>
      </g>
    )
  }

  function renderPyramidLayout() {
    const tiers = items.slice(0, 6)
    const n = tiers.length
    const topY = HEADER_H + 22
    const tierH = 74
    const gap = 10
    const pyrCenter = PAD + 188
    const maxW = 360
    const minW = 104
    const noteX = PAD + 404
    const noteW = CW - 404

    return (
      <g>
        {tiers.map((it, idx) => {
          const y = topY + idx * (tierH + gap)
          const col = accentAt(idx)
          const isSel = selectedIdx === it._idx
          const wTop = minW + ((maxW - minW) * idx) / Math.max(n, 1)
          const wBot = minW + ((maxW - minW) * (idx + 1)) / Math.max(n, 1)
          const pts = [
            `${pyrCenter - wTop / 2},${y}`,
            `${pyrCenter + wTop / 2},${y}`,
            `${pyrCenter + wBot / 2},${y + tierH}`,
            `${pyrCenter - wBot / 2},${y + tierH}`
          ].join(' ')
          const rightMidX = pyrCenter + (wTop + wBot) / 4
          const midY = y + tierH / 2
          const bodyLines = wrapText(it.body, 56, 2)
          return (
            <g key={it.id || idx} style={{ cursor: 'pointer' }} onClick={() => handleBlockClick(it)}>
              <polygon points={pts} fill={col} fillOpacity={isSel ? '0.28' : '0.16'} stroke={col} strokeWidth={isSel ? '2' : '1.3'} />
              <text
                x={pyrCenter}
                y={midY + (it._metric?.display ? 1 : 5)}
                textAnchor="middle"
                fill={col}
                fontSize={it._metric?.display ? '18' : '13'}
                fontWeight="800"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
              >
                {it._metric?.display || `TIER 0${idx + 1}`}
              </text>
              {it._metric?.display ? (
                <text x={pyrCenter} y={midY + 17} textAnchor="middle" fill="var(--ui-text-secondary)" fontSize="8.5" fontWeight="700" letterSpacing="0.7" fontFamily="ui-monospace, SFMono-Regular, monospace">
                  {it._tag}
                </text>
              ) : null}

              <line x1={rightMidX + 4} y1={midY} x2={noteX} y2={midY} stroke={col} strokeOpacity="0.6" strokeWidth="1.3" strokeDasharray="3 3" />
              <circle cx={noteX} cy={midY} r="3.5" fill={col} />

              <rect
                x={noteX}
                y={y}
                width={noteW}
                height={tierH}
                rx="10"
                fill="var(--sb-surface)"
                stroke={isSel ? col : 'var(--ui-stroke-secondary)'}
                strokeWidth={isSel ? '1.8' : '1'}
              />
              <text x={noteX + 16} y={y + 24} fill="var(--ui-text-primary)" fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
                {String(it.heading || `Tier ${idx + 1}`).slice(0, 44)}
              </text>
              <text x={noteX + 16} y={y + 43} fill="var(--ui-text-secondary)" fontSize="11.5" fontFamily="system-ui, -apple-system, sans-serif">
                {bodyLines.map((ln, li) => (
                  <tspan key={li} x={noteX + 16} dy={li === 0 ? 0 : 15}>
                    {ln}
                  </tspan>
                ))}
              </text>
              {renderCiteBadgesSvg(it.cites, noteX + noteW - 14, y + tierH - 22, col)}
            </g>
          )
        })}
      </g>
    )
  }

  const selectedBlock = selectedIdx != null ? items[selectedIdx] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Editorial Toolbar: Layout Switcher + Palette + Export */}
      <div className="sb-inf-toolbar">
        <div className="sb-seg" role="group" aria-label="Infographic layout">
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              className="sb-seg-btn"
              data-active={layout === opt.id}
              onClick={() => setLayout(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <select
            className="sb-select"
            value={paletteKey}
            onChange={e => setPaletteKey(e.target.value)}
            aria-label="Infographic color palette"
            title="Switch visual color palette"
          >
            {Object.entries(PALETTES).map(([k, p]) => (
              <option key={k} value={k}>
                {p.label}
              </option>
            ))}
          </select>
          <button type="button" className="sb-btn" onClick={handleCopySvg} title="Copy standalone vector SVG">
            <Icon name="Copy" size={12} /> Copy SVG
          </button>
          <button type="button" className="sb-btn" onClick={handleDownloadSvg} title="Download vector .svg file">
            <Icon name="Download" size={12} /> SVG
          </button>
          <button type="button" className="sb-btn sb-btn-primary" disabled={exportingPng} onClick={handleDownloadPng} title="Download high-resolution 2x PNG">
            <Icon name="ImageDown" size={12} /> {exportingPng ? 'Exporting...' : 'PNG'}
          </button>
        </div>
      </div>

      {spec.hero_image_url ? (
        <img
          src={spec.hero_image_url}
          alt={spec.title || 'Infographic hero visual'}
          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--ui-stroke-secondary)' }}
        />
      ) : null}

      <div className="sb-svg-stage">
        <svg
          ref={svgRef}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', background: 'var(--sb-bg)' }}
        >
          <title id={titleId}>{spec.title || 'Infographic'}</title>
          <desc id={descId}>{spec.subtitle || `Structured ${layout} infographic with ${blocks.length} cited items.`}</desc>

          <defs>
            <linearGradient id={`sb-top-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accentAt(0)} />
              <stop offset="50%" stopColor={accentAt(1)} />
              <stop offset="100%" stopColor={accentAt(2)} />
            </linearGradient>
            <linearGradient id={`sb-hero-wash-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentAt(0)} stopOpacity="0.11" />
              <stop offset="48%" stopColor="var(--sb-surface)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--sb-surface)" stopOpacity="1" />
            </linearGradient>
            <pattern id={`sb-bayer-grid-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="1.5" height="1.5" fill={accentAt(0)} fillOpacity="0.22" />
              <rect x="4" y="4" width="1.5" height="1.5" fill={accentAt(1)} fillOpacity="0.18" />
            </pattern>
          </defs>

          <rect x="0" y="0" width={W} height={H} fill="var(--sb-bg)" />
          <rect x="0" y="0" width={W} height="92" fill={`url(#sb-bayer-grid-${uid})`} opacity="0.7" />
          {renderHeader()}

          {layout === 'stat-grid' ? renderBentoLayout() : null}
          {layout === 'timeline' ? renderTimelineLayout() : null}
          {layout === 'comparison' ? renderComparisonLayout() : null}
          {layout === 'hub-spoke' ? renderHubSpokeLayout() : null}
          {layout === 'pyramid' ? renderPyramidLayout() : null}

          {renderFooter()}
        </svg>
      </div>

      {/* Selected block detail inspector strip */}
      {selectedBlock ? (
        <div className="sb-inf-detail">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {selectedBlock._metric?.display ? (
                <span className="sb-mono" style={{ fontWeight: 750, fontSize: 13, color: accentAt(selectedBlock._idx) }}>
                  {selectedBlock._metric.display}
                </span>
              ) : null}
              <span style={{ fontWeight: 650, color: 'var(--ui-text-primary)', fontSize: 12.5 }}>
                {selectedBlock.heading}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {(selectedBlock.cites || []).map(cid => (
                <button
                  key={cid}
                  type="button"
                  className="sb-btn"
                  onClick={() => onOpenChunk?.(cid)}
                >
                  <Icon name="BookOpen" size={12} /> Inspect Passage [{enriched.citeNum[cid] || 1}]
                </button>
              ))}
              <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={() => setSelectedIdx(null)} aria-label="Close detail">
                <Icon name="X" size={12} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', lineHeight: 1.5 }}>
            {selectedBlock.body}
          </div>
        </div>
      ) : null}

      {/* Cited passages footer bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>Cited passages:</span>
        {enriched.citeOrder.map((cid, idx) => (
          <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
