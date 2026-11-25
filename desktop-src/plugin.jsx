// SourceBook: source-grounded research notebooks and interactive Studio for Hermes Desktop.
import { sdk } from './sdk.js'
import { bindContext } from './api.js'
import { SourceBookWorkspace } from './SourceBookWorkspace.jsx'
import { SettingsPage } from './SettingsPage.jsx'
import { BrandMark } from './components/BrandMark.jsx'

const ROUTE = '/sourcebook'

function StatusChip({ externalState }) {
  const state = typeof sdk.useValue === 'function' && externalState ? sdk.useValue(externalState) : null
  if (!state?.title) return null
  return (
    <button
      type="button"
      className="sb-status-chip"
      onClick={() => sdk.host?.navigate?.(ROUTE)}
      title={`Open SourceBook: ${state.title}`}
    >
      <BrandMark size={13} />
      <span>{state.title}</span>
      {state.dueCards > 0 ? <span className="sb-mono">({state.dueCards} due)</span> : null}
    </button>
  )
}

function CiteDirective({ props, externalState }) {
  const nb = props?.nb || ''
  const chunk = props?.chunk || ''
  return (
    <button
      type="button"
      className="sb-cite-card"
      onClick={() => {
        if (externalState) {
          externalState.set({ ...externalState.get(), pendingJump: { nb, chunk } })
        }
        sdk.host?.navigate?.(ROUTE)
      }}
    >
      <BrandMark size={14} />
      <span>SourceBook source</span>
      {chunk ? <span className="sb-mono">{chunk}</span> : null}
    </button>
  )
}

export default {
  id: 'sourcebook',
  name: 'SourceBook',
  description: 'Source-grounded research notebooks, Claim Ledger, Coverage Map, and 8-format interactive Studio.',
  register(ctx) {
    bindContext(ctx)
    const externalState = typeof sdk.atom === 'function' ? sdk.atom({ title: '', dueCards: 0, nbId: '', pendingJump: null }) : null

    ctx.register({
      id: 'page',
      area: sdk.ROUTES_AREA,
      data: { path: ROUTE },
      render: () => <SourceBookWorkspace ctx={ctx} externalState={externalState} />
    })

    ctx.register({
      id: 'nav',
      area: sdk.SIDEBAR_NAV_AREA,
      data: { path: ROUTE, label: 'SourceBook', codicon: 'book' }
    })

    if (sdk.PALETTE_AREA) {
      ctx.register({
        id: 'open',
        area: sdk.PALETTE_AREA,
        data: {
          id: 'sourcebook.open',
          label: 'SourceBook: Open research notebooks',
          keywords: ['sourcebook', 'notebook', 'research', 'studio', 'flashcards', 'mindmap', 'citations'],
          run: () => sdk.host?.navigate?.(ROUTE)
        }
      })
    }

    if (sdk.STATUSBAR_AREAS?.right && externalState) {
      ctx.register({
        id: 'status',
        area: sdk.STATUSBAR_AREAS.right,
        render: () => <StatusChip externalState={externalState} />
      })
    }

    if (sdk.TRANSCRIPT_DIRECTIVE_AREA) {
      ctx.register({
        id: 'cite-directive',
        area: sdk.TRANSCRIPT_DIRECTIVE_AREA,
        data: { name: 'cite' },
        render: props => <CiteDirective props={props} externalState={externalState} />
      })
    }

    if (typeof ctx.registerSettingsPage === 'function') {
      ctx.registerSettingsPage({
        id: 'sourcebook',
        title: 'SourceBook',
        description: 'Source-grounded research notebooks and Studio.',
        render: () => <SettingsPage />
      })
    }
  }
}
