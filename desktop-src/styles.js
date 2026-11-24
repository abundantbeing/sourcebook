// Scoped styles for Folio using native Hermes Desktop neutral surface tokens.
// Uses --ui-bg-chrome, --ui-bg-sidebar, --ui-bg-elevated, --ui-bg-editor, and --ui-bg-quinary
// so Folio matches Hermes Desktop natively in both dark and light themes.

export const CSS = `
.fl-root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  --fl-bg: var(--ui-bg-chrome, var(--background));
  --fl-sidebar: var(--ui-bg-sidebar, var(--ui-bg-chrome));
  --fl-surface: var(--ui-bg-elevated, var(--ui-bg-editor));
  --fl-subtle: var(--ui-bg-quinary, var(--ui-bg-quaternary));
  --fl-hover: var(--ui-bg-quaternary);
  --fl-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --fl-accent-soft: color-mix(in srgb, var(--ui-accent) 13%, transparent);
  --fl-accent-border: color-mix(in srgb, var(--ui-accent) 42%, var(--ui-stroke-secondary));
  --fl-ok: #2da44e;
  --fl-warn: #d29922;
  --fl-bad: var(--destructive, #cf222e);
  background: var(--fl-bg);
  color: var(--ui-text-primary);
  font-size: 13px;
  line-height: 1.5;
}

.fl-root *, .fl-root *::before, .fl-root *::after {
  box-sizing: border-box;
}

.fl-num {
  font-variant-numeric: tabular-nums;
}

.fl-mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-variant-numeric: tabular-nums;
}

/* Branded thin scrollbars matching Hermes surface tokens */
.fl-scroll {
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ui-stroke-secondary) transparent;
}
.fl-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.fl-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.fl-scroll::-webkit-scrollbar-thumb {
  background: var(--ui-stroke-secondary);
  border-radius: 999px;
}
.fl-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--ui-text-quaternary);
}

/* Top bar */
.fl-topbar {
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-sidebar);
  min-width: 0;
}

.fl-topbar-left, .fl-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.fl-brand {
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

.fl-brand-mark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--fl-accent-soft);
  color: var(--ui-accent);
  border: 1px solid var(--fl-accent-border);
}

.fl-nb-select {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  color: var(--ui-text-primary);
  font-size: 12.5px;
  font-weight: 550;
  cursor: pointer;
  max-width: 280px;
  transition: background-color 140ms var(--fl-ease), border-color 140ms var(--fl-ease), transform 120ms var(--fl-ease);
}
.fl-nb-select:hover {
  background: var(--fl-hover);
  border-color: var(--ui-stroke-primary, var(--ui-stroke-secondary));
}
.fl-nb-select:active {
  transform: scale(0.98);
}
.fl-nb-select-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fl-btn {
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
  transition: background-color 140ms var(--fl-ease), color 140ms var(--fl-ease), border-color 140ms var(--fl-ease), transform 120ms var(--fl-ease);
}
.fl-btn:hover:not(:disabled) {
  background: var(--fl-hover);
  color: var(--ui-text-primary);
}
.fl-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.fl-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.fl-btn:focus-visible, .fl-nb-select:focus-visible, .fl-input:focus-visible, .fl-textarea:focus-visible {
  outline: 2px solid var(--ui-accent);
  outline-offset: 1px;
}

.fl-btn-primary {
  background: var(--ui-accent);
  border-color: var(--ui-accent);
  color: var(--dt-midground-foreground, #ffffff);
  font-weight: 600;
}
.fl-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--ui-accent) 88%, #000000);
  color: var(--dt-midground-foreground, #ffffff);
}

.fl-btn-ghost {
  border-color: transparent;
}

.fl-btn-icon {
  width: 28px;
  padding: 0;
}

.fl-btn-danger:hover:not(:disabled) {
  color: var(--fl-bad);
  border-color: color-mix(in srgb, var(--fl-bad) 45%, transparent);
  background: color-mix(in srgb, var(--fl-bad) 10%, transparent);
}

.fl-btn[data-active="true"] {
  background: var(--fl-accent-soft);
  border-color: var(--fl-accent-border);
  color: var(--ui-accent);
}

/* Segmented control */
.fl-seg {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 8px;
  background: var(--fl-subtle);
  border: 1px solid var(--ui-stroke-tertiary);
  gap: 2px;
}
.fl-seg-btn {
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
  transition: background-color 140ms var(--fl-ease), color 140ms var(--fl-ease);
}
.fl-seg-btn:hover {
  color: var(--ui-text-primary);
}
.fl-seg-btn[data-active="true"] {
  background: var(--fl-surface);
  color: var(--ui-text-primary);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px var(--ui-stroke-secondary);
}

/* Coverage meter pill in topbar */
.fl-cov-meter {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 9px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-surface);
  font-size: 11.5px;
  color: var(--ui-text-secondary);
  cursor: pointer;
  transition: background-color 140ms var(--fl-ease), border-color 140ms var(--fl-ease);
}
.fl-cov-meter:hover {
  background: var(--fl-hover);
}
.fl-cov-track {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.fl-cov-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--ui-accent);
  transition: width 220ms var(--fl-ease);
}

/* Main 3-column workbench */
.fl-workbench {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr) 348px;
}
.fl-workbench[data-left-collapsed="true"] {
  grid-template-columns: 0px minmax(0, 1fr) 348px;
}
.fl-workbench[data-studio-expanded="true"] {
  grid-template-columns: 256px 0px minmax(0, 1fr);
}
.fl-workbench[data-left-collapsed="true"][data-studio-expanded="true"] {
  grid-template-columns: 0px 0px minmax(0, 1fr);
}

.fl-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.fl-pane-left {
  border-right: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-sidebar);
}
.fl-pane-center {
  background: var(--fl-bg);
}
.fl-pane-right {
  border-left: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-sidebar);
}

.fl-pane-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
}

.fl-pane-title {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ui-text-tertiary);
}

/* Sources & Notes rows */
.fl-dropzone {
  margin: 10px 12px 6px;
  padding: 10px;
  border-radius: 9px;
  border: 1px dashed var(--ui-stroke-secondary);
  background: var(--fl-bg);
  display: flex;
  flex-direction: column;
  gap: 7px;
  transition: border-color 150ms var(--fl-ease), background-color 150ms var(--fl-ease);
}
.fl-dropzone[data-over="true"] {
  border-color: var(--ui-accent);
  background: var(--fl-accent-soft);
}
.fl-dropzone-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}

.fl-src-list {
  flex: 1;
  min-height: 0;
  padding: 6px 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fl-src-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  padding: 8px 9px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 130ms var(--fl-ease), border-color 130ms var(--fl-ease);
}
.fl-src-row:hover {
  background: var(--fl-hover);
}
.fl-src-row[data-selected="true"] {
  background: var(--fl-accent-soft);
  border-color: var(--fl-accent-border);
}
.fl-src-row[data-disabled="true"] {
  opacity: 0.52;
}

.fl-checkbox {
  width: 14px;
  height: 14px;
  margin: 2px 0 0;
  accent-color: var(--ui-accent);
  cursor: pointer;
}

.fl-src-title {
  font-size: 12.5px;
  font-weight: 550;
  color: var(--ui-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fl-src-meta {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ui-text-tertiary);
}
.fl-src-bar {
  margin-top: 5px;
  height: 2px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.fl-src-bar-fill {
  height: 100%;
  background: var(--ui-accent);
}

.fl-kind-tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--fl-subtle);
  color: var(--ui-text-secondary);
  border: 1px solid var(--ui-stroke-tertiary);
}

/* Center chat, Claim Ledger, Coverage Map */
.fl-center-tabs {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-bg);
}

.fl-briefing {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fl-briefing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.fl-briefing-title {
  font-size: 12px;
  font-weight: 650;
  color: var(--ui-text-primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.fl-briefing-text {
  margin: 0;
  font-size: 12.5px;
  color: var(--ui-text-secondary);
  line-height: 1.55;
}
.fl-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.fl-chip-q {
  font: inherit;
  font-size: 11.5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-bg);
  color: var(--ui-text-secondary);
  cursor: pointer;
  text-align: left;
  transition: background-color 140ms var(--fl-ease), color 140ms var(--fl-ease), border-color 140ms var(--fl-ease);
}
.fl-chip-q:hover {
  background: var(--fl-accent-soft);
  border-color: var(--fl-accent-border);
  color: var(--ui-text-primary);
}

/* Chat stream */
.fl-chat-stream {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fl-msg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 820px;
}
.fl-msg-user {
  align-self: flex-end;
  background: var(--fl-subtle);
  border: 1px solid var(--ui-stroke-secondary);
  padding: 9px 13px;
  border-radius: 10px;
  color: var(--ui-text-primary);
  max-width: 82%;
}
.fl-msg-assistant {
  align-self: stretch;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
}
.fl-msg-body {
  font-size: 13px;
  line-height: 1.62;
  color: var(--ui-text-primary);
}
.fl-msg-body p {
  margin: 0 0 8px;
}
.fl-msg-body p:last-child {
  margin-bottom: 0;
}
.fl-msg-body ul, .fl-msg-body ol {
  margin: 6px 0 8px;
  padding-left: 18px;
}
.fl-msg-body li {
  margin-bottom: 5px;
}
.fl-msg-body h3, .fl-msg-body h2 {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.01em;
  margin: 10px 0 6px;
  color: var(--ui-text-secondary);
}

/* Signature marginalia citation pill */
.fl-cite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  margin: 0 2px;
  border-radius: 4px;
  border: 1px solid var(--fl-accent-border);
  background: var(--fl-accent-soft);
  color: var(--ui-accent);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  vertical-align: 1px;
  cursor: pointer;
  transition: background-color 120ms var(--fl-ease), color 120ms var(--fl-ease), transform 100ms var(--fl-ease);
}
.fl-cite:hover {
  background: var(--ui-accent);
  color: var(--dt-midground-foreground, #ffffff);
}
.fl-cite:active {
  transform: scale(0.94);
}

.fl-msg-foot {
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

.fl-verdict {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-bg);
}
.fl-verdict[data-v="supported"] {
  color: var(--fl-ok);
  border-color: color-mix(in srgb, var(--fl-ok) 38%, transparent);
  background: color-mix(in srgb, var(--fl-ok) 12%, transparent);
}
.fl-verdict[data-v="partial"] {
  color: var(--fl-warn);
  border-color: color-mix(in srgb, var(--fl-warn) 38%, transparent);
  background: color-mix(in srgb, var(--fl-warn) 12%, transparent);
}
.fl-verdict[data-v="unsupported"] {
  color: var(--fl-bad);
  border-color: color-mix(in srgb, var(--fl-bad) 38%, transparent);
  background: color-mix(in srgb, var(--fl-bad) 12%, transparent);
}

/* Composer */
.fl-composer-wrap {
  flex: 0 0 auto;
  padding: 10px 20px 14px;
  border-top: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-bg);
}
.fl-composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  transition: border-color 140ms var(--fl-ease);
}
.fl-composer:focus-within {
  border-color: var(--ui-accent);
}
.fl-textarea {
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
.fl-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-bg);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 12.5px;
}
.fl-composer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Claim Ledger & Coverage Map */
.fl-panel-pad {
  padding: 16px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.fl-kpi-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 9px;
  background: var(--fl-surface);
  overflow: hidden;
}
.fl-kpi {
  padding: 12px 14px;
  border-right: 1px solid var(--ui-stroke-tertiary);
}
.fl-kpi:last-child {
  border-right: 0;
}
.fl-kpi-label {
  font-size: 11px;
  color: var(--ui-text-tertiary);
}
.fl-kpi-val {
  margin-top: 3px;
  font-size: 20px;
  font-weight: 650;
  line-height: 1.15;
  color: var(--ui-text-primary);
  font-variant-numeric: tabular-nums;
}

.fl-ledger-row {
  padding: 12px 14px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fl-quote-box {
  padding: 7px 10px;
  border-left: 2px solid var(--ui-accent);
  background: var(--fl-bg);
  border-radius: 0 6px 6px 0;
  font-size: 12px;
  color: var(--ui-text-secondary);
}

/* Studio Rail & Artifact Renderers */
.fl-studio-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 10px 12px;
}
.fl-studio-tile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
  text-align: left;
  transition: background-color 140ms var(--fl-ease), border-color 140ms var(--fl-ease), transform 120ms var(--fl-ease);
}
.fl-studio-tile:hover:not(:disabled) {
  background: var(--fl-accent-soft);
  border-color: var(--fl-accent-border);
}
.fl-studio-tile:active:not(:disabled) {
  transform: scale(0.97);
}
.fl-studio-tile:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.fl-studio-tile-wide {
  grid-column: span 2;
}

.fl-art-list {
  flex: 1;
  min-height: 0;
  padding: 8px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fl-art-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  cursor: pointer;
  transition: background-color 130ms var(--fl-ease), border-color 130ms var(--fl-ease);
}
.fl-art-item:hover {
  background: var(--fl-hover);
}
.fl-art-item[data-active="true"] {
  border-color: var(--fl-accent-border);
  background: var(--fl-accent-soft);
}

/* Studio viewer surface */
.fl-viewer {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--fl-bg);
}
.fl-viewer-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--fl-sidebar);
}
.fl-viewer-body {
  flex: 1;
  min-height: 0;
  padding: 16px 18px 22px;
}

/* Flashcards */
.fl-fc-card {
  min-height: 220px;
  padding: 22px 24px;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  transition: border-color 150ms var(--fl-ease), background-color 150ms var(--fl-ease);
}
.fl-fc-card:hover {
  border-color: var(--fl-accent-border);
}
.fl-fc-grade-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

/* Data table */
.fl-table-wrap {
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 9px;
  overflow: auto;
  background: var(--fl-surface);
}
.fl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.fl-table th {
  position: sticky;
  top: 0;
  text-align: left;
  padding: 9px 11px;
  background: var(--fl-sidebar);
  border-bottom: 1px solid var(--ui-stroke-secondary);
  color: var(--ui-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.fl-table td {
  padding: 9px 11px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  vertical-align: top;
  color: var(--ui-text-primary);
}
.fl-table tbody tr:hover {
  background: var(--fl-hover);
}

/* Slide deck stage */
.fl-slide-stage {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  padding: 28px 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
}
.fl-slide-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
}
.fl-slide-thumb {
  flex: 0 0 132px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  color: var(--ui-text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}
.fl-slide-thumb[data-active="true"] {
  border-color: var(--ui-accent);
  background: var(--fl-accent-soft);
  color: var(--ui-text-primary);
}

/* Passage Inspector Drawer */
.fl-inspector {
  position: absolute;
  top: 48px;
  right: 0;
  bottom: 0;
  width: min(460px, 46vw);
  background: var(--fl-sidebar);
  border-left: 1px solid var(--ui-stroke-secondary);
  display: flex;
  flex-direction: column;
  z-index: 25;
}
.fl-chunk-card {
  padding: 12px 14px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fl-chunk-card[data-hit="true"] {
  border-color: var(--ui-accent);
  background: color-mix(in srgb, var(--ui-accent) 9%, var(--fl-surface));
}

/* Modal overlay */
.fl-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 16px;
}
.fl-modal {
  width: min(520px, 92vw);
  max-height: 84vh;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--fl-surface);
  color: var(--ui-text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.fl-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  font-weight: 600;
}
.fl-modal-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}
.fl-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--ui-stroke-tertiary);
}

.fl-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.fl-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ui-text-secondary);
}

/* Empty & error states */
.fl-empty {
  padding: 28px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--ui-text-tertiary);
}
.fl-error-bar {
  margin: 8px 16px 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--fl-bad) 45%, transparent);
  background: color-mix(in srgb, var(--fl-bad) 10%, transparent);
  color: var(--ui-text-primary);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* SVG diagram frame */
.fl-svg-stage {
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 10px;
  background: var(--fl-surface);
  overflow: hidden;
  position: relative;
}

/* Status bar chip */
.fl-status-chip {
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
.fl-status-chip:hover {
  color: var(--ui-text-primary);
}

/* Inline chat ::cite directive card */
.fl-cite-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 4px 0;
  border-radius: 8px;
  border: 1px solid var(--fl-accent-border);
  background: var(--fl-accent-soft);
  color: var(--ui-text-primary);
  font-size: 12px;
  cursor: pointer;
}

@media (max-width: 1040px) {
  .fl-workbench {
    grid-template-columns: 236px minmax(0, 1fr) 300px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fl-root * {
    transition: none !important;
    animation: none !important;
  }
}
`

export function Styles() {
  return <style>{CSS}</style>
}
