// Folio: source-grounded research notebooks and interactive Studio for Hermes Desktop.
import { sdk, Icon } from './sdk.js'
import { bindContext } from './api.js'
import { FolioWorkspace } from './FolioWorkspace.jsx'
import { SettingsPage } from './SettingsPage.jsx'

const ROUTE = '/folio'

function StatusChip({ externalState }) {
  const state = typeof sdk.useValue === 'function' && externalState ? sdk.useValue(externalState) : null
  if (!state?.title) return null
  return (
    <button
      type="button"
      className="fl-status-chip"
      onClick={() => sdk.host?.navigate?.(ROUTE)}
      title={`Open Folio: ${state.title}`}
    >
      <Icon name="BookOpen" size={12} />
      <span>{state.title}</span>
      {state.dueCards > 0 ? <span className="fl-mono">({state.dueCards} due)</span> : null}
    </button>
  )
}

function CiteDirective({ props, externalState }) {
  const nb = props?.nb || ''
  const chunk = props?.chunk || ''
  return (
    <button
      type="button"
      className="fl-cite-card"
      onClick={() => {
        if (externalState) {
          externalState.set({ ...externalState.get(), pendingJump: { nb, chunk } })
        }
        sdk.host?.navigate?.(ROUTE)
      }}
    >
      <Icon name="BookOpen" size={13} />
      <span>Folio source</span>
      {chunk ? <span className="fl-mono">{chunk}</span> : null}
    </button>
  )
}

export default {
  id: 'folio',
  name: 'Folio',
  description: 'Source-grounded research notebooks, Claim Ledger, Coverage Map, and 7-format interactive Studio.',
  register(ctx) {
    bindContext(ctx)
    const externalState = typeof sdk.atom === 'function' ? sdk.atom({ title: '', dueCards: 0, nbId: '', pendingJump: null }) : null

    ctx.register({
      id: 'page',
      area: sdk.ROUTES_AREA,
      data: { path: ROUTE },
      render: () => <FolioWorkspace ctx={ctx} externalState={externalState} />
    })

    ctx.register({
      id: 'nav',
      area: sdk.SIDEBAR_NAV_AREA,
      data: { path: ROUTE, label: 'Folio', codicon: 'book' }
    })

    if (sdk.PALETTE_AREA) {
      ctx.register({
        id: 'open',
        area: sdk.PALETTE_AREA,
        data: {
          id: 'folio.open',
          label: 'Folio: Open research notebooks',
          keywords: ['folio', 'notebook', 'research', 'studio', 'flashcards', 'mindmap', 'citations'],
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
        id: 'folio',
        title: 'Folio',
        description: 'Source-grounded research notebooks and Studio.',
        render: () => <SettingsPage />
      })
    }
  }
}
