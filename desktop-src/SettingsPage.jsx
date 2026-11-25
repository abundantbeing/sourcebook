import { useEffect, useState } from 'react'
import { Icon, sdk } from './sdk.js'
import { api, copyText } from './api.js'
import { Styles } from './styles.js'
import { BrandMark } from './components/BrandMark.jsx'

export function SettingsPage() {
  const [caps, setCaps] = useState(null)
  const [modelsInfo, setModelsInfo] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([api('/capabilities'), api('/models').catch(() => null)])
      .then(([c, m]) => {
        if (!alive) return
        setCaps(c)
        setModelsInfo(m)
      })
      .catch(e => {
        if (alive) setErr(e.message || 'Could not reach SourceBook backend.')
      })
    return () => {
      alive = false
    }
  }, [])

  const activeModelStr = caps?.active_model?.model
    ? `${caps.active_model.model}${caps.active_model.provider ? ` (${caps.active_model.provider})` : ''}`
    : (caps?.llm ? 'Connected' : 'Local extractive fallback')

  const pdfStatus = caps?.pymupdf
    ? 'PyMuPDF active (text + scanned OCR)'
    : caps?.pdfplumber
      ? 'pdfplumber active'
      : caps?.pypdf
        ? 'pypdf active'
        : 'Optional (uv pip install pymupdf or pypdf)'

  const rows = [
    ['Active Hermes model', activeModelStr],
    ['Per-notebook model override', caps?.model_override_allowed ? 'Enabled for any Hermes model' : 'Using active Hermes / auxiliary task slots'],
    ['Retrieval engine', 'Hybrid semantic vector + SQLite FTS5 BM25 (RRF)'],
    ['Audio Overview TTS', caps?.edge_tts ? 'Edge Neural TTS active (2-host MP3)' : 'Transcript-only (install edge-tts for MP3)'],
    ['YouTube transcripts', caps?.youtube_transcript ? 'youtube-transcript-api active (timestamped)' : 'Optional (install youtube-transcript-api)'],
    ['Web search & extraction', caps?.web_extract ? 'Hermes web_extract active' : 'Built-in readability + discovery fallback'],
    ['PDF extractor', pdfStatus],
    ['DOCX extractor', caps?.python_docx ? 'python-docx active' : 'Built-in stdlib XML extractor'],
    ['Image generation', caps?.image_generate ? 'Available for Slides & Infographics' : 'Not configured']
  ]

  const setupCmd = (modelsInfo?.setup_commands || [
    'hermes config set plugins.entries.sourcebook.llm.allow_model_override true',
    'hermes config set plugins.entries.sourcebook.llm.allow_provider_override true'
  ]).join('\n')

  return (
    <div className="sb-root" style={{ height: 'auto', overflow: 'visible', background: 'transparent' }}>
      <Styles />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sb-brand-mark" style={{ width: 32, height: 32, borderRadius: 8 }}>
              <BrandMark size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 650, fontSize: 14 }}>SourceBook Research Notebooks</div>
              <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)', marginTop: 2 }}>
                Universal Hermes model routing, hybrid search, Claim Ledger contradictions, and 8 Studio formats including Audio Overviews.
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>Use any Hermes model per notebook</strong>
            <button
              type="button"
              className="sb-btn"
              onClick={async () => {
                await copyText(setupCmd)
                sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied Hermes config commands.' })
              }}
            >
              <Icon name="Copy" size={12} /> Copy commands
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ui-text-secondary)' }}>
            SourceBook automatically works with your active Hermes model or auxiliary task slots (<span className="sb-mono">sourcebook_chat</span>, <span className="sb-mono">sourcebook_studio</span>, <span className="sb-mono">sourcebook_audio</span>, <span className="sb-mono">sourcebook_ingest</span>). To pick any provider or model per notebook directly inside SourceBook, run:
          </div>
          <pre className="sb-mono sb-code-pre" style={{ borderRadius: 7, border: '1px solid var(--ui-stroke-tertiary)' }}>
            {setupCmd}
          </pre>
        </div>

        <div className="sb-ledger-row">
          <strong style={{ fontSize: 12 }}>Slash commands</strong>
          <div className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)', lineHeight: 1.7 }}>
            /sourcebook list<br />
            /sourcebook use &lt;nb_id&gt;<br />
            /sourcebook model &lt;nb_id&gt; &lt;provider/model|auto&gt;<br />
            /sourcebook sync &lt;nb_id&gt; &lt;local_path&gt;<br />
            /sourcebook add &lt;nb_id&gt; &lt;url or text&gt;<br />
            /sourcebook ask &lt;nb_id&gt; &lt;question&gt;<br />
            /sourcebook make &lt;nb_id&gt; &lt;kind&gt; [focus]
          </div>
        </div>
      </div>
    </div>
  )
}
