// Scoped styles for SourceBook using native Hermes Desktop neutral surface tokens.
// Uses --ui-bg-chrome, --ui-bg-sidebar, --ui-bg-elevated, --ui-bg-editor, and --ui-bg-quinary
// so SourceBook matches Hermes Desktop natively in both dark and light themes.

export const CSS = `
.sb-root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  --sb-bg: var(--ui-bg-chrome, var(--background));
  --sb-sidebar: var(--ui-bg-sidebar, var(--ui-bg-chrome));
  --sb-surface: var(--ui-bg-elevated, var(--ui-bg-editor));
  --sb-subtle: var(--ui-bg-quinary, var(--ui-bg-quaternary));
  --sb-hover: var(--ui-bg-quaternary);
  --sb-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --sb-accent-soft: color-mix(in srgb, var(--ui-accent) 13%, transparent);
  --sb-accent-border: color-mix(in srgb, var(--ui-accent) 42%, var(--ui-stroke-secondary));
  --sb-ok: #2da44e;
  --sb-warn: #d29922;
  --sb-bad: var(--destructive, #cf222e);
  background: var(--sb-bg);
  color: var(--ui-text-primary);
  font-size: 13px;
  line-height: 1.5;
}

.sb-root *, .sb-root *::before, .sb-root *::after {
  box-sizing: border-box;
}

.sb-num {
  font-variant-numeric: tabular-nums;
}

.sb-mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-variant-numeric: tabular-nums;
}

/* Branded thin scrollbars matching Hermes surface tokens */
.sb-scroll {
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ui-stroke-secondary) transparent;
}
.sb-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.sb-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sb-scroll::-webkit-scrollbar-thumb {
  background: var(--ui-stroke-secondary);
  border-radius: 999px;
}
.sb-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--ui-text-quaternary);
}

/* Top bar */
.sb-topbar {
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
  min-width: 0;
}

.sb-topbar-left, .sb-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sb-brand {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 650;
  font-size: 13px;
  letter-spacing: -0.01em;
  color: var(--ui-text-primary);
  padding-right: 10px;
  border-right: 1px solid var(--ui-stroke-tertiary);
  flex-shrink: 0;
}

.sb-brand-mark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--sb-accent-soft);
  color: var(--ui-accent);
  border: 1px solid var(--sb-accent-border);
}

.sb-nb-select {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  font-size: 12.5px;
  font-weight: 550;
  cursor: pointer;
  max-width: 280px;
  transition: background-color 140ms var(--sb-ease), border-color 140ms var(--sb-ease), transform 120ms var(--sb-ease);
}
.sb-nb-select:hover {
  background: var(--sb-hover);
  border-color: var(--ui-stroke-primary, var(--ui-stroke-secondary));
}
.sb-nb-select:active {
  transform: scale(0.98);
}
.sb-nb-select-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: transparent;
  color: var(--ui-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 140ms var(--sb-ease), color 140ms var(--sb-ease), border-color 140ms var(--sb-ease), transform 120ms var(--sb-ease);
}
.sb-btn:hover:not(:disabled) {
  background: var(--sb-hover);
  color: var(--ui-text-primary);
}
.sb-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.sb-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.sb-btn:focus-visible, .sb-nb-select:focus-visible, .sb-input:focus-visible, .sb-textarea:focus-visible {
  outline: 2px solid var(--ui-accent);
  outline-offset: 1px;
}

.sb-btn-primary {
  background: var(--ui-accent);
  border-color: var(--ui-accent);
  color: var(--dt-midground-foreground, #ffffff);
  font-weight: 600;
}
.sb-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--ui-accent) 88%, #000000);
  color: var(--dt-midground-foreground, #ffffff);
}

.sb-btn-ghost {
  border-color: transparent;
}

.sb-btn-icon {
  width: 28px;
  padding: 0;
}

.sb-btn-danger:hover:not(:disabled) {
  color: var(--sb-bad);
  border-color: color-mix(in srgb, var(--sb-bad) 45%, transparent);
  background: color-mix(in srgb, var(--sb-bad) 10%, transparent);
}

.sb-btn[data-active="true"] {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
  color: var(--ui-accent);
}

/* Segmented control */
.sb-seg {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 8px;
  background: var(--sb-subtle);
  border: 1px solid var(--ui-stroke-tertiary);
  gap: 2px;
}
.sb-seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ui-text-tertiary);
  font: inherit;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 140ms var(--sb-ease), color 140ms var(--sb-ease);
}
.sb-seg-btn:hover {
  color: var(--ui-text-primary);
}
.sb-seg-btn[data-active="true"] {
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px var(--ui-stroke-secondary);
}

/* Coverage meter pill in topbar */
.sb-cov-meter {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-surface);
  font-size: 11.5px;
  color: var(--ui-text-secondary);
  cursor: pointer;
  transition: background-color 140ms var(--sb-ease), border-color 140ms var(--sb-ease);
}
.sb-cov-meter:hover {
  background: var(--sb-hover);
}
.sb-cov-track {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.sb-cov-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ui-accent);
  transition: width 220ms var(--sb-ease);
}

/* Main 3-column workbench */
.sb-workbench {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr) 348px;
}
.sb-workbench[data-left-collapsed="true"] {
  grid-template-columns: 0px minmax(0, 1fr) 348px;
}
.sb-workbench[data-studio-expanded="true"] {
  grid-template-columns: 256px 0px minmax(0, 1fr);
}
.sb-workbench[data-left-collapsed="true"][data-studio-expanded="true"] {
  grid-template-columns: 0px 0px minmax(0, 1fr);
}

.sb-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sb-pane-left {
  border-right: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
}
.sb-pane-center {
  background: var(--sb-bg);
}
.sb-pane-right {
  border-left: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
}

.sb-pane-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
}

.sb-pane-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ui-text-tertiary);
}

/* Sources & Notes rows */
.sb-dropzone {
  margin: 10px 12px 6px;
  padding: 10px;
  border-radius: 9px;
  border: 1px dashed var(--ui-stroke-secondary);
  background: var(--sb-bg);
  display: flex;
  flex-direction: column;
  gap: 7px;
  transition: border-color 150ms var(--sb-ease), background-color 150ms var(--sb-ease);
}
.sb-dropzone[data-over="true"] {
  border-color: var(--ui-accent);
  background: var(--sb-accent-soft);
}
.sb-dropzone-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}

.sb-src-list {
  flex: 1;
  min-height: 0;
  padding: 6px 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sb-src-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 130ms var(--sb-ease), border-color 130ms var(--sb-ease);
}
.sb-src-row:hover {
  background: var(--sb-hover);
}
.sb-src-row[data-selected="true"] {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
}
.sb-src-row[data-disabled="true"] {
  opacity: 0.52;
}

.sb-checkbox {
  width: 14px;
  height: 14px;
  margin: 2px 0 0;
  accent-color: var(--ui-accent);
  cursor: pointer;
}

.sb-src-title {
  font-size: 12.5px;
  font-weight: 550;
  color: var(--ui-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-src-meta {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ui-text-tertiary);
}
.sb-src-bar {
  margin-top: 5px;
  height: 2px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.sb-src-bar-fill {
  height: 100%;
  background: var(--ui-accent);
}

.sb-kind-tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--sb-subtle);
  color: var(--ui-text-secondary);
  border: 1px solid var(--ui-stroke-tertiary);
}

/* Center chat, Claim Ledger, Coverage Map */
.sb-center-tabs {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-bg);
}

.sb-briefing {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sb-briefing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sb-briefing-title {
  font-size: 12px;
  font-weight: 650;
  color: var(--ui-text-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sb-briefing-text {
  margin: 0;
  font-size: 12.5px;
  color: var(--ui-text-secondary);
  line-height: 1.55;
}
.sb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sb-chip-q {
  font: inherit;
  font-size: 11.5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  color: var(--ui-text-secondary);
  cursor: pointer;
  text-align: left;
  transition: background-color 140ms var(--sb-ease), color 140ms var(--sb-ease), border-color 140ms var(--sb-ease);
}
.sb-chip-q:hover {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
  color: var(--ui-text-primary);
}

/* Chat stream */
.sb-chat-stream {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sb-msg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 820px;
}
.sb-msg-user {
  align-self: flex-end;
  background: var(--sb-subtle);
  border: 1px solid var(--ui-stroke-secondary);
  padding: 9px 13px;
  border-radius: 10px;
  color: var(--ui-text-primary);
  max-width: 82%;
}
.sb-msg-assistant {
  align-self: stretch;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
}
.sb-msg-body {
  font-size: 13px;
  line-height: 1.62;
  color: var(--ui-text-primary);
}
.sb-msg-body p {
  margin: 0 0 8px;
}
.sb-msg-body p:last-child {
  margin-bottom: 0;
}
.sb-msg-body ul, .sb-msg-body ol {
  margin: 6px 0 8px;
  padding-left: 18px;
}
.sb-msg-body li {
  margin-bottom: 5px;
}
.sb-msg-body h3, .sb-msg-body h2 {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.01em;
  margin: 10px 0 6px;
  color: var(--ui-text-secondary);
}

/* Signature marginalia citation pill */
.sb-cite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  margin: 0 2px;
  border-radius: 4px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-accent-soft);
  color: var(--ui-accent);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  vertical-align: 1px;
  cursor: pointer;
  transition: background-color 120ms var(--sb-ease), color 120ms var(--sb-ease), transform 100ms var(--sb-ease);
}
.sb-cite:hover {
  background: var(--ui-accent);
  color: var(--dt-midground-foreground, #ffffff);
}
.sb-cite:active {
  transform: scale(0.94);
}

.sb-msg-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--ui-stroke-tertiary);
  font-size: 11.5px;
  color: var(--ui-text-tertiary);
}

.sb-verdict {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-bg);
}
.sb-verdict[data-v="supported"] {
  color: var(--sb-ok);
  border-color: color-mix(in srgb, var(--sb-ok) 38%, transparent);
  background: color-mix(in srgb, var(--sb-ok) 12%, transparent);
}
.sb-verdict[data-v="partial"] {
  color: var(--sb-warn);
  border-color: color-mix(in srgb, var(--sb-warn) 38%, transparent);
  background: color-mix(in srgb, var(--sb-warn) 12%, transparent);
}
.sb-verdict[data-v="unsupported"] {
  color: var(--sb-bad);
  border-color: color-mix(in srgb, var(--sb-bad) 38%, transparent);
  background: color-mix(in srgb, var(--sb-bad) 12%, transparent);
}

/* Composer */
.sb-composer-wrap {
  flex: 0 0 auto;
  padding: 10px 20px 14px;
  border-top: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-bg);
}
.sb-composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  transition: border-color 140ms var(--sb-ease);
}
.sb-composer:focus-within {
  border-color: var(--ui-accent);
}
.sb-textarea {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 13px;
  resize: none;
  outline: none;
  min-height: 36px;
  max-height: 140px;
}
.sb-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 12.5px;
}
.sb-composer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Claim Ledger & Coverage Map */
.sb-panel-pad {
  padding: 16px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sb-kpi-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 9px;
  background: var(--sb-surface);
  overflow: hidden;
}
.sb-kpi {
  padding: 12px 14px;
  border-right: 1px solid var(--ui-stroke-tertiary);
}
.sb-kpi:last-child {
  border-right: 0;
}
.sb-kpi-label {
  font-size: 11px;
  color: var(--ui-text-tertiary);
}
.sb-kpi-val {
  margin-top: 3px;
  font-size: 20px;
  font-weight: 650;
  line-height: 1.15;
  color: var(--ui-text-primary);
  font-variant-numeric: tabular-nums;
}

.sb-ledger-row {
  padding: 12px 14px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sb-quote-box {
  padding: 7px 10px;
  border-left: 2px solid var(--ui-accent);
  background: var(--sb-bg);
  border-radius: 0 6px 6px 0;
  font-size: 12px;
  color: var(--ui-text-secondary);
}

/* Studio Rail & Artifact Renderers */
.sb-studio-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 10px 12px;
}
.sb-studio-tile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
  text-align: left;
  transition: background-color 140ms var(--sb-ease), border-color 140ms var(--sb-ease), transform 120ms var(--sb-ease);
}
.sb-studio-tile:hover:not(:disabled) {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
}
.sb-studio-tile:active:not(:disabled) {
  transform: scale(0.97);
}
.sb-studio-tile:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.sb-studio-tile-wide {
  grid-column: span 2;
}

.sb-art-list {
  flex: 1;
  min-height: 0;
  padding: 8px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sb-art-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  cursor: pointer;
  transition: background-color 130ms var(--sb-ease), border-color 130ms var(--sb-ease);
}
.sb-art-item:hover {
  background: var(--sb-hover);
}
.sb-art-item[data-active="true"] {
  border-color: var(--sb-accent-border);
  background: var(--sb-accent-soft);
}

/* Studio viewer surface */
.sb-viewer {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
}
.sb-viewer-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
}
.sb-viewer-body {
  flex: 1;
  min-height: 0;
  padding: 16px 18px 22px;
}

/* Flashcards */
.sb-fc-card {
  min-height: 220px;
  padding: 22px 24px;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  transition: border-color 150ms var(--sb-ease), background-color 150ms var(--sb-ease);
}
.sb-fc-card:hover {
  border-color: var(--sb-accent-border);
}
.sb-fc-grade-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

/* Data table */
.sb-table-wrap {
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 9px;
  overflow: auto;
  background: var(--sb-surface);
}
.sb-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.sb-table th {
  position: sticky;
  top: 0;
  text-align: left;
  padding: 9px 11px;
  background: var(--sb-sidebar);
  border-bottom: 1px solid var(--ui-stroke-secondary);
  color: var(--ui-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.sb-table td {
  padding: 9px 11px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  vertical-align: top;
  color: var(--ui-text-primary);
}
.sb-table tbody tr:hover {
  background: var(--sb-hover);
}

/* Slide deck stage */
.sb-slide-stage {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  padding: 28px 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
}
.sb-slide-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
}
.sb-slide-thumb {
  flex: 0 0 132px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}
.sb-slide-thumb[data-active="true"] {
  border-color: var(--ui-accent);
  background: var(--sb-accent-soft);
  color: var(--ui-text-primary);
}

/* Passage Inspector Drawer */
.sb-inspector {
  position: absolute;
  top: 48px;
  right: 0;
  bottom: 0;
  width: min(460px, 46vw);
  background: var(--sb-sidebar);
  border-left: 1px solid var(--ui-stroke-secondary);
  display: flex;
  flex-direction: column;
  z-index: 25;
}
.sb-chunk-card {
  padding: 12px 14px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-chunk-card[data-hit="true"] {
  border-color: var(--ui-accent);
  background: color-mix(in srgb, var(--ui-accent) 9%, var(--sb-surface));
}

/* Modal overlay */
.sb-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 16px;
}
.sb-modal {
  width: min(520px, 92vw);
  max-height: 84vh;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sb-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  font-weight: 600;
}
.sb-modal-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}
.sb-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--ui-stroke-tertiary);
}

.sb-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sb-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ui-text-secondary);
}

/* Empty & error states */
.sb-empty {
  padding: 28px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--ui-text-tertiary);
}
.sb-error-bar {
  margin: 8px 16px 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--sb-bad) 45%, transparent);
  background: color-mix(in srgb, var(--sb-bad) 10%, transparent);
  color: var(--ui-text-primary);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* SVG diagram frame */
.sb-svg-stage {
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 10px;
  background: var(--sb-surface);
  overflow: hidden;
  position: relative;
}

/* Status bar chip */
.sb-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 100%;
  padding: 0 7px;
  border: 0;
  background: transparent;
  color: var(--ui-text-tertiary);
  font-size: 11px;
  cursor: pointer;
}
.sb-status-chip:hover {
  color: var(--ui-text-primary);
}

/* Inline chat ::cite directive card */
.sb-cite-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 4px 0;
  border-radius: 8px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-accent-soft);
  color: var(--ui-text-primary);
  font-size: 12px;
  cursor: pointer;
}

@media (max-width: 1040px) {
  .sb-workbench {
    grid-template-columns: 236px minmax(0, 1fr) 300px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sb-root * {
    transition: none !important;
    animation: none !important;
  }
}
`

export function Styles() {
  return <style>{CSS}</style>
}
