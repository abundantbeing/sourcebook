import { useEffect, useRef } from 'react'
import { sdk } from '../sdk.js'
import { resolveCssColor } from '../api.js'

// 4x4 Bayer ordered dithering threshold matrix normalized to [0, 1)
const BAYER_4X4 = [
  0 / 16, 8 / 16, 2 / 16, 10 / 16,
  12 / 16, 4 / 16, 14 / 16, 6 / 16,
  3 / 16, 11 / 16, 1 / 16, 9 / 16,
  15 / 16, 7 / 16, 13 / 16, 5 / 16
]

function parseRgb(colorStr) {
  const m = String(colorStr || '').match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
  if (m) {
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
  }
  const r = String(colorStr || '').match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (r) {
    return [Number(r[1]), Number(r[2]), Number(r[3])]
  }
  return [59, 130, 246]
}

function prefersReducedMotion() {
  try {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * Lightweight 1-bit ordered Bayer 4x4 dither surface inspired by dithercn & Paper Shaders.
 * Draws onto a low-res logical pixel grid scaled crisply with `image-rendering: pixelated`
 * (<0.2ms/frame). When `animated` is true, drives at 10fps through Hermes's budgeted loop
 * (auto-pauses when hidden/unfocused/reduced-motion); when false, paints one crisp static frame.
 */
export function DitherCanvas({
  variant = 'aurora',
  animated = false,
  color = 'var(--ui-accent)',
  secondaryColor = '#10b981',
  opacity = 0.28,
  cell = 3,
  cols = 148,
  rows = 32,
  className = '',
  style
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    canvas.width = cols
    canvas.height = rows
    const c2d = canvas.getContext('2d')
    if (!c2d) return undefined

    const img = c2d.createImageData(cols, rows)
    const data = img.data

    const readPalette = () => {
      const c1 = parseRgb(resolveCssColor(color, canvas))
      const c2 = parseRgb(resolveCssColor(secondaryColor, canvas))
      return [c1, c2]
    }
    let [rgbA, rgbB] = readPalette()

    const paint = timeMs => {
      const t = timeMs * 0.00055
      for (let y = 0; y < rows; y += 1) {
        const ny = y / Math.max(1, rows - 1)
        const bRow = (y & 3) * 4
        for (let x = 0; x < cols; x += 1) {
          const nx = x / Math.max(1, cols - 1)
          let field = 0
          let blend = nx

          if (variant === 'wave') {
            // Dual-voice subtle harmonic waveform envelope
            const w1 = Math.sin(nx * 10.5 + t * 2.2) * 0.24 + Math.sin(nx * 23.0 - t * 1.4) * 0.11
            const w2 = Math.cos(nx * 7.5 - t * 1.7) * 0.20
            const env = Math.sin(nx * Math.PI)
            const center = 0.5 + (w1 + w2) * env
            const dist = Math.abs(ny - center)
            field = Math.max(0, 1 - dist * 3.1) * (0.35 + 0.65 * env)
            blend = 0.5 + 0.5 * Math.sin(nx * 6.0 + t)
          } else if (variant === 'mesh') {
            // Subtle architectural corner radial dither sheen
            const dx = nx - 0.14
            const dy = ny - 0.12
            const r = Math.sqrt(dx * dx * 0.65 + dy * dy * 1.8)
            const ripple = 0.06 * Math.sin(nx * 8.0 + t)
            field = Math.max(0, (1 - r * 1.25 + ripple) * (1 - ny * 0.82))
            blend = nx * 0.75
          } else {
            // Flowing Bayer aurora curtains fading downward cleanly
            const c1 = Math.sin(nx * 5.2 + t * 1.1) * 0.5 + 0.5
            const c2 = Math.sin(nx * 11.4 - t * 0.8 + 1.3) * 0.5 + 0.5
            const verticalFade = Math.pow(Math.max(0, 1 - ny), 1.35)
            field = (c1 * 0.55 + c2 * 0.45) * verticalFade * 0.92
            blend = c1
          }

          const threshold = BAYER_4X4[bRow + (x & 3)]
          const idx = (y * cols + x) * 4
          if (field > threshold) {
            const useB = blend > 0.58
            const rgb = useB ? rgbB : rgbA
            data[idx] = rgb[0]
            data[idx + 1] = rgb[1]
            data[idx + 2] = rgb[2]
            data[idx + 3] = Math.round(255 * Math.min(1, 0.55 + field * 0.45))
          } else {
            data[idx + 3] = 0
          }
        }
      }
      c2d.putImageData(img, 0, 0)
    }

    // Always paint an immediate first frame (works even when static / reduced motion)
    paint(1400)

    if (!animated || prefersReducedMotion() || typeof sdk.createBudgetedLoop !== 'function') {
      return undefined
    }

    const loop = sdk.createBudgetedLoop(
      now => {
        paint(now)
      },
      {
        fps: 10,
        pauseWhenUnfocused: true
      }
    )

    return () => {
      loop?.dispose?.()
    }
  }, [variant, animated, color, secondaryColor, cols, rows])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ? `sb-dither-canvas ${className}` : 'sb-dither-canvas'}
      style={{
        opacity,
        imageRendering: 'pixelated',
        ...style
      }}
      data-cell={cell}
    />
  )
}

/**
 * Native Hermes Unicode glyph spinner when available, degrading cleanly to a subtle dot.
 */
export function HermesSpinner({ size = 12, className = '' }) {
  const GlyphSpinner = sdk.GlyphSpinner
  if (typeof GlyphSpinner === 'function') {
    return <GlyphSpinner spinner="breathe" className={className} style={{ fontSize: size, lineHeight: 1 }} />
  }
  return <span className="sb-dt-dot" style={{ background: 'var(--ui-accent)', width: 7, height: 7 }} aria-hidden="true" />
}
