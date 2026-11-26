import { useEffect, useState } from 'react'
import { Icon } from '../sdk.js'
import { api } from '../api.js'
import { HermesSpinner } from './DitherSurface.jsx'

const DECK_PURPOSES = [
  { id: 'auto', label: 'Auto' },
  { id: 'pitch', label: 'Pitch Deck' },
  { id: 'executive', label: 'Executive Brief' },
  { id: 'technical', label: 'Technical' },
  { id: 'editorial', label: 'Keynote' },
  { id: 'workshop', label: 'Workshop' }
]

const DECK_LENGTHS = [
  { id: 'short', label: 'Short', count: 6 },
  { id: 'default', label: 'Default', count: 10 },
  { id: 'extended', label: 'Extended', count: 14 }
]

const DECK_THEMES = [
  { id: 'keynote', label: 'Keynote' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'paper', label: 'Paper' }
]

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Chinese', 'Korean', 'Italian']

const SLIDE_LAYOUTS = ['title', 'stat', 'bento', 'comparison', 'timeline', 'two-col', 'bullets', 'quote', 'image-left', 'image-full', 'closing']

export function SlideDeckModal({
  open,
  nbId,
  sources,
  capabilities,
  initialFocus,
  initialArtifact,
  mode = 'create',
  onClose,
  onGenerate,
  onRevise
}) {
  const enabledSources = (sources || []).filter(s => s.enabled !== false)
  const [deckFormat, setDeckFormat] = useState('detailed')
  const [deckPurpose, setDeckPurpose] = useState('auto')
  const [theme, setTheme] = useState('keynote')
  const [language, setLanguage] = useState('English')
  const [lengthKey, setLengthKey] = useState('default')
  const [selectedSourceIds, setSelectedSourceIds] = useState([])
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [useImageGen, setUseImageGen] = useState(false)
  const [imageMode, setImageMode] = useState('full_slide')
  const [reviewOutline, setReviewOutline] = useState(false)

  // Step 2: Interactive Outline Editor
  const [step, setStep] = useState('config')
  const [loadingOutline, setLoadingOutline] = useState(false)
  const [outlineSlides, setOutlineSlides] = useState([])
  const [outlineTitle, setOutlineTitle] = useState('')
  const [outlineError, setOutlineError] = useState('')

  useEffect(() => {
    if (!open) return
    setStep('config')
    setOutlineError('')
    setSourcePickerOpen(false)
    const p = initialArtifact?.params || {}
    setDeckFormat(p.deck_format || 'detailed')
    setDeckPurpose(p.deck_purpose || 'auto')
    setTheme(initialArtifact?.spec?.theme || p.theme || 'keynote')
    setLanguage(p.language || 'English')
    const cnt = Number(p.count) || 10
    setLengthKey(cnt <= 6 ? 'short' : cnt >= 13 ? 'extended' : 'default')
    setInstructions(mode === 'revise' ? '' : (p.instructions || initialFocus || ''))
    const hasImgCap = Boolean(capabilities?.image_generate)
    setUseImageGen(p.include_images !== undefined ? Boolean(p.include_images) : hasImgCap)
    setImageMode(p.image_mode || 'full_slide')
    setReviewOutline(false)
    const baseSrcIds =
      Array.isArray(initialArtifact?.source_ids) && initialArtifact.source_ids.length > 0
        ? initialArtifact.source_ids
        : enabledSources.map(s => s.id)
    setSelectedSourceIds(baseSrcIds)
  }, [open, nbId, mode, initialArtifact?.id])

  if (!open) return null

  const lengthObj = DECK_LENGTHS.find(l => l.id === lengthKey) || DECK_LENGTHS[1]
  const hasImgGen = Boolean(capabilities?.image_generate)
  const imgProviderLabel = [capabilities?.image_gen_provider, capabilities?.image_gen_model].filter(Boolean).join(' · ')

  function toggleSource(sid) {
    setSelectedSourceIds(prev => (prev.includes(sid) ? prev.filter(id => id !== sid) : [...prev, sid]))
  }

  function buildParams(extra = {}) {
    const cleanPrompt = instructions.trim()
    return {
      deck_format: deckFormat,
      deck_purpose: deckPurpose,
      theme,
      language,
      count: lengthObj.count,
      focus: cleanPrompt || initialFocus || 'Executive presentation',
      instructions: cleanPrompt,
      include_images: Boolean(useImageGen),
      image_mode: useImageGen ? imageMode : 'none',
      max_images: useImageGen ? (imageMode === 'full_slide' ? lengthObj.count : Math.min(5, lengthObj.count)) : 0,
      source_ids: selectedSourceIds.length > 0 ? selectedSourceIds : enabledSources.map(s => s.id),
      ...extra
    }
  }

  async function handlePrimaryAction() {
    if (mode === 'revise') {
      if (!instructions.trim()) {
        setOutlineError('Describe what you would like to revise in this slide deck.')
        return
      }
      onRevise?.(initialArtifact.id, instructions.trim(), buildParams())
      onClose?.()
      return
    }

    if (reviewOutline && step === 'config') {
      setLoadingOutline(true)
      setOutlineError('')
      try {
        const params = buildParams()
        const res = await api(`/notebooks/${encodeURIComponent(nbId)}/slides/outline`, {
          method: 'POST',
          body: { params, source_ids: params.source_ids }
        })
        const slides = res?.outline?.slides || []
        setOutlineTitle(res?.outline?.title || params.focus)
        setOutlineSlides(slides)
        setStep('outline')
      } catch (err) {
        setOutlineError(err.message || 'Could not draft slide outline.')
      } finally {
        setLoadingOutline(false)
      }
      return
    }

    const params = buildParams(
      step === 'outline' && outlineSlides.length > 0
        ? { approved_outline: outlineSlides, count: outlineSlides.length, focus: outlineTitle || instructions.trim() || 'Slide Deck' }
        : {}
    )
    onGenerate?.(params)
    onClose?.()
  }

  function updateOutlineSlide(index, patch) {
    setOutlineSlides(prev => prev.map((sl, i) => (i === index ? { ...sl, ...patch } : sl)))
  }

  function moveOutlineSlide(index, delta) {
    setOutlineSlides(prev => {
      const next = [...prev]
      const target = index + delta
      if (target < 0 || target >= next.length) return prev
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  function removeOutlineSlide(index) {
    setOutlineSlides(prev => prev.filter((_, i) => i !== index))
  }

  function addOutlineSlide() {
    setOutlineSlides(prev => [
      ...prev,
      {
        id: `sl_${prev.length + 1}`,
        layout: 'two-col',
        title: 'New supporting slide takeaway',
        bullets: ['Key grounded point from sources'],
        notes: '',
        cites: []
      }
    ])
  }

  return (
    <div className="sb-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Customize Slide Deck">
      <div className="sb-modal sb-modal-wide" onClick={e => e.stopPropagation()}>
        <div className="sb-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="Presentation" size={16} style={{ color: 'var(--ui-accent)' }} />
            <span>
              {mode === 'revise'
                ? `Revise Slide Deck: ${initialArtifact?.title || ''}`
                : step === 'outline'
                  ? 'Review & Edit Slide Outline'
                  : 'Customize Slide Deck'}
            </span>
          </div>
          <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" onClick={onClose} aria-label="Close">
            <Icon name="X" size={14} />
          </button>
        </div>

        <div className="sb-modal-body sb-scroll" style={{ maxHeight: '72vh' }}>
          {outlineError ? (
            <div className="sb-error-bar" style={{ borderRadius: 8 }}>
              <span>{outlineError}</span>
            </div>
          ) : null}

          {step === 'outline' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <input
                  className="sb-input"
                  value={outlineTitle}
                  onChange={e => setOutlineTitle(e.target.value)}
                  placeholder="Slide deck title"
                  style={{ fontWeight: 650 }}
                />
                <button type="button" className="sb-btn" onClick={addOutlineSlide}>
                  <Icon name="Plus" size={12} /> Add slide
                </button>
              </div>
              {outlineSlides.map((sl, i) => (
                <div key={sl.id || i} className="sb-outline-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="sb-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--ui-accent)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <select
                        className="sb-select"
                        value={sl.layout || 'bullets'}
                        onChange={e => updateOutlineSlide(i, { layout: e.target.value })}
                        style={{ padding: '2px 6px', fontSize: 11 }}
                      >
                        {SLIDE_LAYOUTS.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" disabled={i === 0} onClick={() => moveOutlineSlide(i, -1)} title="Move up">
                        <Icon name="ChevronUp" size={12} />
                      </button>
                      <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon" disabled={i === outlineSlides.length - 1} onClick={() => moveOutlineSlide(i, 1)} title="Move down">
                        <Icon name="ChevronDown" size={12} />
                      </button>
                      <button type="button" className="sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger" disabled={outlineSlides.length <= 2} onClick={() => removeOutlineSlide(i)} title="Remove slide">
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </div>
                  <input
                    className="sb-input"
                    value={sl.title || ''}
                    onChange={e => updateOutlineSlide(i, { title: e.target.value })}
                    placeholder="Action title"
                    style={{ fontWeight: 600, fontSize: 12.5 }}
                  />
                  <textarea
                    className="sb-textarea"
                    rows={2}
                    value={(sl.bullets || []).join('\n')}
                    onChange={e => updateOutlineSlide(i, { bullets: e.target.value.split('\n').map(x => x.trim()).filter(Boolean) })}
                    placeholder="Key talking points (one per line)"
                    style={{ fontSize: 11.5 }}
                  />
                  {useImageGen ? (
                    <input
                      className="sb-input"
                      value={sl.image_prompt || ''}
                      onChange={e => updateOutlineSlide(i, { image_prompt: e.target.value })}
                      placeholder="Optional art direction / visual prompt for this slide..."
                      style={{ fontSize: 11 }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Format Cards (Detailed Deck vs Presenter Slides) */}
              <div>
                <div className="sb-label" style={{ marginBottom: 7 }}>Format</div>
                <div className="sb-sd-format-grid">
                  <button
                    type="button"
                    className="sb-sd-format-card"
                    data-active={deckFormat === 'detailed'}
                    onClick={() => setDeckFormat('detailed')}
                  >
                    <div className="sb-sd-format-head">
                      <strong>Detailed Deck</strong>
                      <span className="sb-sd-radio" data-checked={deckFormat === 'detailed'}>
                        {deckFormat === 'detailed' ? <Icon name="Check" size={11} /> : null}
                      </span>
                    </div>
                    <span>A comprehensive deck with full text, evidence cards, and details, ready for reading on its own.</span>
                  </button>
                  <button
                    type="button"
                    className="sb-sd-format-card"
                    data-active={deckFormat === 'presenter'}
                    onClick={() => setDeckFormat('presenter')}
                  >
                    <div className="sb-sd-format-head">
                      <strong>Presenter Slides</strong>
                      <span className="sb-sd-radio" data-checked={deckFormat === 'presenter'}>
                        {deckFormat === 'presenter' ? <Icon name="Check" size={11} /> : null}
                      </span>
                    </div>
                    <span>Clean, high-impact visual slides with concise talking points and rich speaker notes.</span>
                  </button>
                </div>
              </div>

              {/* Purpose & Visual Theme */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div className="sb-label" style={{ marginBottom: 6 }}>Deck style &amp; purpose</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {DECK_PURPOSES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="sb-btn"
                        data-active={deckPurpose === p.id}
                        onClick={() => setDeckPurpose(p.id)}
                        style={{ padding: '4px 10px', fontSize: 11.5 }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="sb-field" style={{ minWidth: 132 }}>
                  <span className="sb-label">Theme</span>
                  <select className="sb-select" value={theme} onChange={e => setTheme(e.target.value)}>
                    {DECK_THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Language + Length + Sources Picker Row */}
              <div className="sb-sd-controls-row">
                <label className="sb-field">
                  <span className="sb-label">Choose language</span>
                  <select className="sb-select" value={language} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </label>

                <div className="sb-field">
                  <span className="sb-label">Length</span>
                  <div className="sb-seg">
                    {DECK_LENGTHS.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        className="sb-seg-btn"
                        data-active={lengthKey === l.id}
                        onClick={() => setLengthKey(l.id)}
                      >
                        {l.label} ({l.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sb-field" style={{ position: 'relative' }}>
                  <span className="sb-label">Sources</span>
                  <button
                    type="button"
                    className="sb-btn"
                    onClick={() => setSourcePickerOpen(v => !v)}
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <span>
                      {selectedSourceIds.length} of {(sources || []).length} source{(sources || []).length === 1 ? '' : 's'}
                    </span>
                    <Icon name="ChevronDown" size={12} />
                  </button>
                </div>
              </div>

              {sourcePickerOpen ? (
                <div className="sb-sd-source-picker sb-scroll">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="sb-label">Select sources for this slide deck</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="sb-btn sb-btn-ghost" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => setSelectedSourceIds((sources || []).map(s => s.id))}>
                        All
                      </button>
                      <button type="button" className="sb-btn sb-btn-ghost" style={{ padding: '2px 7px', fontSize: 11 }} onClick={() => setSelectedSourceIds(enabledSources.map(s => s.id))}>
                        Active only
                      </button>
                    </div>
                  </div>
                  {(sources || []).map(src => {
                    const checked = selectedSourceIds.includes(src.id)
                    return (
                      <label key={src.id} className="sb-sd-source-row">
                        <input
                          type="checkbox"
                          className="sb-checkbox"
                          checked={checked}
                          onChange={() => toggleSource(src.id)}
                        />
                        <span className="sb-src-title" style={{ flex: 1 }}>{src.title}</span>
                        <span className="sb-mono" style={{ fontSize: 10.5, color: 'var(--ui-text-tertiary)' }}>
                          {src.chunk_count || 0} ch
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : null}

              {/* Custom Prompting Box */}
              <label className="sb-field">
                <span className="sb-label">
                  {mode === 'revise' ? 'Describe how you want to revise this deck' : 'Describe the slide deck you want to create'}
                </span>
                <textarea
                  className="sb-textarea"
                  rows={3}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder={
                    mode === 'revise'
                      ? 'Example: "Make slide 3 punchier with a bold metric callout, add a comparison slide for option A vs B, and tighten speaker notes for investors."'
                      : 'Add a high-level outline, or guide the audience, visual aesthetic, and focus: "Create an investor pitch deck in a dark blueprint aesthetic with architecture diagrams and crisp KPI callouts."'
                  }
                />
              </label>

              {/* Hermes Image Generation Toggle Card */}
              <div className="sb-sd-toggle-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 650, color: 'var(--ui-text-primary)' }}>
                      <Icon name="Sparkles" size={13} style={{ color: 'var(--ui-accent)' }} />
                      <span>Use Hermes Image Generation</span>
                      <span className="sb-kind-tag" style={{ fontSize: 10 }}>
                        {hasImgGen ? (imgProviderLabel || 'Hermes ImageGen Ready') : 'Optional'}
                      </span>
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                      {useImageGen
                        ? hasImgGen
                          ? 'Uses whatever image model is configured in your Hermes agent to generate custom visuals.'
                          : 'No imagegen provider detected in Hermes yet; will craft high-craft native vector slides until configured.'
                        : 'Crafts crisp editable native vector & data-viz slides (Stat Spotlight, Comparison, Timeline, Bento) for PowerPoint & PDF.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useImageGen}
                    className="sb-switch"
                    data-checked={useImageGen}
                    onClick={() => setUseImageGen(v => !v)}
                  >
                    <span className="sb-switch-thumb" />
                  </button>
                </div>

                {useImageGen ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 8, borderTop: '1px solid var(--ui-stroke-tertiary)' }}>
                    <span style={{ fontSize: 11.5, color: 'var(--ui-text-secondary)' }}>Visual rendering mode</span>
                    <div className="sb-seg" style={{ flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="sb-seg-btn"
                        data-active={imageMode === 'full_slide'}
                        onClick={() => setImageMode('full_slide')}
                      >
                        Full-Slide Art
                      </button>
                      <button
                        type="button"
                        className="sb-seg-btn"
                        data-active={imageMode === 'hybrid'}
                        onClick={() => setImageMode('hybrid')}
                      >
                        Hybrid (Editable Text + Art)
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Review Slide Outline Toggle (Create Mode) */}
              {mode !== 'revise' ? (
                <div className="sb-sd-toggle-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontSize: 12.5, color: 'var(--ui-text-primary)' }}>Review slide outline</strong>
                      <span style={{ fontSize: 11.5, color: 'var(--ui-text-tertiary)' }}>
                        Preview, edit, and reorder the slide outline before generating artwork and finalizing the deck.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={reviewOutline}
                      className="sb-switch"
                      data-checked={reviewOutline}
                      onClick={() => setReviewOutline(v => !v)}
                    >
                      <span className="sb-switch-thumb" />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="sb-modal-foot">
          {step === 'outline' ? (
            <button type="button" className="sb-btn" onClick={() => setStep('config')}>
              <Icon name="ArrowLeft" size={12} /> Back to settings
            </button>
          ) : (
            <button type="button" className="sb-btn" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="sb-btn sb-btn-primary"
            disabled={loadingOutline || selectedSourceIds.length === 0}
            onClick={handlePrimaryAction}
          >
            {loadingOutline ? (
              <>
                <HermesSpinner size={12} /> Drafting outline...
              </>
            ) : mode === 'revise' ? (
              'Revise deck'
            ) : reviewOutline && step === 'config' ? (
              'Review outline'
            ) : (
              'Generate now'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
