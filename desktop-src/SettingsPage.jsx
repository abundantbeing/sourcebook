import { useEffect, useState } from 'react'
import { Icon, sdk } from './sdk.js'
import { api } from './api.js'
import { Styles } from './styles.js'

export function SettingsPage() {
  const [caps, setCaps] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true
    api('/capabilities')
      .then(res => {
        if (alive) setCaps(res)
      })
      .catch(e => {
        if (alive) setErr(e.message || 'Could not reach Folio backend.')
      })
    return () => {
      alive = false
    }
  }, [])

  const rows = [
    ['Model provider', caps?.llm ? 'Connected' : 'Local extractive fallback'],
    ['Web extraction tool', caps?.web_extract ? 'Hermes web_extract active' : 'Built-in readability fallback'],
    ['PDF extractor (pypdf)', caps?.pypdf ? 'Installed' : 'Optional (install pypdf for PDF)'],
    ['DOCX extractor', caps?.python_docx ? 'python-docx active' : 'Built-in stdlib XML extractor'],
    ['Image generation', caps?.image_generate ? 'Available' : 'Not configured']
  ]

  return (
    <div className="fl-root" style={{ height: 'auto', overflow: 'visible', background: 'transparent' }}>
      <Styles />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 650, fontSize: 14 }}>Folio Research Notebooks</div>
            <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', marginTop: 2 }}>
              Source-grounded notebooks, Claim Ledger verification, Coverage Map, and 7 interactive Studio formats.
            </div>
          </div>
          <button type="button" className="fl-btn fl-btn-primary" onClick={() => sdk.host?.navigate?.('/folio')}>
            <Icon name="BookOpen" size={13} /> Open Folio
          </button>
        </div>

        {err ? <div className="fl-error-bar" style={{ margin: 0 }}>{err}</div> : null}

        <div className="fl-table-wrap">
          <table className="fl-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, status]) => (
                <tr key={label}>
                  <td style={{ fontWeight: 550 }}>{label}</td>
                  <td style={{ color: 'var(--ui-text-secondary)' }}>{caps ? status : 'Checking...'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="fl-ledger-row">
          <strong style={{ fontSize: 12 }}>Slash commands</strong>
          <div className="fl-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)', lineHeight: 1.7 }}>
            /folio list<br />
            /folio use &lt;nb_id&gt;<br />
            /folio add &lt;nb_id&gt; &lt;url or text&gt;<br />
            /folio ask &lt;nb_id&gt; &lt;question&gt;<br />
            /folio make &lt;nb_id&gt; &lt;kind&gt; [focus]
          </div>
        </div>
      </div>
    </div>
  )
}
