import { Icon, sdk } from '../sdk.js'
import { copyText } from '../api.js'

const CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g
const CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/
const INLINE_TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g

function renderInlineFormatted(str, keyPrefix) {
  const parts = String(str || '').split(INLINE_TOKEN_RE)
  return parts.map((part, idx) => {
    if (!part) return null
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={`${keyPrefix}-c-${idx}`} className="sb-inline-code">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
      return <em key={`${keyPrefix}-i-${idx}`}>{part.slice(1, -1)}</em>
    }
    const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part)
    if (linkMatch) {
      return (
        <a
          key={`${keyPrefix}-a-${idx}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="sb-link"
        >
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

export function renderInlineCited(text, citeIndexMap, onOpenChunk) {
  const tokens = String(text || '').split(CITE_SPLIT_RE)
  return tokens.map((tok, tIdx) => {
    const m = CITE_EXTRACT_RE.exec(tok)
    if (m) {
      const cid = m[1]
      const num = citeIndexMap?.get?.(cid) ?? '?'
      return (
        <button
          key={`c-${tIdx}-${cid}`}
          type="button"
          className="sb-cite"
          title={`Inspect cited passage ${cid}`}
          onClick={() => onOpenChunk?.(cid)}
        >
          {num}
        </button>
      )
    }
    return renderInlineFormatted(tok, `t-${tIdx}`)
  })
}

function isTableRow(line) {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|') && t.length >= 3
}

function isTableSep(line) {
  return /^\|[\s:|\-]+\|$/.test(line.trim())
}

function splitTableCells(line) {
  return line.trim().slice(1, -1).split('|').map(c => c.trim())
}

export function MarkdownBody({ text, citeIndexMap, onOpenChunk }) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    // Fenced code block
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      const fence = trimmed.slice(0, 3)
      const lang = trimmed.slice(3).trim()
      const codeLines = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        codeLines.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      const codeText = codeLines.join('\n')
      blocks.push(
        <div key={`code-${i}`} className="sb-code-block">
          <div className="sb-code-head">
            <span className="sb-mono">{lang || 'code'}</span>
            <button
              type="button"
              className="sb-btn sb-btn-ghost"
              style={{ height: 22, padding: '0 7px', fontSize: 11 }}
              onClick={async () => {
                await copyText(codeText)
                sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied code snippet.' })
              }}
            >
              <Icon name="Copy" size={11} /> Copy
            </button>
          </div>
          <pre className="sb-mono sb-code-pre">{codeText}</pre>
        </div>
      )
      continue
    }

    // GFM Table
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headers = splitTableCells(trimmed)
      i += 2
      const rows = []
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitTableCells(lines[i]))
        i += 1
      }
      blocks.push(
        <div key={`tbl-${i}`} className="sb-table-wrap sb-scroll" style={{ margin: '6px 0' }}>
          <table className="sb-table">
            <thead>
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} style={{ cursor: 'default' }}>
                    {renderInlineCited(h, citeIndexMap, onOpenChunk)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {headers.map((_, cIdx) => (
                    <td key={cIdx}>{renderInlineCited(r[cIdx] || '', citeIndexMap, onOpenChunk)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const qLines = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        qLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      blocks.push(
        <blockquote key={`bq-${i}`} className="sb-quote-box" style={{ margin: '6px 0' }}>
          {renderInlineCited(qLines.join(' '), citeIndexMap, onOpenChunk)}
        </blockquote>
      )
      continue
    }

    // Unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''))
        i += 1
      }
      blocks.push(
        <ul key={`ul-${i}`}>
          {items.map((item, idx) => <li key={idx}>{renderInlineCited(item, citeIndexMap, onOpenChunk)}</li>)}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push(
        <ol key={`ol-${i}`} style={{ margin: '4px 0', paddingLeft: 20 }}>
          {items.map((item, idx) => <li key={idx}>{renderInlineCited(item, citeIndexMap, onOpenChunk)}</li>)}
        </ol>
      )
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(<h3 key={`h3-${i}`}>{renderInlineCited(trimmed.slice(4), citeIndexMap, onOpenChunk)}</h3>)
      i += 1
      continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(<h2 key={`h2-${i}`}>{renderInlineCited(trimmed.slice(3), citeIndexMap, onOpenChunk)}</h2>)
      i += 1
      continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(<h2 key={`h1-${i}`} style={{ fontSize: 16 }}>{renderInlineCited(trimmed.slice(2), citeIndexMap, onOpenChunk)}</h2>)
      i += 1
      continue
    }

    // Paragraph (coalesce contiguous plain lines)
    const para = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('~~~') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*+]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !isTableRow(lines[i].trim())
    ) {
      para.push(lines[i].trim())
      i += 1
    }
    blocks.push(<p key={`p-${i}`}>{renderInlineCited(para.join(' '), citeIndexMap, onOpenChunk)}</p>)
  }

  return <div className="sb-msg-body">{blocks}</div>
}
