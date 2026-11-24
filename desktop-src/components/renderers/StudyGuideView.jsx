import { Icon } from '../../sdk.js'
import { copyText, downloadTextFile } from '../../api.js'

const CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g
const CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/

export function StudyGuideView({ artifact, onOpenChunk }) {
  const md = String(artifact?.spec?.markdown || '')
  const citeOrder = []
  const citeMap = new Map()
  md.replace(/\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]/g, (_m, cid) => {
    if (!citeMap.has(cid)) {
      citeOrder.push(cid)
      citeMap.set(cid, citeOrder.length)
    }
    return _m
  })

  function renderLine(text) {
    return text.split(CITE_SPLIT_RE).map((tok, idx) => {
      const m = CITE_EXTRACT_RE.exec(tok)
      if (m) {
        const cid = m[1]
        return (
          <button key={idx} type="button" className="fl-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
            {citeMap.get(cid)}
          </button>
        )
      }
      const parts = tok.split(/(\*\*[^*]+\*\*)/g)
      return parts.map((p, pIdx) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4
          ? <strong key={`${idx}-${pIdx}`}>{p.slice(2, -2)}</strong>
          : p
      )
    })
  }

  const blocks = md.split(/\n{2,}/).filter(b => b.trim())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button type="button" className="fl-btn" onClick={() => copyText(md)}>
          <Icon name="Copy" size={12} /> Copy Markdown
        </button>
        <button
          type="button"
          className="fl-btn"
          onClick={() => downloadTextFile(`${artifact.id || 'study-guide'}.md`, md, 'text/markdown;charset=utf-8')}
        >
          <Icon name="Download" size={12} /> Download .md
        </button>
      </div>
      <div className="fl-msg-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.map((block, bIdx) => {
          const t = block.trim()
          if (t.startsWith('# ')) return <h2 key={bIdx} style={{ fontSize: 16, margin: '4px 0' }}>{renderLine(t.slice(2))}</h2>
          if (t.startsWith('## ')) return <h3 key={bIdx} style={{ fontSize: 13.5, margin: '8px 0 2px' }}>{renderLine(t.slice(3))}</h3>
          if (t.startsWith('### ')) return <h3 key={bIdx} style={{ fontSize: 12.5, margin: '6px 0 2px' }}>{renderLine(t.slice(4))}</h3>
          const lines = t.split('\n')
          if (lines.every(l => /^\s*[-*+]\s+/.test(l))) {
            return (
              <ul key={bIdx} style={{ margin: 0, paddingLeft: 18 }}>
                {lines.map((l, lIdx) => <li key={lIdx}>{renderLine(l.replace(/^\s*[-*+]\s+/, ''))}</li>)}
              </ul>
            )
          }
          return <p key={bIdx}>{renderLine(t)}</p>
        })}
      </div>
    </div>
  )
}
