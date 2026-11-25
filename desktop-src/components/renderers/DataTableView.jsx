import { Fragment, useMemo, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { copyText, downloadTextFile } from '../../api.js'

const BADGE_TONES = [
  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.13)', border: 'rgba(59, 130, 246, 0.30)' },
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.13)', border: 'rgba(16, 185, 129, 0.30)' },
  { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.13)', border: 'rgba(56, 189, 248, 0.30)' },
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.13)', border: 'rgba(245, 158, 11, 0.30)' },
  { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.13)', border: 'rgba(244, 63, 94, 0.30)' },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.13)', border: 'rgba(139, 92, 246, 0.30)' }
]

function hashTone(label) {
  const s = String(label || '')
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return BADGE_TONES[h % BADGE_TONES.length]
}

function cleanSourceLabel(raw) {
  return String(raw || '').replace(/\.(md|markdown|txt|pdf|docx|csv|json|html)$/i, '').trim()
}

function parseCellMetric(val) {
  const raw = String(val ?? '').trim()
  if (!raw || /^(qualitative|n\/a|none|null|-|--)$/i.test(raw)) {
    return { isMetric: false, isPlaceholder: Boolean(raw), display: raw || '-', num: null, unit: '', group: 'none' }
  }
  const m = raw.match(/^([~$+<>=]*)\s*(-?\d+(?:[.,]\d+)?)\s*(%|ms|us|s|sec|min|hr|h|x|GB|MB|KB|MiB|GiB|TB|k|M|B|px|fps|rps|qps)?$/i)
  if (!m) {
    return { isMetric: false, isPlaceholder: false, display: raw, num: null, unit: '', group: 'text' }
  }
  const num = parseFloat(m[2].replace(/,/g, ''))
  const unit = m[3] || ''
  const uLow = unit.toLowerCase()
  let group = 'count'
  if (unit === '%') group = 'percent'
  else if (['ms', 'us', 's', 'sec'].includes(uLow)) group = 'latency'
  else if (uLow === 'x') group = 'multiplier'
  else if (['gb', 'mb', 'kb', 'mib', 'gib', 'tb'].includes(uLow)) group = 'memory'
  else if ((m[1] || '').includes('$')) group = 'currency'
  return {
    isMetric: Number.isFinite(num),
    isPlaceholder: false,
    display: `${m[1] || ''}${m[2]}${unit}`,
    num: Number.isFinite(num) ? num : null,
    unit,
    group
  }
}

function barColorForGroup(group) {
  if (group === 'percent') return '#10b981'
  if (group === 'latency') return '#38bdf8'
  if (group === 'currency') return '#f59e0b'
  return 'var(--ui-accent)'
}

export function DataTableView({ artifact, onOpenChunk }) {
  const cols = artifact?.spec?.columns || []
  const rows = artifact?.spec?.rows || []
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [viewMode, setViewMode] = useState('table')
  const [density, setDensity] = useState('comfortable')
  const [activeFacet, setActiveFacet] = useState('ALL')
  const [metricsOnly, setMetricsOnly] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState(null)
  const [hiddenCols, setHiddenCols] = useState({})
  const [showColMenu, setShowColMenu] = useState(false)

  // Analyze columns semantically: primary badge/facet column, secondary tag column, metric column, long text column
  const meta = useMemo(() => {
    const colRoles = {}
    let facetCol = null
    let metricCol = null
    let textCol = null

    for (const c of cols) {
      const k = String(c.key || '').toLowerCase()
      const lbl = String(c.label || '').toLowerCase()
      const vals = rows.map(r => String(r.cells?.[c.key] ?? '').trim()).filter(Boolean)
      const distinct = Array.from(new Set(vals))
      const metricHits = vals.filter(v => parseCellMetric(v).isMetric).length
      const avgLen = vals.length ? vals.reduce((a, b) => a + b.length, 0) / vals.length : 0

      if (c.type === 'number' || /metric|score|latency|rate|value|count|amount|pct|percent|time|size/.test(k + ' ' + lbl) || (vals.length && metricHits / vals.length >= 0.25)) {
        colRoles[c.key] = 'metric'
        if (!metricCol) metricCol = c.key
      } else if (c.type === 'url') {
        colRoles[c.key] = 'url'
      } else if (!facetCol && (/source|category|group|type|status|component|engine|system|doc/.test(k + ' ' + lbl) || (distinct.length >= 2 && distinct.length <= 8 && avgLen < 48))) {
        colRoles[c.key] = 'badge'
        facetCol = c.key
      } else if (/section|topic|stage|phase|area|tag/.test(k + ' ' + lbl) || (distinct.length <= Math.max(2, rows.length * 0.8) && avgLen < 38)) {
        colRoles[c.key] = 'tag'
      } else {
        colRoles[c.key] = avgLen > 45 ? 'longtext' : 'text'
        if (avgLen > 45 && !textCol) textCol = c.key
      }
    }

    // Facet counts
    const facetCounts = []
    if (facetCol) {
      const map = new Map()
      for (const r of rows) {
        const v = String(r.cells?.[facetCol] ?? '').trim()
        if (!v) continue
        map.set(v, (map.get(v) || 0) + 1)
      }
      for (const [value, count] of map.entries()) {
        facetCounts.push({ value, label: cleanSourceLabel(value), count, tone: hashTone(value) })
      }
      facetCounts.sort((a, b) => b.count - a.count)
    }

    // Metric maxes per group for accurate proportional bars
    const groupMax = {}
    let quantifiedCount = 0
    let peakMetric = null
    const chartEntries = []

    rows.forEach((r, idx) => {
      if (!metricCol) return
      const pm = parseCellMetric(r.cells?.[metricCol])
      if (pm.isMetric && pm.num != null) {
        quantifiedCount += 1
        groupMax[pm.group] = Math.max(groupMax[pm.group] || 0, Math.abs(pm.num))
        const score = pm.group === 'percent' ? 10000 + pm.num : 1000 + pm.num
        if (!peakMetric || score > peakMetric.score) {
          peakMetric = { display: pm.display, group: pm.group, score, label: r.cells?.[facetCol] || r.cells?.[cols[0]?.key] || '' }
        }
        chartEntries.push({
          row: r,
          idx,
          metric: pm,
          source: facetCol ? cleanSourceLabel(r.cells?.[facetCol] || '') : '',
          title:
            (cols.find(c => colRoles[c.key] === 'tag') && r.cells?.[cols.find(c => colRoles[c.key] === 'tag').key]) ||
            (cols[0] && cleanSourceLabel(r.cells?.[cols[0].key])) ||
            `Row ${idx + 1}`,
          detail: textCol ? String(r.cells?.[textCol] || '') : ''
        })
      }
    })

    const distinctSources = facetCounts.length || new Set(rows.flatMap(r => r.cites || [])).size

    return {
      colRoles,
      facetCol,
      metricCol,
      textCol,
      facetCounts,
      groupMax,
      quantifiedCount,
      peakMetric,
      distinctSources,
      chartEntries
    }
  }, [cols, rows])

  const visibleCols = useMemo(
    () => cols.filter(c => !hiddenCols[c.key]),
    [cols, hiddenCols]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows.filter(r => {
      if (activeFacet !== 'ALL' && meta.facetCol) {
        if (String(r.cells?.[meta.facetCol] ?? '').trim() !== activeFacet) return false
      }
      if (metricsOnly && meta.metricCol) {
        if (!parseCellMetric(r.cells?.[meta.metricCol]).isMetric) return false
      }
      if (q) {
        const hit = Object.values(r.cells || {}).some(v => String(v ?? '').toLowerCase().includes(q))
        if (!hit) return false
      }
      return true
    })

    if (sort.key) {
      list = [...list].sort((a, b) => {
        const av = a.cells?.[sort.key] ?? ''
        const bv = b.cells?.[sort.key] ?? ''
        const am = parseCellMetric(av)
        const bm = parseCellMetric(bv)
        let cmp = 0
        if (am.isMetric && bm.isMetric) {
          cmp = (am.num ?? 0) - (bm.num ?? 0)
        } else if (am.isMetric !== bm.isMetric) {
          cmp = am.isMetric ? -1 : 1
        } else {
          cmp = String(av).localeCompare(String(bv))
        }
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [rows, query, sort, activeFacet, metricsOnly, meta.facetCol, meta.metricCol])

  if (!cols.length) {
    return <div className="sb-empty">No table columns available.</div>
  }

  function toggleSort(key) {
    setSort(prev => {
      if (prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return { key: null, dir: 'asc' }
    })
  }

  function toggleCol(key) {
    const shownCount = cols.filter(c => !hiddenCols[c.key]).length
    if (!hiddenCols[key] && shownCount <= 1) return
    setHiddenCols(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function metricRatio(pm) {
    if (!pm.isMetric || pm.num == null) return 0
    if (pm.group === 'percent') return Math.max(0.05, Math.min(1, Math.abs(pm.num) / 100))
    const mx = meta.groupMax[pm.group] || Math.abs(pm.num) || 1
    return Math.max(0.08, Math.min(1, Math.abs(pm.num) / mx))
  }

  function toMarkdown() {
    const useCols = visibleCols
    const head = '| ' + useCols.map(c => c.label || c.key).join(' | ') + ' |'
    const sep = '| ' + useCols.map(c => (meta.colRoles[c.key] === 'metric' ? '---:' : '---')).join(' | ') + ' |'
    const body = filtered.map(r => '| ' + useCols.map(c => String(r.cells?.[c.key] ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |')
    return [head, sep, ...body].join('\n')
  }

  function exportCsv() {
    const useCols = visibleCols
    const out = [useCols.map(c => c.label || c.key).concat('Citations')]
    for (const r of filtered) {
      out.push(useCols.map(c => String(r.cells?.[c.key] ?? '')).concat((r.cites || []).join('; ')))
    }
    const csv = out.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadTextFile(`${artifact.id || 'table'}.csv`, csv, 'text/csv;charset=utf-8')
  }

  function exportJson() {
    const payload = filtered.map(r => ({
      ...r.cells,
      citations: r.cites || []
    }))
    downloadTextFile(`${artifact.id || 'table'}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
  }

  async function copyRow(e, row) {
    e.stopPropagation()
    const line = visibleCols.map(c => `${c.label || c.key}: ${row.cells?.[c.key] ?? ''}`).join(' | ')
    await copyText(line)
    sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied row to clipboard.' })
  }

  function renderCell(col, row) {
    const val = row.cells?.[col.key] ?? ''
    const role = meta.colRoles[col.key]

    if (role === 'badge') {
      const tone = hashTone(val)
      const label = cleanSourceLabel(val)
      return (
        <span
          className="sb-dt-badge"
          title={String(val)}
          style={{ background: tone.bg, borderColor: tone.border, color: tone.color }}
        >
          <span className="sb-dt-dot" style={{ background: tone.color }} />
          <span className="sb-dt-badge-txt">{label}</span>
        </span>
      )
    }

    if (role === 'tag') {
      return (
        <span className="sb-dt-tag" title={String(val)}>
          {String(val)}
        </span>
      )
    }

    if (role === 'metric') {
      const pm = parseCellMetric(val)
      if (!pm.isMetric) {
        return <span className="sb-dt-qual">{pm.display}</span>
      }
      const ratio = metricRatio(pm)
      const color = barColorForGroup(pm.group)
      return (
        <div className="sb-dt-metric-cell">
          <span className="sb-mono sb-dt-metric-val" style={{ color }}>
            {pm.display}
          </span>
          <div className="sb-dt-bar-track">
            <div className="sb-dt-bar-fill" style={{ width: `${Math.round(ratio * 100)}%`, background: color }} />
          </div>
        </div>
      )
    }

    if (role === 'url' && /^https?:\/\//i.test(String(val))) {
      return (
        <a className="sb-link" href={String(val)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          {String(val).replace(/^https?:\/\/(www\.)?/, '').slice(0, 34)}
        </a>
      )
    }

    return (
      <div className={density === 'compact' ? 'sb-dt-clamp-1' : 'sb-dt-clamp-2'}>
        {String(val)}
      </div>
    )
  }

  // Group chart entries by unit family for clean comparable scales
  const chartGroups = useMemo(() => {
    const visibleIds = new Set(filtered.map(r => r.id))
    const byGroup = new Map()
    for (const entry of meta.chartEntries) {
      if (entry.row.id && !visibleIds.has(entry.row.id)) continue
      const g = entry.metric.group
      if (!byGroup.has(g)) byGroup.set(g, [])
      byGroup.get(g).push(entry)
    }
    const labels = {
      percent: 'Percentages (%)',
      latency: 'Latency & Timing',
      multiplier: 'Multipliers',
      memory: 'Memory & Storage',
      currency: 'Financial Values',
      count: 'Numeric Counts'
    }
    return Array.from(byGroup.entries()).map(([group, entries]) => ({
      group,
      label: labels[group] || group,
      color: barColorForGroup(group),
      entries: [...entries].sort((a, b) => (b.metric.num ?? 0) - (a.metric.num ?? 0))
    }))
  }, [meta.chartEntries, filtered])

  const pctQuantified = rows.length ? Math.round((meta.quantifiedCount / rows.length) * 100) : 0

  return (
    <div className="sb-dt-root">
      {/* Executive KPI Summary Strip */}
      <div className="sb-dt-kpis">
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Rows</div>
          <div className="sb-dt-kpi-val sb-mono">
            {filtered.length === rows.length ? rows.length : `${filtered.length} / ${rows.length}`}
          </div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Quantified</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="sb-dt-kpi-val sb-mono" style={{ color: '#10b981' }}>
              {meta.quantifiedCount}/{rows.length}
            </span>
            <div className="sb-dt-bar-track" style={{ flex: 1, maxWidth: 68 }}>
              <div className="sb-dt-bar-fill" style={{ width: `${pctQuantified}%`, background: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Sources</div>
          <div className="sb-dt-kpi-val sb-mono">{meta.distinctSources}</div>
        </div>
        <div className="sb-dt-kpi">
          <div className="sb-dt-kpi-lbl">Peak Metric</div>
          <div className="sb-dt-kpi-val sb-mono" style={{ color: 'var(--ui-accent)' }}>
            {meta.peakMetric ? meta.peakMetric.display : `${cols.length} cols`}
          </div>
        </div>
      </div>

      {/* Command Toolbar */}
      <div className="sb-dt-toolbar">
        <div className="sb-dt-search-wrap">
          <Icon name="Search" size={13} style={{ color: 'var(--ui-text-tertiary)', flexShrink: 0 }} />
          <input
            className="sb-dt-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search rows, metrics, or findings..."
            aria-label="Filter table rows"
          />
          {query ? (
            <button type="button" className="sb-dt-clear" onClick={() => setQuery('')} aria-label="Clear filter">
              <Icon name="X" size={12} />
            </button>
          ) : null}
        </div>

        <div className="sb-seg" role="group" aria-label="Data view mode">
          <button type="button" className="sb-seg-btn" data-active={viewMode === 'table'} onClick={() => setViewMode('table')}>
            <Icon name="Table" size={12} /> Table
          </button>
          <button type="button" className="sb-seg-btn" data-active={viewMode === 'cards'} onClick={() => setViewMode('cards')}>
            <Icon name="LayoutGrid" size={12} /> Cards
          </button>
          <button type="button" className="sb-seg-btn" data-active={viewMode === 'chart'} onClick={() => setViewMode('chart')}>
            <Icon name="BarChart2" size={12} /> Chart
          </button>
        </div>

        {viewMode === 'table' ? (
          <div style={{ display: 'flex', gap: 5, position: 'relative' }}>
            <button
              type="button"
              className="sb-btn"
              onClick={() => setDensity(d => (d === 'comfortable' ? 'compact' : 'comfortable'))}
              title="Toggle row density"
            >
              <Icon name="List" size={12} /> {density === 'comfortable' ? 'Comfortable' : 'Compact'}
            </button>
            <button
              type="button"
              className="sb-btn"
              data-active={showColMenu}
              onClick={() => setShowColMenu(v => !v)}
              title="Show or hide columns"
            >
              <Icon name="Columns3" size={12} /> Columns
            </button>
            {showColMenu ? (
              <div className="sb-dt-col-menu">
                <div style={{ fontSize: 10.5, fontWeight: 650, color: 'var(--ui-text-tertiary)', padding: '2px 6px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Visible Columns
                </div>
                {cols.map(c => (
                  <label key={c.key} className="sb-dt-col-opt">
                    <input
                      type="checkbox"
                      className="sb-checkbox"
                      style={{ margin: 0 }}
                      checked={!hiddenCols[c.key]}
                      onChange={() => toggleCol(c.key)}
                    />
                    <span>{c.label || c.key}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 5 }}>
          <button
            type="button"
            className="sb-btn"
            onClick={async () => {
              await copyText(toMarkdown())
              sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied Markdown table.' })
            }}
            title="Copy filtered rows as Markdown"
          >
            <Icon name="Copy" size={12} /> MD
          </button>
          <button type="button" className="sb-btn" onClick={exportCsv} title="Download CSV">
            <Icon name="Download" size={12} /> CSV
          </button>
          <button type="button" className="sb-btn" onClick={exportJson} title="Download JSON">
            <Icon name="FileJson" size={12} /> JSON
          </button>
        </div>
      </div>

      {/* Faceted Quick-Filter Chips */}
      {meta.facetCounts.length > 1 || meta.quantifiedCount > 0 ? (
        <div className="sb-dt-facets">
          {meta.facetCounts.length > 1 ? (
            <>
              <button
                type="button"
                className="sb-dt-facet-chip"
                data-active={activeFacet === 'ALL'}
                onClick={() => setActiveFacet('ALL')}
              >
                All <span className="sb-dt-facet-n">{rows.length}</span>
              </button>
              {meta.facetCounts.map(f => (
                <button
                  key={f.value}
                  type="button"
                  className="sb-dt-facet-chip"
                  data-active={activeFacet === f.value}
                  onClick={() => setActiveFacet(prev => (prev === f.value ? 'ALL' : f.value))}
                  title={f.value}
                >
                  <span className="sb-dt-dot" style={{ background: f.tone.color }} />
                  <span>{f.label.length > 19 ? f.label.slice(0, 17).trimEnd() + '...' : f.label}</span>
                  <span className="sb-dt-facet-n">{f.count}</span>
                </button>
              ))}
            </>
          ) : null}

          {meta.quantifiedCount > 0 && meta.quantifiedCount < rows.length ? (
            <button
              type="button"
              className="sb-dt-facet-chip"
              style={{ marginLeft: 'auto' }}
              data-active={metricsOnly}
              onClick={() => setMetricsOnly(v => !v)}
              title="Show only rows with quantified numeric metrics"
            >
              <Icon name="Filter" size={11} /> Metrics only <span className="sb-dt-facet-n">{meta.quantifiedCount}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {/* View 1: Rich Interactive Table */}
      {viewMode === 'table' ? (
        <div className="sb-table-wrap sb-scroll sb-dt-table-stage">
          <table className="sb-table" data-density={density}>
            <thead>
              <tr>
                <th style={{ width: 28, cursor: 'default' }} />
                {visibleCols.map(c => {
                  const isMetric = meta.colRoles[c.key] === 'metric'
                  const active = sort.key === c.key
                  return (
                    <th
                      key={c.key}
                      data-sorted={active ? sort.dir : undefined}
                      style={{ textAlign: isMetric ? 'right' : 'left' }}
                      onClick={() => toggleSort(c.key)}
                    >
                      <span className="sb-dt-th-inner" style={{ justifyContent: isMetric ? 'flex-end' : 'flex-start' }}>
                        <span>{c.label || c.key}</span>
                        <Icon
                          name={active ? (sort.dir === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
                          size={11}
                          style={{ opacity: active ? 1 : 0.35, color: active ? 'var(--ui-accent)' : 'currentColor' }}
                        />
                      </span>
                    </th>
                  )
                })}
                <th style={{ width: 82, textAlign: 'right', cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 2} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ui-text-tertiary)' }}>
                    No rows match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r, rIdx) => {
                  const rowKey = r.id || `row-${rIdx}`
                  const isExp = expandedRowId === rowKey
                  return (
                    <Fragment key={rowKey}>
                      <tr
                        className="sb-dt-row"
                        data-expanded={isExp}
                        onClick={() => setExpandedRowId(prev => (prev === rowKey ? null : rowKey))}
                      >
                        <td style={{ width: 28, color: 'var(--ui-text-tertiary)', paddingRight: 4 }}>
                          <Icon name={isExp ? 'ChevronDown' : 'ChevronRight'} size={13} />
                        </td>
                        {visibleCols.map(c => {
                          const isMetric = meta.colRoles[c.key] === 'metric'
                          return (
                            <td
                              key={c.key}
                              className={isMetric ? 'sb-num' : undefined}
                              style={{
                                textAlign: isMetric ? 'right' : 'left',
                                width: meta.colRoles[c.key] === 'metric' ? 112 : meta.colRoles[c.key] === 'badge' ? 196 : meta.colRoles[c.key] === 'tag' ? 168 : undefined
                              }}
                            >
                              {renderCell(c, r)}
                            </td>
                          )
                        })}
                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                          <div className="sb-dt-row-actions">
                            <button
                              type="button"
                              className="sb-dt-copy-btn"
                              onClick={e => copyRow(e, r)}
                              title="Copy row"
                              aria-label="Copy row"
                            >
                              <Icon name="Copy" size={12} />
                            </button>
                            {(r.cites || []).map((cid, idx) => (
                              <button
                                key={cid}
                                type="button"
                                className="sb-cite"
                                onClick={e => {
                                  e.stopPropagation()
                                  onOpenChunk?.(cid)
                                }}
                                title={`Inspect passage ${cid}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {isExp ? (
                        <tr className="sb-dt-detail-row">
                          <td colSpan={visibleCols.length + 2}>
                            <div className="sb-dt-detail-panel">
                              <div className="sb-dt-detail-grid">
                                {cols.map(c => (
                                  <div key={c.key} className="sb-dt-detail-field" style={meta.colRoles[c.key] === 'longtext' ? { gridColumn: '1 / -1' } : undefined}>
                                    <div className="sb-dt-detail-key">{c.label || c.key}</div>
                                    <div className="sb-dt-detail-val">{String(r.cells?.[c.key] ?? '')}</div>
                                  </div>
                                ))}
                              </div>
                              {(r.cites || []).length ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
                                  <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>Source passages:</span>
                                  {(r.cites || []).map((cid, idx) => (
                                    <button key={cid} type="button" className="sb-btn" onClick={() => onOpenChunk?.(cid)}>
                                      <Icon name="BookOpen" size={12} /> Inspect [{idx + 1}]
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* View 2: Airtable-Style Editorial Gallery Cards */}
      {viewMode === 'cards' ? (
        <div className="sb-dt-cards-grid">
          {filtered.map((r, idx) => {
            const facetVal = meta.facetCol ? r.cells?.[meta.facetCol] : ''
            const tone = hashTone(facetVal)
            const pm = meta.metricCol ? parseCellMetric(r.cells?.[meta.metricCol]) : null
            const tagCol = cols.find(c => meta.colRoles[c.key] === 'tag')
            const bodyCol = cols.find(c => meta.colRoles[c.key] === 'longtext') || cols[cols.length - 1]
            return (
              <div key={r.id || idx} className="sb-dt-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  {facetVal ? (
                    <span className="sb-dt-badge" style={{ background: tone.bg, borderColor: tone.border, color: tone.color }}>
                      <span className="sb-dt-dot" style={{ background: tone.color }} />
                      <span className="sb-dt-badge-txt">{cleanSourceLabel(facetVal)}</span>
                    </span>
                  ) : <span />}
                  {pm?.isMetric ? (
                    <span className="sb-mono" style={{ fontSize: 17, fontWeight: 750, color: barColorForGroup(pm.group) }}>
                      {pm.display}
                    </span>
                  ) : pm ? (
                    <span className="sb-dt-qual">{pm.display}</span>
                  ) : null}
                </div>
                {tagCol && r.cells?.[tagCol.key] ? (
                  <div style={{ fontWeight: 650, fontSize: 13, color: 'var(--ui-text-primary)' }}>
                    {String(r.cells[tagCol.key])}
                  </div>
                ) : null}
                {bodyCol && r.cells?.[bodyCol.key] ? (
                  <div style={{ fontSize: 12.5, color: 'var(--ui-text-secondary)', lineHeight: 1.55 }}>
                    {String(r.cells[bodyCol.key])}
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {(r.cites || []).map((cid, cIdx) => (
                      <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                        {cIdx + 1}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="sb-btn sb-btn-ghost" onClick={e => copyRow(e, r)}>
                    <Icon name="Copy" size={11} /> Copy
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {/* View 3: Instant Visual Bar Chart of Quantified Rows */}
      {viewMode === 'chart' ? (
        <div className="sb-dt-chart-stage">
          {chartGroups.length === 0 ? (
            <div className="sb-empty">
              <Icon name="BarChart2" size={22} />
              <div style={{ fontWeight: 600, color: 'var(--ui-text-secondary)' }}>No numeric metrics in current selection</div>
              <div style={{ fontSize: 12 }}>Clear filters or add quantitative sources to plot visual comparison bars.</div>
            </div>
          ) : (
            chartGroups.map(grp => (
              <div key={grp.group} className="sb-dt-chart-group">
                <div className="sb-dt-chart-head">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 650, fontSize: 12, color: 'var(--ui-text-primary)' }}>
                    <span className="sb-dt-dot" style={{ background: grp.color, width: 8, height: 8 }} />
                    {grp.label}
                  </span>
                  <span className="sb-mono" style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                    {grp.entries.length} benchmark{grp.entries.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {grp.entries.map((entry, eIdx) => {
                    const pct = Math.round(metricRatio(entry.metric) * 100)
                    return (
                      <div key={entry.row.id || eIdx} className="sb-dt-chart-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ui-text-primary)' }}>
                              {entry.title}
                            </span>
                            {entry.source ? (
                              <span style={{ fontSize: 11, color: 'var(--ui-text-tertiary)' }}>
                                {entry.source}
                              </span>
                            ) : null}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                            <span className="sb-mono" style={{ fontSize: 14, fontWeight: 750, color: grp.color }}>
                              {entry.metric.display}
                            </span>
                            {(entry.row.cites || []).map((cid, cIdx) => (
                              <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)}>
                                {cIdx + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sb-dt-bar-track" style={{ height: 8 }}>
                          <div className="sb-dt-bar-fill" style={{ width: `${pct}%`, background: grp.color }} />
                        </div>
                        {entry.detail ? (
                          <div style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)', lineHeight: 1.45 }}>
                            {entry.detail}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* Footer status */}
      <div className="sb-dt-footer">
        <span>
          Showing <strong className="sb-mono">{filtered.length}</strong> of <strong className="sb-mono">{rows.length}</strong> rows
          {sort.key ? ` | Sorted by ${cols.find(c => c.key === sort.key)?.label || sort.key} (${sort.dir})` : ''}
        </span>
        <span>{viewMode === 'table' ? 'Click any row to inspect full details' : `${meta.distinctSources} active sources`}</span>
      </div>
    </div>
  )
}
