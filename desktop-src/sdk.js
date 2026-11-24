// Single namespace import from @hermes/plugin-sdk so optional newer exports can be
// feature-detected cleanly without failing to load on slightly older Desktop builds.
import * as sdk from '@hermes/plugin-sdk'

export { sdk }

export function Icon({ name, size = 15, strokeWidth = 1.75, className = '', style }) {
  const icons = sdk.icons || {}
  const Comp = icons[name] || icons.FileText || icons.BookOpen
  if (!Comp) return null
  return <Comp size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />
}
