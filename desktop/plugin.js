// desktop-src/sdk.js
import * as sdk from "@hermes/plugin-sdk";
import { jsx } from "react/jsx-runtime";
function Icon({ name, size = 15, strokeWidth = 1.75, className = "", style }) {
  const icons2 = sdk.icons || {};
  const Comp = icons2[name] || icons2.FileText || icons2.BookOpen;
  if (!Comp) return null;
  return /* @__PURE__ */ jsx(Comp, { size, strokeWidth, className, style, "aria-hidden": "true" });
}

// desktop-src/api.js
var activeCtx = null;
function bindContext(ctx) {
  activeCtx = ctx;
}
function currentScopeKey() {
  const host = sdk.host || {};
  const conn = host.state?.connectionId?.get?.() ?? "local";
  const prof = host.state?.profile?.get?.() ?? "default";
  return `${conn}::${prof}`;
}
function currentEpoch() {
  return typeof sdk.gatewayActivationEpoch === "function" ? sdk.gatewayActivationEpoch() : 0;
}
async function api(path, opts = {}) {
  if (!activeCtx || typeof activeCtx.rest !== "function") {
    throw new Error("Folio backend connection is not ready yet.");
  }
  return activeCtx.rest(path, opts);
}
async function uploadFile(nbId, file) {
  if (!activeCtx || typeof activeCtx.rest !== "function") {
    throw new Error("Folio backend connection is not ready yet.");
  }
  const bytes = await file.arrayBuffer();
  return activeCtx.rest(`/notebooks/${encodeURIComponent(nbId)}/sources/upload`, {
    method: "POST",
    upload: {
      filename: file.name || "upload.txt",
      contentType: file.type || "application/octet-stream",
      bytes
    },
    timeoutMs: 9e4
  });
}
function pollJob(ctx, jobId, onUpdate, onDone, onError) {
  let cancelled = false;
  let clearTimer = null;
  const startScope = currentScopeKey();
  const startEpoch = currentEpoch();
  const tick = async () => {
    if (cancelled) return;
    if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) {
      cancelled = true;
      return;
    }
    try {
      const job = await api(`/jobs/${encodeURIComponent(jobId)}`);
      if (cancelled) return;
      if (job.status === "done") {
        onDone?.(job.result, job);
        return;
      }
      if (job.status === "error") {
        onError?.(new Error(job.error || "Background job failed"));
        return;
      }
      onUpdate?.(job);
      clearTimer = ctx.setTimeout(tick, 420);
    } catch (err) {
      if (!cancelled) onError?.(err);
    }
  };
  clearTimer = ctx.setTimeout(tick, 220);
  return () => {
    cancelled = true;
    clearTimer?.();
  };
}
async function copyText(text) {
  if (typeof sdk.writeClipboardText === "function") {
    return sdk.writeClipboardText(String(text ?? ""));
  }
  if (activeCtx?.os?.writeClipboard) {
    return activeCtx.os.writeClipboard(String(text ?? ""));
  }
  return false;
}
function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  if (activeCtx && typeof activeCtx.setTimeout === "function") {
    activeCtx.setTimeout(() => URL.revokeObjectURL(url), 1e3);
  } else {
    URL.revokeObjectURL(url);
  }
}
function resolveCssColor(expr, scopeEl) {
  const fallback = "#6b7280";
  if (!expr) return fallback;
  try {
    const target = scopeEl || document.documentElement;
    const cs = getComputedStyle(target);
    const resolved = String(expr).replace(/var\((--[a-zA-Z0-9_-]+)(?:,\s*([^)]+))?\)/g, (_m, name, fb) => {
      const val = cs.getPropertyValue(name).trim();
      return val || (fb ? fb.trim() : fallback);
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const c2d = canvas.getContext("2d");
    if (!c2d) return resolved || fallback;
    c2d.fillStyle = fallback;
    c2d.fillStyle = resolved;
    c2d.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = c2d.getImageData(0, 0, 1, 1).data;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    if (a < 255) {
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
    }
    return hex;
  } catch {
    return fallback;
  }
}
function bakeSvgVariables(svgEl) {
  if (!svgEl) return "";
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const bg = resolveCssColor("var(--ui-bg-primary)", svgEl);
  const bg2 = resolveCssColor("var(--ui-bg-secondary)", svgEl);
  const fg = resolveCssColor("var(--ui-text-primary)", svgEl);
  const muted = resolveCssColor("var(--ui-text-secondary)", svgEl);
  const stroke = resolveCssColor("var(--ui-stroke-secondary)", svgEl);
  const accent = resolveCssColor("var(--ui-accent)", svgEl);
  const accentSoft = resolveCssColor("color-mix(in srgb, var(--ui-accent) 16%, var(--ui-bg-secondary))", svgEl);
  const replacements = [
    [/var\(--ui-bg-primary[^)]*\)/g, bg],
    [/var\(--ui-bg-secondary[^)]*\)/g, bg2],
    [/var\(--ui-bg-elevated[^)]*\)/g, bg2],
    [/var\(--ui-bg-quaternary[^)]*\)/g, bg2],
    [/var\(--ui-text-primary[^)]*\)/g, fg],
    [/var\(--ui-text-secondary[^)]*\)/g, muted],
    [/var\(--ui-text-tertiary[^)]*\)/g, muted],
    [/var\(--ui-stroke-secondary[^)]*\)/g, stroke],
    [/var\(--ui-stroke-tertiary[^)]*\)/g, stroke],
    [/var\(--fl-accent-soft[^)]*\)/g, accentSoft],
    [/var\(--fl-accent-border[^)]*\)/g, accent],
    [/var\(--ui-accent[^)]*\)/g, accent]
  ];
  let markup = new XMLSerializer().serializeToString(clone);
  for (const [re, val] of replacements) {
    markup = markup.replace(re, val);
  }
  return markup;
}

// desktop-src/FolioWorkspace.jsx
import { useCallback, useEffect as useEffect7, useRef as useRef7, useState as useState10 } from "react";

// desktop-src/styles.js
import { jsx as jsx2 } from "react/jsx-runtime";
var CSS = `
.fl-root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ui-bg-primary);
  color: var(--ui-text-primary);
  font-size: 13px;
  line-height: 1.5;
  --fl-ease: cubic-bezier(0.23, 1, 0.32, 1);
  --fl-accent-soft: color-mix(in srgb, var(--ui-accent) 13%, transparent);
  --fl-accent-border: color-mix(in srgb, var(--ui-accent) 42%, var(--ui-stroke-secondary));
  --fl-ok: #2da44e;
  --fl-warn: #d29922;
  --fl-bad: var(--destructive, #cf222e);
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
  background: var(--ui-bg-chrome, var(--ui-bg-secondary));
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
  padding-right: 8px;
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
  background: var(--ui-bg-elevated, var(--ui-bg-primary));
  color: var(--ui-text-primary);
  font-size: 12.5px;
  font-weight: 550;
  cursor: pointer;
  max-width: 260px;
  transition: background-color 140ms var(--fl-ease), border-color 140ms var(--fl-ease), transform 120ms var(--fl-ease);
}
.fl-nb-select:hover {
  background: var(--ui-bg-quaternary);
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
  background: var(--ui-bg-quaternary);
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
  background: var(--ui-bg-quaternary);
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
  background: var(--ui-bg-elevated, var(--ui-bg-primary));
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
  background: var(--ui-bg-secondary);
  font-size: 11.5px;
  color: var(--ui-text-secondary);
  cursor: pointer;
  transition: background-color 140ms var(--fl-ease), border-color 140ms var(--fl-ease);
}
.fl-cov-meter:hover {
  background: var(--ui-bg-quaternary);
}
.fl-cov-track {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: var(--ui-bg-quaternary);
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
  background: var(--ui-bg-secondary);
}
.fl-pane-center {
  background: var(--ui-bg-primary);
}
.fl-pane-right {
  border-left: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-secondary);
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
  background: var(--ui-bg-primary);
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
  gap: 2px;
}

.fl-src-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  padding: 8px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 130ms var(--fl-ease), border-color 130ms var(--fl-ease);
}
.fl-src-row:hover {
  background: var(--ui-bg-quaternary);
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
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--ui-bg-quaternary);
  color: var(--ui-text-tertiary);
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
  background: var(--ui-bg-primary);
}

.fl-briefing {
  margin: 16px 20px 4px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--ui-bg-secondary);
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
  background: var(--ui-bg-primary);
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
  gap: 16px;
}

.fl-msg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 780px;
}
.fl-msg-user {
  align-self: flex-end;
  background: var(--ui-bg-quaternary);
  border: 1px solid var(--ui-stroke-tertiary);
  padding: 9px 13px;
  border-radius: 10px;
  color: var(--ui-text-primary);
  max-width: 82%;
}
.fl-msg-assistant {
  align-self: stretch;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-elevated, var(--ui-bg-secondary));
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
  padding-left: 20px;
}
.fl-msg-body li {
  margin-bottom: 4px;
}
.fl-msg-body h3, .fl-msg-body h2 {
  font-size: 13px;
  font-weight: 650;
  margin: 12px 0 6px;
  color: var(--ui-text-primary);
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
  background: var(--ui-bg-primary);
}
.fl-verdict[data-v="supported"] {
  color: var(--fl-ok);
  border-color: color-mix(in srgb, var(--fl-ok) 38%, transparent);
  background: color-mix(in srgb, var(--fl-ok) 10%, transparent);
}
.fl-verdict[data-v="partial"] {
  color: var(--fl-warn);
  border-color: color-mix(in srgb, var(--fl-warn) 38%, transparent);
  background: color-mix(in srgb, var(--fl-warn) 10%, transparent);
}
.fl-verdict[data-v="unsupported"] {
  color: var(--fl-bad);
  border-color: color-mix(in srgb, var(--fl-bad) 38%, transparent);
  background: color-mix(in srgb, var(--fl-bad) 10%, transparent);
}

/* Composer */
.fl-composer-wrap {
  flex: 0 0 auto;
  padding: 10px 20px 14px;
  border-top: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-primary);
}
.fl-composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--ui-bg-secondary);
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
  background: var(--ui-bg-primary);
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

/* Claim Ledger & Coverage Map tables */
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
  background: var(--ui-bg-secondary);
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
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fl-quote-box {
  padding: 7px 10px;
  border-left: 2px solid var(--ui-accent);
  background: var(--ui-bg-primary);
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
  background: var(--ui-bg-primary);
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
  padding: 6px 12px 16px;
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
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-primary);
  cursor: pointer;
  transition: background-color 130ms var(--fl-ease), border-color 130ms var(--fl-ease);
}
.fl-art-item:hover {
  background: var(--ui-bg-quaternary);
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
  background: var(--ui-bg-primary);
}
.fl-viewer-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-secondary);
}
.fl-viewer-body {
  flex: 1;
  min-height: 0;
  padding: 14px 16px 20px;
}

/* Flashcards */
.fl-fc-card {
  min-height: 210px;
  padding: 22px 24px;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--ui-bg-secondary);
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
  background: var(--ui-bg-primary);
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
  padding: 8px 10px;
  background: var(--ui-bg-secondary);
  border-bottom: 1px solid var(--ui-stroke-secondary);
  color: var(--ui-text-secondary);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.fl-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  vertical-align: top;
  color: var(--ui-text-primary);
}
.fl-table tbody tr:hover {
  background: var(--ui-bg-quaternary);
}

/* Slide deck stage */
.fl-slide-stage {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--ui-bg-secondary);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  overflow: hidden;
}
.fl-slide-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;
}
.fl-slide-thumb {
  flex: 0 0 112px;
  padding: 7px 8px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-secondary);
  color: var(--ui-text-secondary);
  font-size: 10.5px;
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
  width: min(440px, 46vw);
  background: var(--ui-bg-elevated, var(--ui-bg-primary));
  border-left: 1px solid var(--ui-stroke-secondary);
  display: flex;
  flex-direction: column;
  z-index: 25;
}
.fl-chunk-card {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--ui-bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fl-chunk-card[data-hit="true"] {
  border-color: var(--ui-accent);
  background: var(--fl-accent-soft);
}

/* Modal overlay */
.fl-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.48);
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
  background: var(--ui-bg-elevated, var(--ui-bg-primary));
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
  background: var(--ui-bg-secondary);
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
`;
function Styles() {
  return /* @__PURE__ */ jsx2("style", { children: CSS });
}

// desktop-src/components/SidebarSources.jsx
import { useRef, useState } from "react";
import { Fragment, jsx as jsx3, jsxs } from "react/jsx-runtime";
var KIND_ICONS = {
  pdf: "FileText",
  docx: "FileText",
  markdown: "FileCode",
  text: "AlignLeft",
  csv: "Table",
  json: "Braces",
  url: "Globe",
  youtube: "PlayCircle",
  image: "Image",
  note: "StickyNote"
};
function fmtWords(n) {
  const v = Number(n) || 0;
  if (typeof sdk.compactNumber === "function") return sdk.compactNumber(v);
  return v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : String(v);
}
function SidebarSources({
  nbId,
  sources,
  notes,
  coverage,
  selectedSourceId,
  onSelectSource,
  onRefresh,
  onError
}) {
  const [tab, setTab] = useState("sources");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef(null);
  const covBySource = {};
  for (const item of coverage?.sources || []) {
    covBySource[item.source_id] = item;
  }
  const enabledCount = sources.filter((s) => s.enabled).length;
  const allEnabled = sources.length > 0 && enabledCount === sources.length;
  async function toggleAll() {
    if (!nbId || !sources.length) return;
    const next = !allEnabled;
    try {
      await Promise.all(
        sources.map((s) => api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(s.id)}`, {
          method: "PATCH",
          body: { enabled: next }
        }))
      );
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not update sources.");
    }
  }
  async function toggleSource(e, src) {
    e.stopPropagation();
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}`, {
        method: "PATCH",
        body: { enabled: !src.enabled }
      });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not toggle source.");
    }
  }
  async function handleFiles(fileList) {
    if (!nbId || !fileList?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(nbId, file);
      }
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function submitPaste(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
        method: "POST",
        body: { title: title.trim() || body.trim().slice(0, 48), text: body, kind: "markdown" }
      });
      setModal(null);
      setTitle("");
      setBody("");
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not add source.");
    } finally {
      setBusy(false);
    }
  }
  async function submitUrl(e) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setBusy(true);
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
        method: "POST",
        body: { url: urlInput.trim(), title: title.trim() }
      });
      setModal(null);
      setTitle("");
      setUrlInput("");
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not ingest URL.");
    } finally {
      setBusy(false);
    }
  }
  async function submitNote(e) {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return;
    setBusy(true);
    try {
      if (modal && typeof modal === "object" && modal.id) {
        await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(modal.id)}`, {
          method: "PATCH",
          body: { title: title.trim() || "Untitled note", markdown: body }
        });
      } else {
        await api(`/notebooks/${encodeURIComponent(nbId)}/notes`, {
          method: "POST",
          body: { title: title.trim() || "Untitled note", markdown: body }
        });
      }
      setModal(null);
      setTitle("");
      setBody("");
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not save note.");
    } finally {
      setBusy(false);
    }
  }
  async function promoteNote(note) {
    setBusy(true);
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}/promote`, { method: "POST" });
      sdk.host?.notify?.({ kind: "success", title: "Folio", message: `Promoted "${note.title}" to sources.` });
      setTab("sources");
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not promote note.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteNote(note) {
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}`, { method: "DELETE" });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not delete note.");
    }
  }
  async function deleteSource(e, src) {
    e.stopPropagation();
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}`, { method: "DELETE" });
      if (selectedSourceId === src.id) onSelectSource?.(null);
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not remove source.");
    }
  }
  return /* @__PURE__ */ jsxs("aside", { className: "fl-pane fl-pane-left", "aria-label": "Sources and Notes", children: [
    /* @__PURE__ */ jsxs("div", { className: "fl-pane-head", children: [
      /* @__PURE__ */ jsxs("div", { className: "fl-seg", role: "tablist", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "sources",
            className: "fl-seg-btn",
            "data-active": tab === "sources",
            onClick: () => setTab("sources"),
            children: [
              "Sources ",
              /* @__PURE__ */ jsx3("span", { className: "fl-num", style: { opacity: 0.7 }, children: sources.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "notes",
            className: "fl-seg-btn",
            "data-active": tab === "notes",
            onClick: () => setTab("notes"),
            children: [
              "Notes ",
              /* @__PURE__ */ jsx3("span", { className: "fl-num", style: { opacity: 0.7 }, children: notes.length })
            ]
          }
        )
      ] }),
      tab === "sources" && sources.length > 0 ? /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn fl-btn-ghost", onClick: toggleAll, title: "Toggle all sources", children: /* @__PURE__ */ jsxs("span", { className: "fl-num", children: [
        enabledCount,
        "/",
        sources.length
      ] }) }) : null,
      tab === "notes" ? /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "fl-btn fl-btn-ghost",
          onClick: () => {
            setTitle("");
            setBody("");
            setModal("note");
          },
          children: [
            /* @__PURE__ */ jsx3(Icon, { name: "Plus", size: 13 }),
            " New"
          ]
        }
      ) : null
    ] }),
    tab === "sources" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "fl-dropzone",
          "data-over": dragOver,
          onDragOver: (e) => {
            e.preventDefault();
            setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop: (e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer?.files);
          },
          children: [
            /* @__PURE__ */ jsx3(
              "input",
              {
                ref: fileRef,
                type: "file",
                multiple: true,
                accept: ".txt,.md,.markdown,.pdf,.docx,.csv,.tsv,.json,.html,.htm,.png,.jpg,.jpeg,.webp",
                style: { display: "none" },
                onChange: (e) => handleFiles(e.target.files)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "fl-dropzone-actions", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "fl-btn",
                  disabled: !nbId || busy,
                  onClick: () => fileRef.current?.click(),
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "Upload", size: 13 }),
                    " File"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "fl-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setTitle("");
                    setUrlInput("");
                    setModal("url");
                  },
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "Link", size: 13 }),
                    " URL"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "fl-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setTitle("");
                    setBody("");
                    setModal("paste");
                  },
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "FilePlus", size: 13 }),
                    " Paste"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx3("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", textAlign: "center" }, children: busy ? "Indexing source..." : "Drop PDF, DOCX, Markdown, CSV, or text" })
          ]
        }
      ),
      /* @__PURE__ */ jsx3("div", { className: "fl-src-list fl-scroll", children: sources.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "fl-empty", children: [
        /* @__PURE__ */ jsx3(Icon, { name: "BookOpen", size: 22 }),
        /* @__PURE__ */ jsx3("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No sources yet" }),
        /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5 }, children: "Add documents, URLs, or pasted notes to start cited research." })
      ] }) : sources.map((src) => {
        const cov = covBySource[src.id];
        const pct = cov && cov.total_chunks > 0 ? Math.round(cov.touched_chunks / cov.total_chunks * 100) : 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "fl-src-row",
            "data-selected": selectedSourceId === src.id,
            "data-disabled": !src.enabled,
            onClick: () => onSelectSource?.({ sourceId: src.id, chunkId: null }),
            role: "button",
            tabIndex: 0,
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectSource?.({ sourceId: src.id, chunkId: null });
              }
            },
            children: [
              /* @__PURE__ */ jsx3(
                "input",
                {
                  type: "checkbox",
                  className: "fl-checkbox",
                  checked: Boolean(src.enabled),
                  onClick: (e) => e.stopPropagation(),
                  onChange: (e) => toggleSource(e, src),
                  "aria-label": `Include ${src.title}`
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
                /* @__PURE__ */ jsx3("div", { className: "fl-src-title", title: src.title, children: src.title }),
                /* @__PURE__ */ jsxs("div", { className: "fl-src-meta", children: [
                  /* @__PURE__ */ jsx3(Icon, { name: KIND_ICONS[src.kind] || "FileText", size: 11 }),
                  /* @__PURE__ */ jsx3("span", { className: "fl-kind-tag", children: src.kind }),
                  /* @__PURE__ */ jsxs("span", { className: "fl-num", children: [
                    fmtWords(src.word_count),
                    " w"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "fl-num", children: [
                    src.chunk_count,
                    " ch"
                  ] })
                ] }),
                /* @__PURE__ */ jsx3("div", { className: "fl-src-bar", title: `Coverage: ${pct}%`, children: /* @__PURE__ */ jsx3("div", { className: "fl-src-bar-fill", style: { width: `${pct}%` } }) })
              ] }),
              /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "fl-btn fl-btn-ghost fl-btn-icon fl-btn-danger",
                  title: "Remove source",
                  "aria-label": `Remove ${src.title}`,
                  onClick: (e) => deleteSource(e, src),
                  children: /* @__PURE__ */ jsx3(Icon, { name: "Trash2", size: 13 })
                }
              )
            ]
          },
          src.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsx3("div", { className: "fl-src-list fl-scroll", children: notes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "fl-empty", children: [
      /* @__PURE__ */ jsx3(Icon, { name: "StickyNote", size: 22 }),
      /* @__PURE__ */ jsx3("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No notes saved" }),
      /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5 }, children: "Capture findings or save any cited chat reply as a reusable note." }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: () => {
            setTitle("");
            setBody("");
            setModal("note");
          },
          children: [
            /* @__PURE__ */ jsx3(Icon, { name: "Plus", size: 13 }),
            " Write a note"
          ]
        }
      )
    ] }) : notes.map((note) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "fl-ledger-row",
        style: { cursor: "pointer" },
        onClick: () => {
          setTitle(note.title || "");
          setBody(note.markdown || "");
          setModal(note);
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx3("div", { className: "fl-src-title", style: { flex: 1 }, title: note.title, children: note.title }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 2 }, onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "fl-btn fl-btn-ghost fl-btn-icon",
                  title: "Promote note to active source",
                  onClick: () => promoteNote(note),
                  children: /* @__PURE__ */ jsx3(Icon, { name: "ArrowUpRight", size: 13 })
                }
              ),
              /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "fl-btn fl-btn-ghost fl-btn-icon fl-btn-danger",
                  title: "Delete note",
                  onClick: () => deleteNote(note),
                  children: /* @__PURE__ */ jsx3(Icon, { name: "Trash2", size: 13 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx3(
            "div",
            {
              style: {
                fontSize: 11.5,
                color: "var(--ui-text-secondary)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              },
              children: note.markdown || "Empty note"
            }
          )
        ]
      },
      note.id
    )) }),
    modal === "paste" ? /* @__PURE__ */ jsx3("div", { className: "fl-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs("form", { className: "fl-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitPaste, children: [
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Paste text or Markdown" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-body", children: [
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "Title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "fl-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Architecture notes, benchmark table, transcript...",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "Content" }),
          /* @__PURE__ */ jsx3(
            "textarea",
            {
              className: "fl-input",
              style: { height: 200, padding: "8px 10px", resize: "vertical" },
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Paste text or Markdown here...",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "fl-btn fl-btn-primary", disabled: busy || !body.trim(), children: busy ? "Indexing..." : "Add source" })
      ] })
    ] }) }) : null,
    modal === "url" ? /* @__PURE__ */ jsx3("div", { className: "fl-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs("form", { className: "fl-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitUrl, children: [
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Add web page or article" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-body", children: [
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "URL" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "fl-input",
              type: "url",
              value: urlInput,
              onChange: (e) => setUrlInput(e.target.value),
              placeholder: "https://example.com/article",
              required: true,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "Optional custom title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "fl-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Leave blank to use page title"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "fl-btn fl-btn-primary", disabled: busy || !urlInput.trim(), children: busy ? "Fetching..." : "Ingest URL" })
      ] })
    ] }) }) : null,
    modal === "note" || modal && typeof modal === "object" ? /* @__PURE__ */ jsx3("div", { className: "fl-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs("form", { className: "fl-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitNote, children: [
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: typeof modal === "object" ? "Edit note" : "New research note" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-body", children: [
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "Title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "fl-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Working hypothesis, synthesis...",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "fl-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "fl-label", children: "Markdown" }),
          /* @__PURE__ */ jsx3(
            "textarea",
            {
              className: "fl-input",
              style: { height: 220, padding: "8px 10px", resize: "vertical" },
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Write your note..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "fl-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "fl-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "fl-btn fl-btn-primary", disabled: busy, children: busy ? "Saving..." : "Save note" })
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/components/SourceInspector.jsx
import { useEffect, useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function SourceInspector({ nbId, target, onClose, onPromoteQuote }) {
  const [data, setData] = useState2(null);
  const [loading, setLoading] = useState2(false);
  const [filter, setFilter] = useState2("");
  const [error, setError] = useState2("");
  const hitRef = useRef2(null);
  const sourceId = target?.sourceId || (target?.chunkId ? String(target.chunkId).split(":")[0] : null);
  const focusChunkId = target?.chunkId || null;
  useEffect(() => {
    if (!nbId || !sourceId) return;
    let alive = true;
    setLoading(true);
    setError("");
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/text`).then((res) => {
      if (alive) setData(res);
    }).catch((err) => {
      if (alive) setError(err.message || "Could not load source text.");
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [nbId, sourceId]);
  useEffect(() => {
    if (hitRef.current) {
      hitRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [data, focusChunkId]);
  if (!target || !sourceId) return null;
  const chunks = data?.chunks || [];
  const q = filter.trim().toLowerCase();
  const visible = q ? chunks.filter((c) => (c.text || "").toLowerCase().includes(q) || (c.heading || "").toLowerCase().includes(q)) : chunks;
  return /* @__PURE__ */ jsxs2("section", { className: "fl-inspector", "aria-label": "Passage Inspector", children: [
    /* @__PURE__ */ jsxs2("div", { className: "fl-pane-head", children: [
      /* @__PURE__ */ jsxs2("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsx4("div", { className: "fl-pane-title", children: "Passage Inspector" }),
        /* @__PURE__ */ jsx4("div", { className: "fl-src-title", style: { marginTop: 2 }, title: data?.source?.title || sourceId, children: data?.source?.title || sourceId })
      ] }),
      /* @__PURE__ */ jsx4("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: onClose, "aria-label": "Close inspector", children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 15 }) })
    ] }),
    /* @__PURE__ */ jsx4("div", { style: { padding: "8px 12px", borderBottom: "1px solid var(--ui-stroke-tertiary)", display: "flex", gap: 6 }, children: /* @__PURE__ */ jsx4(
      "input",
      {
        className: "fl-input",
        value: filter,
        onChange: (e) => setFilter(e.target.value),
        placeholder: "Filter passages in this source...",
        "aria-label": "Filter passages"
      }
    ) }),
    /* @__PURE__ */ jsxs2("div", { className: "fl-scroll", style: { flex: 1, padding: "10px 12px 24px", display: "flex", flexDirection: "column", gap: 10 }, children: [
      loading ? /* @__PURE__ */ jsx4("div", { className: "fl-empty", children: "Loading passages..." }) : null,
      error ? /* @__PURE__ */ jsx4("div", { className: "fl-error-bar", style: { margin: 0 }, children: error }) : null,
      !loading && !error && visible.length === 0 ? /* @__PURE__ */ jsx4("div", { className: "fl-empty", children: "No matching passages." }) : null,
      visible.map((ch) => {
        const isHit = focusChunkId && ch.id === focusChunkId;
        return /* @__PURE__ */ jsxs2(
          "article",
          {
            ref: isHit ? hitRef : null,
            className: "fl-chunk-card",
            "data-hit": isHit ? "true" : void 0,
            children: [
              /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
                /* @__PURE__ */ jsxs2("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsx4("span", { className: "fl-mono", style: { fontSize: 10.5, color: "var(--ui-accent)", fontWeight: 600 }, children: ch.id }),
                  ch.heading ? /* @__PURE__ */ jsx4("span", { className: "fl-src-title", style: { fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: ch.heading }) : null
                ] }),
                /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 3 }, children: [
                  /* @__PURE__ */ jsx4(
                    "button",
                    {
                      type: "button",
                      className: "fl-btn fl-btn-ghost fl-btn-icon",
                      title: "Copy passage",
                      onClick: () => copyText(ch.text),
                      children: /* @__PURE__ */ jsx4(Icon, { name: "Copy", size: 12 })
                    }
                  ),
                  onPromoteQuote ? /* @__PURE__ */ jsx4(
                    "button",
                    {
                      type: "button",
                      className: "fl-btn fl-btn-ghost fl-btn-icon",
                      title: "Save passage as note",
                      onClick: () => onPromoteQuote(ch, data?.source?.title || sourceId),
                      children: /* @__PURE__ */ jsx4(Icon, { name: "BookmarkPlus", size: 12 })
                    }
                  ) : null
                ] })
              ] }),
              /* @__PURE__ */ jsx4("div", { style: { fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "var(--ui-text-primary)" }, children: ch.text })
            ]
          },
          ch.id
        );
      })
    ] })
  ] });
}

// desktop-src/components/ChatPanel.jsx
import { useEffect as useEffect2, useRef as useRef3, useState as useState3 } from "react";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g;
var CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/;
function renderInlineCited(text, citeIndexMap, onOpenChunk) {
  const paragraphs = String(text || "").split(/\n{2,}/);
  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;
    const lines = trimmed.split("\n");
    const isList = lines.every((l) => /^\s*[-*+]\s+/.test(l));
    const renderSpan = (line) => {
      const tokens = line.split(CITE_SPLIT_RE);
      return tokens.map((tok, tIdx) => {
        const m = CITE_EXTRACT_RE.exec(tok);
        if (m) {
          const cid = m[1];
          const num = citeIndexMap.get(cid) || "?";
          return /* @__PURE__ */ jsx5(
            "button",
            {
              type: "button",
              className: "fl-cite",
              title: `Inspect cited passage ${cid}`,
              onClick: () => onOpenChunk(cid),
              children: num
            },
            `${tIdx}-${cid}`
          );
        }
        const boldParts = tok.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, bIdx) => {
          if (bp.startsWith("**") && bp.endsWith("**") && bp.length > 4) {
            return /* @__PURE__ */ jsx5("strong", { children: bp.slice(2, -2) }, `${tIdx}-${bIdx}`);
          }
          return bp;
        });
      });
    };
    if (trimmed.startsWith("### ")) {
      return /* @__PURE__ */ jsx5("h3", { children: renderSpan(trimmed.slice(4)) }, pIdx);
    }
    if (trimmed.startsWith("## ")) {
      return /* @__PURE__ */ jsx5("h2", { children: renderSpan(trimmed.slice(3)) }, pIdx);
    }
    if (isList) {
      return /* @__PURE__ */ jsx5("ul", { children: lines.map((l, lIdx) => /* @__PURE__ */ jsx5("li", { children: renderSpan(l.replace(/^\s*[-*+]\s+/, "")) }, lIdx)) }, pIdx);
    }
    return /* @__PURE__ */ jsx5("p", { children: renderSpan(trimmed) }, pIdx);
  });
}
function ChatPanel({
  ctx,
  notebook,
  sources,
  messages,
  claims,
  coverage,
  centerTab,
  onChangeCenterTab,
  onOpenChunk,
  onOpenSource,
  onRefresh,
  onError
}) {
  const [input, setInput] = useState3("");
  const [asking, setAsking] = useState3(false);
  const [stage, setStage] = useState3("");
  const [briefingBusy, setBriefingBusy] = useState3(false);
  const [claimFilter, setClaimFilter] = useState3("all");
  const endRef = useRef3(null);
  const cancelPollRef = useRef3(null);
  const enabledSources = sources.filter((s) => s.enabled);
  useEffect2(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect2(() => {
    if (centerTab === "chat" && endRef.current) {
      endRef.current.scrollIntoView({ block: "end" });
    }
  }, [messages.length, centerTab]);
  async function sendQuestion(promptText) {
    const q = String(promptText ?? input).trim();
    if (!q || !notebook?.id || asking) return;
    if (enabledSources.length === 0) {
      onError?.("Enable at least one source before asking a question.");
      return;
    }
    setInput("");
    setAsking(true);
    setStage("Searching active sources...");
    onChangeCenterTab("chat");
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/ask`, {
        method: "POST",
        body: {
          text: q,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          strict: Boolean(notebook.strict)
        }
      });
      cancelPollRef.current?.();
      cancelPollRef.current = pollJob(
        ctx,
        job,
        (j) => setStage(j.stage || "Working..."),
        async () => {
          setAsking(false);
          setStage("");
          await onRefresh();
        },
        (err) => {
          setAsking(false);
          setStage("");
          onError?.(err.message || "Could not answer question.");
        }
      );
    } catch (err) {
      setAsking(false);
      setStage("");
      onError?.(err.message || "Could not start grounded query.");
    }
  }
  async function generateBriefing() {
    if (!notebook?.id || briefingBusy || enabledSources.length === 0) return;
    setBriefingBusy(true);
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/guide`, { method: "POST" });
      pollJob(
        ctx,
        job,
        () => {
        },
        async () => {
          setBriefingBusy(false);
          await onRefresh();
        },
        (err) => {
          setBriefingBusy(false);
          onError?.(err.message || "Could not generate briefing.");
        }
      );
    } catch (err) {
      setBriefingBusy(false);
      onError?.(err.message || "Could not generate briefing.");
    }
  }
  async function saveAsNote(msg) {
    if (!notebook?.id) return;
    try {
      const firstLine = (msg.content || "").split("\n")[0].replace(/\[\[c:[^\]]+\]\]/g, "").trim();
      await api(`/notebooks/${encodeURIComponent(notebook.id)}/notes`, {
        method: "POST",
        body: {
          title: firstLine.slice(0, 64) || "Saved answer",
          markdown: msg.content || "",
          from_chat: true,
          citations: msg.citations || []
        }
      });
      sdk.host?.notify?.({ kind: "success", title: "Folio", message: "Saved reply to Notes." });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not save note.");
    }
  }
  async function clearChat() {
    if (!notebook?.id) return;
    try {
      await api(`/notebooks/${encodeURIComponent(notebook.id)}/messages`, { method: "DELETE" });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not clear conversation.");
    }
  }
  const supportedCount = claims.filter((c) => c.verdict === "supported").length;
  const partialCount = claims.filter((c) => c.verdict === "partial").length;
  const unsupportedCount = claims.filter((c) => c.verdict === "unsupported").length;
  const filteredClaims = claimFilter === "all" ? claims : claims.filter((c) => c.verdict === claimFilter);
  const guide = notebook?.guide;
  return /* @__PURE__ */ jsxs3("main", { className: "fl-pane fl-pane-center", "aria-label": "Research Workspace", children: [
    /* @__PURE__ */ jsxs3("div", { className: "fl-center-tabs", children: [
      /* @__PURE__ */ jsxs3("div", { className: "fl-seg", role: "tablist", children: [
        /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "chat",
            className: "fl-seg-btn",
            "data-active": centerTab === "chat",
            onClick: () => onChangeCenterTab("chat"),
            children: [
              /* @__PURE__ */ jsx5(Icon, { name: "MessageSquare", size: 12 }),
              " Grounded Chat"
            ]
          }
        ),
        /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "claims",
            className: "fl-seg-btn",
            "data-active": centerTab === "claims",
            onClick: () => onChangeCenterTab("claims"),
            children: [
              /* @__PURE__ */ jsx5(Icon, { name: "ShieldCheck", size: 12 }),
              " Claim Ledger ",
              /* @__PURE__ */ jsx5("span", { className: "fl-num", style: { opacity: 0.7 }, children: claims.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "coverage",
            className: "fl-seg-btn",
            "data-active": centerTab === "coverage",
            onClick: () => onChangeCenterTab("coverage"),
            children: [
              /* @__PURE__ */ jsx5(Icon, { name: "BarChart3", size: 12 }),
              " Coverage Map"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx5("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: centerTab === "chat" && messages.length > 0 ? /* @__PURE__ */ jsx5("button", { type: "button", className: "fl-btn fl-btn-ghost", onClick: clearChat, children: "Clear" }) : null })
    ] }),
    centerTab === "chat" ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
      /* @__PURE__ */ jsxs3("div", { className: "fl-chat-stream fl-scroll", children: [
        sources.length > 0 ? /* @__PURE__ */ jsxs3("section", { className: "fl-briefing", style: { margin: 0 }, children: [
          /* @__PURE__ */ jsxs3("div", { className: "fl-briefing-head", children: [
            /* @__PURE__ */ jsxs3("span", { className: "fl-briefing-title", children: [
              /* @__PURE__ */ jsx5(Icon, { name: "BookOpen", size: 14 }),
              " Notebook Briefing"
            ] }),
            /* @__PURE__ */ jsxs3(
              "button",
              {
                type: "button",
                className: "fl-btn",
                disabled: briefingBusy || enabledSources.length === 0,
                onClick: generateBriefing,
                children: [
                  /* @__PURE__ */ jsx5(Icon, { name: "RefreshCw", size: 12 }),
                  " ",
                  briefingBusy ? "Updating..." : guide ? "Refresh" : "Generate briefing"
                ]
              }
            )
          ] }),
          guide?.overview ? /* @__PURE__ */ jsxs3(Fragment2, { children: [
            /* @__PURE__ */ jsx5("p", { className: "fl-briefing-text", children: guide.overview }),
            guide.topics?.length ? /* @__PURE__ */ jsx5("div", { className: "fl-chips", children: guide.topics.map((t, idx) => /* @__PURE__ */ jsx5("span", { className: "fl-kind-tag", style: { textTransform: "none", padding: "2px 7px" }, children: t }, idx)) }) : null,
            guide.suggested_questions?.length ? /* @__PURE__ */ jsx5("div", { className: "fl-chips", children: guide.suggested_questions.map((sq, idx) => /* @__PURE__ */ jsx5("button", { type: "button", className: "fl-chip-q", onClick: () => sendQuestion(sq), children: sq }, idx)) }) : null
          ] }) : /* @__PURE__ */ jsxs3("p", { className: "fl-briefing-text", children: [
            enabledSources.length,
            " active source",
            enabledSources.length === 1 ? "" : "s",
            " indexed. Generate a briefing for starter questions or ask directly below."
          ] })
        ] }) : null,
        messages.length === 0 && sources.length === 0 ? /* @__PURE__ */ jsxs3("div", { className: "fl-empty", style: { marginTop: 48 }, children: [
          /* @__PURE__ */ jsx5(Icon, { name: "Library", size: 26 }),
          /* @__PURE__ */ jsx5("div", { style: { fontWeight: 650, fontSize: 14, color: "var(--ui-text-primary)" }, children: "Add sources to begin" }),
          /* @__PURE__ */ jsx5("div", { style: { maxWidth: 380, fontSize: 12.5 }, children: "Upload PDFs, DOCX files, Markdown, CSVs, or web URLs in the left rail. Every reply links inline citations back to the exact passage." })
        ] }) : null,
        messages.map((msg) => {
          if (msg.role === "user") {
            return /* @__PURE__ */ jsx5("div", { className: "fl-msg fl-msg-user", children: msg.content }, msg.id);
          }
          const citeIndex = /* @__PURE__ */ new Map();
          (msg.citations || []).forEach((cid, i) => citeIndex.set(cid, i + 1));
          const gr = msg.grounding || {};
          const sup = gr.claims_supported ?? (msg.claims || []).filter((c) => c.verdict === "supported").length;
          const unsup = gr.claims_unsupported ?? (msg.claims || []).filter((c) => c.verdict === "unsupported").length;
          return /* @__PURE__ */ jsxs3("article", { className: "fl-msg fl-msg-assistant", children: [
            /* @__PURE__ */ jsx5("div", { className: "fl-msg-body", children: renderInlineCited(msg.content, citeIndex, onOpenChunk) }),
            /* @__PURE__ */ jsxs3("div", { className: "fl-msg-foot", children: [
              /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
                typeof gr.score === "number" ? /* @__PURE__ */ jsxs3(
                  "span",
                  {
                    className: "fl-verdict",
                    "data-v": gr.score >= 0.8 ? "supported" : gr.score >= 0.5 ? "partial" : "unsupported",
                    children: [
                      /* @__PURE__ */ jsxs3("span", { className: "fl-num", children: [
                        Math.round(gr.score * 100),
                        "%"
                      ] }),
                      " cited"
                    ]
                  }
                ) : null,
                sup > 0 ? /* @__PURE__ */ jsxs3("span", { className: "fl-verdict", "data-v": "supported", children: [
                  /* @__PURE__ */ jsx5("span", { className: "fl-num", children: sup }),
                  " verified"
                ] }) : null,
                unsup > 0 ? /* @__PURE__ */ jsxs3("span", { className: "fl-verdict", "data-v": "unsupported", children: [
                  /* @__PURE__ */ jsx5("span", { className: "fl-num", children: unsup }),
                  " uncited"
                ] }) : null,
                gr.mode === "extractive" ? /* @__PURE__ */ jsx5("span", { className: "fl-kind-tag", title: "Generated locally from indexed chunks without an external model call", children: "Local extractive" }) : null
              ] }),
              /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxs3(
                  "button",
                  {
                    type: "button",
                    className: "fl-btn fl-btn-ghost",
                    onClick: () => copyText(msg.content),
                    children: [
                      /* @__PURE__ */ jsx5(Icon, { name: "Copy", size: 12 }),
                      " Copy"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs3(
                  "button",
                  {
                    type: "button",
                    className: "fl-btn fl-btn-ghost",
                    onClick: () => saveAsNote(msg),
                    children: [
                      /* @__PURE__ */ jsx5(Icon, { name: "BookmarkPlus", size: 12 }),
                      " Save note"
                    ]
                  }
                )
              ] })
            ] })
          ] }, msg.id);
        }),
        asking ? /* @__PURE__ */ jsx5("div", { className: "fl-msg fl-msg-assistant", "aria-busy": "true", children: /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-secondary)", fontSize: 12.5 }, children: [
          /* @__PURE__ */ jsx5(Icon, { name: "Search", size: 14 }),
          " ",
          stage || "Searching active sources..."
        ] }) }) : null,
        /* @__PURE__ */ jsx5("div", { ref: endRef })
      ] }),
      /* @__PURE__ */ jsx5("div", { className: "fl-composer-wrap", children: /* @__PURE__ */ jsxs3("div", { className: "fl-composer", children: [
        /* @__PURE__ */ jsx5(
          "textarea",
          {
            className: "fl-textarea",
            rows: 2,
            value: input,
            onChange: (e) => setInput(e.target.value),
            placeholder: enabledSources.length > 0 ? "Ask a question across your active sources..." : "Add or check a source in the left rail to ask questions...",
            disabled: asking || enabledSources.length === 0,
            onKeyDown: (e) => {
              const isSubmit = typeof sdk.isSubmitEnter === "function" ? sdk.isSubmitEnter(e) : e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing;
              if (isSubmit) {
                e.preventDefault();
                sendQuestion();
              }
            }
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "fl-composer-bar", children: [
          /* @__PURE__ */ jsxs3("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
            /* @__PURE__ */ jsx5("span", { className: "fl-num", children: enabledSources.length }),
            " of ",
            /* @__PURE__ */ jsx5("span", { className: "fl-num", children: sources.length }),
            " sources active",
            notebook?.strict ? " | Strict mode" : ""
          ] }),
          /* @__PURE__ */ jsxs3(
            "button",
            {
              type: "button",
              className: "fl-btn fl-btn-primary",
              disabled: asking || !input.trim() || enabledSources.length === 0,
              onClick: () => sendQuestion(),
              children: [
                /* @__PURE__ */ jsx5(Icon, { name: "ArrowUp", size: 13 }),
                " Ask"
              ]
            }
          )
        ] })
      ] }) })
    ] }) : null,
    centerTab === "claims" ? /* @__PURE__ */ jsxs3("div", { className: "fl-panel-pad fl-scroll", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsxs3("div", { className: "fl-kpi-strip", children: [
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Verified claims" }),
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-val", style: { color: "var(--fl-ok)" }, children: supportedCount })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Partial overlap" }),
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-val", style: { color: "var(--fl-warn)" }, children: partialCount })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Uncited claims" }),
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-val", style: { color: unsupportedCount > 0 ? "var(--fl-bad)" : "var(--ui-text-primary)" }, children: unsupportedCount })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
        /* @__PURE__ */ jsx5("div", { className: "fl-seg", children: ["all", "supported", "partial", "unsupported"].map((f) => /* @__PURE__ */ jsx5(
          "button",
          {
            type: "button",
            className: "fl-seg-btn",
            "data-active": claimFilter === f,
            onClick: () => setClaimFilter(f),
            children: f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)
          },
          f
        )) }),
        /* @__PURE__ */ jsx5("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Click any citation to verify the original passage" })
      ] }),
      filteredClaims.length === 0 ? /* @__PURE__ */ jsxs3("div", { className: "fl-empty", children: [
        /* @__PURE__ */ jsx5(Icon, { name: "ShieldCheck", size: 24 }),
        /* @__PURE__ */ jsx5("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No claims recorded yet" }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12 }, children: "Ask a grounded question to populate the Claim Ledger with verifiable evidence." })
      ] }) : filteredClaims.map((cl) => /* @__PURE__ */ jsxs3("article", { className: "fl-ledger-row", children: [
        /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxs3("span", { className: "fl-verdict", "data-v": cl.verdict, children: [
            cl.verdict,
            " ",
            typeof cl.overlap === "number" ? `(${Math.round(cl.overlap * 100)}%)` : ""
          ] }),
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
            cl.source_title ? /* @__PURE__ */ jsx5("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: cl.source_title }) : null,
            (cl.citations || []).map((cid) => /* @__PURE__ */ jsx5("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk(cid), children: cid.split(":")[1] || cid }, cid))
          ] })
        ] }),
        /* @__PURE__ */ jsx5("div", { style: { fontSize: 12.5, color: "var(--ui-text-primary)" }, children: cl.text }),
        cl.quote ? /* @__PURE__ */ jsx5("div", { className: "fl-quote-box", children: cl.quote }) : null
      ] }, cl.id))
    ] }) : null,
    centerTab === "coverage" ? /* @__PURE__ */ jsxs3("div", { className: "fl-panel-pad fl-scroll", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsxs3("div", { className: "fl-kpi-strip", children: [
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Corpus coverage" }),
          /* @__PURE__ */ jsxs3("div", { className: "fl-kpi-val", children: [
            coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Interrogated chunks" }),
          /* @__PURE__ */ jsxs3("div", { className: "fl-kpi-val", children: [
            coverage?.touched_chunks || 0,
            " / ",
            coverage?.total_chunks || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "fl-kpi", children: [
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-label", children: "Blind spots" }),
          /* @__PURE__ */ jsx5("div", { className: "fl-kpi-val", children: Math.max(0, (coverage?.total_chunks || 0) - (coverage?.touched_chunks || 0)) })
        ] })
      ] }),
      (coverage?.sources || []).length === 0 ? /* @__PURE__ */ jsx5("div", { className: "fl-empty", children: "Add sources to measure how thoroughly you have explored your corpus." }) : (coverage?.sources || []).map((item) => {
        const pct = item.total_chunks > 0 ? Math.round(item.touched_chunks / item.total_chunks * 100) : 0;
        return /* @__PURE__ */ jsxs3("article", { className: "fl-ledger-row", children: [
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxs3("div", { style: { minWidth: 0 }, children: [
              /* @__PURE__ */ jsx5("div", { className: "fl-src-title", children: item.title }),
              /* @__PURE__ */ jsxs3("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
                /* @__PURE__ */ jsx5("span", { className: "fl-num", children: item.touched_chunks }),
                " of ",
                /* @__PURE__ */ jsx5("span", { className: "fl-num", children: item.total_chunks }),
                " passages cited"
              ] })
            ] }),
            /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxs3("span", { className: "fl-mono", style: { fontSize: 12, fontWeight: 600 }, children: [
                pct,
                "%"
              ] }),
              /* @__PURE__ */ jsx5(
                "button",
                {
                  type: "button",
                  className: "fl-btn",
                  onClick: () => onOpenSource?.({ sourceId: item.source_id, chunkId: null }),
                  children: "Inspect"
                }
              ),
              pct < 100 ? /* @__PURE__ */ jsx5(
                "button",
                {
                  type: "button",
                  className: "fl-btn",
                  onClick: () => sendQuestion(`Summarize the key facts and figures from ${item.title}.`),
                  children: "Explore gap"
                }
              ) : null
            ] })
          ] }),
          /* @__PURE__ */ jsx5("div", { className: "fl-src-bar", style: { height: 5 }, children: /* @__PURE__ */ jsx5("div", { className: "fl-src-bar-fill", style: { width: `${pct}%` } }) })
        ] }, item.source_id);
      })
    ] }) : null
  ] });
}

// desktop-src/components/StudioPanel.jsx
import { useEffect as useEffect6, useRef as useRef6, useState as useState9 } from "react";

// desktop-src/components/renderers/StudyGuideView.jsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var CITE_SPLIT_RE2 = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g;
var CITE_EXTRACT_RE2 = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/;
function StudyGuideView({ artifact, onOpenChunk }) {
  const md = String(artifact?.spec?.markdown || "");
  const citeOrder = [];
  const citeMap = /* @__PURE__ */ new Map();
  md.replace(/\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]/g, (_m, cid) => {
    if (!citeMap.has(cid)) {
      citeOrder.push(cid);
      citeMap.set(cid, citeOrder.length);
    }
    return _m;
  });
  function renderLine(text) {
    return text.split(CITE_SPLIT_RE2).map((tok, idx) => {
      const m = CITE_EXTRACT_RE2.exec(tok);
      if (m) {
        const cid = m[1];
        return /* @__PURE__ */ jsx6("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: citeMap.get(cid) }, idx);
      }
      const parts = tok.split(/(\*\*[^*]+\*\*)/g);
      return parts.map(
        (p, pIdx) => p.startsWith("**") && p.endsWith("**") && p.length > 4 ? /* @__PURE__ */ jsx6("strong", { children: p.slice(2, -2) }, `${idx}-${pIdx}`) : p
      );
    });
  }
  const blocks = md.split(/\n{2,}/).filter((b) => b.trim());
  return /* @__PURE__ */ jsxs4("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs4("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs4("button", { type: "button", className: "fl-btn", onClick: () => copyText(md), children: [
        /* @__PURE__ */ jsx6(Icon, { name: "Copy", size: 12 }),
        " Copy Markdown"
      ] }),
      /* @__PURE__ */ jsxs4(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: () => downloadTextFile(`${artifact.id || "study-guide"}.md`, md, "text/markdown;charset=utf-8"),
          children: [
            /* @__PURE__ */ jsx6(Icon, { name: "Download", size: 12 }),
            " Download .md"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "fl-msg-body", style: { display: "flex", flexDirection: "column", gap: 8 }, children: blocks.map((block, bIdx) => {
      const t = block.trim();
      if (t.startsWith("# ")) return /* @__PURE__ */ jsx6("h2", { style: { fontSize: 16, margin: "4px 0" }, children: renderLine(t.slice(2)) }, bIdx);
      if (t.startsWith("## ")) return /* @__PURE__ */ jsx6("h3", { style: { fontSize: 13.5, margin: "8px 0 2px" }, children: renderLine(t.slice(3)) }, bIdx);
      if (t.startsWith("### ")) return /* @__PURE__ */ jsx6("h3", { style: { fontSize: 12.5, margin: "6px 0 2px" }, children: renderLine(t.slice(4)) }, bIdx);
      const lines = t.split("\n");
      if (lines.every((l) => /^\s*[-*+]\s+/.test(l))) {
        return /* @__PURE__ */ jsx6("ul", { style: { margin: 0, paddingLeft: 18 }, children: lines.map((l, lIdx) => /* @__PURE__ */ jsx6("li", { children: renderLine(l.replace(/^\s*[-*+]\s+/, "")) }, lIdx)) }, bIdx);
      }
      return /* @__PURE__ */ jsx6("p", { children: renderLine(t) }, bIdx);
    }) })
  ] });
}

// desktop-src/components/renderers/FlashcardsView.jsx
import { useEffect as useEffect3, useState as useState4 } from "react";
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
function nextSm2(prev, quality) {
  const ease = Math.max(1.3, (prev?.ease ?? 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  let reps = prev?.reps ?? 0;
  let interval = prev?.interval ?? 1;
  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  return {
    ease: Number(ease.toFixed(2)),
    reps,
    interval,
    due_at: Date.now() / 1e3 + interval * 86400
  };
}
function FlashcardsView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const cards = artifact?.spec?.cards || [];
  const [order, setOrder] = useState4(() => cards.map((_, i) => i));
  const [cursor, setCursor] = useState4(0);
  const [flipped, setFlipped] = useState4(false);
  const [showHint, setShowHint] = useState4(false);
  const [sm2, setSm2] = useState4(() => artifact?.state?.sm2 || {});
  useEffect3(() => {
    setOrder(cards.map((_, i) => i));
    setCursor(0);
    setFlipped(false);
    setShowHint(false);
    setSm2(artifact?.state?.sm2 || {});
  }, [artifact?.id]);
  if (!cards.length) {
    return /* @__PURE__ */ jsx7("div", { className: "fl-empty", children: "No flashcards in this deck." });
  }
  const card = cards[order[cursor] ?? 0] || cards[0];
  const cardId = card.id || String(order[cursor] ?? 0);
  const mastered = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) >= 2).length;
  const due = cards.filter((c, i) => {
    const s = sm2[c.id || String(i)];
    return !s || !s.due_at || s.due_at <= Date.now() / 1e3;
  }).length;
  async function grade(quality) {
    const updated = { ...sm2, [cardId]: nextSm2(sm2[cardId], quality) };
    setSm2(updated);
    setFlipped(false);
    setShowHint(false);
    setCursor((c) => (c + 1) % order.length);
    try {
      const next = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/state`, {
        method: "PATCH",
        body: { sm2: updated }
      });
      onArtifactUpdated?.(next);
    } catch {
    }
  }
  function shuffle() {
    const copy = [...order];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setOrder(copy);
    setCursor(0);
    setFlipped(false);
    setShowHint(false);
  }
  function exportCsv() {
    const rows = [["Front", "Back", "Hint", "Citations"]];
    for (const c of cards) {
      rows.push([c.front || "", c.back || "", c.hint || "", (c.cites || []).join("; ")]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadTextFile(`${artifact.id || "flashcards"}.csv`, csv, "text/csv;charset=utf-8");
  }
  return /* @__PURE__ */ jsxs5("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 12, fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
        /* @__PURE__ */ jsxs5("span", { children: [
          "Card ",
          /* @__PURE__ */ jsxs5("strong", { className: "fl-num", children: [
            cursor + 1,
            "/",
            cards.length
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("span", { children: [
          "Due ",
          /* @__PURE__ */ jsx7("strong", { className: "fl-num", children: due })
        ] }),
        /* @__PURE__ */ jsxs5("span", { children: [
          "Mastered ",
          /* @__PURE__ */ jsx7("strong", { className: "fl-num", children: mastered })
        ] })
      ] }),
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 5 }, children: [
        /* @__PURE__ */ jsxs5("button", { type: "button", className: "fl-btn", onClick: shuffle, children: [
          /* @__PURE__ */ jsx7(Icon, { name: "Shuffle", size: 12 }),
          " Shuffle"
        ] }),
        /* @__PURE__ */ jsxs5("button", { type: "button", className: "fl-btn", onClick: exportCsv, children: [
          /* @__PURE__ */ jsx7(Icon, { name: "Download", size: 12 }),
          " CSV"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx7("div", { className: "fl-src-bar", style: { height: 4 }, children: /* @__PURE__ */ jsx7("div", { className: "fl-src-bar-fill", style: { width: `${Math.round((cursor + 1) / cards.length * 100)}%` } }) }),
    /* @__PURE__ */ jsxs5(
      "div",
      {
        className: "fl-fc-card",
        role: "button",
        tabIndex: 0,
        onClick: () => setFlipped((f) => !f),
        onKeyDown: (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          } else if (e.key === "ArrowRight") {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c + 1) % order.length);
          } else if (e.key === "ArrowLeft") {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c - 1 + order.length) % order.length);
          }
        },
        children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx7("span", { className: "fl-kind-tag", children: flipped ? "Answer" : "Prompt" }),
            /* @__PURE__ */ jsx7("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Click or Space to flip" })
          ] }),
          /* @__PURE__ */ jsx7("div", { style: { fontSize: flipped ? 13.5 : 15, fontWeight: flipped ? 450 : 600, lineHeight: 1.55, color: "var(--ui-text-primary)" }, children: flipped ? card.back : card.front }),
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx7("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, onClick: (e) => e.stopPropagation(), children: (card.cites || []).map((cid, idx) => /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) }),
            !flipped && card.hint ? /* @__PURE__ */ jsx7(
              "button",
              {
                type: "button",
                className: "fl-btn fl-btn-ghost",
                onClick: (e) => {
                  e.stopPropagation();
                  setShowHint((h) => !h);
                },
                children: showHint ? card.hint : "Show hint"
              }
            ) : null
          ] })
        ]
      }
    ),
    flipped ? /* @__PURE__ */ jsxs5("div", { className: "fl-fc-grade-row", children: [
      /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-btn", onClick: () => grade(1), children: "Again (1d)" }),
      /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-btn", onClick: () => grade(3), children: "Hard" }),
      /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-btn fl-btn-primary", onClick: () => grade(4), children: "Good" }),
      /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-btn", onClick: () => grade(5), children: "Easy" })
    ] }) : /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 }, children: [
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: () => {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c - 1 + order.length) % order.length);
          },
          children: [
            /* @__PURE__ */ jsx7(Icon, { name: "ChevronLeft", size: 13 }),
            " Prev"
          ]
        }
      ),
      /* @__PURE__ */ jsx7("button", { type: "button", className: "fl-btn fl-btn-primary", onClick: () => setFlipped(true), children: "Reveal answer" }),
      /* @__PURE__ */ jsxs5(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: () => {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c + 1) % order.length);
          },
          children: [
            "Next ",
            /* @__PURE__ */ jsx7(Icon, { name: "ChevronRight", size: 13 })
          ]
        }
      )
    ] })
  ] });
}

// desktop-src/components/renderers/QuizView.jsx
import { useEffect as useEffect4, useState as useState5 } from "react";
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
function isCorrectChoice(q, chosen) {
  if (chosen === void 0 || chosen === null) return false;
  if (typeof q.answer === "number") return chosen === q.answer;
  if (typeof q.answer === "boolean") return String(chosen).toLowerCase() === String(q.answer).toLowerCase();
  const opts = q.options || [];
  if (typeof chosen === "number" && opts[chosen] !== void 0) {
    return String(opts[chosen]).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  }
  return String(chosen).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
}
function QuizView({ artifact, onOpenChunk }) {
  const questions = artifact?.spec?.questions || [];
  const [answers, setAnswers] = useState5({});
  const [retryMissedOnly, setRetryMissedOnly] = useState5(false);
  useEffect4(() => {
    setAnswers({});
    setRetryMissedOnly(false);
  }, [artifact?.id]);
  if (!questions.length) {
    return /* @__PURE__ */ jsx8("div", { className: "fl-empty", children: "No questions in this quiz." });
  }
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q, idx) => isCorrectChoice(q, answers[q.id || idx])).length;
  const visible = retryMissedOnly ? questions.filter((q, idx) => {
    const key = q.id || idx;
    return answers[key] !== void 0 && !isCorrectChoice(q, answers[key]);
  }) : questions;
  return /* @__PURE__ */ jsxs6("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs6("div", { className: "fl-kpi-strip", children: [
      /* @__PURE__ */ jsxs6("div", { className: "fl-kpi", children: [
        /* @__PURE__ */ jsx8("div", { className: "fl-kpi-label", children: "Answered" }),
        /* @__PURE__ */ jsxs6("div", { className: "fl-kpi-val", children: [
          answeredCount,
          " / ",
          questions.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "fl-kpi", children: [
        /* @__PURE__ */ jsx8("div", { className: "fl-kpi-label", children: "Score" }),
        /* @__PURE__ */ jsx8("div", { className: "fl-kpi-val", style: { color: "var(--fl-ok)" }, children: answeredCount ? `${Math.round(correctCount / answeredCount * 100)}%` : "0%" })
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "fl-kpi", children: [
        /* @__PURE__ */ jsx8("div", { className: "fl-kpi-label", children: "Missed" }),
        /* @__PURE__ */ jsx8("div", { className: "fl-kpi-val", children: Math.max(0, answeredCount - correctCount) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs6("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx8(
        "button",
        {
          type: "button",
          className: "fl-btn",
          "data-active": retryMissedOnly,
          disabled: answeredCount - correctCount <= 0,
          onClick: () => setRetryMissedOnly((v) => !v),
          children: "Missed only"
        }
      ),
      /* @__PURE__ */ jsxs6(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: () => {
            setAnswers({});
            setRetryMissedOnly(false);
          },
          children: [
            /* @__PURE__ */ jsx8(Icon, { name: "RotateCcw", size: 12 }),
            " Reset"
          ]
        }
      )
    ] }),
    visible.map((q, idx) => {
      const key = q.id || idx;
      const chosen = answers[key];
      const answered = chosen !== void 0;
      const ok = answered && isCorrectChoice(q, chosen);
      const opts = q.options && q.options.length ? q.options : q.type === "tf" ? ["True", "False"] : [];
      return /* @__PURE__ */ jsxs6("article", { className: "fl-ledger-row", children: [
        /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }, children: [
          /* @__PURE__ */ jsxs6("div", { style: { fontWeight: 600, fontSize: 12.5 }, children: [
            /* @__PURE__ */ jsxs6("span", { className: "fl-mono", style: { color: "var(--ui-text-tertiary)", marginRight: 6 }, children: [
              "Q",
              idx + 1
            ] }),
            q.prompt
          ] }),
          answered ? /* @__PURE__ */ jsx8("span", { className: "fl-verdict", "data-v": ok ? "supported" : "unsupported", children: ok ? "Correct" : "Missed" }) : null
        ] }),
        opts.length > 0 ? /* @__PURE__ */ jsx8("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }, children: opts.map((opt, oi) => {
          const isSelected = chosen === oi;
          const isRight = isCorrectChoice(q, oi);
          let border = "var(--ui-stroke-secondary)";
          let bg = "var(--ui-bg-primary)";
          if (answered && isRight) {
            border = "var(--fl-ok)";
            bg = "color-mix(in srgb, var(--fl-ok) 12%, var(--ui-bg-primary))";
          } else if (answered && isSelected && !isRight) {
            border = "var(--fl-bad)";
            bg = "color-mix(in srgb, var(--fl-bad) 12%, var(--ui-bg-primary))";
          }
          return /* @__PURE__ */ jsxs6(
            "button",
            {
              type: "button",
              className: "fl-btn",
              style: {
                height: "auto",
                minHeight: 32,
                padding: "7px 10px",
                justifyContent: "flex-start",
                textAlign: "left",
                whiteSpace: "normal",
                borderColor: border,
                background: bg,
                color: "var(--ui-text-primary)"
              },
              onClick: () => setAnswers((prev) => ({ ...prev, [key]: oi })),
              children: [
                /* @__PURE__ */ jsxs6("span", { className: "fl-mono", style: { color: "var(--ui-text-tertiary)", marginRight: 6 }, children: [
                  String.fromCharCode(65 + oi),
                  "."
                ] }),
                /* @__PURE__ */ jsx8("span", { children: opt })
              ]
            },
            oi
          );
        }) }) : /* @__PURE__ */ jsx8("div", { style: { display: "flex", gap: 6, marginTop: 4 }, children: /* @__PURE__ */ jsx8(
          "input",
          {
            className: "fl-input",
            placeholder: "Type your answer and press Enter...",
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                setAnswers((prev) => ({ ...prev, [key]: e.currentTarget.value }));
              }
            }
          }
        ) }),
        answered ? /* @__PURE__ */ jsxs6("div", { className: "fl-quote-box", style: { marginTop: 4 }, children: [
          /* @__PURE__ */ jsx8("div", { children: q.explanation || `Expected answer: ${String(q.answer)}` }),
          (q.cites || []).length > 0 ? /* @__PURE__ */ jsxs6("div", { style: { marginTop: 6, display: "flex", gap: 4, alignItems: "center" }, children: [
            /* @__PURE__ */ jsx8("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Source:" }),
            (q.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx8("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), children: cIdx + 1 }, cid))
          ] }) : null
        ] }) : null
      ] }, key);
    })
  ] });
}

// desktop-src/components/renderers/MindMapView.jsx
import { useMemo, useRef as useRef4, useState as useState6 } from "react";
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
function layoutTree(root, collapsed) {
  const nodes = [];
  const edges = [];
  let leafY = 0;
  const xStep = 192;
  const yStep = 58;
  function walk(node, depth, parentId) {
    const id = node.id || `${depth}-${nodes.length}`;
    const kids = !collapsed[id] && Array.isArray(node.children) ? node.children : [];
    const item = {
      id,
      label: String(node.label || "Node"),
      summary: String(node.summary || ""),
      cites: node.cites || [],
      depth,
      hasChildren: Array.isArray(node.children) && node.children.length > 0,
      collapsed: Boolean(collapsed[id]),
      x: 40 + depth * xStep,
      y: 0
    };
    if (!kids.length) {
      item.y = 44 + leafY * yStep;
      leafY += 1;
      nodes.push(item);
    } else {
      const childPositions = kids.map((k) => walk(k, depth + 1, id));
      item.y = (childPositions[0].y + childPositions[childPositions.length - 1].y) / 2;
      nodes.push(item);
    }
    if (parentId) {
      edges.push({ from: parentId, to: id });
    }
    return item;
  }
  if (root) walk(root, 0, null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const maxX = Math.max(540, ...nodes.map((n) => n.x + 170));
  const maxY = Math.max(320, ...nodes.map((n) => n.y + 48));
  return { nodes, edges, byId, width: maxX, height: maxY };
}
function MindMapView({ artifact, onOpenChunk }) {
  const root = artifact?.spec?.root;
  const [zoom, setZoom] = useState6(1);
  const [pan, setPan] = useState6({ x: 0, y: 0 });
  const [dragging, setDragging] = useState6(null);
  const [collapsed, setCollapsed] = useState6({});
  const [selected, setSelected] = useState6(null);
  const svgRef = useRef4(null);
  const graph = useMemo(() => layoutTree(root, collapsed), [root, collapsed]);
  const titleId = `fl-mm-title-${artifact?.id || "map"}`;
  const descId = `fl-mm-desc-${artifact?.id || "map"}`;
  if (!root) {
    return /* @__PURE__ */ jsx9("div", { className: "fl-empty", children: "No mind map structure available." });
  }
  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    await copyText(svgText);
    sdk.host?.notify?.({ kind: "success", title: "Folio", message: "Copied standalone SVG to clipboard." });
  }
  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    downloadTextFile(`${artifact.id || "mindmap"}.svg`, svgText, "image/svg+xml;charset=utf-8");
  }
  const activeNode = selected ? graph.byId.get(selected) : graph.nodes.find((n) => n.depth === 0);
  return /* @__PURE__ */ jsxs7("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs7("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 4 }, children: [
        /* @__PURE__ */ jsx9("button", { type: "button", className: "fl-btn fl-btn-icon", title: "Zoom out", onClick: () => setZoom((z) => Math.max(0.45, Number((z - 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx9(Icon, { name: "Minus", size: 13 }) }),
        /* @__PURE__ */ jsx9("button", { type: "button", className: "fl-btn", onClick: () => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }, children: /* @__PURE__ */ jsxs7("span", { className: "fl-mono", children: [
          Math.round(zoom * 100),
          "%"
        ] }) }),
        /* @__PURE__ */ jsx9("button", { type: "button", className: "fl-btn fl-btn-icon", title: "Zoom in", onClick: () => setZoom((z) => Math.min(2, Number((z + 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx9(Icon, { name: "Plus", size: 13 }) })
      ] }),
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 5 }, children: [
        /* @__PURE__ */ jsxs7("button", { type: "button", className: "fl-btn", onClick: handleCopySvg, children: [
          /* @__PURE__ */ jsx9(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs7("button", { type: "button", className: "fl-btn", onClick: handleDownloadSvg, children: [
          /* @__PURE__ */ jsx9(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx9(
      "div",
      {
        className: "fl-svg-stage",
        style: { height: 340, cursor: dragging ? "grabbing" : "grab", userSelect: "none" },
        onPointerDown: (e) => {
          if (e.target.closest("g[data-node]")) return;
          setDragging({ sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y });
        },
        onPointerMove: (e) => {
          if (!dragging) return;
          setPan({ x: dragging.ox + (e.clientX - dragging.sx), y: dragging.oy + (e.clientY - dragging.sy) });
        },
        onPointerUp: () => setDragging(null),
        onPointerLeave: () => setDragging(null),
        children: /* @__PURE__ */ jsxs7(
          "svg",
          {
            ref: svgRef,
            role: "img",
            "aria-labelledby": `${titleId} ${descId}`,
            width: "100%",
            height: "100%",
            viewBox: `0 0 ${graph.width} ${graph.height}`,
            style: { display: "block", background: "var(--ui-bg-secondary)" },
            children: [
              /* @__PURE__ */ jsx9("title", { id: titleId, children: artifact?.spec?.title || "Concept Mind Map" }),
              /* @__PURE__ */ jsxs7("desc", { id: descId, children: [
                "Interactive hierarchical concept map with ",
                graph.nodes.length,
                " nodes grounded in notebook sources."
              ] }),
              /* @__PURE__ */ jsxs7("g", { transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`, children: [
                graph.edges.map((ed, i) => {
                  const a = graph.byId.get(ed.from);
                  const b = graph.byId.get(ed.to);
                  if (!a || !b) return null;
                  const sx = a.x + 150;
                  const sy = a.y;
                  const tx = b.x;
                  const ty = b.y;
                  const mx = (sx + tx) / 2;
                  return /* @__PURE__ */ jsx9(
                    "path",
                    {
                      d: `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`,
                      fill: "none",
                      stroke: "var(--ui-stroke-secondary)",
                      strokeWidth: "1.5"
                    },
                    i
                  );
                }),
                graph.nodes.map((n) => {
                  const isRoot = n.depth === 0;
                  const isSel = activeNode && activeNode.id === n.id;
                  const label = n.label.length > 22 ? `${n.label.slice(0, 21)}...` : n.label;
                  return /* @__PURE__ */ jsxs7(
                    "g",
                    {
                      "data-node": n.id,
                      transform: `translate(${n.x}, ${n.y - 18})`,
                      style: { cursor: "pointer" },
                      onClick: () => setSelected(n.id),
                      onDoubleClick: () => {
                        if (n.hasChildren) setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                      },
                      children: [
                        /* @__PURE__ */ jsx9(
                          "rect",
                          {
                            width: "150",
                            height: "36",
                            rx: "8",
                            fill: isRoot || isSel ? "var(--fl-accent-soft)" : "var(--ui-bg-primary)",
                            stroke: isRoot || isSel ? "var(--ui-accent)" : "var(--ui-stroke-secondary)",
                            strokeWidth: isRoot || isSel ? "1.6" : "1"
                          }
                        ),
                        /* @__PURE__ */ jsx9(
                          "text",
                          {
                            x: "12",
                            y: "22",
                            fill: "var(--ui-text-primary)",
                            fontSize: "12",
                            fontWeight: isRoot ? "650" : "500",
                            fontFamily: "system-ui, -apple-system, sans-serif",
                            children: label
                          }
                        ),
                        n.hasChildren ? /* @__PURE__ */ jsxs7(
                          "g",
                          {
                            transform: "translate(136, 18)",
                            onClick: (e) => {
                              e.stopPropagation();
                              setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                            },
                            children: [
                              /* @__PURE__ */ jsx9("circle", { r: "7", fill: "var(--ui-bg-secondary)", stroke: "var(--ui-stroke-secondary)", strokeWidth: "1" }),
                              /* @__PURE__ */ jsx9("text", { textAnchor: "middle", y: "3.5", fill: "var(--ui-text-secondary)", fontSize: "10", fontWeight: "700", children: n.collapsed ? "+" : "-" })
                            ]
                          }
                        ) : null
                      ]
                    },
                    n.id
                  );
                })
              ] })
            ]
          }
        )
      }
    ),
    activeNode ? /* @__PURE__ */ jsxs7("div", { className: "fl-ledger-row", children: [
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx9("strong", { style: { fontSize: 12.5 }, children: activeNode.label }),
        /* @__PURE__ */ jsx9("div", { style: { display: "flex", gap: 4 }, children: (activeNode.cites || []).map((cid, idx) => /* @__PURE__ */ jsx9("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) })
      ] }),
      activeNode.summary ? /* @__PURE__ */ jsx9("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: activeNode.summary }) : null
    ] }) : null
  ] });
}

// desktop-src/components/renderers/InfographicView.jsx
import { useRef as useRef5 } from "react";
import { Fragment as Fragment3, jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function wrapText(text, maxChars, maxLines = 4) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}
function InfographicView({ artifact, onOpenChunk }) {
  const spec = artifact?.spec || {};
  const blocks = spec.blocks || [];
  const layout = spec.layout || "stat-grid";
  const svgRef = useRef5(null);
  if (!blocks.length) {
    return /* @__PURE__ */ jsx10("div", { className: "fl-empty", children: "No infographic blocks available." });
  }
  const W = 720;
  const isTimeline = layout === "timeline" || layout === "process";
  const cols = isTimeline ? 1 : 2;
  const rows = Math.ceil(blocks.length / cols);
  const cardH = isTimeline ? 94 : 138;
  const gap = 14;
  const headerH = 82;
  const H = headerH + rows * cardH + Math.max(0, rows - 1) * gap + 28;
  const titleId = `fl-inf-title-${artifact?.id || "info"}`;
  const descId = `fl-inf-desc-${artifact?.id || "info"}`;
  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    await copyText(svgText);
    sdk.host?.notify?.({ kind: "success", title: "Folio", message: "Copied standalone infographic SVG." });
  }
  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    downloadTextFile(`${artifact.id || "infographic"}.svg`, svgText, "image/svg+xml;charset=utf-8");
  }
  return /* @__PURE__ */ jsxs8("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsx10("span", { className: "fl-kind-tag", children: layout }),
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", gap: 5 }, children: [
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "fl-btn", onClick: handleCopySvg, children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "fl-btn", onClick: handleDownloadSvg, children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { className: "fl-svg-stage", children: /* @__PURE__ */ jsxs8(
      "svg",
      {
        ref: svgRef,
        role: "img",
        "aria-labelledby": `${titleId} ${descId}`,
        width: "100%",
        viewBox: `0 0 ${W} ${H}`,
        style: { display: "block", background: "var(--ui-bg-secondary)" },
        children: [
          /* @__PURE__ */ jsx10("title", { id: titleId, children: spec.title || "Infographic" }),
          /* @__PURE__ */ jsx10("desc", { id: descId, children: spec.subtitle || `Structured ${layout} infographic with ${blocks.length} cited items.` }),
          /* @__PURE__ */ jsx10("rect", { x: "0", y: "0", width: W, height: H, fill: "var(--ui-bg-secondary)" }),
          /* @__PURE__ */ jsx10("text", { x: "24", y: "38", fill: "var(--ui-text-primary)", fontSize: "20", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: String(spec.title || "Infographic").slice(0, 62) }),
          spec.subtitle ? /* @__PURE__ */ jsx10("text", { x: "24", y: "59", fill: "var(--ui-text-secondary)", fontSize: "12.5", fontFamily: "system-ui, -apple-system, sans-serif", children: String(spec.subtitle).slice(0, 96) }) : null,
          /* @__PURE__ */ jsx10("line", { x1: "24", y1: "72", x2: W - 24, y2: "72", stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1" }),
          isTimeline ? /* @__PURE__ */ jsx10("line", { x1: "48", y1: headerH + 22, x2: "48", y2: H - 36, stroke: "var(--ui-stroke-secondary)", strokeWidth: "2" }) : null,
          blocks.map((blk, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cardW = isTimeline ? W - 96 : (W - 48 - gap) / 2;
            const x = isTimeline ? 72 : 24 + col * (cardW + gap);
            const y = headerH + row * (cardH + gap);
            const bodyLines = wrapText(blk.body, isTimeline ? 76 : 42, 4);
            return /* @__PURE__ */ jsxs8("g", { children: [
              isTimeline ? /* @__PURE__ */ jsxs8(Fragment3, { children: [
                /* @__PURE__ */ jsx10("circle", { cx: "48", cy: y + 28, r: "13", fill: "var(--fl-accent-soft)", stroke: "var(--ui-accent)", strokeWidth: "1.5" }),
                /* @__PURE__ */ jsx10("text", { x: "48", y: y + 32, textAnchor: "middle", fill: "var(--ui-accent)", fontSize: "11", fontWeight: "700", fontFamily: "ui-monospace, monospace", children: idx + 1 })
              ] }) : null,
              /* @__PURE__ */ jsx10(
                "rect",
                {
                  x,
                  y,
                  width: cardW,
                  height: cardH,
                  rx: "10",
                  fill: "var(--ui-bg-primary)",
                  stroke: "var(--ui-stroke-secondary)",
                  strokeWidth: "1"
                }
              ),
              blk.value ? /* @__PURE__ */ jsx10(
                "text",
                {
                  x: x + 14,
                  y: y + 30,
                  fill: "var(--ui-accent)",
                  fontSize: isTimeline ? "15" : "22",
                  fontWeight: "750",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: String(blk.value).slice(0, 22)
                }
              ) : null,
              /* @__PURE__ */ jsx10(
                "text",
                {
                  x: x + 14,
                  y: y + (blk.value ? 50 : 28),
                  fill: "var(--ui-text-primary)",
                  fontSize: "13",
                  fontWeight: "650",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  children: String(blk.heading || `Item ${idx + 1}`).slice(0, isTimeline ? 64 : 36)
                }
              ),
              /* @__PURE__ */ jsx10(
                "text",
                {
                  x: x + 14,
                  y: y + (blk.value ? 69 : 48),
                  fill: "var(--ui-text-secondary)",
                  fontSize: "11.5",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  children: bodyLines.map((ln, lIdx) => /* @__PURE__ */ jsx10("tspan", { x: x + 14, dy: lIdx === 0 ? 0 : 15, children: ln }, lIdx))
                }
              )
            ] }, blk.id || idx);
          })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs8("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx10("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Cited passages:" }),
      Array.from(new Set(blocks.flatMap((b) => b.cites || []))).map((cid, idx) => /* @__PURE__ */ jsx10("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid))
    ] })
  ] });
}

// desktop-src/components/renderers/DataTableView.jsx
import { useMemo as useMemo2, useState as useState7 } from "react";
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
function DataTableView({ artifact, onOpenChunk }) {
  const cols = artifact?.spec?.columns || [];
  const rows = artifact?.spec?.rows || [];
  const [query, setQuery] = useState7("");
  const [sort, setSort] = useState7({ key: null, dir: "asc" });
  const filtered = useMemo2(() => {
    const q = query.trim().toLowerCase();
    let list = q ? rows.filter(
      (r) => Object.values(r.cells || {}).some((v) => String(v ?? "").toLowerCase().includes(q))
    ) : [...rows];
    if (sort.key) {
      list.sort((a, b) => {
        const av = a.cells?.[sort.key] ?? "";
        const bv = b.cells?.[sort.key] ?? "";
        const an = Number(av);
        const bn = Number(bv);
        const cmp = !Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== "" ? an - bn : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, query, sort]);
  if (!cols.length) {
    return /* @__PURE__ */ jsx11("div", { className: "fl-empty", children: "No table columns available." });
  }
  function toggleSort(key) {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }
  function toMarkdown() {
    const head = "| " + cols.map((c) => c.label || c.key).join(" | ") + " |";
    const sep = "| " + cols.map(() => "---").join(" | ") + " |";
    const body = filtered.map((r) => "| " + cols.map((c) => String(r.cells?.[c.key] ?? "").replace(/\|/g, "\\|")).join(" | ") + " |");
    return [head, sep, ...body].join("\n");
  }
  function exportCsv() {
    const out = [cols.map((c) => c.label || c.key).concat("Citations")];
    for (const r of filtered) {
      out.push(cols.map((c) => String(r.cells?.[c.key] ?? "")).concat((r.cites || []).join("; ")));
    }
    const csv = out.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadTextFile(`${artifact.id || "table"}.csv`, csv, "text/csv;charset=utf-8");
  }
  return /* @__PURE__ */ jsxs9("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx11(
        "input",
        {
          className: "fl-input",
          style: { flex: 1, minWidth: 150 },
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: "Filter rows..."
        }
      ),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          type: "button",
          className: "fl-btn",
          onClick: async () => {
            await copyText(toMarkdown());
            sdk.host?.notify?.({ kind: "success", title: "Folio", message: "Copied Markdown table." });
          },
          children: [
            /* @__PURE__ */ jsx11(Icon, { name: "Copy", size: 12 }),
            " Markdown"
          ]
        }
      ),
      /* @__PURE__ */ jsxs9("button", { type: "button", className: "fl-btn", onClick: exportCsv, children: [
        /* @__PURE__ */ jsx11(Icon, { name: "Download", size: 12 }),
        " CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsx11("div", { className: "fl-table-wrap fl-scroll", style: { maxHeight: 420 }, children: /* @__PURE__ */ jsxs9("table", { className: "fl-table", children: [
      /* @__PURE__ */ jsx11("thead", { children: /* @__PURE__ */ jsxs9("tr", { children: [
        cols.map((c) => /* @__PURE__ */ jsxs9("th", { onClick: () => toggleSort(c.key), children: [
          c.label || c.key,
          " ",
          sort.key === c.key ? sort.dir === "asc" ? "\u2191" : "\u2193" : ""
        ] }, c.key)),
        /* @__PURE__ */ jsx11("th", { children: "Cite" })
      ] }) }),
      /* @__PURE__ */ jsx11("tbody", { children: filtered.map((r, rIdx) => /* @__PURE__ */ jsxs9("tr", { children: [
        cols.map((c) => /* @__PURE__ */ jsx11("td", { className: c.type === "number" ? "fl-num" : void 0, children: String(r.cells?.[c.key] ?? "") }, c.key)),
        /* @__PURE__ */ jsx11("td", { style: { whiteSpace: "nowrap" }, children: (r.cites || []).map((cid, idx) => /* @__PURE__ */ jsx11("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) })
      ] }, r.id || rIdx)) })
    ] }) })
  ] });
}

// desktop-src/components/renderers/SlideDeckView.jsx
import { useEffect as useEffect5, useState as useState8 } from "react";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function SlideDeckView({ artifact, onOpenChunk }) {
  const slides = artifact?.spec?.slides || [];
  const [idx, setIdx] = useState8(0);
  const [showNotes, setShowNotes] = useState8(true);
  useEffect5(() => {
    setIdx(0);
  }, [artifact?.id]);
  if (!slides.length) {
    return /* @__PURE__ */ jsx12("div", { className: "fl-empty", children: "No slides in this deck." });
  }
  const sl = slides[idx] || slides[0];
  function toMarp() {
    const lines = ["---", "marp: true", `title: ${artifact?.spec?.title || "Folio Deck"}`, "paginate: true", "---", ""];
    slides.forEach((s, i) => {
      if (i > 0) lines.push("\n---\n");
      lines.push(`# ${s.title || ""}
`);
      if (s.stat?.value) lines.push(`## ${s.stat.value}
${s.stat.label || ""}
`);
      (s.bullets || []).forEach((b) => lines.push(`- ${b}`));
      if (s.body) lines.push(`
${s.body}`);
      if (s.notes) lines.push(`
<!--
${s.notes}
-->`);
    });
    return lines.join("\n");
  }
  return /* @__PURE__ */ jsxs10(
    "div",
    {
      style: { display: "flex", flexDirection: "column", gap: 10 },
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "ArrowRight") setIdx((i) => Math.min(slides.length - 1, i + 1));
        if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      },
      children: [
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
            /* @__PURE__ */ jsx12("button", { type: "button", className: "fl-btn fl-btn-icon", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)), children: /* @__PURE__ */ jsx12(Icon, { name: "ChevronLeft", size: 13 }) }),
            /* @__PURE__ */ jsxs10("span", { className: "fl-mono", style: { fontSize: 12, color: "var(--ui-text-secondary)", padding: "0 4px" }, children: [
              idx + 1,
              " / ",
              slides.length
            ] }),
            /* @__PURE__ */ jsx12("button", { type: "button", className: "fl-btn fl-btn-icon", disabled: idx >= slides.length - 1, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: /* @__PURE__ */ jsx12(Icon, { name: "ChevronRight", size: 13 }) })
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 5 }, children: [
            /* @__PURE__ */ jsx12("button", { type: "button", className: "fl-btn", "data-active": showNotes, onClick: () => setShowNotes((v) => !v), children: "Speaker notes" }),
            /* @__PURE__ */ jsxs10("button", { type: "button", className: "fl-btn", onClick: () => copyText(toMarp()), children: [
              /* @__PURE__ */ jsx12(Icon, { name: "Copy", size: 12 }),
              " Marp"
            ] }),
            /* @__PURE__ */ jsxs10("button", { type: "button", className: "fl-btn", onClick: () => downloadTextFile(`${artifact.id || "deck"}.marp.md`, toMarp(), "text/markdown;charset=utf-8"), children: [
              /* @__PURE__ */ jsx12(Icon, { name: "Download", size: 12 }),
              " .md"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("section", { className: "fl-slide-stage", children: [
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx12("span", { className: "fl-kind-tag", children: sl.layout || "slide" }),
            /* @__PURE__ */ jsx12("span", { className: "fl-mono", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: String(idx + 1).padStart(2, "0") })
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", flexDirection: "column", gap: 10, my: "auto" }, children: [
            /* @__PURE__ */ jsx12("h2", { style: { margin: 0, fontSize: sl.layout === "title" ? 21 : 17, fontWeight: 700, lineHeight: 1.25 }, children: sl.title }),
            sl.stat?.value ? /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "baseline", gap: 12 }, children: [
              /* @__PURE__ */ jsx12("span", { className: "fl-mono", style: { fontSize: 32, fontWeight: 750, color: "var(--ui-accent)", lineHeight: 1 }, children: sl.stat.value }),
              /* @__PURE__ */ jsx12("span", { style: { fontSize: 12.5, color: "var(--ui-text-secondary)" }, children: sl.stat.label })
            ] }) : null,
            sl.body ? /* @__PURE__ */ jsx12("p", { style: { margin: 0, fontSize: 13, color: "var(--ui-text-secondary)", lineHeight: 1.5 }, children: sl.body }) : null,
            (sl.bullets || []).length > 0 ? /* @__PURE__ */ jsx12("ul", { style: { margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5 }, children: sl.bullets.map((b, bIdx) => /* @__PURE__ */ jsx12("li", { children: b }, bIdx)) }) : null
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx12("div", { style: { display: "flex", gap: 4 }, children: (sl.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx12("button", { type: "button", className: "fl-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) }),
            /* @__PURE__ */ jsx12("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: artifact?.spec?.title || "Folio Deck" })
          ] })
        ] }),
        showNotes && sl.notes ? /* @__PURE__ */ jsxs10("div", { className: "fl-quote-box", children: [
          /* @__PURE__ */ jsx12("strong", { style: { display: "block", fontSize: 11, color: "var(--ui-text-tertiary)", marginBottom: 3 }, children: "SPEAKER NOTES" }),
          sl.notes
        ] }) : null,
        /* @__PURE__ */ jsx12("div", { className: "fl-slide-strip fl-scroll", children: slides.map((s, sIdx) => /* @__PURE__ */ jsxs10(
          "button",
          {
            type: "button",
            className: "fl-slide-thumb",
            "data-active": sIdx === idx,
            onClick: () => setIdx(sIdx),
            children: [
              /* @__PURE__ */ jsx12("div", { className: "fl-mono", style: { fontSize: 10, color: "var(--ui-text-tertiary)" }, children: sIdx + 1 }),
              /* @__PURE__ */ jsx12("div", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 550, marginTop: 2 }, children: s.title })
            ]
          },
          sIdx
        )) })
      ]
    }
  );
}

// desktop-src/components/StudioPanel.jsx
import { Fragment as Fragment4, jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var STUDIO_FORMATS = [
  { kind: "report", label: "Study Guide", icon: "FileText" },
  { kind: "mindmap", label: "Mind Map", icon: "GitBranch" },
  { kind: "flashcards", label: "Flashcards", icon: "Layers" },
  { kind: "quiz", label: "Quiz", icon: "CheckSquare" },
  { kind: "infographic", label: "Infographic", icon: "LayoutGrid" },
  { kind: "table", label: "Data Table", icon: "Table" },
  { kind: "slides", label: "Slide Deck", icon: "Presentation", wide: true }
];
var KIND_META = Object.fromEntries(STUDIO_FORMATS.map((f) => [f.kind, f]));
function StudioPanel({
  ctx,
  nbId,
  hasActiveSources,
  artifacts,
  selectedArtifactId,
  expanded,
  onToggleExpand,
  onSelectArtifact,
  onOpenChunk,
  onRefresh,
  onError
}) {
  const [activeArt, setActiveArt] = useState9(null);
  const [loadingArt, setLoadingArt] = useState9(false);
  const [runningKind, setRunningKind] = useState9("");
  const [stage, setStage] = useState9("");
  const [focusPrompt, setFocusPrompt] = useState9("");
  const cancelPollRef = useRef6(null);
  useEffect6(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect6(() => {
    if (!nbId || !selectedArtifactId) {
      setActiveArt(null);
      return;
    }
    let alive = true;
    setLoadingArt(true);
    api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(selectedArtifactId)}`).then((res) => {
      if (alive) setActiveArt(res);
    }).catch((err) => {
      if (alive) onError?.(err.message || "Could not load artifact.");
    }).finally(() => {
      if (alive) setLoadingArt(false);
    });
    return () => {
      alive = false;
    };
  }, [nbId, selectedArtifactId]);
  async function runGenerator(kind) {
    if (!nbId || !hasActiveSources || runningKind) return;
    setRunningKind(kind);
    setStage(`Generating ${KIND_META[kind]?.label || kind}...`);
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/studio`, {
        method: "POST",
        body: {
          kind,
          params: focusPrompt.trim() ? { focus: focusPrompt.trim() } : {}
        }
      });
      cancelPollRef.current?.();
      cancelPollRef.current = pollJob(
        ctx,
        job,
        (j) => setStage(j.stage || "Working..."),
        async (result) => {
          setRunningKind("");
          setStage("");
          await onRefresh();
          if (result?.id) {
            onSelectArtifact?.(result.id);
          }
        },
        (err) => {
          setRunningKind("");
          setStage("");
          onError?.(err.message || `Could not generate ${kind}.`);
        }
      );
    } catch (err) {
      setRunningKind("");
      setStage("");
      onError?.(err.message || `Could not start ${kind}.`);
    }
  }
  async function deleteArtifact(e, aid) {
    e.stopPropagation();
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(aid)}`, { method: "DELETE" });
      if (selectedArtifactId === aid) {
        onSelectArtifact?.(null);
        setActiveArt(null);
      }
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not delete artifact.");
    }
  }
  function renderViewer() {
    if (loadingArt) return /* @__PURE__ */ jsx13("div", { className: "fl-empty", children: "Loading artifact..." });
    if (!activeArt) return null;
    switch (activeArt.kind) {
      case "report":
        return /* @__PURE__ */ jsx13(StudyGuideView, { artifact: activeArt, onOpenChunk });
      case "flashcards":
        return /* @__PURE__ */ jsx13(FlashcardsView, { nbId, artifact: activeArt, onOpenChunk, onArtifactUpdated: setActiveArt });
      case "quiz":
        return /* @__PURE__ */ jsx13(QuizView, { artifact: activeArt, onOpenChunk });
      case "mindmap":
        return /* @__PURE__ */ jsx13(MindMapView, { artifact: activeArt, onOpenChunk });
      case "infographic":
        return /* @__PURE__ */ jsx13(InfographicView, { artifact: activeArt, onOpenChunk });
      case "table":
        return /* @__PURE__ */ jsx13(DataTableView, { artifact: activeArt, onOpenChunk });
      case "slides":
        return /* @__PURE__ */ jsx13(SlideDeckView, { artifact: activeArt, onOpenChunk });
      default:
        return /* @__PURE__ */ jsx13("pre", { className: "fl-mono", style: { fontSize: 11 }, children: JSON.stringify(activeArt.spec, null, 2) });
    }
  }
  return /* @__PURE__ */ jsx13("aside", { className: "fl-pane fl-pane-right", "aria-label": "Studio", children: selectedArtifactId && activeArt ? /* @__PURE__ */ jsxs11("div", { className: "fl-viewer", children: [
    /* @__PURE__ */ jsxs11("div", { className: "fl-viewer-head", children: [
      /* @__PURE__ */ jsxs11("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx13(
          "button",
          {
            type: "button",
            className: "fl-btn fl-btn-ghost fl-btn-icon",
            title: "Back to Studio",
            onClick: () => {
              onSelectArtifact?.(null);
              if (expanded) onToggleExpand?.();
            },
            children: /* @__PURE__ */ jsx13(Icon, { name: "ArrowLeft", size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs11("div", { style: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx13("div", { className: "fl-src-title", title: activeArt.title, children: activeArt.title }),
          /* @__PURE__ */ jsxs11("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
            KIND_META[activeArt.kind]?.label || activeArt.kind,
            activeArt.grounding?.mode === "extractive" ? " | Local extractive" : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx13("div", { style: { display: "flex", gap: 4 }, children: /* @__PURE__ */ jsx13(
        "button",
        {
          type: "button",
          className: "fl-btn fl-btn-icon",
          title: expanded ? "Dock Studio rail" : "Expand Studio canvas",
          onClick: onToggleExpand,
          children: /* @__PURE__ */ jsx13(Icon, { name: expanded ? "Minimize2" : "Maximize2", size: 13 })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "fl-viewer-body fl-scroll", children: renderViewer() })
  ] }) : /* @__PURE__ */ jsxs11(Fragment4, { children: [
    /* @__PURE__ */ jsxs11("div", { className: "fl-pane-head", children: [
      /* @__PURE__ */ jsx13("span", { className: "fl-pane-title", children: "Studio" }),
      /* @__PURE__ */ jsxs11("span", { className: "fl-num", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
        artifacts.length,
        " saved"
      ] })
    ] }),
    /* @__PURE__ */ jsx13("div", { style: { padding: "10px 12px 0" }, children: /* @__PURE__ */ jsx13(
      "input",
      {
        className: "fl-input",
        value: focusPrompt,
        onChange: (e) => setFocusPrompt(e.target.value),
        placeholder: "Optional focus topic for next artifact...",
        "aria-label": "Studio focus topic"
      }
    ) }),
    /* @__PURE__ */ jsx13("div", { className: "fl-studio-grid", children: STUDIO_FORMATS.map((fmt) => /* @__PURE__ */ jsxs11(
      "button",
      {
        type: "button",
        className: `fl-studio-tile${fmt.wide ? " fl-studio-tile-wide" : ""}`,
        disabled: !hasActiveSources || Boolean(runningKind),
        onClick: () => runGenerator(fmt.kind),
        children: [
          /* @__PURE__ */ jsx13(Icon, { name: fmt.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
          /* @__PURE__ */ jsx13("span", { children: runningKind === fmt.kind ? "Generating..." : fmt.label })
        ]
      },
      fmt.kind
    )) }),
    runningKind ? /* @__PURE__ */ jsx13("div", { style: { padding: "0 12px 8px", fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: stage }) : null,
    /* @__PURE__ */ jsx13("div", { className: "fl-pane-head", style: { borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: /* @__PURE__ */ jsx13("span", { className: "fl-pane-title", children: "Artifacts" }) }),
    /* @__PURE__ */ jsx13("div", { className: "fl-art-list fl-scroll", children: artifacts.length === 0 ? /* @__PURE__ */ jsxs11("div", { className: "fl-empty", children: [
      /* @__PURE__ */ jsx13(Icon, { name: "Layers", size: 22 }),
      /* @__PURE__ */ jsx13("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No artifacts yet" }),
      /* @__PURE__ */ jsx13("div", { style: { fontSize: 11.5 }, children: "Pick any format above to turn your active sources into an interactive artifact." })
    ] }) : artifacts.map((art) => {
      const meta = KIND_META[art.kind] || { label: art.kind, icon: "FileText" };
      return /* @__PURE__ */ jsxs11(
        "div",
        {
          className: "fl-art-item",
          "data-active": selectedArtifactId === art.id,
          role: "button",
          tabIndex: 0,
          onClick: () => onSelectArtifact?.(art.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectArtifact?.(art.id);
            }
          },
          children: [
            /* @__PURE__ */ jsxs11("div", { style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0 }, children: [
              /* @__PURE__ */ jsx13(Icon, { name: meta.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
              /* @__PURE__ */ jsxs11("div", { style: { minWidth: 0 }, children: [
                /* @__PURE__ */ jsx13("div", { className: "fl-src-title", title: art.title, children: art.title }),
                /* @__PURE__ */ jsx13("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: meta.label })
              ] })
            ] }),
            /* @__PURE__ */ jsx13(
              "button",
              {
                type: "button",
                className: "fl-btn fl-btn-ghost fl-btn-icon fl-btn-danger",
                title: "Delete artifact",
                onClick: (e) => deleteArtifact(e, art.id),
                children: /* @__PURE__ */ jsx13(Icon, { name: "Trash2", size: 13 })
              }
            )
          ]
        },
        art.id
      );
    }) })
  ] }) });
}

// desktop-src/FolioWorkspace.jsx
import { Fragment as Fragment5, jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
function FolioWorkspace({ ctx, externalState }) {
  const profile = typeof sdk.useValue === "function" && sdk.host?.state?.profile ? sdk.useValue(sdk.host.state.profile) : "default";
  const connectionId = typeof sdk.useValue === "function" && sdk.host?.state?.connectionId ? sdk.useValue(sdk.host.state.connectionId) : "local";
  const epoch = typeof sdk.useGatewayActivationEpoch === "function" ? sdk.useGatewayActivationEpoch() : 0;
  const [notebooks, setNotebooks] = useState10([]);
  const [nbId, setNbId] = useState10("");
  const [notebook, setNotebook] = useState10(null);
  const [sources, setSources] = useState10([]);
  const [notes, setNotes] = useState10([]);
  const [messages, setMessages] = useState10([]);
  const [claims, setClaims] = useState10([]);
  const [coverage, setCoverage] = useState10(null);
  const [artifacts, setArtifacts] = useState10([]);
  const [centerTab, setCenterTab] = useState10("chat");
  const [selectedArtifactId, setSelectedArtifactId] = useState10(null);
  const [inspectorTarget, setInspectorTarget] = useState10(null);
  const [leftCollapsed, setLeftCollapsed] = useState10(false);
  const [studioExpanded, setStudioExpanded] = useState10(false);
  const [nbMenuOpen, setNbMenuOpen] = useState10(false);
  const [createOpen, setCreateOpen] = useState10(false);
  const [newTitle, setNewTitle] = useState10("");
  const [searchOpen, setSearchOpen] = useState10(false);
  const [searchQuery, setSearchQuery] = useState10("");
  const [searchHits, setSearchHits] = useState10([]);
  const [loading, setLoading] = useState10(true);
  const [error, setError] = useState10("");
  const reqSeqRef = useRef7(0);
  const storageKey = `activeNotebook::${connectionId || "local"}::${profile || "default"}`;
  const loadNotebookData = useCallback(async (targetNb) => {
    if (!targetNb) {
      setNotebook(null);
      setSources([]);
      setNotes([]);
      setMessages([]);
      setClaims([]);
      setCoverage(null);
      setArtifacts([]);
      return;
    }
    const seq = ++reqSeqRef.current;
    const startScope = currentScopeKey();
    const startEpoch = currentEpoch();
    try {
      const [nbMeta, srcList, noteList, msgList, claimList, covData, artList] = await Promise.all([
        api(`/notebooks/${encodeURIComponent(targetNb)}`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/sources`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/notes`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/messages`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/claims`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/coverage`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/artifacts`)
      ]);
      if (seq !== reqSeqRef.current || currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return;
      setNotebook(nbMeta);
      setSources(srcList || []);
      setNotes(noteList || []);
      setMessages(msgList || []);
      setClaims(claimList || []);
      setCoverage(covData || null);
      setArtifacts(artList || []);
      setError("");
      externalState?.set({ title: nbMeta?.title || "", dueCards: nbMeta?.due_cards || 0, nbId: targetNb });
    } catch (err) {
      if (seq === reqSeqRef.current) setError(err.message || "Could not load notebook data.");
    }
  }, [externalState]);
  const loadNotebooks = useCallback(async (preferredId) => {
    const startScope = currentScopeKey();
    const startEpoch = currentEpoch();
    setLoading(true);
    try {
      const list = await api("/notebooks");
      if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return;
      const rows = Array.isArray(list) ? list : [];
      setNotebooks(rows);
      const saved = ctx?.storage?.get?.(storageKey, "") || "";
      const pick = preferredId && rows.some((r) => r.id === preferredId) ? preferredId : saved && rows.some((r) => r.id === saved) ? saved : rows[0]?.id || "";
      setNbId(pick);
      if (pick) {
        ctx?.storage?.set?.(storageKey, pick);
        await loadNotebookData(pick);
      } else {
        await loadNotebookData("");
      }
      setError("");
    } catch (err) {
      setError(err.message || "Could not reach Folio backend API.");
    } finally {
      setLoading(false);
    }
  }, [ctx, storageKey, loadNotebookData]);
  useEffect7(() => {
    setSelectedArtifactId(null);
    setInspectorTarget(null);
    loadNotebooks();
  }, [profile, connectionId, epoch, loadNotebooks]);
  useEffect7(() => {
    if (!ctx?.onEvent) return void 0;
    return ctx.onEvent("plugin.folio.notebook.changed", (ev) => {
      const target = ev?.payload?.nb || ev?.nb;
      if (!target || target === nbId) {
        loadNotebookData(nbId);
      }
    });
  }, [ctx, nbId, loadNotebookData]);
  useEffect7(() => {
    if (!ctx?.addEventListener) return void 0;
    return ctx.addEventListener(window, "keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setCreateOpen(false);
        setNbMenuOpen(false);
        setInspectorTarget(null);
      }
    });
  }, [ctx]);
  useEffect7(() => {
    const pending = externalState?.get?.()?.pendingJump;
    if (pending && pending.nb) {
      externalState.set({ ...externalState.get(), pendingJump: null });
      if (pending.nb !== nbId) {
        selectNotebook(pending.nb).then(() => {
          if (pending.chunk) setInspectorTarget({ sourceId: pending.chunk.split(":")[0], chunkId: pending.chunk });
        });
      } else if (pending.chunk) {
        setInspectorTarget({ sourceId: pending.chunk.split(":")[0], chunkId: pending.chunk });
      }
    }
  });
  async function selectNotebook(id) {
    setNbMenuOpen(false);
    setNbId(id);
    setSelectedArtifactId(null);
    setInspectorTarget(null);
    ctx?.storage?.set?.(storageKey, id);
    await loadNotebookData(id);
  }
  async function handleCreateNotebook(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api("/notebooks", { method: "POST", body: { title: newTitle.trim(), icon: "book-open" } });
      setNewTitle("");
      setCreateOpen(false);
      await loadNotebooks(created.id);
    } catch (err) {
      setError(err.message || "Could not create notebook.");
    }
  }
  async function handleDeleteNotebook(targetId) {
    try {
      await api(`/notebooks/${encodeURIComponent(targetId)}`, { method: "DELETE" });
      setNbMenuOpen(false);
      await loadNotebooks();
    } catch (err) {
      setError(err.message || "Could not delete notebook.");
    }
  }
  async function toggleStrict() {
    if (!notebook?.id) return;
    try {
      await api(`/notebooks/${encodeURIComponent(notebook.id)}`, {
        method: "PATCH",
        body: { strict: !notebook.strict }
      });
      await loadNotebookData(notebook.id);
    } catch (err) {
      setError(err.message || "Could not update grounding mode.");
    }
  }
  async function runCrossSearch(q) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchHits([]);
      return;
    }
    try {
      const hits = await api(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearchHits(Array.isArray(hits) ? hits : []);
    } catch {
      setSearchHits([]);
    }
  }
  async function handlePromoteQuote(chunk, sourceTitle) {
    if (!nbId || !chunk) return;
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes`, {
        method: "POST",
        body: {
          title: `Excerpt from ${sourceTitle}`,
          markdown: `> ${chunk.text}

Cited chunk: \`${chunk.id}\``,
          citations: [chunk.id]
        }
      });
      sdk.host?.notify?.({ kind: "success", title: "Folio", message: "Saved passage to Notes." });
      await loadNotebookData(nbId);
    } catch (err) {
      setError(err.message || "Could not save passage.");
    }
  }
  const covPct = coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0;
  const hasActiveSources = sources.some((s) => s.enabled);
  return /* @__PURE__ */ jsxs12("div", { className: "fl-root", style: { position: "relative" }, children: [
    /* @__PURE__ */ jsx14(Styles, {}),
    /* @__PURE__ */ jsxs12("header", { className: "fl-topbar", children: [
      /* @__PURE__ */ jsxs12("div", { className: "fl-topbar-left", children: [
        /* @__PURE__ */ jsxs12("div", { className: "fl-brand", children: [
          /* @__PURE__ */ jsx14("span", { className: "fl-brand-mark", children: /* @__PURE__ */ jsx14(Icon, { name: "BookOpen", size: 13 }) }),
          /* @__PURE__ */ jsx14("span", { children: "Folio" })
        ] }),
        /* @__PURE__ */ jsx14(
          "button",
          {
            type: "button",
            className: "fl-btn fl-btn-ghost fl-btn-icon",
            title: leftCollapsed ? "Show Sources rail" : "Hide Sources rail",
            onClick: () => setLeftCollapsed((v) => !v),
            children: /* @__PURE__ */ jsx14(Icon, { name: "PanelLeft", size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs12("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsxs12(
            "button",
            {
              type: "button",
              className: "fl-nb-select",
              onClick: () => setNbMenuOpen((v) => !v),
              "aria-expanded": nbMenuOpen,
              children: [
                /* @__PURE__ */ jsx14("span", { className: "fl-nb-select-label", children: notebook?.title || (loading ? "Loading..." : "Select notebook") }),
                /* @__PURE__ */ jsx14(Icon, { name: "ChevronDown", size: 13 })
              ]
            }
          ),
          nbMenuOpen ? /* @__PURE__ */ jsxs12(
            "div",
            {
              style: {
                position: "absolute",
                top: 34,
                left: 0,
                width: 280,
                borderRadius: 10,
                border: "1px solid var(--ui-stroke-secondary)",
                background: "var(--ui-bg-elevated, var(--ui-bg-primary))",
                padding: 6,
                zIndex: 40,
                display: "flex",
                flexDirection: "column",
                gap: 3
              },
              children: [
                notebooks.map((nb) => /* @__PURE__ */ jsxs12(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      padding: "6px 8px",
                      borderRadius: 7,
                      cursor: "pointer",
                      background: nb.id === nbId ? "var(--fl-accent-soft)" : "transparent"
                    },
                    onClick: () => selectNotebook(nb.id),
                    children: [
                      /* @__PURE__ */ jsxs12("div", { style: { minWidth: 0 }, children: [
                        /* @__PURE__ */ jsx14("div", { className: "fl-src-title", children: nb.title }),
                        /* @__PURE__ */ jsxs12("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
                          /* @__PURE__ */ jsx14("span", { className: "fl-num", children: nb.source_count || 0 }),
                          " sources | ",
                          /* @__PURE__ */ jsx14("span", { className: "fl-num", children: nb.artifact_count || 0 }),
                          " artifacts"
                        ] })
                      ] }),
                      notebooks.length > 1 ? /* @__PURE__ */ jsx14(
                        "button",
                        {
                          type: "button",
                          className: "fl-btn fl-btn-ghost fl-btn-icon fl-btn-danger",
                          title: "Delete notebook",
                          onClick: (e) => {
                            e.stopPropagation();
                            handleDeleteNotebook(nb.id);
                          },
                          children: /* @__PURE__ */ jsx14(Icon, { name: "Trash2", size: 12 })
                        }
                      ) : null
                    ]
                  },
                  nb.id
                )),
                /* @__PURE__ */ jsx14("div", { style: { borderTop: "1px solid var(--ui-stroke-tertiary)", marginTop: 4, paddingTop: 4 }, children: /* @__PURE__ */ jsxs12(
                  "button",
                  {
                    type: "button",
                    className: "fl-btn",
                    style: { width: "100%", justifyContent: "flex-start" },
                    onClick: () => {
                      setNbMenuOpen(false);
                      setCreateOpen(true);
                    },
                    children: [
                      /* @__PURE__ */ jsx14(Icon, { name: "Plus", size: 13 }),
                      " New notebook"
                    ]
                  }
                ) })
              ]
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxs12("button", { type: "button", className: "fl-btn", onClick: () => setCreateOpen(true), children: [
          /* @__PURE__ */ jsx14(Icon, { name: "Plus", size: 13 }),
          " New"
        ] })
      ] }),
      /* @__PURE__ */ jsxs12("div", { className: "fl-topbar-right", children: [
        notebook ? /* @__PURE__ */ jsxs12(Fragment5, { children: [
          /* @__PURE__ */ jsxs12(
            "button",
            {
              type: "button",
              className: "fl-cov-meter",
              title: "Open Coverage Map",
              onClick: () => setCenterTab("coverage"),
              children: [
                /* @__PURE__ */ jsx14("span", { children: "Coverage" }),
                /* @__PURE__ */ jsx14("span", { className: "fl-cov-track", children: /* @__PURE__ */ jsx14("span", { className: "fl-cov-fill", style: { width: `${covPct}%` } }) }),
                /* @__PURE__ */ jsxs12("span", { className: "fl-mono", style: { fontWeight: 600 }, children: [
                  covPct,
                  "%"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs12(
            "button",
            {
              type: "button",
              className: "fl-btn",
              "data-active": Boolean(notebook.strict),
              onClick: toggleStrict,
              title: "Strict grounding refuses any claim unsupported by active sources",
              children: [
                /* @__PURE__ */ jsx14(Icon, { name: "Lock", size: 12 }),
                " ",
                notebook.strict ? "Strict" : "Grounded"
              ]
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxs12(
          "button",
          {
            type: "button",
            className: "fl-btn",
            onClick: () => {
              setSearchQuery("");
              setSearchHits([]);
              setSearchOpen(true);
            },
            title: "Search across all notebooks (Ctrl+K)",
            children: [
              /* @__PURE__ */ jsx14(Icon, { name: "Search", size: 12 }),
              " Search"
            ]
          }
        )
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxs12("div", { className: "fl-error-bar", role: "alert", children: [
      /* @__PURE__ */ jsx14("span", { children: error }),
      /* @__PURE__ */ jsx14("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setError(""), children: /* @__PURE__ */ jsx14(Icon, { name: "X", size: 13 }) })
    ] }) : null,
    !loading && !nbId ? /* @__PURE__ */ jsxs12("div", { className: "fl-empty", style: { flex: 1, justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx14(Icon, { name: "BookOpen", size: 32, style: { color: "var(--ui-accent)" } }),
      /* @__PURE__ */ jsx14("div", { style: { fontSize: 16, fontWeight: 650, color: "var(--ui-text-primary)" }, children: "Create your first research notebook" }),
      /* @__PURE__ */ jsx14("div", { style: { maxWidth: 420, fontSize: 13 }, children: "Collect PDFs, DOCX files, Markdown, CSV tables, and URLs in one workspace. Every answer cites exact passages and turns sources into interactive Studio artifacts." }),
      /* @__PURE__ */ jsxs12("button", { type: "button", className: "fl-btn fl-btn-primary", onClick: () => setCreateOpen(true), children: [
        /* @__PURE__ */ jsx14(Icon, { name: "Plus", size: 13 }),
        " New notebook"
      ] })
    ] }) : /* @__PURE__ */ jsxs12(
      "div",
      {
        className: "fl-workbench",
        "data-left-collapsed": leftCollapsed,
        "data-studio-expanded": studioExpanded,
        children: [
          /* @__PURE__ */ jsx14(
            SidebarSources,
            {
              nbId,
              sources,
              notes,
              coverage,
              selectedSourceId: inspectorTarget?.sourceId || null,
              onSelectSource: setInspectorTarget,
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          ),
          /* @__PURE__ */ jsx14(
            ChatPanel,
            {
              ctx,
              notebook,
              sources,
              messages,
              claims,
              coverage,
              centerTab,
              onChangeCenterTab: setCenterTab,
              onOpenChunk: (cid) => setInspectorTarget({ sourceId: String(cid).split(":")[0], chunkId: cid }),
              onOpenSource: setInspectorTarget,
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          ),
          /* @__PURE__ */ jsx14(
            StudioPanel,
            {
              ctx,
              nbId,
              hasActiveSources,
              artifacts,
              selectedArtifactId,
              expanded: studioExpanded,
              onToggleExpand: () => setStudioExpanded((v) => !v),
              onSelectArtifact: setSelectedArtifactId,
              onOpenChunk: (cid) => setInspectorTarget({ sourceId: String(cid).split(":")[0], chunkId: cid }),
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx14(
      SourceInspector,
      {
        nbId,
        target: inspectorTarget,
        onClose: () => setInspectorTarget(null),
        onPromoteQuote: handlePromoteQuote
      }
    ),
    createOpen ? /* @__PURE__ */ jsx14("div", { className: "fl-modal-backdrop", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsxs12("form", { className: "fl-modal", onClick: (e) => e.stopPropagation(), onSubmit: handleCreateNotebook, children: [
      /* @__PURE__ */ jsxs12("div", { className: "fl-modal-head", children: [
        /* @__PURE__ */ jsx14("span", { children: "New research notebook" }),
        /* @__PURE__ */ jsx14("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsx14(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsx14("div", { className: "fl-modal-body", children: /* @__PURE__ */ jsxs12("label", { className: "fl-field", children: [
        /* @__PURE__ */ jsx14("span", { className: "fl-label", children: "Notebook title" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            className: "fl-input",
            value: newTitle,
            onChange: (e) => setNewTitle(e.target.value),
            placeholder: "Distributed Systems Review, Q4 Market Research...",
            required: true,
            autoFocus: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs12("div", { className: "fl-modal-foot", children: [
        /* @__PURE__ */ jsx14("button", { type: "button", className: "fl-btn", onClick: () => setCreateOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx14("button", { type: "submit", className: "fl-btn fl-btn-primary", disabled: !newTitle.trim(), children: "Create" })
      ] })
    ] }) }) : null,
    searchOpen ? /* @__PURE__ */ jsx14("div", { className: "fl-modal-backdrop", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsxs12("div", { className: "fl-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs12("div", { className: "fl-modal-head", children: [
        /* @__PURE__ */ jsx14("span", { children: "Search across all notebooks" }),
        /* @__PURE__ */ jsx14("button", { type: "button", className: "fl-btn fl-btn-ghost fl-btn-icon", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsx14(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs12("div", { className: "fl-modal-body", children: [
        /* @__PURE__ */ jsx14(
          "input",
          {
            className: "fl-input",
            value: searchQuery,
            onChange: (e) => runCrossSearch(e.target.value),
            placeholder: "Search passages across every notebook...",
            autoFocus: true
          }
        ),
        searchHits.length === 0 && searchQuery.trim() ? /* @__PURE__ */ jsx14("div", { className: "fl-empty", children: "No matching passages found." }) : null,
        searchHits.map((hit) => /* @__PURE__ */ jsxs12(
          "div",
          {
            className: "fl-ledger-row",
            style: { cursor: "pointer" },
            onClick: async () => {
              setSearchOpen(false);
              if (hit.notebook_id !== nbId) await selectNotebook(hit.notebook_id);
              setInspectorTarget({ sourceId: hit.source_id, chunkId: hit.chunk_id });
            },
            children: [
              /* @__PURE__ */ jsxs12("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5 }, children: [
                /* @__PURE__ */ jsxs12("strong", { children: [
                  hit.notebook_title,
                  " / ",
                  hit.source_title
                ] }),
                /* @__PURE__ */ jsx14("span", { className: "fl-mono", style: { color: "var(--ui-accent)" }, children: hit.chunk_id })
              ] }),
              /* @__PURE__ */ jsx14("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: hit.snippet })
            ]
          },
          `${hit.notebook_id}-${hit.chunk_id}`
        ))
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/SettingsPage.jsx
import { useEffect as useEffect8, useState as useState11 } from "react";
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
function SettingsPage() {
  const [caps, setCaps] = useState11(null);
  const [err, setErr] = useState11("");
  useEffect8(() => {
    let alive = true;
    api("/capabilities").then((res) => {
      if (alive) setCaps(res);
    }).catch((e) => {
      if (alive) setErr(e.message || "Could not reach Folio backend.");
    });
    return () => {
      alive = false;
    };
  }, []);
  const rows = [
    ["Model provider", caps?.llm ? "Connected" : "Local extractive fallback"],
    ["Web extraction tool", caps?.web_extract ? "Hermes web_extract active" : "Built-in readability fallback"],
    ["PDF extractor (pypdf)", caps?.pypdf ? "Installed" : "Optional (install pypdf for PDF)"],
    ["DOCX extractor", caps?.python_docx ? "python-docx active" : "Built-in stdlib XML extractor"],
    ["Image generation", caps?.image_generate ? "Available" : "Not configured"]
  ];
  return /* @__PURE__ */ jsxs13("div", { className: "fl-root", style: { height: "auto", overflow: "visible", background: "transparent" }, children: [
    /* @__PURE__ */ jsx15(Styles, {}),
    /* @__PURE__ */ jsxs13("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }, children: [
      /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxs13("div", { children: [
          /* @__PURE__ */ jsx15("div", { style: { fontWeight: 650, fontSize: 14 }, children: "Folio Research Notebooks" }),
          /* @__PURE__ */ jsx15("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", marginTop: 2 }, children: "Source-grounded notebooks, Claim Ledger verification, Coverage Map, and 7 interactive Studio formats." })
        ] }),
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "fl-btn fl-btn-primary", onClick: () => sdk.host?.navigate?.("/folio"), children: [
          /* @__PURE__ */ jsx15(Icon, { name: "BookOpen", size: 13 }),
          " Open Folio"
        ] })
      ] }),
      err ? /* @__PURE__ */ jsx15("div", { className: "fl-error-bar", style: { margin: 0 }, children: err }) : null,
      /* @__PURE__ */ jsx15("div", { className: "fl-table-wrap", children: /* @__PURE__ */ jsxs13("table", { className: "fl-table", children: [
        /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
          /* @__PURE__ */ jsx15("th", { children: "Capability" }),
          /* @__PURE__ */ jsx15("th", { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx15("tbody", { children: rows.map(([label, status]) => /* @__PURE__ */ jsxs13("tr", { children: [
          /* @__PURE__ */ jsx15("td", { style: { fontWeight: 550 }, children: label }),
          /* @__PURE__ */ jsx15("td", { style: { color: "var(--ui-text-secondary)" }, children: caps ? status : "Checking..." })
        ] }, label)) })
      ] }) }),
      /* @__PURE__ */ jsxs13("div", { className: "fl-ledger-row", children: [
        /* @__PURE__ */ jsx15("strong", { style: { fontSize: 12 }, children: "Slash commands" }),
        /* @__PURE__ */ jsxs13("div", { className: "fl-mono", style: { fontSize: 11.5, color: "var(--ui-text-secondary)", lineHeight: 1.7 }, children: [
          "/folio list",
          /* @__PURE__ */ jsx15("br", {}),
          "/folio use <nb_id>",
          /* @__PURE__ */ jsx15("br", {}),
          "/folio add <nb_id> <url or text>",
          /* @__PURE__ */ jsx15("br", {}),
          "/folio ask <nb_id> <question>",
          /* @__PURE__ */ jsx15("br", {}),
          "/folio make <nb_id> <kind> [focus]"
        ] })
      ] })
    ] })
  ] });
}

// desktop-src/plugin.jsx
import { jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
var ROUTE = "/folio";
function StatusChip({ externalState }) {
  const state = typeof sdk.useValue === "function" && externalState ? sdk.useValue(externalState) : null;
  if (!state?.title) return null;
  return /* @__PURE__ */ jsxs14(
    "button",
    {
      type: "button",
      className: "fl-status-chip",
      onClick: () => sdk.host?.navigate?.(ROUTE),
      title: `Open Folio: ${state.title}`,
      children: [
        /* @__PURE__ */ jsx16(Icon, { name: "BookOpen", size: 12 }),
        /* @__PURE__ */ jsx16("span", { children: state.title }),
        state.dueCards > 0 ? /* @__PURE__ */ jsxs14("span", { className: "fl-mono", children: [
          "(",
          state.dueCards,
          " due)"
        ] }) : null
      ]
    }
  );
}
function CiteDirective({ props, externalState }) {
  const nb = props?.nb || "";
  const chunk = props?.chunk || "";
  return /* @__PURE__ */ jsxs14(
    "button",
    {
      type: "button",
      className: "fl-cite-card",
      onClick: () => {
        if (externalState) {
          externalState.set({ ...externalState.get(), pendingJump: { nb, chunk } });
        }
        sdk.host?.navigate?.(ROUTE);
      },
      children: [
        /* @__PURE__ */ jsx16(Icon, { name: "BookOpen", size: 13 }),
        /* @__PURE__ */ jsx16("span", { children: "Folio source" }),
        chunk ? /* @__PURE__ */ jsx16("span", { className: "fl-mono", children: chunk }) : null
      ]
    }
  );
}
var plugin_default = {
  id: "folio",
  name: "Folio",
  description: "Source-grounded research notebooks, Claim Ledger, Coverage Map, and 7-format interactive Studio.",
  register(ctx) {
    bindContext(ctx);
    const externalState = typeof sdk.atom === "function" ? sdk.atom({ title: "", dueCards: 0, nbId: "", pendingJump: null }) : null;
    ctx.register({
      id: "page",
      area: sdk.ROUTES_AREA,
      data: { path: ROUTE },
      render: () => /* @__PURE__ */ jsx16(FolioWorkspace, { ctx, externalState })
    });
    ctx.register({
      id: "nav",
      area: sdk.SIDEBAR_NAV_AREA,
      data: { path: ROUTE, label: "Folio", codicon: "book" }
    });
    if (sdk.PALETTE_AREA) {
      ctx.register({
        id: "open",
        area: sdk.PALETTE_AREA,
        data: {
          id: "folio.open",
          label: "Folio: Open research notebooks",
          keywords: ["folio", "notebook", "research", "studio", "flashcards", "mindmap", "citations"],
          run: () => sdk.host?.navigate?.(ROUTE)
        }
      });
    }
    if (sdk.STATUSBAR_AREAS?.right && externalState) {
      ctx.register({
        id: "status",
        area: sdk.STATUSBAR_AREAS.right,
        render: () => /* @__PURE__ */ jsx16(StatusChip, { externalState })
      });
    }
    if (sdk.TRANSCRIPT_DIRECTIVE_AREA) {
      ctx.register({
        id: "cite-directive",
        area: sdk.TRANSCRIPT_DIRECTIVE_AREA,
        data: { name: "cite" },
        render: (props) => /* @__PURE__ */ jsx16(CiteDirective, { props, externalState })
      });
    }
    if (typeof ctx.registerSettingsPage === "function") {
      ctx.registerSettingsPage({
        id: "folio",
        title: "Folio",
        description: "Source-grounded research notebooks and Studio.",
        render: () => /* @__PURE__ */ jsx16(SettingsPage, {})
      });
    }
  }
};
export {
  plugin_default as default
};
