import { useEffect, useState } from 'react'
import { sdk } from './sdk.js'
import { api } from './api.js'
import { Styles } from './styles.js'
import { BrandMark } from './components/BrandMark.jsx'

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
        if (alive) setErr(e.message || 'Could not reach SourceBook backend.')
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
    <div className="sb-root" style={{ height: 'auto', overflow: 'visible', background: 'transparent' }}>
      <Styles />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sb-brand-mark" style={{ width: 32, height: 32, borderRadius: 8 }}>
              <BrandMark size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 650, fontSize: 14 }}>SourceBook Research Notebooks</div>
              <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', marginTop: 2 }}>
                Source-grounded notebooks, Claim Ledger verification, Coverage Map, and 7 interactive Studio formats.
              </div>
            </div>
          </div>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => sdk.host?.navigate?.('/sourcebook')}>
            <BrandMark size={13} accent="rgba(255,255,255,0.72)" /> Open SourceBook
          </button>
        </div>

        {err ? <div className="sb-error-bar" style={{ margin: 0 }}>{err}</div> : null}

        <div className="sb-table-wrap">
          <table className="sb-table">
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

        <div className="sb-ledger-row">
          <strong style={{ fontSize: 12 }}>Slash commands</strong>
          <div className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)', lineHeight: 1.7 }}>
            /sourcebook list<br />
            /sourcebook use &lt;nb_id&gt;<br />
            /sourcebook add &lt;nb_id&gt; &lt;url or text&gt;<br />
            /sourcebook ask &lt;nb_id&gt; &lt;question&gt;<br />
            /sourcebook make &lt;nb_id&gt; &lt;kind&gt; [focus]
          </div>
        </div>
      </div>
    </div>
  )
}
