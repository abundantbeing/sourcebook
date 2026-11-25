import { Icon } from '../../sdk.js'
import { copyText, downloadTextFile } from '../../api.js'
import { MarkdownBody } from '../MarkdownBody.jsx'

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button type="button" className="sb-btn" onClick={() => copyText(md)}>
          <Icon name="Copy" size={12} /> Copy Markdown
        </button>
        <button
          type="button"
          className="sb-btn"
          onClick={() => downloadTextFile(`${artifact.id || 'study-guide'}.md`, md, 'text/markdown;charset=utf-8')}
        >
          <Icon name="Download" size={12} /> Download .md
        </button>
      </div>
      <MarkdownBody text={md} citeIndexMap={citeMap} onOpenChunk={onOpenChunk} />
    </div>
  )
}
