import { useEffect, useRef, useState } from 'react'
import { Icon, sdk } from '../../sdk.js'
import { api, copyText, downloadBinaryBase64, downloadTextFile, getContext, loadArtifactMediaDataUrl, pollJob } from '../../api.js'
import { DitherCanvas, HermesSpinner } from '../DitherSurface.jsx'

const EDITABLE_LAYOUTS = ['title', 'stat', 'bento', 'comparison', 'timeline', 'two-col', 'bullets', 'quote', 'image-left', 'image-full', 'section', 'closing']

const SLIDE_THEMES = {
  editorial: {
    label: 'Editorial',
    accent: 'var(--ui-accent)',
    secondary: '#10b981',
    bg: 'var(--sb-surface)',
    cardBg: 'color-mix(in srgb, var(--sb-bg) 72%, var(--sb-surface))',
    fg: 'var(--ui-text-primary)',
    muted: 'var(--ui-text-secondary)',
    dim: 'var(--ui-text-tertiary)',
    border: 'var(--ui-stroke-secondary)'
  },
  keynote: {
    label: 'Keynote',
    accent: '#38bdf8',
    secondary: '#6366f1',
    bg: 'linear-gradient(155deg, #0d1322 0%, #090d16 60%, #101729 100%)',
    cardBg: 'rgba(255, 255, 255, 0.045)',
    fg: '#f4f7fb',
    muted: '#a6b3c8',
    dim: '#6c7a93',
    border: 'rgba(148, 163, 184, 0.22)'
  },
  midnight: {
    label: 'Midnight',
    accent: '#10b981',
    secondary: '#14b8a6',
    bg: 'linear-gradient(160deg, #0b1110 0%, #0a0c0e 100%)',
    cardBg: 'rgba(16, 185, 129, 0.06)',
    fg: '#ecfdf5',
    muted: '#9cb5aa',
    dim: '#5e786e',
    border: 'rgba(16, 185, 129, 0.24)'
  },
  paper: {
    label: 'Paper',
    accent: '#2563eb',
    secondary: '#0d9488',
    bg: 'linear-gradient(180deg, #faf8f4 0%, #f3efe7 100%)',
    cardBg: 'rgba(24, 24, 27, 0.04)',
    fg: '#18181b',
    muted: '#52525b',
    dim: '#71717a',
    border: 'rgba(24, 24, 27, 0.14)'
  }
}

const LAYOUT_ACCENTS = {
  title: '#3b82f6',
  stat: '#10b981',
  bento: '#6366f1',
  comparison: '#f59e0b',
  timeline: '#06b6d4',
  'two-col': '#38bdf8',
  bullets: '#3b82f6',
  quote: '#f59e0b',
  'image-left': '#8b5cf6',
  'image-full': '#3b82f6',
  section: '#8b5cf6',
  closing: '#10b981'
}

function parsePct(val) {
  const m = String(val || '').trim().match(/^(\d+(?:\.\d+)?)\s*%$/)
  if (!m) return null
  const n = parseFloat(m[1])
  return Number.isFinite(n) ? Math.max(0.05, Math.min(1, n / 100)) : null
}

function normalizeThemeKey(t) {
  const k = String(t || 'editorial').toLowerCase()
  if (SLIDE_THEMES[k]) return k
  if (k === 'bold' || k === 'noir') return 'keynote'
  return 'editorial'
}

export function SlideDeckView({
  ctx,
  nbId,
  artifact,
  capabilities,
  autoPresent = false,
  onClearAutoPresent,
  onOpenChunk,
  onArtifactUpdated,
  onRequestRevise,
  onRequestRename,
  onRequestInspect,
  onRequestDelete
}) {
  const slides = artifact?.spec?.slides || []
  const [idx, setIdx] = useState(0)
  const [showNotes, setShowNotes] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [viewMode, setViewMode] = useState('stage')
  const [themeKey, setThemeKey] = useState(() => normalizeThemeKey(artifact?.spec?.theme || artifact?.params?.theme))
  const [elapsedSec, setElapsedSec] = useState(0)
  const [exportingFmt, setExportingFmt] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [showArtOverlay, setShowArtOverlay] = useState(false)
  const [mediaUrls, setMediaUrls] = useState({})
  const [editing, setEditing] = useState(false)
  const [savingSlide, setSavingSlide] = useState(false)
  const [regenBusy, setRegenBusy] = useState(false)
  const [regenStage, setRegenStage] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editLayout, setEditLayout] = useState('two-col')
  const [editBody, setEditBody] = useState('')
  const [editBullets, setEditBullets] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editImgPrompt, setEditImgPrompt] = useState('')
  const [editImgMode, setEditImgMode] = useState('full_slide')
  const cancelRegenRef = useRef(null)

  const mediaSignature = slides.map(s => s?.image_file || '').join('|')

  useEffect(() => {
    return () => cancelRegenRef.current?.()
  }, [])

  useEffect(() => {
    setIdx(0)
    setViewMode('stage')
    setMoreOpen(false)
    setEditing(false)
    setThemeKey(normalizeThemeKey(artifact?.spec?.theme || artifact?.params?.theme))
    if (autoPresent) {
      setPresenting(true)
      onClearAutoPresent?.()
    } else {
      setPresenting(false)
    }
  }, [artifact?.id, autoPresent])

  // Sync inline editor fields whenever active slide changes
  useEffect(() => {
    const cur = slides[idx]
    if (!cur) return
    setEditTitle(cur.title || '')
    setEditLayout(cur.layout || 'two-col')
    setEditBody(cur.body || '')
    setEditBullets((cur.bullets || []).join('\n'))
    setEditNotes(cur.notes || '')
    setEditImgPrompt(cur.image_prompt || '')
    setEditImgMode(cur.image_mode || (cur.image_file || cur.image_url ? 'full_slide' : 'full_slide'))
  }, [idx, artifact?.id, artifact?.updated])

  // Load any locally cached Hermes ImageGen media files cleanly through plugin host (tracks revision filenames!)
  useEffect(() => {
    if (!nbId || !artifact?.id || !slides.length) return undefined
    let alive = true
    const files = slides.map(s => s.image_file).filter(Boolean)
    if (!files.length) return undefined
    Promise.all(
      files.map(async fname => {
        try {
          const dataUrl = await loadArtifactMediaDataUrl(nbId, artifact.id, fname)
          return [fname, dataUrl]
        } catch {
          return [fname, null]
        }
      })
    ).then(entries => {
      if (!alive) return
      const next = {}
      entries.forEach(([k, v]) => {
        if (v) next[k] = v
      })
      setMediaUrls(prev => ({ ...prev, ...next }))
    })
    return () => {
      alive = false
    }
  }, [nbId, artifact?.id, mediaSignature])

  useEffect(() => {
    if (!presenting) {
      setElapsedSec(0)
      return undefined
    }
    const ctx = getContext()
    if (ctx && typeof ctx.setInterval === 'function') {
      return ctx.setInterval(() => setElapsedSec(s => s + 1), 1000)
    }
    return undefined
  }, [presenting])

  if (!slides.length) {
    return <div className="sb-empty">No slides in this deck.</div>
  }

  const sl = slides[idx] || slides[0]
  const nextSl = slides[idx + 1] || null
  const theme = SLIDE_THEMES[themeKey] || SLIDE_THEMES.editorial
  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
  const secs = String(elapsedSec % 60).padStart(2, '0')

  function resolveSlideImage(slide) {
    if (slide?.image_file && mediaUrls[slide.image_file]) return mediaUrls[slide.image_file]
    if (slide?.image_url && /^(data:|https?:)/.test(String(slide.image_url))) return slide.image_url
    return null
  }

  function toMarp() {
    const lines = ['---', 'marp: true', `title: ${artifact?.spec?.title || 'SourceBook Deck'}`, 'paginate: true', '---', '']
    slides.forEach((s, i) => {
      if (i > 0) lines.push('\n---\n')
      lines.push(`# ${s.title || ''}\n`)
      if (s.stat?.value) lines.push(`## ${s.stat.value}\n${s.stat.label || ''}\n`)
      if (s.image_url) lines.push(`![${s.title || 'Slide illustration'}](${s.image_url})\n`)
      ;(s.bullets || []).forEach(b => lines.push(`- ${b}`))
      if (s.body) lines.push(`\n${s.body}`)
      if (s.notes) lines.push(`\n<!--\n${s.notes}\n-->`)
    })
    return lines.join('\n')
  }

  async function downloadBinaryDeck(fmt) {
    if (!nbId || !artifact?.id || exportingFmt) return
    setExportingFmt(fmt)
    setMoreOpen(false)
    try {
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-binary?fmt=${encodeURIComponent(fmt)}&theme=${encodeURIComponent(themeKey)}`
      )
      if (res?.b64) {
        downloadBinaryBase64(
          res.filename || `${artifact.id}.${fmt}`,
          res.b64,
          res.media_type || (fmt === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf')
        )
        sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: `Downloaded ${res.filename || fmt.toUpperCase()}.` })
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || `Could not export ${fmt.toUpperCase()}.` })
    } finally {
      setExportingFmt('')
    }
  }

  async function downloadHtmlDeck() {
    if (!nbId || !artifact?.id) return
    setMoreOpen(false)
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-payload?fmt=html`)
      if (res?.content) {
        downloadTextFile(res.filename || `${artifact.id}.deck.html`, res.content, res.media_type || 'text/html;charset=utf-8')
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not export HTML deck.' })
    }
  }

  async function saveSlideEdit(extraPatch = {}) {
    if (!nbId || !artifact?.id || savingSlide) return
    setSavingSlide(true)
    try {
      const payload = {
        action: 'edit',
        title: editTitle.trim() || sl.title || 'Untitled slide',
        layout: editLayout,
        body: editBody.trim(),
        bullets: editBullets.split('\n').map(s => s.trim()).filter(Boolean),
        notes: editNotes.trim(),
        image_prompt: editImgPrompt.trim(),
        image_mode: editImgMode,
        ...extraPatch
      }
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}`,
        { method: 'PATCH', body: payload }
      )
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact)
        if (typeof res.active_index === 'number') setIdx(res.active_index)
      }
      sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: `Saved Slide ${idx + 1}.` })
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not update slide.' })
    } finally {
      setSavingSlide(false)
    }
  }

  async function mutateSlideStructure(action, extra = {}) {
    if (!nbId || !artifact?.id || savingSlide) return
    setSavingSlide(true)
    try {
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}`,
        { method: 'PATCH', body: { action, ...extra } }
      )
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact)
        if (typeof res.active_index === 'number') setIdx(res.active_index)
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || `Slide ${action} failed.` })
    } finally {
      setSavingSlide(false)
    }
  }

  async function regenerateCurrentSlideVisual(overrideMode) {
    if (!nbId || !artifact?.id || regenBusy) return
    setRegenBusy(true)
    const providerTxt = [capabilities?.image_gen_provider, capabilities?.image_gen_model].filter(Boolean).join(' · ') || 'Hermes ImageGen'
    setRegenStage(`Regenerating Slide ${idx + 1} visual via ${providerTxt}...`)
    try {
      const targetMode = overrideMode || (editImgMode === 'none' ? 'full_slide' : editImgMode) || 'full_slide'
      const { job } = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}/regenerate-visual`,
        {
          method: 'POST',
          body: {
            prompt: editImgPrompt.trim() || undefined,
            image_mode: targetMode
          }
        }
      )
      const pollCtx = ctx || getContext()
      cancelRegenRef.current?.()
      cancelRegenRef.current = pollJob(
        pollCtx,
        job,
        j => setRegenStage(j.stage || `Rendering Slide ${idx + 1}...`),
        result => {
          setRegenBusy(false)
          setRegenStage('')
          if (result?.artifact) {
            onArtifactUpdated?.(result.artifact)
          }
          sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: `Regenerated artwork for Slide ${idx + 1}.` })
        },
        err => {
          setRegenBusy(false)
          setRegenStage('')
          sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not regenerate slide visual.' })
        }
      )
    } catch (err) {
      setRegenBusy(false)
      setRegenStage('')
      sdk.host?.notify?.({ kind: 'error', title: 'SourceBook', message: err.message || 'Could not start visual regeneration.' })
    }
  }

  function renderSlideBody(slide, large) {
    const layout = slide.layout || 'bullets'
    const bullets = slide.bullets || []
    const columns = slide.columns || []
    const steps = slide.steps || []
    const statVal = slide.stat?.value
    const pct = statVal ? parsePct(statVal) : null
    const imgSrc = resolveSlideImage(slide)

    // Full-Bleed Notebook-style Generated Slide Artwork
    if (imgSrc && (slide.image_mode === 'full_slide' || layout === 'image-full')) {
      return (
        <div className="sb-sl-full-art">
          <img
            src={imgSrc}
            alt={slide.title || 'Generated slide'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 8 }}
          />
          {showArtOverlay ? (
            <div className="sb-sl-art-overlay">
              <div style={{ fontWeight: 700, fontSize: large ? 19 : 15, color: '#fff' }}>{slide.title}</div>
              {bullets.length > 0 ? (
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: large ? 13 : 11.5, color: '#e2e8f0' }}>
                  {bullets.slice(0, 4).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      )
    }

    // Dramatic Keynote Cover Slide
    if (layout === 'title' || layout === 'section') {
      if (imgSrc) {
        return (
          <div className="sb-sl-hybrid-split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
              <div className="sb-sl-eyebrow" style={{ color: theme.accent, borderColor: theme.border, background: theme.cardBg, alignSelf: 'flex-start' }}>
                <span className="sb-dt-dot" style={{ background: theme.accent }} />
                <span>{layout === 'title' ? 'SOURCEBOOK PRESENTATION' : 'SECTION BREAK'}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: large ? 34 : 26, fontWeight: 780, lineHeight: 1.15, letterSpacing: '-0.025em', color: theme.fg }}>
                {slide.title}
              </h2>
              <div style={{ width: 64, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }} />
              {slide.body ? (
                <p style={{ margin: 0, fontSize: large ? 15.5 : 13.5, color: theme.muted, lineHeight: 1.5 }}>{slide.body}</p>
              ) : null}
            </div>
            <div className="sb-sl-hybrid-art" style={{ borderColor: theme.border }}>
              <img src={imgSrc} alt={slide.title || 'Slide artwork'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        )
      }
      return (
        <div className="sb-sl-cover">
          <div
            className="sb-sl-eyebrow"
            style={{ color: theme.accent, borderColor: theme.border, background: theme.cardBg }}
          >
            <span className="sb-dt-dot" style={{ background: theme.accent }} />
            <span>{layout === 'title' ? 'SOURCEBOOK BRIEFING DECK' : 'SECTION BREAK'}</span>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: large ? 40 : 30,
              fontWeight: 780,
              lineHeight: 1.14,
              letterSpacing: '-0.025em',
              color: theme.fg,
              maxWidth: '24ch'
            }}
          >
            {slide.title}
          </h2>
          <div
            style={{
              width: 72,
              height: 3,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`
            }}
          />
          {slide.body ? (
            <p style={{ margin: 0, fontSize: large ? 17 : 14.5, color: theme.muted, maxWidth: '52ch', lineHeight: 1.55 }}>
              {slide.body}
            </p>
          ) : null}
        </div>
      )
    }

    // Asymmetric Stat Spotlight Slide with Radial Ring Gauge
    if (layout === 'stat' && statVal) {
      const r = 46
      const circ = 2 * Math.PI * r
      const dash = circ * (pct ?? 0.78)
      return (
        <div className="sb-sl-stat-split">
          <div className="sb-sl-stat-hero" style={{ background: theme.cardBg, borderColor: theme.border }}>
            <DitherCanvas
              variant="mesh"
              animated={false}
              color={theme.accent}
              secondaryColor={theme.secondary}
              opacity={0.22}
              cols={96}
              rows={36}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg width={large ? 136 : 112} height={large ? 136 : 112} viewBox="0 0 116 116" aria-hidden="true">
                <circle cx="58" cy="58" r={r} fill="none" stroke={theme.border} strokeWidth="8" />
                <circle
                  cx="58"
                  cy="58"
                  r={r}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`}
                  transform="rotate(-90 58 58)"
                />
                <text
                  x="58"
                  y="64"
                  textAnchor="middle"
                  fill={theme.accent}
                  fontSize={String(statVal).length >= 5 ? '20' : '26'}
                  fontWeight="800"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {statVal}
                </text>
              </svg>
              {slide.stat.label ? (
                <div style={{ fontSize: large ? 13 : 11.5, fontWeight: 600, color: theme.muted, textAlign: 'center', maxWidth: 200 }}>
                  {slide.stat.label}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: large ? 25 : 20, fontWeight: 720, lineHeight: 1.24, letterSpacing: '-0.02em', color: theme.fg }}>
              {slide.title}
            </h2>
            {bullets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((b, bIdx) => (
                  <div
                    key={bIdx}
                    className="sb-sl-point"
                    style={{ background: theme.cardBg, borderColor: theme.border, color: theme.fg }}
                  >
                    <span className="sb-mono sb-sl-step" style={{ color: theme.accent }}>
                      0{bIdx + 1}
                    </span>
                    <span style={{ fontSize: large ? 14 : 12.5, lineHeight: 1.48, color: theme.muted }}>{b}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    // Side-by-Side Comparison Slide
    if (layout === 'comparison' && columns.length >= 2) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBlock: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: large ? 27 : 21, fontWeight: 730, lineHeight: 1.22, letterSpacing: '-0.02em', color: theme.fg }}>
            {slide.title}
          </h2>
          <div className="sb-sl-comparison">
            {columns.slice(0, 2).map((col, cIdx) => {
              const colAcc = cIdx === 0 ? theme.accent : theme.secondary
              return (
                <div
                  key={cIdx}
                  className="sb-sl-comp-col"
                  style={{ background: theme.cardBg, borderColor: theme.border, borderTopColor: colAcc }}
                >
                  <div className="sb-mono" style={{ fontSize: 11.5, fontWeight: 750, letterSpacing: '0.06em', textTransform: 'uppercase', color: colAcc }}>
                    {col.heading || `Column ${cIdx + 1}`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(col.points || []).slice(0, 5).map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: large ? 14 : 12.5, color: theme.fg, lineHeight: 1.45 }}>
                        <span className="sb-dt-dot" style={{ background: colAcc, marginTop: 6 }} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Horizontal Connected Timeline Slide
    if (layout === 'timeline' && steps.length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBlock: 'auto' }}>
          <h2 style={{ margin: 0, fontSize: large ? 27 : 21, fontWeight: 730, lineHeight: 1.22, letterSpacing: '-0.02em', color: theme.fg }}>
            {slide.title}
          </h2>
          <div className="sb-sl-timeline" style={{ gridTemplateColumns: `repeat(${Math.min(4, steps.length)}, minmax(0, 1fr))` }}>
            {steps.slice(0, 4).map((st, sIdx) => {
              const sAcc = sIdx % 2 === 0 ? theme.accent : theme.secondary
              return (
                <div key={sIdx} className="sb-sl-step-card" style={{ background: theme.cardBg, borderColor: theme.border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="sb-mono sb-sl-step-pill" style={{ background: sAcc, color: '#fff' }}>
                      0{sIdx + 1}
                    </span>
                    <div style={{ flex: 1, height: 1.5, background: theme.border }} />
                  </div>
                  <strong style={{ fontSize: large ? 14.5 : 13, color: theme.fg, lineHeight: 1.3 }}>
                    {st.label || st.title || `Phase ${sIdx + 1}`}
                  </strong>
                  <span style={{ fontSize: large ? 13 : 11.5, color: theme.muted, lineHeight: 1.45 }}>
                    {st.detail || st.summary || ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Editorial Pull-Quote Slide
    if (layout === 'quote') {
      return (
        <div className="sb-sl-quote-wrap">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.accent }}>
            {slide.title}
          </div>
          <blockquote
            style={{
              margin: 0,
              padding: '12px 0 12px 24px',
              borderLeft: `3.5px solid ${theme.accent}`,
              fontSize: large ? 28 : 22,
              fontWeight: 550,
              lineHeight: 1.38,
              color: theme.fg,
              maxWidth: '46ch'
            }}
          >
            "{slide.body || bullets[0] || slide.title}"
          </blockquote>
        </div>
      )
    }

    // Hybrid Illustrated Split Slide (Editable Text Left + Hermes Generated Visual Right!)
    if (imgSrc) {
      return (
        <div className="sb-sl-hybrid-split">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: large ? 25 : 19.5, fontWeight: 730, lineHeight: 1.22, letterSpacing: '-0.02em', color: theme.fg }}>
              {slide.title}
            </h2>
            {slide.body ? (
              <p style={{ margin: 0, fontSize: large ? 14 : 12.5, color: theme.muted, lineHeight: 1.5 }}>{slide.body}</p>
            ) : null}
            {bullets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {bullets.slice(0, 4).map((b, bIdx) => (
                  <div key={bIdx} className="sb-sl-point" style={{ background: theme.cardBg, borderColor: theme.border }}>
                    <span className="sb-mono sb-sl-step" style={{ color: bIdx % 2 === 0 ? theme.accent : theme.secondary }}>
                      0{bIdx + 1}
                    </span>
                    <span style={{ fontSize: large ? 13.5 : 12, color: theme.fg, lineHeight: 1.45 }}>{b}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="sb-sl-hybrid-art" style={{ borderColor: theme.border }}>
            <img src={imgSrc} alt={slide.title || 'Slide illustration'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )
    }

    // Closing Executive Recap Slide
    if (layout === 'closing') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBlock: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="sb-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: theme.secondary }}>
              KEY TAKEAWAYS
            </span>
            <h2 style={{ margin: 0, fontSize: large ? 30 : 23, fontWeight: 750, lineHeight: 1.2, letterSpacing: '-0.02em', color: theme.fg }}>
              {slide.title}
            </h2>
          </div>
          {bullets.length > 0 ? (
            <div className="sb-sl-cards-grid" style={{ gridTemplateColumns: bullets.length >= 3 ? 'repeat(2, minmax(0, 1fr))' : '1fr' }}>
              {bullets.map((b, bIdx) => (
                <div
                  key={bIdx}
                  className="sb-sl-card"
                  style={{ background: theme.cardBg, borderColor: theme.border, borderTopColor: bIdx % 2 === 0 ? theme.accent : theme.secondary }}
                >
                  <span className="sb-mono" style={{ fontSize: 10, fontWeight: 700, color: bIdx % 2 === 0 ? theme.accent : theme.secondary }}>
                    SOURCE 0{bIdx + 1}
                  </span>
                  <span style={{ fontSize: large ? 14 : 12.5, color: theme.fg, lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )
    }

    // Modular Bento / Two-Col / Bullets Evidence Cards
    const useTwoCol = layout === 'two-col' || layout === 'bento' || bullets.length >= 3
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBlock: 'auto' }}>
        <h2
          style={{
            margin: 0,
            fontSize: large ? 27 : 21,
            fontWeight: 730,
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
            color: theme.fg
          }}
        >
          {slide.title}
        </h2>
        {slide.body ? (
          <p style={{ margin: 0, fontSize: large ? 15 : 13, color: theme.muted, lineHeight: 1.55 }}>{slide.body}</p>
        ) : null}
        {bullets.length > 0 ? (
          <div
            className="sb-sl-cards-grid"
            style={{ gridTemplateColumns: useTwoCol ? 'repeat(2, minmax(0, 1fr))' : '1fr' }}
          >
            {bullets.map((b, bIdx) => (
              <div
                key={bIdx}
                className="sb-sl-card"
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border,
                  borderLeft: `2.5px solid ${bIdx % 2 === 0 ? theme.accent : theme.secondary}`
                }}
              >
                <span className="sb-mono" style={{ fontSize: 10, fontWeight: 700, color: bIdx % 2 === 0 ? theme.accent : theme.secondary }}>
                  0{bIdx + 1}
                </span>
                <span style={{ fontSize: large ? 14.5 : 12.5, lineHeight: 1.48, color: theme.fg }}>{b}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  function renderSlideCard(slide, slideIdx, large = false) {
    const layout = slide.layout || 'bullets'
    const imgSrc = resolveSlideImage(slide)
    const isFullArt = Boolean(imgSrc && (slide.image_mode === 'full_slide' || layout === 'image-full'))
    const isHero = layout === 'title' || layout === 'closing' || layout === 'section'
    return (
      <section
        className="sb-slide-stage sb-slide-stage-rich"
        style={{
          background: theme.bg,
          borderColor: theme.border,
          color: theme.fg,
          ...(isFullArt ? { padding: 0, gap: 0 } : large ? { maxWidth: 1020, width: '100%', padding: '36px 44px' } : {})
        }}
      >
        {!isFullArt ? (
          <>
            <div
              className="sb-sl-top-ribbon"
              style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }}
            />
            {isHero ? (
              <DitherCanvas
                variant="aurora"
                animated={presenting}
                color={theme.accent}
                secondaryColor={theme.secondary}
                opacity={themeKey === 'paper' ? 0.14 : 0.24}
                cols={160}
                rows={28}
                style={{ position: 'absolute', inset: '0 0 auto 0', width: '100%', height: 110, pointerEvents: 'none' }}
              />
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <span
                className="sb-kind-tag"
                style={{ background: theme.cardBg, borderColor: theme.border, color: theme.muted }}
              >
                {layout}
              </span>
              <span className="sb-mono" style={{ fontSize: 11, color: theme.dim }}>
                {String(slideIdx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          </>
        ) : null}

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          {renderSlideBody(slide, large)}
        </div>

        {!isFullArt ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {(slide.cites || []).map((cid, cIdx) => (
                <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                  {cIdx + 1}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: theme.dim }}>{artifact?.spec?.title || 'SourceBook Deck'}</span>
          </div>
        ) : (
          <div className="sb-sl-full-art-bar">
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {(slide.cites || []).map((cid, cIdx) => (
                <button key={cid} type="button" className="sb-cite" onClick={() => onOpenChunk?.(cid)} title={`Inspect ${cid}`}>
                  {cIdx + 1}
                </button>
              ))}
            </div>
            <button type="button" className="sb-btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setShowArtOverlay(v => !v)}>
              {showArtOverlay ? 'Hide text overlay' : 'Source text'}
            </button>
          </div>
        )}
      </section>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 11 }}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') setIdx(i => Math.min(slides.length - 1, i + 1))
        if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
        if (e.key === 'Escape' && presenting) setPresenting(false)
      }}
    >
      {/* Presentation Studio Toolbar */}
      <div className="sb-inf-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button type="button" className="sb-btn sb-btn-icon" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>
              <Icon name="ChevronLeft" size={13} />
            </button>
            <span className="sb-mono" style={{ fontSize: 12, color: 'var(--ui-text-secondary)', padding: '0 4px' }}>
              {idx + 1} / {slides.length}
            </span>
            <button type="button" className="sb-btn sb-btn-icon" disabled={idx >= slides.length - 1} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>
              <Icon name="ChevronRight" size={13} />
            </button>
          </div>

          <div className="sb-seg" role="group" aria-label="Deck view">
            <button type="button" className="sb-seg-btn" data-active={viewMode === 'stage'} onClick={() => setViewMode('stage')}>
              Stage
            </button>
            <button type="button" className="sb-seg-btn" data-active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              Overview
            </button>
          </div>

          <select
            className="sb-select"
            value={themeKey}
            onChange={e => setThemeKey(e.target.value)}
            aria-label="Presentation theme"
            title="Switch slide deck visual theme"
          >
            {Object.entries(SLIDE_THEMES).map(([k, t]) => (
              <option key={k} value={k}>
                Theme: {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', position: 'relative' }}>
          <button type="button" className="sb-btn sb-btn-primary" onClick={() => setPresenting(true)} title="Start full-window slideshow">
            <Icon name="Play" size={12} /> Slideshow
          </button>
          <button
            type="button"
            className="sb-btn"
            disabled={Boolean(exportingFmt)}
            onClick={() => downloadBinaryDeck('pptx')}
            title="Download native PowerPoint (.pptx)"
          >
            {exportingFmt === 'pptx' ? <HermesSpinner size={12} /> : <Icon name="Download" size={12} />} PPTX
          </button>
          <button
            type="button"
            className="sb-btn"
            disabled={Boolean(exportingFmt)}
            onClick={() => downloadBinaryDeck('pdf')}
            title="Download 16:9 PDF Document (.pdf)"
          >
            {exportingFmt === 'pdf' ? <HermesSpinner size={12} /> : <Icon name="FileText" size={12} />} PDF
          </button>
          <button
            type="button"
            className="sb-btn"
            data-active={editing}
            onClick={() => setEditing(v => !v)}
            title="Edit this slide's title, layout, bullets, notes, or visual prompt inline"
          >
            <Icon name="Edit3" size={12} /> {editing ? 'Close Edit' : 'Edit Slide'}
          </button>
          <button
            type="button"
            className="sb-btn"
            disabled={regenBusy}
            onClick={() => regenerateCurrentSlideVisual()}
            title={
              capabilities?.image_generate
                ? `Regenerate artwork for Slide ${idx + 1} via ${[capabilities.image_gen_provider, capabilities.image_gen_model].filter(Boolean).join(' · ')}`
                : 'Regenerate artwork for this slide using Hermes ImageGen'
            }
          >
            {regenBusy ? <HermesSpinner size={12} /> : <Icon name="Wand2" size={12} />} Regen Visual
          </button>
          {onRequestRevise ? (
            <button type="button" className="sb-btn" onClick={() => onRequestRevise(artifact)} title="Revise this entire slide deck with AI instructions">
              <Icon name="Sparkles" size={12} /> Revise Deck
            </button>
          ) : null}
          <button
            type="button"
            className="sb-btn sb-btn-icon"
            data-active={moreOpen}
            onClick={() => setMoreOpen(v => !v)}
            title="More slide deck actions"
            aria-label="More slide deck actions"
          >
            <Icon name="MoreVertical" size={13} />
          </button>

          {moreOpen ? (
            <div className="sb-art-menu" style={{ top: 'calc(100% + 6px)', right: 0 }}>
              <button type="button" className="sb-art-menu-item" onClick={() => { setMoreOpen(false); setShowNotes(v => !v) }}>
                <Icon name="FileText" size={13} /> {showNotes ? 'Hide speaker notes' : 'Show speaker notes'}
              </button>
              <button type="button" className="sb-art-menu-item" onClick={() => downloadBinaryDeck('pdf')}>
                <Icon name="Download" size={13} /> Download PDF Document (.pdf)
              </button>
              <button type="button" className="sb-art-menu-item" onClick={() => downloadBinaryDeck('pptx')}>
                <Icon name="Presentation" size={13} /> Download PowerPoint (.pptx)
              </button>
              <button type="button" className="sb-art-menu-item" onClick={() => { setMoreOpen(false); setPresenting(true) }}>
                <Icon name="Play" size={13} /> Start slideshow
              </button>
              {onRequestRevise ? (
                <button type="button" className="sb-art-menu-item" onClick={() => { setMoreOpen(false); onRequestRevise(artifact) }}>
                  <Icon name="Sparkles" size={13} /> Revise
                </button>
              ) : null}
              {onRequestRename ? (
                <button type="button" className="sb-art-menu-item" onClick={() => { setMoreOpen(false); onRequestRename(artifact) }}>
                  <Icon name="Edit3" size={13} /> Rename
                </button>
              ) : null}
              {onRequestInspect ? (
                <button type="button" className="sb-art-menu-item" onClick={() => { setMoreOpen(false); onRequestInspect(artifact) }}>
                  <Icon name="Info" size={13} /> View prompt and sources
                </button>
              ) : null}
              <div className="sb-art-menu-sep" />
              <button type="button" className="sb-art-menu-item" onClick={downloadHtmlDeck}>
                <Icon name="Code" size={13} /> Download HTML Deck (.html)
              </button>
              <button
                type="button"
                className="sb-art-menu-item"
                onClick={() => {
                  setMoreOpen(false)
                  copyText(toMarp())
                  sdk.host?.notify?.({ kind: 'success', title: 'SourceBook', message: 'Copied Marp deck Markdown.' })
                }}
              >
                <Icon name="Copy" size={13} /> Copy Marp Markdown
              </button>
              {onRequestDelete ? (
                <>
                  <div className="sb-art-menu-sep" />
                  <button type="button" className="sb-art-menu-item sb-art-menu-danger" onClick={() => { setMoreOpen(false); onRequestDelete(artifact.id) }}>
                    <Icon name="Trash2" size={13} /> Delete
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {regenBusy ? (
        <div className="sb-sl-regen-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HermesSpinner size={13} />
            <span>{regenStage || `Regenerating Slide ${idx + 1} visual...`}</span>
          </div>
          <span className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-text-tertiary)' }}>
            Slide {idx + 1} / {slides.length}
          </span>
        </div>
      ) : null}

      {artifact?.grounding?.image_notice ? (
        <div className="sb-quote-box" style={{ fontSize: 11.5 }}>
          {artifact.grounding.image_notice}
        </div>
      ) : null}

      {viewMode === 'grid' ? (
        <div className="sb-sl-overview-grid">
          {slides.map((s, sIdx) => {
            const lColor = LAYOUT_ACCENTS[s.layout] || 'var(--ui-accent)'
            const thumbImg = resolveSlideImage(s)
            return (
              <button
                key={sIdx}
                type="button"
                className="sb-sl-overview-card"
                data-active={sIdx === idx}
                onClick={() => {
                  setIdx(sIdx)
                  setViewMode('stage')
                }}
              >
                {thumbImg ? (
                  <img
                    src={thumbImg}
                    alt={s.title || `Slide ${sIdx + 1}`}
                    style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 6, marginBottom: 6 }}
                  />
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="sb-mono" style={{ fontSize: 10.5, fontWeight: 700, color: lColor }}>
                    {String(sIdx + 1).padStart(2, '0')} · {String(s.layout || 'slide').toUpperCase()}
                  </span>
                  {s.stat?.value ? (
                    <span className="sb-mono" style={{ fontSize: 12, fontWeight: 800, color: lColor }}>
                      {s.stat.value}
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ui-text-primary)', lineHeight: 1.32, textAlign: 'left' }}>
                  {s.title}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <>
          {renderSlideCard(sl, idx, false)}

          {editing ? (
            <div className="sb-sl-editor">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="Edit3" size={13} style={{ color: 'var(--ui-accent)' }} />
                  <strong style={{ fontSize: 12.5 }}>Inline Slide Editor · Slide {idx + 1}</strong>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={savingSlide || idx === 0}
                    onClick={() => mutateSlideStructure('move', { delta: -1 })}
                    title="Move slide left"
                  >
                    <Icon name="ChevronLeft" size={12} /> Move Left
                  </button>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={savingSlide || idx >= slides.length - 1}
                    onClick={() => mutateSlideStructure('move', { delta: 1 })}
                    title="Move slide right"
                  >
                    Move Right <Icon name="ChevronRight" size={12} />
                  </button>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={savingSlide}
                    onClick={() => mutateSlideStructure('add')}
                    title="Insert new slide after this one"
                  >
                    <Icon name="Plus" size={12} /> Add Slide
                  </button>
                  <button
                    type="button"
                    className="sb-btn sb-btn-danger"
                    disabled={savingSlide || slides.length <= 1}
                    onClick={() => mutateSlideStructure('delete')}
                    title="Delete this slide"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              </div>

              <div className="sb-sl-editor-grid">
                <label className="sb-field">
                  <span className="sb-label">Action title</span>
                  <input className="sb-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label className="sb-field">
                    <span className="sb-label">Layout</span>
                    <select className="sb-select" value={editLayout} onChange={e => setEditLayout(e.target.value)}>
                      {EDITABLE_LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                  <label className="sb-field">
                    <span className="sb-label">Visual mode</span>
                    <select className="sb-select" value={editImgMode} onChange={e => setEditImgMode(e.target.value)}>
                      <option value="full_slide">Full-Slide Art</option>
                      <option value="hybrid">Hybrid (Text + Art)</option>
                      <option value="none">Native Vector Only</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="sb-sl-editor-grid">
                <label className="sb-field">
                  <span className="sb-label">Bullets (one per line)</span>
                  <textarea className="sb-textarea" rows={3} value={editBullets} onChange={e => setEditBullets(e.target.value)} />
                </label>
                <label className="sb-field">
                  <span className="sb-label">Speaker notes</span>
                  <textarea className="sb-textarea" rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                </label>
              </div>

              <label className="sb-field">
                <span className="sb-label">
                  Visual art direction prompt (used when clicking Regenerate Visual)
                  {capabilities?.image_generate ? (
                    <span className="sb-mono" style={{ marginLeft: 8, fontSize: 10.5, color: 'var(--ui-accent)' }}>
                      {[capabilities.image_gen_provider, capabilities.image_gen_model].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                </span>
                <input
                  className="sb-input"
                  value={editImgPrompt}
                  onChange={e => setEditImgPrompt(e.target.value)}
                  placeholder='Example: "Tactile Swiss cutaway technical plate on matte obsidian showing hybrid retrieval prisms..."'
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="sb-btn"
                    disabled={regenBusy}
                    onClick={() => regenerateCurrentSlideVisual(editImgMode === 'none' ? 'full_slide' : editImgMode)}
                  >
                    {regenBusy ? <HermesSpinner size={12} /> : <Icon name="Wand2" size={12} />} Regenerate This Slide's Visual
                  </button>
                  {(sl.image_file || sl.image_url) ? (
                    <button
                      type="button"
                      className="sb-btn sb-btn-ghost"
                      disabled={savingSlide}
                      onClick={() => saveSlideEdit({ clear_image: true, image_mode: 'none' })}
                    >
                      Remove visual
                    </button>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="sb-btn" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="button" className="sb-btn sb-btn-primary" disabled={savingSlide} onClick={() => saveSlideEdit()}>
                    {savingSlide ? 'Saving...' : 'Save Slide'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {showNotes && sl.notes ? (
            <div className="sb-quote-box">
              <strong style={{ display: 'block', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--ui-text-tertiary)', marginBottom: 3 }}>
                SPEAKER NOTES
              </strong>
              {sl.notes}
            </div>
          ) : null}

          <div className="sb-slide-strip sb-scroll">
            {slides.map((s, sIdx) => {
              const lColor = LAYOUT_ACCENTS[s.layout] || 'var(--ui-accent)'
              return (
                <button
                  key={sIdx}
                  type="button"
                  className="sb-slide-thumb"
                  data-active={sIdx === idx}
                  onClick={() => setIdx(sIdx)}
                >
                  <div style={{ height: 2.5, borderRadius: 2, background: sIdx === idx ? lColor : 'var(--ui-stroke-tertiary)', marginBottom: 6 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="sb-mono" style={{ fontSize: 10, color: sIdx === idx ? lColor : 'var(--ui-text-tertiary)', fontWeight: 700 }}>
                      {String(sIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="sb-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--ui-text-tertiary)' }}>
                      {s.stat?.value || s.layout || 'slide'}
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 580, marginTop: 4, color: 'var(--ui-text-primary)' }}>
                    {s.title}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {presenting ? (
        <div
          className="sb-modal-backdrop"
          style={{ flexDirection: 'column', gap: 14, padding: 24, zIndex: 80 }}
          onClick={() => setPresenting(false)}
        >
          <div
            style={{ width: 'min(1040px, 95vw)', display: 'flex', flexDirection: 'column', gap: 12 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="sb-kind-tag">Slideshow</span>
                <span className="sb-mono" style={{ fontSize: 12.5, color: 'var(--ui-text-secondary)' }}>{mins}:{secs}</span>
                <span className="sb-mono" style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                  Slide {idx + 1} of {slides.length}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="sb-btn" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>Prev</button>
                <button type="button" className="sb-btn" disabled={idx >= slides.length - 1} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>Next</button>
                <button type="button" className="sb-btn" onClick={() => setPresenting(false)}>
                  <Icon name="X" size={13} /> Exit
                </button>
              </div>
            </div>
            {renderSlideCard(sl, idx, true)}
            <div style={{ display: 'grid', gridTemplateColumns: nextSl ? '1.6fr 1fr' : '1fr', gap: 10 }}>
              {sl.notes ? (
                <div className="sb-quote-box" style={{ background: 'var(--sb-surface)' }}>
                  <strong style={{ display: 'block', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--ui-text-tertiary)', marginBottom: 3 }}>SPEAKER NOTES</strong>
                  {sl.notes}
                </div>
              ) : <div />}
              {nextSl ? (
                <div className="sb-ledger-row" style={{ gap: 4, cursor: 'pointer' }} onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}>
                  <span className="sb-mono" style={{ fontSize: 10, color: 'var(--ui-text-tertiary)', letterSpacing: '0.06em' }}>UP NEXT</span>
                  <strong style={{ fontSize: 12.5, color: 'var(--ui-text-primary)' }}>{nextSl.title}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
