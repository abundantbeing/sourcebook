// Single namespace import from @hermes/plugin-sdk so optional newer exports can be
// feature-detected cleanly without failing to load on slightly older Desktop builds.
import * as sdk from '@hermes/plugin-sdk'

export { sdk }

// Aliases mapping requested icon names to actual keys exported by Hermes Desktop's sdk.icons
const SDK_ALIASES = {
  Headphones: 'AudioLines',
  ArrowLeft: 'ChevronLeft',
  Maximize2: 'Maximize',
  Presentation: 'MonitorPlay'
}

// Minimal crisp 24x24 stroke glyphs for icons not exported in Hermes Desktop's curated sdk.icons set
const LOCAL_GLYPHS = {
  X: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  Minus: <path d="M5 12h14" />,
  Minimize2: <><path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="m14 10 7-7" /><path d="m3 21 7-7" /></>,
  PanelLeft: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /></>,
  MessageSquare: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  ShieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></>,
  BookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
  Library: <><path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" /></>,
  StickyNote: <><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" /><path d="M15 3v4a2 2 0 0 0 2 2h4" /></>,
  FilePlus: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M9 15h6" /><path d="M12 18v-6" /></>,
  BookmarkPlus: <><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /><path d="M12 7v6" /><path d="M9 10h6" /></>,
  Layers: <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m2 12 10 4.5L22 12" /><path d="m2 17 10 4.5L22 17" /></>,
  CheckSquare: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 12 2 2 4-4" /></>,
  LayoutGrid: <><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>,
  Table: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /></>,
  Shuffle: <><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" /><path d="m18 2 4 4-4 4" /><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" /><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" /><path d="m18 14 4 4-4 4" /></>,
  RotateCcw: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  BarChart2: <><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></>,
  Columns3: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /></>,
  Filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  ImageDown: <><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  List: <><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></>,
  ArrowUp: <><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></>,
  ArrowDown: <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  ArrowUpDown: <><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></>,
  ChevronRight: <path d="m9 18 6-6-6-6" />,
  ChevronDown: <path d="m6 9 6 6 6-6" />,
  FileJson: <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" /><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" /></>
}

export function Icon({ name, size = 15, strokeWidth = 1.75, className = '', style }) {
  const icons = sdk.icons || {}
  const resolved = SDK_ALIASES[name] || name
  const Comp = icons[resolved]
  if (Comp) {
    return <Comp size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />
  }
  const glyph = LOCAL_GLYPHS[name]
  if (glyph) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ display: 'inline-block', flexShrink: 0, ...style }}
        aria-hidden="true"
      >
        {glyph}
      </svg>
    )
  }
  const Fallback = icons.FileText || icons.BookOpen
  if (!Fallback) return null
  return <Fallback size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />
}
