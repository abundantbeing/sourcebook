import { useMemo, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { copyText, downloadTextFile } from '../../api.js'

export function DataTableView({ artifact, onOpenChunk }) {
  const cols = artifact?.spec?.columns || []
  const rows = artifact?.spec?.rows || []
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? rows.filter(r =>
          Object.values(r.cells || {}).some(v => String(v ?? '').toLowerCase().includes(q))
        )
      : [...rows]
    if (sort.key) {
      list.sort((a, b) => {
        const av = a.cells?.[sort.key] ?? ''
        const bv = b.cells?.[sort.key] ?? ''
        const an = Number(av)
        const bn = Number(bv)
        const cmp = !Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== ''
          ? an - bn
          : String(av).localeCompare(String(bv))
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [rows, query, sort])

  if (!cols.length) {
    return <div className="sb-empty">No table columns available.</div>
  }

  function toggleSort(key) {
    setSort(prev => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  function toMarkdown() {
    const head = '| ' + cols.map(c => c.label || c.key).join(' | ') + ' |'
    const sep = '| ' + cols.map(() => '---').join(' | ') + ' |'
    const body = filtered.map(r => '| ' + cols.map(c => String(r.cells?.[c.key] ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |')
    return [head, sep, ...body].join('\n')
  }

  function exportCsv() {
    const out = [cols.map(c => c.label || c.key).concat('Citations')]
    for (const r of filtered) {
      out.push(cols.map(c => String(r.cells?.[c.key] ?? '')).concat((r.cites || []).join('; ')))
    }
    const csv = out.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadTextFile(`${artifact.id || 'table'}.csv`, csv, 'text/csv;charset=utf-8')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="sb-input"
          style={{ flex: 1, minWidth: 150 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter rows..."
        />
        <button
          type="button"
          className="sb-btn"
          onClick={async () => {
            await copyText(toMarkdown())
            sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied Markdown table.' })
          }}
        >
          <Icon name="Copy" size={12} /> Markdown
        </button>
        <button type="button" className="sb-btn" onClick={exportCsv}>
          <Icon name="Download" size={12} /> CSV
        </button>
      </div>

      <div className="sb-table-wrap sb-scroll" style={{ maxHeight: 420 }}>
        <table className="sb-table">
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label || c.key}{' '}
                  {sort.key === c.key ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th>Cite</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, rIdx) => (
              <tr key={r.id || rIdx}>
                {cols.map(c => (
                  <td key={c.key} className={c.type === 'number' ? 'sb-num' : undefined}>
                    {String(r.cells?.[c.key] ?? '')}
                  </td>
                ))}
                <td style={{ whiteSpace: 'nowrap' }}>
                  {(r.cites || []).map((cid, idx) => (
                    <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                      {idx + 1}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
