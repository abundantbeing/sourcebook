// Namespace-scoped REST client, profile/connection/epoch scoping, and SVG CSS color baker.
// All backend calls go strictly through ctx.rest('/...') -> /api/plugins/sourcebook/*.
import { sdk } from './sdk.js'

let activeCtx = null

export function bindContext(ctx) {
  activeCtx = ctx
}

export function getContext() {
  return activeCtx
}

export function currentScopeKey() {
  const host = sdk.host || {}
  const conn = host.state?.connectionId?.get?.() ?? 'local'
  const prof = host.state?.profile?.get?.() ?? 'default'
  return `${conn}::${prof}`
}

export function currentEpoch() {
  return typeof sdk.gatewayActivationEpoch === 'function' ? sdk.gatewayActivationEpoch() : 0
}

export async function api(path, opts = {}) {
  if (!activeCtx || typeof activeCtx.rest !== 'function') {
    throw new Error('SourceBook backend connection is not ready yet.')
  }
  return activeCtx.rest(path, opts)
}

export async function uploadFile(nbId, file) {
  if (!activeCtx || typeof activeCtx.rest !== 'function') {
    throw new Error('SourceBook backend connection is not ready yet.')
  }
  const bytes = await file.arrayBuffer()
  return activeCtx.rest(`/notebooks/${encodeURIComponent(nbId)}/sources/upload`, {
    method: 'POST',
    upload: {
      filename: file.name || 'upload.txt',
      contentType: file.type || 'application/octet-stream',
      bytes
    },
    timeoutMs: 90000
  })
}

export function pollJob(ctx, jobId, onUpdate, onDone, onError) {
  let cancelled = false
  let clearTimer = null
  const startScope = currentScopeKey()
  const startEpoch = currentEpoch()

  const tick = async () => {
    if (cancelled) return
    if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) {
      cancelled = true
      return
    }
    try {
      const job = await api(`/jobs/${encodeURIComponent(jobId)}`)
      if (cancelled) return
      if (job.status === 'done') {
        onDone?.(job.result, job)
        return
      }
      if (job.status === 'error') {
        onError?.(new Error(job.error || 'Background job failed'))
        return
      }
      onUpdate?.(job)
      clearTimer = ctx.setTimeout(tick, 420)
    } catch (err) {
      if (!cancelled) onError?.(err)
    }
  }

  clearTimer = ctx.setTimeout(tick, 220)
  return () => {
    cancelled = true
    clearTimer?.()
  }
}

export async function copyText(text) {
  if (typeof sdk.writeClipboardText === 'function') {
    return sdk.writeClipboardText(String(text ?? ''))
  }
  if (activeCtx?.os?.writeClipboard) {
    return activeCtx.os.writeClipboard(String(text ?? ''))
  }
  return false
}

export function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  if (activeCtx && typeof activeCtx.setTimeout === 'function') {
    activeCtx.setTimeout(() => URL.revokeObjectURL(url), 1000)
  } else {
    URL.revokeObjectURL(url)
  }
}

// Resolve modern CSS colors (including var(--ui-*) and color-mix(...)) to concrete sRGB hex
// via an offscreen 1x1 Canvas2D context so copied/downloaded SVGs render standalone anywhere.
export function resolveCssColor(expr, scopeEl) {
  const fallback = '#6b7280'
  if (!expr) return fallback
  try {
    const target = scopeEl || document.documentElement
    const cs = getComputedStyle(target)
    const resolved = String(expr).replace(/var\((--[a-zA-Z0-9_-]+)(?:,\s*([^)]+))?\)/g, (_m, name, fb) => {
      const val = cs.getPropertyValue(name).trim()
      return val || (fb ? fb.trim() : fallback)
    })
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const c2d = canvas.getContext('2d')
    if (!c2d) return resolved || fallback
    c2d.fillStyle = fallback
    c2d.fillStyle = resolved
    c2d.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = c2d.getImageData(0, 0, 1, 1).data
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
    if (a < 255) {
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
    }
    return hex
  } catch {
    return fallback
  }
}

export function bakeSvgVariables(svgEl) {
  if (!svgEl) return ''
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const bg = resolveCssColor('var(--ui-bg-chrome)', svgEl)
  const bg2 = resolveCssColor('var(--ui-bg-elevated)', svgEl)
  const sidebar = resolveCssColor('var(--ui-bg-sidebar)', svgEl)
  const subtle = resolveCssColor('var(--ui-bg-quinary, var(--ui-bg-quaternary))', svgEl)
  const fg = resolveCssColor('var(--ui-text-primary)', svgEl)
  const muted = resolveCssColor('var(--ui-text-secondary)', svgEl)
  const dim = resolveCssColor('var(--ui-text-tertiary)', svgEl)
  const stroke = resolveCssColor('var(--ui-stroke-secondary)', svgEl)
  const strokeSub = resolveCssColor('var(--ui-stroke-tertiary)', svgEl)
  const accent = resolveCssColor('var(--ui-accent)', svgEl)
  const accentSoft = resolveCssColor('color-mix(in srgb, var(--ui-accent) 16%, var(--ui-bg-elevated))', svgEl)
  const ok = resolveCssColor('var(--sb-ok, #2da44e)', svgEl)
  const warn = resolveCssColor('var(--sb-warn, #d29922)', svgEl)
  const bad = resolveCssColor('var(--sb-bad, #cf222e)', svgEl)
  const replacements = [
    [/var\(--sb-bg[^)]*\)/g, bg],
    [/var\(--sb-surface[^)]*\)/g, bg2],
    [/var\(--sb-sidebar[^)]*\)/g, sidebar],
    [/var\(--sb-subtle[^)]*\)/g, subtle],
    [/var\(--sb-hover[^)]*\)/g, subtle],
    [/var\(--ui-bg-chrome[^)]*\)/g, bg],
    [/var\(--ui-bg-elevated[^)]*\)/g, bg2],
    [/var\(--ui-bg-sidebar[^)]*\)/g, sidebar],
    [/var\(--ui-bg-primary[^)]*\)/g, bg],
    [/var\(--ui-bg-secondary[^)]*\)/g, bg2],
    [/var\(--ui-text-primary[^)]*\)/g, fg],
    [/var\(--ui-text-secondary[^)]*\)/g, muted],
    [/var\(--ui-text-tertiary[^)]*\)/g, dim],
    [/var\(--ui-text-quaternary[^)]*\)/g, dim],
    [/var\(--ui-stroke-secondary[^)]*\)/g, stroke],
    [/var\(--ui-stroke-tertiary[^)]*\)/g, strokeSub],
    [/var\(--sb-accent-soft[^)]*\)/g, accentSoft],
    [/var\(--sb-accent-border[^)]*\)/g, accent],
    [/var\(--ui-accent[^)]*\)/g, accent],
    [/var\(--sb-ok[^)]*\)/g, ok],
    [/var\(--sb-warn[^)]*\)/g, warn],
    [/var\(--sb-bad[^)]*\)/g, bad]
  ]
  let markup = new XMLSerializer().serializeToString(clone)
  for (const [re, val] of replacements) {
    markup = markup.replace(re, val)
  }
  return markup
}

export function downloadSvgAsPng(svgEl, filename, scale = 2) {
  return new Promise((resolve, reject) => {
    try {
      const svgText = bakeSvgVariables(svgEl)
      if (!svgText) {
        resolve(false)
        return
      }
      const vb = svgEl.viewBox?.baseVal
      const w = Math.max(1, Math.round((vb && vb.width) || svgEl.clientWidth || 920))
      const h = Math.max(1, Math.round((vb && vb.height) || svgEl.clientHeight || 640))
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = w * scale
          canvas.height = h * scale
          const c2d = canvas.getContext('2d')
          if (!c2d) {
            URL.revokeObjectURL(url)
            resolve(false)
            return
          }
          c2d.scale(scale, scale)
          c2d.drawImage(img, 0, 0, w, h)
          URL.revokeObjectURL(url)
          canvas.toBlob(pngBlob => {
            if (!pngBlob) {
              resolve(false)
              return
            }
            const dlUrl = URL.createObjectURL(pngBlob)
            const a = document.createElement('a')
            a.href = dlUrl
            a.download = filename.endsWith('.png') ? filename : `${filename}.png`
            a.click()
            if (activeCtx && typeof activeCtx.setTimeout === 'function') {
              activeCtx.setTimeout(() => URL.revokeObjectURL(dlUrl), 1200)
            } else {
              URL.revokeObjectURL(dlUrl)
            }
            resolve(true)
          }, 'image/png')
        } catch (err) {
          URL.revokeObjectURL(url)
          reject(err)
        }
      }
      img.onerror = err => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    } catch (err) {
      reject(err)
    }
  })
}
