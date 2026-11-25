// desktop-src/sdk.js
import * as sdk from "@hermes/plugin-sdk";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var SDK_ALIASES = {
  Headphones: "AudioLines",
  ArrowLeft: "ChevronLeft",
  Maximize2: "Maximize",
  Presentation: "MonitorPlay"
};
var LOCAL_GLYPHS = {
  X: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
    /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
  ] }),
  Minus: /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
  Minimize2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M4 14h6v6" }),
    /* @__PURE__ */ jsx("path", { d: "M20 10h-6V4" }),
    /* @__PURE__ */ jsx("path", { d: "m14 10 7-7" }),
    /* @__PURE__ */ jsx("path", { d: "m3 21 7-7" })
  ] }),
  PanelLeft: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 3v18" })
  ] }),
  MessageSquare: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }),
  ShieldCheck: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" }),
    /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
  ] }),
  BookOpen: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
    /* @__PURE__ */ jsx("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
  ] }),
  Library: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m16 6 4 14" }),
    /* @__PURE__ */ jsx("path", { d: "M12 6v14" }),
    /* @__PURE__ */ jsx("path", { d: "M8 8v12" }),
    /* @__PURE__ */ jsx("path", { d: "M4 4v16" })
  ] }),
  StickyNote: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" }),
    /* @__PURE__ */ jsx("path", { d: "M15 3v4a2 2 0 0 0 2 2h4" })
  ] }),
  FilePlus: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
    /* @__PURE__ */ jsx("path", { d: "M9 15h6" }),
    /* @__PURE__ */ jsx("path", { d: "M12 18v-6" })
  ] }),
  BookmarkPlus: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 7v6" }),
    /* @__PURE__ */ jsx("path", { d: "M9 10h6" })
  ] }),
  Layers: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" }),
    /* @__PURE__ */ jsx("path", { d: "m2 12 10 4.5L22 12" }),
    /* @__PURE__ */ jsx("path", { d: "m2 17 10 4.5L22 17" })
  ] }),
  CheckSquare: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
  ] }),
  LayoutGrid: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "3", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "14", y: "14", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "3", y: "14", rx: "1" })
  ] }),
  Table: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M3 9h18" }),
    /* @__PURE__ */ jsx("path", { d: "M3 15h18" }),
    /* @__PURE__ */ jsx("path", { d: "M9 3v18" })
  ] }),
  Shuffle: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" }),
    /* @__PURE__ */ jsx("path", { d: "m18 2 4 4-4 4" }),
    /* @__PURE__ */ jsx("path", { d: "M2 6h1.9c1.5 0 2.9.9 3.6 2.2" }),
    /* @__PURE__ */ jsx("path", { d: "M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" }),
    /* @__PURE__ */ jsx("path", { d: "m18 14 4 4-4 4" })
  ] }),
  RotateCcw: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
    /* @__PURE__ */ jsx("path", { d: "M3 3v5h5" })
  ] })
};
function Icon({ name, size = 15, strokeWidth = 1.75, className = "", style }) {
  const icons2 = sdk.icons || {};
  const resolved = SDK_ALIASES[name] || name;
  const Comp = icons2[resolved];
  if (Comp) {
    return /* @__PURE__ */ jsx(Comp, { size, strokeWidth, className, style, "aria-hidden": "true" });
  }
  const glyph = LOCAL_GLYPHS[name];
  if (glyph) {
    return /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        width: size,
        height: size,
        fill: "none",
        stroke: "currentColor",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        style: { display: "inline-block", flexShrink: 0, ...style },
        "aria-hidden": "true",
        children: glyph
      }
    );
  }
  const Fallback = icons2.FileText || icons2.BookOpen;
  if (!Fallback) return null;
  return /* @__PURE__ */ jsx(Fallback, { size, strokeWidth, className, style, "aria-hidden": "true" });
}

// desktop-src/api.js
var activeCtx = null;
function bindContext(ctx) {
  activeCtx = ctx;
}
function getContext() {
  return activeCtx;
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
    throw new Error("SourceBook backend connection is not ready yet.");
  }
  return activeCtx.rest(path, opts);
}
async function uploadFile(nbId, file) {
  if (!activeCtx || typeof activeCtx.rest !== "function") {
    throw new Error("SourceBook backend connection is not ready yet.");
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
  const bg = resolveCssColor("var(--ui-bg-chrome)", svgEl);
  const bg2 = resolveCssColor("var(--ui-bg-elevated)", svgEl);
  const sidebar = resolveCssColor("var(--ui-bg-sidebar)", svgEl);
  const fg = resolveCssColor("var(--ui-text-primary)", svgEl);
  const muted = resolveCssColor("var(--ui-text-secondary)", svgEl);
  const stroke = resolveCssColor("var(--ui-stroke-secondary)", svgEl);
  const accent = resolveCssColor("var(--ui-accent)", svgEl);
  const accentSoft = resolveCssColor("color-mix(in srgb, var(--ui-accent) 16%, var(--ui-bg-elevated))", svgEl);
  const replacements = [
    [/var\(--sb-bg[^)]*\)/g, bg],
    [/var\(--sb-surface[^)]*\)/g, bg2],
    [/var\(--sb-sidebar[^)]*\)/g, sidebar],
    [/var\(--ui-bg-chrome[^)]*\)/g, bg],
    [/var\(--ui-bg-elevated[^)]*\)/g, bg2],
    [/var\(--ui-bg-sidebar[^)]*\)/g, sidebar],
    [/var\(--ui-bg-primary[^)]*\)/g, bg],
    [/var\(--ui-bg-secondary[^)]*\)/g, bg2],
    [/var\(--ui-text-primary[^)]*\)/g, fg],
    [/var\(--ui-text-secondary[^)]*\)/g, muted],
    [/var\(--ui-text-tertiary[^)]*\)/g, muted],
    [/var\(--ui-stroke-secondary[^)]*\)/g, stroke],
    [/var\(--ui-stroke-tertiary[^)]*\)/g, stroke],
    [/var\(--sb-accent-soft[^)]*\)/g, accentSoft],
    [/var\(--sb-accent-border[^)]*\)/g, accent],
    [/var\(--ui-accent[^)]*\)/g, accent]
  ];
  let markup = new XMLSerializer().serializeToString(clone);
  for (const [re, val] of replacements) {
    markup = markup.replace(re, val);
  }
  return markup;
}

// desktop-src/SourceBookWorkspace.jsx
import { useCallback, useEffect as useEffect8, useRef as useRef8, useState as useState11 } from "react";

// desktop-src/styles.js
import { jsx as jsx2 } from "react/jsx-runtime";
var CSS = `
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
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  border: 1px solid var(--ui-stroke-secondary);
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

.sb-select {
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 11.5px;
  outline: none;
  cursor: pointer;
}
.sb-select:focus {
  border-color: var(--ui-accent);
}

.sb-model-menu {
  position: absolute;
  top: 34px;
  right: 0;
  width: 300px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  padding: 6px;
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}

.sb-code-block {
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  overflow: hidden;
  margin: 6px 0;
}
.sb-code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-subtle);
  font-size: 11px;
  color: var(--ui-text-tertiary);
}
.sb-code-pre {
  margin: 0;
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--ui-text-primary);
  background: var(--sb-bg);
}
.sb-inline-code {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 0.9em;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--sb-subtle);
  border: 1px solid var(--ui-stroke-tertiary);
}
.sb-link {
  color: var(--ui-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.sb-mark {
  background: color-mix(in srgb, var(--ui-accent) 26%, transparent);
  color: var(--ui-text-primary);
  border-radius: 3px;
  padding: 0 2px;
}
.sb-conflict-card {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--sb-warn) 45%, var(--ui-stroke-secondary));
  background: color-mix(in srgb, var(--sb-warn) 6%, var(--sb-surface));
  display: flex;
  flex-direction: column;
  gap: 7px;
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
`;
function Styles() {
  return /* @__PURE__ */ jsx2("style", { children: CSS });
}

// desktop-src/components/SidebarSources.jsx
import { useRef, useState } from "react";
import { Fragment as Fragment2, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
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
  audio: "Headphones",
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
  const [refreshingId, setRefreshingId] = useState("");
  const [modal, setModal] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverChecked, setDiscoverChecked] = useState({});
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
  async function submitFolder(e) {
    e.preventDefault();
    if (!folderPath.trim()) return;
    setBusy(true);
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/sync-path`, {
        method: "POST",
        body: { path: folderPath.trim(), max_files: 40 }
      });
      setModal(null);
      setFolderPath("");
      sdk.host?.notify?.({
        kind: "success",
        title: "SourceBook",
        message: `Synced ${res?.added?.length || 0} source(s) from disk.`
      });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not sync local path.");
    } finally {
      setBusy(false);
    }
  }
  async function runDiscover(e) {
    e.preventDefault();
    if (!discoverQuery.trim()) return;
    setBusy(true);
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/discover`, {
        method: "POST",
        body: { query: discoverQuery.trim(), limit: 8 }
      });
      const list = Array.isArray(res?.results) ? res.results : [];
      setDiscoverResults(list);
      const initial = {};
      list.slice(0, 3).forEach((r) => {
        initial[r.url] = true;
      });
      setDiscoverChecked(initial);
    } catch (err) {
      onError?.(err.message || "Web source discovery failed.");
    } finally {
      setBusy(false);
    }
  }
  async function importDiscovered() {
    const selected = discoverResults.filter((r) => discoverChecked[r.url]);
    if (!selected.length) return;
    setBusy(true);
    let ok = 0;
    try {
      for (const item of selected) {
        try {
          await api(`/notebooks/${encodeURIComponent(nbId)}/sources`, {
            method: "POST",
            body: { url: item.url, title: item.title }
          });
          ok += 1;
        } catch {
        }
      }
      setModal(null);
      setDiscoverResults([]);
      setDiscoverQuery("");
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Imported ${ok} discovered source(s).` });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }
  async function handleRefreshSource(e, src) {
    e.stopPropagation();
    if (refreshingId) return;
    setRefreshingId(src.id);
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(src.id)}/refresh`, {
        method: "POST"
      });
      sdk.host?.notify?.({
        kind: "success",
        title: "SourceBook",
        message: res?.changed ? `Updated "${src.title}" from origin.` : `"${src.title}" is already up to date.`
      });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not refresh source.");
    } finally {
      setRefreshingId("");
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
          body: { title: title.trim() || "Untitled note", markdown: body, resync_hashes: true }
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
  async function resyncNote(note) {
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}`, {
        method: "PATCH",
        body: { resync_hashes: true }
      });
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not mark note synced.");
    }
  }
  async function promoteNote(note) {
    setBusy(true);
    try {
      await api(`/notebooks/${encodeURIComponent(nbId)}/notes/${encodeURIComponent(note.id)}/promote`, { method: "POST" });
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Promoted "${note.title}" to sources.` });
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
  return /* @__PURE__ */ jsxs2("aside", { className: "sb-pane sb-pane-left", "aria-label": "Sources and Notes", children: [
    /* @__PURE__ */ jsxs2("div", { className: "sb-pane-head", children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-seg", role: "tablist", children: [
        /* @__PURE__ */ jsxs2(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "sources",
            className: "sb-seg-btn",
            "data-active": tab === "sources",
            onClick: () => setTab("sources"),
            children: [
              "Sources ",
              /* @__PURE__ */ jsx3("span", { className: "sb-num", style: { opacity: 0.7 }, children: sources.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxs2(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": tab === "notes",
            className: "sb-seg-btn",
            "data-active": tab === "notes",
            onClick: () => setTab("notes"),
            children: [
              "Notes ",
              /* @__PURE__ */ jsx3("span", { className: "sb-num", style: { opacity: 0.7 }, children: notes.length })
            ]
          }
        )
      ] }),
      tab === "sources" && sources.length > 0 ? /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost", onClick: toggleAll, title: "Toggle all sources", children: /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
        enabledCount,
        "/",
        sources.length
      ] }) }) : null,
      tab === "notes" ? /* @__PURE__ */ jsxs2(
        "button",
        {
          type: "button",
          className: "sb-btn sb-btn-ghost",
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
    tab === "sources" ? /* @__PURE__ */ jsxs2(Fragment2, { children: [
      /* @__PURE__ */ jsxs2(
        "div",
        {
          className: "sb-dropzone",
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
                accept: ".txt,.md,.markdown,.pdf,.docx,.csv,.tsv,.json,.html,.htm,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.mp4,.webm,.py,.ts,.tsx,.js,.yaml,.yml",
                style: { display: "none" },
                onChange: (e) => handleFiles(e.target.files)
              }
            ),
            /* @__PURE__ */ jsxs2("div", { className: "sb-dropzone-actions", style: { flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs2(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  disabled: !nbId || busy,
                  onClick: () => fileRef.current?.click(),
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "Upload", size: 12 }),
                    " File"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs2(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setTitle("");
                    setUrlInput("");
                    setModal("url");
                  },
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "Link", size: 12 }),
                    " URL/YT"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs2(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setFolderPath("");
                    setModal("folder");
                  },
                  title: "Sync a local folder, Obsidian vault, or Git repository",
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "FolderOpen", size: 12 }),
                    " Folder"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs2(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setDiscoverQuery("");
                    setDiscoverResults([]);
                    setModal("discover");
                  },
                  title: "Search the web and bulk-import sources",
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "Globe", size: 12 }),
                    " Discover"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs2(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  disabled: !nbId || busy,
                  onClick: () => {
                    setTitle("");
                    setBody("");
                    setModal("paste");
                  },
                  children: [
                    /* @__PURE__ */ jsx3(Icon, { name: "FilePlus", size: 12 }),
                    " Paste"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx3("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", textAlign: "center" }, children: busy ? "Indexing source..." : "Drop PDF, DOCX, Markdown, CSV, audio, or URLs" })
          ]
        }
      ),
      /* @__PURE__ */ jsx3("div", { className: "sb-src-list sb-scroll", children: sources.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "sb-empty", children: [
        /* @__PURE__ */ jsx3(Icon, { name: "BookOpen", size: 22 }),
        /* @__PURE__ */ jsx3("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No sources yet" }),
        /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5 }, children: "Add documents, YouTube videos, local folders, or discover web sources." })
      ] }) : sources.map((src) => {
        const cov = covBySource[src.id];
        const pct = cov && cov.total_chunks > 0 ? Math.round(cov.touched_chunks / cov.total_chunks * 100) : 0;
        const canRefresh = Boolean(src.origin_path) || typeof src.origin === "string" && /^https?:\/\//i.test(src.origin);
        return /* @__PURE__ */ jsxs2(
          "div",
          {
            className: "sb-src-row",
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
                  className: "sb-checkbox",
                  checked: Boolean(src.enabled),
                  onClick: (e) => e.stopPropagation(),
                  onChange: (e) => toggleSource(e, src),
                  "aria-label": `Include ${src.title}`
                }
              ),
              /* @__PURE__ */ jsxs2("div", { style: { minWidth: 0 }, children: [
                /* @__PURE__ */ jsx3("div", { className: "sb-src-title", title: src.title, children: src.title }),
                /* @__PURE__ */ jsxs2("div", { className: "sb-src-meta", children: [
                  /* @__PURE__ */ jsx3(Icon, { name: KIND_ICONS[src.kind] || "FileText", size: 11 }),
                  /* @__PURE__ */ jsx3("span", { className: "sb-kind-tag", children: src.kind }),
                  /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
                    fmtWords(src.word_count ?? Math.round((src.chars || 0) / 5)),
                    " w"
                  ] }),
                  /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
                    src.chunk_count,
                    " ch"
                  ] })
                ] }),
                /* @__PURE__ */ jsx3("div", { className: "sb-src-bar", title: `Coverage: ${pct}%`, children: /* @__PURE__ */ jsx3("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) })
              ] }),
              /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 2 }, onClick: (e) => e.stopPropagation(), children: [
                canRefresh ? /* @__PURE__ */ jsx3(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost sb-btn-icon",
                    title: "Refresh source from disk or URL",
                    disabled: refreshingId === src.id,
                    onClick: (e) => handleRefreshSource(e, src),
                    children: /* @__PURE__ */ jsx3(Icon, { name: "RefreshCw", size: 12 })
                  }
                ) : null,
                /* @__PURE__ */ jsx3(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                    title: "Remove source",
                    "aria-label": `Remove ${src.title}`,
                    onClick: (e) => deleteSource(e, src),
                    children: /* @__PURE__ */ jsx3(Icon, { name: "Trash2", size: 13 })
                  }
                )
              ] })
            ]
          },
          src.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsx3("div", { className: "sb-src-list sb-scroll", children: notes.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "sb-empty", children: [
      /* @__PURE__ */ jsx3(Icon, { name: "StickyNote", size: 22 }),
      /* @__PURE__ */ jsx3("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No notes saved" }),
      /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5 }, children: "Capture findings or save any cited chat reply as a reusable Living Note." }),
      /* @__PURE__ */ jsxs2(
        "button",
        {
          type: "button",
          className: "sb-btn",
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
    ] }) : notes.map((note) => /* @__PURE__ */ jsxs2(
      "div",
      {
        className: "sb-ledger-row",
        style: { cursor: "pointer", borderColor: note.stale ? "var(--sb-warn)" : void 0 },
        onClick: () => {
          setTitle(note.title || "");
          setBody(note.markdown || "");
          setModal(note);
        },
        children: [
          /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx3("div", { className: "sb-src-title", style: { flex: 1 }, title: note.title, children: note.title }),
            /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 2, alignItems: "center" }, onClick: (e) => e.stopPropagation(), children: [
              note.stale ? /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "sb-verdict",
                  "data-v": "partial",
                  style: { border: 0, cursor: "pointer" },
                  title: "Cited source changed since this note was saved. Click to mark reviewed.",
                  onClick: () => resyncNote(note),
                  children: "Stale"
                }
              ) : null,
              /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon",
                  title: "Promote note to active source",
                  onClick: () => promoteNote(note),
                  children: /* @__PURE__ */ jsx3(Icon, { name: "ArrowUpRight", size: 13 })
                }
              ),
              /* @__PURE__ */ jsx3(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
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
    modal === "paste" ? /* @__PURE__ */ jsx3("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitPaste, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Paste text or Markdown" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Architecture notes, benchmark table, transcript...",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Content" }),
          /* @__PURE__ */ jsx3(
            "textarea",
            {
              className: "sb-input",
              style: { height: 200, padding: "8px 10px", resize: "vertical" },
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Paste text or Markdown here...",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !body.trim(), children: busy ? "Indexing..." : "Add source" })
      ] })
    ] }) }) : null,
    modal === "url" ? /* @__PURE__ */ jsx3("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitUrl, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Add web page or YouTube video" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Web or YouTube URL" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              type: "url",
              value: urlInput,
              onChange: (e) => setUrlInput(e.target.value),
              placeholder: "https://example.com/article or https://youtu.be/...",
              required: true,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Optional custom title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Leave blank to use page or video title"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !urlInput.trim(), children: busy ? "Fetching..." : "Ingest URL" })
      ] })
    ] }) }) : null,
    modal === "folder" ? /* @__PURE__ */ jsx3("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitFolder, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Sync local file, folder, vault, or repo" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Absolute path on disk" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              value: folderPath,
              onChange: (e) => setFolderPath(e.target.value),
              placeholder: "/path/to/docs or Obsidian vault or repo folder",
              required: true,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Indexes up to 40 Markdown, code, PDF, DOCX, CSV, and JSON files (skipping .git and node_modules). Refresh any linked file later to flag stale notes and artifacts." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !folderPath.trim(), children: busy ? "Syncing..." : "Sync path" })
      ] })
    ] }) }) : null,
    modal === "discover" ? /* @__PURE__ */ jsx3("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("div", { className: "sb-modal", style: { width: "min(560px, 94vw)" }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: "Discover web sources" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("form", { onSubmit: runDiscover, style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              value: discoverQuery,
              onChange: (e) => setDiscoverQuery(e.target.value),
              placeholder: "Describe a topic to search for primary sources...",
              autoFocus: true
            }
          ),
          /* @__PURE__ */ jsx3("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !discoverQuery.trim(), children: busy ? "Searching..." : "Search" })
        ] }),
        discoverResults.length > 0 ? /* @__PURE__ */ jsx3("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflow: "auto" }, children: discoverResults.map((item) => /* @__PURE__ */ jsxs2(
          "label",
          {
            className: "sb-ledger-row",
            style: { flexDirection: "row", alignItems: "flex-start", gap: 8, cursor: "pointer" },
            children: [
              /* @__PURE__ */ jsx3(
                "input",
                {
                  type: "checkbox",
                  className: "sb-checkbox",
                  style: { marginTop: 2 },
                  checked: Boolean(discoverChecked[item.url]),
                  onChange: () => setDiscoverChecked((prev) => ({ ...prev, [item.url]: !prev[item.url] }))
                }
              ),
              /* @__PURE__ */ jsxs2("div", { style: { minWidth: 0, flex: 1 }, children: [
                /* @__PURE__ */ jsx3("div", { className: "sb-src-title", children: item.title }),
                /* @__PURE__ */ jsx3("div", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-accent)" }, children: item.domain }),
                item.snippet ? /* @__PURE__ */ jsx3("div", { style: { fontSize: 11.5, color: "var(--ui-text-secondary)", marginTop: 2 }, children: item.snippet }) : null
              ] })
            ]
          },
          item.url
        )) }) : null
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Close" }),
        discoverResults.length > 0 ? /* @__PURE__ */ jsx3(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-primary",
            disabled: busy || !discoverResults.some((r) => discoverChecked[r.url]),
            onClick: importDiscovered,
            children: busy ? "Importing..." : `Import selected (${discoverResults.filter((r) => discoverChecked[r.url]).length})`
          }
        ) : null
      ] })
    ] }) }) : null,
    modal === "note" || modal && typeof modal === "object" ? /* @__PURE__ */ jsx3("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitNote, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx3("span", { children: typeof modal === "object" ? "Edit note" : "New research note" }),
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx3(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Title" }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              className: "sb-input",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              placeholder: "Working hypothesis, synthesis...",
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx3("span", { className: "sb-label", children: "Markdown" }),
          /* @__PURE__ */ jsx3(
            "textarea",
            {
              className: "sb-input",
              style: { height: 220, padding: "8px 10px", resize: "vertical" },
              value: body,
              onChange: (e) => setBody(e.target.value),
              placeholder: "Write your note..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx3("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx3("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy, children: busy ? "Saving..." : "Save note" })
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/components/SourceInspector.jsx
import { useEffect, useRef as useRef2, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function fmtTime(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function highlightMatch(text, term) {
  const q = String(term || "").trim();
  if (!q || q.length < 2) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text || "").split(new RegExp(`(${escaped})`, "gi"));
  return parts.map(
    (part, idx) => part.toLowerCase() === q.toLowerCase() ? /* @__PURE__ */ jsx4("mark", { className: "sb-mark", children: part }, idx) : part
  );
}
function SourceInspector({ nbId, target, onClose, onPromoteQuote }) {
  const [data, setData] = useState2(null);
  const [loading, setLoading] = useState2(false);
  const [filter, setFilter] = useState2("");
  const [error, setError] = useState2("");
  const [analysis, setAnalysis] = useState2(null);
  const [analyzing, setAnalyzing] = useState2(false);
  const hitRef = useRef2(null);
  const sourceId = target?.sourceId || (target?.chunkId ? String(target.chunkId).split(":")[0] : null);
  const focusChunkId = target?.chunkId || null;
  const highlightText = target?.highlight || "";
  useEffect(() => {
    if (!nbId || !sourceId) return;
    let alive = true;
    setLoading(true);
    setError("");
    setAnalysis(null);
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
  const srcMeta = data?.source || {};
  const isTabular = srcMeta.kind === "csv" || srcMeta.kind === "json" || (data?.text || "").includes("\n| ---");
  const ytId = srcMeta.youtube_id || "";
  async function runAnalyze(metricCol) {
    if (!nbId || !sourceId || analyzing) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/analyze`, {
        method: "POST",
        body: metricCol ? { metric_col: metricCol } : {}
      });
      setAnalysis(res);
    } catch (err) {
      setError(err.message || "Could not profile tabular data.");
    } finally {
      setAnalyzing(false);
    }
  }
  const chunks = data?.chunks || [];
  const q = filter.trim().toLowerCase();
  const visible = q ? chunks.filter((c) => (c.text || "").toLowerCase().includes(q) || (c.heading || "").toLowerCase().includes(q)) : chunks;
  return /* @__PURE__ */ jsxs3("section", { className: "sb-inspector", "aria-label": "Passage Inspector", children: [
    /* @__PURE__ */ jsxs3("div", { className: "sb-pane-head", children: [
      /* @__PURE__ */ jsxs3("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsx4("div", { className: "sb-pane-title", children: "Passage Inspector" }),
        /* @__PURE__ */ jsx4("div", { className: "sb-src-title", style: { marginTop: 2 }, title: srcMeta.title || sourceId, children: srcMeta.title || sourceId })
      ] }),
      /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: 4 }, children: [
        isTabular ? /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            className: "sb-btn",
            "data-active": Boolean(analysis),
            disabled: analyzing,
            onClick: () => analysis ? setAnalysis(null) : runAnalyze(),
            title: "Run exact statistical profiling and bar chart on this tabular source",
            children: [
              /* @__PURE__ */ jsx4(Icon, { name: "BarChart3", size: 12 }),
              " ",
              analyzing ? "Profiling..." : analysis ? "Hide stats" : "Analyze data"
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: onClose, "aria-label": "Close inspector", children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 15 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx4("div", { style: { padding: "8px 12px", borderBottom: "1px solid var(--ui-stroke-tertiary)", display: "flex", gap: 6 }, children: /* @__PURE__ */ jsx4(
      "input",
      {
        className: "sb-input",
        value: filter,
        onChange: (e) => setFilter(e.target.value),
        placeholder: "Filter passages in this source...",
        "aria-label": "Filter passages"
      }
    ) }),
    /* @__PURE__ */ jsxs3("div", { className: "sb-scroll", style: { flex: 1, padding: "10px 12px 24px", display: "flex", flexDirection: "column", gap: 10 }, children: [
      loading ? /* @__PURE__ */ jsx4("div", { className: "sb-empty", children: "Loading passages..." }) : null,
      error ? /* @__PURE__ */ jsx4("div", { className: "sb-error-bar", style: { margin: 0 }, children: error }) : null,
      analysis ? /* @__PURE__ */ jsxs3("div", { className: "sb-ledger-row", style: { gap: 10, borderColor: "var(--sb-accent-border)" }, children: [
        /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxs3("strong", { style: { fontSize: 12.5 }, children: [
            "Data Profile (",
            analysis.row_count,
            " rows, ",
            analysis.column_count,
            " cols)"
          ] }),
          (analysis.numeric_columns || []).length > 1 ? /* @__PURE__ */ jsx4(
            "select",
            {
              className: "sb-select",
              value: analysis.chart?.metric || "",
              onChange: (e) => runAnalyze(e.target.value),
              "aria-label": "Chart metric column",
              children: analysis.numeric_columns.map((c) => /* @__PURE__ */ jsx4("option", { value: c, children: c }, c))
            }
          ) : null
        ] }),
        analysis.chart?.series?.length ? /* @__PURE__ */ jsxs3("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: [
          /* @__PURE__ */ jsx4("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: analysis.chart.title }),
          analysis.chart.series.slice(0, 10).map((pt, idx) => {
            const pct = Math.max(4, Math.round(Math.abs(pt.value) / (analysis.chart.max_value || 1) * 100));
            return /* @__PURE__ */ jsxs3("div", { style: { display: "grid", gridTemplateColumns: "110px 1fr 56px", alignItems: "center", gap: 8, fontSize: 11.5 }, children: [
              /* @__PURE__ */ jsx4("span", { className: "sb-src-title", title: pt.label, children: pt.label }),
              /* @__PURE__ */ jsx4("div", { className: "sb-src-bar", style: { height: 8, marginTop: 0 }, children: /* @__PURE__ */ jsx4("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) }),
              /* @__PURE__ */ jsx4("span", { className: "sb-mono", style: { textAlign: "right", color: "var(--ui-text-secondary)" }, children: pt.value })
            ] }, idx);
          })
        ] }) : null,
        /* @__PURE__ */ jsx4("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }, children: (analysis.profiles || []).filter((p) => p.type === "number").slice(0, 4).map((p) => /* @__PURE__ */ jsxs3("div", { className: "sb-kpi", style: { padding: "7px 9px" }, children: [
          /* @__PURE__ */ jsx4("div", { className: "sb-kpi-label", children: p.column }),
          /* @__PURE__ */ jsxs3("div", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-text-primary)", marginTop: 3 }, children: [
            "mean ",
            p.mean,
            " | med ",
            p.median
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: [
            "min ",
            p.min,
            " | max ",
            p.max
          ] })
        ] }, p.column)) })
      ] }) : null,
      !loading && !error && visible.length === 0 ? /* @__PURE__ */ jsx4("div", { className: "sb-empty", children: "No matching passages." }) : null,
      visible.map((ch) => {
        const isHit = focusChunkId && ch.id === focusChunkId;
        const cleanText = String(ch.text || "").replace(/<!--\s*[pt]:\d+\s*-->\n?/g, "");
        const ytHref = ytId && typeof ch.timestamp_sec === "number" ? `https://youtu.be/${encodeURIComponent(ytId)}?t=${ch.timestamp_sec}` : "";
        return /* @__PURE__ */ jsxs3(
          "article",
          {
            ref: isHit ? hitRef : null,
            className: "sb-chunk-card",
            "data-hit": isHit ? "true" : void 0,
            children: [
              /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
                /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsx4("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-accent)", fontWeight: 600 }, children: ch.id }),
                  ch.page_start > 1 || srcMeta.pages > 1 ? /* @__PURE__ */ jsxs3("span", { className: "sb-kind-tag", children: [
                    "p.",
                    ch.page_start
                  ] }) : null,
                  ytHref ? /* @__PURE__ */ jsx4("a", { href: ytHref, target: "_blank", rel: "noopener noreferrer", className: "sb-kind-tag sb-link", title: "Open video at timestamp", children: fmtTime(ch.timestamp_sec) }) : null,
                  ch.heading ? /* @__PURE__ */ jsx4("span", { className: "sb-src-title", style: { fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: ch.heading }) : null
                ] }),
                /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: 3 }, children: [
                  /* @__PURE__ */ jsx4(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Copy passage",
                      onClick: () => copyText(cleanText),
                      children: /* @__PURE__ */ jsx4(Icon, { name: "Copy", size: 12 })
                    }
                  ),
                  onPromoteQuote ? /* @__PURE__ */ jsx4(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Save passage as note",
                      onClick: () => onPromoteQuote(ch, srcMeta.title || sourceId),
                      children: /* @__PURE__ */ jsx4(Icon, { name: "BookmarkPlus", size: 12 })
                    }
                  ) : null
                ] })
              ] }),
              /* @__PURE__ */ jsx4("div", { style: { fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "var(--ui-text-primary)" }, children: highlightMatch(cleanText, filter.trim() || (isHit ? highlightText : "")) })
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

// desktop-src/components/MarkdownBody.jsx
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g;
var CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/;
var INLINE_TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
function renderInlineFormatted(str, keyPrefix) {
  const parts = String(str || "").split(INLINE_TOKEN_RE);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return /* @__PURE__ */ jsx5("code", { className: "sb-inline-code", children: part.slice(1, -1) }, `${keyPrefix}-c-${idx}`);
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return /* @__PURE__ */ jsx5("strong", { children: part.slice(2, -2) }, `${keyPrefix}-b-${idx}`);
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return /* @__PURE__ */ jsx5("em", { children: part.slice(1, -1) }, `${keyPrefix}-i-${idx}`);
    }
    const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
    if (linkMatch) {
      return /* @__PURE__ */ jsx5(
        "a",
        {
          href: linkMatch[2],
          target: "_blank",
          rel: "noopener noreferrer",
          className: "sb-link",
          children: linkMatch[1]
        },
        `${keyPrefix}-a-${idx}`
      );
    }
    return part;
  });
}
function renderInlineCited(text, citeIndexMap, onOpenChunk) {
  const tokens = String(text || "").split(CITE_SPLIT_RE);
  return tokens.map((tok, tIdx) => {
    const m = CITE_EXTRACT_RE.exec(tok);
    if (m) {
      const cid = m[1];
      const num = citeIndexMap?.get?.(cid) ?? "?";
      return /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          className: "sb-cite",
          title: `Inspect cited passage ${cid}`,
          onClick: () => onOpenChunk?.(cid),
          children: num
        },
        `c-${tIdx}-${cid}`
      );
    }
    return renderInlineFormatted(tok, `t-${tIdx}`);
  });
}
function isTableRow(line) {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") && t.length >= 3;
}
function isTableSep(line) {
  return /^\|[\s:|\-]+\|$/.test(line.trim());
}
function splitTableCells(line) {
  return line.trim().slice(1, -1).split("|").map((c) => c.trim());
}
function MarkdownBody({ text, citeIndexMap, onOpenChunk }) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      const fence = trimmed.slice(0, 3);
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const codeText = codeLines.join("\n");
      blocks.push(
        /* @__PURE__ */ jsxs4("div", { className: "sb-code-block", children: [
          /* @__PURE__ */ jsxs4("div", { className: "sb-code-head", children: [
            /* @__PURE__ */ jsx5("span", { className: "sb-mono", children: lang || "code" }),
            /* @__PURE__ */ jsxs4(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost",
                style: { height: 22, padding: "0 7px", fontSize: 11 },
                onClick: async () => {
                  await copyText(codeText);
                  sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied code snippet." });
                },
                children: [
                  /* @__PURE__ */ jsx5(Icon, { name: "Copy", size: 11 }),
                  " Copy"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx5("pre", { className: "sb-mono sb-code-pre", children: codeText })
        ] }, `code-${i}`)
      );
      continue;
    }
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headers = splitTableCells(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitTableCells(lines[i]));
        i += 1;
      }
      blocks.push(
        /* @__PURE__ */ jsx5("div", { className: "sb-table-wrap sb-scroll", style: { margin: "6px 0" }, children: /* @__PURE__ */ jsxs4("table", { className: "sb-table", children: [
          /* @__PURE__ */ jsx5("thead", { children: /* @__PURE__ */ jsx5("tr", { children: headers.map((h, hIdx) => /* @__PURE__ */ jsx5("th", { style: { cursor: "default" }, children: renderInlineCited(h, citeIndexMap, onOpenChunk) }, hIdx)) }) }),
          /* @__PURE__ */ jsx5("tbody", { children: rows.map((r, rIdx) => /* @__PURE__ */ jsx5("tr", { children: headers.map((_, cIdx) => /* @__PURE__ */ jsx5("td", { children: renderInlineCited(r[cIdx] || "", citeIndexMap, onOpenChunk) }, cIdx)) }, rIdx)) })
        ] }) }, `tbl-${i}`)
      );
      continue;
    }
    if (trimmed.startsWith(">")) {
      const qLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        qLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        /* @__PURE__ */ jsx5("blockquote", { className: "sb-quote-box", style: { margin: "6px 0" }, children: renderInlineCited(qLines.join(" "), citeIndexMap, onOpenChunk) }, `bq-${i}`)
      );
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }
      blocks.push(
        /* @__PURE__ */ jsx5("ul", { children: items.map((item, idx) => /* @__PURE__ */ jsx5("li", { children: renderInlineCited(item, citeIndexMap, onOpenChunk) }, idx)) }, `ul-${i}`)
      );
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(
        /* @__PURE__ */ jsx5("ol", { style: { margin: "4px 0", paddingLeft: 20 }, children: items.map((item, idx) => /* @__PURE__ */ jsx5("li", { children: renderInlineCited(item, citeIndexMap, onOpenChunk) }, idx)) }, `ol-${i}`)
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(/* @__PURE__ */ jsx5("h3", { children: renderInlineCited(trimmed.slice(4), citeIndexMap, onOpenChunk) }, `h3-${i}`));
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(/* @__PURE__ */ jsx5("h2", { children: renderInlineCited(trimmed.slice(3), citeIndexMap, onOpenChunk) }, `h2-${i}`));
      i += 1;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(/* @__PURE__ */ jsx5("h2", { style: { fontSize: 16 }, children: renderInlineCited(trimmed.slice(2), citeIndexMap, onOpenChunk) }, `h1-${i}`));
      i += 1;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("```") && !lines[i].trim().startsWith("~~~") && !lines[i].trim().startsWith(">") && !/^[-*+]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !isTableRow(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(/* @__PURE__ */ jsx5("p", { children: renderInlineCited(para.join(" "), citeIndexMap, onOpenChunk) }, `p-${i}`));
  }
  return /* @__PURE__ */ jsx5("div", { className: "sb-msg-body", children: blocks });
}

// desktop-src/components/ChatPanel.jsx
import { Fragment as Fragment3, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var PERSONAS = [
  { id: "default", label: "Default" },
  { id: "analyst", label: "Analyst" },
  { id: "critic", label: "Critic" },
  { id: "tutor", label: "Tutor" },
  { id: "socratic", label: "Socratic" }
];
var LENGTHS = [
  { id: "short", label: "Short" },
  { id: "standard", label: "Standard" },
  { id: "long", label: "Deep" }
];
function ChatPanel({
  ctx,
  notebook,
  sources,
  messages,
  claims,
  contradictions,
  coverage,
  centerTab,
  onChangeCenterTab,
  onPatchNotebook,
  onOpenChunk,
  onOpenSource,
  onRefresh,
  onError
}) {
  const [input, setInput] = useState3("");
  const [asking, setAsking] = useState3(false);
  const [stage, setStage] = useState3("");
  const [partialText, setPartialText] = useState3("");
  const [briefingBusy, setBriefingBusy] = useState3(false);
  const [claimFilter, setClaimFilter] = useState3("all");
  const endRef = useRef3(null);
  const cancelPollRef = useRef3(null);
  const activeJobRef = useRef3("");
  const enabledSources = sources.filter((s) => s.enabled);
  useEffect2(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect2(() => {
    if (!ctx?.onEvent) return void 0;
    return ctx.onEvent("plugin.sourcebook.job.progress", (ev) => {
      const payload = ev?.payload || ev || {};
      if (!activeJobRef.current || payload.job !== activeJobRef.current) return;
      if (payload.stage) setStage(payload.stage);
      if (typeof payload.partial_text === "string" && payload.partial_text) {
        setPartialText(payload.partial_text);
      }
    });
  }, [ctx]);
  useEffect2(() => {
    if (centerTab === "chat" && endRef.current) {
      endRef.current.scrollIntoView({ block: "end" });
    }
  }, [messages.length, partialText, centerTab]);
  async function sendQuestion(promptText) {
    const q = String(promptText ?? input).trim();
    if (!q || !notebook?.id || asking) return;
    if (enabledSources.length === 0) {
      onError?.("Enable at least one source before asking a question.");
      return;
    }
    setInput("");
    setAsking(true);
    setStage("Searching active sources with hybrid retrieval...");
    setPartialText("");
    onChangeCenterTab("chat");
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(notebook.id)}/ask`, {
        method: "POST",
        body: {
          text: q,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          persona: notebook.persona || "default",
          length: notebook.length || "standard",
          strict: Boolean(notebook.strict)
        }
      });
      activeJobRef.current = job;
      cancelPollRef.current?.();
      cancelPollRef.current = pollJob(
        ctx,
        job,
        (j) => {
          setStage(j.stage || "Working...");
          if (j.partial_text) setPartialText(j.partial_text);
        },
        async () => {
          activeJobRef.current = "";
          setAsking(false);
          setStage("");
          setPartialText("");
          await onRefresh();
        },
        (err) => {
          activeJobRef.current = "";
          setAsking(false);
          setStage("");
          setPartialText("");
          onError?.(err.message || "Could not answer question.");
        }
      );
    } catch (err) {
      activeJobRef.current = "";
      setAsking(false);
      setStage("");
      setPartialText("");
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
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Saved reply to Notes." });
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
  const conflicts = contradictions?.conflicts || [];
  const consensus = contradictions?.consensus || [];
  const supportedCount = claims.filter((c) => c.verdict === "supported").length;
  const partialCount = claims.filter((c) => c.verdict === "partial").length;
  const unsupportedCount = claims.filter((c) => c.verdict === "unsupported").length;
  const filteredClaims = claimFilter === "all" ? claims : claims.filter((c) => c.verdict === claimFilter);
  const guide = notebook?.guide;
  return /* @__PURE__ */ jsxs5("main", { className: "sb-pane sb-pane-center", "aria-label": "Research Workspace", children: [
    /* @__PURE__ */ jsxs5("div", { className: "sb-center-tabs", children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-seg", role: "tablist", children: [
        /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "chat",
            className: "sb-seg-btn",
            "data-active": centerTab === "chat",
            onClick: () => onChangeCenterTab("chat"),
            children: [
              /* @__PURE__ */ jsx6(Icon, { name: "MessageSquare", size: 12 }),
              " Grounded Chat"
            ]
          }
        ),
        /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "claims",
            className: "sb-seg-btn",
            "data-active": centerTab === "claims",
            onClick: () => onChangeCenterTab("claims"),
            children: [
              /* @__PURE__ */ jsx6(Icon, { name: "ShieldCheck", size: 12 }),
              " Claim Ledger",
              " ",
              /* @__PURE__ */ jsx6("span", { className: "sb-num", style: { opacity: 0.7 }, children: claims.length + conflicts.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": centerTab === "coverage",
            className: "sb-seg-btn",
            "data-active": centerTab === "coverage",
            onClick: () => onChangeCenterTab("coverage"),
            children: [
              /* @__PURE__ */ jsx6(Icon, { name: "BarChart3", size: 12 }),
              " Coverage Map"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx6("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: centerTab === "chat" && messages.length > 0 ? /* @__PURE__ */ jsx6("button", { type: "button", className: "sb-btn sb-btn-ghost", onClick: clearChat, children: "Clear" }) : null })
    ] }),
    centerTab === "chat" ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-chat-stream sb-scroll", children: [
        sources.length > 0 ? /* @__PURE__ */ jsxs5("section", { className: "sb-briefing", style: { margin: 0 }, children: [
          /* @__PURE__ */ jsxs5("div", { className: "sb-briefing-head", children: [
            /* @__PURE__ */ jsxs5("span", { className: "sb-briefing-title", children: [
              /* @__PURE__ */ jsx6(Icon, { name: "BookOpen", size: 14 }),
              " Notebook Briefing"
            ] }),
            /* @__PURE__ */ jsxs5(
              "button",
              {
                type: "button",
                className: "sb-btn",
                disabled: briefingBusy || enabledSources.length === 0,
                onClick: generateBriefing,
                children: [
                  /* @__PURE__ */ jsx6(Icon, { name: "RefreshCw", size: 12 }),
                  " ",
                  briefingBusy ? "Updating..." : guide ? "Refresh" : "Generate briefing"
                ]
              }
            )
          ] }),
          guide?.overview ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
            /* @__PURE__ */ jsx6("p", { className: "sb-briefing-text", children: guide.overview }),
            guide.topics?.length ? /* @__PURE__ */ jsx6("div", { className: "sb-chips", children: guide.topics.map((t, idx) => /* @__PURE__ */ jsx6("span", { className: "sb-kind-tag", style: { textTransform: "none", padding: "2px 7px" }, children: t }, idx)) }) : null,
            guide.suggested_questions?.length ? /* @__PURE__ */ jsx6("div", { className: "sb-chips", children: guide.suggested_questions.map((sq, idx) => /* @__PURE__ */ jsx6("button", { type: "button", className: "sb-chip-q", onClick: () => sendQuestion(sq), children: sq }, idx)) }) : null
          ] }) : /* @__PURE__ */ jsxs5("p", { className: "sb-briefing-text", children: [
            enabledSources.length,
            " active source",
            enabledSources.length === 1 ? "" : "s",
            " indexed. Generate a briefing for starter questions or ask directly below."
          ] })
        ] }) : null,
        messages.length === 0 && sources.length === 0 ? /* @__PURE__ */ jsxs5("div", { className: "sb-empty", style: { marginTop: 48 }, children: [
          /* @__PURE__ */ jsx6(Icon, { name: "Library", size: 26 }),
          /* @__PURE__ */ jsx6("div", { style: { fontWeight: 650, fontSize: 14, color: "var(--ui-text-primary)" }, children: "Add sources to begin" }),
          /* @__PURE__ */ jsx6("div", { style: { maxWidth: 400, fontSize: 12.5 }, children: "Upload PDFs, DOCX, Markdown, CSVs, audio, YouTube links, or sync a local folder in the left rail. Every reply links inline citations back to the exact passage." })
        ] }) : null,
        messages.map((msg) => {
          if (msg.role === "user") {
            return /* @__PURE__ */ jsx6("div", { className: "sb-msg sb-msg-user", children: msg.content }, msg.id);
          }
          const citeIndex = /* @__PURE__ */ new Map();
          (msg.citations || []).forEach((cid, i) => citeIndex.set(cid, i + 1));
          const gr = msg.grounding || {};
          const sup = gr.claims_supported ?? (msg.claims || []).filter((c) => c.verdict === "supported").length;
          const unsup = gr.claims_unsupported ?? (msg.claims || []).filter((c) => c.verdict === "unsupported").length;
          return /* @__PURE__ */ jsxs5("article", { className: "sb-msg sb-msg-assistant", children: [
            /* @__PURE__ */ jsx6(MarkdownBody, { text: msg.content, citeIndexMap: citeIndex, onOpenChunk }),
            /* @__PURE__ */ jsxs5("div", { className: "sb-msg-foot", children: [
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
                typeof gr.score === "number" ? /* @__PURE__ */ jsxs5(
                  "span",
                  {
                    className: "sb-verdict",
                    "data-v": gr.score >= 0.8 ? "supported" : gr.score >= 0.5 ? "partial" : "unsupported",
                    children: [
                      /* @__PURE__ */ jsxs5("span", { className: "sb-num", children: [
                        Math.round(gr.score * 100),
                        "%"
                      ] }),
                      " cited"
                    ]
                  }
                ) : null,
                sup > 0 ? /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "supported", children: [
                  /* @__PURE__ */ jsx6("span", { className: "sb-num", children: sup }),
                  " verified"
                ] }) : null,
                unsup > 0 ? /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "unsupported", children: [
                  /* @__PURE__ */ jsx6("span", { className: "sb-num", children: unsup }),
                  " uncited"
                ] }) : null,
                gr.model ? /* @__PURE__ */ jsx6("span", { className: "sb-kind-tag", style: { textTransform: "none" }, title: `Answered by ${gr.provider ? `${gr.provider} / ` : ""}${gr.model}`, children: gr.model }) : gr.mode === "extractive" ? /* @__PURE__ */ jsx6("span", { className: "sb-kind-tag", title: "Generated locally from indexed chunks without an external model call", children: "Local extractive" }) : null
              ] }),
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxs5(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    onClick: () => copyText(msg.content),
                    children: [
                      /* @__PURE__ */ jsx6(Icon, { name: "Copy", size: 12 }),
                      " Copy"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs5(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    onClick: () => saveAsNote(msg),
                    children: [
                      /* @__PURE__ */ jsx6(Icon, { name: "BookmarkPlus", size: 12 }),
                      " Save note"
                    ]
                  }
                )
              ] })
            ] })
          ] }, msg.id);
        }),
        asking ? /* @__PURE__ */ jsxs5("div", { className: "sb-msg sb-msg-assistant", "aria-busy": "true", children: [
          partialText ? /* @__PURE__ */ jsx6(MarkdownBody, { text: partialText, citeIndexMap: /* @__PURE__ */ new Map(), onOpenChunk }) : null,
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-secondary)", fontSize: 12 }, children: [
            /* @__PURE__ */ jsx6(Icon, { name: "Search", size: 13 }),
            " ",
            stage || "Searching active sources..."
          ] })
        ] }) : null,
        /* @__PURE__ */ jsx6("div", { ref: endRef })
      ] }),
      /* @__PURE__ */ jsx6("div", { className: "sb-composer-wrap", children: /* @__PURE__ */ jsxs5("div", { className: "sb-composer", children: [
        /* @__PURE__ */ jsx6(
          "textarea",
          {
            className: "sb-textarea",
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
        /* @__PURE__ */ jsxs5("div", { className: "sb-composer-bar", style: { flexWrap: "wrap", gap: 8 }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs5("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
              /* @__PURE__ */ jsx6("span", { className: "sb-num", children: enabledSources.length }),
              "/",
              sources.length,
              " active"
            ] }),
            notebook ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
              /* @__PURE__ */ jsx6(
                "select",
                {
                  className: "sb-select",
                  "aria-label": "Response persona",
                  value: notebook.persona || "default",
                  onChange: (e) => onPatchNotebook?.({ persona: e.target.value }),
                  children: PERSONAS.map((p) => /* @__PURE__ */ jsxs5("option", { value: p.id, children: [
                    "Persona: ",
                    p.label
                  ] }, p.id))
                }
              ),
              /* @__PURE__ */ jsx6(
                "select",
                {
                  className: "sb-select",
                  "aria-label": "Response length",
                  value: notebook.length || "standard",
                  onChange: (e) => onPatchNotebook?.({ length: e.target.value }),
                  children: LENGTHS.map((l) => /* @__PURE__ */ jsxs5("option", { value: l.id, children: [
                    "Length: ",
                    l.label
                  ] }, l.id))
                }
              )
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxs5(
            "button",
            {
              type: "button",
              className: "sb-btn sb-btn-primary",
              disabled: asking || !input.trim() || enabledSources.length === 0,
              onClick: () => sendQuestion(),
              children: [
                /* @__PURE__ */ jsx6(Icon, { name: "ArrowUp", size: 13 }),
                " Ask"
              ]
            }
          )
        ] })
      ] }) })
    ] }) : null,
    centerTab === "claims" ? /* @__PURE__ */ jsxs5("div", { className: "sb-panel-pad sb-scroll", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-strip", style: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }, children: [
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Verified" }),
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-val", style: { color: "var(--sb-ok)" }, children: supportedCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Partial" }),
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-val", style: { color: "var(--sb-warn)" }, children: partialCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Uncited" }),
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-val", style: { color: unsupportedCount > 0 ? "var(--sb-bad)" : "var(--ui-text-primary)" }, children: unsupportedCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Conflicts" }),
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-val", style: { color: conflicts.length > 0 ? "var(--sb-warn)" : "var(--ui-text-primary)" }, children: conflicts.length })
        ] })
      ] }),
      conflicts.length > 0 ? /* @__PURE__ */ jsxs5("section", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxs5("span", { className: "sb-pane-title", children: [
            "Cross-Source Contradictions (",
            conflicts.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx6("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Detected automatically across active sources" })
        ] }),
        conflicts.map((cf) => /* @__PURE__ */ jsxs5("article", { className: "sb-conflict-card", children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx6("strong", { style: { fontSize: 12.5 }, children: cf.topic }),
            /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "partial", children: [
              cf.kind,
              " conflict"
            ] })
          ] }),
          /* @__PURE__ */ jsx6("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: cf.summary }),
          /* @__PURE__ */ jsx6("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [cf.side_a, cf.side_b].map((side, idx) => /* @__PURE__ */ jsxs5("div", { className: "sb-quote-box", style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx6("span", { className: "sb-src-title", style: { fontSize: 11.5 }, children: side.source_title }),
              /* @__PURE__ */ jsx6(
                "button",
                {
                  type: "button",
                  className: "sb-cite",
                  onClick: () => onOpenSource?.({ sourceId: side.source_id, chunkId: side.chunk_id, highlight: side.value }),
                  title: `Inspect ${side.chunk_id}`,
                  children: idx === 0 ? "A" : "B"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs5("div", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-accent)", fontWeight: 600 }, children: [
              side.value,
              side.date_ref ? ` (${side.date_ref})` : ""
            ] })
          ] }, idx)) })
        ] }, cf.id))
      ] }) : null,
      consensus.length > 0 ? /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx6("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Multi-source consensus:" }),
        consensus.slice(0, 4).map((co, idx) => /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "supported", children: [
          co.topic,
          ": ",
          co.value,
          " (",
          co.sources.length,
          " sources)"
        ] }, idx))
      ] }) : null,
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
        /* @__PURE__ */ jsx6("div", { className: "sb-seg", children: ["all", "supported", "partial", "unsupported"].map((f) => /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            className: "sb-seg-btn",
            "data-active": claimFilter === f,
            onClick: () => setClaimFilter(f),
            children: f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)
          },
          f
        )) }),
        /* @__PURE__ */ jsx6("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Click any citation to inspect highlighted evidence" })
      ] }),
      filteredClaims.length === 0 ? /* @__PURE__ */ jsxs5("div", { className: "sb-empty", children: [
        /* @__PURE__ */ jsx6(Icon, { name: "ShieldCheck", size: 24 }),
        /* @__PURE__ */ jsx6("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No chat claims recorded yet" }),
        /* @__PURE__ */ jsx6("div", { style: { fontSize: 12 }, children: "Ask a grounded question to populate the Claim Ledger with verifiable evidence." })
      ] }) : filteredClaims.map((cl) => /* @__PURE__ */ jsxs5("article", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
            /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": cl.verdict, children: [
              cl.verdict,
              " ",
              typeof cl.overlap === "number" ? `(${Math.round(cl.overlap * 100)}%)` : ""
            ] }),
            cl.numeric_mismatch ? /* @__PURE__ */ jsx6("span", { className: "sb-verdict", "data-v": "unsupported", children: "number mismatch" }) : null
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
            cl.source_title ? /* @__PURE__ */ jsx6("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: cl.source_title }) : null,
            (cl.citations || []).map((cid) => /* @__PURE__ */ jsx6(
              "button",
              {
                type: "button",
                className: "sb-cite",
                onClick: () => onOpenSource?.({ sourceId: String(cid).split(":")[0], chunkId: cid, highlight: (cl.quote || "").slice(0, 48) }),
                children: cid.split(":")[1] || cid
              },
              cid
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsx6("div", { style: { fontSize: 12.5, color: "var(--ui-text-primary)" }, children: cl.text }),
        cl.quote ? /* @__PURE__ */ jsx6("div", { className: "sb-quote-box", children: cl.quote }) : null
      ] }, cl.id))
    ] }) : null,
    centerTab === "coverage" ? /* @__PURE__ */ jsxs5("div", { className: "sb-panel-pad sb-scroll", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-strip", children: [
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Corpus coverage" }),
          /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-val", children: [
            coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Interrogated chunks" }),
          /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-val", children: [
            coverage?.touched_chunks || 0,
            " / ",
            coverage?.total_chunks || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-label", children: "Blind spots" }),
          /* @__PURE__ */ jsx6("div", { className: "sb-kpi-val", children: Math.max(0, (coverage?.total_chunks || 0) - (coverage?.touched_chunks || 0)) })
        ] })
      ] }),
      (coverage?.sources || []).length === 0 ? /* @__PURE__ */ jsx6("div", { className: "sb-empty", children: "Add sources to measure how thoroughly you have explored your corpus." }) : (coverage?.sources || []).map((item) => {
        const pct = item.total_chunks > 0 ? Math.round(item.touched_chunks / item.total_chunks * 100) : 0;
        return /* @__PURE__ */ jsxs5("article", { className: "sb-ledger-row", children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxs5("div", { style: { minWidth: 0 }, children: [
              /* @__PURE__ */ jsx6("div", { className: "sb-src-title", children: item.title }),
              /* @__PURE__ */ jsxs5("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
                /* @__PURE__ */ jsx6("span", { className: "sb-num", children: item.touched_chunks }),
                " of ",
                /* @__PURE__ */ jsx6("span", { className: "sb-num", children: item.total_chunks }),
                " passages cited"
              ] })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxs5("span", { className: "sb-mono", style: { fontSize: 12, fontWeight: 600 }, children: [
                pct,
                "%"
              ] }),
              /* @__PURE__ */ jsx6(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  onClick: () => onOpenSource?.({ sourceId: item.source_id, chunkId: null }),
                  children: "Inspect"
                }
              ),
              pct < 100 ? /* @__PURE__ */ jsx6(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  onClick: () => sendQuestion(`Summarize the key facts and figures from ${item.title}.`),
                  children: "Explore gap"
                }
              ) : null
            ] })
          ] }),
          /* @__PURE__ */ jsx6("div", { className: "sb-src-bar", style: { height: 5 }, children: /* @__PURE__ */ jsx6("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) })
        ] }, item.source_id);
      })
    ] }) : null
  ] });
}

// desktop-src/components/StudioPanel.jsx
import { useEffect as useEffect7, useRef as useRef7, useState as useState10 } from "react";

// desktop-src/components/renderers/StudyGuideView.jsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs6("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs6("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs6("button", { type: "button", className: "sb-btn", onClick: () => copyText(md), children: [
        /* @__PURE__ */ jsx7(Icon, { name: "Copy", size: 12 }),
        " Copy Markdown"
      ] }),
      /* @__PURE__ */ jsxs6(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => downloadTextFile(`${artifact.id || "study-guide"}.md`, md, "text/markdown;charset=utf-8"),
          children: [
            /* @__PURE__ */ jsx7(Icon, { name: "Download", size: 12 }),
            " Download .md"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx7(MarkdownBody, { text: md, citeIndexMap: citeMap, onOpenChunk })
  ] });
}

// desktop-src/components/renderers/AudioOverviewView.jsx
import { useEffect as useEffect3, useRef as useRef4, useState as useState4 } from "react";
import { Fragment as Fragment4, jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function b64ToBlobUrl(b64, mime = "audio/mpeg") {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });
  return { url: URL.createObjectURL(blob), blob };
}
function AudioOverviewView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const spec = artifact?.spec || {};
  const turns = spec.turns || [];
  const [audioUrl, setAudioUrl] = useState4("");
  const [audioBlob, setAudioBlob] = useState4(null);
  const [loadingAudio, setLoadingAudio] = useState4(false);
  const [rate, setRate] = useState4(1);
  const [question, setQuestion] = useState4("");
  const [asking, setAsking] = useState4(false);
  const audioRef = useRef4(null);
  useEffect3(() => {
    let alive = true;
    let createdUrl = "";
    setAudioUrl("");
    setAudioBlob(null);
    if (!nbId || !artifact?.id || !artifact?.has_audio) return void 0;
    setLoadingAudio(true);
    api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/audio-data`).then((res) => {
      if (!alive || !res?.available || !res?.b64) return;
      const { url, blob } = b64ToBlobUrl(res.b64, res.mime || "audio/mpeg");
      createdUrl = url;
      setAudioUrl(url);
      setAudioBlob(blob);
    }).catch(() => {
    }).finally(() => {
      if (alive) setLoadingAudio(false);
    });
    return () => {
      alive = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [nbId, artifact?.id, artifact?.has_audio]);
  useEffect3(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate, audioUrl]);
  function toMarkdown() {
    const lines = [`# ${spec.title || "Audio Overview"}`, ""];
    if (spec.subtitle) lines.push(`*${spec.subtitle}*`, "");
    for (const t of turns) {
      const cites = (t.cites || []).length ? ` (${t.cites.join(", ")})` : "";
      lines.push(`**${t.speaker || "Host"}:** ${t.text || ""}${cites}`, "");
    }
    return lines.join("\n").trim();
  }
  function downloadMp3() {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.id || "audio-overview"}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function askHosts(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking || !nbId || !artifact?.id) return;
    setAsking(true);
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/followup`, {
        method: "POST",
        body: { question: q }
      });
      setQuestion("");
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact);
      }
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Hosts answered your follow-up." });
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not ask hosts." });
    } finally {
      setAsking(false);
    }
  }
  return /* @__PURE__ */ jsxs7("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs7("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx8("span", { className: "sb-kind-tag", children: (spec.style || "deep_dive").replace("_", " ") }),
        /* @__PURE__ */ jsx8("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: (spec.hosts || ["Alex", "Maya"]).join(" & ") })
      ] }),
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs7("button", { type: "button", className: "sb-btn", onClick: () => copyText(toMarkdown()), children: [
          /* @__PURE__ */ jsx8(Icon, { name: "Copy", size: 12 }),
          " Script"
        ] }),
        /* @__PURE__ */ jsxs7(
          "button",
          {
            type: "button",
            className: "sb-btn",
            onClick: () => downloadTextFile(`${artifact.id || "audio-overview"}.md`, toMarkdown(), "text/markdown;charset=utf-8"),
            children: [
              /* @__PURE__ */ jsx8(Icon, { name: "Download", size: 12 }),
              " .md"
            ]
          }
        ),
        audioBlob ? /* @__PURE__ */ jsxs7("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: downloadMp3, children: [
          /* @__PURE__ */ jsx8(Icon, { name: "Download", size: 12 }),
          " MP3"
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "sb-ledger-row", style: { gap: 8 }, children: audioUrl ? /* @__PURE__ */ jsxs7(Fragment4, { children: [
      /* @__PURE__ */ jsx8("audio", { ref: audioRef, controls: true, src: audioUrl, style: { width: "100%", height: 36 } }),
      /* @__PURE__ */ jsxs7("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx8("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Playback speed" }),
        /* @__PURE__ */ jsx8("div", { className: "sb-seg", children: [0.75, 1, 1.25, 1.5, 2].map((v) => /* @__PURE__ */ jsxs7(
          "button",
          {
            type: "button",
            className: "sb-seg-btn",
            "data-active": rate === v,
            onClick: () => setRate(v),
            children: [
              v,
              "x"
            ]
          },
          v
        )) })
      ] })
    ] }) : /* @__PURE__ */ jsxs7("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsx8(Icon, { name: "Headphones", size: 14, style: { color: "var(--ui-accent)" } }),
      /* @__PURE__ */ jsx8("span", { children: loadingAudio ? "Loading neural podcast audio..." : "Interactive cited transcript ready (offline or TTS skipped). Click any citation pill to inspect its source." })
    ] }) }),
    /* @__PURE__ */ jsx8("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: turns.map((t, idx) => {
      const sp = String(t.speaker || "Host");
      const isHostB = sp.toLowerCase() === "maya" || sp.toLowerCase() === "host b";
      const isListener = sp.toLowerCase() === "listener";
      return /* @__PURE__ */ jsxs7(
        "article",
        {
          className: "sb-ledger-row",
          style: {
            borderLeft: `3px solid ${isListener ? "var(--sb-ok)" : isHostB ? "var(--sb-warn)" : "var(--ui-accent)"}`
          },
          children: [
            /* @__PURE__ */ jsxs7("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsx8("span", { style: { fontSize: 11.5, fontWeight: 650, color: "var(--ui-text-primary)" }, children: sp }),
              /* @__PURE__ */ jsx8("div", { style: { display: "flex", gap: 4 }, children: (t.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) })
            ] }),
            /* @__PURE__ */ jsx8("div", { style: { fontSize: 12.5, lineHeight: 1.55, color: "var(--ui-text-secondary)" }, children: t.text })
          ]
        },
        t.id || idx
      );
    }) }),
    /* @__PURE__ */ jsxs7("form", { onSubmit: askHosts, style: { display: "flex", gap: 6, marginTop: 4 }, children: [
      /* @__PURE__ */ jsx8(
        "input",
        {
          className: "sb-input",
          value: question,
          onChange: (e) => setQuestion(e.target.value),
          placeholder: "Interrupt & ask the hosts a follow-up question...",
          disabled: asking
        }
      ),
      /* @__PURE__ */ jsx8("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: asking || !question.trim(), children: asking ? "Asking..." : "Ask Hosts" })
    ] })
  ] });
}

// desktop-src/components/renderers/FlashcardsView.jsx
import { useEffect as useEffect4, useState as useState5 } from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
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
function FlashcardsView({ nbId, artifact, onOpenChunk, onArtifactUpdated, onStateSaved }) {
  const cards = artifact?.spec?.cards || [];
  const [order, setOrder] = useState5(() => cards.map((_, i) => i));
  const [cursor, setCursor] = useState5(0);
  const [flipped, setFlipped] = useState5(false);
  const [showHint, setShowHint] = useState5(false);
  const [sm2, setSm2] = useState5(() => artifact?.state?.sm2 || {});
  useEffect4(() => {
    setOrder(cards.map((_, i) => i));
    setCursor(0);
    setFlipped(false);
    setShowHint(false);
    setSm2(artifact?.state?.sm2 || {});
  }, [artifact?.id]);
  if (!cards.length) {
    return /* @__PURE__ */ jsx9("div", { className: "sb-empty", children: "No flashcards in this deck." });
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
      const savedState = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/state`, {
        method: "PATCH",
        body: { sm2: updated }
      });
      onArtifactUpdated?.({ ...artifact, state: savedState && typeof savedState === "object" ? savedState : { ...artifact.state, sm2: updated } });
      onStateSaved?.();
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
  function exportAnki() {
    const lines = cards.map((c) => {
      const front = String(c.front || "").replace(/\t/g, " ").replace(/\n/g, "<br>");
      const back = String(c.back || "").replace(/\t/g, " ").replace(/\n/g, "<br>");
      const tags = (c.tags || []).map((t) => String(t).replace(/\s+/g, "_")).join(" ");
      return `${front}	${back}	${tags}`;
    });
    downloadTextFile(`${artifact.id || "flashcards"}-anki.tsv`, lines.join("\n"), "text/tab-separated-values;charset=utf-8");
  }
  return /* @__PURE__ */ jsxs8("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", gap: 12, fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
        /* @__PURE__ */ jsxs8("span", { children: [
          "Card ",
          /* @__PURE__ */ jsxs8("strong", { className: "sb-num", children: [
            cursor + 1,
            "/",
            cards.length
          ] })
        ] }),
        /* @__PURE__ */ jsxs8("span", { children: [
          "Due ",
          /* @__PURE__ */ jsx9("strong", { className: "sb-num", children: due })
        ] }),
        /* @__PURE__ */ jsxs8("span", { children: [
          "Mastered ",
          /* @__PURE__ */ jsx9("strong", { className: "sb-num", children: mastered })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn", onClick: shuffle, children: [
          /* @__PURE__ */ jsx9(Icon, { name: "Shuffle", size: 12 }),
          " Shuffle"
        ] }),
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn", onClick: exportCsv, children: [
          /* @__PURE__ */ jsx9(Icon, { name: "Download", size: 12 }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn", onClick: exportAnki, title: "Export tab-separated deck ready for Anki import", children: [
          /* @__PURE__ */ jsx9(Icon, { name: "Download", size: 12 }),
          " Anki TSV"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx9("div", { className: "sb-src-bar", style: { height: 4 }, children: /* @__PURE__ */ jsx9("div", { className: "sb-src-bar-fill", style: { width: `${Math.round((cursor + 1) / cards.length * 100)}%` } }) }),
    /* @__PURE__ */ jsxs8(
      "div",
      {
        className: "sb-fc-card",
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
          /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsx9("span", { className: "sb-kind-tag", children: flipped ? "Answer" : "Prompt" }),
            /* @__PURE__ */ jsx9("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Click or Space to flip" })
          ] }),
          /* @__PURE__ */ jsx9("div", { style: { fontSize: flipped ? 13.5 : 15, fontWeight: flipped ? 450 : 600, lineHeight: 1.55, color: "var(--ui-text-primary)" }, children: flipped ? card.back : card.front }),
          /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx9("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, onClick: (e) => e.stopPropagation(), children: (card.cites || []).map((cid, idx) => /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) }),
            !flipped && card.hint ? /* @__PURE__ */ jsx9(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost",
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
    flipped ? /* @__PURE__ */ jsxs8("div", { className: "sb-fc-grade-row", children: [
      /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-btn", onClick: () => grade(1), children: "Again (1d)" }),
      /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-btn", onClick: () => grade(3), children: "Hard" }),
      /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => grade(4), children: "Good" }),
      /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-btn", onClick: () => grade(5), children: "Easy" })
    ] }) : /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 }, children: [
      /* @__PURE__ */ jsxs8(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c - 1 + order.length) % order.length);
          },
          children: [
            /* @__PURE__ */ jsx9(Icon, { name: "ChevronLeft", size: 13 }),
            " Prev"
          ]
        }
      ),
      /* @__PURE__ */ jsx9("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => setFlipped(true), children: "Reveal answer" }),
      /* @__PURE__ */ jsxs8(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => {
            setFlipped(false);
            setShowHint(false);
            setCursor((c) => (c + 1) % order.length);
          },
          children: [
            "Next ",
            /* @__PURE__ */ jsx9(Icon, { name: "ChevronRight", size: 13 })
          ]
        }
      )
    ] })
  ] });
}

// desktop-src/components/renderers/QuizView.jsx
import { useEffect as useEffect5, useState as useState6 } from "react";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
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
  const [answers, setAnswers] = useState6({});
  const [retryMissedOnly, setRetryMissedOnly] = useState6(false);
  useEffect5(() => {
    setAnswers({});
    setRetryMissedOnly(false);
  }, [artifact?.id]);
  if (!questions.length) {
    return /* @__PURE__ */ jsx10("div", { className: "sb-empty", children: "No questions in this quiz." });
  }
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q, idx) => isCorrectChoice(q, answers[q.id || idx])).length;
  const visible = retryMissedOnly ? questions.filter((q, idx) => {
    const key = q.id || idx;
    return answers[key] !== void 0 && !isCorrectChoice(q, answers[key]);
  }) : questions;
  return /* @__PURE__ */ jsxs9("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs9("div", { className: "sb-kpi-strip", children: [
      /* @__PURE__ */ jsxs9("div", { className: "sb-kpi", children: [
        /* @__PURE__ */ jsx10("div", { className: "sb-kpi-label", children: "Answered" }),
        /* @__PURE__ */ jsxs9("div", { className: "sb-kpi-val", children: [
          answeredCount,
          " / ",
          questions.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "sb-kpi", children: [
        /* @__PURE__ */ jsx10("div", { className: "sb-kpi-label", children: "Score" }),
        /* @__PURE__ */ jsx10("div", { className: "sb-kpi-val", style: { color: "var(--sb-ok)" }, children: answeredCount ? `${Math.round(correctCount / answeredCount * 100)}%` : "0%" })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "sb-kpi", children: [
        /* @__PURE__ */ jsx10("div", { className: "sb-kpi-label", children: "Missed" }),
        /* @__PURE__ */ jsx10("div", { className: "sb-kpi-val", children: Math.max(0, answeredCount - correctCount) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx10(
        "button",
        {
          type: "button",
          className: "sb-btn",
          "data-active": retryMissedOnly,
          disabled: answeredCount - correctCount <= 0,
          onClick: () => setRetryMissedOnly((v) => !v),
          children: "Missed only"
        }
      ),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => {
            setAnswers({});
            setRetryMissedOnly(false);
          },
          children: [
            /* @__PURE__ */ jsx10(Icon, { name: "RotateCcw", size: 12 }),
            " Reset"
          ]
        }
      ),
      /* @__PURE__ */ jsxs9(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => {
            const lines = [`# ${artifact?.spec?.title || "Quiz"}`, ""];
            const keyLines = ["## Answer Key", ""];
            questions.forEach((q, i) => {
              lines.push(`### ${i + 1}. ${q.prompt || ""}`);
              (q.options || []).forEach((opt, oi) => lines.push(`- ${String.fromCharCode(65 + oi)}. ${opt}`));
              lines.push("");
              const ansLabel = typeof q.answer === "number" && q.options?.[q.answer] ? `${String.fromCharCode(65 + q.answer)} (${q.options[q.answer]})` : String(q.answer);
              keyLines.push(`${i + 1}. **${ansLabel}**: ${q.explanation || ""}`);
            });
            downloadTextFile(`${artifact.id || "quiz"}-key.md`, [...lines, ...keyLines].join("\n"), "text/markdown;charset=utf-8");
          },
          children: [
            /* @__PURE__ */ jsx10(Icon, { name: "Download", size: 12 }),
            " Answer Key .md"
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
      return /* @__PURE__ */ jsxs9("article", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }, children: [
          /* @__PURE__ */ jsxs9("div", { style: { fontWeight: 600, fontSize: 12.5 }, children: [
            /* @__PURE__ */ jsxs9("span", { className: "sb-mono", style: { color: "var(--ui-text-tertiary)", marginRight: 6 }, children: [
              "Q",
              idx + 1
            ] }),
            q.prompt
          ] }),
          answered ? /* @__PURE__ */ jsx10("span", { className: "sb-verdict", "data-v": ok ? "supported" : "unsupported", children: ok ? "Correct" : "Missed" }) : null
        ] }),
        opts.length > 0 ? /* @__PURE__ */ jsx10("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }, children: opts.map((opt, oi) => {
          const isSelected = chosen === oi;
          const isRight = isCorrectChoice(q, oi);
          let border = "var(--ui-stroke-secondary)";
          let bg = "var(--ui-bg-primary)";
          if (answered && isRight) {
            border = "var(--sb-ok)";
            bg = "color-mix(in srgb, var(--sb-ok) 12%, var(--ui-bg-primary))";
          } else if (answered && isSelected && !isRight) {
            border = "var(--sb-bad)";
            bg = "color-mix(in srgb, var(--sb-bad) 12%, var(--ui-bg-primary))";
          }
          return /* @__PURE__ */ jsxs9(
            "button",
            {
              type: "button",
              className: "sb-btn",
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
                /* @__PURE__ */ jsxs9("span", { className: "sb-mono", style: { color: "var(--ui-text-tertiary)", marginRight: 6 }, children: [
                  String.fromCharCode(65 + oi),
                  "."
                ] }),
                /* @__PURE__ */ jsx10("span", { children: opt })
              ]
            },
            oi
          );
        }) }) : /* @__PURE__ */ jsx10("div", { style: { display: "flex", gap: 6, marginTop: 4 }, children: /* @__PURE__ */ jsx10(
          "input",
          {
            className: "sb-input",
            placeholder: "Type your answer and press Enter...",
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                setAnswers((prev) => ({ ...prev, [key]: e.currentTarget.value }));
              }
            }
          }
        ) }),
        answered ? /* @__PURE__ */ jsxs9("div", { className: "sb-quote-box", style: { marginTop: 4 }, children: [
          /* @__PURE__ */ jsx10("div", { children: q.explanation || `Expected answer: ${String(q.answer)}` }),
          (q.cites || []).length > 0 ? /* @__PURE__ */ jsxs9("div", { style: { marginTop: 6, display: "flex", gap: 4, alignItems: "center" }, children: [
            /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Source:" }),
            (q.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx10("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), children: cIdx + 1 }, cid))
          ] }) : null
        ] }) : null
      ] }, key);
    })
  ] });
}

// desktop-src/components/renderers/MindMapView.jsx
import { useMemo, useRef as useRef5, useState as useState7 } from "react";
import { jsx as jsx11, jsxs as jsxs10 } from "react/jsx-runtime";
function layoutTree(root, collapsed) {
  const nodes = [];
  const edges = [];
  let leafY = 0;
  const xStep = 224;
  const yStep = 56;
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
      x: 32 + depth * xStep,
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
  const maxX = Math.max(640, ...nodes.map((n) => n.x + 216));
  const maxY = Math.max(340, ...nodes.map((n) => n.y + 48));
  return { nodes, edges, byId, width: maxX, height: maxY };
}
function MindMapView({ artifact, onOpenChunk }) {
  const root = artifact?.spec?.root;
  const [zoom, setZoom] = useState7(1);
  const [pan, setPan] = useState7({ x: 0, y: 0 });
  const [dragging, setDragging] = useState7(null);
  const [collapsed, setCollapsed] = useState7({});
  const [selected, setSelected] = useState7(null);
  const svgRef = useRef5(null);
  const graph = useMemo(() => layoutTree(root, collapsed), [root, collapsed]);
  const titleId = `sb-mm-title-${artifact?.id || "map"}`;
  const descId = `sb-mm-desc-${artifact?.id || "map"}`;
  if (!root) {
    return /* @__PURE__ */ jsx11("div", { className: "sb-empty", children: "No mind map structure available." });
  }
  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    await copyText(svgText);
    sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied standalone SVG to clipboard." });
  }
  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    downloadTextFile(`${artifact.id || "mindmap"}.svg`, svgText, "image/svg+xml;charset=utf-8");
  }
  function handleDownloadOpml() {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const walk = (node) => {
      const kids = (node.children || []).map(walk).join("");
      return kids ? `<outline text="${esc(node.label)}" _note="${esc(node.summary)}">${kids}</outline>` : `<outline text="${esc(node.label)}" _note="${esc(node.summary)}" />`;
    };
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0"><head><title>${esc(artifact?.spec?.title || "Mind Map")}</title></head><body>${walk(root)}</body></opml>`;
    downloadTextFile(`${artifact.id || "mindmap"}.opml`, xml, "text/xml;charset=utf-8");
  }
  const activeNode = selected ? graph.byId.get(selected) : graph.nodes.find((n) => n.depth === 0);
  return /* @__PURE__ */ jsxs10("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 4 }, children: [
        /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-btn sb-btn-icon", title: "Zoom out", onClick: () => setZoom((z) => Math.max(0.45, Number((z - 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx11(Icon, { name: "Minus", size: 13 }) }),
        /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-btn", onClick: () => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }, children: /* @__PURE__ */ jsxs10("span", { className: "sb-mono", children: [
          Math.round(zoom * 100),
          "%"
        ] }) }),
        /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-btn sb-btn-icon", title: "Zoom in", onClick: () => setZoom((z) => Math.min(2, Number((z + 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx11(Icon, { name: "Plus", size: 13 }) })
      ] }),
      /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", onClick: handleCopySvg, children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", onClick: handleDownloadSvg, children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] }),
        /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", onClick: handleDownloadOpml, title: "Export outline for XMind, MindNode, or FreeMind", children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Download", size: 12 }),
          " OPML"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx11(
      "div",
      {
        className: "sb-svg-stage",
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
        children: /* @__PURE__ */ jsxs10(
          "svg",
          {
            ref: svgRef,
            role: "img",
            "aria-labelledby": `${titleId} ${descId}`,
            width: "100%",
            height: "100%",
            viewBox: `0 0 ${graph.width} ${graph.height}`,
            style: { display: "block", background: "var(--sb-bg)" },
            children: [
              /* @__PURE__ */ jsx11("title", { id: titleId, children: artifact?.spec?.title || "Concept Mind Map" }),
              /* @__PURE__ */ jsxs10("desc", { id: descId, children: [
                "Interactive hierarchical concept map with ",
                graph.nodes.length,
                " nodes grounded in notebook sources."
              ] }),
              /* @__PURE__ */ jsxs10("g", { transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`, children: [
                graph.edges.map((ed, i) => {
                  const a = graph.byId.get(ed.from);
                  const b = graph.byId.get(ed.to);
                  if (!a || !b) return null;
                  const sx = a.x + 186;
                  const sy = a.y;
                  const tx = b.x;
                  const ty = b.y;
                  const mx = (sx + tx) / 2;
                  return /* @__PURE__ */ jsx11(
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
                  const label = n.label.length > 24 ? `${n.label.slice(0, 23)}...` : n.label;
                  return /* @__PURE__ */ jsxs10(
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
                        /* @__PURE__ */ jsx11(
                          "rect",
                          {
                            width: "186",
                            height: "36",
                            rx: "8",
                            fill: isRoot || isSel ? "var(--sb-accent-soft)" : "var(--sb-surface)",
                            stroke: isRoot || isSel ? "var(--ui-accent)" : "var(--ui-stroke-secondary)",
                            strokeWidth: isRoot || isSel ? "1.6" : "1"
                          }
                        ),
                        /* @__PURE__ */ jsx11(
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
                        n.hasChildren ? /* @__PURE__ */ jsxs10(
                          "g",
                          {
                            transform: "translate(186, 18)",
                            onClick: (e) => {
                              e.stopPropagation();
                              setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                            },
                            children: [
                              /* @__PURE__ */ jsx11("circle", { r: "8", fill: "var(--sb-surface)", stroke: "var(--ui-stroke-secondary)", strokeWidth: "1.2" }),
                              /* @__PURE__ */ jsx11("text", { textAnchor: "middle", y: "3.5", fill: "var(--ui-text-secondary)", fontSize: "11", fontWeight: "700", children: n.collapsed ? "+" : "-" })
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
    activeNode ? /* @__PURE__ */ jsxs10("div", { className: "sb-ledger-row", children: [
      /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx11("strong", { style: { fontSize: 12.5 }, children: activeNode.label }),
        /* @__PURE__ */ jsx11("div", { style: { display: "flex", gap: 4 }, children: (activeNode.cites || []).map((cid, idx) => /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) })
      ] }),
      activeNode.summary ? /* @__PURE__ */ jsx11("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: activeNode.summary }) : null
    ] }) : null
  ] });
}

// desktop-src/components/renderers/InfographicView.jsx
import { useRef as useRef6 } from "react";
import { Fragment as Fragment5, jsx as jsx12, jsxs as jsxs11 } from "react/jsx-runtime";
function wrapText(text, maxChars, maxLines = 4) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  let consumed = 0;
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i];
    if (!cur) {
      cur = w;
      consumed = i + 1;
    } else if (cur.length + 1 + w.length <= maxChars) {
      cur += " " + w;
      consumed = i + 1;
    } else {
      lines.push(cur);
      cur = w;
      consumed = i + 1;
      if (lines.length >= maxLines - 1) {
        for (let j = i + 1; j < words.length; j += 1) {
          if (cur.length + 1 + words[j].length <= maxChars - 3) {
            cur += " " + words[j];
            consumed = j + 1;
          } else {
            break;
          }
        }
        break;
      }
    }
  }
  if (cur && lines.length < maxLines) {
    lines.push(consumed < words.length ? `${cur.replace(/[.,;:\-]+$/, "")}...` : cur);
  }
  return lines;
}
function InfographicView({ artifact, onOpenChunk }) {
  const spec = artifact?.spec || {};
  const blocks = spec.blocks || [];
  const layout = spec.layout || "stat-grid";
  const svgRef = useRef6(null);
  if (!blocks.length) {
    return /* @__PURE__ */ jsx12("div", { className: "sb-empty", children: "No infographic blocks available." });
  }
  const W = 740;
  const isTimeline = layout === "timeline" || layout === "process";
  const cols = isTimeline ? 1 : 2;
  const rows = Math.ceil(blocks.length / cols);
  const cardH = isTimeline ? 104 : 156;
  const gap = 14;
  const headerH = 84;
  const H = headerH + rows * cardH + Math.max(0, rows - 1) * gap + 28;
  const titleId = `sb-inf-title-${artifact?.id || "info"}`;
  const descId = `sb-inf-desc-${artifact?.id || "info"}`;
  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    await copyText(svgText);
    sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied standalone infographic SVG." });
  }
  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    downloadTextFile(`${artifact.id || "infographic"}.svg`, svgText, "image/svg+xml;charset=utf-8");
  }
  return /* @__PURE__ */ jsxs11("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs11("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsx12("span", { className: "sb-kind-tag", children: layout }),
      /* @__PURE__ */ jsxs11("div", { style: { display: "flex", gap: 5 }, children: [
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn", onClick: handleCopySvg, children: [
          /* @__PURE__ */ jsx12(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn", onClick: handleDownloadSvg, children: [
          /* @__PURE__ */ jsx12(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] })
      ] })
    ] }),
    spec.hero_image_url ? /* @__PURE__ */ jsx12(
      "img",
      {
        src: spec.hero_image_url,
        alt: spec.title || "Infographic hero visual",
        style: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid var(--ui-stroke-secondary)" }
      }
    ) : null,
    /* @__PURE__ */ jsx12("div", { className: "sb-svg-stage", children: /* @__PURE__ */ jsxs11(
      "svg",
      {
        ref: svgRef,
        role: "img",
        "aria-labelledby": `${titleId} ${descId}`,
        width: "100%",
        viewBox: `0 0 ${W} ${H}`,
        style: { display: "block", background: "var(--sb-bg)" },
        children: [
          /* @__PURE__ */ jsx12("title", { id: titleId, children: spec.title || "Infographic" }),
          /* @__PURE__ */ jsx12("desc", { id: descId, children: spec.subtitle || `Structured ${layout} infographic with ${blocks.length} cited items.` }),
          /* @__PURE__ */ jsx12("rect", { x: "0", y: "0", width: W, height: H, fill: "var(--sb-bg)" }),
          /* @__PURE__ */ jsx12("text", { x: "24", y: "38", fill: "var(--ui-text-primary)", fontSize: "20", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: String(spec.title || "Infographic").slice(0, 62) }),
          spec.subtitle ? /* @__PURE__ */ jsx12("text", { x: "24", y: "59", fill: "var(--ui-text-secondary)", fontSize: "12.5", fontFamily: "system-ui, -apple-system, sans-serif", children: String(spec.subtitle).slice(0, 96) }) : null,
          /* @__PURE__ */ jsx12("line", { x1: "24", y1: "74", x2: W - 24, y2: "74", stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1" }),
          isTimeline ? /* @__PURE__ */ jsx12("line", { x1: "48", y1: headerH + 22, x2: "48", y2: H - 36, stroke: "var(--ui-stroke-secondary)", strokeWidth: "2" }) : null,
          blocks.map((blk, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cardW = isTimeline ? W - 96 : (W - 48 - gap) / 2;
            const x = isTimeline ? 72 : 24 + col * (cardW + gap);
            const y = headerH + row * (cardH + gap);
            const bodyLines = wrapText(blk.body, isTimeline ? 80 : 45, 4);
            return /* @__PURE__ */ jsxs11("g", { children: [
              isTimeline ? /* @__PURE__ */ jsxs11(Fragment5, { children: [
                /* @__PURE__ */ jsx12("circle", { cx: "48", cy: y + 28, r: "13", fill: "var(--sb-accent-soft)", stroke: "var(--ui-accent)", strokeWidth: "1.5" }),
                /* @__PURE__ */ jsx12("text", { x: "48", y: y + 32, textAnchor: "middle", fill: "var(--ui-accent)", fontSize: "11", fontWeight: "700", fontFamily: "ui-monospace, monospace", children: idx + 1 })
              ] }) : null,
              /* @__PURE__ */ jsx12(
                "rect",
                {
                  x,
                  y,
                  width: cardW,
                  height: cardH,
                  rx: "10",
                  fill: "var(--sb-surface)",
                  stroke: "var(--ui-stroke-secondary)",
                  strokeWidth: "1"
                }
              ),
              blk.value ? /* @__PURE__ */ jsx12(
                "text",
                {
                  x: x + 16,
                  y: y + 32,
                  fill: "var(--ui-accent)",
                  fontSize: isTimeline ? "15" : "24",
                  fontWeight: "750",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: String(blk.value).slice(0, 22)
                }
              ) : null,
              /* @__PURE__ */ jsx12(
                "text",
                {
                  x: x + 16,
                  y: y + (blk.value ? 55 : 30),
                  fill: "var(--ui-text-primary)",
                  fontSize: "13.5",
                  fontWeight: "650",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  children: String(blk.heading || `Item ${idx + 1}`).slice(0, isTimeline ? 64 : 38)
                }
              ),
              /* @__PURE__ */ jsx12(
                "text",
                {
                  x: x + 16,
                  y: y + (blk.value ? 76 : 52),
                  fill: "var(--ui-text-secondary)",
                  fontSize: "12",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  children: bodyLines.map((ln, lIdx) => /* @__PURE__ */ jsx12("tspan", { x: x + 16, dy: lIdx === 0 ? 0 : 16, children: ln }, lIdx))
                }
              )
            ] }, blk.id || idx);
          })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs11("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx12("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Cited passages:" }),
      Array.from(new Set(blocks.flatMap((b) => b.cites || []))).map((cid, idx) => /* @__PURE__ */ jsx12("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid))
    ] })
  ] });
}

// desktop-src/components/renderers/DataTableView.jsx
import { useMemo as useMemo2, useState as useState8 } from "react";
import { jsx as jsx13, jsxs as jsxs12 } from "react/jsx-runtime";
function DataTableView({ artifact, onOpenChunk }) {
  const cols = artifact?.spec?.columns || [];
  const rows = artifact?.spec?.rows || [];
  const [query, setQuery] = useState8("");
  const [sort, setSort] = useState8({ key: null, dir: "asc" });
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
    return /* @__PURE__ */ jsx13("div", { className: "sb-empty", children: "No table columns available." });
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
  return /* @__PURE__ */ jsxs12("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs12("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx13(
        "input",
        {
          className: "sb-input",
          style: { flex: 1, minWidth: 150 },
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: "Filter rows..."
        }
      ),
      /* @__PURE__ */ jsxs12(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: async () => {
            await copyText(toMarkdown());
            sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied Markdown table." });
          },
          children: [
            /* @__PURE__ */ jsx13(Icon, { name: "Copy", size: 12 }),
            " Markdown"
          ]
        }
      ),
      /* @__PURE__ */ jsxs12("button", { type: "button", className: "sb-btn", onClick: exportCsv, children: [
        /* @__PURE__ */ jsx13(Icon, { name: "Download", size: 12 }),
        " CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsx13("div", { className: "sb-table-wrap sb-scroll", style: { maxHeight: 420 }, children: /* @__PURE__ */ jsxs12("table", { className: "sb-table", children: [
      /* @__PURE__ */ jsx13("thead", { children: /* @__PURE__ */ jsxs12("tr", { children: [
        cols.map((c) => /* @__PURE__ */ jsxs12("th", { onClick: () => toggleSort(c.key), children: [
          c.label || c.key,
          " ",
          sort.key === c.key ? sort.dir === "asc" ? "\u2191" : "\u2193" : ""
        ] }, c.key)),
        /* @__PURE__ */ jsx13("th", { children: "Cite" })
      ] }) }),
      /* @__PURE__ */ jsx13("tbody", { children: filtered.map((r, rIdx) => /* @__PURE__ */ jsxs12("tr", { children: [
        cols.map((c) => /* @__PURE__ */ jsx13("td", { className: c.type === "number" ? "sb-num" : void 0, children: String(r.cells?.[c.key] ?? "") }, c.key)),
        /* @__PURE__ */ jsx13("td", { style: { whiteSpace: "nowrap" }, children: (r.cites || []).map((cid, idx) => /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) })
      ] }, r.id || rIdx)) })
    ] }) })
  ] });
}

// desktop-src/components/renderers/SlideDeckView.jsx
import { useEffect as useEffect6, useState as useState9 } from "react";
import { jsx as jsx14, jsxs as jsxs13 } from "react/jsx-runtime";
function SlideDeckView({ nbId, artifact, onOpenChunk }) {
  const slides = artifact?.spec?.slides || [];
  const [idx, setIdx] = useState9(0);
  const [showNotes, setShowNotes] = useState9(true);
  const [presenting, setPresenting] = useState9(false);
  const [elapsedSec, setElapsedSec] = useState9(0);
  useEffect6(() => {
    setIdx(0);
    setPresenting(false);
  }, [artifact?.id]);
  useEffect6(() => {
    if (!presenting) {
      setElapsedSec(0);
      return void 0;
    }
    const ctx = getContext();
    if (ctx && typeof ctx.setInterval === "function") {
      return ctx.setInterval(() => setElapsedSec((s) => s + 1), 1e3);
    }
    return void 0;
  }, [presenting]);
  if (!slides.length) {
    return /* @__PURE__ */ jsx14("div", { className: "sb-empty", children: "No slides in this deck." });
  }
  const sl = slides[idx] || slides[0];
  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const secs = String(elapsedSec % 60).padStart(2, "0");
  function toMarp() {
    const lines = ["---", "marp: true", `title: ${artifact?.spec?.title || "SourceBook Deck"}`, "paginate: true", "---", ""];
    slides.forEach((s, i) => {
      if (i > 0) lines.push("\n---\n");
      lines.push(`# ${s.title || ""}
`);
      if (s.stat?.value) lines.push(`## ${s.stat.value}
${s.stat.label || ""}
`);
      if (s.image_url) lines.push(`![${s.title || "Slide illustration"}](${s.image_url})
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
  async function downloadHtmlDeck() {
    if (!nbId || !artifact?.id) return;
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-payload?fmt=html`);
      if (res?.content) {
        downloadTextFile(res.filename || `${artifact.id}.deck.html`, res.content, res.media_type || "text/html;charset=utf-8");
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not export HTML deck." });
    }
  }
  function renderSlideCard(large = false) {
    return /* @__PURE__ */ jsxs13("section", { className: "sb-slide-stage", style: large ? { maxWidth: 960, width: "100%", padding: "32px 40px" } : void 0, children: [
      /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx14("span", { className: "sb-kind-tag", children: sl.layout || "slide" }),
        /* @__PURE__ */ jsxs13("span", { className: "sb-mono", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
          String(idx + 1).padStart(2, "0"),
          " / ",
          String(slides.length).padStart(2, "0")
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBlock: "auto" }, children: [
        /* @__PURE__ */ jsx14("h2", { style: { margin: 0, fontSize: large ? sl.layout === "title" ? 32 : 24 : sl.layout === "title" ? 21 : 17, fontWeight: 700, lineHeight: 1.25 }, children: sl.title }),
        sl.stat?.value ? /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "baseline", gap: 12 }, children: [
          /* @__PURE__ */ jsx14("span", { className: "sb-mono", style: { fontSize: large ? 48 : 32, fontWeight: 750, color: "var(--ui-accent)", lineHeight: 1 }, children: sl.stat.value }),
          /* @__PURE__ */ jsx14("span", { style: { fontSize: large ? 15 : 12.5, color: "var(--ui-text-secondary)" }, children: sl.stat.label })
        ] }) : null,
        sl.image_url ? /* @__PURE__ */ jsx14(
          "img",
          {
            src: sl.image_url,
            alt: sl.title || "Slide illustration",
            style: { width: "100%", maxHeight: large ? 240 : 150, objectFit: "cover", borderRadius: 8, border: "1px solid var(--ui-stroke-tertiary)" }
          }
        ) : null,
        sl.body ? /* @__PURE__ */ jsx14("p", { style: { margin: 0, fontSize: large ? 15.5 : 13, color: "var(--ui-text-secondary)", lineHeight: 1.5 }, children: sl.body }) : null,
        (sl.bullets || []).length > 0 ? /* @__PURE__ */ jsx14("ul", { style: { margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: large ? 8 : 5, fontSize: large ? 15 : 12.5 }, children: sl.bullets.map((b, bIdx) => /* @__PURE__ */ jsx14("li", { children: b }, bIdx)) }) : null
      ] }),
      /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx14("div", { style: { display: "flex", gap: 4 }, children: (sl.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) }),
        /* @__PURE__ */ jsx14("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: artifact?.spec?.title || "SourceBook Deck" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs13(
    "div",
    {
      style: { display: "flex", flexDirection: "column", gap: 10 },
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "ArrowRight") setIdx((i) => Math.min(slides.length - 1, i + 1));
        if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
        if (e.key === "Escape" && presenting) setPresenting(false);
      },
      children: [
        /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
            /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn sb-btn-icon", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)), children: /* @__PURE__ */ jsx14(Icon, { name: "ChevronLeft", size: 13 }) }),
            /* @__PURE__ */ jsxs13("span", { className: "sb-mono", style: { fontSize: 12, color: "var(--ui-text-secondary)", padding: "0 4px" }, children: [
              idx + 1,
              " / ",
              slides.length
            ] }),
            /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn sb-btn-icon", disabled: idx >= slides.length - 1, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: /* @__PURE__ */ jsx14(Icon, { name: "ChevronRight", size: 13 }) })
          ] }),
          /* @__PURE__ */ jsxs13("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => setPresenting(true), title: "Launch full-window Presenter Mode", children: [
              /* @__PURE__ */ jsx14(Icon, { name: "Play", size: 12 }),
              " Present"
            ] }),
            /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn", "data-active": showNotes, onClick: () => setShowNotes((v) => !v), children: "Notes" }),
            /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: () => copyText(toMarp()), children: [
              /* @__PURE__ */ jsx14(Icon, { name: "Copy", size: 12 }),
              " Marp"
            ] }),
            /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: downloadHtmlDeck, title: "Download self-contained offline HTML presentation", children: [
              /* @__PURE__ */ jsx14(Icon, { name: "Download", size: 12 }),
              " HTML Deck"
            ] })
          ] })
        ] }),
        renderSlideCard(false),
        showNotes && sl.notes ? /* @__PURE__ */ jsxs13("div", { className: "sb-quote-box", children: [
          /* @__PURE__ */ jsx14("strong", { style: { display: "block", fontSize: 11, color: "var(--ui-text-tertiary)", marginBottom: 3 }, children: "SPEAKER NOTES" }),
          sl.notes
        ] }) : null,
        /* @__PURE__ */ jsx14("div", { className: "sb-slide-strip sb-scroll", children: slides.map((s, sIdx) => /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-slide-thumb",
            "data-active": sIdx === idx,
            onClick: () => setIdx(sIdx),
            children: [
              /* @__PURE__ */ jsx14("div", { className: "sb-mono", style: { fontSize: 10, color: "var(--ui-text-tertiary)" }, children: sIdx + 1 }),
              /* @__PURE__ */ jsx14("div", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 550, marginTop: 2 }, children: s.title })
            ]
          },
          sIdx
        )) }),
        presenting ? /* @__PURE__ */ jsx14(
          "div",
          {
            className: "sb-modal-backdrop",
            style: { flexDirection: "column", gap: 14, padding: 24, zIndex: 80 },
            onClick: () => setPresenting(false),
            children: /* @__PURE__ */ jsxs13(
              "div",
              {
                style: { width: "min(980px, 95vw)", display: "flex", flexDirection: "column", gap: 12 },
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                    /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
                      /* @__PURE__ */ jsx14("span", { className: "sb-kind-tag", children: "Presenter Mode" }),
                      /* @__PURE__ */ jsxs13("span", { className: "sb-mono", style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
                        mins,
                        ":",
                        secs
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs13("div", { style: { display: "flex", gap: 6 }, children: [
                      /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)), children: "Prev" }),
                      /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn", disabled: idx >= slides.length - 1, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: "Next" }),
                      /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: () => setPresenting(false), children: [
                        /* @__PURE__ */ jsx14(Icon, { name: "X", size: 13 }),
                        " Exit"
                      ] })
                    ] })
                  ] }),
                  renderSlideCard(true),
                  sl.notes ? /* @__PURE__ */ jsxs13("div", { className: "sb-quote-box", style: { background: "var(--sb-surface)" }, children: [
                    /* @__PURE__ */ jsx14("strong", { style: { display: "block", fontSize: 11, color: "var(--ui-text-tertiary)", marginBottom: 3 }, children: "SPEAKER NOTES" }),
                    sl.notes
                  ] }) : null
                ]
              }
            )
          }
        ) : null
      ]
    }
  );
}

// desktop-src/components/StudioPanel.jsx
import { Fragment as Fragment6, jsx as jsx15, jsxs as jsxs14 } from "react/jsx-runtime";
var STUDIO_FORMATS = [
  { kind: "report", label: "Study Guide", icon: "FileText" },
  { kind: "audio", label: "Audio Overview", icon: "Headphones" },
  { kind: "mindmap", label: "Mind Map", icon: "GitBranch" },
  { kind: "flashcards", label: "Flashcards", icon: "Layers" },
  { kind: "quiz", label: "Quiz", icon: "CheckSquare" },
  { kind: "infographic", label: "Infographic", icon: "LayoutGrid" },
  { kind: "table", label: "Data Table", icon: "Table" },
  { kind: "slides", label: "Slide Deck", icon: "Presentation" }
];
var KIND_META = Object.fromEntries(STUDIO_FORMATS.map((f) => [f.kind, f]));
function StudioPanel({
  ctx,
  nbId,
  hasActiveSources,
  capabilities,
  artifacts,
  selectedArtifactId,
  expanded,
  onToggleExpand,
  onSelectArtifact,
  onOpenChunk,
  onRefresh,
  onError
}) {
  const [activeArt, setActiveArt] = useState10(null);
  const [loadingArt, setLoadingArt] = useState10(false);
  const [runningKind, setRunningKind] = useState10("");
  const [stage, setStage] = useState10("");
  const [focusPrompt, setFocusPrompt] = useState10("");
  const [showOpts, setShowOpts] = useState10(false);
  const [template, setTemplate] = useState10("briefing");
  const [audioStyle, setAudioStyle] = useState10("deep_dive");
  const [count, setCount] = useState10(8);
  const [language, setLanguage] = useState10("English");
  const [includeImages, setIncludeImages] = useState10(false);
  const cancelPollRef = useRef7(null);
  useEffect7(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect7(() => {
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
  async function runGenerator(kind, overrideParams) {
    if (!nbId || !hasActiveSources || runningKind) return;
    setRunningKind(kind);
    setStage(`Generating ${KIND_META[kind]?.label || kind}...`);
    const params = overrideParams || {
      ...focusPrompt.trim() ? { focus: focusPrompt.trim() } : {},
      template,
      style: audioStyle,
      count: Number(count) || 8,
      language,
      ...includeImages && capabilities?.image_generate ? { include_images: true } : {}
    };
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/studio`, {
        method: "POST",
        body: { kind, params }
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
    if (loadingArt) return /* @__PURE__ */ jsx15("div", { className: "sb-empty", children: "Loading artifact..." });
    if (!activeArt) return null;
    switch (activeArt.kind) {
      case "report":
        return /* @__PURE__ */ jsx15(StudyGuideView, { artifact: activeArt, onOpenChunk });
      case "audio":
        return /* @__PURE__ */ jsx15(
          AudioOverviewView,
          {
            nbId,
            artifact: activeArt,
            onOpenChunk,
            onArtifactUpdated: setActiveArt
          }
        );
      case "flashcards":
        return /* @__PURE__ */ jsx15(
          FlashcardsView,
          {
            nbId,
            artifact: activeArt,
            onOpenChunk,
            onArtifactUpdated: setActiveArt,
            onStateSaved: onRefresh
          }
        );
      case "quiz":
        return /* @__PURE__ */ jsx15(QuizView, { artifact: activeArt, onOpenChunk });
      case "mindmap":
        return /* @__PURE__ */ jsx15(MindMapView, { artifact: activeArt, onOpenChunk });
      case "infographic":
        return /* @__PURE__ */ jsx15(InfographicView, { artifact: activeArt, onOpenChunk });
      case "table":
        return /* @__PURE__ */ jsx15(DataTableView, { artifact: activeArt, onOpenChunk });
      case "slides":
        return /* @__PURE__ */ jsx15(SlideDeckView, { nbId, artifact: activeArt, onOpenChunk });
      default:
        return /* @__PURE__ */ jsx15("pre", { className: "sb-mono", style: { fontSize: 11 }, children: JSON.stringify(activeArt.spec, null, 2) });
    }
  }
  return /* @__PURE__ */ jsx15("aside", { className: "sb-pane sb-pane-right", "aria-label": "Studio", children: selectedArtifactId && activeArt ? /* @__PURE__ */ jsxs14("div", { className: "sb-viewer", children: [
    /* @__PURE__ */ jsxs14("div", { className: "sb-viewer-head", children: [
      /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
        /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-ghost sb-btn-icon",
            title: "Back to Studio",
            onClick: () => {
              onSelectArtifact?.(null);
              if (expanded) onToggleExpand?.();
            },
            children: /* @__PURE__ */ jsx15(Icon, { name: "ArrowLeft", size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs14("div", { style: { minWidth: 0 }, children: [
          /* @__PURE__ */ jsx15("div", { className: "sb-src-title", title: activeArt.title, children: activeArt.title }),
          /* @__PURE__ */ jsxs14("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", display: "flex", gap: 6, alignItems: "center" }, children: [
            /* @__PURE__ */ jsx15("span", { children: KIND_META[activeArt.kind]?.label || activeArt.kind }),
            activeArt.grounding?.model ? /* @__PURE__ */ jsxs14("span", { children: [
              "| ",
              activeArt.grounding.model
            ] }) : null,
            !activeArt.grounding?.model && activeArt.grounding?.mode === "extractive" ? /* @__PURE__ */ jsx15("span", { children: "| Local extractive" }) : null,
            activeArt.stale ? /* @__PURE__ */ jsx15("span", { className: "sb-verdict", "data-v": "partial", children: "Stale" }) : null
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 4 }, children: [
        activeArt.stale ? /* @__PURE__ */ jsxs14(
          "button",
          {
            type: "button",
            className: "sb-btn",
            disabled: Boolean(runningKind),
            onClick: () => runGenerator(activeArt.kind, activeArt.params || {}),
            title: "Underlying source changed: regenerate artifact from updated sources",
            children: [
              /* @__PURE__ */ jsx15(Icon, { name: "RefreshCw", size: 12 }),
              " Refresh"
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx15(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-icon",
            title: expanded ? "Dock Studio rail" : "Expand Studio canvas",
            onClick: onToggleExpand,
            children: /* @__PURE__ */ jsx15(Icon, { name: expanded ? "Minimize2" : "Maximize2", size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx15("div", { className: "sb-viewer-body sb-scroll", children: renderViewer() })
  ] }) : /* @__PURE__ */ jsxs14(Fragment6, { children: [
    /* @__PURE__ */ jsxs14("div", { className: "sb-pane-head", children: [
      /* @__PURE__ */ jsx15("span", { className: "sb-pane-title", children: "Studio" }),
      /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxs14(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-ghost",
            "data-active": showOpts,
            onClick: () => setShowOpts((v) => !v),
            title: "Configure report template, audio style, item count, language, and AI illustrations",
            children: [
              /* @__PURE__ */ jsx15(Icon, { name: "SlidersHorizontal", size: 12 }),
              " Options"
            ]
          }
        ),
        /* @__PURE__ */ jsx15("span", { className: "sb-num", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: artifacts.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxs14("div", { style: { padding: "10px 12px 0", display: "flex", flexDirection: "column", gap: 8 }, children: [
      /* @__PURE__ */ jsx15(
        "input",
        {
          className: "sb-input",
          value: focusPrompt,
          onChange: (e) => setFocusPrompt(e.target.value),
          placeholder: "Optional focus topic for next artifact...",
          "aria-label": "Studio focus topic"
        }
      ),
      showOpts ? /* @__PURE__ */ jsxs14("div", { className: "sb-ledger-row", style: { gap: 7, padding: "8px 10px" }, children: [
        /* @__PURE__ */ jsxs14("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }, children: [
          /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Report template" }),
            /* @__PURE__ */ jsxs14("select", { className: "sb-select", value: template, onChange: (e) => setTemplate(e.target.value), children: [
              /* @__PURE__ */ jsx15("option", { value: "briefing", children: "Briefing" }),
              /* @__PURE__ */ jsx15("option", { value: "study_guide", children: "Study Guide" }),
              /* @__PURE__ */ jsx15("option", { value: "faq", children: "FAQ" }),
              /* @__PURE__ */ jsx15("option", { value: "timeline", children: "Timeline" }),
              /* @__PURE__ */ jsx15("option", { value: "blog", children: "Blog Post" }),
              /* @__PURE__ */ jsx15("option", { value: "exec_memo", children: "Exec Memo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Audio style" }),
            /* @__PURE__ */ jsxs14("select", { className: "sb-select", value: audioStyle, onChange: (e) => setAudioStyle(e.target.value), children: [
              /* @__PURE__ */ jsx15("option", { value: "deep_dive", children: "Deep Dive" }),
              /* @__PURE__ */ jsx15("option", { value: "debate", children: "Debate" }),
              /* @__PURE__ */ jsx15("option", { value: "brief", children: "Quick Brief" }),
              /* @__PURE__ */ jsx15("option", { value: "critique", children: "Critique" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Items / slides" }),
            /* @__PURE__ */ jsxs14("select", { className: "sb-select", value: count, onChange: (e) => setCount(Number(e.target.value)), children: [
              /* @__PURE__ */ jsx15("option", { value: 5, children: "5" }),
              /* @__PURE__ */ jsx15("option", { value: 8, children: "8" }),
              /* @__PURE__ */ jsx15("option", { value: 12, children: "12" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Language" }),
            /* @__PURE__ */ jsxs14("select", { className: "sb-select", value: language, onChange: (e) => setLanguage(e.target.value), children: [
              /* @__PURE__ */ jsx15("option", { value: "English", children: "English" }),
              /* @__PURE__ */ jsx15("option", { value: "Spanish", children: "Spanish" }),
              /* @__PURE__ */ jsx15("option", { value: "French", children: "French" }),
              /* @__PURE__ */ jsx15("option", { value: "German", children: "German" }),
              /* @__PURE__ */ jsx15("option", { value: "Japanese", children: "Japanese" }),
              /* @__PURE__ */ jsx15("option", { value: "Portuguese", children: "Portuguese" })
            ] })
          ] })
        ] }),
        capabilities?.image_generate ? /* @__PURE__ */ jsxs14("label", { style: { display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ui-text-secondary)", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsx15(
            "input",
            {
              type: "checkbox",
              className: "sb-checkbox",
              checked: includeImages,
              onChange: (e) => setIncludeImages(e.target.checked)
            }
          ),
          "Generate AI illustrations for Slides & Infographics"
        ] }) : null
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx15("div", { className: "sb-studio-grid", children: STUDIO_FORMATS.map((fmt) => /* @__PURE__ */ jsxs14(
      "button",
      {
        type: "button",
        className: "sb-studio-tile",
        disabled: !hasActiveSources || Boolean(runningKind),
        onClick: () => runGenerator(fmt.kind),
        children: [
          /* @__PURE__ */ jsx15(Icon, { name: fmt.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
          /* @__PURE__ */ jsx15("span", { children: runningKind === fmt.kind ? "Generating..." : fmt.label })
        ]
      },
      fmt.kind
    )) }),
    runningKind ? /* @__PURE__ */ jsx15("div", { style: { padding: "0 12px 8px", fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: stage }) : null,
    /* @__PURE__ */ jsx15("div", { className: "sb-pane-head", style: { borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: /* @__PURE__ */ jsx15("span", { className: "sb-pane-title", children: "Artifacts" }) }),
    /* @__PURE__ */ jsx15("div", { className: "sb-art-list sb-scroll", children: artifacts.length === 0 ? /* @__PURE__ */ jsxs14("div", { className: "sb-empty", children: [
      /* @__PURE__ */ jsx15(Icon, { name: "Layers", size: 22 }),
      /* @__PURE__ */ jsx15("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No artifacts yet" }),
      /* @__PURE__ */ jsx15("div", { style: { fontSize: 11.5 }, children: "Pick any format above to turn your active sources into an interactive artifact or Audio Overview." })
    ] }) : artifacts.map((art) => {
      const meta = KIND_META[art.kind] || { label: art.kind, icon: "FileText" };
      return /* @__PURE__ */ jsxs14(
        "div",
        {
          className: "sb-art-item",
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
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0 }, children: [
              /* @__PURE__ */ jsx15(Icon, { name: meta.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
              /* @__PURE__ */ jsxs14("div", { style: { minWidth: 0 }, children: [
                /* @__PURE__ */ jsx15("div", { className: "sb-src-title", title: art.title, children: art.title }),
                /* @__PURE__ */ jsxs14("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", display: "flex", alignItems: "center", gap: 5 }, children: [
                  /* @__PURE__ */ jsx15("span", { children: meta.label }),
                  art.stale ? /* @__PURE__ */ jsx15("span", { className: "sb-verdict", "data-v": "partial", children: "Stale" }) : null
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx15(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                title: "Delete artifact",
                onClick: (e) => deleteArtifact(e, art.id),
                children: /* @__PURE__ */ jsx15(Icon, { name: "Trash2", size: 13 })
              }
            )
          ]
        },
        art.id
      );
    }) })
  ] }) });
}

// desktop-src/components/BrandMark.jsx
import { jsx as jsx16, jsxs as jsxs15 } from "react/jsx-runtime";
function BrandMark({ size = 16, accent = "var(--ui-accent, #3b82f6)", className = "", style }) {
  return /* @__PURE__ */ jsxs15(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 120 120",
      width: size,
      height: size,
      className,
      style: { display: "block", flexShrink: 0, ...style },
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx16("polygon", { points: "59,10 74,10 74,34 66.5,26.5 59,34", fill: accent }),
        /* @__PURE__ */ jsx16("polygon", { points: "79.5,10 100,10 100,37.5 79.5,48.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx16("polygon", { points: "47,10 53.5,10 53.5,30.5 44.5,30.5 100,70.5 100,95 24,22", fill: "currentColor" }),
        /* @__PURE__ */ jsx16("polygon", { points: "20,24.5 95.5,97.5 72.5,110 48,110 20,90 20,82.5 36.5,73.5 58,89 74.5,89 20,50", fill: "currentColor" })
      ]
    }
  );
}

// desktop-src/SourceBookWorkspace.jsx
import { Fragment as Fragment7, jsx as jsx17, jsxs as jsxs16 } from "react/jsx-runtime";
function SourceBookWorkspace({ ctx, externalState }) {
  const profile = typeof sdk.useValue === "function" && sdk.host?.state?.profile ? sdk.useValue(sdk.host.state.profile) : "default";
  const connectionId = typeof sdk.useValue === "function" && sdk.host?.state?.connectionId ? sdk.useValue(sdk.host.state.connectionId) : "local";
  const epoch = typeof sdk.useGatewayActivationEpoch === "function" ? sdk.useGatewayActivationEpoch() : 0;
  const [notebooks, setNotebooks] = useState11([]);
  const [nbId, setNbId] = useState11("");
  const [notebook, setNotebook] = useState11(null);
  const [sources, setSources] = useState11([]);
  const [notes, setNotes] = useState11([]);
  const [messages, setMessages] = useState11([]);
  const [claims, setClaims] = useState11([]);
  const [contradictions, setContradictions] = useState11(null);
  const [coverage, setCoverage] = useState11(null);
  const [artifacts, setArtifacts] = useState11([]);
  const [modelsInfo, setModelsInfo] = useState11(null);
  const [capabilities, setCapabilities] = useState11(null);
  const [centerTab, setCenterTab] = useState11("chat");
  const [selectedArtifactId, setSelectedArtifactId] = useState11(null);
  const [inspectorTarget, setInspectorTarget] = useState11(null);
  const [leftCollapsed, setLeftCollapsed] = useState11(false);
  const [studioExpanded, setStudioExpanded] = useState11(false);
  const [nbMenuOpen, setNbMenuOpen] = useState11(false);
  const [modelMenuOpen, setModelMenuOpen] = useState11(false);
  const [customProvider, setCustomProvider] = useState11("");
  const [customModel, setCustomModel] = useState11("");
  const [createOpen, setCreateOpen] = useState11(false);
  const [newTitle, setNewTitle] = useState11("");
  const [searchOpen, setSearchOpen] = useState11(false);
  const [searchQuery, setSearchQuery] = useState11("");
  const [searchHits, setSearchHits] = useState11([]);
  const [loading, setLoading] = useState11(true);
  const [error, setError] = useState11("");
  const reqSeqRef = useRef8(0);
  const storageKey = `activeNotebook::${connectionId || "local"}::${profile || "default"}`;
  const loadNotebookData = useCallback(async (targetNb) => {
    if (!targetNb) {
      setNotebook(null);
      setSources([]);
      setNotes([]);
      setMessages([]);
      setClaims([]);
      setContradictions(null);
      setCoverage(null);
      setArtifacts([]);
      return;
    }
    const seq = ++reqSeqRef.current;
    const startScope = currentScopeKey();
    const startEpoch = currentEpoch();
    try {
      const [nbMeta, srcList, noteList, msgList, claimList, contraData, covData, artList] = await Promise.all([
        api(`/notebooks/${encodeURIComponent(targetNb)}`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/sources`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/notes`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/messages`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/claims`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/contradictions`).catch(() => ({ conflicts: [], consensus: [] })),
        api(`/notebooks/${encodeURIComponent(targetNb)}/coverage`),
        api(`/notebooks/${encodeURIComponent(targetNb)}/artifacts`)
      ]);
      if (seq !== reqSeqRef.current || currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return;
      setNotebook(nbMeta);
      setSources(srcList || []);
      setNotes(noteList || []);
      setMessages(msgList || []);
      setClaims(claimList || []);
      setContradictions(contraData || { conflicts: [], consensus: [] });
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
      const [list, mInfo, caps] = await Promise.all([
        api("/notebooks"),
        api("/models").catch(() => null),
        api("/capabilities").catch(() => null)
      ]);
      if (currentScopeKey() !== startScope || currentEpoch() !== startEpoch) return;
      if (mInfo) setModelsInfo(mInfo);
      if (caps) setCapabilities(caps);
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
      setError(err.message || "Could not reach SourceBook backend API.");
    } finally {
      setLoading(false);
    }
  }, [ctx, storageKey, loadNotebookData]);
  useEffect8(() => {
    setSelectedArtifactId(null);
    setInspectorTarget(null);
    loadNotebooks();
  }, [profile, connectionId, epoch, loadNotebooks]);
  useEffect8(() => {
    if (!ctx?.onEvent) return void 0;
    return ctx.onEvent("plugin.sourcebook.notebook.changed", (ev) => {
      const target = ev?.payload?.nb || ev?.nb;
      if (!target || target === nbId) {
        loadNotebookData(nbId);
      }
    });
  }, [ctx, nbId, loadNotebookData]);
  useEffect8(() => {
    if (!ctx?.addEventListener) return void 0;
    return ctx.addEventListener(window, "keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setCreateOpen(false);
        setNbMenuOpen(false);
        setModelMenuOpen(false);
        setInspectorTarget(null);
      }
    });
  }, [ctx]);
  useEffect8(() => {
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
    setModelMenuOpen(false);
    setNbId(id);
    setSelectedArtifactId(null);
    setInspectorTarget(null);
    ctx?.storage?.set?.(storageKey, id);
    await loadNotebookData(id);
  }
  async function patchNotebook(patch) {
    if (!notebook?.id) return;
    try {
      const updated = await api(`/notebooks/${encodeURIComponent(notebook.id)}`, {
        method: "PATCH",
        body: patch
      });
      setNotebook(updated);
      setError("");
    } catch (err) {
      setError(err.message || "Could not update notebook settings.");
    }
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
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Saved passage to Notes." });
      await loadNotebookData(nbId);
    } catch (err) {
      setError(err.message || "Could not save passage.");
    }
  }
  const covPct = coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0;
  const hasActiveSources = sources.some((s) => s.enabled);
  const activeModelLabel = notebook?.model ? notebook.model : modelsInfo?.active?.model ? `Auto: ${modelsInfo.active.model}` : "Auto (Hermes)";
  return /* @__PURE__ */ jsxs16("div", { className: "sb-root", style: { position: "relative" }, children: [
    /* @__PURE__ */ jsx17(Styles, {}),
    /* @__PURE__ */ jsxs16("header", { className: "sb-topbar", children: [
      /* @__PURE__ */ jsxs16("div", { className: "sb-topbar-left", children: [
        /* @__PURE__ */ jsxs16("div", { className: "sb-brand", children: [
          /* @__PURE__ */ jsx17("span", { className: "sb-brand-mark", children: /* @__PURE__ */ jsx17(BrandMark, { size: 15 }) }),
          /* @__PURE__ */ jsx17("span", { children: "SourceBook" })
        ] }),
        /* @__PURE__ */ jsx17(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-ghost sb-btn-icon",
            title: leftCollapsed ? "Show Sources rail" : "Hide Sources rail",
            onClick: () => setLeftCollapsed((v) => !v),
            children: /* @__PURE__ */ jsx17(Icon, { name: "PanelLeft", size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs16("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsxs16(
            "button",
            {
              type: "button",
              className: "sb-nb-select",
              onClick: () => {
                setModelMenuOpen(false);
                setNbMenuOpen((v) => !v);
              },
              "aria-expanded": nbMenuOpen,
              children: [
                /* @__PURE__ */ jsx17("span", { className: "sb-nb-select-label", children: notebook?.title || (loading ? "Loading..." : "Select notebook") }),
                /* @__PURE__ */ jsx17(Icon, { name: "ChevronDown", size: 13 })
              ]
            }
          ),
          nbMenuOpen ? /* @__PURE__ */ jsxs16("div", { className: "sb-model-menu", style: { left: 0, right: "auto", width: 280 }, children: [
            notebooks.map((nb) => /* @__PURE__ */ jsxs16(
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
                  background: nb.id === nbId ? "var(--sb-accent-soft)" : "transparent"
                },
                onClick: () => selectNotebook(nb.id),
                children: [
                  /* @__PURE__ */ jsxs16("div", { style: { minWidth: 0 }, children: [
                    /* @__PURE__ */ jsx17("div", { className: "sb-src-title", children: nb.title }),
                    /* @__PURE__ */ jsxs16("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
                      /* @__PURE__ */ jsx17("span", { className: "sb-num", children: nb.source_count || 0 }),
                      " sources | ",
                      /* @__PURE__ */ jsx17("span", { className: "sb-num", children: nb.artifact_count || 0 }),
                      " artifacts"
                    ] })
                  ] }),
                  notebooks.length > 1 ? /* @__PURE__ */ jsx17(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                      title: "Delete notebook",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteNotebook(nb.id);
                      },
                      children: /* @__PURE__ */ jsx17(Icon, { name: "Trash2", size: 12 })
                    }
                  ) : null
                ]
              },
              nb.id
            )),
            /* @__PURE__ */ jsx17("div", { style: { borderTop: "1px solid var(--ui-stroke-tertiary)", marginTop: 4, paddingTop: 4 }, children: /* @__PURE__ */ jsxs16(
              "button",
              {
                type: "button",
                className: "sb-btn",
                style: { width: "100%", justifyContent: "flex-start" },
                onClick: () => {
                  setNbMenuOpen(false);
                  setCreateOpen(true);
                },
                children: [
                  /* @__PURE__ */ jsx17(Icon, { name: "Plus", size: 13 }),
                  " New notebook"
                ]
              }
            ) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs16("button", { type: "button", className: "sb-btn", onClick: () => setCreateOpen(true), children: [
          /* @__PURE__ */ jsx17(Icon, { name: "Plus", size: 13 }),
          " New"
        ] })
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "sb-topbar-right", children: [
        notebook ? /* @__PURE__ */ jsxs16(Fragment7, { children: [
          /* @__PURE__ */ jsxs16("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxs16(
              "button",
              {
                type: "button",
                className: "sb-btn",
                "data-active": Boolean(notebook.model),
                onClick: () => {
                  setNbMenuOpen(false);
                  setCustomProvider(notebook.provider || "");
                  setCustomModel(notebook.model || "");
                  setModelMenuOpen((v) => !v);
                },
                title: "Choose which Hermes model runs this notebook",
                children: [
                  /* @__PURE__ */ jsx17(Icon, { name: "Cpu", size: 12 }),
                  /* @__PURE__ */ jsx17("span", { style: { maxWidth: 145, overflow: "hidden", textOverflow: "ellipsis" }, children: activeModelLabel }),
                  /* @__PURE__ */ jsx17(Icon, { name: "ChevronDown", size: 11 })
                ]
              }
            ),
            modelMenuOpen ? /* @__PURE__ */ jsxs16("div", { className: "sb-model-menu", children: [
              /* @__PURE__ */ jsx17("div", { style: { padding: "4px 8px", fontSize: 10.5, fontWeight: 650, color: "var(--ui-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Notebook Model" }),
              /* @__PURE__ */ jsxs16(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost",
                  style: { width: "100%", justifyContent: "space-between" },
                  "data-active": !notebook.model,
                  onClick: async () => {
                    await patchNotebook({ provider: "", model: "" });
                    setModelMenuOpen(false);
                  },
                  children: [
                    /* @__PURE__ */ jsx17("span", { children: "Auto (Active Hermes)" }),
                    /* @__PURE__ */ jsx17("span", { className: "sb-mono", style: { fontSize: 10.5, opacity: 0.7 }, children: modelsInfo?.active?.model || "default" })
                  ]
                }
              ),
              (modelsInfo?.options || []).filter((o) => o.source !== "active").slice(0, 10).map((opt) => {
                const active = notebook.model === opt.model && (notebook.provider || "") === (opt.provider || "");
                return /* @__PURE__ */ jsxs16(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    style: { width: "100%", justifyContent: "space-between" },
                    "data-active": active,
                    onClick: async () => {
                      await patchNotebook({ provider: opt.provider || "", model: opt.model });
                      setModelMenuOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsx17("span", { className: "sb-src-title", children: opt.model }),
                      opt.provider ? /* @__PURE__ */ jsx17("span", { className: "sb-kind-tag", children: opt.provider }) : null
                    ]
                  },
                  `${opt.provider}:${opt.model}`
                );
              }),
              /* @__PURE__ */ jsxs16(
                "form",
                {
                  style: { borderTop: "1px solid var(--ui-stroke-tertiary)", marginTop: 4, padding: "8px 6px 4px", display: "flex", flexDirection: "column", gap: 6 },
                  onSubmit: async (e) => {
                    e.preventDefault();
                    await patchNotebook({ provider: customProvider.trim(), model: customModel.trim() });
                    setModelMenuOpen(false);
                  },
                  children: [
                    /* @__PURE__ */ jsx17("span", { style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: "Custom provider / model ID" }),
                    /* @__PURE__ */ jsx17(
                      "input",
                      {
                        className: "sb-input",
                        value: customProvider,
                        onChange: (e) => setCustomProvider(e.target.value),
                        placeholder: "Provider (optional, e.g. ollama, openrouter)"
                      }
                    ),
                    /* @__PURE__ */ jsx17(
                      "input",
                      {
                        className: "sb-input",
                        value: customModel,
                        onChange: (e) => setCustomModel(e.target.value),
                        placeholder: "Model ID (e.g. gpt-5, qwen3:32b)"
                      }
                    ),
                    /* @__PURE__ */ jsx17("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: !customModel.trim(), children: "Apply model" }),
                    modelsInfo && !modelsInfo.override_ready ? /* @__PURE__ */ jsxs16("div", { style: { fontSize: 10.5, color: "var(--ui-text-tertiary)", lineHeight: 1.4 }, children: [
                      "Note: To use explicit overrides, enable ",
                      /* @__PURE__ */ jsx17("span", { className: "sb-mono", children: "allow_model_override" }),
                      " in Hermes config (see Settings)."
                    ] }) : null
                  ]
                }
              )
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxs16(
            "button",
            {
              type: "button",
              className: "sb-cov-meter",
              title: "Open Coverage Map",
              onClick: () => setCenterTab("coverage"),
              children: [
                /* @__PURE__ */ jsx17("span", { children: "Coverage" }),
                /* @__PURE__ */ jsx17("span", { className: "sb-cov-track", children: /* @__PURE__ */ jsx17("span", { className: "sb-cov-fill", style: { width: `${covPct}%` } }) }),
                /* @__PURE__ */ jsxs16("span", { className: "sb-mono", style: { fontWeight: 600 }, children: [
                  covPct,
                  "%"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs16(
            "button",
            {
              type: "button",
              className: "sb-btn",
              "data-active": Boolean(notebook.strict),
              onClick: () => patchNotebook({ strict: !notebook.strict }),
              title: "Strict grounding refuses any claim unsupported by active sources",
              children: [
                /* @__PURE__ */ jsx17(Icon, { name: "Lock", size: 12 }),
                " ",
                notebook.strict ? "Strict" : "Grounded"
              ]
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxs16(
          "button",
          {
            type: "button",
            className: "sb-btn",
            onClick: () => {
              setSearchQuery("");
              setSearchHits([]);
              setSearchOpen(true);
            },
            title: "Search across all notebooks (Ctrl+K)",
            children: [
              /* @__PURE__ */ jsx17(Icon, { name: "Search", size: 12 }),
              " Search"
            ]
          }
        )
      ] })
    ] }),
    error ? /* @__PURE__ */ jsxs16("div", { className: "sb-error-bar", role: "alert", children: [
      /* @__PURE__ */ jsx17("span", { children: error }),
      /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setError(""), children: /* @__PURE__ */ jsx17(Icon, { name: "X", size: 13 }) })
    ] }) : null,
    !loading && !nbId ? /* @__PURE__ */ jsxs16("div", { className: "sb-empty", style: { flex: 1, justifyContent: "center" }, children: [
      /* @__PURE__ */ jsx17(BrandMark, { size: 38, style: { color: "var(--ui-text-primary)" } }),
      /* @__PURE__ */ jsx17("div", { style: { fontSize: 16, fontWeight: 650, color: "var(--ui-text-primary)" }, children: "Create your first research notebook" }),
      /* @__PURE__ */ jsx17("div", { style: { maxWidth: 440, fontSize: 13 }, children: "Collect PDFs, DOCX files, Markdown, CSV tables, YouTube videos, local folders, and web URLs in one workspace. Every answer cites exact passages and runs on any model configured in Hermes." }),
      /* @__PURE__ */ jsxs16("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => setCreateOpen(true), children: [
        /* @__PURE__ */ jsx17(Icon, { name: "Plus", size: 13 }),
        " New notebook"
      ] })
    ] }) : /* @__PURE__ */ jsxs16(
      "div",
      {
        className: "sb-workbench",
        "data-left-collapsed": leftCollapsed,
        "data-studio-expanded": studioExpanded,
        children: [
          /* @__PURE__ */ jsx17(
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
          /* @__PURE__ */ jsx17(
            ChatPanel,
            {
              ctx,
              notebook,
              sources,
              messages,
              claims,
              contradictions,
              coverage,
              centerTab,
              onChangeCenterTab: setCenterTab,
              onPatchNotebook: patchNotebook,
              onOpenChunk: (cid) => setInspectorTarget({ sourceId: String(cid).split(":")[0], chunkId: cid }),
              onOpenSource: setInspectorTarget,
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          ),
          /* @__PURE__ */ jsx17(
            StudioPanel,
            {
              ctx,
              nbId,
              hasActiveSources,
              capabilities,
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
    /* @__PURE__ */ jsx17(
      SourceInspector,
      {
        nbId,
        target: inspectorTarget,
        onClose: () => setInspectorTarget(null),
        onPromoteQuote: handlePromoteQuote
      }
    ),
    createOpen ? /* @__PURE__ */ jsx17("div", { className: "sb-modal-backdrop", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsxs16("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: handleCreateNotebook, children: [
      /* @__PURE__ */ jsxs16("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx17("span", { children: "New research notebook" }),
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsx17(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsx17("div", { className: "sb-modal-body", children: /* @__PURE__ */ jsxs16("label", { className: "sb-field", children: [
        /* @__PURE__ */ jsx17("span", { className: "sb-label", children: "Notebook title" }),
        /* @__PURE__ */ jsx17(
          "input",
          {
            className: "sb-input",
            value: newTitle,
            onChange: (e) => setNewTitle(e.target.value),
            placeholder: "Distributed Systems Review, Q4 Market Research...",
            required: true,
            autoFocus: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs16("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn", onClick: () => setCreateOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx17("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: !newTitle.trim(), children: "Create" })
      ] })
    ] }) }) : null,
    searchOpen ? /* @__PURE__ */ jsx17("div", { className: "sb-modal-backdrop", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsxs16("div", { className: "sb-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs16("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx17("span", { children: "Search across all notebooks" }),
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsx17(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs16("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsx17(
          "input",
          {
            className: "sb-input",
            value: searchQuery,
            onChange: (e) => runCrossSearch(e.target.value),
            placeholder: "Hybrid semantic + keyword search across every notebook...",
            autoFocus: true
          }
        ),
        searchHits.length === 0 && searchQuery.trim() ? /* @__PURE__ */ jsx17("div", { className: "sb-empty", children: "No matching passages found." }) : null,
        searchHits.map((hit) => /* @__PURE__ */ jsxs16(
          "div",
          {
            className: "sb-ledger-row",
            style: { cursor: "pointer" },
            onClick: async () => {
              setSearchOpen(false);
              if (hit.notebook_id !== nbId) await selectNotebook(hit.notebook_id);
              setInspectorTarget({ sourceId: hit.source_id, chunkId: hit.chunk_id, highlight: searchQuery.trim() });
            },
            children: [
              /* @__PURE__ */ jsxs16("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5 }, children: [
                /* @__PURE__ */ jsxs16("strong", { children: [
                  hit.notebook_title,
                  " / ",
                  hit.source_title
                ] }),
                /* @__PURE__ */ jsx17("span", { className: "sb-mono", style: { color: "var(--ui-accent)" }, children: hit.chunk_id })
              ] }),
              /* @__PURE__ */ jsx17("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: hit.snippet })
            ]
          },
          `${hit.notebook_id}-${hit.chunk_id}`
        ))
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/SettingsPage.jsx
import { useEffect as useEffect9, useState as useState12 } from "react";
import { jsx as jsx18, jsxs as jsxs17 } from "react/jsx-runtime";
function SettingsPage() {
  const [caps, setCaps] = useState12(null);
  const [modelsInfo, setModelsInfo] = useState12(null);
  const [err, setErr] = useState12("");
  useEffect9(() => {
    let alive = true;
    Promise.all([api("/capabilities"), api("/models").catch(() => null)]).then(([c, m]) => {
      if (!alive) return;
      setCaps(c);
      setModelsInfo(m);
    }).catch((e) => {
      if (alive) setErr(e.message || "Could not reach SourceBook backend.");
    });
    return () => {
      alive = false;
    };
  }, []);
  const activeModelStr = caps?.active_model?.model ? `${caps.active_model.model}${caps.active_model.provider ? ` (${caps.active_model.provider})` : ""}` : caps?.llm ? "Connected" : "Local extractive fallback";
  const pdfStatus = caps?.pymupdf ? "PyMuPDF active (text + scanned OCR)" : caps?.pdfplumber ? "pdfplumber active" : caps?.pypdf ? "pypdf active" : "Optional (uv pip install pymupdf or pypdf)";
  const rows = [
    ["Active Hermes model", activeModelStr],
    ["Per-notebook model override", caps?.model_override_allowed ? "Enabled for any Hermes model" : "Using active Hermes / auxiliary task slots"],
    ["Retrieval engine", "Hybrid semantic vector + SQLite FTS5 BM25 (RRF)"],
    ["Audio Overview TTS", caps?.edge_tts ? "Edge Neural TTS active (2-host MP3)" : "Transcript-only (install edge-tts for MP3)"],
    ["YouTube transcripts", caps?.youtube_transcript ? "youtube-transcript-api active (timestamped)" : "Optional (install youtube-transcript-api)"],
    ["Web search & extraction", caps?.web_extract ? "Hermes web_extract active" : "Built-in readability + discovery fallback"],
    ["PDF extractor", pdfStatus],
    ["DOCX extractor", caps?.python_docx ? "python-docx active" : "Built-in stdlib XML extractor"],
    ["Image generation", caps?.image_generate ? "Available for Slides & Infographics" : "Not configured"]
  ];
  const setupCmd = (modelsInfo?.setup_commands || [
    "hermes config set plugins.entries.sourcebook.llm.allow_model_override true",
    "hermes config set plugins.entries.sourcebook.llm.allow_provider_override true"
  ]).join("\n");
  return /* @__PURE__ */ jsxs17("div", { className: "sb-root", style: { height: "auto", overflow: "visible", background: "transparent" }, children: [
    /* @__PURE__ */ jsx18(Styles, {}),
    /* @__PURE__ */ jsxs17("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }, children: [
      /* @__PURE__ */ jsxs17("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxs17("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsx18("span", { className: "sb-brand-mark", style: { width: 32, height: 32, borderRadius: 8 }, children: /* @__PURE__ */ jsx18(BrandMark, { size: 20 }) }),
          /* @__PURE__ */ jsxs17("div", { children: [
            /* @__PURE__ */ jsx18("div", { style: { fontWeight: 650, fontSize: 14 }, children: "SourceBook Research Notebooks" }),
            /* @__PURE__ */ jsx18("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", marginTop: 2 }, children: "Universal Hermes model routing, hybrid search, Claim Ledger contradictions, and 8 Studio formats including Audio Overviews." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs17("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => sdk.host?.navigate?.("/sourcebook"), children: [
          /* @__PURE__ */ jsx18(BrandMark, { size: 13, accent: "rgba(255,255,255,0.72)" }),
          " Open SourceBook"
        ] })
      ] }),
      err ? /* @__PURE__ */ jsx18("div", { className: "sb-error-bar", style: { margin: 0 }, children: err }) : null,
      /* @__PURE__ */ jsx18("div", { className: "sb-table-wrap", children: /* @__PURE__ */ jsxs17("table", { className: "sb-table", children: [
        /* @__PURE__ */ jsx18("thead", { children: /* @__PURE__ */ jsxs17("tr", { children: [
          /* @__PURE__ */ jsx18("th", { children: "Capability" }),
          /* @__PURE__ */ jsx18("th", { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx18("tbody", { children: rows.map(([label, status]) => /* @__PURE__ */ jsxs17("tr", { children: [
          /* @__PURE__ */ jsx18("td", { style: { fontWeight: 550 }, children: label }),
          /* @__PURE__ */ jsx18("td", { style: { color: "var(--ui-text-secondary)" }, children: caps ? status : "Checking..." })
        ] }, label)) })
      ] }) }),
      /* @__PURE__ */ jsxs17("div", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsxs17("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsx18("strong", { style: { fontSize: 12 }, children: "Use any Hermes model per notebook" }),
          /* @__PURE__ */ jsxs17(
            "button",
            {
              type: "button",
              className: "sb-btn",
              onClick: async () => {
                await copyText(setupCmd);
                sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied Hermes config commands." });
              },
              children: [
                /* @__PURE__ */ jsx18(Icon, { name: "Copy", size: 12 }),
                " Copy commands"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs17("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
          "SourceBook automatically works with your active Hermes model or auxiliary task slots (",
          /* @__PURE__ */ jsx18("span", { className: "sb-mono", children: "sourcebook_chat" }),
          ", ",
          /* @__PURE__ */ jsx18("span", { className: "sb-mono", children: "sourcebook_studio" }),
          ", ",
          /* @__PURE__ */ jsx18("span", { className: "sb-mono", children: "sourcebook_audio" }),
          ", ",
          /* @__PURE__ */ jsx18("span", { className: "sb-mono", children: "sourcebook_ingest" }),
          "). To pick any provider or model per notebook directly inside SourceBook, run:"
        ] }),
        /* @__PURE__ */ jsx18("pre", { className: "sb-mono sb-code-pre", style: { borderRadius: 7, border: "1px solid var(--ui-stroke-tertiary)" }, children: setupCmd })
      ] }),
      /* @__PURE__ */ jsxs17("div", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsx18("strong", { style: { fontSize: 12 }, children: "Slash commands" }),
        /* @__PURE__ */ jsxs17("div", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-text-secondary)", lineHeight: 1.7 }, children: [
          "/sourcebook list",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook use <nb_id>",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook model <nb_id> <provider/model|auto>",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook sync <nb_id> <local_path>",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook add <nb_id> <url or text>",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook ask <nb_id> <question>",
          /* @__PURE__ */ jsx18("br", {}),
          "/sourcebook make <nb_id> <kind> [focus]"
        ] })
      ] })
    ] })
  ] });
}

// desktop-src/plugin.jsx
import { jsx as jsx19, jsxs as jsxs18 } from "react/jsx-runtime";
var ROUTE = "/sourcebook";
function StatusChip({ externalState }) {
  const state = typeof sdk.useValue === "function" && externalState ? sdk.useValue(externalState) : null;
  if (!state?.title) return null;
  return /* @__PURE__ */ jsxs18(
    "button",
    {
      type: "button",
      className: "sb-status-chip",
      onClick: () => sdk.host?.navigate?.(ROUTE),
      title: `Open SourceBook: ${state.title}`,
      children: [
        /* @__PURE__ */ jsx19(BrandMark, { size: 13 }),
        /* @__PURE__ */ jsx19("span", { children: state.title }),
        state.dueCards > 0 ? /* @__PURE__ */ jsxs18("span", { className: "sb-mono", children: [
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
  return /* @__PURE__ */ jsxs18(
    "button",
    {
      type: "button",
      className: "sb-cite-card",
      onClick: () => {
        if (externalState) {
          externalState.set({ ...externalState.get(), pendingJump: { nb, chunk } });
        }
        sdk.host?.navigate?.(ROUTE);
      },
      children: [
        /* @__PURE__ */ jsx19(BrandMark, { size: 14 }),
        /* @__PURE__ */ jsx19("span", { children: "SourceBook source" }),
        chunk ? /* @__PURE__ */ jsx19("span", { className: "sb-mono", children: chunk }) : null
      ]
    }
  );
}
var plugin_default = {
  id: "sourcebook",
  name: "SourceBook",
  description: "Source-grounded research notebooks, Claim Ledger, Coverage Map, and 7-format interactive Studio.",
  register(ctx) {
    bindContext(ctx);
    const externalState = typeof sdk.atom === "function" ? sdk.atom({ title: "", dueCards: 0, nbId: "", pendingJump: null }) : null;
    ctx.register({
      id: "page",
      area: sdk.ROUTES_AREA,
      data: { path: ROUTE },
      render: () => /* @__PURE__ */ jsx19(SourceBookWorkspace, { ctx, externalState })
    });
    ctx.register({
      id: "nav",
      area: sdk.SIDEBAR_NAV_AREA,
      data: { path: ROUTE, label: "SourceBook", codicon: "book" }
    });
    if (sdk.PALETTE_AREA) {
      ctx.register({
        id: "open",
        area: sdk.PALETTE_AREA,
        data: {
          id: "sourcebook.open",
          label: "SourceBook: Open research notebooks",
          keywords: ["sourcebook", "notebook", "research", "studio", "flashcards", "mindmap", "citations"],
          run: () => sdk.host?.navigate?.(ROUTE)
        }
      });
    }
    if (sdk.STATUSBAR_AREAS?.right && externalState) {
      ctx.register({
        id: "status",
        area: sdk.STATUSBAR_AREAS.right,
        render: () => /* @__PURE__ */ jsx19(StatusChip, { externalState })
      });
    }
    if (sdk.TRANSCRIPT_DIRECTIVE_AREA) {
      ctx.register({
        id: "cite-directive",
        area: sdk.TRANSCRIPT_DIRECTIVE_AREA,
        data: { name: "cite" },
        render: (props) => /* @__PURE__ */ jsx19(CiteDirective, { props, externalState })
      });
    }
    if (typeof ctx.registerSettingsPage === "function") {
      ctx.registerSettingsPage({
        id: "sourcebook",
        title: "SourceBook",
        description: "Source-grounded research notebooks and Studio.",
        render: () => /* @__PURE__ */ jsx19(SettingsPage, {})
      });
    }
  }
};
export {
  plugin_default as default
};
