export function BrandMark({ size = 16, accent = 'var(--ui-accent, #3b82f6)', className = '', style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <polygon points="59,10 74,10 74,34 66.5,26.5 59,34" fill={accent} />
      <polygon points="79.5,10 100,10 100,37.5 79.5,48.5" fill="currentColor" />
      <polygon points="47,10 53.5,10 53.5,30.5 44.5,30.5 100,70.5 100,95 24,22" fill="currentColor" />
      <polygon points="20,24.5 95.5,97.5 72.5,110 48,110 20,90 20,82.5 36.5,73.5 58,89 74.5,89 20,50" fill="currentColor" />
    </svg>
  )
}
