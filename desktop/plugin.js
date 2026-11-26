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
  PanelRight: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M15 3v18" })
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
  ] }),
  BarChart2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "18", x2: "18", y1: "20", y2: "10" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "20", y2: "4" }),
    /* @__PURE__ */ jsx("line", { x1: "6", x2: "6", y1: "20", y2: "14" })
  ] }),
  Columns3: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 3v18" }),
    /* @__PURE__ */ jsx("path", { d: "M15 3v18" })
  ] }),
  Filter: /* @__PURE__ */ jsx("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }),
  ImageDown: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "9", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
  ] }),
  List: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "6", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "18", y2: "18" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "18", y2: "18" })
  ] }),
  ArrowUp: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m5 12 7-7 7 7" }),
    /* @__PURE__ */ jsx("path", { d: "M12 19V5" })
  ] }),
  ArrowDown: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 5v14" }),
    /* @__PURE__ */ jsx("path", { d: "m19 12-7 7-7-7" })
  ] }),
  ArrowUpDown: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m21 16-4 4-4-4" }),
    /* @__PURE__ */ jsx("path", { d: "M17 20V4" }),
    /* @__PURE__ */ jsx("path", { d: "m3 8 4-4 4 4" }),
    /* @__PURE__ */ jsx("path", { d: "M7 4v16" })
  ] }),
  ChevronRight: /* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }),
  ChevronDown: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }),
  ChevronUp: /* @__PURE__ */ jsx("path", { d: "m18 15-6-6-6 6" }),
  Check: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }),
  MoreVertical: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "1.4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1.4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "19", r: "1.4" })
  ] }),
  Edit3: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 20h9" }),
    /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" })
  ] }),
  Info: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16v-4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 8h.01" })
  ] }),
  Code: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("polyline", { points: "16 18 22 12 16 6" }),
    /* @__PURE__ */ jsx("polyline", { points: "8 6 2 12 8 18" })
  ] }),
  Sparkles: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" }) }),
  Brain: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 5v13" })
  ] }),
  Wand2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" }),
    /* @__PURE__ */ jsx("path", { d: "m14 7 3 3" }),
    /* @__PURE__ */ jsx("path", { d: "M5 6v4" }),
    /* @__PURE__ */ jsx("path", { d: "M19 14v4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 2v2" }),
    /* @__PURE__ */ jsx("path", { d: "M7 8H3" }),
    /* @__PURE__ */ jsx("path", { d: "M21 16h-4" })
  ] }),
  ZoomIn: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }),
    /* @__PURE__ */ jsx("line", { x1: "11", x2: "11", y1: "8", y2: "14" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "14", y1: "11", y2: "11" })
  ] }),
  Mic: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" }),
    /* @__PURE__ */ jsx("path", { d: "M19 10v2a7 7 0 0 1-14 0v-2" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "19", y2: "22" })
  ] }),
  Volume2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
    /* @__PURE__ */ jsx("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }),
    /* @__PURE__ */ jsx("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14" })
  ] }),
  Compass: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("polygon", { points: "16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" })
  ] }),
  FileJson: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" }),
    /* @__PURE__ */ jsx("path", { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" })
  ] }),
  Plus: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsx("path", { d: "M12 5v14" })
  ] }),
  Cpu: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "16", height: "16", x: "4", y: "4", rx: "2" }),
    /* @__PURE__ */ jsx("rect", { width: "6", height: "6", x: "9", y: "9", rx: "1" }),
    /* @__PURE__ */ jsx("path", { d: "M15 2v2" }),
    /* @__PURE__ */ jsx("path", { d: "M15 20v2" }),
    /* @__PURE__ */ jsx("path", { d: "M2 15h2" }),
    /* @__PURE__ */ jsx("path", { d: "M2 9h2" }),
    /* @__PURE__ */ jsx("path", { d: "M20 15h2" }),
    /* @__PURE__ */ jsx("path", { d: "M20 9h2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 2v2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 20v2" })
  ] }),
  Lock: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
  ] }),
  Search: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
    /* @__PURE__ */ jsx("path", { d: "m21 21-4.3-4.3" })
  ] }),
  ChevronLeft: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }),
  ArrowLeft: /* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }),
  RefreshCw: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
    /* @__PURE__ */ jsx("path", { d: "M21 3v5h-5" }),
    /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
    /* @__PURE__ */ jsx("path", { d: "M8 16H3v5" })
  ] }),
  Trash2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
    /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
    /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
    /* @__PURE__ */ jsx("line", { x1: "10", x2: "10", y1: "11", y2: "17" }),
    /* @__PURE__ */ jsx("line", { x1: "14", x2: "14", y1: "11", y2: "17" })
  ] }),
  Copy: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
  ] }),
  Download: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
  ] }),
  Play: /* @__PURE__ */ jsx("polygon", { points: "6 3 20 12 6 21 6 3" }),
  Upload: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    /* @__PURE__ */ jsx("polyline", { points: "17 8 12 3 7 8" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "3", y2: "15" })
  ] }),
  Link: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
    /* @__PURE__ */ jsx("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
  ] }),
  FolderOpen: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" }) }),
  Globe: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }),
    /* @__PURE__ */ jsx("path", { d: "M2 12h20" })
  ] }),
  FileText: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 9H8" }),
    /* @__PURE__ */ jsx("path", { d: "M16 13H8" }),
    /* @__PURE__ */ jsx("path", { d: "M16 17H8" })
  ] }),
  SlidersHorizontal: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "14", y1: "4", y2: "4" }),
    /* @__PURE__ */ jsx("line", { x1: "10", x2: "3", y1: "4", y2: "4" }),
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "12", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "3", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "16", y1: "20", y2: "20" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "3", y1: "20", y2: "20" }),
    /* @__PURE__ */ jsx("line", { x1: "14", x2: "14", y1: "2", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "8", y1: "10", y2: "14" }),
    /* @__PURE__ */ jsx("line", { x1: "16", x2: "16", y1: "18", y2: "22" })
  ] }),
  BarChart3: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 3v18h18" }),
    /* @__PURE__ */ jsx("path", { d: "M18 17V9" }),
    /* @__PURE__ */ jsx("path", { d: "M13 17V5" }),
    /* @__PURE__ */ jsx("path", { d: "M8 17v-3" })
  ] }),
  ArrowUpRight: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M7 7h10v10" }),
    /* @__PURE__ */ jsx("path", { d: "M7 17 17 7" })
  ] }),
  Headphones: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" }) }),
  Presentation: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M2 3h20" }),
    /* @__PURE__ */ jsx("path", { d: "M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" }),
    /* @__PURE__ */ jsx("path", { d: "m7 21 5-5 5 5" })
  ] }),
  GitBranch: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "6", x2: "6", y1: "3", y2: "15" }),
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "6", r: "3" }),
    /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "3" }),
    /* @__PURE__ */ jsx("path", { d: "M18 9a9 9 0 0 1-9 9" })
  ] }),
  Maximize2: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("polyline", { points: "15 3 21 3 21 9" }),
    /* @__PURE__ */ jsx("polyline", { points: "9 21 3 21 3 15" }),
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "14", y1: "3", y2: "10" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "10", y1: "21", y2: "14" })
  ] }),
  FileCode: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
    /* @__PURE__ */ jsx("path", { d: "m10 13-2 2 2 2" }),
    /* @__PURE__ */ jsx("path", { d: "m14 17 2-2-2-2" })
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
function downloadBinaryBase64(filename, b64, mime = "application/octet-stream") {
  const raw = atob(String(b64 || ""));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  if (activeCtx && typeof activeCtx.setTimeout === "function") {
    activeCtx.setTimeout(() => URL.revokeObjectURL(url), 1200);
  } else {
    URL.revokeObjectURL(url);
  }
}
async function loadArtifactMediaDataUrl(nbId, aid, fname) {
  if (!nbId || !aid || !fname) return null;
  const res = await api(
    `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(aid)}/media-data/${encodeURIComponent(fname)}`
  );
  if (res?.available && res.b64) {
    return `data:${res.mime || "image/png"};base64,${res.b64}`;
  }
  return null;
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
  const subtle = resolveCssColor("var(--ui-bg-quinary, var(--ui-bg-quaternary))", svgEl);
  const fg = resolveCssColor("var(--ui-text-primary)", svgEl);
  const muted = resolveCssColor("var(--ui-text-secondary)", svgEl);
  const dim = resolveCssColor("var(--ui-text-tertiary)", svgEl);
  const stroke = resolveCssColor("var(--ui-stroke-secondary)", svgEl);
  const strokeSub = resolveCssColor("var(--ui-stroke-tertiary)", svgEl);
  const accent = resolveCssColor("var(--ui-accent)", svgEl);
  const accentSoft = resolveCssColor("color-mix(in srgb, var(--ui-accent) 16%, var(--ui-bg-elevated))", svgEl);
  const ok = resolveCssColor("var(--sb-ok, #2da44e)", svgEl);
  const warn = resolveCssColor("var(--sb-warn, #d29922)", svgEl);
  const bad = resolveCssColor("var(--sb-bad, #cf222e)", svgEl);
  const replacements = [
    [/var\(--sb-bg[^)]*\)/g, bg],
    [/var\(--sb-surface[^)]*\)/g, bg2],
    [/var\(--sb-sidebar[^)]*\)/g, sidebar],
    [/var\(--sb-subtle[^)]*\)/g, subtle],
    [/var\(--sb-hover[^)]*\)/g, subtle],
    [/var\(--ui-bg-chrome[^)]*\)/g, bg],
    [/var\(--ui-bg-elevated[^)]*\)/g, bg2],
    [/var\(--ui-bg-sidebar[^)]*\)/g, sidebar],
    [/var\(--ui-bg-primary[^)]*\)/g, bg],
    [/var\(--ui-bg-secondary[^)]*\)/g, bg2],
    [/var\(--ui-text-primary[^)]*\)/g, fg],
    [/var\(--ui-text-secondary[^)]*\)/g, muted],
    [/var\(--ui-text-tertiary[^)]*\)/g, dim],
    [/var\(--ui-text-quaternary[^)]*\)/g, dim],
    [/var\(--ui-stroke-secondary[^)]*\)/g, stroke],
    [/var\(--ui-stroke-tertiary[^)]*\)/g, strokeSub],
    [/var\(--sb-accent-soft[^)]*\)/g, accentSoft],
    [/var\(--sb-accent-border[^)]*\)/g, accent],
    [/var\(--ui-accent[^)]*\)/g, accent],
    [/var\(--sb-ok[^)]*\)/g, ok],
    [/var\(--sb-warn[^)]*\)/g, warn],
    [/var\(--sb-bad[^)]*\)/g, bad]
  ];
  let markup = new XMLSerializer().serializeToString(clone);
  for (const [re, val] of replacements) {
    markup = markup.replace(re, val);
  }
  return markup;
}
function downloadSvgAsPng(svgEl, filename, scale = 2) {
  return new Promise((resolve, reject) => {
    try {
      const svgText = bakeSvgVariables(svgEl);
      if (!svgText) {
        resolve(false);
        return;
      }
      const vb = svgEl.viewBox?.baseVal;
      const w = Math.max(1, Math.round(vb && vb.width || svgEl.clientWidth || 920));
      const h = Math.max(1, Math.round(vb && vb.height || svgEl.clientHeight || 640));
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = w * scale;
          canvas.height = h * scale;
          const c2d = canvas.getContext("2d");
          if (!c2d) {
            URL.revokeObjectURL(url);
            resolve(false);
            return;
          }
          c2d.scale(scale, scale);
          c2d.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              resolve(false);
              return;
            }
            const dlUrl = URL.createObjectURL(pngBlob);
            const a = document.createElement("a");
            a.href = dlUrl;
            a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
            a.click();
            if (activeCtx && typeof activeCtx.setTimeout === "function") {
              activeCtx.setTimeout(() => URL.revokeObjectURL(dlUrl), 1200);
            } else {
              URL.revokeObjectURL(dlUrl);
            }
            resolve(true);
          }, "image/png");
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

// desktop-src/SourceBookWorkspace.jsx
import { useCallback, useEffect as useEffect11, useMemo as useMemo4, useRef as useRef10, useState as useState13 } from "react";

// desktop-src/styles.js
import { jsx as jsx2 } from "react/jsx-runtime";
var CSS = `
.sb-root {
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  container-type: inline-size;
  container-name: sb-root;
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
  min-width: 0;
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

/* Main adaptive 3-column workbench (scales seamlessly from 320px split panes to 2560px+ ultrawides) */
.sb-workbench {
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
  display: grid;
  grid-template-columns: clamp(228px, 21cqi, 280px) minmax(0, 1fr) clamp(296px, 28cqi, 372px);
}
.sb-workbench[data-left-collapsed="true"] {
  grid-template-columns: 0px minmax(0, 1fr) clamp(296px, 28cqi, 372px);
}
.sb-workbench[data-right-collapsed="true"] {
  grid-template-columns: clamp(228px, 21cqi, 280px) minmax(0, 1fr) 0px;
}
.sb-workbench[data-left-collapsed="true"][data-right-collapsed="true"] {
  grid-template-columns: 0px minmax(0, 1fr) 0px;
}
.sb-workbench[data-studio-expanded="true"] {
  grid-template-columns: clamp(220px, 19cqi, 264px) 0px minmax(0, 1fr);
}
.sb-workbench[data-left-collapsed="true"][data-studio-expanded="true"] {
  grid-template-columns: 0px 0px minmax(0, 1fr);
}
.sb-workbench[data-left-collapsed="true"] > .sb-pane-left,
.sb-workbench[data-right-collapsed="true"] > .sb-pane-right,
.sb-workbench[data-studio-expanded="true"] > .sb-pane-center {
  border: 0;
  pointer-events: none;
  visibility: hidden;
}

/* Wide & ultrawide desktop screens (>= 1600px container): generous rails */
@container sb-root (min-width: 1600px) {
  .sb-workbench {
    grid-template-columns: clamp(280px, 18cqi, 344px) minmax(0, 1fr) clamp(372px, 26cqi, 468px);
  }
  .sb-workbench[data-left-collapsed="true"] {
    grid-template-columns: 0px minmax(0, 1fr) clamp(372px, 26cqi, 468px);
  }
  .sb-workbench[data-right-collapsed="true"] {
    grid-template-columns: clamp(280px, 18cqi, 344px) minmax(0, 1fr) 0px;
  }
  .sb-workbench[data-studio-expanded="true"] {
    grid-template-columns: clamp(260px, 17cqi, 310px) 0px minmax(0, 1fr);
  }
}

/* Split-screen / half-screen layout (740px - 1079px): 2-column Workspace + Studio, Sources becomes slide-over drawer */
.sb-workbench[data-tier="split"] {
  grid-template-columns: minmax(0, 1fr) clamp(276px, 38cqi, 344px);
}
.sb-workbench[data-tier="split"][data-right-collapsed="true"] {
  grid-template-columns: minmax(0, 1fr) 0px;
}
.sb-workbench[data-tier="split"][data-studio-expanded="true"] {
  grid-template-columns: 0px minmax(0, 1fr);
}
.sb-workbench[data-tier="split"] > .sb-pane-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(304px, 84cqi);
  z-index: 22;
  transform: translateX(-104%);
  box-shadow: 12px 0 32px rgba(0, 0, 0, 0.32);
  border-right: 1px solid var(--ui-stroke-secondary);
  visibility: hidden;
  pointer-events: none;
  transition: transform 180ms var(--sb-ease), visibility 180ms var(--sb-ease);
}
.sb-workbench[data-tier="split"][data-left-drawer="true"] > .sb-pane-left {
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
}
.sb-drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  z-index: 20;
}

/* Compact / narrow split-pane / minimum window (< 740px): single-focus pane switcher bar, 100% width per pane */
.sb-compact-bar {
  display: none;
  flex: 0 0 auto;
  padding: 6px 10px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
}
.sb-root[data-layout="compact"] .sb-compact-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sb-compact-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  gap: 2px;
}
.sb-compact-tabs .sb-seg-btn {
  justify-content: center;
  width: 100%;
  padding: 0 6px;
  height: 26px;
}
.sb-workbench[data-tier="compact"] {
  display: flex;
  flex-direction: column;
}
.sb-workbench[data-tier="compact"] > .sb-pane {
  flex: 1;
  width: 100%;
  border-left: 0;
  border-right: 0;
}
.sb-workbench[data-tier="compact"][data-compact-pane="sources"] > .sb-pane-center,
.sb-workbench[data-tier="compact"][data-compact-pane="sources"] > .sb-pane-right,
.sb-workbench[data-tier="compact"][data-compact-pane="workspace"] > .sb-pane-left,
.sb-workbench[data-tier="compact"][data-compact-pane="workspace"] > .sb-pane-right,
.sb-workbench[data-tier="compact"][data-compact-pane="studio"] > .sb-pane-left,
.sb-workbench[data-tier="compact"][data-compact-pane="studio"] > .sb-pane-center {
  display: none;
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
  container-type: inline-size;
  container-name: sb-left;
}
.sb-pane-center {
  background: var(--sb-bg);
  container-type: inline-size;
  container-name: sb-center;
}
.sb-pane-right {
  border-left: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
  container-type: inline-size;
  container-name: sb-studio;
}

.sb-pane-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  min-width: 0;
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
  grid-template-columns: repeat(auto-fit, minmax(74px, 1fr));
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
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 6px;
  padding: 10px 12px;
}
.sb-studio-tile {
  position: relative;
  overflow: hidden;
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
/* Subtle dithercn-inspired ordered-dither dot matrix that thickens cleanly on hover */
.sb-studio-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.09;
  background-image:
    radial-gradient(circle at 1px 1px, var(--ui-accent) 0.9px, transparent 0),
    radial-gradient(circle at 4px 4px, var(--ui-accent) 0.9px, transparent 0);
  background-size: 6px 6px;
  mask-image: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, transparent 72%);
  transition: opacity 150ms var(--sb-ease);
}
.sb-studio-tile:hover:not(:disabled) {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
}
.sb-studio-tile:hover:not(:disabled)::before {
  opacity: 0.28;
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

/* Infographic toolbar & inspector */
.sb-inf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.sb-inf-detail {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Data table (Linear / Airtable / Stripe evidence workbench) */
.sb-dt-root {
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-height: 100%;
}
.sb-dt-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 10px;
  background: var(--sb-surface);
  overflow: hidden;
}
.sb-dt-kpi {
  padding: 10px 14px;
  border-right: 1px solid var(--ui-stroke-tertiary);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sb-dt-kpi:last-child {
  border-right: 0;
}
.sb-dt-kpi-lbl {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ui-text-tertiary);
}
.sb-dt-kpi-val {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--ui-text-primary);
}
.sb-dt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sb-dt-search-wrap {
  flex: 1;
  min-width: 180px;
  height: 30px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  align-items: center;
  gap: 7px;
  transition: border-color 140ms var(--sb-ease);
}
.sb-dt-search-wrap:focus-within {
  border-color: var(--ui-accent);
}
.sb-dt-search {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.sb-dt-clear {
  border: 0;
  background: transparent;
  color: var(--ui-text-tertiary);
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
}
.sb-dt-clear:hover {
  color: var(--ui-text-primary);
}
.sb-dt-col-menu {
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 176px;
  padding: 6px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sb-dt-col-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 7px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ui-text-primary);
  cursor: pointer;
}
.sb-dt-col-opt:hover {
  background: var(--sb-hover);
}
.sb-dt-facets {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.sb-dt-facet-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-secondary);
  font: inherit;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 130ms var(--sb-ease), border-color 130ms var(--sb-ease), color 130ms var(--sb-ease);
}
.sb-dt-facet-chip:hover {
  background: var(--sb-hover);
  color: var(--ui-text-primary);
}
.sb-dt-facet-chip[data-active="true"] {
  background: var(--sb-accent-soft);
  border-color: var(--sb-accent-border);
  color: var(--ui-accent);
  font-weight: 600;
}
.sb-dt-facet-n {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  opacity: 0.72;
}
.sb-table-wrap {
  border: 1px solid var(--ui-stroke-secondary);
  border-radius: 10px;
  overflow: auto;
  background: var(--sb-surface);
}
.sb-dt-table-stage {
  max-height: calc(100vh - 280px);
  min-height: 360px;
}
.sb-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.sb-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  text-align: left;
  padding: 10px 12px;
  background: var(--sb-sidebar);
  border-bottom: 1px solid var(--ui-stroke-secondary);
  color: var(--ui-text-tertiary);
  font-size: 11px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: color 120ms var(--sb-ease);
}
.sb-table th:hover {
  color: var(--ui-text-primary);
}
.sb-table th[data-sorted] {
  color: var(--ui-text-primary);
}
.sb-dt-th-inner {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.sb-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  vertical-align: middle;
  color: var(--ui-text-primary);
  line-height: 1.48;
}
.sb-table[data-density="compact"] td {
  padding: 7px 10px;
  font-size: 12px;
}
.sb-dt-row {
  cursor: pointer;
  transition: background-color 110ms var(--sb-ease);
}
.sb-table tbody tr.sb-dt-row:hover {
  background: var(--sb-hover);
}
.sb-table tbody tr.sb-dt-row[data-expanded="true"] {
  background: var(--sb-accent-soft);
}
.sb-dt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 186px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 11.5px;
  font-weight: 550;
  line-height: 1.25;
}
.sb-dt-badge-txt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-dt-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}
.sb-dt-tag {
  display: inline-block;
  max-width: 162px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--sb-subtle);
  border: 1px solid var(--ui-stroke-tertiary);
  color: var(--ui-text-secondary);
  font-size: 11.5px;
  font-weight: 500;
}
.sb-dt-qual {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--sb-bg);
  border: 1px solid var(--ui-stroke-tertiary);
  color: var(--ui-text-tertiary);
  font-size: 10.5px;
  font-weight: 500;
}
.sb-dt-metric-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 78px;
}
.sb-dt-metric-val {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.1;
}
.sb-dt-bar-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.sb-dt-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 220ms var(--sb-ease);
}
.sb-dt-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sb-dt-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sb-dt-row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}
.sb-dt-copy-btn {
  opacity: 0.25;
  border: 0;
  background: transparent;
  color: var(--ui-text-secondary);
  cursor: pointer;
  padding: 3px 4px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  transition: opacity 120ms var(--sb-ease), background-color 120ms var(--sb-ease), color 120ms var(--sb-ease);
}
.sb-dt-row:hover .sb-dt-copy-btn {
  opacity: 1;
}
.sb-dt-copy-btn:hover {
  background: var(--sb-subtle);
  color: var(--ui-text-primary);
}
.sb-dt-detail-row td {
  padding: 0;
  background: var(--sb-bg);
}
.sb-dt-detail-panel {
  padding: 12px 16px 14px 40px;
  border-left: 2px solid var(--ui-accent);
}
.sb-dt-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 14px;
}
.sb-dt-detail-key {
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ui-text-tertiary);
  margin-bottom: 2px;
}
.sb-dt-detail-val {
  font-size: 12.5px;
  color: var(--ui-text-primary);
  line-height: 1.55;
}
.sb-dt-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 10px;
}
.sb-dt-card {
  padding: 14px 15px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-dt-chart-stage {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sb-dt-chart-group {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sb-dt-chart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
}
.sb-dt-chart-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sb-dt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--ui-text-tertiary);
  padding: 0 2px;
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
  width: min(480px, 44cqi);
  background: var(--sb-sidebar);
  border-left: 1px solid var(--ui-stroke-secondary);
  box-shadow: -10px 0 28px rgba(0, 0, 0, 0.24);
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
  width: min(320px, calc(100vw - 24px));
  max-height: calc(100vh - 84px);
  overflow-y: auto;
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

/* Ordered-dither primitives (dithercn / Paper Shaders inspired, zero-bloat) */
.sb-dither-canvas {
  display: block;
  image-rendering: pixelated;
  pointer-events: none;
}
.sb-dither-fill {
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.22) 0 1px,
      transparent 1px 3px
    );
}
.sb-native-catalog-wrap {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--ui-stroke-tertiary);
  max-height: 360px;
  overflow: auto;
}

/* Audio Overview dithered waveform stage */
.sb-audio-stage {
  padding: 12px 14px;
  border-radius: 11px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Flashcards tactile layered deck */
.sb-fc-mastery-bar {
  display: flex;
  height: 5px;
  border-radius: 999px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
  gap: 1px;
}
.sb-fc-stack {
  position: relative;
  padding-bottom: 12px;
}
.sb-fc-layer {
  position: absolute;
  border-radius: 13px;
  border: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-surface);
  pointer-events: none;
}
.sb-fc-layer-1 {
  inset: 7px 8px 5px;
  opacity: 0.62;
}
.sb-fc-layer-2 {
  inset: 13px 16px 0;
  opacity: 0.34;
}
.sb-fc-card-rich {
  position: relative;
  overflow: hidden;
  min-height: 290px;
  padding: 24px 28px 20px;
  border-radius: 13px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.16);
}
.sb-fc-card-rich[data-flipped="true"] {
  border-color: color-mix(in srgb, #10b981 48%, var(--ui-stroke-secondary));
}
.sb-fc-grade-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 9px 10px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-primary);
  font: inherit;
  cursor: pointer;
  transition: background-color 130ms var(--sb-ease), border-color 130ms var(--sb-ease), transform 110ms var(--sb-ease);
}
.sb-fc-grade-btn:active {
  transform: scale(0.97);
}
.sb-fc-grade-btn[data-tone="bad"] {
  border-color: rgba(244, 63, 94, 0.35);
  background: rgba(244, 63, 94, 0.08);
  color: #fb7185;
}
.sb-fc-grade-btn[data-tone="bad"]:hover {
  background: rgba(244, 63, 94, 0.16);
}
.sb-fc-grade-btn[data-tone="warn"] {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.08);
  color: #fbbf24;
}
.sb-fc-grade-btn[data-tone="warn"]:hover {
  background: rgba(245, 158, 11, 0.16);
}
.sb-fc-grade-btn[data-tone="accent"] {
  border-color: var(--sb-accent-border);
  background: var(--sb-accent-soft);
  color: var(--ui-accent);
}
.sb-fc-grade-btn[data-tone="accent"]:hover {
  background: color-mix(in srgb, var(--ui-accent) 22%, transparent);
}
.sb-fc-grade-btn[data-tone="ok"] {
  border-color: rgba(16, 185, 129, 0.38);
  background: rgba(16, 185, 129, 0.10);
  color: #34d399;
}
.sb-fc-grade-btn[data-tone="ok"]:hover {
  background: rgba(16, 185, 129, 0.18);
}

/* Slide Deck grand presentation studio */
.sb-slide-stage-rich {
  position: relative;
  overflow: hidden;
  border-radius: 13px;
  padding: 28px 36px 22px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
}
.sb-sl-top-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3.5px;
}
.sb-sl-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  margin-block: auto;
  padding: 12px 16px;
}
.sb-sl-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--ui-stroke-secondary);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.sb-sl-stat-split {
  display: grid;
  grid-template-columns: 0.85fr 1.35fr;
  gap: 24px;
  align-items: stretch;
  margin-block: auto;
}
.sb-sl-stat-hero {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  padding: 22px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sb-sl-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
}
.sb-sl-step {
  font-size: 10.5px;
  font-weight: 750;
  padding-top: 2px;
  flex-shrink: 0;
}
.sb-sl-cards-grid {
  display: grid;
  gap: 10px;
}
.sb-sl-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
}
.sb-sl-quote-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-block: auto;
  padding: 10px 12px;
}
.sb-sl-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 10px;
}
.sb-sl-overview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 15px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  cursor: pointer;
  font: inherit;
  min-height: 118px;
  transition: border-color 140ms var(--sb-ease), background-color 140ms var(--sb-ease);
}
.sb-sl-overview-card:hover {
  background: var(--sb-hover);
}
.sb-sl-overview-card[data-active="true"] {
  border-color: var(--ui-accent);
  background: var(--sb-accent-soft);
}

/* Quiz Mastery Studio */
.sb-qz-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
}
.sb-qz-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.sb-qz-stepper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.sb-qz-step {
  width: 30px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-secondary);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  font-weight: 650;
  cursor: pointer;
  transition: background-color 120ms var(--sb-ease), border-color 120ms var(--sb-ease), color 120ms var(--sb-ease);
}
.sb-qz-step:hover {
  border-color: var(--ui-accent);
  color: var(--ui-text-primary);
}
.sb-qz-step[data-state="correct"] {
  border-color: rgba(16, 185, 129, 0.48);
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
}
.sb-qz-step[data-state="wrong"] {
  border-color: rgba(244, 63, 94, 0.48);
  background: rgba(244, 63, 94, 0.14);
  color: #fb7185;
}
.sb-qz-step[data-active="true"] {
  border-color: var(--ui-accent);
  box-shadow: 0 0 0 1px var(--ui-accent);
  color: var(--ui-text-primary);
}
.sb-qz-stage {
  padding: 20px 22px;
  border-radius: 12px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sb-qz-stage-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
}
.sb-qz-options {
  display: grid;
  gap: 8px;
}
.sb-qz-opt {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 13px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  color: var(--ui-text-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 130ms var(--sb-ease), border-color 130ms var(--sb-ease), opacity 130ms var(--sb-ease);
}
.sb-qz-opt:hover {
  background: var(--sb-hover);
  border-color: var(--sb-accent-border);
}
.sb-qz-opt[data-state="correct"] {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.13);
}
.sb-qz-opt[data-state="wrong"] {
  border-color: var(--sb-bad);
  background: color-mix(in srgb, var(--sb-bad) 13%, var(--sb-bg));
}
.sb-qz-opt[data-state="dim"] {
  opacity: 0.56;
}
.sb-qz-keycap {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sb-qz-opt[data-state="correct"] .sb-qz-keycap {
  border-color: #10b981;
  color: #34d399;
}
.sb-qz-opt[data-state="wrong"] .sb-qz-keycap {
  border-color: var(--sb-bad);
  color: var(--sb-bad);
}
.sb-qz-explain {
  padding: 12px 14px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  border-left-width: 3px;
  background: var(--sb-bg);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sb-qz-explain[data-ok="true"] {
  border-left-color: #10b981;
}
.sb-qz-explain[data-ok="false"] {
  border-left-color: var(--sb-bad);
}
.sb-qz-complete {
  padding: 14px 16px;
  border-radius: 11px;
  border: 1px solid rgba(16, 185, 129, 0.38);
  background: rgba(16, 185, 129, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* Customize Slide Deck Modal, Outline Editor, More Action Menu & Rich Layouts */
.sb-modal-wide {
  width: min(720px, 94vw);
}
.sb-sd-format-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.sb-sd-format-card {
  text-align: left;
  padding: 13px 15px;
  border-radius: 11px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  color: var(--ui-text-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  line-height: 1.45;
  cursor: pointer;
  transition: border-color 140ms var(--sb-ease), background-color 140ms var(--sb-ease);
}
.sb-sd-format-card:hover {
  border-color: var(--ui-accent);
}
.sb-sd-format-card[data-active="true"] {
  border-color: var(--ui-accent);
  background: color-mix(in srgb, var(--ui-accent) 14%, var(--sb-bg));
  color: var(--ui-text-primary);
}
.sb-sd-format-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--ui-text-primary);
}
.sb-sd-radio {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1.5px solid var(--ui-stroke-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.sb-sd-radio[data-checked="true"] {
  border-color: var(--ui-accent);
  background: var(--ui-accent);
}
.sb-sd-controls-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: end;
}
.sb-sd-source-picker {
  max-height: 165px;
  overflow-y: auto;
  padding: 9px 11px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sb-sd-source-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--ui-text-primary);
}
.sb-sd-source-row:hover {
  background: var(--sb-hover);
}
.sb-sd-toggle-card {
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.sb-switch {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--ui-stroke-primary);
  background: var(--sb-subtle);
  padding: 2px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 140ms var(--sb-ease), border-color 140ms var(--sb-ease);
}
.sb-switch[data-checked="true"] {
  background: var(--ui-accent);
  border-color: var(--ui-accent);
}
.sb-switch-thumb {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  transform: translateX(0);
  transition: transform 140ms var(--sb-ease);
}
.sb-switch[data-checked="true"] .sb-switch-thumb {
  transform: translateX(16px);
}
.sb-outline-row {
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-bg);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.sb-art-menu {
  position: absolute;
  z-index: 60;
  min-width: 228px;
  padding: 5px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-primary);
  background: var(--sb-surface);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sb-art-menu-item {
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border-radius: 7px;
  border: 0;
  background: transparent;
  color: var(--ui-text-primary);
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  transition: background-color 100ms var(--sb-ease);
}
.sb-art-menu-item:hover {
  background: var(--sb-hover);
}
.sb-art-menu-danger {
  color: var(--sb-bad);
}
.sb-art-menu-sep {
  height: 1px;
  background: var(--ui-stroke-tertiary);
  margin: 3px 6px;
}
.sb-sl-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.sb-sl-comp-col {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  border-top-width: 3px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sb-sl-timeline {
  display: grid;
  gap: 12px;
}
.sb-sl-step-card {
  padding: 13px 14px;
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-sl-step-pill {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
}
.sb-sl-hybrid-split {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  gap: 22px;
  align-items: center;
  height: 100%;
}
.sb-sl-hybrid-art {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--ui-stroke-secondary);
}
.sb-sl-full-art {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
}
.sb-sl-art-overlay {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 46px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(9, 13, 22, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.28);
}
.sb-sl-full-art-bar {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  background: transparent;
  pointer-events: none;
}
.sb-sl-full-art-bar > * {
  pointer-events: auto;
}
/* Inline Slide Editor & Single-Slide Regenerate Visual */
.sb-sl-editor {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sb-sl-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.sb-sl-regen-banner {
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-accent-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--ui-text-primary);
}
/* Visual PDF Page Preview inside Passage Inspector */
.sb-pdf-preview-card {
  border-radius: 10px;
  border: 1px solid var(--ui-stroke-secondary);
  background: var(--sb-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sb-pdf-preview-head {
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  border-bottom: 1px solid var(--ui-stroke-tertiary);
  background: var(--sb-sidebar);
  font-size: 11.5px;
}
.sb-pdf-preview-stage {
  position: relative;
  background: var(--sb-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: zoom-in;
}
.sb-pdf-preview-img {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid var(--ui-stroke-tertiary);
  display: block;
  background: #fff;
}
/* Spoken Host Reply Banner inside Audio Overview */
.sb-audio-reply-bar {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #10b981 42%, var(--ui-stroke-secondary));
  background: color-mix(in srgb, #10b981 10%, var(--sb-surface));
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* Deep Research Progress Card */
.sb-dr-progress {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--sb-accent-border);
  background: var(--sb-accent-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-dr-bar {
  height: 5px;
  border-radius: 99px;
  background: var(--ui-stroke-tertiary);
  overflow: hidden;
}
.sb-dr-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--ui-accent);
  transition: width 260ms var(--sb-ease);
}

/* Responsive typography, measure & adaptive containers across ALL window sizes (320px - 2560px+) */
.sb-model-trigger {
  min-width: 0;
}
.sb-model-trigger-label {
  max-width: 158px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-kpi-strip-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.sb-conflict-sides {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.sb-msg-body {
  overflow-wrap: anywhere;
  word-break: break-word;
}
.sb-msg-body .sb-table-wrap,
.sb-msg-body .sb-code-block {
  max-width: 100%;
}
.sb-slideshow-backdrop {
  padding: clamp(10px, 2.2vw, 24px);
  overflow-y: auto;
}
.sb-slideshow-shell {
  width: min(1040px, 96vw);
  max-height: calc(100vh - 28px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sb-slideshow-foot {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.sb-slideshow-foot-split {
  grid-template-columns: 1.6fr 1fr;
}

/* Prevent flex-column vertical squishing inside scrollable panes & center ultrawide measure cleanly */
.sb-chat-track,
.sb-panel-track {
  width: 100%;
  max-width: 920px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sb-chat-track > *,
.sb-panel-track > *,
.sb-briefing,
.sb-msg,
.sb-kpi-strip,
.sb-ledger-row,
.sb-conflict-card,
.sb-src-row,
.sb-art-item,
.sb-chunk-card {
  flex-shrink: 0;
}
.sb-msg {
  max-width: 100%;
}
.sb-composer-wrap > .sb-composer {
  width: 100%;
  max-width: 920px;
  margin-inline: auto;
}

/* Center pane compact adaptations (works in BOTH narrow windows AND wide windows with expanded sidebars!) */
@container sb-center (max-width: 640px) {
  .sb-center-tabs {
    padding: 7px 12px;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sb-chat-stream {
    padding: 12px 12px 18px;
  }
  .sb-chat-track,
  .sb-panel-track {
    gap: 11px;
  }
  .sb-composer-wrap {
    padding: 8px 12px 10px;
  }
  .sb-panel-pad {
    padding: 12px 12px 22px;
  }
  .sb-msg-user {
    max-width: 92%;
  }
  .sb-msg-assistant {
    padding: 11px 13px;
  }
}
@container sb-center (max-width: 520px) {
  .sb-kpi-strip-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sb-kpi-strip-4 .sb-kpi {
    border-bottom: 1px solid var(--ui-stroke-tertiary);
  }
  .sb-kpi-strip-4 .sb-kpi:nth-child(2n) {
    border-right: 0;
  }
  .sb-kpi-strip-4 .sb-kpi:nth-last-child(-n+2) {
    border-bottom: 0;
  }
  .sb-conflict-sides {
    grid-template-columns: 1fr;
  }
  .sb-center-tabs {
    flex-wrap: nowrap;
    padding: 6px 10px;
  }
  .sb-center-tabs .sb-seg {
    min-width: 0;
    flex: 1 1 auto;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .sb-center-tabs .sb-seg-btn {
    padding: 0 6px;
    font-size: 11px;
    white-space: nowrap;
  }
}
@container sb-center (max-width: 430px) {
  .sb-center-tabs .sb-seg-btn svg {
    display: none !important;
  }
  .sb-center-tabs .sb-seg-btn {
    padding: 0 7px;
    font-size: 11px;
  }
}
@container sb-center (max-width: 310px) {
  .sb-kpi-strip {
    grid-template-columns: 1fr;
  }
  .sb-kpi {
    border-right: 0;
    border-bottom: 1px solid var(--ui-stroke-tertiary);
  }
  .sb-kpi:last-child {
    border-bottom: 0;
  }
}

/* Studio container queries (responds to Studio's OWN width: docked rail vs split vs full-width expanded!) */
@container sb-studio (max-width: 560px) {
  .sb-viewer-head {
    padding: 8px 10px;
  }
  .sb-viewer-body {
    padding: 12px 12px 18px;
  }
  .sb-slide-stage:not(.sb-slide-stage-art) {
    aspect-ratio: auto;
    min-height: 210px;
    padding: 14px 16px;
    gap: 10px;
  }
  .sb-sl-hybrid-split,
  .sb-sl-stat-split,
  .sb-sl-comparison,
  .sb-sl-editor-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .sb-sl-cards-grid {
    grid-template-columns: 1fr !important;
  }
  .sb-sl-overview-grid {
    grid-template-columns: 1fr;
  }
  .sb-slide-thumb {
    flex: 0 0 112px;
  }
  .sb-dt-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sb-dt-kpi {
    border-bottom: 1px solid var(--ui-stroke-tertiary);
  }
  .sb-dt-kpi:nth-child(2n) {
    border-right: 0;
  }
  .sb-dt-kpi:nth-last-child(-n+2) {
    border-bottom: 0;
  }
  .sb-dt-detail-panel {
    padding: 10px 12px 12px 16px;
  }
  .sb-dt-detail-grid {
    grid-template-columns: 1fr;
  }
  .sb-fc-card-rich {
    min-height: 220px;
    padding: 16px 18px;
  }
  .sb-fc-grade-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sb-qz-stage {
    padding: 14px 15px;
  }
  .sb-qz-hero {
    padding: 11px 12px;
  }
  .sb-art-menu {
    min-width: 196px;
    max-width: calc(100cqi - 16px);
  }
}
@container sb-studio (min-width: 561px) and (max-width: 720px) {
  .sb-dt-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Root container queries: Topbar & Inspector adaptation across ALL Hermes window & split-screen sizes */
@container sb-root (max-width: 1120px) {
  .sb-topbar {
    padding: 0 12px;
    gap: 8px;
  }
  .sb-topbar-left,
  .sb-topbar-right {
    gap: 6px;
  }
  .sb-nb-select {
    max-width: 190px;
  }
  .sb-model-trigger-label {
    max-width: 118px;
  }
  .sb-cov-label {
    display: none;
  }
}

@container sb-root (max-width: 960px) {
  .sb-brand {
    padding-right: 8px;
  }
  .sb-brand-text {
    display: none;
  }
  .sb-nb-select {
    max-width: 158px;
  }
  .sb-model-trigger-label {
    max-width: 96px;
  }
  .sb-inspector {
    width: min(440px, 66cqi);
  }
}

@container sb-root (max-width: 739px) {
  .sb-topbar {
    padding: 0 10px;
    gap: 6px;
  }
  .sb-topbar-left,
  .sb-topbar-right {
    gap: 5px;
  }
  .sb-brand {
    border-right: 0;
    padding-right: 2px;
  }
  .sb-hide-compact {
    display: none;
  }
  .sb-top-label {
    display: none;
  }
  .sb-top-new-btn,
  .sb-top-strict-btn,
  .sb-top-search-btn {
    width: 28px;
    padding: 0;
  }
  .sb-nb-select {
    max-width: clamp(104px, 34cqi, 210px);
    padding: 0 8px;
  }
  .sb-model-trigger {
    padding: 0 7px;
  }
  .sb-model-trigger-label {
    max-width: clamp(56px, 18cqi, 110px);
  }
  .sb-inspector {
    top: 48px;
    left: 0;
    right: 0;
    width: 100%;
    border-left: 0;
  }
}

@container sb-root (max-width: 440px) {
  .sb-model-trigger-label {
    display: none;
  }
  .sb-compact-tabs .sb-seg-btn {
    font-size: 11px;
    gap: 4px;
    padding: 0 4px;
  }
}

/* Modal & full-window Slideshow responsiveness (fixed overlays respond to viewport) */
@media (max-width: 680px) {
  .sb-modal-backdrop {
    padding: 10px;
  }
  .sb-modal,
  .sb-modal-wide {
    width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  }
  .sb-sd-format-grid,
  .sb-sd-controls-row,
  .sb-slideshow-foot-split {
    grid-template-columns: 1fr;
  }
  .sb-modal-head,
  .sb-modal-body,
  .sb-modal-foot {
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* Short viewport heights (e.g., top/bottom horizontal split screens like 1280x480) */
@media (max-height: 620px) {
  .sb-topbar {
    flex: 0 0 42px;
  }
  .sb-inspector {
    top: 42px;
  }
  .sb-textarea {
    min-height: 30px;
    max-height: 86px;
  }
  .sb-dt-table-stage {
    min-height: 200px;
    max-height: calc(100vh - 220px);
  }
  .sb-modal {
    max-height: calc(100vh - 16px);
  }
  .sb-pdf-preview-img {
    max-height: 190px;
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
import { useEffect as useEffect2, useRef as useRef2, useState } from "react";

// desktop-src/components/DitherSurface.jsx
import { useEffect, useRef } from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var BAYER_4X4 = [
  0 / 16,
  8 / 16,
  2 / 16,
  10 / 16,
  12 / 16,
  4 / 16,
  14 / 16,
  6 / 16,
  3 / 16,
  11 / 16,
  1 / 16,
  9 / 16,
  15 / 16,
  7 / 16,
  13 / 16,
  5 / 16
];
function parseRgb(colorStr) {
  const m = String(colorStr || "").match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (m) {
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }
  const r = String(colorStr || "").match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (r) {
    return [Number(r[1]), Number(r[2]), Number(r[3])];
  }
  return [59, 130, 246];
}
function prefersReducedMotion() {
  try {
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
function DitherCanvas({
  variant = "aurora",
  animated = false,
  color = "var(--ui-accent)",
  secondaryColor = "#10b981",
  opacity = 0.28,
  cell = 3,
  cols = 148,
  rows = 32,
  className = "",
  style
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return void 0;
    canvas.width = cols;
    canvas.height = rows;
    const c2d = canvas.getContext("2d");
    if (!c2d) return void 0;
    const img = c2d.createImageData(cols, rows);
    const data = img.data;
    const readPalette = () => {
      const c1 = parseRgb(resolveCssColor(color, canvas));
      const c2 = parseRgb(resolveCssColor(secondaryColor, canvas));
      return [c1, c2];
    };
    let [rgbA, rgbB] = readPalette();
    const paint = (timeMs) => {
      const t = timeMs * 55e-5;
      for (let y = 0; y < rows; y += 1) {
        const ny = y / Math.max(1, rows - 1);
        const bRow = (y & 3) * 4;
        for (let x = 0; x < cols; x += 1) {
          const nx = x / Math.max(1, cols - 1);
          let field = 0;
          let blend = nx;
          if (variant === "wave") {
            const w1 = Math.sin(nx * 10.5 + t * 2.2) * 0.24 + Math.sin(nx * 23 - t * 1.4) * 0.11;
            const w2 = Math.cos(nx * 7.5 - t * 1.7) * 0.2;
            const env = Math.sin(nx * Math.PI);
            const center = 0.5 + (w1 + w2) * env;
            const dist = Math.abs(ny - center);
            field = Math.max(0, 1 - dist * 3.1) * (0.35 + 0.65 * env);
            blend = 0.5 + 0.5 * Math.sin(nx * 6 + t);
          } else if (variant === "mesh") {
            const dx = nx - 0.14;
            const dy = ny - 0.12;
            const r = Math.sqrt(dx * dx * 0.65 + dy * dy * 1.8);
            const ripple = 0.06 * Math.sin(nx * 8 + t);
            field = Math.max(0, (1 - r * 1.25 + ripple) * (1 - ny * 0.82));
            blend = nx * 0.75;
          } else {
            const c1 = Math.sin(nx * 5.2 + t * 1.1) * 0.5 + 0.5;
            const c2 = Math.sin(nx * 11.4 - t * 0.8 + 1.3) * 0.5 + 0.5;
            const verticalFade = Math.pow(Math.max(0, 1 - ny), 1.35);
            field = (c1 * 0.55 + c2 * 0.45) * verticalFade * 0.92;
            blend = c1;
          }
          const threshold = BAYER_4X4[bRow + (x & 3)];
          const idx = (y * cols + x) * 4;
          if (field > threshold) {
            const useB = blend > 0.58;
            const rgb = useB ? rgbB : rgbA;
            data[idx] = rgb[0];
            data[idx + 1] = rgb[1];
            data[idx + 2] = rgb[2];
            data[idx + 3] = Math.round(255 * Math.min(1, 0.55 + field * 0.45));
          } else {
            data[idx + 3] = 0;
          }
        }
      }
      c2d.putImageData(img, 0, 0);
    };
    paint(1400);
    if (!animated || prefersReducedMotion() || typeof sdk.createBudgetedLoop !== "function") {
      return void 0;
    }
    const loop = sdk.createBudgetedLoop(
      (now) => {
        paint(now);
      },
      {
        fps: 10,
        pauseWhenUnfocused: true
      }
    );
    return () => {
      loop?.dispose?.();
    };
  }, [variant, animated, color, secondaryColor, cols, rows]);
  return /* @__PURE__ */ jsx3(
    "canvas",
    {
      ref: canvasRef,
      "aria-hidden": "true",
      className: className ? `sb-dither-canvas ${className}` : "sb-dither-canvas",
      style: {
        opacity,
        imageRendering: "pixelated",
        ...style
      },
      "data-cell": cell
    }
  );
}
function HermesSpinner({ size = 12, className = "" }) {
  const GlyphSpinner = sdk.GlyphSpinner;
  if (typeof GlyphSpinner === "function") {
    return /* @__PURE__ */ jsx3(GlyphSpinner, { spinner: "breathe", className, style: { fontSize: size, lineHeight: 1 } });
  }
  return /* @__PURE__ */ jsx3("span", { className: "sb-dt-dot", style: { background: "var(--ui-accent)", width: 7, height: 7 }, "aria-hidden": "true" });
}

// desktop-src/components/SidebarSources.jsx
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
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
  ctx,
  nbId,
  sources,
  notes,
  coverage,
  selectedSourceId,
  onSelectSource,
  onOpenArtifact,
  onSaveMemory,
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
  const [discoverMode, setDiscoverMode] = useState("quick");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverResults, setDiscoverResults] = useState([]);
  const [discoverChecked, setDiscoverChecked] = useState({});
  const [deepDepth, setDeepDepth] = useState("standard");
  const [deepAutoBrief, setDeepAutoBrief] = useState(true);
  const [deepRunning, setDeepRunning] = useState(false);
  const [deepStage, setDeepStage] = useState("");
  const [deepPct, setDeepPct] = useState(0);
  const [deepResult, setDeepResult] = useState(null);
  const fileRef = useRef2(null);
  const cancelDeepRef = useRef2(null);
  useEffect2(() => {
    return () => cancelDeepRef.current?.();
  }, []);
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
  async function runDeepResearch(e) {
    e.preventDefault();
    if (!discoverQuery.trim() || deepRunning || !nbId) return;
    setDeepRunning(true);
    setDeepResult(null);
    setDeepStage("Planning complementary research queries...");
    setDeepPct(10);
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/deep-research`, {
        method: "POST",
        body: {
          topic: discoverQuery.trim(),
          depth: deepDepth,
          auto_brief: deepAutoBrief
        }
      });
      const pollCtx = ctx || getContext();
      cancelDeepRef.current?.();
      cancelDeepRef.current = pollJob(
        pollCtx,
        job,
        (j) => {
          setDeepStage(j.stage || "Researching...");
          if (typeof j.pct === "number") setDeepPct(j.pct);
        },
        async (result) => {
          setDeepRunning(false);
          setDeepPct(100);
          setDeepStage("");
          setDeepResult(result || null);
          await onRefresh();
          const n = result?.ingested?.length || 0;
          sdk.host?.notify?.({
            kind: "success",
            title: "SourceBook Deep Research",
            message: `Auto-ingested ${n} source${n === 1 ? "" : "s"}${result?.artifact ? " and synthesized a Research Briefing" : ""}.`
          });
        },
        (err) => {
          setDeepRunning(false);
          setDeepStage("");
          onError?.(err.message || "Deep Research run failed.");
        }
      );
    } catch (err) {
      setDeepRunning(false);
      setDeepStage("");
      onError?.(err.message || "Could not start Deep Research.");
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
              /* @__PURE__ */ jsx4("span", { className: "sb-num", style: { opacity: 0.7 }, children: sources.length })
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
              /* @__PURE__ */ jsx4("span", { className: "sb-num", style: { opacity: 0.7 }, children: notes.length })
            ]
          }
        )
      ] }),
      tab === "sources" && sources.length > 0 ? /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost", onClick: toggleAll, title: "Toggle all sources", children: /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
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
            /* @__PURE__ */ jsx4(Icon, { name: "Plus", size: 13 }),
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
            /* @__PURE__ */ jsx4(
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
                    /* @__PURE__ */ jsx4(Icon, { name: "Upload", size: 12 }),
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
                    /* @__PURE__ */ jsx4(Icon, { name: "Link", size: 12 }),
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
                    /* @__PURE__ */ jsx4(Icon, { name: "FolderOpen", size: 12 }),
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
                    /* @__PURE__ */ jsx4(Icon, { name: "Globe", size: 12 }),
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
                    /* @__PURE__ */ jsx4(Icon, { name: "FilePlus", size: 12 }),
                    " Paste"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx4("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", textAlign: "center" }, children: busy ? "Indexing source..." : "Drop PDF, DOCX, Markdown, CSV, audio, or URLs" })
          ]
        }
      ),
      /* @__PURE__ */ jsx4("div", { className: "sb-src-list sb-scroll", children: sources.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "sb-empty", children: [
        /* @__PURE__ */ jsx4(Icon, { name: "BookOpen", size: 22 }),
        /* @__PURE__ */ jsx4("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No sources yet" }),
        /* @__PURE__ */ jsx4("div", { style: { fontSize: 11.5 }, children: "Add documents, YouTube videos, local folders, or discover web sources." })
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
              /* @__PURE__ */ jsx4(
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
                /* @__PURE__ */ jsx4("div", { className: "sb-src-title", title: src.title, children: src.title }),
                /* @__PURE__ */ jsxs2("div", { className: "sb-src-meta", children: [
                  /* @__PURE__ */ jsx4(Icon, { name: KIND_ICONS[src.kind] || "FileText", size: 11 }),
                  /* @__PURE__ */ jsx4("span", { className: "sb-kind-tag", children: src.kind }),
                  /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
                    fmtWords(src.word_count ?? Math.round((src.chars || 0) / 5)),
                    " w"
                  ] }),
                  /* @__PURE__ */ jsxs2("span", { className: "sb-num", children: [
                    src.chunk_count,
                    " ch"
                  ] })
                ] }),
                /* @__PURE__ */ jsx4("div", { className: "sb-src-bar", title: `Coverage: ${pct}%`, children: /* @__PURE__ */ jsx4("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) })
              ] }),
              /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 2 }, onClick: (e) => e.stopPropagation(), children: [
                canRefresh ? /* @__PURE__ */ jsx4(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost sb-btn-icon",
                    title: "Refresh source from disk or URL",
                    disabled: refreshingId === src.id,
                    onClick: (e) => handleRefreshSource(e, src),
                    children: /* @__PURE__ */ jsx4(Icon, { name: "RefreshCw", size: 12 })
                  }
                ) : null,
                /* @__PURE__ */ jsx4(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                    title: "Remove source",
                    "aria-label": `Remove ${src.title}`,
                    onClick: (e) => deleteSource(e, src),
                    children: /* @__PURE__ */ jsx4(Icon, { name: "Trash2", size: 13 })
                  }
                )
              ] })
            ]
          },
          src.id
        );
      }) })
    ] }) : /* @__PURE__ */ jsx4("div", { className: "sb-src-list sb-scroll", children: notes.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "sb-empty", children: [
      /* @__PURE__ */ jsx4(Icon, { name: "StickyNote", size: 22 }),
      /* @__PURE__ */ jsx4("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No notes saved" }),
      /* @__PURE__ */ jsx4("div", { style: { fontSize: 11.5 }, children: "Capture findings or save any cited chat reply as a reusable Living Note." }),
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
            /* @__PURE__ */ jsx4(Icon, { name: "Plus", size: 13 }),
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
            /* @__PURE__ */ jsx4("div", { className: "sb-src-title", style: { flex: 1 }, title: note.title, children: note.title }),
            /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 2, alignItems: "center" }, onClick: (e) => e.stopPropagation(), children: [
              note.stale ? /* @__PURE__ */ jsx4(
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
              /* @__PURE__ */ jsx4(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon",
                  title: "Promote note to active source",
                  onClick: () => promoteNote(note),
                  children: /* @__PURE__ */ jsx4(Icon, { name: "ArrowUpRight", size: 13 })
                }
              ),
              onSaveMemory ? /* @__PURE__ */ jsx4(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon",
                  title: "Save note insight to Hermes persistent memory",
                  onClick: () => onSaveMemory({ title: note.title, content: note.markdown, citations: note.citations || [] }),
                  children: /* @__PURE__ */ jsx4(Icon, { name: "Brain", size: 12 })
                }
              ) : null,
              /* @__PURE__ */ jsx4(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                  title: "Delete note",
                  onClick: () => deleteNote(note),
                  children: /* @__PURE__ */ jsx4(Icon, { name: "Trash2", size: 13 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx4(
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
    modal === "paste" ? /* @__PURE__ */ jsx4("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitPaste, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx4("span", { children: "Paste text or Markdown" }),
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Title" }),
          /* @__PURE__ */ jsx4(
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
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Content" }),
          /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx4("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !body.trim(), children: busy ? "Indexing..." : "Add source" })
      ] })
    ] }) }) : null,
    modal === "url" ? /* @__PURE__ */ jsx4("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitUrl, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx4("span", { children: "Add web page or YouTube video" }),
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Web or YouTube URL" }),
          /* @__PURE__ */ jsx4(
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
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Optional custom title" }),
          /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx4("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !urlInput.trim(), children: busy ? "Fetching..." : "Ingest URL" })
      ] })
    ] }) }) : null,
    modal === "folder" ? /* @__PURE__ */ jsx4("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitFolder, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx4("span", { children: "Sync local file, folder, vault, or repo" }),
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Absolute path on disk" }),
          /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsx4("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Indexes up to 40 Markdown, code, PDF, DOCX, CSV, and JSON files (skipping .git and node_modules). Refresh any linked file later to flag stale notes and artifacts." })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx4("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !folderPath.trim(), children: busy ? "Syncing..." : "Sync path" })
      ] })
    ] }) }) : null,
    modal === "discover" ? /* @__PURE__ */ jsx4("div", { className: "sb-modal-backdrop", onClick: () => {
      if (!deepRunning) setModal(null);
    }, children: /* @__PURE__ */ jsxs2("div", { className: "sb-modal", style: { width: "min(580px, 94vw)" }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", style: { flexWrap: "wrap", gap: 8 }, children: [
        /* @__PURE__ */ jsxs2("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }, children: [
          /* @__PURE__ */ jsx4("span", { children: "Discover & Deep Research" }),
          /* @__PURE__ */ jsxs2("div", { className: "sb-seg", children: [
            /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": discoverMode === "quick",
                disabled: deepRunning,
                onClick: () => setDiscoverMode("quick"),
                children: "Quick Search"
              }
            ),
            /* @__PURE__ */ jsxs2(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": discoverMode === "deep",
                disabled: deepRunning,
                onClick: () => setDiscoverMode("deep"),
                children: [
                  /* @__PURE__ */ jsx4(Icon, { name: "Compass", size: 11 }),
                  " Deep Research"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", disabled: deepRunning, onClick: () => setModal(null), children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsx4("div", { className: "sb-modal-body", children: discoverMode === "deep" ? /* @__PURE__ */ jsxs2("form", { onSubmit: runDeepResearch, style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Research question or topic" }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              className: "sb-input",
              value: discoverQuery,
              onChange: (e) => setDiscoverQuery(e.target.value),
              placeholder: "e.g. Local-first hybrid RAG retrieval benchmarks vs managed vector DBs",
              disabled: deepRunning,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs2("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Depth" }),
            /* @__PURE__ */ jsx4("div", { className: "sb-seg", children: [
              { id: "quick", label: "Quick (5)" },
              { id: "standard", label: "Standard (10)" },
              { id: "deep", label: "Deep (15)" }
            ].map((opt) => /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": deepDepth === opt.id,
                disabled: deepRunning,
                onClick: () => setDeepDepth(opt.id),
                children: opt.label
              },
              opt.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs2("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ui-text-secondary)", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsx4(
              "input",
              {
                type: "checkbox",
                className: "sb-checkbox",
                checked: deepAutoBrief,
                disabled: deepRunning,
                onChange: (e) => setDeepAutoBrief(e.target.checked)
              }
            ),
            "Auto-synthesize cited Briefing"
          ] })
        ] }),
        /* @__PURE__ */ jsx4("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)", lineHeight: 1.45 }, children: "Hermes expands your topic into complementary sub-queries, discovers & deduplicates primary web sources, ingests them into this notebook automatically, and builds a cited briefing." }),
        deepRunning ? /* @__PURE__ */ jsxs2("div", { className: "sb-dr-progress", children: [
          /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }, children: [
            /* @__PURE__ */ jsxs2("span", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
              /* @__PURE__ */ jsx4(HermesSpinner, { size: 12 }),
              " ",
              deepStage || "Running Deep Research..."
            ] }),
            /* @__PURE__ */ jsxs2("span", { className: "sb-mono", style: { fontSize: 11 }, children: [
              deepPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx4("div", { className: "sb-dr-bar", children: /* @__PURE__ */ jsx4("div", { className: "sb-dr-fill", style: { width: `${Math.max(8, deepPct)}%` } }) })
        ] }) : null,
        deepResult ? /* @__PURE__ */ jsxs2("div", { className: "sb-ledger-row", style: { gap: 8, borderColor: "var(--sb-accent-border)" }, children: [
          /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxs2("strong", { style: { fontSize: 12.5 }, children: [
              "Ingested ",
              deepResult.ingested?.length || 0,
              " source",
              (deepResult.ingested?.length || 0) === 1 ? "" : "s",
              " across ",
              deepResult.queries?.length || 0,
              " queries"
            ] }),
            deepResult.artifact?.id && onOpenArtifact ? /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-primary",
                style: { padding: "3px 9px", fontSize: 11 },
                onClick: () => {
                  setModal(null);
                  onOpenArtifact(deepResult.artifact.id);
                },
                children: "Open Briefing"
              }
            ) : null
          ] }),
          (deepResult.ingested || []).slice(0, 6).map((src) => /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, gap: 8 }, children: [
            /* @__PURE__ */ jsx4("span", { className: "sb-src-title", children: src.title }),
            /* @__PURE__ */ jsx4("span", { className: "sb-mono", style: { color: "var(--ui-accent)", flexShrink: 0 }, children: src.domain })
          ] }, src.id))
        ] }) : null,
        /* @__PURE__ */ jsxs2("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6 }, children: [
          /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", disabled: deepRunning, onClick: () => setModal(null), children: "Close" }),
          /* @__PURE__ */ jsxs2("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: deepRunning || !discoverQuery.trim(), children: [
            deepRunning ? /* @__PURE__ */ jsx4(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx4(Icon, { name: "Compass", size: 12 }),
            " ",
            deepRunning ? "Researching..." : "Start Deep Research"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs2(Fragment2, { children: [
        /* @__PURE__ */ jsxs2("form", { onSubmit: runDiscover, style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ jsx4(
            "input",
            {
              className: "sb-input",
              value: discoverQuery,
              onChange: (e) => setDiscoverQuery(e.target.value),
              placeholder: "Describe a topic to search for primary sources...",
              autoFocus: true
            }
          ),
          /* @__PURE__ */ jsx4("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy || !discoverQuery.trim(), children: busy ? "Searching..." : "Search" })
        ] }),
        discoverResults.length > 0 ? /* @__PURE__ */ jsx4("div", { style: { display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflow: "auto" }, children: discoverResults.map((item) => /* @__PURE__ */ jsxs2(
          "label",
          {
            className: "sb-ledger-row",
            style: { flexDirection: "row", alignItems: "flex-start", gap: 8, cursor: "pointer" },
            children: [
              /* @__PURE__ */ jsx4(
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
                /* @__PURE__ */ jsx4("div", { className: "sb-src-title", children: item.title }),
                /* @__PURE__ */ jsx4("div", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-accent)" }, children: item.domain }),
                item.snippet ? /* @__PURE__ */ jsx4("div", { style: { fontSize: 11.5, color: "var(--ui-text-secondary)", marginTop: 2 }, children: item.snippet }) : null
              ] })
            ]
          },
          item.url
        )) }) : null
      ] }) }),
      discoverMode === "quick" ? /* @__PURE__ */ jsxs2("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Close" }),
        discoverResults.length > 0 ? /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-primary",
            disabled: busy || !discoverResults.some((r) => discoverChecked[r.url]),
            onClick: importDiscovered,
            children: busy ? "Importing..." : `Import selected (${discoverResults.filter((r) => discoverChecked[r.url]).length})`
          }
        ) : null
      ] }) : null
    ] }) }) : null,
    modal === "note" || modal && typeof modal === "object" ? /* @__PURE__ */ jsx4("div", { className: "sb-modal-backdrop", onClick: () => setModal(null), children: /* @__PURE__ */ jsxs2("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: submitNote, children: [
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx4("span", { children: typeof modal === "object" ? "Edit note" : "New research note" }),
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setModal(null), children: /* @__PURE__ */ jsx4(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "sb-modal-body", children: [
        /* @__PURE__ */ jsxs2("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Title" }),
          /* @__PURE__ */ jsx4(
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
          /* @__PURE__ */ jsx4("span", { className: "sb-label", children: "Markdown" }),
          /* @__PURE__ */ jsx4(
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
        /* @__PURE__ */ jsx4("button", { type: "button", className: "sb-btn", onClick: () => setModal(null), children: "Cancel" }),
        /* @__PURE__ */ jsx4("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: busy, children: busy ? "Saving..." : "Save note" })
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/components/SourceInspector.jsx
import { useEffect as useEffect3, useRef as useRef3, useState as useState2 } from "react";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
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
    (part, idx) => part.toLowerCase() === q.toLowerCase() ? /* @__PURE__ */ jsx5("mark", { className: "sb-mark", children: part }, idx) : part
  );
}
function SourceInspector({ nbId, target, onClose, onPromoteQuote, onSaveMemory }) {
  const [data, setData] = useState2(null);
  const [loading, setLoading] = useState2(false);
  const [filter, setFilter] = useState2("");
  const [error, setError] = useState2("");
  const [analysis, setAnalysis] = useState2(null);
  const [analyzing, setAnalyzing] = useState2(false);
  const [pdfPage, setPdfPage] = useState2(1);
  const [pdfPreview, setPdfPreview] = useState2(null);
  const [loadingPreview, setLoadingPreview] = useState2(false);
  const [zoomOpen, setZoomOpen] = useState2(false);
  const hitRef = useRef3(null);
  const sourceId = target?.sourceId || (target?.chunkId ? String(target.chunkId).split(":")[0] : null);
  const focusChunkId = target?.chunkId || null;
  const highlightText = target?.highlight || "";
  useEffect3(() => {
    if (!nbId || !sourceId) return;
    let alive = true;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setPdfPreview(null);
    setZoomOpen(false);
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/text`).then((res) => {
      if (!alive) return;
      setData(res);
      const chunks2 = res?.chunks || [];
      const hit = focusChunkId ? chunks2.find((c) => c.id === focusChunkId) : chunks2[0];
      setPdfPage(Math.max(1, Number(hit?.page_start) || 1));
    }).catch((err) => {
      if (alive) setError(err.message || "Could not load source text.");
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [nbId, sourceId, focusChunkId]);
  const srcMeta = data?.source || {};
  const chunks = data?.chunks || [];
  const focusedChunk = focusChunkId ? chunks.find((c) => c.id === focusChunkId) : chunks[0];
  useEffect3(() => {
    if (!nbId || !sourceId || !srcMeta.has_pdf_preview) {
      setPdfPreview(null);
      return void 0;
    }
    let alive = true;
    setLoadingPreview(true);
    const querySeed = highlightText || (focusedChunk && Number(focusedChunk.page_start || 1) === pdfPage ? String(focusedChunk.text || "").replace(/<!--\s*[pt]:\d+\s*-->\n?/g, "").slice(0, 260) : "");
    const qs = new URLSearchParams({ page: String(pdfPage), ...querySeed ? { q: querySeed } : {} });
    api(`/notebooks/${encodeURIComponent(nbId)}/sources/${encodeURIComponent(sourceId)}/page-preview?${qs.toString()}`).then((res) => {
      if (alive && res?.available && res?.b64) {
        setPdfPreview(res);
      } else if (alive) {
        setPdfPreview(null);
      }
    }).catch(() => {
      if (alive) setPdfPreview(null);
    }).finally(() => {
      if (alive) setLoadingPreview(false);
    });
    return () => {
      alive = false;
    };
  }, [nbId, sourceId, srcMeta.has_pdf_preview, pdfPage, focusChunkId, highlightText]);
  useEffect3(() => {
    if (hitRef.current) {
      hitRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [data, focusChunkId]);
  if (!target || !sourceId) return null;
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
  const q = filter.trim().toLowerCase();
  const visible = q ? chunks.filter((c) => (c.text || "").toLowerCase().includes(q) || (c.heading || "").toLowerCase().includes(q)) : chunks;
  const previewSrc = pdfPreview?.b64 ? `data:${pdfPreview.mime || "image/png"};base64,${pdfPreview.b64}` : "";
  const totalPages = pdfPreview?.total_pages || srcMeta.pages || 1;
  return /* @__PURE__ */ jsxs3("section", { className: "sb-inspector", "aria-label": "Passage Inspector", children: [
    /* @__PURE__ */ jsxs3("div", { className: "sb-pane-head", children: [
      /* @__PURE__ */ jsxs3("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsx5("div", { className: "sb-pane-title", children: "Passage Inspector" }),
        /* @__PURE__ */ jsx5("div", { className: "sb-src-title", style: { marginTop: 2 }, title: srcMeta.title || sourceId, children: srcMeta.title || sourceId })
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
              /* @__PURE__ */ jsx5(Icon, { name: "BarChart3", size: 12 }),
              " ",
              analyzing ? "Profiling..." : analysis ? "Hide stats" : "Analyze data"
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx5("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: onClose, "aria-label": "Close inspector", children: /* @__PURE__ */ jsx5(Icon, { name: "X", size: 15 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx5("div", { style: { padding: "8px 12px", borderBottom: "1px solid var(--ui-stroke-tertiary)", display: "flex", gap: 6 }, children: /* @__PURE__ */ jsx5(
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
      loading ? /* @__PURE__ */ jsx5("div", { className: "sb-empty", children: "Loading passages..." }) : null,
      error ? /* @__PURE__ */ jsx5("div", { className: "sb-error-bar", style: { margin: 0 }, children: error }) : null,
      srcMeta.has_pdf_preview ? /* @__PURE__ */ jsxs3("div", { className: "sb-pdf-preview-card", children: [
        /* @__PURE__ */ jsxs3("div", { className: "sb-pdf-preview-head", style: { flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx5(Icon, { name: "FileText", size: 12, style: { color: "var(--ui-accent)" } }),
            /* @__PURE__ */ jsx5("strong", { style: { color: "var(--ui-text-primary)" }, children: "PDF Page Preview" }),
            pdfPreview?.highlighted ? /* @__PURE__ */ jsx5("span", { className: "sb-verdict", "data-v": "supported", style: { fontSize: 10, padding: "1px 5px" }, children: "Highlighted" }) : null
          ] }),
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost sb-btn-icon",
                disabled: pdfPage <= 1 || loadingPreview,
                onClick: () => setPdfPage((p) => Math.max(1, p - 1)),
                title: "Previous page",
                children: /* @__PURE__ */ jsx5(Icon, { name: "ChevronLeft", size: 12 })
              }
            ),
            /* @__PURE__ */ jsxs3("span", { className: "sb-mono", style: { fontSize: 11, color: "var(--ui-text-secondary)", padding: "0 3px" }, children: [
              pdfPage,
              " / ",
              totalPages
            ] }),
            /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost sb-btn-icon",
                disabled: pdfPage >= totalPages || loadingPreview,
                onClick: () => setPdfPage((p) => Math.min(totalPages, p + 1)),
                title: "Next page",
                children: /* @__PURE__ */ jsx5(Icon, { name: "ChevronRight", size: 12 })
              }
            ),
            previewSrc ? /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost sb-btn-icon",
                onClick: () => setZoomOpen(true),
                title: "Expand full page preview",
                children: /* @__PURE__ */ jsx5(Icon, { name: "ZoomIn", size: 12 })
              }
            ) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx5(
          "div",
          {
            className: "sb-pdf-preview-stage",
            onClick: () => {
              if (previewSrc) setZoomOpen(true);
            },
            children: loadingPreview && !previewSrc ? /* @__PURE__ */ jsxs3("div", { style: { padding: 24, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
              /* @__PURE__ */ jsx5(HermesSpinner, { size: 12 }),
              " Rendering page ",
              pdfPage,
              "..."
            ] }) : previewSrc ? /* @__PURE__ */ jsx5("img", { src: previewSrc, alt: `${srcMeta.title} page ${pdfPage}`, className: "sb-pdf-preview-img" }) : /* @__PURE__ */ jsx5("div", { style: { padding: 14, fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Page preview unavailable." })
          }
        )
      ] }) : null,
      analysis ? /* @__PURE__ */ jsxs3("div", { className: "sb-ledger-row", style: { gap: 10, borderColor: "var(--sb-accent-border)" }, children: [
        /* @__PURE__ */ jsxs3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxs3("strong", { style: { fontSize: 12.5 }, children: [
            "Data Profile (",
            analysis.row_count,
            " rows, ",
            analysis.column_count,
            " cols)"
          ] }),
          (analysis.numeric_columns || []).length > 1 ? /* @__PURE__ */ jsx5(
            "select",
            {
              className: "sb-select",
              value: analysis.chart?.metric || "",
              onChange: (e) => runAnalyze(e.target.value),
              "aria-label": "Chart metric column",
              children: analysis.numeric_columns.map((c) => /* @__PURE__ */ jsx5("option", { value: c, children: c }, c))
            }
          ) : null
        ] }),
        analysis.chart?.series?.length ? /* @__PURE__ */ jsxs3("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: [
          /* @__PURE__ */ jsx5("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: analysis.chart.title }),
          analysis.chart.series.slice(0, 10).map((pt, idx) => {
            const pct = Math.max(4, Math.round(Math.abs(pt.value) / (analysis.chart.max_value || 1) * 100));
            return /* @__PURE__ */ jsxs3("div", { style: { display: "grid", gridTemplateColumns: "minmax(72px, 0.38fr) 1fr auto", alignItems: "center", gap: 8, fontSize: 11.5 }, children: [
              /* @__PURE__ */ jsx5("span", { className: "sb-src-title", title: pt.label, children: pt.label }),
              /* @__PURE__ */ jsx5("div", { className: "sb-src-bar", style: { height: 8, marginTop: 0 }, children: /* @__PURE__ */ jsx5("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) }),
              /* @__PURE__ */ jsx5("span", { className: "sb-mono", style: { textAlign: "right", color: "var(--ui-text-secondary)" }, children: pt.value })
            ] }, idx);
          })
        ] }) : null,
        /* @__PURE__ */ jsx5("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: 6 }, children: (analysis.profiles || []).filter((p) => p.type === "number").slice(0, 4).map((p) => /* @__PURE__ */ jsxs3("div", { className: "sb-kpi", style: { padding: "7px 9px" }, children: [
          /* @__PURE__ */ jsx5("div", { className: "sb-kpi-label", children: p.column }),
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
      !loading && !error && visible.length === 0 ? /* @__PURE__ */ jsx5("div", { className: "sb-empty", children: "No matching passages." }) : null,
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
                  /* @__PURE__ */ jsx5("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-accent)", fontWeight: 600 }, children: ch.id }),
                  ch.page_start > 1 || srcMeta.pages > 1 ? /* @__PURE__ */ jsxs3(
                    "button",
                    {
                      type: "button",
                      className: "sb-kind-tag",
                      style: { cursor: srcMeta.has_pdf_preview ? "pointer" : "default", border: "1px solid var(--ui-stroke-tertiary)" },
                      onClick: () => {
                        if (srcMeta.has_pdf_preview) setPdfPage(Math.max(1, Number(ch.page_start) || 1));
                      },
                      title: srcMeta.has_pdf_preview ? `Jump PDF preview to page ${ch.page_start}` : void 0,
                      children: [
                        "p.",
                        ch.page_start
                      ]
                    }
                  ) : null,
                  ytHref ? /* @__PURE__ */ jsx5("a", { href: ytHref, target: "_blank", rel: "noopener noreferrer", className: "sb-kind-tag sb-link", title: "Open video at timestamp", children: fmtTime(ch.timestamp_sec) }) : null,
                  ch.heading ? /* @__PURE__ */ jsx5("span", { className: "sb-src-title", style: { fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: ch.heading }) : null
                ] }),
                /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: 3 }, children: [
                  /* @__PURE__ */ jsx5(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Copy passage",
                      onClick: () => copyText(cleanText),
                      children: /* @__PURE__ */ jsx5(Icon, { name: "Copy", size: 12 })
                    }
                  ),
                  onPromoteQuote ? /* @__PURE__ */ jsx5(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Save passage as note",
                      onClick: () => onPromoteQuote(ch, srcMeta.title || sourceId),
                      children: /* @__PURE__ */ jsx5(Icon, { name: "BookmarkPlus", size: 12 })
                    }
                  ) : null,
                  onSaveMemory ? /* @__PURE__ */ jsx5(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Save verified excerpt to Hermes persistent memory",
                      onClick: () => onSaveMemory({ title: ch.heading || srcMeta.title || sourceId, content: cleanText.slice(0, 320), citations: [ch.id] }),
                      children: /* @__PURE__ */ jsx5(Icon, { name: "Brain", size: 12 })
                    }
                  ) : null
                ] })
              ] }),
              /* @__PURE__ */ jsx5("div", { style: { fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap", color: "var(--ui-text-primary)" }, children: highlightMatch(cleanText, filter.trim() || (isHit ? highlightText : "")) })
            ]
          },
          ch.id
        );
      })
    ] }),
    zoomOpen && previewSrc ? /* @__PURE__ */ jsx5("div", { className: "sb-modal-backdrop", style: { zIndex: 90, padding: 20 }, onClick: () => setZoomOpen(false), children: /* @__PURE__ */ jsxs3(
      "div",
      {
        className: "sb-modal",
        style: { width: "min(920px, 95vw)", maxHeight: "92vh" },
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs3("div", { className: "sb-modal-head", children: [
            /* @__PURE__ */ jsxs3("span", { children: [
              srcMeta.title,
              " \xB7 Page ",
              pdfPage,
              " / ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx5("button", { type: "button", className: "sb-btn", disabled: pdfPage <= 1, onClick: () => setPdfPage((p) => Math.max(1, p - 1)), children: "Prev" }),
              /* @__PURE__ */ jsx5("button", { type: "button", className: "sb-btn", disabled: pdfPage >= totalPages, onClick: () => setPdfPage((p) => Math.min(totalPages, p + 1)), children: "Next" }),
              /* @__PURE__ */ jsx5("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setZoomOpen(false), children: /* @__PURE__ */ jsx5(Icon, { name: "X", size: 14 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx5("div", { className: "sb-modal-body sb-scroll", style: { maxHeight: "80vh", alignItems: "center" }, children: /* @__PURE__ */ jsx5("img", { src: previewSrc, alt: `${srcMeta.title} page ${pdfPage}`, style: { maxWidth: "100%", borderRadius: 8, background: "#fff" } }) })
        ]
      }
    ) }) : null
  ] });
}

// desktop-src/components/ChatPanel.jsx
import { useEffect as useEffect4, useRef as useRef4, useState as useState3 } from "react";

// desktop-src/components/MarkdownBody.jsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var CITE_SPLIT_RE = /(\[\[c:[a-zA-Z0-9_-]+:\d+\]\])/g;
var CITE_EXTRACT_RE = /^\[\[c:([a-zA-Z0-9_-]+:\d+)\]\]$/;
var INLINE_TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
function renderInlineFormatted(str, keyPrefix) {
  const parts = String(str || "").split(INLINE_TOKEN_RE);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return /* @__PURE__ */ jsx6("code", { className: "sb-inline-code", children: part.slice(1, -1) }, `${keyPrefix}-c-${idx}`);
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return /* @__PURE__ */ jsx6("strong", { children: part.slice(2, -2) }, `${keyPrefix}-b-${idx}`);
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      return /* @__PURE__ */ jsx6("em", { children: part.slice(1, -1) }, `${keyPrefix}-i-${idx}`);
    }
    const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
    if (linkMatch) {
      return /* @__PURE__ */ jsx6(
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
      return /* @__PURE__ */ jsx6(
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
            /* @__PURE__ */ jsx6("span", { className: "sb-mono", children: lang || "code" }),
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
                  /* @__PURE__ */ jsx6(Icon, { name: "Copy", size: 11 }),
                  " Copy"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx6("pre", { className: "sb-mono sb-code-pre", children: codeText })
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
        /* @__PURE__ */ jsx6("div", { className: "sb-table-wrap sb-scroll", style: { margin: "6px 0" }, children: /* @__PURE__ */ jsxs4("table", { className: "sb-table", children: [
          /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsx6("tr", { children: headers.map((h, hIdx) => /* @__PURE__ */ jsx6("th", { style: { cursor: "default" }, children: renderInlineCited(h, citeIndexMap, onOpenChunk) }, hIdx)) }) }),
          /* @__PURE__ */ jsx6("tbody", { children: rows.map((r, rIdx) => /* @__PURE__ */ jsx6("tr", { children: headers.map((_, cIdx) => /* @__PURE__ */ jsx6("td", { children: renderInlineCited(r[cIdx] || "", citeIndexMap, onOpenChunk) }, cIdx)) }, rIdx)) })
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
        /* @__PURE__ */ jsx6("blockquote", { className: "sb-quote-box", style: { margin: "6px 0" }, children: renderInlineCited(qLines.join(" "), citeIndexMap, onOpenChunk) }, `bq-${i}`)
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
        /* @__PURE__ */ jsx6("ul", { children: items.map((item, idx) => /* @__PURE__ */ jsx6("li", { children: renderInlineCited(item, citeIndexMap, onOpenChunk) }, idx)) }, `ul-${i}`)
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
        /* @__PURE__ */ jsx6("ol", { style: { margin: "4px 0", paddingLeft: 20 }, children: items.map((item, idx) => /* @__PURE__ */ jsx6("li", { children: renderInlineCited(item, citeIndexMap, onOpenChunk) }, idx)) }, `ol-${i}`)
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(/* @__PURE__ */ jsx6("h3", { children: renderInlineCited(trimmed.slice(4), citeIndexMap, onOpenChunk) }, `h3-${i}`));
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(/* @__PURE__ */ jsx6("h2", { children: renderInlineCited(trimmed.slice(3), citeIndexMap, onOpenChunk) }, `h2-${i}`));
      i += 1;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(/* @__PURE__ */ jsx6("h2", { style: { fontSize: 16 }, children: renderInlineCited(trimmed.slice(2), citeIndexMap, onOpenChunk) }, `h1-${i}`));
      i += 1;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("```") && !lines[i].trim().startsWith("~~~") && !lines[i].trim().startsWith(">") && !/^[-*+]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !isTableRow(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(/* @__PURE__ */ jsx6("p", { children: renderInlineCited(para.join(" "), citeIndexMap, onOpenChunk) }, `p-${i}`));
  }
  return /* @__PURE__ */ jsx6("div", { className: "sb-msg-body", children: blocks });
}

// desktop-src/components/ChatPanel.jsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
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
  onSaveMemory,
  onRefresh,
  onError
}) {
  const [input, setInput] = useState3("");
  const [asking, setAsking] = useState3(false);
  const [stage, setStage] = useState3("");
  const [partialText, setPartialText] = useState3("");
  const [briefingBusy, setBriefingBusy] = useState3(false);
  const [claimFilter, setClaimFilter] = useState3("all");
  const endRef = useRef4(null);
  const cancelPollRef = useRef4(null);
  const activeJobRef = useRef4("");
  const enabledSources = sources.filter((s) => s.enabled);
  useEffect4(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect4(() => {
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
  useEffect4(() => {
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
              /* @__PURE__ */ jsx7(Icon, { name: "MessageSquare", size: 12 }),
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
              /* @__PURE__ */ jsx7(Icon, { name: "ShieldCheck", size: 12 }),
              " Claim Ledger",
              " ",
              /* @__PURE__ */ jsx7("span", { className: "sb-num", style: { opacity: 0.7 }, children: claims.length + conflicts.length })
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
              /* @__PURE__ */ jsx7(Icon, { name: "BarChart3", size: 12 }),
              " Coverage Map"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx7("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: centerTab === "chat" && messages.length > 0 ? /* @__PURE__ */ jsx7("button", { type: "button", className: "sb-btn sb-btn-ghost", onClick: clearChat, children: "Clear" }) : null })
    ] }),
    centerTab === "chat" ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
      /* @__PURE__ */ jsx7("div", { className: "sb-chat-stream sb-scroll", children: /* @__PURE__ */ jsxs5("div", { className: "sb-chat-track", children: [
        sources.length > 0 ? /* @__PURE__ */ jsxs5("section", { className: "sb-briefing", style: { position: "relative", overflow: "hidden" }, children: [
          /* @__PURE__ */ jsx7(
            DitherCanvas,
            {
              variant: "aurora",
              animated: briefingBusy,
              opacity: 0.18,
              cols: 136,
              rows: 22,
              style: { position: "absolute", inset: "0 0 auto 0", width: "100%", height: 68, pointerEvents: "none" }
            }
          ),
          /* @__PURE__ */ jsxs5("div", { className: "sb-briefing-head", style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxs5("span", { className: "sb-briefing-title", children: [
              /* @__PURE__ */ jsx7(Icon, { name: "BookOpen", size: 14 }),
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
                  briefingBusy ? /* @__PURE__ */ jsx7(HermesSpinner, { size: 11 }) : /* @__PURE__ */ jsx7(Icon, { name: "RefreshCw", size: 12 }),
                  " ",
                  briefingBusy ? "Updating..." : guide ? "Refresh" : "Generate briefing"
                ]
              }
            )
          ] }),
          guide?.overview ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
            /* @__PURE__ */ jsx7("p", { className: "sb-briefing-text", children: guide.overview }),
            guide.topics?.length ? /* @__PURE__ */ jsx7("div", { className: "sb-chips", children: guide.topics.map((t, idx) => /* @__PURE__ */ jsx7("span", { className: "sb-kind-tag", style: { textTransform: "none", padding: "2px 7px" }, children: t }, idx)) }) : null,
            guide.suggested_questions?.length ? /* @__PURE__ */ jsx7("div", { className: "sb-chips", children: guide.suggested_questions.map((sq, idx) => /* @__PURE__ */ jsx7("button", { type: "button", className: "sb-chip-q", onClick: () => sendQuestion(sq), children: sq }, idx)) }) : null
          ] }) : /* @__PURE__ */ jsxs5("p", { className: "sb-briefing-text", children: [
            enabledSources.length,
            " active source",
            enabledSources.length === 1 ? "" : "s",
            " indexed. Generate a briefing for starter questions or ask directly below."
          ] })
        ] }) : null,
        messages.length === 0 && sources.length === 0 ? /* @__PURE__ */ jsxs5("div", { className: "sb-empty", style: { marginTop: 48 }, children: [
          /* @__PURE__ */ jsx7(Icon, { name: "Library", size: 26 }),
          /* @__PURE__ */ jsx7("div", { style: { fontWeight: 650, fontSize: 14, color: "var(--ui-text-primary)" }, children: "Add sources to begin" }),
          /* @__PURE__ */ jsx7("div", { style: { maxWidth: 400, fontSize: 12.5 }, children: "Upload PDFs, DOCX, Markdown, CSVs, audio, YouTube links, or sync a local folder in the left rail. Every reply links inline citations back to the exact passage." })
        ] }) : null,
        messages.map((msg) => {
          if (msg.role === "user") {
            return /* @__PURE__ */ jsx7("div", { className: "sb-msg sb-msg-user", children: msg.content }, msg.id);
          }
          const citeIndex = /* @__PURE__ */ new Map();
          (msg.citations || []).forEach((cid, i) => citeIndex.set(cid, i + 1));
          const gr = msg.grounding || {};
          const sup = gr.claims_supported ?? (msg.claims || []).filter((c) => c.verdict === "supported").length;
          const unsup = gr.claims_unsupported ?? (msg.claims || []).filter((c) => c.verdict === "unsupported").length;
          return /* @__PURE__ */ jsxs5("article", { className: "sb-msg sb-msg-assistant", children: [
            /* @__PURE__ */ jsx7(MarkdownBody, { text: msg.content, citeIndexMap: citeIndex, onOpenChunk }),
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
                  /* @__PURE__ */ jsx7("span", { className: "sb-num", children: sup }),
                  " verified"
                ] }) : null,
                unsup > 0 ? /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "unsupported", children: [
                  /* @__PURE__ */ jsx7("span", { className: "sb-num", children: unsup }),
                  " uncited"
                ] }) : null,
                gr.model ? /* @__PURE__ */ jsx7("span", { className: "sb-kind-tag", style: { textTransform: "none" }, title: `Answered by ${gr.provider ? `${gr.provider} / ` : ""}${gr.model}`, children: gr.model }) : gr.mode === "extractive" ? /* @__PURE__ */ jsx7("span", { className: "sb-kind-tag", title: "Generated locally from indexed chunks without an external model call", children: "Local extractive" }) : null
              ] }),
              /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxs5(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    onClick: () => copyText(msg.content),
                    children: [
                      /* @__PURE__ */ jsx7(Icon, { name: "Copy", size: 12 }),
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
                      /* @__PURE__ */ jsx7(Icon, { name: "BookmarkPlus", size: 12 }),
                      " Save note"
                    ]
                  }
                ),
                onSaveMemory ? /* @__PURE__ */ jsxs5(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    onClick: () => onSaveMemory({
                      title: (msg.content || "").split("\n")[0].replace(/\[\[c:[^\]]+\]\]/g, "").trim().slice(0, 56),
                      content: msg.content || "",
                      citations: msg.citations || []
                    }),
                    title: "Save this verified answer into Hermes persistent memory",
                    children: [
                      /* @__PURE__ */ jsx7(Icon, { name: "Brain", size: 12 }),
                      " Memory"
                    ]
                  }
                ) : null
              ] })
            ] })
          ] }, msg.id);
        }),
        asking ? /* @__PURE__ */ jsxs5("div", { className: "sb-msg sb-msg-assistant", "aria-busy": "true", children: [
          partialText ? /* @__PURE__ */ jsx7(MarkdownBody, { text: partialText, citeIndexMap: /* @__PURE__ */ new Map(), onOpenChunk }) : null,
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--ui-text-secondary)", fontSize: 12 }, children: [
            /* @__PURE__ */ jsx7(Icon, { name: "Search", size: 13 }),
            " ",
            stage || "Searching active sources..."
          ] })
        ] }) : null,
        /* @__PURE__ */ jsx7("div", { ref: endRef })
      ] }) }),
      /* @__PURE__ */ jsx7("div", { className: "sb-composer-wrap", children: /* @__PURE__ */ jsxs5("div", { className: "sb-composer", children: [
        /* @__PURE__ */ jsx7(
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
              /* @__PURE__ */ jsx7("span", { className: "sb-num", children: enabledSources.length }),
              "/",
              sources.length,
              " active"
            ] }),
            notebook ? /* @__PURE__ */ jsxs5(Fragment3, { children: [
              /* @__PURE__ */ jsx7(
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
              /* @__PURE__ */ jsx7(
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
              style: { marginLeft: "auto" },
              disabled: asking || !input.trim() || enabledSources.length === 0,
              onClick: () => sendQuestion(),
              children: [
                /* @__PURE__ */ jsx7(Icon, { name: "ArrowUp", size: 13 }),
                " Ask"
              ]
            }
          )
        ] })
      ] }) })
    ] }) : null,
    centerTab === "claims" ? /* @__PURE__ */ jsx7("div", { className: "sb-panel-pad sb-scroll", style: { flex: 1 }, children: /* @__PURE__ */ jsxs5("div", { className: "sb-panel-track", children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-strip sb-kpi-strip-4", children: [
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Verified" }),
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-val", style: { color: "var(--sb-ok)" }, children: supportedCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Partial" }),
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-val", style: { color: "var(--sb-warn)" }, children: partialCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Uncited" }),
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-val", style: { color: unsupportedCount > 0 ? "var(--sb-bad)" : "var(--ui-text-primary)" }, children: unsupportedCount })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Conflicts" }),
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-val", style: { color: conflicts.length > 0 ? "var(--sb-warn)" : "var(--ui-text-primary)" }, children: conflicts.length })
        ] })
      ] }),
      conflicts.length > 0 ? /* @__PURE__ */ jsxs5("section", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }, children: [
          /* @__PURE__ */ jsxs5("span", { className: "sb-pane-title", children: [
            "Cross-Source Contradictions (",
            conflicts.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx7("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Detected automatically across active sources" })
        ] }),
        conflicts.map((cf) => /* @__PURE__ */ jsxs5("article", { className: "sb-conflict-card", children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }, children: [
            /* @__PURE__ */ jsx7("strong", { style: { fontSize: 12.5 }, children: cf.topic }),
            /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "partial", children: [
              cf.kind,
              " conflict"
            ] })
          ] }),
          /* @__PURE__ */ jsx7("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: cf.summary }),
          /* @__PURE__ */ jsx7("div", { className: "sb-conflict-sides", children: [cf.side_a, cf.side_b].map((side, idx) => /* @__PURE__ */ jsxs5("div", { className: "sb-quote-box", style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx7("span", { className: "sb-src-title", style: { fontSize: 11.5 }, children: side.source_title }),
              /* @__PURE__ */ jsx7(
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
        /* @__PURE__ */ jsx7("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Multi-source consensus:" }),
        consensus.slice(0, 4).map((co, idx) => /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": "supported", children: [
          co.topic,
          ": ",
          co.value,
          " (",
          co.sources.length,
          " sources)"
        ] }, idx))
      ] }) : null,
      /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }, children: [
        /* @__PURE__ */ jsx7("div", { className: "sb-seg", style: { flexWrap: "wrap" }, children: ["all", "supported", "partial", "unsupported"].map((f) => /* @__PURE__ */ jsx7(
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
        /* @__PURE__ */ jsx7("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Click any citation to inspect highlighted evidence" })
      ] }),
      filteredClaims.length === 0 ? /* @__PURE__ */ jsxs5("div", { className: "sb-empty", children: [
        /* @__PURE__ */ jsx7(Icon, { name: "ShieldCheck", size: 24 }),
        /* @__PURE__ */ jsx7("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No chat claims recorded yet" }),
        /* @__PURE__ */ jsx7("div", { style: { fontSize: 12 }, children: "Ask a grounded question to populate the Claim Ledger with verifiable evidence." })
      ] }) : filteredClaims.map((cl) => /* @__PURE__ */ jsxs5("article", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }, children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs5("span", { className: "sb-verdict", "data-v": cl.verdict, children: [
              cl.verdict,
              " ",
              typeof cl.overlap === "number" ? `(${Math.round(cl.overlap * 100)}%)` : ""
            ] }),
            cl.numeric_mismatch ? /* @__PURE__ */ jsx7("span", { className: "sb-verdict", "data-v": "unsupported", children: "number mismatch" }) : null
          ] }),
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }, children: [
            cl.source_title ? /* @__PURE__ */ jsx7("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: cl.source_title }) : null,
            (cl.citations || []).map((cid) => /* @__PURE__ */ jsx7(
              "button",
              {
                type: "button",
                className: "sb-cite",
                onClick: () => onOpenSource?.({ sourceId: String(cid).split(":")[0], chunkId: cid, highlight: (cl.quote || "").slice(0, 48) }),
                children: cid.split(":")[1] || cid
              },
              cid
            )),
            onSaveMemory && cl.verdict === "supported" ? /* @__PURE__ */ jsx7(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-ghost sb-btn-icon",
                title: "Promote verified claim to Hermes Memory",
                onClick: () => onSaveMemory({ title: cl.source_title || "", content: cl.text, citations: cl.citations || [] }),
                children: /* @__PURE__ */ jsx7(Icon, { name: "Brain", size: 12 })
              }
            ) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx7("div", { style: { fontSize: 12.5, color: "var(--ui-text-primary)" }, children: cl.text }),
        cl.quote ? /* @__PURE__ */ jsx7("div", { className: "sb-quote-box", children: cl.quote }) : null
      ] }, cl.id))
    ] }) }) : null,
    centerTab === "coverage" ? /* @__PURE__ */ jsx7("div", { className: "sb-panel-pad sb-scroll", style: { flex: 1 }, children: /* @__PURE__ */ jsxs5("div", { className: "sb-panel-track", children: [
      /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-strip", children: [
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Corpus coverage" }),
          /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-val", children: [
            coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Interrogated chunks" }),
          /* @__PURE__ */ jsxs5("div", { className: "sb-kpi-val", children: [
            coverage?.touched_chunks || 0,
            " / ",
            coverage?.total_chunks || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxs5("div", { className: "sb-kpi", children: [
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-label", children: "Blind spots" }),
          /* @__PURE__ */ jsx7("div", { className: "sb-kpi-val", children: Math.max(0, (coverage?.total_chunks || 0) - (coverage?.touched_chunks || 0)) })
        ] })
      ] }),
      (coverage?.sources || []).length === 0 ? /* @__PURE__ */ jsx7("div", { className: "sb-empty", children: "Add sources to measure how thoroughly you have explored your corpus." }) : (coverage?.sources || []).map((item) => {
        const pct = item.total_chunks > 0 ? Math.round(item.touched_chunks / item.total_chunks * 100) : 0;
        return /* @__PURE__ */ jsxs5("article", { className: "sb-ledger-row", children: [
          /* @__PURE__ */ jsxs5("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }, children: [
            /* @__PURE__ */ jsxs5("div", { style: { minWidth: 0, flex: "1 1 160px" }, children: [
              /* @__PURE__ */ jsx7("div", { className: "sb-src-title", children: item.title }),
              /* @__PURE__ */ jsxs5("div", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
                /* @__PURE__ */ jsx7("span", { className: "sb-num", children: item.touched_chunks }),
                " of ",
                /* @__PURE__ */ jsx7("span", { className: "sb-num", children: item.total_chunks }),
                " passages cited"
              ] })
            ] }),
            /* @__PURE__ */ jsxs5("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs5("span", { className: "sb-mono", style: { fontSize: 12, fontWeight: 600 }, children: [
                pct,
                "%"
              ] }),
              /* @__PURE__ */ jsx7(
                "button",
                {
                  type: "button",
                  className: "sb-btn",
                  onClick: () => onOpenSource?.({ sourceId: item.source_id, chunkId: null }),
                  children: "Inspect"
                }
              ),
              pct < 100 ? /* @__PURE__ */ jsx7(
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
          /* @__PURE__ */ jsx7("div", { className: "sb-src-bar", style: { height: 5 }, children: /* @__PURE__ */ jsx7("div", { className: "sb-src-bar-fill", style: { width: `${pct}%` } }) })
        ] }, item.source_id);
      })
    ] }) }) : null
  ] });
}

// desktop-src/components/StudioPanel.jsx
import { useEffect as useEffect10, useRef as useRef9, useState as useState12 } from "react";

// desktop-src/components/SlideDeckModal.jsx
import { useEffect as useEffect5, useState as useState4 } from "react";
import { Fragment as Fragment4, jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var DECK_PURPOSES = [
  { id: "auto", label: "Auto" },
  { id: "pitch", label: "Pitch Deck" },
  { id: "executive", label: "Executive Brief" },
  { id: "technical", label: "Technical" },
  { id: "editorial", label: "Keynote" },
  { id: "workshop", label: "Workshop" }
];
var DECK_LENGTHS = [
  { id: "short", label: "Short", count: 6 },
  { id: "default", label: "Default", count: 10 },
  { id: "extended", label: "Extended", count: 14 }
];
var DECK_THEMES = [
  { id: "keynote", label: "Keynote" },
  { id: "editorial", label: "Editorial" },
  { id: "midnight", label: "Midnight" },
  { id: "paper", label: "Paper" }
];
var LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Portuguese", "Chinese", "Korean", "Italian"];
var SLIDE_LAYOUTS = ["title", "stat", "bento", "comparison", "timeline", "two-col", "bullets", "quote", "image-left", "image-full", "closing"];
function SlideDeckModal({
  open,
  nbId,
  sources,
  capabilities,
  initialFocus,
  initialArtifact,
  mode = "create",
  onClose,
  onGenerate,
  onRevise
}) {
  const enabledSources = (sources || []).filter((s) => s.enabled !== false);
  const [deckFormat, setDeckFormat] = useState4("detailed");
  const [deckPurpose, setDeckPurpose] = useState4("auto");
  const [theme, setTheme] = useState4("keynote");
  const [language, setLanguage] = useState4("English");
  const [lengthKey, setLengthKey] = useState4("default");
  const [selectedSourceIds, setSelectedSourceIds] = useState4([]);
  const [sourcePickerOpen, setSourcePickerOpen] = useState4(false);
  const [instructions, setInstructions] = useState4("");
  const [useImageGen, setUseImageGen] = useState4(false);
  const [imageMode, setImageMode] = useState4("full_slide");
  const [reviewOutline, setReviewOutline] = useState4(false);
  const [step, setStep] = useState4("config");
  const [loadingOutline, setLoadingOutline] = useState4(false);
  const [outlineSlides, setOutlineSlides] = useState4([]);
  const [outlineTitle, setOutlineTitle] = useState4("");
  const [outlineError, setOutlineError] = useState4("");
  useEffect5(() => {
    if (!open) return;
    setStep("config");
    setOutlineError("");
    setSourcePickerOpen(false);
    const p = initialArtifact?.params || {};
    setDeckFormat(p.deck_format || "detailed");
    setDeckPurpose(p.deck_purpose || "auto");
    setTheme(initialArtifact?.spec?.theme || p.theme || "keynote");
    setLanguage(p.language || "English");
    const cnt = Number(p.count) || 10;
    setLengthKey(cnt <= 6 ? "short" : cnt >= 13 ? "extended" : "default");
    setInstructions(mode === "revise" ? "" : p.instructions || initialFocus || "");
    const hasImgCap = Boolean(capabilities?.image_generate);
    setUseImageGen(p.include_images !== void 0 ? Boolean(p.include_images) : hasImgCap);
    setImageMode(p.image_mode || "full_slide");
    setReviewOutline(false);
    const baseSrcIds = Array.isArray(initialArtifact?.source_ids) && initialArtifact.source_ids.length > 0 ? initialArtifact.source_ids : enabledSources.map((s) => s.id);
    setSelectedSourceIds(baseSrcIds);
  }, [open, nbId, mode, initialArtifact?.id]);
  if (!open) return null;
  const lengthObj = DECK_LENGTHS.find((l) => l.id === lengthKey) || DECK_LENGTHS[1];
  const hasImgGen = Boolean(capabilities?.image_generate);
  const imgProviderLabel = [capabilities?.image_gen_provider, capabilities?.image_gen_model].filter(Boolean).join(" \xB7 ");
  function toggleSource(sid) {
    setSelectedSourceIds((prev) => prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]);
  }
  function buildParams(extra = {}) {
    const cleanPrompt = instructions.trim();
    return {
      deck_format: deckFormat,
      deck_purpose: deckPurpose,
      theme,
      language,
      count: lengthObj.count,
      focus: cleanPrompt || initialFocus || "Executive presentation",
      instructions: cleanPrompt,
      include_images: Boolean(useImageGen),
      image_mode: useImageGen ? imageMode : "none",
      max_images: useImageGen ? imageMode === "full_slide" ? lengthObj.count : Math.min(5, lengthObj.count) : 0,
      source_ids: selectedSourceIds.length > 0 ? selectedSourceIds : enabledSources.map((s) => s.id),
      ...extra
    };
  }
  async function handlePrimaryAction() {
    if (mode === "revise") {
      if (!instructions.trim()) {
        setOutlineError("Describe what you would like to revise in this slide deck.");
        return;
      }
      onRevise?.(initialArtifact.id, instructions.trim(), buildParams());
      onClose?.();
      return;
    }
    if (reviewOutline && step === "config") {
      setLoadingOutline(true);
      setOutlineError("");
      try {
        const params2 = buildParams();
        const res = await api(`/notebooks/${encodeURIComponent(nbId)}/slides/outline`, {
          method: "POST",
          body: { params: params2, source_ids: params2.source_ids }
        });
        const slides = res?.outline?.slides || [];
        setOutlineTitle(res?.outline?.title || params2.focus);
        setOutlineSlides(slides);
        setStep("outline");
      } catch (err) {
        setOutlineError(err.message || "Could not draft slide outline.");
      } finally {
        setLoadingOutline(false);
      }
      return;
    }
    const params = buildParams(
      step === "outline" && outlineSlides.length > 0 ? { approved_outline: outlineSlides, count: outlineSlides.length, focus: outlineTitle || instructions.trim() || "Slide Deck" } : {}
    );
    onGenerate?.(params);
    onClose?.();
  }
  function updateOutlineSlide(index, patch) {
    setOutlineSlides((prev) => prev.map((sl, i) => i === index ? { ...sl, ...patch } : sl));
  }
  function moveOutlineSlide(index, delta) {
    setOutlineSlides((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }
  function removeOutlineSlide(index) {
    setOutlineSlides((prev) => prev.filter((_, i) => i !== index));
  }
  function addOutlineSlide() {
    setOutlineSlides((prev) => [
      ...prev,
      {
        id: `sl_${prev.length + 1}`,
        layout: "two-col",
        title: "New supporting slide takeaway",
        bullets: ["Key grounded point from sources"],
        notes: "",
        cites: []
      }
    ]);
  }
  return /* @__PURE__ */ jsx8("div", { className: "sb-modal-backdrop", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-label": "Customize Slide Deck", children: /* @__PURE__ */ jsxs6("div", { className: "sb-modal sb-modal-wide", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs6("div", { className: "sb-modal-head", children: [
      /* @__PURE__ */ jsxs6("div", { style: { display: "flex", alignItems: "center", gap: 9 }, children: [
        /* @__PURE__ */ jsx8(Icon, { name: "Presentation", size: 16, style: { color: "var(--ui-accent)" } }),
        /* @__PURE__ */ jsx8("span", { children: mode === "revise" ? `Revise Slide Deck: ${initialArtifact?.title || ""}` : step === "outline" ? "Review & Edit Slide Outline" : "Customize Slide Deck" })
      ] }),
      /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: onClose, "aria-label": "Close", children: /* @__PURE__ */ jsx8(Icon, { name: "X", size: 14 }) })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "sb-modal-body sb-scroll", style: { maxHeight: "72vh" }, children: [
      outlineError ? /* @__PURE__ */ jsx8("div", { className: "sb-error-bar", style: { borderRadius: 8 }, children: /* @__PURE__ */ jsx8("span", { children: outlineError }) }) : null,
      step === "outline" ? /* @__PURE__ */ jsxs6("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsx8(
            "input",
            {
              className: "sb-input",
              value: outlineTitle,
              onChange: (e) => setOutlineTitle(e.target.value),
              placeholder: "Slide deck title",
              style: { fontWeight: 650 }
            }
          ),
          /* @__PURE__ */ jsxs6("button", { type: "button", className: "sb-btn", onClick: addOutlineSlide, children: [
            /* @__PURE__ */ jsx8(Icon, { name: "Plus", size: 12 }),
            " Add slide"
          ] })
        ] }),
        outlineSlides.map((sl, i) => /* @__PURE__ */ jsxs6("div", { className: "sb-outline-row", children: [
          /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxs6("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsx8("span", { className: "sb-mono", style: { fontSize: 11, fontWeight: 700, color: "var(--ui-accent)" }, children: String(i + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsx8(
                "select",
                {
                  className: "sb-select",
                  value: sl.layout || "bullets",
                  onChange: (e) => updateOutlineSlide(i, { layout: e.target.value }),
                  style: { padding: "2px 6px", fontSize: 11 },
                  children: SLIDE_LAYOUTS.map((l) => /* @__PURE__ */ jsx8("option", { value: l, children: l }, l))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs6("div", { style: { display: "flex", gap: 3 }, children: [
              /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", disabled: i === 0, onClick: () => moveOutlineSlide(i, -1), title: "Move up", children: /* @__PURE__ */ jsx8(Icon, { name: "ChevronUp", size: 12 }) }),
              /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", disabled: i === outlineSlides.length - 1, onClick: () => moveOutlineSlide(i, 1), title: "Move down", children: /* @__PURE__ */ jsx8(Icon, { name: "ChevronDown", size: 12 }) }),
              /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger", disabled: outlineSlides.length <= 2, onClick: () => removeOutlineSlide(i), title: "Remove slide", children: /* @__PURE__ */ jsx8(Icon, { name: "Trash2", size: 12 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx8(
            "input",
            {
              className: "sb-input",
              value: sl.title || "",
              onChange: (e) => updateOutlineSlide(i, { title: e.target.value }),
              placeholder: "Action title",
              style: { fontWeight: 600, fontSize: 12.5 }
            }
          ),
          /* @__PURE__ */ jsx8(
            "textarea",
            {
              className: "sb-textarea",
              rows: 2,
              value: (sl.bullets || []).join("\n"),
              onChange: (e) => updateOutlineSlide(i, { bullets: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) }),
              placeholder: "Key talking points (one per line)",
              style: { fontSize: 11.5 }
            }
          ),
          useImageGen ? /* @__PURE__ */ jsx8(
            "input",
            {
              className: "sb-input",
              value: sl.image_prompt || "",
              onChange: (e) => updateOutlineSlide(i, { image_prompt: e.target.value }),
              placeholder: "Optional art direction / visual prompt for this slide...",
              style: { fontSize: 11 }
            }
          ) : null
        ] }, sl.id || i))
      ] }) : /* @__PURE__ */ jsxs6(Fragment4, { children: [
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx8("div", { className: "sb-label", style: { marginBottom: 7 }, children: "Format" }),
          /* @__PURE__ */ jsxs6("div", { className: "sb-sd-format-grid", children: [
            /* @__PURE__ */ jsxs6(
              "button",
              {
                type: "button",
                className: "sb-sd-format-card",
                "data-active": deckFormat === "detailed",
                onClick: () => setDeckFormat("detailed"),
                children: [
                  /* @__PURE__ */ jsxs6("div", { className: "sb-sd-format-head", children: [
                    /* @__PURE__ */ jsx8("strong", { children: "Detailed Deck" }),
                    /* @__PURE__ */ jsx8("span", { className: "sb-sd-radio", "data-checked": deckFormat === "detailed", children: deckFormat === "detailed" ? /* @__PURE__ */ jsx8(Icon, { name: "Check", size: 11 }) : null })
                  ] }),
                  /* @__PURE__ */ jsx8("span", { children: "A comprehensive deck with full text, evidence cards, and details, ready for reading on its own." })
                ]
              }
            ),
            /* @__PURE__ */ jsxs6(
              "button",
              {
                type: "button",
                className: "sb-sd-format-card",
                "data-active": deckFormat === "presenter",
                onClick: () => setDeckFormat("presenter"),
                children: [
                  /* @__PURE__ */ jsxs6("div", { className: "sb-sd-format-head", children: [
                    /* @__PURE__ */ jsx8("strong", { children: "Presenter Slides" }),
                    /* @__PURE__ */ jsx8("span", { className: "sb-sd-radio", "data-checked": deckFormat === "presenter", children: deckFormat === "presenter" ? /* @__PURE__ */ jsx8(Icon, { name: "Check", size: 11 }) : null })
                  ] }),
                  /* @__PURE__ */ jsx8("span", { children: "Clean, high-impact visual slides with concise talking points and rich speaker notes." })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs6("div", { children: [
            /* @__PURE__ */ jsx8("div", { className: "sb-label", style: { marginBottom: 6 }, children: "Deck style & purpose" }),
            /* @__PURE__ */ jsx8("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: DECK_PURPOSES.map((p) => /* @__PURE__ */ jsx8(
              "button",
              {
                type: "button",
                className: "sb-btn",
                "data-active": deckPurpose === p.id,
                onClick: () => setDeckPurpose(p.id),
                style: { padding: "4px 10px", fontSize: 11.5 },
                children: p.label
              },
              p.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs6("label", { className: "sb-field", style: { minWidth: 132 }, children: [
            /* @__PURE__ */ jsx8("span", { className: "sb-label", children: "Theme" }),
            /* @__PURE__ */ jsx8("select", { className: "sb-select", value: theme, onChange: (e) => setTheme(e.target.value), children: DECK_THEMES.map((t) => /* @__PURE__ */ jsx8("option", { value: t.id, children: t.label }, t.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "sb-sd-controls-row", children: [
          /* @__PURE__ */ jsxs6("label", { className: "sb-field", children: [
            /* @__PURE__ */ jsx8("span", { className: "sb-label", children: "Choose language" }),
            /* @__PURE__ */ jsx8("select", { className: "sb-select", value: language, onChange: (e) => setLanguage(e.target.value), children: LANGUAGES.map((lang) => /* @__PURE__ */ jsx8("option", { value: lang, children: lang }, lang)) })
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "sb-field", children: [
            /* @__PURE__ */ jsx8("span", { className: "sb-label", children: "Length" }),
            /* @__PURE__ */ jsx8("div", { className: "sb-seg", children: DECK_LENGTHS.map((l) => /* @__PURE__ */ jsxs6(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": lengthKey === l.id,
                onClick: () => setLengthKey(l.id),
                children: [
                  l.label,
                  " (",
                  l.count,
                  ")"
                ]
              },
              l.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs6("div", { className: "sb-field", style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx8("span", { className: "sb-label", children: "Sources" }),
            /* @__PURE__ */ jsxs6(
              "button",
              {
                type: "button",
                className: "sb-btn",
                onClick: () => setSourcePickerOpen((v) => !v),
                style: { justifyContent: "space-between", width: "100%" },
                children: [
                  /* @__PURE__ */ jsxs6("span", { children: [
                    selectedSourceIds.length,
                    " of ",
                    (sources || []).length,
                    " source",
                    (sources || []).length === 1 ? "" : "s"
                  ] }),
                  /* @__PURE__ */ jsx8(Icon, { name: "ChevronDown", size: 12 })
                ]
              }
            )
          ] })
        ] }),
        sourcePickerOpen ? /* @__PURE__ */ jsxs6("div", { className: "sb-sd-source-picker sb-scroll", children: [
          /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsx8("span", { className: "sb-label", children: "Select sources for this slide deck" }),
            /* @__PURE__ */ jsxs6("div", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost", style: { padding: "2px 7px", fontSize: 11 }, onClick: () => setSelectedSourceIds((sources || []).map((s) => s.id)), children: "All" }),
              /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn sb-btn-ghost", style: { padding: "2px 7px", fontSize: 11 }, onClick: () => setSelectedSourceIds(enabledSources.map((s) => s.id)), children: "Active only" })
            ] })
          ] }),
          (sources || []).map((src) => {
            const checked = selectedSourceIds.includes(src.id);
            return /* @__PURE__ */ jsxs6("label", { className: "sb-sd-source-row", children: [
              /* @__PURE__ */ jsx8(
                "input",
                {
                  type: "checkbox",
                  className: "sb-checkbox",
                  checked,
                  onChange: () => toggleSource(src.id)
                }
              ),
              /* @__PURE__ */ jsx8("span", { className: "sb-src-title", style: { flex: 1 }, children: src.title }),
              /* @__PURE__ */ jsxs6("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: [
                src.chunk_count || 0,
                " ch"
              ] })
            ] }, src.id);
          })
        ] }) : null,
        /* @__PURE__ */ jsxs6("label", { className: "sb-field", children: [
          /* @__PURE__ */ jsx8("span", { className: "sb-label", children: mode === "revise" ? "Describe how you want to revise this deck" : "Describe the slide deck you want to create" }),
          /* @__PURE__ */ jsx8(
            "textarea",
            {
              className: "sb-textarea",
              rows: 3,
              value: instructions,
              onChange: (e) => setInstructions(e.target.value),
              placeholder: mode === "revise" ? 'Example: "Make slide 3 punchier with a bold metric callout, add a comparison slide for option A vs B, and tighten speaker notes for investors."' : 'Add a high-level outline, or guide the audience, visual aesthetic, and focus: "Create an investor pitch deck in a dark blueprint aesthetic with architecture diagrams and crisp KPI callouts."'
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "sb-sd-toggle-card", children: [
          /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [
            /* @__PURE__ */ jsxs6("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [
              /* @__PURE__ */ jsxs6("div", { style: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 650, color: "var(--ui-text-primary)" }, children: [
                /* @__PURE__ */ jsx8(Icon, { name: "Sparkles", size: 13, style: { color: "var(--ui-accent)" } }),
                /* @__PURE__ */ jsx8("span", { children: "Use Hermes Image Generation" }),
                /* @__PURE__ */ jsx8("span", { className: "sb-kind-tag", style: { fontSize: 10 }, children: hasImgGen ? imgProviderLabel || "Hermes ImageGen Ready" : "Optional" })
              ] }),
              /* @__PURE__ */ jsx8("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: useImageGen ? hasImgGen ? "Uses whatever image model is configured in your Hermes agent to generate custom visuals." : "No imagegen provider detected in Hermes yet; will craft high-craft native vector slides until configured." : "Crafts crisp editable native vector & data-viz slides (Stat Spotlight, Comparison, Timeline, Bento) for PowerPoint & PDF." })
            ] }),
            /* @__PURE__ */ jsx8(
              "button",
              {
                type: "button",
                role: "switch",
                "aria-checked": useImageGen,
                className: "sb-switch",
                "data-checked": useImageGen,
                onClick: () => setUseImageGen((v) => !v),
                children: /* @__PURE__ */ jsx8("span", { className: "sb-switch-thumb" })
              }
            )
          ] }),
          useImageGen ? /* @__PURE__ */ jsxs6("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 8, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: [
            /* @__PURE__ */ jsx8("span", { style: { fontSize: 11.5, color: "var(--ui-text-secondary)" }, children: "Visual rendering mode" }),
            /* @__PURE__ */ jsxs6("div", { className: "sb-seg", style: { flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsx8(
                "button",
                {
                  type: "button",
                  className: "sb-seg-btn",
                  "data-active": imageMode === "full_slide",
                  onClick: () => setImageMode("full_slide"),
                  children: "Full-Slide Art"
                }
              ),
              /* @__PURE__ */ jsx8(
                "button",
                {
                  type: "button",
                  className: "sb-seg-btn",
                  "data-active": imageMode === "hybrid",
                  onClick: () => setImageMode("hybrid"),
                  children: "Hybrid (Editable Text + Art)"
                }
              )
            ] })
          ] }) : null
        ] }),
        mode !== "revise" ? /* @__PURE__ */ jsx8("div", { className: "sb-sd-toggle-card", children: /* @__PURE__ */ jsxs6("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxs6("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [
            /* @__PURE__ */ jsx8("strong", { style: { fontSize: 12.5, color: "var(--ui-text-primary)" }, children: "Review slide outline" }),
            /* @__PURE__ */ jsx8("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Preview, edit, and reorder the slide outline before generating artwork and finalizing the deck." })
          ] }),
          /* @__PURE__ */ jsx8(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": reviewOutline,
              className: "sb-switch",
              "data-checked": reviewOutline,
              onClick: () => setReviewOutline((v) => !v),
              children: /* @__PURE__ */ jsx8("span", { className: "sb-switch-thumb" })
            }
          )
        ] }) }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "sb-modal-foot", children: [
      step === "outline" ? /* @__PURE__ */ jsxs6("button", { type: "button", className: "sb-btn", onClick: () => setStep("config"), children: [
        /* @__PURE__ */ jsx8(Icon, { name: "ArrowLeft", size: 12 }),
        " Back to settings"
      ] }) : /* @__PURE__ */ jsx8("button", { type: "button", className: "sb-btn", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsx8(
        "button",
        {
          type: "button",
          className: "sb-btn sb-btn-primary",
          disabled: loadingOutline || selectedSourceIds.length === 0,
          onClick: handlePrimaryAction,
          children: loadingOutline ? /* @__PURE__ */ jsxs6(Fragment4, { children: [
            /* @__PURE__ */ jsx8(HermesSpinner, { size: 12 }),
            " Drafting outline..."
          ] }) : mode === "revise" ? "Revise deck" : reviewOutline && step === "config" ? "Review outline" : "Generate now"
        }
      )
    ] })
  ] }) });
}

// desktop-src/components/renderers/StudyGuideView.jsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs7("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs7("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxs7("button", { type: "button", className: "sb-btn", onClick: () => copyText(md), children: [
        /* @__PURE__ */ jsx9(Icon, { name: "Copy", size: 12 }),
        " Copy Markdown"
      ] }),
      /* @__PURE__ */ jsxs7(
        "button",
        {
          type: "button",
          className: "sb-btn",
          onClick: () => downloadTextFile(`${artifact.id || "study-guide"}.md`, md, "text/markdown;charset=utf-8"),
          children: [
            /* @__PURE__ */ jsx9(Icon, { name: "Download", size: 12 }),
            " Download .md"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx9(MarkdownBody, { text: md, citeIndexMap: citeMap, onOpenChunk })
  ] });
}

// desktop-src/components/renderers/AudioOverviewView.jsx
import { useEffect as useEffect6, useRef as useRef5, useState as useState5 } from "react";
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
function b64ToBlobUrl(b64, mime = "audio/mpeg") {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });
  return { url: URL.createObjectURL(blob), blob };
}
var ENGINE_LABELS = {
  hermes_tts: "Hermes TTS",
  edge_tts: "Edge Neural TTS",
  browser: "Desktop Voices"
};
function AudioOverviewView({ nbId, artifact, onOpenChunk, onArtifactUpdated }) {
  const spec = artifact?.spec || {};
  const turns = spec.turns || [];
  const [audioUrl, setAudioUrl] = useState5("");
  const [audioBlob, setAudioBlob] = useState5(null);
  const [loadingAudio, setLoadingAudio] = useState5(false);
  const [audioPlaying, setAudioPlaying] = useState5(false);
  const [rate, setRate] = useState5(1);
  const [speakingIdx, setSpeakingIdx] = useState5(-1);
  const [question, setQuestion] = useState5("");
  const [asking, setAsking] = useState5(false);
  const [replyUrl, setReplyUrl] = useState5("");
  const [replyPlaying, setReplyPlaying] = useState5(false);
  const [replyEngine, setReplyEngine] = useState5("");
  const [canResumeEpisode, setCanResumeEpisode] = useState5(false);
  const audioRef = useRef5(null);
  const replyAudioRef = useRef5(null);
  const resumeTimeRef = useRef5(0);
  const resumeTurnRef = useRef5(-1);
  const stopSpeakRef = useRef5(false);
  const replyUrlRef = useRef5("");
  const canBrowserSpeak = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
  const isActivelyPlaying = audioPlaying || replyPlaying || speakingIdx >= 0;
  useEffect6(() => {
    stopSpeech();
    let alive = true;
    let createdUrl = "";
    setAudioUrl("");
    setAudioBlob(null);
    setAudioPlaying(false);
    setCanResumeEpisode(false);
    if (replyUrlRef.current) {
      URL.revokeObjectURL(replyUrlRef.current);
      replyUrlRef.current = "";
    }
    setReplyUrl("");
    setReplyPlaying(false);
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
      stopSpeech();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      if (replyUrlRef.current) {
        URL.revokeObjectURL(replyUrlRef.current);
        replyUrlRef.current = "";
      }
    };
  }, [nbId, artifact?.id, artifact?.has_audio]);
  useEffect6(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
    if (replyAudioRef.current) replyAudioRef.current.playbackRate = rate;
  }, [rate, audioUrl, replyUrl]);
  function stopSpeech() {
    stopSpeakRef.current = true;
    setSpeakingIdx(-1);
    if (canBrowserSpeak) {
      try {
        window.speechSynthesis.cancel();
      } catch {
      }
    }
  }
  function playBrowserSpeech(startAt = 0, turnList = turns, endExclusive = null) {
    if (!canBrowserSpeak || !turnList.length) return;
    stopSpeech();
    stopSpeakRef.current = false;
    const voices = window.speechSynthesis.getVoices() || [];
    const enVoices = voices.filter((v) => /^en/i.test(v.lang || ""));
    const voiceA = enVoices[0] || voices[0] || null;
    const voiceB = enVoices[1] || enVoices[0] || voices[1] || voiceA;
    const limit = endExclusive != null ? Math.min(turnList.length, endExclusive) : turnList.length;
    const speakTurn = (i) => {
      if (stopSpeakRef.current || i >= limit) {
        setSpeakingIdx(-1);
        return;
      }
      const t = turnList[i];
      if (String(t?.speaker || "").toLowerCase() === "listener") {
        speakTurn(i + 1);
        return;
      }
      setSpeakingIdx(i);
      const utt = new SpeechSynthesisUtterance(String(t?.text || ""));
      const sp = String(t?.speaker || "").toLowerCase();
      const isB = sp === "maya" || sp === "host b" || sp !== "alex" && i % 2 === 1;
      if (isB && voiceB) utt.voice = voiceB;
      else if (voiceA) utt.voice = voiceA;
      utt.rate = rate;
      utt.pitch = isB ? 1.08 : 0.95;
      utt.onend = () => speakTurn(i + 1);
      utt.onerror = () => setSpeakingIdx(-1);
      window.speechSynthesis.speak(utt);
    };
    speakTurn(startAt);
  }
  function pauseMainForInterrupt() {
    let wasPlaying = false;
    if (audioRef.current && !audioRef.current.paused) {
      resumeTimeRef.current = audioRef.current.currentTime || 0;
      audioRef.current.pause();
      setAudioPlaying(false);
      wasPlaying = true;
    }
    if (speakingIdx >= 0) {
      resumeTurnRef.current = speakingIdx;
      stopSpeech();
      wasPlaying = true;
    }
    if (wasPlaying) setCanResumeEpisode(true);
  }
  function resumeEpisode() {
    if (replyAudioRef.current && !replyAudioRef.current.paused) {
      replyAudioRef.current.pause();
    }
    setReplyPlaying(false);
    stopSpeech();
    setCanResumeEpisode(false);
    if (audioRef.current && audioUrl) {
      if (resumeTimeRef.current > 0) {
        audioRef.current.currentTime = resumeTimeRef.current;
      }
      audioRef.current.play().catch(() => {
      });
      return;
    }
    if (canBrowserSpeak && resumeTurnRef.current >= 0) {
      playBrowserSpeech(resumeTurnRef.current);
    }
  }
  function playReplyAudioB64(b64, mime = "audio/mpeg") {
    if (replyUrlRef.current) URL.revokeObjectURL(replyUrlRef.current);
    const { url } = b64ToBlobUrl(b64, mime);
    replyUrlRef.current = url;
    setReplyUrl(url);
    const startReply = () => {
      if (replyAudioRef.current) {
        replyAudioRef.current.playbackRate = rate;
        replyAudioRef.current.play().catch(() => {
        });
      }
    };
    const ctx = getContext();
    if (ctx && typeof ctx.setTimeout === "function") {
      ctx.setTimeout(startReply, 60);
    } else {
      startReply();
    }
  }
  async function replaySavedReply(audioFile, turnIdx) {
    pauseMainForInterrupt();
    if (audioFile && nbId && artifact?.id) {
      try {
        const res = await api(
          `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/media-data/${encodeURIComponent(audioFile)}`
        );
        if (res?.available && res.b64) {
          playReplyAudioB64(res.b64, res.mime || "audio/mpeg");
          return;
        }
      } catch {
      }
    }
    if (canBrowserSpeak) {
      playBrowserSpeech(turnIdx, turns, turnIdx + 2);
    }
  }
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
    pauseMainForInterrupt();
    setAsking(true);
    const estTurn = speakingIdx >= 0 ? speakingIdx : audioRef.current && audioRef.current.duration > 0 ? Math.min(turns.length - 1, Math.floor(audioRef.current.currentTime / audioRef.current.duration * turns.length)) : null;
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/followup`, {
        method: "POST",
        body: { question: q, current_turn_idx: estTurn }
      });
      setQuestion("");
      const updatedArt = res?.artifact;
      if (updatedArt) {
        onArtifactUpdated?.(updatedArt);
      }
      const engine = res?.tts_engine || "browser";
      setReplyEngine(engine);
      if (res?.audio_b64) {
        playReplyAudioB64(res.audio_b64, res.audio_mime || "audio/mpeg");
      } else if (canBrowserSpeak && updatedArt?.spec?.turns?.length) {
        const allTurns = updatedArt.spec.turns;
        const startIdx = Math.max(0, allTurns.length - (res?.added_turns?.length || 2));
        playBrowserSpeech(startIdx, allTurns, allTurns.length);
      }
      sdk.host?.notify?.({
        kind: "success",
        title: "SourceBook",
        message: `Alex & Maya answered aloud (${ENGINE_LABELS[engine] || "Spoken Reply"}).`
      });
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not ask hosts." });
    } finally {
      setAsking(false);
    }
  }
  return /* @__PURE__ */ jsxs8("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs8("div", { className: "sb-inf-toolbar", children: [
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx10("span", { className: "sb-kind-tag", children: (spec.style || "deep_dive").replace("_", " ") }),
        /* @__PURE__ */ jsxs8("span", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
          (spec.hosts || ["Alex", "Maya"]).join(" & "),
          " \xB7 ",
          /* @__PURE__ */ jsx10("span", { className: "sb-mono", children: turns.length }),
          " turns"
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn", onClick: () => copyText(toMarkdown()), children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Copy", size: 12 }),
          " Script"
        ] }),
        /* @__PURE__ */ jsxs8(
          "button",
          {
            type: "button",
            className: "sb-btn",
            onClick: () => downloadTextFile(`${artifact.id || "audio-overview"}.md`, toMarkdown(), "text/markdown;charset=utf-8"),
            children: [
              /* @__PURE__ */ jsx10(Icon, { name: "Download", size: 12 }),
              " .md"
            ]
          }
        ),
        audioBlob ? /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: downloadMp3, children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Download", size: 12 }),
          " MP3"
        ] }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "sb-audio-stage", children: [
      /* @__PURE__ */ jsx10(
        DitherCanvas,
        {
          variant: "wave",
          animated: isActivelyPlaying,
          color: replyPlaying ? "#10b981" : "var(--ui-accent)",
          secondaryColor: "#f59e0b",
          opacity: isActivelyPlaying ? 0.58 : 0.28,
          cols: 168,
          rows: 32,
          style: { width: "100%", height: 64, display: "block", borderRadius: 7 }
        }
      ),
      audioUrl ? /* @__PURE__ */ jsx10(
        "audio",
        {
          ref: audioRef,
          controls: true,
          src: audioUrl,
          onPlay: () => setAudioPlaying(true),
          onPause: () => setAudioPlaying(false),
          onEnded: () => setAudioPlaying(false),
          style: { width: "100%", height: 36 }
        }
      ) : /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs8("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Headphones", size: 14, style: { color: "var(--ui-accent)" } }),
          /* @__PURE__ */ jsx10("span", { children: loadingAudio ? "Loading podcast audio..." : "Listen instantly with dual desktop voices, or install free edge-tts / configure Hermes TTS for MP3 episodes & spoken Q&A." })
        ] }),
        canBrowserSpeak && turns.length > 0 ? speakingIdx >= 0 ? /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn", onClick: stopSpeech, children: [
          /* @__PURE__ */ jsx10(Icon, { name: "X", size: 12 }),
          " Stop"
        ] }) : /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => playBrowserSpeech(0), children: [
          /* @__PURE__ */ jsx10(Icon, { name: "Play", size: 12 }),
          " Listen aloud"
        ] }) : null
      ] }),
      replyUrl || canResumeEpisode ? /* @__PURE__ */ jsxs8("div", { className: "sb-audio-reply-bar", children: [
        /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs8("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "#10b981" }, children: [
            /* @__PURE__ */ jsx10(Icon, { name: "Volume2", size: 13 }),
            /* @__PURE__ */ jsx10("span", { children: "Alex & Maya Live Reply" }),
            replyEngine ? /* @__PURE__ */ jsx10("span", { className: "sb-kind-tag", children: ENGINE_LABELS[replyEngine] || replyEngine }) : null
          ] }),
          canResumeEpisode ? /* @__PURE__ */ jsxs8("button", { type: "button", className: "sb-btn sb-btn-primary", style: { padding: "3px 9px", fontSize: 11 }, onClick: resumeEpisode, children: [
            /* @__PURE__ */ jsx10(Icon, { name: "Play", size: 11 }),
            " Resume Episode"
          ] }) : null
        ] }),
        replyUrl ? /* @__PURE__ */ jsx10(
          "audio",
          {
            ref: replyAudioRef,
            controls: true,
            src: replyUrl,
            onPlay: () => setReplyPlaying(true),
            onPause: () => setReplyPlaying(false),
            onEnded: () => setReplyPlaying(false),
            style: { width: "100%", height: 32 }
          }
        ) : null
      ] }) : null,
      /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, paddingTop: 4, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: [
        /* @__PURE__ */ jsx10("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Playback speed" }),
        /* @__PURE__ */ jsx10("div", { className: "sb-seg", children: [0.75, 1, 1.25, 1.5, 2].map((v) => /* @__PURE__ */ jsxs8(
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
    ] }),
    /* @__PURE__ */ jsxs8("form", { onSubmit: askHosts, style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx10(
        "input",
        {
          className: "sb-input",
          style: { flex: "1 1 180px", minWidth: 0 },
          value: question,
          onChange: (e) => setQuestion(e.target.value),
          placeholder: "Join the podcast - interrupt Alex & Maya with a question...",
          disabled: asking
        }
      ),
      /* @__PURE__ */ jsxs8("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: asking || !question.trim(), children: [
        asking ? /* @__PURE__ */ jsx10(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx10(Icon, { name: "Mic", size: 12 }),
        " ",
        asking ? "Hosts replying..." : "Interrupt & Ask"
      ] })
    ] }),
    /* @__PURE__ */ jsx10("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: turns.map((t, idx) => {
      const sp = String(t.speaker || "Host");
      const isHostB = sp.toLowerCase() === "maya" || sp.toLowerCase() === "host b";
      const isListener = sp.toLowerCase() === "listener";
      const isSpeaking = speakingIdx === idx;
      const accent = isListener ? "#10b981" : isHostB ? "#f59e0b" : "var(--ui-accent)";
      return /* @__PURE__ */ jsxs8(
        "article",
        {
          className: "sb-ledger-row",
          style: {
            borderLeft: `3px solid ${accent}`,
            background: isSpeaking ? "var(--sb-accent-soft)" : void 0
          },
          children: [
            /* @__PURE__ */ jsxs8("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxs8("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
                /* @__PURE__ */ jsx10(
                  "span",
                  {
                    className: "sb-mono",
                    style: {
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10.5,
                      fontWeight: 750,
                      background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                      color: accent,
                      border: `1px solid color-mix(in srgb, ${accent} 36%, transparent)`
                    },
                    children: sp.slice(0, 1).toUpperCase()
                  }
                ),
                /* @__PURE__ */ jsx10("span", { style: { fontSize: 12, fontWeight: 650, color: "var(--ui-text-primary)" }, children: sp }),
                t.interrupt && !isListener ? /* @__PURE__ */ jsx10("span", { className: "sb-kind-tag", style: { color: "#10b981" }, children: "Live Q&A" }) : null,
                isSpeaking ? /* @__PURE__ */ jsx10("span", { className: "sb-kind-tag", style: { color: accent }, children: "Speaking" }) : null
              ] }),
              /* @__PURE__ */ jsxs8("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                t.audio_file || t.interrupt && sp.toLowerCase() === "alex" && canBrowserSpeak ? /* @__PURE__ */ jsxs8(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    style: { padding: "2px 6px", fontSize: 10.5 },
                    onClick: () => replaySavedReply(t.audio_file, idx),
                    title: "Play spoken host answer",
                    children: [
                      /* @__PURE__ */ jsx10(Icon, { name: "Volume2", size: 11 }),
                      " Play"
                    ]
                  }
                ) : null,
                (t.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx10("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid))
              ] })
            ] }),
            /* @__PURE__ */ jsx10("div", { style: { fontSize: 12.5, lineHeight: 1.58, color: "var(--ui-text-secondary)" }, children: t.text })
          ]
        },
        t.id || idx
      );
    }) })
  ] });
}

// desktop-src/components/renderers/FlashcardsView.jsx
import { useEffect as useEffect7, useState as useState6 } from "react";
import { Fragment as Fragment5, jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
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
function fmtInterval(days) {
  if (days <= 1) return "1d";
  if (days < 30) return `${days}d`;
  const mo = (days / 30).toFixed(1).replace(/\.0$/, "");
  return `${mo}mo`;
}
function FlashcardsView({ nbId, artifact, onOpenChunk, onArtifactUpdated, onStateSaved }) {
  const cards = artifact?.spec?.cards || [];
  const [order, setOrder] = useState6(() => cards.map((_, i) => i));
  const [cursor, setCursor] = useState6(0);
  const [flipped, setFlipped] = useState6(false);
  const [showHint, setShowHint] = useState6(false);
  const [viewMode, setViewMode] = useState6("deck");
  const [sessionReviewed, setSessionReviewed] = useState6(0);
  const [sm2, setSm2] = useState6(() => artifact?.state?.sm2 || {});
  useEffect7(() => {
    setOrder(cards.map((_, i) => i));
    setCursor(0);
    setFlipped(false);
    setShowHint(false);
    setViewMode("deck");
    setSessionReviewed(0);
    setSm2(artifact?.state?.sm2 || {});
  }, [artifact?.id]);
  if (!cards.length) {
    return /* @__PURE__ */ jsx11("div", { className: "sb-empty", children: "No flashcards in this deck." });
  }
  const card = cards[order[cursor] ?? 0] || cards[0];
  const cardId = card.id || String(order[cursor] ?? 0);
  const cardState = sm2[cardId];
  const nowSec = Date.now() / 1e3;
  const mastered = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) >= 2).length;
  const learning = cards.filter((c, i) => (sm2[c.id || String(i)]?.reps || 0) === 1).length;
  const due = cards.filter((c, i) => {
    const s = sm2[c.id || String(i)];
    return !s || !s.due_at || s.due_at <= nowSec;
  }).length;
  const masteredPct = Math.round(mastered / cards.length * 100);
  const learningPct = Math.round(learning / cards.length * 100);
  const gradePreviews = [
    { q: 1, label: "Again", tone: "bad", interval: fmtInterval(nextSm2(cardState, 1).interval), key: "1" },
    { q: 3, label: "Hard", tone: "warn", interval: fmtInterval(nextSm2(cardState, 3).interval), key: "2" },
    { q: 4, label: "Good", tone: "accent", interval: fmtInterval(nextSm2(cardState, 4).interval), key: "3" },
    { q: 5, label: "Easy", tone: "ok", interval: fmtInterval(nextSm2(cardState, 5).interval), key: "4" }
  ];
  async function grade(quality) {
    const updated = { ...sm2, [cardId]: nextSm2(sm2[cardId], quality) };
    setSm2(updated);
    setSessionReviewed((n) => n + 1);
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
  return /* @__PURE__ */ jsxs9("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpis", children: [
      /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-lbl", children: "Deck" }),
        /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpi-val sb-mono", children: [
          cursor + 1,
          " / ",
          cards.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-lbl", children: "Due Now" }),
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-val sb-mono", style: { color: due > 0 ? "#f59e0b" : "#10b981" }, children: due })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-lbl", children: "Mastered" }),
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-val sb-mono", style: { color: "#10b981" }, children: mastered })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-lbl", children: "Session" }),
        /* @__PURE__ */ jsx11("div", { className: "sb-dt-kpi-val sb-mono", style: { color: "var(--ui-accent)" }, children: sessionReviewed })
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "sb-inf-toolbar", children: [
      /* @__PURE__ */ jsxs9("div", { className: "sb-seg", role: "group", "aria-label": "Flashcard mode", children: [
        /* @__PURE__ */ jsxs9("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "deck", onClick: () => setViewMode("deck"), children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Layers", size: 12 }),
          " Study Deck"
        ] }),
        /* @__PURE__ */ jsxs9("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "browse", onClick: () => setViewMode("browse"), children: [
          /* @__PURE__ */ jsx11(Icon, { name: "LayoutGrid", size: 12 }),
          " Browse All (",
          cards.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs9("button", { type: "button", className: "sb-btn", onClick: shuffle, children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Shuffle", size: 12 }),
          " Shuffle"
        ] }),
        /* @__PURE__ */ jsxs9("button", { type: "button", className: "sb-btn", onClick: exportCsv, children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Download", size: 12 }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxs9("button", { type: "button", className: "sb-btn", onClick: exportAnki, title: "Export tab-separated deck ready for Anki import", children: [
          /* @__PURE__ */ jsx11(Icon, { name: "Download", size: 12 }),
          " Anki TSV"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs9("div", { className: "sb-fc-mastery-bar", title: `Mastered ${mastered} | Learning ${learning} | New/Due ${Math.max(0, cards.length - mastered - learning)}`, children: [
      /* @__PURE__ */ jsx11("div", { style: { width: `${masteredPct}%`, background: "#10b981" } }),
      /* @__PURE__ */ jsx11("div", { style: { width: `${learningPct}%`, background: "var(--ui-accent)" } })
    ] }),
    viewMode === "browse" ? /* @__PURE__ */ jsx11("div", { className: "sb-dt-cards-grid", children: cards.map((c, cIdx) => {
      const st = sm2[c.id || String(cIdx)];
      const status = (st?.reps || 0) >= 2 ? "Mastered" : (st?.reps || 0) === 1 ? "Learning" : "Due";
      return /* @__PURE__ */ jsxs9(
        "div",
        {
          className: "sb-dt-card",
          style: { cursor: "pointer" },
          onClick: () => {
            const pos = order.indexOf(cIdx);
            if (pos >= 0) setCursor(pos);
            setFlipped(false);
            setViewMode("deck");
          },
          children: [
            /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsxs9("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: [
                "CARD 0",
                cIdx + 1
              ] }),
              /* @__PURE__ */ jsx11("span", { className: "sb-verdict", "data-v": status === "Mastered" ? "supported" : status === "Learning" ? "partial" : void 0, style: { fontSize: 10 }, children: status })
            ] }),
            /* @__PURE__ */ jsx11("div", { style: { fontWeight: 650, fontSize: 13, color: "var(--ui-text-primary)", lineHeight: 1.4 }, children: c.front }),
            /* @__PURE__ */ jsx11("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.5, paddingTop: 6, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: c.back })
          ]
        },
        c.id || cIdx
      );
    }) }) : /* @__PURE__ */ jsxs9(Fragment5, { children: [
      /* @__PURE__ */ jsxs9("div", { className: "sb-fc-stack", children: [
        /* @__PURE__ */ jsx11("div", { className: "sb-fc-layer sb-fc-layer-2", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx11("div", { className: "sb-fc-layer sb-fc-layer-1", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs9(
          "div",
          {
            className: "sb-fc-card sb-fc-card-rich",
            "data-flipped": flipped,
            role: "button",
            tabIndex: 0,
            onClick: () => setFlipped((f) => !f),
            onKeyDown: (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setFlipped((f) => !f);
              } else if (e.key.toLowerCase() === "h" && !flipped && card.hint) {
                setShowHint((h) => !h);
              } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
                const qMap = { "1": 1, "2": 3, "3": 4, "4": 5 };
                grade(qMap[e.key]);
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
              /* @__PURE__ */ jsx11(
                "div",
                {
                  className: "sb-sl-top-ribbon",
                  style: { background: flipped ? "#10b981" : "var(--ui-accent)" }
                }
              ),
              /* @__PURE__ */ jsx11(
                DitherCanvas,
                {
                  variant: "mesh",
                  animated: false,
                  color: flipped ? "#10b981" : "var(--ui-accent)",
                  secondaryColor: "var(--ui-accent)",
                  opacity: 0.18,
                  cols: 110,
                  rows: 28,
                  style: { position: "absolute", inset: "0 0 auto 0", width: "100%", height: 92, pointerEvents: "none" }
                }
              ),
              /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }, children: [
                /* @__PURE__ */ jsx11(
                  "span",
                  {
                    className: "sb-kind-tag",
                    style: flipped ? { color: "#10b981", borderColor: "rgba(16, 185, 129, 0.35)", background: "rgba(16, 185, 129, 0.12)" } : { color: "var(--ui-accent)", borderColor: "var(--sb-accent-border)", background: "var(--sb-accent-soft)" },
                    children: flipped ? "VERIFIED ANSWER" : "STUDY PROMPT"
                  }
                ),
                /* @__PURE__ */ jsxs9("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  (card.tags || []).slice(0, 2).map((t) => /* @__PURE__ */ jsxs9("span", { className: "sb-dt-tag", style: { fontSize: 10 }, children: [
                    "#",
                    t
                  ] }, t)),
                  /* @__PURE__ */ jsx11("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Space to flip" })
                ] })
              ] }),
              /* @__PURE__ */ jsx11(
                "div",
                {
                  style: {
                    position: "relative",
                    marginBlock: "auto",
                    padding: "14px 4px",
                    fontSize: flipped ? 15 : 18,
                    fontWeight: flipped ? 460 : 660,
                    lineHeight: 1.55,
                    letterSpacing: flipped ? void 0 : "-0.015em",
                    color: "var(--ui-text-primary)"
                  },
                  children: flipped ? card.back : card.front
                }
              ),
              !flipped && showHint && card.hint ? /* @__PURE__ */ jsxs9("div", { className: "sb-quote-box", style: { position: "relative" }, onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsx11("strong", { style: { fontSize: 10, letterSpacing: "0.06em", color: "var(--ui-text-tertiary)", display: "block" }, children: "HINT" }),
                card.hint
              ] }) : null,
              /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, position: "relative", paddingTop: 10, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: [
                /* @__PURE__ */ jsxs9("div", { style: { display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }, onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsx11("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Sources:" }),
                  (card.cites || []).map((cid, idx) => /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid))
                ] }),
                !flipped && card.hint ? /* @__PURE__ */ jsx11(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    onClick: (e) => {
                      e.stopPropagation();
                      setShowHint((h) => !h);
                    },
                    children: showHint ? "Hide hint" : "Show hint (H)"
                  }
                ) : /* @__PURE__ */ jsx11("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: cardState?.reps ? `Reps: ${cardState.reps} \xB7 Ease ${cardState.ease}` : "New card" })
              ] })
            ]
          }
        )
      ] }),
      flipped ? /* @__PURE__ */ jsx11("div", { className: "sb-fc-grade-row", children: gradePreviews.map((g) => /* @__PURE__ */ jsxs9(
        "button",
        {
          type: "button",
          className: "sb-fc-grade-btn",
          "data-tone": g.tone,
          onClick: () => grade(g.q),
          children: [
            /* @__PURE__ */ jsx11("span", { style: { fontWeight: 650, fontSize: 12.5 }, children: g.label }),
            /* @__PURE__ */ jsxs9("span", { className: "sb-mono", style: { fontSize: 10.5, opacity: 0.78 }, children: [
              g.interval,
              " \xB7 [",
              g.key,
              "]"
            ] })
          ]
        },
        g.q
      )) }) : /* @__PURE__ */ jsxs9("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxs9(
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
              /* @__PURE__ */ jsx11(Icon, { name: "ChevronLeft", size: 13 }),
              " Prev"
            ]
          }
        ),
        /* @__PURE__ */ jsx11("button", { type: "button", className: "sb-btn sb-btn-primary", style: { minWidth: 156 }, onClick: () => setFlipped(true), children: "Reveal answer" }),
        /* @__PURE__ */ jsxs9(
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
              /* @__PURE__ */ jsx11(Icon, { name: "ChevronRight", size: 13 })
            ]
          }
        )
      ] })
    ] })
  ] });
}

// desktop-src/components/renderers/QuizView.jsx
import { useEffect as useEffect8, useState as useState7 } from "react";
import { Fragment as Fragment6, jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
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
function questionTypeLabel(q) {
  if (q.type === "tf") return "TRUE OR FALSE";
  if (q.type === "short") return "SHORT ANSWER";
  return "MULTIPLE CHOICE";
}
function QuizView({ artifact, onOpenChunk }) {
  const questions = artifact?.spec?.questions || [];
  const [answers, setAnswers] = useState7({});
  const [cursor, setCursor] = useState7(0);
  const [viewMode, setViewMode] = useState7("focus");
  const [retryMissedOnly, setRetryMissedOnly] = useState7(false);
  const [shortDraft, setShortDraft] = useState7("");
  useEffect8(() => {
    setAnswers({});
    setCursor(0);
    setViewMode("focus");
    setRetryMissedOnly(false);
    setShortDraft("");
  }, [artifact?.id]);
  if (!questions.length) {
    return /* @__PURE__ */ jsx12("div", { className: "sb-empty", children: "No questions in this quiz." });
  }
  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter((q, idx) => isCorrectChoice(q, answers[q.id || idx])).length;
  const missedCount = Math.max(0, answeredCount - correctCount);
  const accuracyPct = answeredCount ? Math.round(correctCount / answeredCount * 100) : 0;
  const allDone = answeredCount === questions.length;
  let streak = 0;
  for (let i = 0; i < questions.length; i += 1) {
    const k = questions[i].id || i;
    if (answers[k] === void 0) continue;
    if (isCorrectChoice(questions[i], answers[k])) streak += 1;
    else streak = 0;
  }
  const visibleList = retryMissedOnly ? questions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
    const key = q.id || idx;
    return answers[key] !== void 0 && !isCorrectChoice(q, answers[key]);
  }) : questions.map((q, idx) => ({ q, idx }));
  const activeEntry = visibleList[Math.min(cursor, Math.max(0, visibleList.length - 1))] || visibleList[0];
  const ringR = 24;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = ringCirc * (answeredCount ? accuracyPct / 100 : 0);
  const ringColor = answeredCount === 0 ? "var(--ui-accent)" : accuracyPct >= 75 ? "#10b981" : accuracyPct >= 50 ? "#f59e0b" : "#f43f5e";
  function downloadKey() {
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
  }
  function renderQuestionCard(q, origIdx, isFocus) {
    const key = q.id || origIdx;
    const chosen = answers[key];
    const answered = chosen !== void 0;
    const ok = answered && isCorrectChoice(q, chosen);
    const opts = q.options && q.options.length ? q.options : q.type === "tf" ? ["True", "False"] : [];
    const useGrid = opts.length === 2 || isFocus && opts.length === 4 && opts.every((o) => String(o).length < 95);
    return /* @__PURE__ */ jsxs10("article", { className: isFocus ? "sb-qz-stage" : "sb-ledger-row", style: isFocus ? void 0 : { gap: 10 }, children: [
      isFocus ? /* @__PURE__ */ jsxs10("div", { className: "sb-qz-stage-top", children: [
        /* @__PURE__ */ jsxs10("span", { className: "sb-mono", style: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ui-accent)" }, children: [
          "QUESTION ",
          origIdx + 1,
          " OF ",
          questions.length
        ] }),
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsx12("span", { className: "sb-kind-tag", children: questionTypeLabel(q) }),
          answered ? /* @__PURE__ */ jsx12("span", { className: "sb-verdict", "data-v": ok ? "supported" : "unsupported", children: ok ? "Correct" : "Missed" }) : null
        ] })
      ] }) : /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
          /* @__PURE__ */ jsxs10("span", { className: "sb-mono", style: { fontSize: 11, fontWeight: 700, color: "var(--ui-accent)" }, children: [
            "Q",
            origIdx + 1
          ] }),
          /* @__PURE__ */ jsx12("span", { className: "sb-kind-tag", children: questionTypeLabel(q) })
        ] }),
        answered ? /* @__PURE__ */ jsx12("span", { className: "sb-verdict", "data-v": ok ? "supported" : "unsupported", children: ok ? "Correct" : "Missed" }) : null
      ] }),
      /* @__PURE__ */ jsx12(
        "div",
        {
          style: {
            fontWeight: 650,
            fontSize: isFocus ? 16 : 13.5,
            lineHeight: 1.45,
            color: "var(--ui-text-primary)",
            letterSpacing: isFocus ? "-0.01em" : void 0
          },
          children: q.prompt
        }
      ),
      opts.length > 0 ? /* @__PURE__ */ jsx12("div", { className: "sb-qz-options", style: { gridTemplateColumns: useGrid ? "repeat(2, minmax(0, 1fr))" : "1fr" }, children: opts.map((opt, oi) => {
        const isSelected = chosen === oi;
        const isRight = isCorrectChoice(q, oi);
        let state = "idle";
        if (answered && isRight) state = "correct";
        else if (answered && isSelected && !isRight) state = "wrong";
        else if (answered) state = "dim";
        return /* @__PURE__ */ jsxs10(
          "button",
          {
            type: "button",
            className: "sb-qz-opt",
            "data-state": state,
            onClick: () => setAnswers((prev) => ({ ...prev, [key]: oi })),
            children: [
              /* @__PURE__ */ jsx12("span", { className: "sb-qz-keycap sb-mono", children: String.fromCharCode(65 + oi) }),
              /* @__PURE__ */ jsx12("span", { style: { flex: 1, textAlign: "left", lineHeight: 1.48 }, children: opt }),
              state === "correct" ? /* @__PURE__ */ jsx12(Icon, { name: "Check", size: 14, style: { color: "#10b981", flexShrink: 0 } }) : state === "wrong" ? /* @__PURE__ */ jsx12(Icon, { name: "X", size: 14, style: { color: "var(--sb-bad)", flexShrink: 0 } }) : null
            ]
          },
          oi
        );
      }) }) : /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx12(
          "input",
          {
            className: "sb-input",
            value: shortDraft,
            onChange: (e) => setShortDraft(e.target.value),
            placeholder: "Type your answer and press Enter...",
            onKeyDown: (e) => {
              if (e.key === "Enter" && shortDraft.trim()) {
                setAnswers((prev) => ({ ...prev, [key]: shortDraft.trim() }));
              }
            }
          }
        ),
        /* @__PURE__ */ jsx12(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-primary",
            disabled: !shortDraft.trim(),
            onClick: () => setAnswers((prev) => ({ ...prev, [key]: shortDraft.trim() })),
            children: "Submit"
          }
        )
      ] }),
      answered ? /* @__PURE__ */ jsxs10("div", { className: "sb-qz-explain", "data-ok": ok, children: [
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsx12("span", { className: "sb-mono", style: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: ok ? "#10b981" : "var(--sb-bad)" }, children: ok ? "VERIFIED EXPLANATION" : "CORRECTION & SOURCE" }),
          (q.cites || []).length > 0 ? /* @__PURE__ */ jsx12("div", { style: { display: "flex", gap: 5, alignItems: "center" }, children: (q.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", style: { height: 24, fontSize: 11 }, onClick: () => onOpenChunk?.(cid), children: [
            /* @__PURE__ */ jsx12(Icon, { name: "BookOpen", size: 11 }),
            " Passage [",
            cIdx + 1,
            "]"
          ] }, cid)) }) : null
        ] }),
        /* @__PURE__ */ jsx12("div", { style: { fontSize: 12.5, lineHeight: 1.55, color: "var(--ui-text-primary)" }, children: q.explanation || `Expected answer: ${String(q.answer)}` })
      ] }) : null
    ] }, key);
  }
  return /* @__PURE__ */ jsxs10(
    "div",
    {
      style: { display: "flex", flexDirection: "column", gap: 12 },
      tabIndex: 0,
      onKeyDown: (e) => {
        if (viewMode !== "focus" || !activeEntry) return;
        const { q, idx } = activeEntry;
        const key = q.id || idx;
        const opts = q.options && q.options.length ? q.options : q.type === "tf" ? ["True", "False"] : [];
        const kLow = e.key.toLowerCase();
        if (opts.length > 0) {
          const mapIdx = { "1": 0, a: 0, "2": 1, b: 1, "3": 2, c: 2, "4": 3, d: 3 }[kLow];
          if (mapIdx !== void 0 && mapIdx < opts.length) {
            setAnswers((prev) => ({ ...prev, [key]: mapIdx }));
            return;
          }
        }
        if (e.key === "ArrowRight") setCursor((c) => Math.min(visibleList.length - 1, c + 1));
        if (e.key === "ArrowLeft") setCursor((c) => Math.max(0, c - 1));
      },
      children: [
        /* @__PURE__ */ jsxs10("div", { className: "sb-qz-hero", children: [
          /* @__PURE__ */ jsx12(
            DitherCanvas,
            {
              variant: "mesh",
              animated: false,
              color: ringColor,
              secondaryColor: "var(--ui-accent)",
              opacity: 0.18,
              cols: 120,
              rows: 26,
              style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }
            }
          ),
          /* @__PURE__ */ jsxs10("div", { style: { position: "relative", display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxs10("svg", { width: "62", height: "62", viewBox: "0 0 62 62", style: { flexShrink: 0 }, "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx12("circle", { cx: "31", cy: "31", r: ringR, fill: "none", stroke: "var(--ui-stroke-tertiary)", strokeWidth: "5.5" }),
              /* @__PURE__ */ jsx12(
                "circle",
                {
                  cx: "31",
                  cy: "31",
                  r: ringR,
                  fill: "none",
                  stroke: ringColor,
                  strokeWidth: "5.5",
                  strokeLinecap: "round",
                  strokeDasharray: `${ringDash.toFixed(1)} ${ringCirc.toFixed(1)}`,
                  transform: "rotate(-90 31 31)"
                }
              ),
              /* @__PURE__ */ jsxs10("text", { x: "31", y: "35", textAnchor: "middle", fill: ringColor, fontSize: "13.5", fontWeight: "800", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: [
                accuracyPct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "sb-qz-stats", children: [
              /* @__PURE__ */ jsxs10("div", { children: [
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-lbl", children: "Progress" }),
                /* @__PURE__ */ jsxs10("div", { className: "sb-dt-kpi-val sb-mono", children: [
                  answeredCount,
                  " / ",
                  questions.length
                ] })
              ] }),
              /* @__PURE__ */ jsxs10("div", { children: [
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-lbl", children: "Correct" }),
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-val sb-mono", style: { color: "#10b981" }, children: correctCount })
              ] }),
              /* @__PURE__ */ jsxs10("div", { children: [
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-lbl", children: "Streak" }),
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-val sb-mono", style: { color: "var(--ui-accent)" }, children: streak })
              ] }),
              /* @__PURE__ */ jsxs10("div", { children: [
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-lbl", children: "Missed" }),
                /* @__PURE__ */ jsx12("div", { className: "sb-dt-kpi-val sb-mono", style: { color: missedCount > 0 ? "var(--sb-bad)" : "var(--ui-text-secondary)" }, children: missedCount })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { position: "relative", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxs10("div", { className: "sb-seg", role: "group", "aria-label": "Quiz mode", children: [
              /* @__PURE__ */ jsx12("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "focus", onClick: () => setViewMode("focus"), children: "Focus" }),
              /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "all", onClick: () => setViewMode("all"), children: [
                "All (",
                questions.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                className: "sb-btn",
                "data-active": retryMissedOnly,
                disabled: missedCount <= 0,
                onClick: () => {
                  setRetryMissedOnly((v) => !v);
                  setCursor(0);
                },
                children: [
                  "Missed (",
                  missedCount,
                  ")"
                ]
              }
            ),
            /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                className: "sb-btn",
                onClick: () => {
                  setAnswers({});
                  setRetryMissedOnly(false);
                  setCursor(0);
                },
                children: [
                  /* @__PURE__ */ jsx12(Icon, { name: "RotateCcw", size: 12 }),
                  " Reset"
                ]
              }
            ),
            /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", onClick: downloadKey, children: [
              /* @__PURE__ */ jsx12(Icon, { name: "Download", size: 12 }),
              " Key .md"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "sb-qz-stepper", children: [
          questions.map((q, idx) => {
            const k = q.id || idx;
            const ans = answers[k];
            const st = ans === void 0 ? "idle" : isCorrectChoice(q, ans) ? "correct" : "wrong";
            const isCur = viewMode === "focus" && activeEntry?.idx === idx;
            return /* @__PURE__ */ jsx12(
              "button",
              {
                type: "button",
                className: "sb-qz-step",
                "data-state": st,
                "data-active": isCur,
                onClick: () => {
                  setRetryMissedOnly(false);
                  setViewMode("focus");
                  setCursor(idx);
                },
                title: `Jump to Question ${idx + 1}`,
                children: idx + 1
              },
              k
            );
          }),
          viewMode === "focus" ? /* @__PURE__ */ jsx12("span", { style: { marginLeft: "auto", fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Keys: A-D to answer \xB7 Left/Right to navigate" }) : null
        ] }),
        allDone ? /* @__PURE__ */ jsxs10("div", { className: "sb-qz-complete", children: [
          /* @__PURE__ */ jsxs10("div", { children: [
            /* @__PURE__ */ jsx12("div", { className: "sb-mono", style: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", color: "#10b981" }, children: "QUIZ COMPLETE" }),
            /* @__PURE__ */ jsxs10("div", { style: { fontSize: 15, fontWeight: 700, color: "var(--ui-text-primary)", marginTop: 2 }, children: [
              "Scored ",
              correctCount,
              " / ",
              questions.length,
              " (",
              accuracyPct,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", gap: 6 }, children: [
            missedCount > 0 ? /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-primary",
                onClick: () => {
                  const nextAns = { ...answers };
                  questions.forEach((q, i) => {
                    const k = q.id || i;
                    if (!isCorrectChoice(q, nextAns[k])) delete nextAns[k];
                  });
                  setAnswers(nextAns);
                  setRetryMissedOnly(false);
                  setCursor(0);
                },
                children: [
                  "Retry ",
                  missedCount,
                  " missed"
                ]
              }
            ) : null,
            /* @__PURE__ */ jsxs10("button", { type: "button", className: "sb-btn", onClick: downloadKey, children: [
              /* @__PURE__ */ jsx12(Icon, { name: "Download", size: 12 }),
              " Export Answer Key"
            ] })
          ] })
        ] }) : null,
        viewMode === "focus" && activeEntry ? /* @__PURE__ */ jsxs10(Fragment6, { children: [
          renderQuestionCard(activeEntry.q, activeEntry.idx, true),
          /* @__PURE__ */ jsxs10("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                className: "sb-btn",
                disabled: cursor <= 0,
                onClick: () => setCursor((c) => Math.max(0, c - 1)),
                children: [
                  /* @__PURE__ */ jsx12(Icon, { name: "ChevronLeft", size: 13 }),
                  " Previous"
                ]
              }
            ),
            /* @__PURE__ */ jsxs10("span", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
              cursor + 1,
              " / ",
              visibleList.length
            ] }),
            /* @__PURE__ */ jsxs10(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-primary",
                disabled: cursor >= visibleList.length - 1,
                onClick: () => setCursor((c) => Math.min(visibleList.length - 1, c + 1)),
                children: [
                  "Next question ",
                  /* @__PURE__ */ jsx12(Icon, { name: "ChevronRight", size: 13 })
                ]
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsx12("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: visibleList.map(({ q, idx }) => renderQuestionCard(q, idx, false)) })
      ]
    }
  );
}

// desktop-src/components/renderers/MindMapView.jsx
import { useMemo, useRef as useRef6, useState as useState8 } from "react";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var BRANCH_COLORS = ["#3b82f6", "#10b981", "#38bdf8", "#f59e0b", "#f43f5e", "#8b5cf6"];
function clipNode(label, maxChars = 25) {
  const s = String(label || "").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, maxChars - 1).trimEnd().replace(/[.,;:\-]+$/, "")}...`;
}
function layoutTree(root, collapsed) {
  const nodes = [];
  const edges = [];
  let leafY = 0;
  const xStep = 232;
  const yStep = 56;
  function walk(node, depth, parentId, branchIdx) {
    const id = node.id || `${depth}-${nodes.length}`;
    const kids = !collapsed[id] && Array.isArray(node.children) ? node.children : [];
    const item = {
      id,
      label: String(node.label || "Node"),
      summary: String(node.summary || ""),
      cites: node.cites || [],
      depth,
      branchIdx,
      color: depth === 0 ? "var(--ui-accent)" : BRANCH_COLORS[branchIdx % BRANCH_COLORS.length],
      hasChildren: Array.isArray(node.children) && node.children.length > 0,
      collapsed: Boolean(collapsed[id]),
      x: 34 + depth * xStep,
      y: 0
    };
    if (!kids.length) {
      item.y = 48 + leafY * yStep;
      leafY += 1;
      nodes.push(item);
    } else {
      const childPositions = kids.map((k, kIdx) => walk(k, depth + 1, id, depth === 0 ? kIdx : branchIdx));
      item.y = (childPositions[0].y + childPositions[childPositions.length - 1].y) / 2;
      nodes.push(item);
    }
    if (parentId) {
      edges.push({ from: parentId, to: id, color: item.color });
    }
    return item;
  }
  if (root) walk(root, 0, null, 0);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const maxX = Math.max(720, ...nodes.map((n) => n.x + 226));
  const maxY = Math.max(380, ...nodes.map((n) => n.y + 54));
  return { nodes, edges, byId, width: maxX, height: maxY };
}
function MindMapView({ artifact, onOpenChunk }) {
  const root = artifact?.spec?.root;
  const [zoom, setZoom] = useState8(1);
  const [pan, setPan] = useState8({ x: 0, y: 0 });
  const [dragging, setDragging] = useState8(null);
  const [collapsed, setCollapsed] = useState8({});
  const [selected, setSelected] = useState8(null);
  const [exportingPng, setExportingPng] = useState8(false);
  const svgRef = useRef6(null);
  const graph = useMemo(() => layoutTree(root, collapsed), [root, collapsed]);
  const uid = String(artifact?.id || "map").replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `sb-mm-title-${uid}`;
  const descId = `sb-mm-desc-${uid}`;
  if (!root) {
    return /* @__PURE__ */ jsx13("div", { className: "sb-empty", children: "No mind map structure available." });
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
  async function handleDownloadPng() {
    if (exportingPng) return;
    setExportingPng(true);
    try {
      await downloadSvgAsPng(svgRef.current, `${artifact.id || "mindmap"}.png`, 2);
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Downloaded 2x PNG mind map." });
    } catch {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: "Could not render PNG export." });
    } finally {
      setExportingPng(false);
    }
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
  const hasCollapsed = Object.values(collapsed).some(Boolean);
  return /* @__PURE__ */ jsxs11("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs11("div", { className: "sb-inf-toolbar", children: [
      /* @__PURE__ */ jsxs11("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
        /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-btn sb-btn-icon", title: "Zoom out", onClick: () => setZoom((z) => Math.max(0.45, Number((z - 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx13(Icon, { name: "Minus", size: 13 }) }),
        /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-btn", onClick: () => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }, children: /* @__PURE__ */ jsxs11("span", { className: "sb-mono", children: [
          Math.round(zoom * 100),
          "%"
        ] }) }),
        /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-btn sb-btn-icon", title: "Zoom in", onClick: () => setZoom((z) => Math.min(2, Number((z + 0.15).toFixed(2)))), children: /* @__PURE__ */ jsx13(Icon, { name: "Plus", size: 13 }) }),
        hasCollapsed ? /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-btn", onClick: () => setCollapsed({}), children: "Expand all" }) : null,
        /* @__PURE__ */ jsxs11("span", { className: "sb-mono", style: { fontSize: 11, color: "var(--ui-text-tertiary)", marginLeft: 4 }, children: [
          graph.nodes.length,
          " nodes"
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn", onClick: handleCopySvg, children: [
          /* @__PURE__ */ jsx13(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn", onClick: handleDownloadSvg, children: [
          /* @__PURE__ */ jsx13(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] }),
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn", onClick: handleDownloadOpml, title: "Export outline for XMind, MindNode, or FreeMind", children: [
          /* @__PURE__ */ jsx13(Icon, { name: "Download", size: 12 }),
          " OPML"
        ] }),
        /* @__PURE__ */ jsxs11("button", { type: "button", className: "sb-btn sb-btn-primary", disabled: exportingPng, onClick: handleDownloadPng, children: [
          /* @__PURE__ */ jsx13(Icon, { name: "ImageDown", size: 12 }),
          " ",
          exportingPng ? "Exporting..." : "PNG"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(
      "div",
      {
        className: "sb-svg-stage",
        style: { height: "clamp(240px, 46vh, 480px)", cursor: dragging ? "grabbing" : "grab", userSelect: "none" },
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
        children: /* @__PURE__ */ jsxs11(
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
              /* @__PURE__ */ jsx13("title", { id: titleId, children: artifact?.spec?.title || "Concept Mind Map" }),
              /* @__PURE__ */ jsxs11("desc", { id: descId, children: [
                "Interactive hierarchical concept map with ",
                graph.nodes.length,
                " nodes grounded in notebook sources."
              ] }),
              /* @__PURE__ */ jsx13("defs", { children: /* @__PURE__ */ jsx13("pattern", { id: `sb-mm-dots-${uid}`, width: "16", height: "16", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx13("circle", { cx: "2", cy: "2", r: "0.9", fill: "var(--ui-stroke-tertiary)" }) }) }),
              /* @__PURE__ */ jsx13("rect", { x: "0", y: "0", width: graph.width, height: graph.height, fill: "var(--sb-bg)" }),
              /* @__PURE__ */ jsx13("rect", { x: "0", y: "0", width: graph.width, height: graph.height, fill: `url(#sb-mm-dots-${uid})`, opacity: "0.65" }),
              /* @__PURE__ */ jsxs11("g", { transform: `translate(${pan.x}, ${pan.y}) scale(${zoom})`, children: [
                graph.edges.map((ed, i) => {
                  const a = graph.byId.get(ed.from);
                  const b = graph.byId.get(ed.to);
                  if (!a || !b) return null;
                  const sx = a.x + 194;
                  const sy = a.y;
                  const tx = b.x;
                  const ty = b.y;
                  const mx = (sx + tx) / 2;
                  return /* @__PURE__ */ jsx13(
                    "path",
                    {
                      d: `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`,
                      fill: "none",
                      stroke: ed.color,
                      strokeOpacity: "0.58",
                      strokeWidth: a.depth === 0 ? "2" : "1.5"
                    },
                    i
                  );
                }),
                graph.nodes.map((n) => {
                  const isRoot = n.depth === 0;
                  const isSel = activeNode && activeNode.id === n.id;
                  const label = clipNode(n.label, 24);
                  return /* @__PURE__ */ jsxs11(
                    "g",
                    {
                      "data-node": n.id,
                      transform: `translate(${n.x}, ${n.y - 19})`,
                      style: { cursor: "pointer" },
                      onClick: () => setSelected(n.id),
                      onDoubleClick: () => {
                        if (n.hasChildren) setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                      },
                      children: [
                        /* @__PURE__ */ jsx13(
                          "rect",
                          {
                            width: "194",
                            height: "38",
                            rx: "9",
                            fill: isRoot ? "var(--sb-accent-soft)" : isSel ? n.color : "var(--sb-surface)",
                            fillOpacity: isRoot ? "1" : isSel ? "0.16" : "1",
                            stroke: isRoot || isSel ? n.color : "var(--ui-stroke-secondary)",
                            strokeWidth: isRoot || isSel ? "1.8" : "1"
                          }
                        ),
                        !isRoot ? /* @__PURE__ */ jsx13("rect", { x: "0", y: "7", width: "3", height: "24", rx: "1.5", fill: n.color }) : null,
                        /* @__PURE__ */ jsx13(
                          "text",
                          {
                            x: "13",
                            y: "23",
                            fill: "var(--ui-text-primary)",
                            fontSize: "12",
                            fontWeight: isRoot || n.depth === 1 ? "650" : "500",
                            fontFamily: "system-ui, -apple-system, sans-serif",
                            children: label
                          }
                        ),
                        n.hasChildren ? /* @__PURE__ */ jsxs11(
                          "g",
                          {
                            transform: "translate(194, 19)",
                            onClick: (e) => {
                              e.stopPropagation();
                              setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                            },
                            children: [
                              /* @__PURE__ */ jsx13("circle", { r: "8.5", fill: "var(--sb-surface)", stroke: n.color, strokeWidth: "1.4" }),
                              /* @__PURE__ */ jsx13("text", { textAnchor: "middle", y: "3.5", fill: n.color, fontSize: "11", fontWeight: "700", children: n.collapsed ? "+" : "-" })
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
    activeNode ? /* @__PURE__ */ jsxs11("div", { className: "sb-ledger-row", style: { borderLeft: `3px solid ${activeNode.color}` }, children: [
      /* @__PURE__ */ jsxs11("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx13("strong", { style: { fontSize: 13 }, children: activeNode.label }),
        /* @__PURE__ */ jsx13("div", { style: { display: "flex", gap: 4 }, children: (activeNode.cites || []).map((cid, idx) => /* @__PURE__ */ jsx13("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid)) })
      ] }),
      activeNode.summary ? /* @__PURE__ */ jsx13("div", { style: { fontSize: 12.5, color: "var(--ui-text-secondary)", lineHeight: 1.55 }, children: activeNode.summary }) : null
    ] }) : null
  ] });
}

// desktop-src/components/renderers/InfographicView.jsx
import { useMemo as useMemo2, useRef as useRef7, useState as useState9 } from "react";
import { Fragment as Fragment7, jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var LAYOUT_OPTIONS = [
  { id: "stat-grid", label: "Bento" },
  { id: "timeline", label: "Timeline" },
  { id: "comparison", label: "Compare" },
  { id: "hub-spoke", label: "Hub" },
  { id: "pyramid", label: "Pyramid" }
];
var PALETTES = {
  adaptive: {
    label: "Adaptive",
    accents: ["var(--ui-accent)", "#10b981", "#38bdf8", "#f59e0b", "#f43f5e", "#8b5cf6"]
  },
  editorial: {
    label: "Editorial",
    accents: ["#3b82f6", "#0d9488", "#d97706", "#e11d48", "#6366f1", "#0891b2"]
  },
  emerald: {
    label: "Emerald",
    accents: ["#10b981", "#06b6d4", "#84cc16", "#f59e0b", "#14b8a6", "#22c55e"]
  },
  warm: {
    label: "Warm",
    accents: ["#f97316", "#eab308", "#e11d48", "#10b981", "#f59e0b", "#ec4899"]
  }
};
function clipLabel(text, maxChars) {
  const s = String(text || "").trim();
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars - 1).trimEnd();
  return `${cut.replace(/[.,;:\-]+$/, "")}...`;
}
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
function parseMetric(rawValue, idx, total) {
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;
  if (/^0\d$/.test(raw) && Number(raw) === idx + 1 && total >= 2) {
    return null;
  }
  const m = raw.match(/^([~$+<>=]*)\s*(\d+(?:[.,]\d+)?)\s*(%|ms|us|s|sec|min|hr|h|x|GB|MB|KB|MiB|GiB|TB|k|M|B|px|fps|rps|qps)?$/i);
  if (!m) {
    return {
      raw,
      display: raw.slice(0, 18),
      num: null,
      unit: "",
      group: "label",
      isPct: false,
      tag: "HIGHLIGHT"
    };
  }
  const prefix = m[1] || "";
  const num = parseFloat(m[2].replace(/,/g, ""));
  const unit = m[3] || "";
  const uLow = unit.toLowerCase();
  const isPct = unit === "%";
  let group = "count";
  let tag = "METRIC";
  if (isPct) {
    group = "percent";
    tag = num >= 50 ? "IMPACT" : "THRESHOLD";
  } else if (uLow === "ms" || uLow === "us" || uLow === "s" || uLow === "sec") {
    group = "latency";
    tag = "LATENCY";
  } else if (uLow === "x") {
    group = "multiplier";
    tag = "SCALE";
  } else if (["gb", "mb", "kb", "mib", "gib", "tb"].includes(uLow)) {
    group = "memory";
    tag = "CAPACITY";
  } else if (prefix.includes("$")) {
    group = "currency";
    tag = "VALUE";
  }
  return {
    raw,
    display: `${prefix}${m[2]}${unit}`,
    num: Number.isFinite(num) ? num : null,
    unit,
    group,
    isPct,
    tag
  };
}
function normalizeLayout(raw) {
  const k = String(raw || "stat-grid").toLowerCase();
  if (k === "process") return "timeline";
  if (LAYOUT_OPTIONS.some((o) => o.id === k)) return k;
  return "stat-grid";
}
function InfographicView({ artifact, onOpenChunk }) {
  const spec = artifact?.spec || {};
  const blocks = spec.blocks || [];
  const svgRef = useRef7(null);
  const [layout, setLayout] = useState9(() => normalizeLayout(spec.layout));
  const [paletteKey, setPaletteKey] = useState9(() => PALETTES[spec.palette] ? spec.palette : "adaptive");
  const [selectedIdx, setSelectedIdx] = useState9(null);
  const [exportingPng, setExportingPng] = useState9(false);
  const enriched = useMemo2(() => {
    const items2 = blocks.map((blk, idx) => {
      const metric = parseMetric(blk.value, idx, blocks.length);
      return {
        ...blk,
        _idx: idx,
        _metric: metric,
        _tag: metric ? metric.tag : blk.kind && blk.kind !== "metric" ? String(blk.kind).toUpperCase() : "KEY INSIGHT"
      };
    });
    const maxByGroup = {};
    for (const it of items2) {
      if (it._metric && it._metric.num != null) {
        const g = it._metric.group;
        maxByGroup[g] = Math.max(maxByGroup[g] || 0, it._metric.num);
      }
    }
    let heroIdx = 0;
    let bestScore = -1;
    items2.forEach((it, idx) => {
      if (!it._metric || it._metric.num == null) return;
      const score = it._metric.isPct ? 1e4 + it._metric.num : 1e3 + it._metric.num;
      if (score > bestScore) {
        bestScore = score;
        heroIdx = idx;
      }
    });
    const withRatios = items2.map((it, idx) => {
      let ratio = 0;
      if (it._metric && it._metric.num != null) {
        if (it._metric.isPct) {
          ratio = Math.max(0.05, Math.min(1, it._metric.num / 100));
        } else {
          const mx = maxByGroup[it._metric.group] || it._metric.num || 1;
          ratio = Math.max(0.08, Math.min(1, it._metric.num / mx));
        }
      }
      return { ...it, _ratio: ratio, _isHero: idx === heroIdx };
    });
    const citeOrder = Array.from(new Set(items2.flatMap((b) => b.cites || [])));
    const citeNum = Object.fromEntries(citeOrder.map((cid, i) => [cid, i + 1]));
    return {
      items: withRatios,
      heroIdx,
      metricItems: withRatios.filter((it) => it._metric && it._metric.num != null),
      citeOrder,
      citeNum
    };
  }, [blocks]);
  if (!blocks.length) {
    return /* @__PURE__ */ jsx14("div", { className: "sb-empty", children: "No infographic blocks available." });
  }
  const palette = PALETTES[paletteKey] || PALETTES.adaptive;
  const accentAt = (idx) => palette.accents[idx % palette.accents.length];
  const W = 920;
  const PAD = 32;
  const CW = W - PAD * 2;
  const HEADER_H = 92;
  const FOOTER_H = 38;
  const uid = String(artifact?.id || "info").replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `sb-inf-title-${uid}`;
  const descId = `sb-inf-desc-${uid}`;
  const items = enriched.items;
  const hero = items[enriched.heroIdx] || items[0];
  const rest = items.filter((_, i) => i !== enriched.heroIdx);
  const metricCount = enriched.metricItems.length;
  function computeHeight() {
    if (layout === "stat-grid") {
      const heroRowH = 204;
      const rows = packBentoRows(rest);
      const gridH = rows.reduce((acc, r) => acc + r.height, 0) + Math.max(0, rows.length - 1) * 14;
      return HEADER_H + 16 + heroRowH + (rows.length ? 16 + gridH : 0) + 18 + FOOTER_H;
    }
    if (layout === "timeline") {
      const cardH = 96;
      const gap = 12;
      return HEADER_H + 18 + items.length * cardH + Math.max(0, items.length - 1) * gap + 18 + FOOTER_H;
    }
    if (layout === "comparison") {
      const leftN = Math.ceil(items.length / 2);
      const rightN = items.length - leftN;
      const maxRows = Math.max(leftN, rightN, 1);
      return HEADER_H + 56 + maxRows * 124 + Math.max(0, maxRows - 1) * 12 + 20 + FOOTER_H;
    }
    if (layout === "hub-spoke") {
      const satCount = Math.max(1, items.length - 1);
      const perSide = Math.ceil(satCount / 2);
      return HEADER_H + Math.max(410, perSide * 138 + 44) + FOOTER_H;
    }
    if (layout === "pyramid") {
      const n = Math.min(items.length, 6);
      return HEADER_H + 22 + n * 78 + Math.max(0, n - 1) * 10 + 20 + FOOTER_H;
    }
    return 640;
  }
  function packBentoRows(list) {
    const rows = [];
    let i = 0;
    while (i < list.length) {
      const left = list.length - i;
      if (left === 5) {
        rows.push({ items: list.slice(i, i + 3), cols: 3, height: 152 });
        i += 3;
      } else if (left === 3) {
        rows.push({ items: list.slice(i, i + 3), cols: 3, height: 152 });
        i += 3;
      } else if (left >= 2) {
        rows.push({ items: list.slice(i, i + 2), cols: 2, height: 138 });
        i += 2;
      } else {
        rows.push({ items: list.slice(i, i + 1), cols: 1, height: 122 });
        i += 1;
      }
    }
    return rows;
  }
  const H = computeHeight();
  async function handleCopySvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    await copyText(svgText);
    sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied standalone infographic SVG." });
  }
  function handleDownloadSvg() {
    const svgText = bakeSvgVariables(svgRef.current);
    downloadTextFile(`${artifact.id || "infographic"}-${layout}.svg`, svgText, "image/svg+xml;charset=utf-8");
  }
  async function handleDownloadPng() {
    if (exportingPng) return;
    setExportingPng(true);
    try {
      await downloadSvgAsPng(svgRef.current, `${artifact.id || "infographic"}-${layout}.png`, 2);
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Downloaded 2x PNG infographic." });
    } catch {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: "Could not render PNG export." });
    } finally {
      setExportingPng(false);
    }
  }
  function handleBlockClick(it) {
    setSelectedIdx((prev) => prev === it._idx ? null : it._idx);
  }
  function renderCiteBadgesSvg(cites, rightX, y, accent) {
    const list = (cites || []).slice(0, 3);
    if (!list.length) return null;
    return list.map((cid, i) => {
      const num = enriched.citeNum[cid] || i + 1;
      const bw = 22;
      const bx = rightX - (list.length - i) * (bw + 4) + 4;
      return /* @__PURE__ */ jsxs12(
        "g",
        {
          style: { cursor: "pointer" },
          onClick: (e) => {
            e.stopPropagation();
            onOpenChunk?.(cid);
          },
          children: [
            /* @__PURE__ */ jsx14("rect", { x: bx, y, width: bw, height: 18, rx: "4", fill: accent, fillOpacity: "0.16", stroke: accent, strokeOpacity: "0.45", strokeWidth: "1" }),
            /* @__PURE__ */ jsx14(
              "text",
              {
                x: bx + bw / 2,
                y: y + 12.5,
                textAnchor: "middle",
                fill: accent,
                fontSize: "10",
                fontWeight: "700",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                children: num
              }
            )
          ]
        },
        cid
      );
    });
  }
  function renderHeader() {
    const primaryAccent = accentAt(0);
    const secondAccent = accentAt(1);
    const subtitle = String(spec.subtitle || `Synthesized from ${enriched.citeOrder.length} cited passages`);
    const summaryText = metricCount > 0 ? `${items.length} FINDINGS  |  ${metricCount} METRICS` : `${items.length} FINDINGS  |  ${enriched.citeOrder.length} CITATIONS`;
    const badgeW = Math.max(154, summaryText.length * 6.8 + 24);
    return /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsx14("rect", { x: "0", y: "0", width: W, height: "3", fill: `url(#sb-top-grad-${uid})` }),
      /* @__PURE__ */ jsx14("rect", { x: PAD, y: "16", width: "98", height: "19", rx: "9.5", fill: primaryAccent, fillOpacity: "0.15", stroke: primaryAccent, strokeOpacity: "0.35", strokeWidth: "1" }),
      /* @__PURE__ */ jsx14("circle", { cx: PAD + 11, cy: "25.5", r: "3", fill: primaryAccent }),
      /* @__PURE__ */ jsx14("text", { x: PAD + 20, y: "29", fill: primaryAccent, fontSize: "9.5", fontWeight: "700", letterSpacing: "0.9", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: "VISUAL BRIEF" }),
      /* @__PURE__ */ jsx14("text", { x: PAD + 110, y: "29", fill: "var(--ui-text-tertiary)", fontSize: "10.5", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: layout.toUpperCase() }),
      /* @__PURE__ */ jsx14(
        "rect",
        {
          x: W - PAD - badgeW,
          y: "18",
          width: badgeW,
          height: "24",
          rx: "12",
          fill: "var(--sb-surface)",
          stroke: "var(--ui-stroke-secondary)",
          strokeWidth: "1"
        }
      ),
      /* @__PURE__ */ jsx14(
        "text",
        {
          x: W - PAD - badgeW / 2,
          y: "33.5",
          textAnchor: "middle",
          fill: "var(--ui-text-secondary)",
          fontSize: "10",
          fontWeight: "650",
          letterSpacing: "0.4",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          children: summaryText
        }
      ),
      /* @__PURE__ */ jsx14(
        "text",
        {
          x: PAD,
          y: "60",
          fill: "var(--ui-text-primary)",
          fontSize: "22",
          fontWeight: "750",
          letterSpacing: "-0.4",
          fontFamily: "system-ui, -apple-system, sans-serif",
          children: String(spec.title || "Infographic").slice(0, 58)
        }
      ),
      /* @__PURE__ */ jsx14("text", { x: PAD, y: "80", fill: "var(--ui-text-secondary)", fontSize: "12.5", fontFamily: "system-ui, -apple-system, sans-serif", children: subtitle.slice(0, 96) }),
      /* @__PURE__ */ jsx14("line", { x1: PAD, y1: HEADER_H, x2: W - PAD, y2: HEADER_H, stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx14("rect", { x: PAD, y: HEADER_H - 1, width: "84", height: "2", rx: "1", fill: secondAccent, fillOpacity: "0.85" })
    ] });
  }
  function renderFooter() {
    const fy = H - FOOTER_H;
    return /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsx14("line", { x1: PAD, y1: fy, x2: W - PAD, y2: fy, stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx14("text", { x: PAD, y: fy + 23, fill: "var(--ui-text-tertiary)", fontSize: "10", fontWeight: "600", letterSpacing: "0.8", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: "SOURCEBOOK  |  GROUNDED VISUAL SYNTHESIS" }),
      /* @__PURE__ */ jsx14(
        "text",
        {
          x: W - PAD,
          y: fy + 23,
          textAnchor: "end",
          fill: "var(--ui-text-tertiary)",
          fontSize: "10",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          children: `${enriched.citeOrder.length} cited passage${enriched.citeOrder.length === 1 ? "" : "s"}  |  Click any card to inspect`
        }
      )
    ] });
  }
  function renderBentoLayout() {
    const heroY = HEADER_H + 16;
    const heroH = 204;
    const heroW = 472;
    const chartX = PAD + heroW + 16;
    const chartW = CW - heroW - 16;
    const heroAccent = accentAt(0);
    const isHeroSel = selectedIdx === hero._idx;
    const cx = PAD + 92;
    const cy = heroY + 106;
    const r = 56;
    const circ = 2 * Math.PI * r;
    const gaugeRatio = hero._metric ? hero._metric.isPct ? hero._ratio : 0.78 : 0.72;
    const dashLen = circ * gaugeRatio;
    const heroVal = hero._metric ? hero._metric.display : "KEY";
    const heroFontSize = heroVal.length >= 6 ? 21 : heroVal.length >= 4 ? 25 : 29;
    const heroTitleLines = wrapText(hero.heading || "Primary Highlight", 26, 2);
    const heroBodyLines = wrapText(hero.body, 38, 4);
    const barItems = enriched.metricItems.slice(0, 5);
    const bentoRows = packBentoRows(rest);
    let curY = heroY + heroH + 16;
    return /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(hero), children: [
        /* @__PURE__ */ jsx14(
          "rect",
          {
            x: PAD,
            y: heroY,
            width: heroW,
            height: heroH,
            rx: "12",
            fill: `url(#sb-hero-wash-${uid})`,
            stroke: isHeroSel ? heroAccent : "var(--ui-stroke-secondary)",
            strokeWidth: isHeroSel ? "1.8" : "1"
          }
        ),
        /* @__PURE__ */ jsx14("rect", { x: PAD, y: heroY, width: heroW, height: "3.5", rx: "2", fill: heroAccent }),
        /* @__PURE__ */ jsx14("circle", { cx, cy, r, fill: "none", stroke: "var(--ui-stroke-tertiary)", strokeWidth: "10" }),
        /* @__PURE__ */ jsx14(
          "circle",
          {
            cx,
            cy,
            r,
            fill: "none",
            stroke: heroAccent,
            strokeWidth: "10",
            strokeLinecap: "round",
            strokeDasharray: `${dashLen.toFixed(1)} ${circ.toFixed(1)}`,
            transform: `rotate(-90 ${cx} ${cy})`
          }
        ),
        /* @__PURE__ */ jsx14("circle", { cx, cy, r: r - 12, fill: "var(--sb-bg)", fillOpacity: "0.65" }),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: cx,
            y: cy + 5,
            textAnchor: "middle",
            fill: heroAccent,
            fontSize: heroFontSize,
            fontWeight: "800",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            children: heroVal
          }
        ),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: cx,
            y: cy + 22,
            textAnchor: "middle",
            fill: "var(--ui-text-tertiary)",
            fontSize: "8.5",
            fontWeight: "700",
            letterSpacing: "0.8",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            children: hero._tag
          }
        ),
        /* @__PURE__ */ jsx14("rect", { x: PAD + 172, y: heroY + 20, width: "108", height: "18", rx: "9", fill: heroAccent, fillOpacity: "0.15" }),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: PAD + 182,
            y: heroY + 32,
            fill: heroAccent,
            fontSize: "9",
            fontWeight: "700",
            letterSpacing: "0.7",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            children: "HEADLINE METRIC"
          }
        ),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: PAD + 172,
            y: heroY + 58,
            fill: "var(--ui-text-primary)",
            fontSize: "16",
            fontWeight: "700",
            fontFamily: "system-ui, -apple-system, sans-serif",
            children: heroTitleLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: PAD + 172, dy: li === 0 ? 0 : 20, children: ln }, li))
          }
        ),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: PAD + 172,
            y: heroY + (heroTitleLines.length > 1 ? 100 : 82),
            fill: "var(--ui-text-secondary)",
            fontSize: "12",
            fontFamily: "system-ui, -apple-system, sans-serif",
            children: heroBodyLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: PAD + 172, dy: li === 0 ? 0 : 17, children: ln }, li))
          }
        ),
        renderCiteBadgesSvg(hero.cites, PAD + heroW - 16, heroY + heroH - 28, heroAccent)
      ] }),
      /* @__PURE__ */ jsxs12("g", { children: [
        /* @__PURE__ */ jsx14(
          "rect",
          {
            x: chartX,
            y: heroY,
            width: chartW,
            height: heroH,
            rx: "12",
            fill: "var(--sb-surface)",
            stroke: "var(--ui-stroke-secondary)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: chartX + 18,
            y: heroY + 26,
            fill: "var(--ui-text-tertiary)",
            fontSize: "9.5",
            fontWeight: "700",
            letterSpacing: "0.9",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            children: barItems.length >= 2 ? "METRIC COMPARISON" : "KEY HIGHLIGHTS"
          }
        ),
        /* @__PURE__ */ jsx14("line", { x1: chartX + 18, y1: heroY + 36, x2: chartX + chartW - 18, y2: heroY + 36, stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1" }),
        barItems.length >= 2 ? barItems.map((bi, bIdx) => {
          const rowY = heroY + 48 + bIdx * 29;
          const barColor = accentAt(bIdx);
          const trackW = chartW - 36;
          const fillW = Math.max(12, Math.round(trackW * bi._ratio));
          const unitNote = bi._metric?.group === "latency" ? " (ms)" : "";
          return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(bi), children: [
            /* @__PURE__ */ jsx14(
              "text",
              {
                x: chartX + 18,
                y: rowY + 9,
                fill: selectedIdx === bi._idx ? "var(--ui-text-primary)" : "var(--ui-text-secondary)",
                fontSize: "11",
                fontWeight: selectedIdx === bi._idx ? "650" : "500",
                fontFamily: "system-ui, -apple-system, sans-serif",
                children: `${String(bi.heading || "").slice(0, 28)}${unitNote}`
              }
            ),
            /* @__PURE__ */ jsx14(
              "text",
              {
                x: chartX + chartW - 18,
                y: rowY + 9,
                textAnchor: "end",
                fill: barColor,
                fontSize: "11.5",
                fontWeight: "750",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                children: bi._metric?.display
              }
            ),
            /* @__PURE__ */ jsx14("rect", { x: chartX + 18, y: rowY + 14, width: trackW, height: "7", rx: "3.5", fill: "var(--ui-stroke-tertiary)" }),
            /* @__PURE__ */ jsx14("rect", { x: chartX + 18, y: rowY + 14, width: fillW, height: "7", rx: "3.5", fill: barColor })
          ] }, bi.id || bIdx);
        }) : items.slice(0, 4).map((it, sIdx) => {
          const rowY = heroY + 52 + sIdx * 36;
          const col = accentAt(sIdx);
          return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
            /* @__PURE__ */ jsx14("circle", { cx: chartX + 25, cy: rowY + 6, r: "5", fill: col, fillOpacity: "0.22", stroke: col, strokeWidth: "1.5" }),
            /* @__PURE__ */ jsx14("text", { x: chartX + 38, y: rowY + 10, fill: "var(--ui-text-primary)", fontSize: "11.5", fontWeight: "600", fontFamily: "system-ui, -apple-system, sans-serif", children: String(it.heading || "").slice(0, 36) })
          ] }, it.id || sIdx);
        })
      ] }),
      bentoRows.map((row, rIdx) => {
        const gap = 14;
        const cardW = (CW - gap * (row.cols - 1)) / row.cols;
        const rowY = curY;
        curY += row.height + 14;
        const maxBodyChars = row.cols === 3 ? 33 : row.cols === 2 ? 54 : 112;
        const maxTitleChars = row.cols === 3 ? 30 : 44;
        return /* @__PURE__ */ jsx14("g", { children: row.items.map((it, cIdx) => {
          const x = PAD + cIdx * (cardW + gap);
          const colorIdx = items.indexOf(it);
          const col = accentAt(colorIdx);
          const isSel = selectedIdx === it._idx;
          const hasNum = Boolean(it._metric && it._metric.display);
          const bodyLines = wrapText(it.body, maxBodyChars, row.cols === 3 ? 3 : 3);
          const tagText = it._tag;
          const tagW = Math.max(66, tagText.length * 6.2 + 16);
          return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
            /* @__PURE__ */ jsx14(
              "rect",
              {
                x,
                y: rowY,
                width: cardW,
                height: row.height,
                rx: "11",
                fill: "var(--sb-surface)",
                stroke: isSel ? col : "var(--ui-stroke-secondary)",
                strokeWidth: isSel ? "1.8" : "1"
              }
            ),
            /* @__PURE__ */ jsx14("rect", { x, y: rowY + 12, width: "3", height: row.height - 24, rx: "1.5", fill: col }),
            hasNum ? /* @__PURE__ */ jsxs12(Fragment7, { children: [
              /* @__PURE__ */ jsx14(
                "text",
                {
                  x: x + 16,
                  y: rowY + 34,
                  fill: col,
                  fontSize: "22",
                  fontWeight: "800",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: it._metric.display
                }
              ),
              /* @__PURE__ */ jsx14(
                "rect",
                {
                  x: x + cardW - tagW - 14,
                  y: rowY + 16,
                  width: tagW,
                  height: "18",
                  rx: "9",
                  fill: col,
                  fillOpacity: "0.14"
                }
              ),
              /* @__PURE__ */ jsx14(
                "text",
                {
                  x: x + cardW - tagW / 2 - 14,
                  y: rowY + 28,
                  textAnchor: "middle",
                  fill: col,
                  fontSize: "8.5",
                  fontWeight: "700",
                  letterSpacing: "0.6",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: tagText
                }
              ),
              /* @__PURE__ */ jsx14("rect", { x: x + 16, y: rowY + 43, width: cardW - 32, height: "3.5", rx: "2", fill: "var(--ui-stroke-tertiary)" }),
              /* @__PURE__ */ jsx14("rect", { x: x + 16, y: rowY + 43, width: Math.max(12, Math.round((cardW - 32) * it._ratio)), height: "3.5", rx: "2", fill: col })
            ] }) : /* @__PURE__ */ jsxs12(Fragment7, { children: [
              /* @__PURE__ */ jsx14("rect", { x: x + 16, y: rowY + 16, width: tagW + 8, height: "19", rx: "9.5", fill: col, fillOpacity: "0.15" }),
              /* @__PURE__ */ jsx14(
                "text",
                {
                  x: x + 26,
                  y: rowY + 28.5,
                  fill: col,
                  fontSize: "9",
                  fontWeight: "700",
                  letterSpacing: "0.7",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: tagText
                }
              ),
              /* @__PURE__ */ jsx14(
                "text",
                {
                  x: x + cardW - 16,
                  y: rowY + 29,
                  textAnchor: "end",
                  fill: "var(--ui-text-tertiary)",
                  fontSize: "10.5",
                  fontWeight: "650",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: `0${colorIdx + 1}`
                }
              )
            ] }),
            /* @__PURE__ */ jsx14(
              "text",
              {
                x: x + 16,
                y: rowY + (hasNum ? 66 : 56),
                fill: "var(--ui-text-primary)",
                fontSize: "13.5",
                fontWeight: "680",
                fontFamily: "system-ui, -apple-system, sans-serif",
                children: clipLabel(it.heading || `Highlight ${colorIdx + 1}`, maxTitleChars)
              }
            ),
            /* @__PURE__ */ jsx14(
              "text",
              {
                x: x + 16,
                y: rowY + (hasNum ? 85 : 76),
                fill: "var(--ui-text-secondary)",
                fontSize: "11.5",
                fontFamily: "system-ui, -apple-system, sans-serif",
                children: bodyLines.map((ln, lIdx) => /* @__PURE__ */ jsx14("tspan", { x: x + 16, dy: lIdx === 0 ? 0 : 16, children: ln }, lIdx))
              }
            ),
            renderCiteBadgesSvg(it.cites, x + cardW - 14, rowY + row.height - 24, col)
          ] }, it.id || `${rIdx}-${cIdx}`);
        }) }, `row-${rIdx}`);
      })
    ] });
  }
  function renderTimelineLayout() {
    const startY = HEADER_H + 18;
    const cardH = 96;
    const gap = 12;
    const spineX = PAD + 26;
    const cardX = PAD + 68;
    const cardW = CW - 68;
    const lastY = startY + (items.length - 1) * (cardH + gap) + 34;
    return /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsx14("line", { x1: spineX, y1: startY + 34, x2: spineX, y2: lastY, stroke: "var(--ui-stroke-secondary)", strokeWidth: "2.5", strokeDasharray: "4 4" }),
      items.map((it, idx) => {
        const y = startY + idx * (cardH + gap);
        const col = accentAt(idx);
        const isSel = selectedIdx === it._idx;
        const hasNum = Boolean(it._metric && it._metric.display);
        const bodyLines = wrapText(it.body, hasNum ? 74 : 96, 2);
        return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
          /* @__PURE__ */ jsx14("line", { x1: spineX + 16, y1: y + 34, x2: cardX, y2: y + 34, stroke: col, strokeOpacity: "0.65", strokeWidth: "1.5" }),
          /* @__PURE__ */ jsx14("circle", { cx: spineX, cy: y + 34, r: "17", fill: "var(--sb-bg)", stroke: col, strokeWidth: "2" }),
          /* @__PURE__ */ jsx14("circle", { cx: spineX, cy: y + 34, r: "12", fill: col, fillOpacity: "0.18" }),
          /* @__PURE__ */ jsx14("text", { x: spineX, y: y + 38, textAnchor: "middle", fill: col, fontSize: "11", fontWeight: "750", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: `0${idx + 1}` }),
          /* @__PURE__ */ jsx14(
            "rect",
            {
              x: cardX,
              y,
              width: cardW,
              height: cardH,
              rx: "11",
              fill: "var(--sb-surface)",
              stroke: isSel ? col : "var(--ui-stroke-secondary)",
              strokeWidth: isSel ? "1.8" : "1"
            }
          ),
          /* @__PURE__ */ jsx14("rect", { x: cardX, y: y + 12, width: "3", height: cardH - 24, rx: "1.5", fill: col }),
          /* @__PURE__ */ jsx14("text", { x: cardX + 18, y: y + 29, fill: "var(--ui-text-primary)", fontSize: "14.5", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: String(it.heading || `Step ${idx + 1}`).slice(0, 56) }),
          /* @__PURE__ */ jsx14("text", { x: cardX + 18, y: y + 50, fill: "var(--ui-text-secondary)", fontSize: "12", fontFamily: "system-ui, -apple-system, sans-serif", children: bodyLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: cardX + 18, dy: li === 0 ? 0 : 17, children: ln }, li)) }),
          hasNum ? /* @__PURE__ */ jsxs12("g", { children: [
            /* @__PURE__ */ jsx14("rect", { x: cardX + cardW - 146, y: y + 16, width: "128", height: "46", rx: "8", fill: col, fillOpacity: "0.12", stroke: col, strokeOpacity: "0.32", strokeWidth: "1" }),
            /* @__PURE__ */ jsx14("text", { x: cardX + cardW - 82, y: y + 42, textAnchor: "middle", fill: col, fontSize: "20", fontWeight: "800", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: it._metric.display }),
            /* @__PURE__ */ jsx14("text", { x: cardX + cardW - 82, y: y + 55, textAnchor: "middle", fill: "var(--ui-text-tertiary)", fontSize: "8.5", fontWeight: "700", letterSpacing: "0.7", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: it._tag })
          ] }) : null,
          renderCiteBadgesSvg(it.cites, cardX + cardW - 18, y + cardH - 24, col)
        ] }, it.id || idx);
      })
    ] });
  }
  function renderComparisonLayout() {
    const half = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, half);
    const rightItems = items.slice(half);
    const gap = 28;
    const colW = (CW - gap) / 2;
    const topY = HEADER_H + 16;
    const cardStartY = topY + 40;
    const colA = accentAt(0);
    const colB = accentAt(1);
    const midX = PAD + colW + gap / 2;
    const maxRows = Math.max(leftItems.length, rightItems.length, 1);
    const dividerBottom = cardStartY + maxRows * 124 + Math.max(0, maxRows - 1) * 12;
    const renderCol = (list, x, color, label, offsetIdx) => /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsx14("rect", { x, y: topY, width: colW, height: "30", rx: "8", fill: color, fillOpacity: "0.14", stroke: color, strokeOpacity: "0.36", strokeWidth: "1" }),
      /* @__PURE__ */ jsx14("circle", { cx: x + 14, cy: topY + 15, r: "4", fill: color }),
      /* @__PURE__ */ jsx14("text", { x: x + 26, y: topY + 19, fill: color, fontSize: "11", fontWeight: "750", letterSpacing: "0.8", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: label }),
      list.map((it, idx) => {
        const y = cardStartY + idx * 136;
        const isSel = selectedIdx === it._idx;
        const hasNum = Boolean(it._metric && it._metric.display);
        const bodyLines = wrapText(it.body, 48, 3);
        return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
          /* @__PURE__ */ jsx14(
            "rect",
            {
              x,
              y,
              width: colW,
              height: "124",
              rx: "10",
              fill: "var(--sb-surface)",
              stroke: isSel ? color : "var(--ui-stroke-secondary)",
              strokeWidth: isSel ? "1.8" : "1"
            }
          ),
          /* @__PURE__ */ jsx14("text", { x: x + 16, y: y + 26, fill: "var(--ui-text-primary)", fontSize: "13.5", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: String(it.heading || `Factor ${offsetIdx + idx + 1}`).slice(0, 34) }),
          hasNum ? /* @__PURE__ */ jsx14("text", { x: x + colW - 16, y: y + 28, textAnchor: "end", fill: color, fontSize: "18", fontWeight: "800", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: it._metric.display }) : null,
          hasNum ? /* @__PURE__ */ jsxs12(Fragment7, { children: [
            /* @__PURE__ */ jsx14("rect", { x: x + 16, y: y + 36, width: colW - 32, height: "4", rx: "2", fill: "var(--ui-stroke-tertiary)" }),
            /* @__PURE__ */ jsx14("rect", { x: x + 16, y: y + 36, width: Math.max(12, Math.round((colW - 32) * it._ratio)), height: "4", rx: "2", fill: color })
          ] }) : null,
          /* @__PURE__ */ jsx14("text", { x: x + 16, y: y + (hasNum ? 58 : 48), fill: "var(--ui-text-secondary)", fontSize: "11.5", fontFamily: "system-ui, -apple-system, sans-serif", children: bodyLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: x + 16, dy: li === 0 ? 0 : 16, children: ln }, li)) }),
          renderCiteBadgesSvg(it.cites, x + colW - 14, y + 98, color)
        ] }, it.id || idx);
      })
    ] });
    return /* @__PURE__ */ jsxs12("g", { children: [
      /* @__PURE__ */ jsx14("line", { x1: midX, y1: topY + 38, x2: midX, y2: dividerBottom, stroke: "var(--ui-stroke-tertiary)", strokeWidth: "1", strokeDasharray: "3 4" }),
      /* @__PURE__ */ jsx14("circle", { cx: midX, cy: topY + 15, r: "13", fill: "var(--sb-surface)", stroke: "var(--ui-stroke-secondary)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx14("text", { x: midX, y: topY + 19, textAnchor: "middle", fill: "var(--ui-text-tertiary)", fontSize: "9.5", fontWeight: "750", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: "VS" }),
      renderCol(leftItems, PAD, colA, `GROUP A  (${leftItems.length})`, 0),
      renderCol(rightItems, PAD + colW + gap, colB, `GROUP B  (${rightItems.length})`, half)
    ] });
  }
  function renderHubSpokeLayout() {
    const satellites = rest.slice(0, 6);
    const leftSats = satellites.filter((_, i) => i % 2 === 0);
    const rightSats = satellites.filter((_, i) => i % 2 === 1);
    const stageTop = HEADER_H + 18;
    const stageH = H - FOOTER_H - stageTop - 12;
    const cx = W / 2;
    const cy = stageTop + stageH / 2;
    const hubR = 82;
    const hubCol = accentAt(0);
    const cardW = 286;
    const cardH = 112;
    const renderSide = (list, side) => {
      const isLeft = side === "left";
      const x = isLeft ? PAD : W - PAD - cardW;
      const step = list.length ? stageH / list.length : stageH;
      return list.map((it, idx) => {
        const y = stageTop + idx * step + (step - cardH) / 2;
        const colorIdx = items.indexOf(it);
        const col = accentAt(colorIdx);
        const isSel = selectedIdx === it._idx;
        const anchorX = isLeft ? x + cardW : x;
        const anchorY = y + cardH / 2;
        const hubEdgeX = isLeft ? cx - hubR : cx + hubR;
        const ctrlOffset = isLeft ? -48 : 48;
        const d = `M ${hubEdgeX} ${cy} C ${hubEdgeX + ctrlOffset} ${cy}, ${anchorX - ctrlOffset} ${anchorY}, ${anchorX} ${anchorY}`;
        const bodyLines = wrapText(it.body, 36, 3);
        return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
          /* @__PURE__ */ jsx14("path", { d, fill: "none", stroke: col, strokeOpacity: "0.55", strokeWidth: "1.8" }),
          /* @__PURE__ */ jsx14("circle", { cx: anchorX, cy: anchorY, r: "4", fill: col }),
          /* @__PURE__ */ jsx14(
            "rect",
            {
              x,
              y,
              width: cardW,
              height: cardH,
              rx: "10",
              fill: "var(--sb-surface)",
              stroke: isSel ? col : "var(--ui-stroke-secondary)",
              strokeWidth: isSel ? "1.8" : "1"
            }
          ),
          /* @__PURE__ */ jsx14("text", { x: x + 14, y: y + 25, fill: "var(--ui-text-primary)", fontSize: "12.5", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: clipLabel(it.heading || "", it._metric?.display ? 26 : 34) }),
          it._metric?.display ? /* @__PURE__ */ jsx14("text", { x: x + cardW - 14, y: y + 26, textAnchor: "end", fill: col, fontSize: "15.5", fontWeight: "800", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: it._metric.display }) : null,
          /* @__PURE__ */ jsx14("text", { x: x + 14, y: y + 45, fill: "var(--ui-text-secondary)", fontSize: "11", fontFamily: "system-ui, -apple-system, sans-serif", children: bodyLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: x + 14, dy: li === 0 ? 0 : 15, children: ln }, li)) }),
          renderCiteBadgesSvg(it.cites, x + cardW - 12, y + cardH - 22, col)
        ] }, it.id || `${side}-${idx}`);
      });
    };
    const hubHeadingLines = wrapText(hero.heading || spec.title || "Core Topic", 16, 2);
    return /* @__PURE__ */ jsxs12("g", { children: [
      renderSide(leftSats, "left"),
      renderSide(rightSats, "right"),
      /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(hero), children: [
        /* @__PURE__ */ jsx14("circle", { cx, cy, r: hubR + 10, fill: hubCol, fillOpacity: "0.08", stroke: hubCol, strokeOpacity: "0.24", strokeDasharray: "4 4" }),
        /* @__PURE__ */ jsx14("circle", { cx, cy, r: hubR, fill: "var(--sb-surface)", stroke: hubCol, strokeWidth: "2.5" }),
        hero._metric?.display ? /* @__PURE__ */ jsx14("text", { x: cx, y: cy - 10, textAnchor: "middle", fill: hubCol, fontSize: "26", fontWeight: "800", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: hero._metric.display }) : null,
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: cx,
            y: cy + (hero._metric?.display ? 12 : -4),
            textAnchor: "middle",
            fill: "var(--ui-text-primary)",
            fontSize: "12",
            fontWeight: "700",
            fontFamily: "system-ui, -apple-system, sans-serif",
            children: hubHeadingLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: cx, dy: li === 0 ? 0 : 15, children: ln }, li))
          }
        ),
        /* @__PURE__ */ jsx14("text", { x: cx, y: cy + 46, textAnchor: "middle", fill: "var(--ui-text-tertiary)", fontSize: "8.5", fontWeight: "700", letterSpacing: "0.8", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: "CORE HUB" })
      ] })
    ] });
  }
  function renderPyramidLayout() {
    const tiers = items.slice(0, 6);
    const n = tiers.length;
    const topY = HEADER_H + 22;
    const tierH = 74;
    const gap = 10;
    const pyrCenter = PAD + 188;
    const maxW = 360;
    const minW = 104;
    const noteX = PAD + 404;
    const noteW = CW - 404;
    return /* @__PURE__ */ jsx14("g", { children: tiers.map((it, idx) => {
      const y = topY + idx * (tierH + gap);
      const col = accentAt(idx);
      const isSel = selectedIdx === it._idx;
      const wTop = minW + (maxW - minW) * idx / Math.max(n, 1);
      const wBot = minW + (maxW - minW) * (idx + 1) / Math.max(n, 1);
      const pts = [
        `${pyrCenter - wTop / 2},${y}`,
        `${pyrCenter + wTop / 2},${y}`,
        `${pyrCenter + wBot / 2},${y + tierH}`,
        `${pyrCenter - wBot / 2},${y + tierH}`
      ].join(" ");
      const rightMidX = pyrCenter + (wTop + wBot) / 4;
      const midY = y + tierH / 2;
      const bodyLines = wrapText(it.body, 56, 2);
      return /* @__PURE__ */ jsxs12("g", { style: { cursor: "pointer" }, onClick: () => handleBlockClick(it), children: [
        /* @__PURE__ */ jsx14("polygon", { points: pts, fill: col, fillOpacity: isSel ? "0.28" : "0.16", stroke: col, strokeWidth: isSel ? "2" : "1.3" }),
        /* @__PURE__ */ jsx14(
          "text",
          {
            x: pyrCenter,
            y: midY + (it._metric?.display ? 1 : 5),
            textAnchor: "middle",
            fill: col,
            fontSize: it._metric?.display ? "18" : "13",
            fontWeight: "800",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            children: it._metric?.display || `TIER 0${idx + 1}`
          }
        ),
        it._metric?.display ? /* @__PURE__ */ jsx14("text", { x: pyrCenter, y: midY + 17, textAnchor: "middle", fill: "var(--ui-text-secondary)", fontSize: "8.5", fontWeight: "700", letterSpacing: "0.7", fontFamily: "ui-monospace, SFMono-Regular, monospace", children: it._tag }) : null,
        /* @__PURE__ */ jsx14("line", { x1: rightMidX + 4, y1: midY, x2: noteX, y2: midY, stroke: col, strokeOpacity: "0.6", strokeWidth: "1.3", strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsx14("circle", { cx: noteX, cy: midY, r: "3.5", fill: col }),
        /* @__PURE__ */ jsx14(
          "rect",
          {
            x: noteX,
            y,
            width: noteW,
            height: tierH,
            rx: "10",
            fill: "var(--sb-surface)",
            stroke: isSel ? col : "var(--ui-stroke-secondary)",
            strokeWidth: isSel ? "1.8" : "1"
          }
        ),
        /* @__PURE__ */ jsx14("text", { x: noteX + 16, y: y + 24, fill: "var(--ui-text-primary)", fontSize: "13", fontWeight: "700", fontFamily: "system-ui, -apple-system, sans-serif", children: String(it.heading || `Tier ${idx + 1}`).slice(0, 44) }),
        /* @__PURE__ */ jsx14("text", { x: noteX + 16, y: y + 43, fill: "var(--ui-text-secondary)", fontSize: "11.5", fontFamily: "system-ui, -apple-system, sans-serif", children: bodyLines.map((ln, li) => /* @__PURE__ */ jsx14("tspan", { x: noteX + 16, dy: li === 0 ? 0 : 15, children: ln }, li)) }),
        renderCiteBadgesSvg(it.cites, noteX + noteW - 14, y + tierH - 22, col)
      ] }, it.id || idx);
    }) });
  }
  const selectedBlock = selectedIdx != null ? items[selectedIdx] : null;
  return /* @__PURE__ */ jsxs12("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxs12("div", { className: "sb-inf-toolbar", children: [
      /* @__PURE__ */ jsx14("div", { className: "sb-seg", role: "group", "aria-label": "Infographic layout", children: LAYOUT_OPTIONS.map((opt) => /* @__PURE__ */ jsx14(
        "button",
        {
          type: "button",
          className: "sb-seg-btn",
          "data-active": layout === opt.id,
          onClick: () => setLayout(opt.id),
          children: opt.label
        },
        opt.id
      )) }),
      /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx14(
          "select",
          {
            className: "sb-select",
            value: paletteKey,
            onChange: (e) => setPaletteKey(e.target.value),
            "aria-label": "Infographic color palette",
            title: "Switch visual color palette",
            children: Object.entries(PALETTES).map(([k, p]) => /* @__PURE__ */ jsx14("option", { value: k, children: p.label }, k))
          }
        ),
        /* @__PURE__ */ jsxs12("button", { type: "button", className: "sb-btn", onClick: handleCopySvg, title: "Copy standalone vector SVG", children: [
          /* @__PURE__ */ jsx14(Icon, { name: "Copy", size: 12 }),
          " Copy SVG"
        ] }),
        /* @__PURE__ */ jsxs12("button", { type: "button", className: "sb-btn", onClick: handleDownloadSvg, title: "Download vector .svg file", children: [
          /* @__PURE__ */ jsx14(Icon, { name: "Download", size: 12 }),
          " SVG"
        ] }),
        /* @__PURE__ */ jsxs12("button", { type: "button", className: "sb-btn sb-btn-primary", disabled: exportingPng, onClick: handleDownloadPng, title: "Download high-resolution 2x PNG", children: [
          /* @__PURE__ */ jsx14(Icon, { name: "ImageDown", size: 12 }),
          " ",
          exportingPng ? "Exporting..." : "PNG"
        ] })
      ] })
    ] }),
    spec.hero_image_url ? /* @__PURE__ */ jsx14(
      "img",
      {
        src: spec.hero_image_url,
        alt: spec.title || "Infographic hero visual",
        style: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid var(--ui-stroke-secondary)" }
      }
    ) : null,
    /* @__PURE__ */ jsx14("div", { className: "sb-svg-stage", children: /* @__PURE__ */ jsxs12(
      "svg",
      {
        ref: svgRef,
        role: "img",
        "aria-labelledby": `${titleId} ${descId}`,
        width: "100%",
        viewBox: `0 0 ${W} ${H}`,
        style: { display: "block", background: "var(--sb-bg)" },
        children: [
          /* @__PURE__ */ jsx14("title", { id: titleId, children: spec.title || "Infographic" }),
          /* @__PURE__ */ jsx14("desc", { id: descId, children: spec.subtitle || `Structured ${layout} infographic with ${blocks.length} cited items.` }),
          /* @__PURE__ */ jsxs12("defs", { children: [
            /* @__PURE__ */ jsxs12("linearGradient", { id: `sb-top-grad-${uid}`, x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
              /* @__PURE__ */ jsx14("stop", { offset: "0%", stopColor: accentAt(0) }),
              /* @__PURE__ */ jsx14("stop", { offset: "50%", stopColor: accentAt(1) }),
              /* @__PURE__ */ jsx14("stop", { offset: "100%", stopColor: accentAt(2) })
            ] }),
            /* @__PURE__ */ jsxs12("linearGradient", { id: `sb-hero-wash-${uid}`, x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
              /* @__PURE__ */ jsx14("stop", { offset: "0%", stopColor: accentAt(0), stopOpacity: "0.11" }),
              /* @__PURE__ */ jsx14("stop", { offset: "48%", stopColor: "var(--sb-surface)", stopOpacity: "1" }),
              /* @__PURE__ */ jsx14("stop", { offset: "100%", stopColor: "var(--sb-surface)", stopOpacity: "1" })
            ] }),
            /* @__PURE__ */ jsxs12("pattern", { id: `sb-bayer-grid-${uid}`, width: "8", height: "8", patternUnits: "userSpaceOnUse", children: [
              /* @__PURE__ */ jsx14("rect", { x: "0", y: "0", width: "1.5", height: "1.5", fill: accentAt(0), fillOpacity: "0.22" }),
              /* @__PURE__ */ jsx14("rect", { x: "4", y: "4", width: "1.5", height: "1.5", fill: accentAt(1), fillOpacity: "0.18" })
            ] })
          ] }),
          /* @__PURE__ */ jsx14("rect", { x: "0", y: "0", width: W, height: H, fill: "var(--sb-bg)" }),
          /* @__PURE__ */ jsx14("rect", { x: "0", y: "0", width: W, height: "92", fill: `url(#sb-bayer-grid-${uid})`, opacity: "0.7" }),
          renderHeader(),
          layout === "stat-grid" ? renderBentoLayout() : null,
          layout === "timeline" ? renderTimelineLayout() : null,
          layout === "comparison" ? renderComparisonLayout() : null,
          layout === "hub-spoke" ? renderHubSpokeLayout() : null,
          layout === "pyramid" ? renderPyramidLayout() : null,
          renderFooter()
        ]
      }
    ) }),
    selectedBlock ? /* @__PURE__ */ jsxs12("div", { className: "sb-inf-detail", children: [
      /* @__PURE__ */ jsxs12("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
          selectedBlock._metric?.display ? /* @__PURE__ */ jsx14("span", { className: "sb-mono", style: { fontWeight: 750, fontSize: 13, color: accentAt(selectedBlock._idx) }, children: selectedBlock._metric.display }) : null,
          /* @__PURE__ */ jsx14("span", { style: { fontWeight: 650, color: "var(--ui-text-primary)", fontSize: 12.5 }, children: selectedBlock.heading })
        ] }),
        /* @__PURE__ */ jsxs12("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          (selectedBlock.cites || []).map((cid) => /* @__PURE__ */ jsxs12(
            "button",
            {
              type: "button",
              className: "sb-btn",
              onClick: () => onOpenChunk?.(cid),
              children: [
                /* @__PURE__ */ jsx14(Icon, { name: "BookOpen", size: 12 }),
                " Inspect Passage [",
                enriched.citeNum[cid] || 1,
                "]"
              ]
            },
            cid
          )),
          /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setSelectedIdx(null), "aria-label": "Close detail", children: /* @__PURE__ */ jsx14(Icon, { name: "X", size: 12 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx14("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.5 }, children: selectedBlock.body })
    ] }) : null,
    /* @__PURE__ */ jsxs12("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx14("span", { style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: "Cited passages:" }),
      enriched.citeOrder.map((cid, idx) => /* @__PURE__ */ jsx14("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: idx + 1 }, cid))
    ] })
  ] });
}

// desktop-src/components/renderers/DataTableView.jsx
import { Fragment as Fragment8, useMemo as useMemo3, useState as useState10 } from "react";
import { Fragment as Fragment9, jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
var BADGE_TONES = [
  { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.13)", border: "rgba(59, 130, 246, 0.30)" },
  { color: "#10b981", bg: "rgba(16, 185, 129, 0.13)", border: "rgba(16, 185, 129, 0.30)" },
  { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.13)", border: "rgba(56, 189, 248, 0.30)" },
  { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.13)", border: "rgba(245, 158, 11, 0.30)" },
  { color: "#f43f5e", bg: "rgba(244, 63, 94, 0.13)", border: "rgba(244, 63, 94, 0.30)" },
  { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.13)", border: "rgba(139, 92, 246, 0.30)" }
];
function hashTone(label) {
  const s = String(label || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = h * 31 + s.charCodeAt(i) >>> 0;
  }
  return BADGE_TONES[h % BADGE_TONES.length];
}
function cleanSourceLabel(raw) {
  return String(raw || "").replace(/\.(md|markdown|txt|pdf|docx|csv|json|html)$/i, "").trim();
}
function parseCellMetric(val) {
  const raw = String(val ?? "").trim();
  if (!raw || /^(qualitative|n\/a|none|null|-|--)$/i.test(raw)) {
    return { isMetric: false, isPlaceholder: Boolean(raw), display: raw || "-", num: null, unit: "", group: "none" };
  }
  const m = raw.match(/^([~$+<>=]*)\s*(-?\d+(?:[.,]\d+)?)\s*(%|ms|us|s|sec|min|hr|h|x|GB|MB|KB|MiB|GiB|TB|k|M|B|px|fps|rps|qps)?$/i);
  if (!m) {
    return { isMetric: false, isPlaceholder: false, display: raw, num: null, unit: "", group: "text" };
  }
  const num = parseFloat(m[2].replace(/,/g, ""));
  const unit = m[3] || "";
  const uLow = unit.toLowerCase();
  let group = "count";
  if (unit === "%") group = "percent";
  else if (["ms", "us", "s", "sec"].includes(uLow)) group = "latency";
  else if (uLow === "x") group = "multiplier";
  else if (["gb", "mb", "kb", "mib", "gib", "tb"].includes(uLow)) group = "memory";
  else if ((m[1] || "").includes("$")) group = "currency";
  return {
    isMetric: Number.isFinite(num),
    isPlaceholder: false,
    display: `${m[1] || ""}${m[2]}${unit}`,
    num: Number.isFinite(num) ? num : null,
    unit,
    group
  };
}
function barColorForGroup(group) {
  if (group === "percent") return "#10b981";
  if (group === "latency") return "#38bdf8";
  if (group === "currency") return "#f59e0b";
  return "var(--ui-accent)";
}
function DataTableView({ artifact, onOpenChunk }) {
  const cols = artifact?.spec?.columns || [];
  const rows = artifact?.spec?.rows || [];
  const [query, setQuery] = useState10("");
  const [sort, setSort] = useState10({ key: null, dir: "asc" });
  const [viewMode, setViewMode] = useState10("table");
  const [density, setDensity] = useState10("comfortable");
  const [activeFacet, setActiveFacet] = useState10("ALL");
  const [metricsOnly, setMetricsOnly] = useState10(false);
  const [expandedRowId, setExpandedRowId] = useState10(null);
  const [hiddenCols, setHiddenCols] = useState10({});
  const [showColMenu, setShowColMenu] = useState10(false);
  const meta = useMemo3(() => {
    const colRoles = {};
    let facetCol = null;
    let metricCol = null;
    let textCol = null;
    for (const c of cols) {
      const k = String(c.key || "").toLowerCase();
      const lbl = String(c.label || "").toLowerCase();
      const vals = rows.map((r) => String(r.cells?.[c.key] ?? "").trim()).filter(Boolean);
      const distinct = Array.from(new Set(vals));
      const metricHits = vals.filter((v) => parseCellMetric(v).isMetric).length;
      const avgLen = vals.length ? vals.reduce((a, b) => a + b.length, 0) / vals.length : 0;
      if (c.type === "number" || /metric|score|latency|rate|value|count|amount|pct|percent|time|size/.test(k + " " + lbl) || vals.length && metricHits / vals.length >= 0.25) {
        colRoles[c.key] = "metric";
        if (!metricCol) metricCol = c.key;
      } else if (c.type === "url") {
        colRoles[c.key] = "url";
      } else if (!facetCol && (/source|category|group|type|status|component|engine|system|doc/.test(k + " " + lbl) || distinct.length >= 2 && distinct.length <= 8 && avgLen < 48)) {
        colRoles[c.key] = "badge";
        facetCol = c.key;
      } else if (/section|topic|stage|phase|area|tag/.test(k + " " + lbl) || distinct.length <= Math.max(2, rows.length * 0.8) && avgLen < 38) {
        colRoles[c.key] = "tag";
      } else {
        colRoles[c.key] = avgLen > 45 ? "longtext" : "text";
        if (avgLen > 45 && !textCol) textCol = c.key;
      }
    }
    const facetCounts = [];
    if (facetCol) {
      const map = /* @__PURE__ */ new Map();
      for (const r of rows) {
        const v = String(r.cells?.[facetCol] ?? "").trim();
        if (!v) continue;
        map.set(v, (map.get(v) || 0) + 1);
      }
      for (const [value, count] of map.entries()) {
        facetCounts.push({ value, label: cleanSourceLabel(value), count, tone: hashTone(value) });
      }
      facetCounts.sort((a, b) => b.count - a.count);
    }
    const groupMax = {};
    let quantifiedCount = 0;
    let peakMetric = null;
    const chartEntries = [];
    rows.forEach((r, idx) => {
      if (!metricCol) return;
      const pm = parseCellMetric(r.cells?.[metricCol]);
      if (pm.isMetric && pm.num != null) {
        quantifiedCount += 1;
        groupMax[pm.group] = Math.max(groupMax[pm.group] || 0, Math.abs(pm.num));
        const score = pm.group === "percent" ? 1e4 + pm.num : 1e3 + pm.num;
        if (!peakMetric || score > peakMetric.score) {
          peakMetric = { display: pm.display, group: pm.group, score, label: r.cells?.[facetCol] || r.cells?.[cols[0]?.key] || "" };
        }
        chartEntries.push({
          row: r,
          idx,
          metric: pm,
          source: facetCol ? cleanSourceLabel(r.cells?.[facetCol] || "") : "",
          title: cols.find((c) => colRoles[c.key] === "tag") && r.cells?.[cols.find((c) => colRoles[c.key] === "tag").key] || cols[0] && cleanSourceLabel(r.cells?.[cols[0].key]) || `Row ${idx + 1}`,
          detail: textCol ? String(r.cells?.[textCol] || "") : ""
        });
      }
    });
    const distinctSources = facetCounts.length || new Set(rows.flatMap((r) => r.cites || [])).size;
    return {
      colRoles,
      facetCol,
      metricCol,
      textCol,
      facetCounts,
      groupMax,
      quantifiedCount,
      peakMetric,
      distinctSources,
      chartEntries
    };
  }, [cols, rows]);
  const visibleCols = useMemo3(
    () => cols.filter((c) => !hiddenCols[c.key]),
    [cols, hiddenCols]
  );
  const filtered = useMemo3(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (activeFacet !== "ALL" && meta.facetCol) {
        if (String(r.cells?.[meta.facetCol] ?? "").trim() !== activeFacet) return false;
      }
      if (metricsOnly && meta.metricCol) {
        if (!parseCellMetric(r.cells?.[meta.metricCol]).isMetric) return false;
      }
      if (q) {
        const hit = Object.values(r.cells || {}).some((v) => String(v ?? "").toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
    if (sort.key) {
      list = [...list].sort((a, b) => {
        const av = a.cells?.[sort.key] ?? "";
        const bv = b.cells?.[sort.key] ?? "";
        const am = parseCellMetric(av);
        const bm = parseCellMetric(bv);
        let cmp = 0;
        if (am.isMetric && bm.isMetric) {
          cmp = (am.num ?? 0) - (bm.num ?? 0);
        } else if (am.isMetric !== bm.isMetric) {
          cmp = am.isMetric ? -1 : 1;
        } else {
          cmp = String(av).localeCompare(String(bv));
        }
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, query, sort, activeFacet, metricsOnly, meta.facetCol, meta.metricCol]);
  if (!cols.length) {
    return /* @__PURE__ */ jsx15("div", { className: "sb-empty", children: "No table columns available." });
  }
  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: "asc" };
    });
  }
  function toggleCol(key) {
    const shownCount = cols.filter((c) => !hiddenCols[c.key]).length;
    if (!hiddenCols[key] && shownCount <= 1) return;
    setHiddenCols((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function metricRatio(pm) {
    if (!pm.isMetric || pm.num == null) return 0;
    if (pm.group === "percent") return Math.max(0.05, Math.min(1, Math.abs(pm.num) / 100));
    const mx = meta.groupMax[pm.group] || Math.abs(pm.num) || 1;
    return Math.max(0.08, Math.min(1, Math.abs(pm.num) / mx));
  }
  function toMarkdown() {
    const useCols = visibleCols;
    const head = "| " + useCols.map((c) => c.label || c.key).join(" | ") + " |";
    const sep = "| " + useCols.map((c) => meta.colRoles[c.key] === "metric" ? "---:" : "---").join(" | ") + " |";
    const body = filtered.map((r) => "| " + useCols.map((c) => String(r.cells?.[c.key] ?? "").replace(/\|/g, "\\|")).join(" | ") + " |");
    return [head, sep, ...body].join("\n");
  }
  function exportCsv() {
    const useCols = visibleCols;
    const out = [useCols.map((c) => c.label || c.key).concat("Citations")];
    for (const r of filtered) {
      out.push(useCols.map((c) => String(r.cells?.[c.key] ?? "")).concat((r.cites || []).join("; ")));
    }
    const csv = out.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadTextFile(`${artifact.id || "table"}.csv`, csv, "text/csv;charset=utf-8");
  }
  function exportJson() {
    const payload = filtered.map((r) => ({
      ...r.cells,
      citations: r.cites || []
    }));
    downloadTextFile(`${artifact.id || "table"}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }
  async function copyRow(e, row) {
    e.stopPropagation();
    const line = visibleCols.map((c) => `${c.label || c.key}: ${row.cells?.[c.key] ?? ""}`).join(" | ");
    await copyText(line);
    sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied row to clipboard." });
  }
  function renderCell(col, row) {
    const val = row.cells?.[col.key] ?? "";
    const role = meta.colRoles[col.key];
    if (role === "badge") {
      const tone = hashTone(val);
      const label = cleanSourceLabel(val);
      return /* @__PURE__ */ jsxs13(
        "span",
        {
          className: "sb-dt-badge",
          title: String(val),
          style: { background: tone.bg, borderColor: tone.border, color: tone.color },
          children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-dt-dot", style: { background: tone.color } }),
            /* @__PURE__ */ jsx15("span", { className: "sb-dt-badge-txt", children: label })
          ]
        }
      );
    }
    if (role === "tag") {
      return /* @__PURE__ */ jsx15("span", { className: "sb-dt-tag", title: String(val), children: String(val) });
    }
    if (role === "metric") {
      const pm = parseCellMetric(val);
      if (!pm.isMetric) {
        return /* @__PURE__ */ jsx15("span", { className: "sb-dt-qual", children: pm.display });
      }
      const ratio = metricRatio(pm);
      const color = barColorForGroup(pm.group);
      return /* @__PURE__ */ jsxs13("div", { className: "sb-dt-metric-cell", children: [
        /* @__PURE__ */ jsx15("span", { className: "sb-mono sb-dt-metric-val", style: { color }, children: pm.display }),
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-track", children: /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-fill", style: { width: `${Math.round(ratio * 100)}%`, background: color } }) })
      ] });
    }
    if (role === "url" && /^https?:\/\//i.test(String(val))) {
      return /* @__PURE__ */ jsx15("a", { className: "sb-link", href: String(val), target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), children: String(val).replace(/^https?:\/\/(www\.)?/, "").slice(0, 34) });
    }
    return /* @__PURE__ */ jsx15("div", { className: density === "compact" ? "sb-dt-clamp-1" : "sb-dt-clamp-2", children: String(val) });
  }
  const chartGroups = useMemo3(() => {
    const visibleIds = new Set(filtered.map((r) => r.id));
    const byGroup = /* @__PURE__ */ new Map();
    for (const entry of meta.chartEntries) {
      if (entry.row.id && !visibleIds.has(entry.row.id)) continue;
      const g = entry.metric.group;
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(entry);
    }
    const labels = {
      percent: "Percentages (%)",
      latency: "Latency & Timing",
      multiplier: "Multipliers",
      memory: "Memory & Storage",
      currency: "Financial Values",
      count: "Numeric Counts"
    };
    return Array.from(byGroup.entries()).map(([group, entries]) => ({
      group,
      label: labels[group] || group,
      color: barColorForGroup(group),
      entries: [...entries].sort((a, b) => (b.metric.num ?? 0) - (a.metric.num ?? 0))
    }));
  }, [meta.chartEntries, filtered]);
  const pctQuantified = rows.length ? Math.round(meta.quantifiedCount / rows.length * 100) : 0;
  return /* @__PURE__ */ jsxs13("div", { className: "sb-dt-root", children: [
    /* @__PURE__ */ jsxs13("div", { className: "sb-dt-kpis", children: [
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-lbl", children: "Rows" }),
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-val sb-mono", children: filtered.length === rows.length ? rows.length : `${filtered.length} / ${rows.length}` })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-lbl", children: "Quantified" }),
        /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxs13("span", { className: "sb-dt-kpi-val sb-mono", style: { color: "#10b981" }, children: [
            meta.quantifiedCount,
            "/",
            rows.length
          ] }),
          /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-track", style: { flex: 1, maxWidth: 68 }, children: /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-fill", style: { width: `${pctQuantified}%`, background: "#10b981" } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-lbl", children: "Sources" }),
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-val sb-mono", children: meta.distinctSources })
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-kpi", children: [
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-lbl", children: "Peak Metric" }),
        /* @__PURE__ */ jsx15("div", { className: "sb-dt-kpi-val sb-mono", style: { color: "var(--ui-accent)" }, children: meta.peakMetric ? meta.peakMetric.display : `${cols.length} cols` })
      ] })
    ] }),
    /* @__PURE__ */ jsxs13("div", { className: "sb-dt-toolbar", children: [
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-search-wrap", children: [
        /* @__PURE__ */ jsx15(Icon, { name: "Search", size: 13, style: { color: "var(--ui-text-tertiary)", flexShrink: 0 } }),
        /* @__PURE__ */ jsx15(
          "input",
          {
            className: "sb-dt-search",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: "Search rows, metrics, or findings...",
            "aria-label": "Filter table rows"
          }
        ),
        query ? /* @__PURE__ */ jsx15("button", { type: "button", className: "sb-dt-clear", onClick: () => setQuery(""), "aria-label": "Clear filter", children: /* @__PURE__ */ jsx15(Icon, { name: "X", size: 12 }) }) : null
      ] }),
      /* @__PURE__ */ jsxs13("div", { className: "sb-seg", role: "group", "aria-label": "Data view mode", children: [
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "table", onClick: () => setViewMode("table"), children: [
          /* @__PURE__ */ jsx15(Icon, { name: "Table", size: 12 }),
          " Table"
        ] }),
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "cards", onClick: () => setViewMode("cards"), children: [
          /* @__PURE__ */ jsx15(Icon, { name: "LayoutGrid", size: 12 }),
          " Cards"
        ] }),
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "chart", onClick: () => setViewMode("chart"), children: [
          /* @__PURE__ */ jsx15(Icon, { name: "BarChart2", size: 12 }),
          " Chart"
        ] })
      ] }),
      viewMode === "table" ? /* @__PURE__ */ jsxs13("div", { style: { display: "flex", gap: 5, position: "relative" }, children: [
        /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-btn",
            onClick: () => setDensity((d) => d === "comfortable" ? "compact" : "comfortable"),
            title: "Toggle row density",
            children: [
              /* @__PURE__ */ jsx15(Icon, { name: "List", size: 12 }),
              " ",
              density === "comfortable" ? "Comfortable" : "Compact"
            ]
          }
        ),
        /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-btn",
            "data-active": showColMenu,
            onClick: () => setShowColMenu((v) => !v),
            title: "Show or hide columns",
            children: [
              /* @__PURE__ */ jsx15(Icon, { name: "Columns3", size: 12 }),
              " Columns"
            ]
          }
        ),
        showColMenu ? /* @__PURE__ */ jsxs13("div", { className: "sb-dt-col-menu", children: [
          /* @__PURE__ */ jsx15("div", { style: { fontSize: 10.5, fontWeight: 650, color: "var(--ui-text-tertiary)", padding: "2px 6px 4px", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Visible Columns" }),
          cols.map((c) => /* @__PURE__ */ jsxs13("label", { className: "sb-dt-col-opt", children: [
            /* @__PURE__ */ jsx15(
              "input",
              {
                type: "checkbox",
                className: "sb-checkbox",
                style: { margin: 0 },
                checked: !hiddenCols[c.key],
                onChange: () => toggleCol(c.key)
              }
            ),
            /* @__PURE__ */ jsx15("span", { children: c.label || c.key })
          ] }, c.key))
        ] }) : null
      ] }) : null,
      /* @__PURE__ */ jsxs13("div", { style: { display: "flex", gap: 5 }, children: [
        /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-btn",
            onClick: async () => {
              await copyText(toMarkdown());
              sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied Markdown table." });
            },
            title: "Copy filtered rows as Markdown",
            children: [
              /* @__PURE__ */ jsx15(Icon, { name: "Copy", size: 12 }),
              " MD"
            ]
          }
        ),
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: exportCsv, title: "Download CSV", children: [
          /* @__PURE__ */ jsx15(Icon, { name: "Download", size: 12 }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: exportJson, title: "Download JSON", children: [
          /* @__PURE__ */ jsx15(Icon, { name: "FileJson", size: 12 }),
          " JSON"
        ] })
      ] })
    ] }),
    meta.facetCounts.length > 1 || meta.quantifiedCount > 0 ? /* @__PURE__ */ jsxs13("div", { className: "sb-dt-facets", children: [
      meta.facetCounts.length > 1 ? /* @__PURE__ */ jsxs13(Fragment9, { children: [
        /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-dt-facet-chip",
            "data-active": activeFacet === "ALL",
            onClick: () => setActiveFacet("ALL"),
            children: [
              "All ",
              /* @__PURE__ */ jsx15("span", { className: "sb-dt-facet-n", children: rows.length })
            ]
          }
        ),
        meta.facetCounts.map((f) => /* @__PURE__ */ jsxs13(
          "button",
          {
            type: "button",
            className: "sb-dt-facet-chip",
            "data-active": activeFacet === f.value,
            onClick: () => setActiveFacet((prev) => prev === f.value ? "ALL" : f.value),
            title: f.value,
            children: [
              /* @__PURE__ */ jsx15("span", { className: "sb-dt-dot", style: { background: f.tone.color } }),
              /* @__PURE__ */ jsx15("span", { children: f.label.length > 19 ? f.label.slice(0, 17).trimEnd() + "..." : f.label }),
              /* @__PURE__ */ jsx15("span", { className: "sb-dt-facet-n", children: f.count })
            ]
          },
          f.value
        ))
      ] }) : null,
      meta.quantifiedCount > 0 && meta.quantifiedCount < rows.length ? /* @__PURE__ */ jsxs13(
        "button",
        {
          type: "button",
          className: "sb-dt-facet-chip",
          style: { marginLeft: "auto" },
          "data-active": metricsOnly,
          onClick: () => setMetricsOnly((v) => !v),
          title: "Show only rows with quantified numeric metrics",
          children: [
            /* @__PURE__ */ jsx15(Icon, { name: "Filter", size: 11 }),
            " Metrics only ",
            /* @__PURE__ */ jsx15("span", { className: "sb-dt-facet-n", children: meta.quantifiedCount })
          ]
        }
      ) : null
    ] }) : null,
    viewMode === "table" ? /* @__PURE__ */ jsx15("div", { className: "sb-table-wrap sb-scroll sb-dt-table-stage", children: /* @__PURE__ */ jsxs13("table", { className: "sb-table", "data-density": density, children: [
      /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
        /* @__PURE__ */ jsx15("th", { style: { width: 28, cursor: "default" } }),
        visibleCols.map((c) => {
          const isMetric = meta.colRoles[c.key] === "metric";
          const active = sort.key === c.key;
          return /* @__PURE__ */ jsx15(
            "th",
            {
              "data-sorted": active ? sort.dir : void 0,
              style: { textAlign: isMetric ? "right" : "left" },
              onClick: () => toggleSort(c.key),
              children: /* @__PURE__ */ jsxs13("span", { className: "sb-dt-th-inner", style: { justifyContent: isMetric ? "flex-end" : "flex-start" }, children: [
                /* @__PURE__ */ jsx15("span", { children: c.label || c.key }),
                /* @__PURE__ */ jsx15(
                  Icon,
                  {
                    name: active ? sort.dir === "asc" ? "ArrowUp" : "ArrowDown" : "ArrowUpDown",
                    size: 11,
                    style: { opacity: active ? 1 : 0.35, color: active ? "var(--ui-accent)" : "currentColor" }
                  }
                )
              ] })
            },
            c.key
          );
        }),
        /* @__PURE__ */ jsx15("th", { style: { width: 82, textAlign: "right", cursor: "default" }, children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx15("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ jsx15("tr", { children: /* @__PURE__ */ jsx15("td", { colSpan: visibleCols.length + 2, style: { textAlign: "center", padding: "32px 16px", color: "var(--ui-text-tertiary)" }, children: "No rows match your current filter." }) }) : filtered.map((r, rIdx) => {
        const rowKey = r.id || `row-${rIdx}`;
        const isExp = expandedRowId === rowKey;
        return /* @__PURE__ */ jsxs13(Fragment8, { children: [
          /* @__PURE__ */ jsxs13(
            "tr",
            {
              className: "sb-dt-row",
              "data-expanded": isExp,
              onClick: () => setExpandedRowId((prev) => prev === rowKey ? null : rowKey),
              children: [
                /* @__PURE__ */ jsx15("td", { style: { width: 28, color: "var(--ui-text-tertiary)", paddingRight: 4 }, children: /* @__PURE__ */ jsx15(Icon, { name: isExp ? "ChevronDown" : "ChevronRight", size: 13 }) }),
                visibleCols.map((c) => {
                  const isMetric = meta.colRoles[c.key] === "metric";
                  return /* @__PURE__ */ jsx15(
                    "td",
                    {
                      className: isMetric ? "sb-num" : void 0,
                      style: {
                        textAlign: isMetric ? "right" : "left",
                        width: meta.colRoles[c.key] === "metric" ? 112 : meta.colRoles[c.key] === "badge" ? 196 : meta.colRoles[c.key] === "tag" ? 168 : void 0
                      },
                      children: renderCell(c, r)
                    },
                    c.key
                  );
                }),
                /* @__PURE__ */ jsx15("td", { style: { whiteSpace: "nowrap", textAlign: "right" }, children: /* @__PURE__ */ jsxs13("div", { className: "sb-dt-row-actions", children: [
                  /* @__PURE__ */ jsx15(
                    "button",
                    {
                      type: "button",
                      className: "sb-dt-copy-btn",
                      onClick: (e) => copyRow(e, r),
                      title: "Copy row",
                      "aria-label": "Copy row",
                      children: /* @__PURE__ */ jsx15(Icon, { name: "Copy", size: 12 })
                    }
                  ),
                  (r.cites || []).map((cid, idx) => /* @__PURE__ */ jsx15(
                    "button",
                    {
                      type: "button",
                      className: "sb-cite",
                      onClick: (e) => {
                        e.stopPropagation();
                        onOpenChunk?.(cid);
                      },
                      title: `Inspect passage ${cid}`,
                      children: idx + 1
                    },
                    cid
                  ))
                ] }) })
              ]
            }
          ),
          isExp ? /* @__PURE__ */ jsx15("tr", { className: "sb-dt-detail-row", children: /* @__PURE__ */ jsx15("td", { colSpan: visibleCols.length + 2, children: /* @__PURE__ */ jsxs13("div", { className: "sb-dt-detail-panel", children: [
            /* @__PURE__ */ jsx15("div", { className: "sb-dt-detail-grid", children: cols.map((c) => /* @__PURE__ */ jsxs13("div", { className: "sb-dt-detail-field", style: meta.colRoles[c.key] === "longtext" ? { gridColumn: "1 / -1" } : void 0, children: [
              /* @__PURE__ */ jsx15("div", { className: "sb-dt-detail-key", children: c.label || c.key }),
              /* @__PURE__ */ jsx15("div", { className: "sb-dt-detail-val", children: String(r.cells?.[c.key] ?? "") })
            ] }, c.key)) }),
            (r.cites || []).length ? /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: [
              /* @__PURE__ */ jsx15("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: "Source passages:" }),
              (r.cites || []).map((cid, idx) => /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn", onClick: () => onOpenChunk?.(cid), children: [
                /* @__PURE__ */ jsx15(Icon, { name: "BookOpen", size: 12 }),
                " Inspect [",
                idx + 1,
                "]"
              ] }, cid))
            ] }) : null
          ] }) }) }) : null
        ] }, rowKey);
      }) })
    ] }) }) : null,
    viewMode === "cards" ? /* @__PURE__ */ jsx15("div", { className: "sb-dt-cards-grid", children: filtered.map((r, idx) => {
      const facetVal = meta.facetCol ? r.cells?.[meta.facetCol] : "";
      const tone = hashTone(facetVal);
      const pm = meta.metricCol ? parseCellMetric(r.cells?.[meta.metricCol]) : null;
      const tagCol = cols.find((c) => meta.colRoles[c.key] === "tag");
      const bodyCol = cols.find((c) => meta.colRoles[c.key] === "longtext") || cols[cols.length - 1];
      return /* @__PURE__ */ jsxs13("div", { className: "sb-dt-card", children: [
        /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }, children: [
          facetVal ? /* @__PURE__ */ jsxs13("span", { className: "sb-dt-badge", style: { background: tone.bg, borderColor: tone.border, color: tone.color }, children: [
            /* @__PURE__ */ jsx15("span", { className: "sb-dt-dot", style: { background: tone.color } }),
            /* @__PURE__ */ jsx15("span", { className: "sb-dt-badge-txt", children: cleanSourceLabel(facetVal) })
          ] }) : /* @__PURE__ */ jsx15("span", {}),
          pm?.isMetric ? /* @__PURE__ */ jsx15("span", { className: "sb-mono", style: { fontSize: 17, fontWeight: 750, color: barColorForGroup(pm.group) }, children: pm.display }) : pm ? /* @__PURE__ */ jsx15("span", { className: "sb-dt-qual", children: pm.display }) : null
        ] }),
        tagCol && r.cells?.[tagCol.key] ? /* @__PURE__ */ jsx15("div", { style: { fontWeight: 650, fontSize: 13, color: "var(--ui-text-primary)" }, children: String(r.cells[tagCol.key]) }) : null,
        bodyCol && r.cells?.[bodyCol.key] ? /* @__PURE__ */ jsx15("div", { style: { fontSize: 12.5, color: "var(--ui-text-secondary)", lineHeight: 1.55 }, children: String(r.cells[bodyCol.key]) }) : null,
        /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: [
          /* @__PURE__ */ jsx15("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: (r.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx15("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) }),
          /* @__PURE__ */ jsxs13("button", { type: "button", className: "sb-btn sb-btn-ghost", onClick: (e) => copyRow(e, r), children: [
            /* @__PURE__ */ jsx15(Icon, { name: "Copy", size: 11 }),
            " Copy"
          ] })
        ] })
      ] }, r.id || idx);
    }) }) : null,
    viewMode === "chart" ? /* @__PURE__ */ jsx15("div", { className: "sb-dt-chart-stage", children: chartGroups.length === 0 ? /* @__PURE__ */ jsxs13("div", { className: "sb-empty", children: [
      /* @__PURE__ */ jsx15(Icon, { name: "BarChart2", size: 22 }),
      /* @__PURE__ */ jsx15("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No numeric metrics in current selection" }),
      /* @__PURE__ */ jsx15("div", { style: { fontSize: 12 }, children: "Clear filters or add quantitative sources to plot visual comparison bars." })
    ] }) : chartGroups.map((grp) => /* @__PURE__ */ jsxs13("div", { className: "sb-dt-chart-group", children: [
      /* @__PURE__ */ jsxs13("div", { className: "sb-dt-chart-head", children: [
        /* @__PURE__ */ jsxs13("span", { style: { display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 650, fontSize: 12, color: "var(--ui-text-primary)" }, children: [
          /* @__PURE__ */ jsx15("span", { className: "sb-dt-dot", style: { background: grp.color, width: 8, height: 8 } }),
          grp.label
        ] }),
        /* @__PURE__ */ jsxs13("span", { className: "sb-mono", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
          grp.entries.length,
          " benchmark",
          grp.entries.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsx15("div", { style: { display: "flex", flexDirection: "column", gap: 11 }, children: grp.entries.map((entry, eIdx) => {
        const pct = Math.round(metricRatio(entry.metric) * 100);
        return /* @__PURE__ */ jsxs13("div", { className: "sb-dt-chart-row", children: [
          /* @__PURE__ */ jsxs13("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }, children: [
            /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
              /* @__PURE__ */ jsx15("span", { style: { fontWeight: 600, fontSize: 12.5, color: "var(--ui-text-primary)" }, children: entry.title }),
              entry.source ? /* @__PURE__ */ jsx15("span", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: entry.source }) : null
            ] }),
            /* @__PURE__ */ jsxs13("div", { style: { display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }, children: [
              /* @__PURE__ */ jsx15("span", { className: "sb-mono", style: { fontSize: 14, fontWeight: 750, color: grp.color }, children: entry.metric.display }),
              (entry.row.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx15("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), children: cIdx + 1 }, cid))
            ] })
          ] }),
          /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-track", style: { height: 8 }, children: /* @__PURE__ */ jsx15("div", { className: "sb-dt-bar-fill", style: { width: `${pct}%`, background: grp.color } }) }),
          entry.detail ? /* @__PURE__ */ jsx15("div", { style: { fontSize: 11.5, color: "var(--ui-text-secondary)", lineHeight: 1.45 }, children: entry.detail }) : null
        ] }, entry.row.id || eIdx);
      }) })
    ] }, grp.group)) }) : null,
    /* @__PURE__ */ jsxs13("div", { className: "sb-dt-footer", children: [
      /* @__PURE__ */ jsxs13("span", { children: [
        "Showing ",
        /* @__PURE__ */ jsx15("strong", { className: "sb-mono", children: filtered.length }),
        " of ",
        /* @__PURE__ */ jsx15("strong", { className: "sb-mono", children: rows.length }),
        " rows",
        sort.key ? ` | Sorted by ${cols.find((c) => c.key === sort.key)?.label || sort.key} (${sort.dir})` : ""
      ] }),
      /* @__PURE__ */ jsx15("span", { children: viewMode === "table" ? "Click any row to inspect full details" : `${meta.distinctSources} active sources` })
    ] })
  ] });
}

// desktop-src/components/renderers/SlideDeckView.jsx
import { useEffect as useEffect9, useRef as useRef8, useState as useState11 } from "react";
import { Fragment as Fragment10, jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
var EDITABLE_LAYOUTS = ["title", "stat", "bento", "comparison", "timeline", "two-col", "bullets", "quote", "image-left", "image-full", "section", "closing"];
var SLIDE_THEMES = {
  editorial: {
    label: "Editorial",
    accent: "var(--ui-accent)",
    secondary: "#10b981",
    bg: "var(--sb-surface)",
    cardBg: "color-mix(in srgb, var(--sb-bg) 72%, var(--sb-surface))",
    fg: "var(--ui-text-primary)",
    muted: "var(--ui-text-secondary)",
    dim: "var(--ui-text-tertiary)",
    border: "var(--ui-stroke-secondary)"
  },
  keynote: {
    label: "Keynote",
    accent: "#38bdf8",
    secondary: "#6366f1",
    bg: "linear-gradient(155deg, #0d1322 0%, #090d16 60%, #101729 100%)",
    cardBg: "rgba(255, 255, 255, 0.045)",
    fg: "#f4f7fb",
    muted: "#a6b3c8",
    dim: "#6c7a93",
    border: "rgba(148, 163, 184, 0.22)"
  },
  midnight: {
    label: "Midnight",
    accent: "#10b981",
    secondary: "#14b8a6",
    bg: "linear-gradient(160deg, #0b1110 0%, #0a0c0e 100%)",
    cardBg: "rgba(16, 185, 129, 0.06)",
    fg: "#ecfdf5",
    muted: "#9cb5aa",
    dim: "#5e786e",
    border: "rgba(16, 185, 129, 0.24)"
  },
  paper: {
    label: "Paper",
    accent: "#2563eb",
    secondary: "#0d9488",
    bg: "linear-gradient(180deg, #faf8f4 0%, #f3efe7 100%)",
    cardBg: "rgba(24, 24, 27, 0.04)",
    fg: "#18181b",
    muted: "#52525b",
    dim: "#71717a",
    border: "rgba(24, 24, 27, 0.14)"
  }
};
var LAYOUT_ACCENTS = {
  title: "#3b82f6",
  stat: "#10b981",
  bento: "#6366f1",
  comparison: "#f59e0b",
  timeline: "#06b6d4",
  "two-col": "#38bdf8",
  bullets: "#3b82f6",
  quote: "#f59e0b",
  "image-left": "#8b5cf6",
  "image-full": "#3b82f6",
  section: "#8b5cf6",
  closing: "#10b981"
};
function parsePct(val) {
  const m = String(val || "").trim().match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? Math.max(0.05, Math.min(1, n / 100)) : null;
}
function normalizeThemeKey(t) {
  const k = String(t || "editorial").toLowerCase();
  if (SLIDE_THEMES[k]) return k;
  if (k === "bold" || k === "noir") return "keynote";
  return "editorial";
}
function SlideDeckView({
  ctx,
  nbId,
  artifact,
  capabilities,
  autoPresent = false,
  onClearAutoPresent,
  onOpenChunk,
  onArtifactUpdated,
  onRequestRevise,
  onRequestRename,
  onRequestInspect,
  onRequestDelete
}) {
  const slides = artifact?.spec?.slides || [];
  const [idx, setIdx] = useState11(0);
  const [showNotes, setShowNotes] = useState11(true);
  const [presenting, setPresenting] = useState11(false);
  const [viewMode, setViewMode] = useState11("stage");
  const [themeKey, setThemeKey] = useState11(() => normalizeThemeKey(artifact?.spec?.theme || artifact?.params?.theme));
  const [elapsedSec, setElapsedSec] = useState11(0);
  const [exportingFmt, setExportingFmt] = useState11("");
  const [moreOpen, setMoreOpen] = useState11(false);
  const [showArtOverlay, setShowArtOverlay] = useState11(false);
  const [mediaUrls, setMediaUrls] = useState11({});
  const [editing, setEditing] = useState11(false);
  const [savingSlide, setSavingSlide] = useState11(false);
  const [regenBusy, setRegenBusy] = useState11(false);
  const [regenStage, setRegenStage] = useState11("");
  const [editTitle, setEditTitle] = useState11("");
  const [editLayout, setEditLayout] = useState11("two-col");
  const [editBody, setEditBody] = useState11("");
  const [editBullets, setEditBullets] = useState11("");
  const [editNotes, setEditNotes] = useState11("");
  const [editImgPrompt, setEditImgPrompt] = useState11("");
  const [editImgMode, setEditImgMode] = useState11("full_slide");
  const cancelRegenRef = useRef8(null);
  const mediaSignature = slides.map((s) => s?.image_file || "").join("|");
  useEffect9(() => {
    return () => cancelRegenRef.current?.();
  }, []);
  useEffect9(() => {
    setIdx(0);
    setViewMode("stage");
    setMoreOpen(false);
    setEditing(false);
    setThemeKey(normalizeThemeKey(artifact?.spec?.theme || artifact?.params?.theme));
    if (autoPresent) {
      setPresenting(true);
      onClearAutoPresent?.();
    } else {
      setPresenting(false);
    }
  }, [artifact?.id, autoPresent]);
  useEffect9(() => {
    const cur = slides[idx];
    if (!cur) return;
    setEditTitle(cur.title || "");
    setEditLayout(cur.layout || "two-col");
    setEditBody(cur.body || "");
    setEditBullets((cur.bullets || []).join("\n"));
    setEditNotes(cur.notes || "");
    setEditImgPrompt(cur.image_prompt || "");
    setEditImgMode(cur.image_mode || (cur.image_file || cur.image_url ? "full_slide" : "full_slide"));
  }, [idx, artifact?.id, artifact?.updated]);
  useEffect9(() => {
    if (!nbId || !artifact?.id || !slides.length) return void 0;
    let alive = true;
    const files = slides.map((s) => s.image_file).filter(Boolean);
    if (!files.length) return void 0;
    Promise.all(
      files.map(async (fname) => {
        try {
          const dataUrl = await loadArtifactMediaDataUrl(nbId, artifact.id, fname);
          return [fname, dataUrl];
        } catch {
          return [fname, null];
        }
      })
    ).then((entries) => {
      if (!alive) return;
      const next = {};
      entries.forEach(([k, v]) => {
        if (v) next[k] = v;
      });
      setMediaUrls((prev) => ({ ...prev, ...next }));
    });
    return () => {
      alive = false;
    };
  }, [nbId, artifact?.id, mediaSignature]);
  useEffect9(() => {
    if (!presenting) {
      setElapsedSec(0);
      return void 0;
    }
    const ctx2 = getContext();
    if (ctx2 && typeof ctx2.setInterval === "function") {
      return ctx2.setInterval(() => setElapsedSec((s) => s + 1), 1e3);
    }
    return void 0;
  }, [presenting]);
  if (!slides.length) {
    return /* @__PURE__ */ jsx16("div", { className: "sb-empty", children: "No slides in this deck." });
  }
  const sl = slides[idx] || slides[0];
  const nextSl = slides[idx + 1] || null;
  const theme = SLIDE_THEMES[themeKey] || SLIDE_THEMES.editorial;
  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const secs = String(elapsedSec % 60).padStart(2, "0");
  function resolveSlideImage(slide) {
    if (slide?.image_file && mediaUrls[slide.image_file]) return mediaUrls[slide.image_file];
    if (slide?.image_url && /^(data:|https?:)/.test(String(slide.image_url))) return slide.image_url;
    return null;
  }
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
  async function downloadBinaryDeck(fmt) {
    if (!nbId || !artifact?.id || exportingFmt) return;
    setExportingFmt(fmt);
    setMoreOpen(false);
    try {
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-binary?fmt=${encodeURIComponent(fmt)}&theme=${encodeURIComponent(themeKey)}`
      );
      if (res?.b64) {
        downloadBinaryBase64(
          res.filename || `${artifact.id}.${fmt}`,
          res.b64,
          res.media_type || (fmt === "pptx" ? "application/vnd.openxmlformats-officedocument.presentationml.presentation" : "application/pdf")
        );
        sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Downloaded ${res.filename || fmt.toUpperCase()}.` });
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || `Could not export ${fmt.toUpperCase()}.` });
    } finally {
      setExportingFmt("");
    }
  }
  async function downloadHtmlDeck() {
    if (!nbId || !artifact?.id) return;
    setMoreOpen(false);
    try {
      const res = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/export-payload?fmt=html`);
      if (res?.content) {
        downloadTextFile(res.filename || `${artifact.id}.deck.html`, res.content, res.media_type || "text/html;charset=utf-8");
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not export HTML deck." });
    }
  }
  async function saveSlideEdit(extraPatch = {}) {
    if (!nbId || !artifact?.id || savingSlide) return;
    setSavingSlide(true);
    try {
      const payload = {
        action: "edit",
        title: editTitle.trim() || sl.title || "Untitled slide",
        layout: editLayout,
        body: editBody.trim(),
        bullets: editBullets.split("\n").map((s) => s.trim()).filter(Boolean),
        notes: editNotes.trim(),
        image_prompt: editImgPrompt.trim(),
        image_mode: editImgMode,
        ...extraPatch
      };
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}`,
        { method: "PATCH", body: payload }
      );
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact);
        if (typeof res.active_index === "number") setIdx(res.active_index);
      }
      sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Saved Slide ${idx + 1}.` });
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not update slide." });
    } finally {
      setSavingSlide(false);
    }
  }
  async function mutateSlideStructure(action, extra = {}) {
    if (!nbId || !artifact?.id || savingSlide) return;
    setSavingSlide(true);
    try {
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}`,
        { method: "PATCH", body: { action, ...extra } }
      );
      if (res?.artifact) {
        onArtifactUpdated?.(res.artifact);
        if (typeof res.active_index === "number") setIdx(res.active_index);
      }
    } catch (err) {
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || `Slide ${action} failed.` });
    } finally {
      setSavingSlide(false);
    }
  }
  async function regenerateCurrentSlideVisual(overrideMode) {
    if (!nbId || !artifact?.id || regenBusy) return;
    setRegenBusy(true);
    const providerTxt = [capabilities?.image_gen_provider, capabilities?.image_gen_model].filter(Boolean).join(" \xB7 ") || "Hermes ImageGen";
    setRegenStage(`Regenerating Slide ${idx + 1} visual via ${providerTxt}...`);
    try {
      const targetMode = overrideMode || (editImgMode === "none" ? "full_slide" : editImgMode) || "full_slide";
      const { job } = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(artifact.id)}/slides/${idx}/regenerate-visual`,
        {
          method: "POST",
          body: {
            prompt: editImgPrompt.trim() || void 0,
            image_mode: targetMode
          }
        }
      );
      const pollCtx = ctx || getContext();
      cancelRegenRef.current?.();
      cancelRegenRef.current = pollJob(
        pollCtx,
        job,
        (j) => setRegenStage(j.stage || `Rendering Slide ${idx + 1}...`),
        (result) => {
          setRegenBusy(false);
          setRegenStage("");
          if (result?.artifact) {
            onArtifactUpdated?.(result.artifact);
          }
          sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Regenerated artwork for Slide ${idx + 1}.` });
        },
        (err) => {
          setRegenBusy(false);
          setRegenStage("");
          sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not regenerate slide visual." });
        }
      );
    } catch (err) {
      setRegenBusy(false);
      setRegenStage("");
      sdk.host?.notify?.({ kind: "error", title: "SourceBook", message: err.message || "Could not start visual regeneration." });
    }
  }
  function renderSlideBody(slide, large) {
    const layout = slide.layout || "bullets";
    const bullets = slide.bullets || [];
    const columns = slide.columns || [];
    const steps = slide.steps || [];
    const statVal = slide.stat?.value;
    const pct = statVal ? parsePct(statVal) : null;
    const imgSrc = resolveSlideImage(slide);
    if (imgSrc && (slide.image_mode === "full_slide" || layout === "image-full")) {
      return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-full-art", children: [
        /* @__PURE__ */ jsx16(
          "img",
          {
            src: imgSrc,
            alt: slide.title || "Generated slide",
            style: { width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 8 }
          }
        ),
        showArtOverlay ? /* @__PURE__ */ jsxs14("div", { className: "sb-sl-art-overlay", children: [
          /* @__PURE__ */ jsx16("div", { style: { fontWeight: 700, fontSize: large ? 19 : 15, color: "#fff" }, children: slide.title }),
          bullets.length > 0 ? /* @__PURE__ */ jsx16("ul", { style: { margin: "6px 0 0", paddingLeft: 18, fontSize: large ? 13 : 11.5, color: "#e2e8f0" }, children: bullets.slice(0, 4).map((b, i) => /* @__PURE__ */ jsx16("li", { children: b }, i)) }) : null
        ] }) : null
      ] });
    }
    if (layout === "title" || layout === "section") {
      if (imgSrc) {
        return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-hybrid-split", children: [
          /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }, children: [
            /* @__PURE__ */ jsxs14("div", { className: "sb-sl-eyebrow", style: { color: theme.accent, borderColor: theme.border, background: theme.cardBg, alignSelf: "flex-start" }, children: [
              /* @__PURE__ */ jsx16("span", { className: "sb-dt-dot", style: { background: theme.accent } }),
              /* @__PURE__ */ jsx16("span", { children: layout === "title" ? "SOURCEBOOK PRESENTATION" : "SECTION BREAK" })
            ] }),
            /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? "clamp(22px, 3vw, 34px)" : "clamp(16px, 3.6cqi, 26px)", fontWeight: 780, lineHeight: 1.16, letterSpacing: "-0.025em", color: theme.fg }, children: slide.title }),
            /* @__PURE__ */ jsx16("div", { style: { width: 64, height: 3, borderRadius: 99, background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` } }),
            slide.body ? /* @__PURE__ */ jsx16("p", { style: { margin: 0, fontSize: large ? "clamp(13px, 1.5vw, 15.5px)" : "clamp(12px, 2cqi, 13.5px)", color: theme.muted, lineHeight: 1.5 }, children: slide.body }) : null
          ] }),
          /* @__PURE__ */ jsx16("div", { className: "sb-sl-hybrid-art", style: { borderColor: theme.border }, children: /* @__PURE__ */ jsx16("img", { src: imgSrc, alt: slide.title || "Slide artwork", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }) })
        ] });
      }
      return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-cover", children: [
        /* @__PURE__ */ jsxs14(
          "div",
          {
            className: "sb-sl-eyebrow",
            style: { color: theme.accent, borderColor: theme.border, background: theme.cardBg },
            children: [
              /* @__PURE__ */ jsx16("span", { className: "sb-dt-dot", style: { background: theme.accent } }),
              /* @__PURE__ */ jsx16("span", { children: layout === "title" ? "SOURCEBOOK BRIEFING DECK" : "SECTION BREAK" })
            ]
          }
        ),
        /* @__PURE__ */ jsx16(
          "h2",
          {
            style: {
              margin: 0,
              fontSize: large ? "clamp(24px, 3.6vw, 40px)" : "clamp(17px, 4.2cqi, 30px)",
              fontWeight: 780,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: theme.fg,
              maxWidth: "24ch"
            },
            children: slide.title
          }
        ),
        /* @__PURE__ */ jsx16(
          "div",
          {
            style: {
              width: 72,
              height: 3,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`
            }
          }
        ),
        slide.body ? /* @__PURE__ */ jsx16("p", { style: { margin: 0, fontSize: large ? "clamp(13.5px, 1.6vw, 17px)" : "clamp(12px, 2.2cqi, 14.5px)", color: theme.muted, maxWidth: "52ch", lineHeight: 1.55 }, children: slide.body }) : null
      ] });
    }
    if (layout === "stat" && statVal) {
      const r = 46;
      const circ = 2 * Math.PI * r;
      const dash = circ * (pct ?? 0.78);
      return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-stat-split", children: [
        /* @__PURE__ */ jsxs14("div", { className: "sb-sl-stat-hero", style: { background: theme.cardBg, borderColor: theme.border }, children: [
          /* @__PURE__ */ jsx16(
            DitherCanvas,
            {
              variant: "mesh",
              animated: false,
              color: theme.accent,
              secondaryColor: theme.secondary,
              opacity: 0.22,
              cols: 96,
              rows: 36,
              style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }
            }
          ),
          /* @__PURE__ */ jsxs14("div", { style: { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxs14("svg", { width: large ? 136 : 112, height: large ? 136 : 112, viewBox: "0 0 116 116", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx16("circle", { cx: "58", cy: "58", r, fill: "none", stroke: theme.border, strokeWidth: "8" }),
              /* @__PURE__ */ jsx16(
                "circle",
                {
                  cx: "58",
                  cy: "58",
                  r,
                  fill: "none",
                  stroke: theme.accent,
                  strokeWidth: "8",
                  strokeLinecap: "round",
                  strokeDasharray: `${dash.toFixed(1)} ${circ.toFixed(1)}`,
                  transform: "rotate(-90 58 58)"
                }
              ),
              /* @__PURE__ */ jsx16(
                "text",
                {
                  x: "58",
                  y: "64",
                  textAnchor: "middle",
                  fill: theme.accent,
                  fontSize: String(statVal).length >= 5 ? "20" : "26",
                  fontWeight: "800",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  children: statVal
                }
              )
            ] }),
            slide.stat.label ? /* @__PURE__ */ jsx16("div", { style: { fontSize: large ? 13 : 11.5, fontWeight: 600, color: theme.muted, textAlign: "center", maxWidth: 200 }, children: slide.stat.label }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", minWidth: 0 }, children: [
          /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? 25 : 20, fontWeight: 720, lineHeight: 1.24, letterSpacing: "-0.02em", color: theme.fg }, children: slide.title }),
          bullets.length > 0 ? /* @__PURE__ */ jsx16("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: bullets.map((b, bIdx) => /* @__PURE__ */ jsxs14(
            "div",
            {
              className: "sb-sl-point",
              style: { background: theme.cardBg, borderColor: theme.border, color: theme.fg },
              children: [
                /* @__PURE__ */ jsxs14("span", { className: "sb-mono sb-sl-step", style: { color: theme.accent }, children: [
                  "0",
                  bIdx + 1
                ] }),
                /* @__PURE__ */ jsx16("span", { style: { fontSize: large ? 14 : 12.5, lineHeight: 1.48, color: theme.muted }, children: b })
              ]
            },
            bIdx
          )) }) : null
        ] })
      ] });
    }
    if (layout === "comparison" && columns.length >= 2) {
      return /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 16, marginBlock: "auto" }, children: [
        /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? 27 : 21, fontWeight: 730, lineHeight: 1.22, letterSpacing: "-0.02em", color: theme.fg }, children: slide.title }),
        /* @__PURE__ */ jsx16("div", { className: "sb-sl-comparison", children: columns.slice(0, 2).map((col, cIdx) => {
          const colAcc = cIdx === 0 ? theme.accent : theme.secondary;
          return /* @__PURE__ */ jsxs14(
            "div",
            {
              className: "sb-sl-comp-col",
              style: { background: theme.cardBg, borderColor: theme.border, borderTopColor: colAcc },
              children: [
                /* @__PURE__ */ jsx16("div", { className: "sb-mono", style: { fontSize: 11.5, fontWeight: 750, letterSpacing: "0.06em", textTransform: "uppercase", color: colAcc }, children: col.heading || `Column ${cIdx + 1}` }),
                /* @__PURE__ */ jsx16("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: (col.points || []).slice(0, 5).map((pt, pIdx) => /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 8, alignItems: "flex-start", fontSize: large ? 14 : 12.5, color: theme.fg, lineHeight: 1.45 }, children: [
                  /* @__PURE__ */ jsx16("span", { className: "sb-dt-dot", style: { background: colAcc, marginTop: 6 } }),
                  /* @__PURE__ */ jsx16("span", { children: pt })
                ] }, pIdx)) })
              ]
            },
            cIdx
          );
        }) })
      ] });
    }
    if (layout === "timeline" && steps.length > 0) {
      return /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 18, marginBlock: "auto" }, children: [
        /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? 27 : 21, fontWeight: 730, lineHeight: 1.22, letterSpacing: "-0.02em", color: theme.fg }, children: slide.title }),
        /* @__PURE__ */ jsx16("div", { className: "sb-sl-timeline", style: { gridTemplateColumns: `repeat(${Math.min(4, steps.length)}, minmax(0, 1fr))` }, children: steps.slice(0, 4).map((st, sIdx) => {
          const sAcc = sIdx % 2 === 0 ? theme.accent : theme.secondary;
          return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-step-card", style: { background: theme.cardBg, borderColor: theme.border }, children: [
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxs14("span", { className: "sb-mono sb-sl-step-pill", style: { background: sAcc, color: "#fff" }, children: [
                "0",
                sIdx + 1
              ] }),
              /* @__PURE__ */ jsx16("div", { style: { flex: 1, height: 1.5, background: theme.border } })
            ] }),
            /* @__PURE__ */ jsx16("strong", { style: { fontSize: large ? 14.5 : 13, color: theme.fg, lineHeight: 1.3 }, children: st.label || st.title || `Phase ${sIdx + 1}` }),
            /* @__PURE__ */ jsx16("span", { style: { fontSize: large ? 13 : 11.5, color: theme.muted, lineHeight: 1.45 }, children: st.detail || st.summary || "" })
          ] }, sIdx);
        }) })
      ] });
    }
    if (layout === "quote") {
      return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-quote-wrap", children: [
        /* @__PURE__ */ jsx16("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.accent }, children: slide.title }),
        /* @__PURE__ */ jsxs14(
          "blockquote",
          {
            style: {
              margin: 0,
              padding: "12px 0 12px 24px",
              borderLeft: `3.5px solid ${theme.accent}`,
              fontSize: large ? 28 : 22,
              fontWeight: 550,
              lineHeight: 1.38,
              color: theme.fg,
              maxWidth: "46ch"
            },
            children: [
              '"',
              slide.body || bullets[0] || slide.title,
              '"'
            ]
          }
        )
      ] });
    }
    if (imgSrc) {
      return /* @__PURE__ */ jsxs14("div", { className: "sb-sl-hybrid-split", children: [
        /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", minWidth: 0 }, children: [
          /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? 25 : 19.5, fontWeight: 730, lineHeight: 1.22, letterSpacing: "-0.02em", color: theme.fg }, children: slide.title }),
          slide.body ? /* @__PURE__ */ jsx16("p", { style: { margin: 0, fontSize: large ? 14 : 12.5, color: theme.muted, lineHeight: 1.5 }, children: slide.body }) : null,
          bullets.length > 0 ? /* @__PURE__ */ jsx16("div", { style: { display: "flex", flexDirection: "column", gap: 7 }, children: bullets.slice(0, 4).map((b, bIdx) => /* @__PURE__ */ jsxs14("div", { className: "sb-sl-point", style: { background: theme.cardBg, borderColor: theme.border }, children: [
            /* @__PURE__ */ jsxs14("span", { className: "sb-mono sb-sl-step", style: { color: bIdx % 2 === 0 ? theme.accent : theme.secondary }, children: [
              "0",
              bIdx + 1
            ] }),
            /* @__PURE__ */ jsx16("span", { style: { fontSize: large ? 13.5 : 12, color: theme.fg, lineHeight: 1.45 }, children: b })
          ] }, bIdx)) }) : null
        ] }),
        /* @__PURE__ */ jsx16("div", { className: "sb-sl-hybrid-art", style: { borderColor: theme.border }, children: /* @__PURE__ */ jsx16("img", { src: imgSrc, alt: slide.title || "Slide illustration", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }) })
      ] });
    }
    if (layout === "closing") {
      return /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 18, marginBlock: "auto" }, children: [
        /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
          /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", color: theme.secondary }, children: "KEY TAKEAWAYS" }),
          /* @__PURE__ */ jsx16("h2", { style: { margin: 0, fontSize: large ? 30 : 23, fontWeight: 750, lineHeight: 1.2, letterSpacing: "-0.02em", color: theme.fg }, children: slide.title })
        ] }),
        bullets.length > 0 ? /* @__PURE__ */ jsx16("div", { className: "sb-sl-cards-grid", style: { gridTemplateColumns: bullets.length >= 3 ? "repeat(2, minmax(0, 1fr))" : "1fr" }, children: bullets.map((b, bIdx) => /* @__PURE__ */ jsxs14(
          "div",
          {
            className: "sb-sl-card",
            style: { background: theme.cardBg, borderColor: theme.border, borderTopColor: bIdx % 2 === 0 ? theme.accent : theme.secondary },
            children: [
              /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 10, fontWeight: 700, color: bIdx % 2 === 0 ? theme.accent : theme.secondary }, children: [
                "SOURCE 0",
                bIdx + 1
              ] }),
              /* @__PURE__ */ jsx16("span", { style: { fontSize: large ? 14 : 12.5, color: theme.fg, lineHeight: 1.45 }, children: b })
            ]
          },
          bIdx
        )) }) : null
      ] });
    }
    const useTwoCol = layout === "two-col" || layout === "bento" || bullets.length >= 3;
    return /* @__PURE__ */ jsxs14("div", { style: { display: "flex", flexDirection: "column", gap: 16, marginBlock: "auto" }, children: [
      /* @__PURE__ */ jsx16(
        "h2",
        {
          style: {
            margin: 0,
            fontSize: large ? 27 : 21,
            fontWeight: 730,
            lineHeight: 1.22,
            letterSpacing: "-0.02em",
            color: theme.fg
          },
          children: slide.title
        }
      ),
      slide.body ? /* @__PURE__ */ jsx16("p", { style: { margin: 0, fontSize: large ? 15 : 13, color: theme.muted, lineHeight: 1.55 }, children: slide.body }) : null,
      bullets.length > 0 ? /* @__PURE__ */ jsx16(
        "div",
        {
          className: "sb-sl-cards-grid",
          style: { gridTemplateColumns: useTwoCol ? "repeat(2, minmax(0, 1fr))" : "1fr" },
          children: bullets.map((b, bIdx) => /* @__PURE__ */ jsxs14(
            "div",
            {
              className: "sb-sl-card",
              style: {
                background: theme.cardBg,
                borderColor: theme.border,
                borderLeft: `2.5px solid ${bIdx % 2 === 0 ? theme.accent : theme.secondary}`
              },
              children: [
                /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 10, fontWeight: 700, color: bIdx % 2 === 0 ? theme.accent : theme.secondary }, children: [
                  "0",
                  bIdx + 1
                ] }),
                /* @__PURE__ */ jsx16("span", { style: { fontSize: large ? 14.5 : 12.5, lineHeight: 1.48, color: theme.fg }, children: b })
              ]
            },
            bIdx
          ))
        }
      ) : null
    ] });
  }
  function renderSlideCard(slide, slideIdx, large = false) {
    const layout = slide.layout || "bullets";
    const imgSrc = resolveSlideImage(slide);
    const isFullArt = Boolean(imgSrc && (slide.image_mode === "full_slide" || layout === "image-full"));
    const isHero = layout === "title" || layout === "closing" || layout === "section";
    return /* @__PURE__ */ jsxs14(
      "section",
      {
        className: `sb-slide-stage sb-slide-stage-rich${isFullArt ? " sb-slide-stage-art" : ""}`,
        style: {
          background: theme.bg,
          borderColor: theme.border,
          color: theme.fg,
          ...isFullArt ? { padding: 0, gap: 0 } : large ? { maxWidth: 1040, width: "100%", padding: "clamp(16px, 3.2vw, 40px)" } : {}
        },
        children: [
          !isFullArt ? /* @__PURE__ */ jsxs14(Fragment10, { children: [
            /* @__PURE__ */ jsx16(
              "div",
              {
                className: "sb-sl-top-ribbon",
                style: { background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})` }
              }
            ),
            isHero ? /* @__PURE__ */ jsx16(
              DitherCanvas,
              {
                variant: "aurora",
                animated: presenting,
                color: theme.accent,
                secondaryColor: theme.secondary,
                opacity: themeKey === "paper" ? 0.14 : 0.24,
                cols: 160,
                rows: 28,
                style: { position: "absolute", inset: "0 0 auto 0", width: "100%", height: 110, pointerEvents: "none" }
              }
            ) : null,
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }, children: [
              /* @__PURE__ */ jsx16(
                "span",
                {
                  className: "sb-kind-tag",
                  style: { background: theme.cardBg, borderColor: theme.border, color: theme.muted },
                  children: layout
                }
              ),
              /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 11, color: theme.dim }, children: [
                String(slideIdx + 1).padStart(2, "0"),
                " / ",
                String(slides.length).padStart(2, "0")
              ] })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsx16("div", { style: { position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }, children: renderSlideBody(slide, large) }),
          !isFullArt ? /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", paddingTop: 10, borderTop: `1px solid ${theme.border}` }, children: [
            /* @__PURE__ */ jsx16("div", { style: { display: "flex", gap: 5, alignItems: "center" }, children: (slide.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) }),
            /* @__PURE__ */ jsx16("span", { style: { fontSize: 11, color: theme.dim }, children: artifact?.spec?.title || "SourceBook Deck" })
          ] }) : /* @__PURE__ */ jsxs14("div", { className: "sb-sl-full-art-bar", children: [
            /* @__PURE__ */ jsx16("div", { style: { display: "flex", gap: 5, alignItems: "center" }, children: (slide.cites || []).map((cid, cIdx) => /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-cite", onClick: () => onOpenChunk?.(cid), title: `Inspect ${cid}`, children: cIdx + 1 }, cid)) }),
            /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn", style: { padding: "3px 8px", fontSize: 11 }, onClick: () => setShowArtOverlay((v) => !v), children: showArtOverlay ? "Hide text overlay" : "Source text" })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs14(
    "div",
    {
      style: { display: "flex", flexDirection: "column", gap: 11 },
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "ArrowRight") setIdx((i) => Math.min(slides.length - 1, i + 1));
        if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
        if (e.key === "Escape" && presenting) setPresenting(false);
      },
      children: [
        /* @__PURE__ */ jsxs14("div", { className: "sb-inf-toolbar", children: [
          /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn sb-btn-icon", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)), children: /* @__PURE__ */ jsx16(Icon, { name: "ChevronLeft", size: 13 }) }),
              /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 12, color: "var(--ui-text-secondary)", padding: "0 4px" }, children: [
                idx + 1,
                " / ",
                slides.length
              ] }),
              /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn sb-btn-icon", disabled: idx >= slides.length - 1, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: /* @__PURE__ */ jsx16(Icon, { name: "ChevronRight", size: 13 }) })
            ] }),
            /* @__PURE__ */ jsxs14("div", { className: "sb-seg", role: "group", "aria-label": "Deck view", children: [
              /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "stage", onClick: () => setViewMode("stage"), children: "Stage" }),
              /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-seg-btn", "data-active": viewMode === "grid", onClick: () => setViewMode("grid"), children: "Overview" })
            ] }),
            /* @__PURE__ */ jsx16(
              "select",
              {
                className: "sb-select",
                value: themeKey,
                onChange: (e) => setThemeKey(e.target.value),
                "aria-label": "Presentation theme",
                title: "Switch slide deck visual theme",
                children: Object.entries(SLIDE_THEMES).map(([k, t]) => /* @__PURE__ */ jsxs14("option", { value: k, children: [
                  "Theme: ",
                  t.label
                ] }, k))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", position: "relative" }, children: [
            /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => setPresenting(true), title: "Start full-window slideshow", children: [
              /* @__PURE__ */ jsx16(Icon, { name: "Play", size: 12 }),
              " Slideshow"
            ] }),
            /* @__PURE__ */ jsxs14(
              "button",
              {
                type: "button",
                className: "sb-btn",
                disabled: Boolean(exportingFmt),
                onClick: () => downloadBinaryDeck("pptx"),
                title: "Download native PowerPoint (.pptx)",
                children: [
                  exportingFmt === "pptx" ? /* @__PURE__ */ jsx16(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx16(Icon, { name: "Download", size: 12 }),
                  " PPTX"
                ]
              }
            ),
            /* @__PURE__ */ jsxs14(
              "button",
              {
                type: "button",
                className: "sb-btn",
                disabled: Boolean(exportingFmt),
                onClick: () => downloadBinaryDeck("pdf"),
                title: "Download 16:9 PDF Document (.pdf)",
                children: [
                  exportingFmt === "pdf" ? /* @__PURE__ */ jsx16(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx16(Icon, { name: "FileText", size: 12 }),
                  " PDF"
                ]
              }
            ),
            /* @__PURE__ */ jsxs14(
              "button",
              {
                type: "button",
                className: "sb-btn",
                "data-active": editing,
                onClick: () => setEditing((v) => !v),
                title: "Edit this slide's title, layout, bullets, notes, or visual prompt inline",
                children: [
                  /* @__PURE__ */ jsx16(Icon, { name: "Edit3", size: 12 }),
                  " ",
                  editing ? "Close Edit" : "Edit Slide"
                ]
              }
            ),
            /* @__PURE__ */ jsxs14(
              "button",
              {
                type: "button",
                className: "sb-btn",
                disabled: regenBusy,
                onClick: () => regenerateCurrentSlideVisual(),
                title: capabilities?.image_generate ? `Regenerate artwork for Slide ${idx + 1} via ${[capabilities.image_gen_provider, capabilities.image_gen_model].filter(Boolean).join(" \xB7 ")}` : "Regenerate artwork for this slide using Hermes ImageGen",
                children: [
                  regenBusy ? /* @__PURE__ */ jsx16(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx16(Icon, { name: "Wand2", size: 12 }),
                  " Regen Visual"
                ]
              }
            ),
            onRequestRevise ? /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-btn", onClick: () => onRequestRevise(artifact), title: "Revise this entire slide deck with AI instructions", children: [
              /* @__PURE__ */ jsx16(Icon, { name: "Sparkles", size: 12 }),
              " Revise Deck"
            ] }) : null,
            /* @__PURE__ */ jsx16(
              "button",
              {
                type: "button",
                className: "sb-btn sb-btn-icon",
                "data-active": moreOpen,
                onClick: () => setMoreOpen((v) => !v),
                title: "More slide deck actions",
                "aria-label": "More slide deck actions",
                children: /* @__PURE__ */ jsx16(Icon, { name: "MoreVertical", size: 13 })
              }
            ),
            moreOpen ? /* @__PURE__ */ jsxs14("div", { className: "sb-art-menu", style: { top: "calc(100% + 6px)", right: 0 }, children: [
              /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => {
                setMoreOpen(false);
                setShowNotes((v) => !v);
              }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "FileText", size: 13 }),
                " ",
                showNotes ? "Hide speaker notes" : "Show speaker notes"
              ] }),
              /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => downloadBinaryDeck("pdf"), children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Download", size: 13 }),
                " Download PDF Document (.pdf)"
              ] }),
              /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => downloadBinaryDeck("pptx"), children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Presentation", size: 13 }),
                " Download PowerPoint (.pptx)"
              ] }),
              /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => {
                setMoreOpen(false);
                setPresenting(true);
              }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Play", size: 13 }),
                " Start slideshow"
              ] }),
              onRequestRevise ? /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => {
                setMoreOpen(false);
                onRequestRevise(artifact);
              }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Sparkles", size: 13 }),
                " Revise"
              ] }) : null,
              onRequestRename ? /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => {
                setMoreOpen(false);
                onRequestRename(artifact);
              }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Edit3", size: 13 }),
                " Rename"
              ] }) : null,
              onRequestInspect ? /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: () => {
                setMoreOpen(false);
                onRequestInspect(artifact);
              }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Info", size: 13 }),
                " View prompt and sources"
              ] }) : null,
              /* @__PURE__ */ jsx16("div", { className: "sb-art-menu-sep" }),
              /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item", onClick: downloadHtmlDeck, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Code", size: 13 }),
                " Download HTML Deck (.html)"
              ] }),
              /* @__PURE__ */ jsxs14(
                "button",
                {
                  type: "button",
                  className: "sb-art-menu-item",
                  onClick: () => {
                    setMoreOpen(false);
                    copyText(toMarp());
                    sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied Marp deck Markdown." });
                  },
                  children: [
                    /* @__PURE__ */ jsx16(Icon, { name: "Copy", size: 13 }),
                    " Copy Marp Markdown"
                  ]
                }
              ),
              onRequestDelete ? /* @__PURE__ */ jsxs14(Fragment10, { children: [
                /* @__PURE__ */ jsx16("div", { className: "sb-art-menu-sep" }),
                /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-art-menu-item sb-art-menu-danger", onClick: () => {
                  setMoreOpen(false);
                  onRequestDelete(artifact.id);
                }, children: [
                  /* @__PURE__ */ jsx16(Icon, { name: "Trash2", size: 13 }),
                  " Delete"
                ] })
              ] }) : null
            ] }) : null
          ] })
        ] }),
        regenBusy ? /* @__PURE__ */ jsxs14("div", { className: "sb-sl-regen-banner", children: [
          /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx16(HermesSpinner, { size: 13 }),
            /* @__PURE__ */ jsx16("span", { children: regenStage || `Regenerating Slide ${idx + 1} visual...` })
          ] }),
          /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 10.5, color: "var(--ui-text-tertiary)" }, children: [
            "Slide ",
            idx + 1,
            " / ",
            slides.length
          ] })
        ] }) : null,
        artifact?.grounding?.image_notice ? /* @__PURE__ */ jsx16("div", { className: "sb-quote-box", style: { fontSize: 11.5 }, children: artifact.grounding.image_notice }) : null,
        viewMode === "grid" ? /* @__PURE__ */ jsx16("div", { className: "sb-sl-overview-grid", children: slides.map((s, sIdx) => {
          const lColor = LAYOUT_ACCENTS[s.layout] || "var(--ui-accent)";
          const thumbImg = resolveSlideImage(s);
          return /* @__PURE__ */ jsxs14(
            "button",
            {
              type: "button",
              className: "sb-sl-overview-card",
              "data-active": sIdx === idx,
              onClick: () => {
                setIdx(sIdx);
                setViewMode("stage");
              },
              children: [
                thumbImg ? /* @__PURE__ */ jsx16(
                  "img",
                  {
                    src: thumbImg,
                    alt: s.title || `Slide ${sIdx + 1}`,
                    style: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 6, marginBottom: 6 }
                  }
                ) : null,
                /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                  /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 10.5, fontWeight: 700, color: lColor }, children: [
                    String(sIdx + 1).padStart(2, "0"),
                    " \xB7 ",
                    String(s.layout || "slide").toUpperCase()
                  ] }),
                  s.stat?.value ? /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { fontSize: 12, fontWeight: 800, color: lColor }, children: s.stat.value }) : null
                ] }),
                /* @__PURE__ */ jsx16("div", { style: { fontSize: 13, fontWeight: 650, color: "var(--ui-text-primary)", lineHeight: 1.32, textAlign: "left" }, children: s.title })
              ]
            },
            sIdx
          );
        }) }) : /* @__PURE__ */ jsxs14(Fragment10, { children: [
          renderSlideCard(sl, idx, false),
          editing ? /* @__PURE__ */ jsxs14("div", { className: "sb-sl-editor", children: [
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
                /* @__PURE__ */ jsx16(Icon, { name: "Edit3", size: 13, style: { color: "var(--ui-accent)" } }),
                /* @__PURE__ */ jsxs14("strong", { style: { fontSize: 12.5 }, children: [
                  "Inline Slide Editor \xB7 Slide ",
                  idx + 1
                ] })
              ] }),
              /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxs14(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn",
                    disabled: savingSlide || idx === 0,
                    onClick: () => mutateSlideStructure("move", { delta: -1 }),
                    title: "Move slide left",
                    children: [
                      /* @__PURE__ */ jsx16(Icon, { name: "ChevronLeft", size: 12 }),
                      " Move Left"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs14(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn",
                    disabled: savingSlide || idx >= slides.length - 1,
                    onClick: () => mutateSlideStructure("move", { delta: 1 }),
                    title: "Move slide right",
                    children: [
                      "Move Right ",
                      /* @__PURE__ */ jsx16(Icon, { name: "ChevronRight", size: 12 })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs14(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn",
                    disabled: savingSlide,
                    onClick: () => mutateSlideStructure("add"),
                    title: "Insert new slide after this one",
                    children: [
                      /* @__PURE__ */ jsx16(Icon, { name: "Plus", size: 12 }),
                      " Add Slide"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx16(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-danger",
                    disabled: savingSlide || slides.length <= 1,
                    onClick: () => mutateSlideStructure("delete"),
                    title: "Delete this slide",
                    children: /* @__PURE__ */ jsx16(Icon, { name: "Trash2", size: 12 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs14("div", { className: "sb-sl-editor-grid", children: [
              /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
                /* @__PURE__ */ jsx16("span", { className: "sb-label", children: "Action title" }),
                /* @__PURE__ */ jsx16("input", { className: "sb-input", value: editTitle, onChange: (e) => setEditTitle(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxs14("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
                /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
                  /* @__PURE__ */ jsx16("span", { className: "sb-label", children: "Layout" }),
                  /* @__PURE__ */ jsx16("select", { className: "sb-select", value: editLayout, onChange: (e) => setEditLayout(e.target.value), children: EDITABLE_LAYOUTS.map((l) => /* @__PURE__ */ jsx16("option", { value: l, children: l }, l)) })
                ] }),
                /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
                  /* @__PURE__ */ jsx16("span", { className: "sb-label", children: "Visual mode" }),
                  /* @__PURE__ */ jsxs14("select", { className: "sb-select", value: editImgMode, onChange: (e) => setEditImgMode(e.target.value), children: [
                    /* @__PURE__ */ jsx16("option", { value: "full_slide", children: "Full-Slide Art" }),
                    /* @__PURE__ */ jsx16("option", { value: "hybrid", children: "Hybrid (Text + Art)" }),
                    /* @__PURE__ */ jsx16("option", { value: "none", children: "Native Vector Only" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs14("div", { className: "sb-sl-editor-grid", children: [
              /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
                /* @__PURE__ */ jsx16("span", { className: "sb-label", children: "Bullets (one per line)" }),
                /* @__PURE__ */ jsx16("textarea", { className: "sb-textarea", rows: 3, value: editBullets, onChange: (e) => setEditBullets(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
                /* @__PURE__ */ jsx16("span", { className: "sb-label", children: "Speaker notes" }),
                /* @__PURE__ */ jsx16("textarea", { className: "sb-textarea", rows: 3, value: editNotes, onChange: (e) => setEditNotes(e.target.value) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs14("label", { className: "sb-field", children: [
              /* @__PURE__ */ jsxs14("span", { className: "sb-label", children: [
                "Visual art direction prompt (used when clicking Regenerate Visual)",
                capabilities?.image_generate ? /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { marginLeft: 8, fontSize: 10.5, color: "var(--ui-accent)" }, children: [capabilities.image_gen_provider, capabilities.image_gen_model].filter(Boolean).join(" \xB7 ") }) : null
              ] }),
              /* @__PURE__ */ jsx16(
                "input",
                {
                  className: "sb-input",
                  value: editImgPrompt,
                  onChange: (e) => setEditImgPrompt(e.target.value),
                  placeholder: 'Example: "Tactile Swiss cutaway technical plate on matte obsidian showing hybrid retrieval prisms..."'
                }
              )
            ] }),
            /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 6 }, children: [
                /* @__PURE__ */ jsxs14(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn",
                    disabled: regenBusy,
                    onClick: () => regenerateCurrentSlideVisual(editImgMode === "none" ? "full_slide" : editImgMode),
                    children: [
                      regenBusy ? /* @__PURE__ */ jsx16(HermesSpinner, { size: 12 }) : /* @__PURE__ */ jsx16(Icon, { name: "Wand2", size: 12 }),
                      " Regenerate This Slide's Visual"
                    ]
                  }
                ),
                sl.image_file || sl.image_url ? /* @__PURE__ */ jsx16(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    disabled: savingSlide,
                    onClick: () => saveSlideEdit({ clear_image: true, image_mode: "none" }),
                    children: "Remove visual"
                  }
                ) : null
              ] }),
              /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 6 }, children: [
                /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn", onClick: () => setEditing(false), children: "Cancel" }),
                /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn sb-btn-primary", disabled: savingSlide, onClick: () => saveSlideEdit(), children: savingSlide ? "Saving..." : "Save Slide" })
              ] })
            ] })
          ] }) : null,
          showNotes && sl.notes ? /* @__PURE__ */ jsxs14("div", { className: "sb-quote-box", children: [
            /* @__PURE__ */ jsx16("strong", { style: { display: "block", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--ui-text-tertiary)", marginBottom: 3 }, children: "SPEAKER NOTES" }),
            sl.notes
          ] }) : null,
          /* @__PURE__ */ jsx16("div", { className: "sb-slide-strip sb-scroll", children: slides.map((s, sIdx) => {
            const lColor = LAYOUT_ACCENTS[s.layout] || "var(--ui-accent)";
            return /* @__PURE__ */ jsxs14(
              "button",
              {
                type: "button",
                className: "sb-slide-thumb",
                "data-active": sIdx === idx,
                onClick: () => setIdx(sIdx),
                children: [
                  /* @__PURE__ */ jsx16("div", { style: { height: 2.5, borderRadius: 2, background: sIdx === idx ? lColor : "var(--ui-stroke-tertiary)", marginBottom: 6 } }),
                  /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                    /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { fontSize: 10, color: sIdx === idx ? lColor : "var(--ui-text-tertiary)", fontWeight: 700 }, children: String(sIdx + 1).padStart(2, "0") }),
                    /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { fontSize: 9, textTransform: "uppercase", color: "var(--ui-text-tertiary)" }, children: s.stat?.value || s.layout || "slide" })
                  ] }),
                  /* @__PURE__ */ jsx16("div", { style: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 580, marginTop: 4, color: "var(--ui-text-primary)" }, children: s.title })
                ]
              },
              sIdx
            );
          }) })
        ] }),
        presenting ? /* @__PURE__ */ jsx16(
          "div",
          {
            className: "sb-modal-backdrop sb-slideshow-backdrop",
            style: { flexDirection: "column", gap: 14, zIndex: 80 },
            onClick: () => setPresenting(false),
            children: /* @__PURE__ */ jsxs14(
              "div",
              {
                className: "sb-slideshow-shell",
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ jsxs14("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }, children: [
                    /* @__PURE__ */ jsxs14("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                      /* @__PURE__ */ jsx16("span", { className: "sb-kind-tag", children: "Slideshow" }),
                      /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 12.5, color: "var(--ui-text-secondary)" }, children: [
                        mins,
                        ":",
                        secs
                      ] }),
                      /* @__PURE__ */ jsxs14("span", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-text-tertiary)" }, children: [
                        "Slide ",
                        idx + 1,
                        " of ",
                        slides.length
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs14("div", { style: { display: "flex", gap: 6 }, children: [
                      /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)), children: "Prev" }),
                      /* @__PURE__ */ jsx16("button", { type: "button", className: "sb-btn", disabled: idx >= slides.length - 1, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: "Next" }),
                      /* @__PURE__ */ jsxs14("button", { type: "button", className: "sb-btn", onClick: () => setPresenting(false), children: [
                        /* @__PURE__ */ jsx16(Icon, { name: "X", size: 13 }),
                        " Exit"
                      ] })
                    ] })
                  ] }),
                  renderSlideCard(sl, idx, true),
                  /* @__PURE__ */ jsxs14("div", { className: `sb-slideshow-foot${nextSl ? " sb-slideshow-foot-split" : ""}`, children: [
                    sl.notes ? /* @__PURE__ */ jsxs14("div", { className: "sb-quote-box", style: { background: "var(--sb-surface)" }, children: [
                      /* @__PURE__ */ jsx16("strong", { style: { display: "block", fontSize: 10.5, letterSpacing: "0.06em", color: "var(--ui-text-tertiary)", marginBottom: 3 }, children: "SPEAKER NOTES" }),
                      sl.notes
                    ] }) : /* @__PURE__ */ jsx16("div", {}),
                    nextSl ? /* @__PURE__ */ jsxs14("div", { className: "sb-ledger-row", style: { gap: 4, cursor: "pointer" }, onClick: () => setIdx((i) => Math.min(slides.length - 1, i + 1)), children: [
                      /* @__PURE__ */ jsx16("span", { className: "sb-mono", style: { fontSize: 10, color: "var(--ui-text-tertiary)", letterSpacing: "0.06em" }, children: "UP NEXT" }),
                      /* @__PURE__ */ jsx16("strong", { style: { fontSize: 12.5, color: "var(--ui-text-primary)" }, children: nextSl.title })
                    ] }) : null
                  ] })
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
import { Fragment as Fragment11, jsx as jsx17, jsxs as jsxs15 } from "react/jsx-runtime";
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
  sources,
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
  const [activeArt, setActiveArt] = useState12(null);
  const [loadingArt, setLoadingArt] = useState12(false);
  const [runningKind, setRunningKind] = useState12("");
  const [stage, setStage] = useState12("");
  const [focusPrompt, setFocusPrompt] = useState12("");
  const [showOpts, setShowOpts] = useState12(false);
  const [template, setTemplate] = useState12("briefing");
  const [audioStyle, setAudioStyle] = useState12("deep_dive");
  const [count, setCount] = useState12(8);
  const [language, setLanguage] = useState12("English");
  const [includeImages, setIncludeImages] = useState12(false);
  const [slideModalOpen, setSlideModalOpen] = useState12(false);
  const [slideModalMode, setSlideModalMode] = useState12("create");
  const [slideModalArt, setSlideModalArt] = useState12(null);
  const [openMenuId, setOpenMenuId] = useState12("");
  const [autoPresentId, setAutoPresentId] = useState12("");
  const [renameTarget, setRenameTarget] = useState12(null);
  const [renameValue, setRenameValue] = useState12("");
  const [inspectTarget, setInspectTarget] = useState12(null);
  const cancelPollRef = useRef9(null);
  useEffect10(() => {
    return () => cancelPollRef.current?.();
  }, []);
  useEffect10(() => {
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
      const body = { kind, params };
      if (Array.isArray(params.source_ids) && params.source_ids.length > 0) {
        body.source_ids = params.source_ids;
      }
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/studio`, {
        method: "POST",
        body
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
  async function runSlideRevision(aid, revisionPrompt, params) {
    if (!nbId || !aid || runningKind) return;
    setRunningKind("slides");
    setStage("Revising slide deck...");
    try {
      const { job } = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(aid)}/revise`, {
        method: "POST",
        body: {
          prompt: revisionPrompt,
          params,
          source_ids: params?.source_ids
        }
      });
      cancelPollRef.current?.();
      cancelPollRef.current = pollJob(
        ctx,
        job,
        (j) => setStage(j.stage || "Revising..."),
        async (result) => {
          setRunningKind("");
          setStage("");
          await onRefresh();
          if (result?.id) {
            setActiveArt(result);
            onSelectArtifact?.(result.id);
          }
        },
        (err) => {
          setRunningKind("");
          setStage("");
          onError?.(err.message || "Could not revise slide deck.");
        }
      );
    } catch (err) {
      setRunningKind("");
      setStage("");
      onError?.(err.message || "Could not start slide revision.");
    }
  }
  async function deleteArtifact(e, aid) {
    e?.stopPropagation?.();
    setOpenMenuId("");
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
  async function submitRename() {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const updated = await api(`/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(renameTarget.id)}`, {
        method: "PATCH",
        body: { title: renameValue.trim() }
      });
      if (activeArt?.id === renameTarget.id) setActiveArt(updated);
      setRenameTarget(null);
      await onRefresh();
    } catch (err) {
      onError?.(err.message || "Could not rename artifact.");
    }
  }
  async function quickDownloadSlideDeck(art, fmt) {
    setOpenMenuId("");
    try {
      const theme = art?.spec?.theme || art?.params?.theme || "keynote";
      const res = await api(
        `/notebooks/${encodeURIComponent(nbId)}/artifacts/${encodeURIComponent(art.id)}/export-binary?fmt=${encodeURIComponent(fmt)}&theme=${encodeURIComponent(theme)}`
      );
      if (res?.b64) {
        downloadBinaryBase64(res.filename || `${art.id}.${fmt}`, res.b64, res.media_type);
        sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: `Downloaded ${res.filename || fmt.toUpperCase()}.` });
      }
    } catch (err) {
      onError?.(err.message || `Could not download ${fmt.toUpperCase()}.`);
    }
  }
  function openCustomizeSlides(mode = "create", art = null) {
    setOpenMenuId("");
    setSlideModalMode(mode);
    setSlideModalArt(art);
    setSlideModalOpen(true);
  }
  function handleTileClick(kind) {
    if (kind === "slides") {
      openCustomizeSlides("create", null);
      return;
    }
    runGenerator(kind);
  }
  function sourceNamesForArtifact(art) {
    const map = Object.fromEntries((sources || []).map((s) => [s.id, s.title]));
    return (art?.source_ids || []).map((sid) => map[sid] || sid);
  }
  function renderViewer() {
    if (loadingArt) return /* @__PURE__ */ jsx17("div", { className: "sb-empty", children: "Loading artifact..." });
    if (!activeArt) return null;
    switch (activeArt.kind) {
      case "report":
        return /* @__PURE__ */ jsx17(StudyGuideView, { artifact: activeArt, onOpenChunk });
      case "audio":
        return /* @__PURE__ */ jsx17(
          AudioOverviewView,
          {
            nbId,
            artifact: activeArt,
            onOpenChunk,
            onArtifactUpdated: setActiveArt
          }
        );
      case "flashcards":
        return /* @__PURE__ */ jsx17(
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
        return /* @__PURE__ */ jsx17(QuizView, { artifact: activeArt, onOpenChunk });
      case "mindmap":
        return /* @__PURE__ */ jsx17(MindMapView, { artifact: activeArt, onOpenChunk });
      case "infographic":
        return /* @__PURE__ */ jsx17(InfographicView, { artifact: activeArt, onOpenChunk });
      case "table":
        return /* @__PURE__ */ jsx17(DataTableView, { artifact: activeArt, onOpenChunk });
      case "slides":
        return /* @__PURE__ */ jsx17(
          SlideDeckView,
          {
            ctx,
            nbId,
            artifact: activeArt,
            capabilities,
            autoPresent: autoPresentId === activeArt.id,
            onClearAutoPresent: () => setAutoPresentId(""),
            onOpenChunk,
            onArtifactUpdated: (updated) => {
              setActiveArt(updated);
              onRefresh?.();
            },
            onRequestRevise: (art) => openCustomizeSlides("revise", art),
            onRequestRename: (art) => {
              setRenameTarget(art);
              setRenameValue(art.title || "");
            },
            onRequestInspect: (art) => setInspectTarget(art),
            onRequestDelete: (aid) => deleteArtifact(null, aid)
          }
        );
      default:
        return /* @__PURE__ */ jsx17("pre", { className: "sb-mono", style: { fontSize: 11 }, children: JSON.stringify(activeArt.spec, null, 2) });
    }
  }
  return /* @__PURE__ */ jsxs15("aside", { className: "sb-pane sb-pane-right", "aria-label": "Studio", children: [
    selectedArtifactId && activeArt ? /* @__PURE__ */ jsxs15("div", { className: "sb-viewer", children: [
      /* @__PURE__ */ jsxs15("div", { className: "sb-viewer-head", children: [
        /* @__PURE__ */ jsxs15("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx17(
            "button",
            {
              type: "button",
              className: "sb-btn sb-btn-ghost sb-btn-icon",
              title: "Back to Studio",
              onClick: () => {
                onSelectArtifact?.(null);
                if (expanded) onToggleExpand?.();
              },
              children: /* @__PURE__ */ jsx17(Icon, { name: "ArrowLeft", size: 14 })
            }
          ),
          /* @__PURE__ */ jsxs15("div", { style: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx17("div", { className: "sb-src-title", title: activeArt.title, children: activeArt.title }),
            /* @__PURE__ */ jsxs15("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", display: "flex", gap: 6, alignItems: "center" }, children: [
              /* @__PURE__ */ jsx17("span", { children: KIND_META[activeArt.kind]?.label || activeArt.kind }),
              activeArt.grounding?.model ? /* @__PURE__ */ jsxs15("span", { children: [
                "| ",
                activeArt.grounding.model
              ] }) : null,
              !activeArt.grounding?.model && activeArt.grounding?.mode === "extractive" ? /* @__PURE__ */ jsx17("span", { children: "| Local extractive" }) : null,
              activeArt.stale ? /* @__PURE__ */ jsx17("span", { className: "sb-verdict", "data-v": "partial", children: "Stale" }) : null
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs15("div", { style: { display: "flex", gap: 4 }, children: [
          activeArt.stale ? /* @__PURE__ */ jsxs15(
            "button",
            {
              type: "button",
              className: "sb-btn",
              disabled: Boolean(runningKind),
              onClick: () => runGenerator(activeArt.kind, activeArt.params || {}),
              title: "Underlying source changed: regenerate artifact from updated sources",
              children: [
                /* @__PURE__ */ jsx17(Icon, { name: "RefreshCw", size: 12 }),
                " Refresh"
              ]
            }
          ) : null,
          onToggleExpand ? /* @__PURE__ */ jsx17(
            "button",
            {
              type: "button",
              className: "sb-btn sb-btn-icon",
              title: expanded ? "Dock Studio rail" : "Expand Studio canvas",
              onClick: onToggleExpand,
              children: /* @__PURE__ */ jsx17(Icon, { name: expanded ? "Minimize2" : "Maximize2", size: 13 })
            }
          ) : null
        ] })
      ] }),
      runningKind ? /* @__PURE__ */ jsxs15("div", { style: { padding: "7px 14px", fontSize: 11.5, color: "var(--ui-text-secondary)", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid var(--ui-stroke-tertiary)" }, children: [
        /* @__PURE__ */ jsx17(HermesSpinner, { size: 12 }),
        /* @__PURE__ */ jsx17("span", { children: stage })
      ] }) : null,
      /* @__PURE__ */ jsx17("div", { className: "sb-viewer-body sb-scroll", children: renderViewer() })
    ] }) : /* @__PURE__ */ jsxs15(Fragment11, { children: [
      /* @__PURE__ */ jsxs15("div", { className: "sb-pane-head", children: [
        /* @__PURE__ */ jsx17("span", { className: "sb-pane-title", children: "Studio" }),
        /* @__PURE__ */ jsxs15("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxs15(
            "button",
            {
              type: "button",
              className: "sb-btn sb-btn-ghost",
              "data-active": showOpts,
              onClick: () => setShowOpts((v) => !v),
              title: "Configure report template, audio style, item count, language, and AI illustrations",
              children: [
                /* @__PURE__ */ jsx17(Icon, { name: "SlidersHorizontal", size: 12 }),
                " Options"
              ]
            }
          ),
          /* @__PURE__ */ jsx17("span", { className: "sb-num", style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: artifacts.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxs15("div", { style: { padding: "10px 12px 0", display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsx17(
          "input",
          {
            className: "sb-input",
            value: focusPrompt,
            onChange: (e) => setFocusPrompt(e.target.value),
            placeholder: "Optional focus topic for next artifact...",
            "aria-label": "Studio focus topic"
          }
        ),
        showOpts ? /* @__PURE__ */ jsxs15("div", { className: "sb-ledger-row", style: { gap: 7, padding: "8px 10px" }, children: [
          /* @__PURE__ */ jsxs15("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }, children: [
            /* @__PURE__ */ jsxs15("label", { className: "sb-field", children: [
              /* @__PURE__ */ jsx17("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Report template" }),
              /* @__PURE__ */ jsxs15("select", { className: "sb-select", value: template, onChange: (e) => setTemplate(e.target.value), children: [
                /* @__PURE__ */ jsx17("option", { value: "briefing", children: "Briefing" }),
                /* @__PURE__ */ jsx17("option", { value: "study_guide", children: "Study Guide" }),
                /* @__PURE__ */ jsx17("option", { value: "faq", children: "FAQ" }),
                /* @__PURE__ */ jsx17("option", { value: "timeline", children: "Timeline" }),
                /* @__PURE__ */ jsx17("option", { value: "blog", children: "Blog Post" }),
                /* @__PURE__ */ jsx17("option", { value: "exec_memo", children: "Exec Memo" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs15("label", { className: "sb-field", children: [
              /* @__PURE__ */ jsx17("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Audio style" }),
              /* @__PURE__ */ jsxs15("select", { className: "sb-select", value: audioStyle, onChange: (e) => setAudioStyle(e.target.value), children: [
                /* @__PURE__ */ jsx17("option", { value: "deep_dive", children: "Deep Dive" }),
                /* @__PURE__ */ jsx17("option", { value: "debate", children: "Debate" }),
                /* @__PURE__ */ jsx17("option", { value: "brief", children: "Quick Brief" }),
                /* @__PURE__ */ jsx17("option", { value: "critique", children: "Critique" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs15("label", { className: "sb-field", children: [
              /* @__PURE__ */ jsx17("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Items / slides" }),
              /* @__PURE__ */ jsxs15("select", { className: "sb-select", value: count, onChange: (e) => setCount(Number(e.target.value)), children: [
                /* @__PURE__ */ jsx17("option", { value: 5, children: "5" }),
                /* @__PURE__ */ jsx17("option", { value: 8, children: "8" }),
                /* @__PURE__ */ jsx17("option", { value: 12, children: "12" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs15("label", { className: "sb-field", children: [
              /* @__PURE__ */ jsx17("span", { className: "sb-label", style: { fontSize: 10.5 }, children: "Language" }),
              /* @__PURE__ */ jsxs15("select", { className: "sb-select", value: language, onChange: (e) => setLanguage(e.target.value), children: [
                /* @__PURE__ */ jsx17("option", { value: "English", children: "English" }),
                /* @__PURE__ */ jsx17("option", { value: "Spanish", children: "Spanish" }),
                /* @__PURE__ */ jsx17("option", { value: "French", children: "French" }),
                /* @__PURE__ */ jsx17("option", { value: "German", children: "German" }),
                /* @__PURE__ */ jsx17("option", { value: "Japanese", children: "Japanese" }),
                /* @__PURE__ */ jsx17("option", { value: "Portuguese", children: "Portuguese" })
              ] })
            ] })
          ] }),
          capabilities?.image_generate ? /* @__PURE__ */ jsxs15("label", { style: { display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--ui-text-secondary)", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsx17(
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
      /* @__PURE__ */ jsx17("div", { className: "sb-studio-grid", children: STUDIO_FORMATS.map((fmt) => /* @__PURE__ */ jsxs15(
        "button",
        {
          type: "button",
          className: "sb-studio-tile",
          disabled: !hasActiveSources || Boolean(runningKind),
          onClick: () => handleTileClick(fmt.kind),
          title: fmt.kind === "slides" ? "Customize Slide Deck (format, sources, prompt, Hermes ImageGen, outline review)" : `Generate ${fmt.label}`,
          children: [
            /* @__PURE__ */ jsx17(Icon, { name: fmt.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
            /* @__PURE__ */ jsx17("span", { children: runningKind === fmt.kind ? "Generating..." : fmt.label })
          ]
        },
        fmt.kind
      )) }),
      runningKind ? /* @__PURE__ */ jsxs15("div", { style: { padding: "0 12px 8px", fontSize: 11.5, color: "var(--ui-text-secondary)", display: "flex", alignItems: "center", gap: 7 }, children: [
        /* @__PURE__ */ jsx17(HermesSpinner, { size: 12 }),
        /* @__PURE__ */ jsx17("span", { children: stage })
      ] }) : null,
      /* @__PURE__ */ jsx17("div", { className: "sb-pane-head", style: { borderTop: "1px solid var(--ui-stroke-tertiary)" }, children: /* @__PURE__ */ jsx17("span", { className: "sb-pane-title", children: "Artifacts" }) }),
      /* @__PURE__ */ jsx17("div", { className: "sb-art-list sb-scroll", children: artifacts.length === 0 ? /* @__PURE__ */ jsxs15("div", { className: "sb-empty", children: [
        /* @__PURE__ */ jsx17(Icon, { name: "Layers", size: 22 }),
        /* @__PURE__ */ jsx17("div", { style: { fontWeight: 600, color: "var(--ui-text-secondary)" }, children: "No artifacts yet" }),
        /* @__PURE__ */ jsx17("div", { style: { fontSize: 11.5 }, children: "Pick any format above to turn your active sources into an interactive artifact or Audio Overview." })
      ] }) : artifacts.map((art) => {
        const meta = KIND_META[art.kind] || { label: art.kind, icon: "FileText" };
        const isSlides = art.kind === "slides";
        const srcCount = (art.source_ids || []).length;
        const menuOpen = openMenuId === art.id;
        return /* @__PURE__ */ jsxs15(
          "div",
          {
            className: "sb-art-item",
            "data-active": selectedArtifactId === art.id,
            style: { position: "relative" },
            role: "button",
            tabIndex: 0,
            onClick: () => {
              setOpenMenuId("");
              onSelectArtifact?.(art.id);
            },
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectArtifact?.(art.id);
              }
            },
            children: [
              /* @__PURE__ */ jsxs15("div", { style: { display: "flex", alignItems: "center", gap: 9, minWidth: 0 }, children: [
                /* @__PURE__ */ jsx17(Icon, { name: meta.icon, size: 14, style: { color: "var(--ui-accent)", flexShrink: 0 } }),
                /* @__PURE__ */ jsxs15("div", { style: { minWidth: 0 }, children: [
                  /* @__PURE__ */ jsx17("div", { className: "sb-src-title", title: art.title, children: art.title }),
                  /* @__PURE__ */ jsxs15("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)", display: "flex", alignItems: "center", gap: 5 }, children: [
                    /* @__PURE__ */ jsx17("span", { children: meta.label }),
                    srcCount > 0 ? /* @__PURE__ */ jsxs15("span", { children: [
                      "\xB7 ",
                      srcCount,
                      " src"
                    ] }) : null,
                    art.stale ? /* @__PURE__ */ jsx17("span", { className: "sb-verdict", "data-v": "partial", children: "Stale" }) : null
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx17("div", { style: { display: "flex", alignItems: "center", gap: 2 }, children: /* @__PURE__ */ jsx17(
                "button",
                {
                  type: "button",
                  className: "sb-btn sb-btn-ghost sb-btn-icon",
                  title: "More options",
                  "aria-label": `More options for ${art.title}`,
                  onClick: (e) => {
                    e.stopPropagation();
                    setOpenMenuId((cur) => cur === art.id ? "" : art.id);
                  },
                  children: /* @__PURE__ */ jsx17(Icon, { name: "MoreVertical", size: 13 })
                }
              ) }),
              menuOpen ? /* @__PURE__ */ jsxs15("div", { className: "sb-art-menu", style: { top: "calc(100% + 2px)", right: 8 }, onClick: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ jsxs15(
                  "button",
                  {
                    type: "button",
                    className: "sb-art-menu-item",
                    onClick: () => {
                      setOpenMenuId("");
                      setRenameTarget(art);
                      setRenameValue(art.title || "");
                    },
                    children: [
                      /* @__PURE__ */ jsx17(Icon, { name: "Edit3", size: 13 }),
                      " Rename"
                    ]
                  }
                ),
                isSlides ? /* @__PURE__ */ jsxs15(Fragment11, { children: [
                  /* @__PURE__ */ jsxs15("button", { type: "button", className: "sb-art-menu-item", onClick: () => quickDownloadSlideDeck(art, "pdf"), children: [
                    /* @__PURE__ */ jsx17(Icon, { name: "FileText", size: 13 }),
                    " Download PDF Document (.pdf)"
                  ] }),
                  /* @__PURE__ */ jsxs15("button", { type: "button", className: "sb-art-menu-item", onClick: () => quickDownloadSlideDeck(art, "pptx"), children: [
                    /* @__PURE__ */ jsx17(Icon, { name: "Presentation", size: 13 }),
                    " Download PowerPoint (.pptx)"
                  ] }),
                  /* @__PURE__ */ jsxs15(
                    "button",
                    {
                      type: "button",
                      className: "sb-art-menu-item",
                      onClick: () => {
                        setOpenMenuId("");
                        setAutoPresentId(art.id);
                        onSelectArtifact?.(art.id);
                      },
                      children: [
                        /* @__PURE__ */ jsx17(Icon, { name: "Play", size: 13 }),
                        " Start slideshow"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs15("button", { type: "button", className: "sb-art-menu-item", onClick: () => openCustomizeSlides("revise", art), children: [
                    /* @__PURE__ */ jsx17(Icon, { name: "Sparkles", size: 13 }),
                    " Revise"
                  ] })
                ] }) : null,
                /* @__PURE__ */ jsxs15(
                  "button",
                  {
                    type: "button",
                    className: "sb-art-menu-item",
                    onClick: () => {
                      setOpenMenuId("");
                      setInspectTarget(art);
                    },
                    children: [
                      /* @__PURE__ */ jsx17(Icon, { name: "Info", size: 13 }),
                      " View prompt and sources"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx17("div", { className: "sb-art-menu-sep" }),
                /* @__PURE__ */ jsxs15("button", { type: "button", className: "sb-art-menu-item sb-art-menu-danger", onClick: (e) => deleteArtifact(e, art.id), children: [
                  /* @__PURE__ */ jsx17(Icon, { name: "Trash2", size: 13 }),
                  " Delete"
                ] })
              ] }) : null
            ]
          },
          art.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx17(
      SlideDeckModal,
      {
        open: slideModalOpen,
        nbId,
        sources,
        capabilities,
        initialFocus: focusPrompt,
        initialArtifact: slideModalArt,
        mode: slideModalMode,
        onClose: () => setSlideModalOpen(false),
        onGenerate: (params) => runGenerator("slides", params),
        onRevise: runSlideRevision
      }
    ),
    renameTarget ? /* @__PURE__ */ jsx17("div", { className: "sb-modal-backdrop", onClick: () => setRenameTarget(null), children: /* @__PURE__ */ jsxs15("div", { className: "sb-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs15("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsxs15("span", { children: [
          "Rename ",
          KIND_META[renameTarget.kind]?.label || "Artifact"
        ] }),
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setRenameTarget(null), children: /* @__PURE__ */ jsx17(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsx17("div", { className: "sb-modal-body", children: /* @__PURE__ */ jsx17(
        "input",
        {
          className: "sb-input",
          value: renameValue,
          onChange: (e) => setRenameValue(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") submitRename();
          },
          autoFocus: true
        }
      ) }),
      /* @__PURE__ */ jsxs15("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn", onClick: () => setRenameTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: submitRename, children: "Save" })
      ] })
    ] }) }) : null,
    inspectTarget ? /* @__PURE__ */ jsx17("div", { className: "sb-modal-backdrop", onClick: () => setInspectTarget(null), children: /* @__PURE__ */ jsxs15("div", { className: "sb-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs15("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx17("span", { children: "Prompt & Sources" }),
        /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setInspectTarget(null), children: /* @__PURE__ */ jsx17(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs15("div", { className: "sb-modal-body", style: { gap: 12 }, children: [
        /* @__PURE__ */ jsxs15("div", { children: [
          /* @__PURE__ */ jsx17("div", { className: "sb-label", style: { marginBottom: 4 }, children: "Title" }),
          /* @__PURE__ */ jsx17("div", { style: { fontSize: 13.5, fontWeight: 650, color: "var(--ui-text-primary)" }, children: inspectTarget.title })
        ] }),
        /* @__PURE__ */ jsxs15("div", { children: [
          /* @__PURE__ */ jsx17("div", { className: "sb-label", style: { marginBottom: 4 }, children: "Prompt / Instructions" }),
          /* @__PURE__ */ jsx17("div", { className: "sb-quote-box", style: { fontSize: 12 }, children: inspectTarget.params?.instructions || inspectTarget.params?.focus || "Default notebook synthesis" })
        ] }),
        /* @__PURE__ */ jsxs15("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: [
          inspectTarget.params?.deck_format ? /* @__PURE__ */ jsxs15("span", { className: "sb-kind-tag", children: [
            "Format: ",
            inspectTarget.params.deck_format
          ] }) : null,
          inspectTarget.params?.deck_purpose ? /* @__PURE__ */ jsxs15("span", { className: "sb-kind-tag", children: [
            "Style: ",
            inspectTarget.params.deck_purpose
          ] }) : null,
          inspectTarget.params?.language ? /* @__PURE__ */ jsxs15("span", { className: "sb-kind-tag", children: [
            "Lang: ",
            inspectTarget.params.language
          ] }) : null,
          inspectTarget.params?.include_images ? /* @__PURE__ */ jsxs15("span", { className: "sb-kind-tag", children: [
            "ImageGen: ",
            inspectTarget.params.image_mode || "on"
          ] }) : /* @__PURE__ */ jsx17("span", { className: "sb-kind-tag", children: "Native Vector Slides" })
        ] }),
        /* @__PURE__ */ jsxs15("div", { children: [
          /* @__PURE__ */ jsxs15("div", { className: "sb-label", style: { marginBottom: 6 }, children: [
            "Included Sources (",
            sourceNamesForArtifact(inspectTarget).length,
            ")"
          ] }),
          /* @__PURE__ */ jsx17("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: sourceNamesForArtifact(inspectTarget).map((name, i) => /* @__PURE__ */ jsx17("div", { className: "sb-ledger-row", style: { padding: "6px 9px", fontSize: 12 }, children: name }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx17("div", { className: "sb-modal-foot", children: /* @__PURE__ */ jsx17("button", { type: "button", className: "sb-btn sb-btn-primary", onClick: () => setInspectTarget(null), children: "Done" }) })
    ] }) }) : null
  ] });
}

// desktop-src/components/BrandMark.jsx
import { jsx as jsx18, jsxs as jsxs16 } from "react/jsx-runtime";
function BrandMark({ size = 16, accent = "var(--ui-accent, #3b82f6)", className = "", style }) {
  return /* @__PURE__ */ jsxs16(
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
        /* @__PURE__ */ jsx18("polygon", { points: "59,10 74,10 74,34 66.5,26.5 59,34", fill: accent }),
        /* @__PURE__ */ jsx18("polygon", { points: "79.5,10 100,10 100,37.5 79.5,48.5", fill: "currentColor" }),
        /* @__PURE__ */ jsx18("polygon", { points: "47,10 53.5,10 53.5,30.5 44.5,30.5 100,70.5 100,95 24,22", fill: "currentColor" }),
        /* @__PURE__ */ jsx18("polygon", { points: "20,24.5 95.5,97.5 72.5,110 48,110 20,90 20,82.5 36.5,73.5 58,89 74.5,89 20,50", fill: "currentColor" })
      ]
    }
  );
}

// desktop-src/SourceBookWorkspace.jsx
import { Fragment as Fragment12, jsx as jsx19, jsxs as jsxs17 } from "react/jsx-runtime";
function SourceBookWorkspace({ ctx, externalState }) {
  const profile = typeof sdk.useValue === "function" && sdk.host?.state?.profile ? sdk.useValue(sdk.host.state.profile) : "default";
  const connectionId = typeof sdk.useValue === "function" && sdk.host?.state?.connectionId ? sdk.useValue(sdk.host.state.connectionId) : "local";
  const epoch = typeof sdk.useGatewayActivationEpoch === "function" ? sdk.useGatewayActivationEpoch() : 0;
  const liveHostModel = typeof sdk.useValue === "function" && sdk.host?.state?.model ? sdk.useValue(sdk.host.state.model) : "";
  const [notebooks, setNotebooks] = useState13([]);
  const [nbId, setNbId] = useState13("");
  const [notebook, setNotebook] = useState13(null);
  const [sources, setSources] = useState13([]);
  const [notes, setNotes] = useState13([]);
  const [messages, setMessages] = useState13([]);
  const [claims, setClaims] = useState13([]);
  const [contradictions, setContradictions] = useState13(null);
  const [coverage, setCoverage] = useState13(null);
  const [artifacts, setArtifacts] = useState13([]);
  const [modelsInfo, setModelsInfo] = useState13(null);
  const [gatewayModelCatalog, setGatewayModelCatalog] = useState13([]);
  const [capabilities, setCapabilities] = useState13(null);
  const [centerTab, setCenterTab] = useState13("chat");
  const [selectedArtifactId, setSelectedArtifactId] = useState13(null);
  const [inspectorTarget, setInspectorTarget] = useState13(null);
  const [leftCollapsed, setLeftCollapsed] = useState13(false);
  const [rightCollapsed, setRightCollapsed] = useState13(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState13(false);
  const [compactPane, setCompactPane] = useState13("workspace");
  const [layoutTier, setLayoutTier] = useState13("standard");
  const [nbMenuOpen, setNbMenuOpen] = useState13(false);
  const [modelMenuOpen, setModelMenuOpen] = useState13(false);
  const [modelSearch, setModelSearch] = useState13("");
  const [showCustomModel, setShowCustomModel] = useState13(false);
  const [customProvider, setCustomProvider] = useState13("");
  const [customModel, setCustomModel] = useState13("");
  const [createOpen, setCreateOpen] = useState13(false);
  const [newTitle, setNewTitle] = useState13("");
  const [searchOpen, setSearchOpen] = useState13(false);
  const [searchScope, setSearchScope] = useState13("all");
  const [searchQuery, setSearchQuery] = useState13("");
  const [searchHits, setSearchHits] = useState13([]);
  const [loading, setLoading] = useState13(true);
  const [error, setError] = useState13("");
  const [studioExpanded, setStudioExpanded] = useState13(false);
  const reqSeqRef = useRef10(0);
  const rootRef = useRef10(null);
  useEffect11(() => {
    const el = rootRef.current;
    if (!el) return void 0;
    const resolveTier = (width) => {
      if (width < 740) return "compact";
      if (width < 1080) return "split";
      if (width >= 1600) return "wide";
      return "standard";
    };
    const update = (w) => {
      if (!w || w <= 0) return;
      const next = resolveTier(w);
      setLayoutTier((prev) => {
        if (prev !== next && next !== "split") {
          setLeftDrawerOpen(false);
        }
        return next;
      });
    };
    update(el.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1280));
    if (typeof ResizeObserver === "function") {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          update(entry.contentRect?.width || el.clientWidth);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
    if (ctx?.addEventListener) {
      return ctx.addEventListener(window, "resize", () => update(el.clientWidth || window.innerWidth));
    }
    return void 0;
  }, [ctx]);
  const storageKey = `activeNotebook::${connectionId || "local"}::${profile || "default"}`;
  const loadGatewayCatalog = useCallback(async () => {
    if (typeof sdk.host?.request !== "function") return;
    try {
      const res = await sdk.host.request("model.options", {
        include_unconfigured: false,
        explicit_only: false
      });
      const providers = Array.isArray(res?.providers) ? res.providers : [];
      const flat = [];
      for (const p of providers) {
        if (!p || !p.slug) continue;
        const pName = p.name || p.slug;
        const mList = Array.isArray(p.models) ? p.models : [];
        for (const m of mList) {
          const mid = typeof m === "string" ? m : m?.id || m?.name || "";
          if (!mid) continue;
          flat.push({
            provider: p.slug,
            providerLabel: pName,
            model: mid,
            source: "hermes"
          });
        }
      }
      setGatewayModelCatalog(flat);
    } catch {
    }
  }, []);
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
      loadGatewayCatalog();
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
  }, [ctx, storageKey, loadNotebookData, loadGatewayCatalog]);
  useEffect11(() => {
    setSelectedArtifactId(null);
    setInspectorTarget(null);
    loadNotebooks();
  }, [profile, connectionId, epoch, loadNotebooks]);
  useEffect11(() => {
    if (!ctx?.onEvent) return void 0;
    return ctx.onEvent("plugin.sourcebook.notebook.changed", (ev) => {
      const target = ev?.payload?.nb || ev?.nb;
      if (!target || target === nbId) {
        loadNotebookData(nbId);
      }
    });
  }, [ctx, nbId, loadNotebookData]);
  useEffect11(() => {
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
        setLeftDrawerOpen(false);
        setInspectorTarget(null);
      }
    });
  }, [ctx]);
  useEffect11(() => {
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
  async function runCrossSearch(q, scopeOverride) {
    const scope = scopeOverride || searchScope;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchHits([]);
      return;
    }
    try {
      const qs = new URLSearchParams({ q: q.trim() });
      if (scope === "current" && nbId) qs.set("nb", nbId);
      const hits = await api(`/search?${qs.toString()}`);
      setSearchHits(Array.isArray(hits) ? hits : []);
    } catch {
      setSearchHits([]);
    }
  }
  async function handleSaveMemory({ title = "", content = "", citations = [], targetNb = nbId }) {
    const destNb = targetNb || nbId;
    if (!destNb || !String(content || "").trim()) return;
    try {
      const res = await api(`/notebooks/${encodeURIComponent(destNb)}/memory/save`, {
        method: "POST",
        body: { title, content, citations, target: "memory" }
      });
      sdk.host?.notify?.({
        kind: "success",
        title: "Hermes Memory",
        message: res?.message || "Saved verified insight to Hermes Memory."
      });
    } catch (err) {
      sdk.host?.notify?.({
        kind: "error",
        title: "Hermes Memory",
        message: err.message || "Could not save insight to Hermes Memory."
      });
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
  const mergedCatalog = useMemo4(() => {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    const push = (item) => {
      const p = String(item.provider || "").trim();
      const m = String(item.model || "").trim();
      if (!m) return;
      const key = `${p.toLowerCase()}::${m.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        provider: p,
        providerLabel: item.providerLabel || p || "Hermes",
        model: m,
        source: item.source || "config"
      });
    };
    for (const row of gatewayModelCatalog) push(row);
    for (const row of modelsInfo?.options || []) {
      if (row.source !== "active") push(row);
    }
    const q = modelSearch.trim().toLowerCase();
    if (!q) return out;
    return out.filter(
      (it) => it.model.toLowerCase().includes(q) || it.provider.toLowerCase().includes(q) || it.providerLabel.toLowerCase().includes(q)
    );
  }, [gatewayModelCatalog, modelsInfo, modelSearch]);
  const groupedCatalog = useMemo4(() => {
    const groups = /* @__PURE__ */ new Map();
    for (const item of mergedCatalog) {
      const gKey = item.provider || "configured";
      if (!groups.has(gKey)) {
        groups.set(gKey, { slug: gKey, label: item.providerLabel || gKey, items: [] });
      }
      groups.get(gKey).items.push(item);
    }
    return Array.from(groups.values());
  }, [mergedCatalog]);
  const hasNativeCatalogMenu = typeof sdk.ModelCatalogMenu === "function" && Boolean(sdk.ModelMenuCloseContext) && typeof sdk.DropdownMenu === "function" && typeof sdk.DropdownMenuTrigger === "function" && typeof sdk.DropdownMenuContent === "function";
  const NativeModelCatalogMenu = sdk.ModelCatalogMenu;
  const NativeModelMenuCloseContext = sdk.ModelMenuCloseContext;
  const NativeDropdownMenu = sdk.DropdownMenu;
  const NativeDropdownMenuTrigger = sdk.DropdownMenuTrigger;
  const NativeDropdownMenuContent = sdk.DropdownMenuContent;
  const NativeDropdownMenuItem = sdk.DropdownMenuItem;
  const NativeDropdownMenuSeparator = sdk.DropdownMenuSeparator;
  const nativeModelController = useMemo4(() => {
    if (!hasNativeCatalogMenu || !notebook) return null;
    return {
      allowSpeed: false,
      current: {
        effort: "",
        fast: false,
        model: notebook.model || modelsInfo?.active?.model || liveHostModel || "",
        provider: notebook.provider || modelsInfo?.active?.provider || ""
      },
      presetFor: () => ({}),
      applyPreset: (_preset, row) => {
        patchNotebook({ provider: row.provider || "", model: row.model || "" });
        setModelMenuOpen(false);
      },
      select: (model, provider) => {
        patchNotebook({ provider: provider || "", model: model || "" });
        setModelMenuOpen(false);
      },
      setOptions: (_patch, row) => {
        if (row?.model) {
          patchNotebook({ provider: row.provider || "", model: row.model });
        }
      }
    };
  }, [hasNativeCatalogMenu, notebook, modelsInfo, liveHostModel]);
  const covPct = coverage?.total_chunks ? Math.round(coverage.touched_chunks / coverage.total_chunks * 100) : 0;
  const hasActiveSources = sources.some((s) => s.enabled);
  const defaultModelName = modelsInfo?.active?.model || liveHostModel || "";
  const activeModelLabel = notebook?.model ? notebook.model : defaultModelName ? `Auto: ${defaultModelName}` : "Auto (Hermes)";
  const isCompact = layoutTier === "compact";
  const isSplit = layoutTier === "split";
  function handleSelectArtifact(aid) {
    setSelectedArtifactId(aid);
    if (aid) {
      if (isCompact) setCompactPane("studio");
      else if (rightCollapsed) setRightCollapsed(false);
    }
  }
  return /* @__PURE__ */ jsxs17("div", { ref: rootRef, className: "sb-root", "data-layout": layoutTier, style: { position: "relative" }, children: [
    /* @__PURE__ */ jsx19(Styles, {}),
    /* @__PURE__ */ jsxs17("header", { className: "sb-topbar", children: [
      /* @__PURE__ */ jsxs17("div", { className: "sb-topbar-left", children: [
        /* @__PURE__ */ jsxs17("div", { className: "sb-brand", children: [
          /* @__PURE__ */ jsx19("span", { className: "sb-brand-mark", children: /* @__PURE__ */ jsx19(BrandMark, { size: 15 }) }),
          /* @__PURE__ */ jsx19("span", { className: "sb-brand-text", children: "SourceBook" })
        ] }),
        !isCompact ? /* @__PURE__ */ jsxs17(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-ghost",
            style: isSplit ? { padding: "0 8px" } : { width: 28, padding: 0 },
            "data-active": isSplit ? leftDrawerOpen : !leftCollapsed,
            title: isSplit ? leftDrawerOpen ? "Hide Sources drawer" : "Show Sources drawer" : leftCollapsed ? "Show Sources rail" : "Hide Sources rail",
            onClick: () => {
              if (isSplit) setLeftDrawerOpen((v) => !v);
              else setLeftCollapsed((v) => !v);
            },
            children: [
              /* @__PURE__ */ jsx19(Icon, { name: "PanelLeft", size: 14 }),
              isSplit ? /* @__PURE__ */ jsx19("span", { className: "sb-num", style: { fontSize: 11 }, children: sources.length }) : null
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxs17("div", { style: { position: "relative", minWidth: 0 }, children: [
          /* @__PURE__ */ jsxs17(
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
                /* @__PURE__ */ jsx19("span", { className: "sb-nb-select-label", children: notebook?.title || (loading ? "Loading..." : "Select notebook") }),
                /* @__PURE__ */ jsx19(Icon, { name: "ChevronDown", size: 13 })
              ]
            }
          ),
          nbMenuOpen ? /* @__PURE__ */ jsxs17("div", { className: "sb-model-menu", style: { left: 0, right: "auto" }, children: [
            notebooks.map((nb) => /* @__PURE__ */ jsxs17(
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
                  /* @__PURE__ */ jsxs17("div", { style: { minWidth: 0 }, children: [
                    /* @__PURE__ */ jsx19("div", { className: "sb-src-title", children: nb.title }),
                    /* @__PURE__ */ jsxs17("div", { style: { fontSize: 11, color: "var(--ui-text-tertiary)" }, children: [
                      /* @__PURE__ */ jsx19("span", { className: "sb-num", children: nb.source_count || 0 }),
                      " sources | ",
                      /* @__PURE__ */ jsx19("span", { className: "sb-num", children: nb.artifact_count || 0 }),
                      " artifacts"
                    ] })
                  ] }),
                  notebooks.length > 1 ? /* @__PURE__ */ jsx19(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon sb-btn-danger",
                      title: "Delete notebook",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteNotebook(nb.id);
                      },
                      children: /* @__PURE__ */ jsx19(Icon, { name: "Trash2", size: 12 })
                    }
                  ) : null
                ]
              },
              nb.id
            )),
            /* @__PURE__ */ jsx19("div", { style: { borderTop: "1px solid var(--ui-stroke-tertiary)", marginTop: 4, paddingTop: 4 }, children: /* @__PURE__ */ jsxs17(
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
                  /* @__PURE__ */ jsx19(Icon, { name: "Plus", size: 13 }),
                  " New notebook"
                ]
              }
            ) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs17("button", { type: "button", className: "sb-btn sb-top-new-btn", onClick: () => setCreateOpen(true), title: "Create new notebook", children: [
          /* @__PURE__ */ jsx19(Icon, { name: "Plus", size: 13 }),
          " ",
          /* @__PURE__ */ jsx19("span", { className: "sb-top-label", children: "New" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs17("div", { className: "sb-topbar-right", children: [
        notebook ? /* @__PURE__ */ jsxs17(Fragment12, { children: [
          hasNativeCatalogMenu && nativeModelController ? /* @__PURE__ */ jsxs17(NativeDropdownMenu, { open: modelMenuOpen, onOpenChange: (open) => {
            setNbMenuOpen(false);
            setModelMenuOpen(open);
          }, children: [
            /* @__PURE__ */ jsx19(NativeDropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs17(
              "button",
              {
                type: "button",
                className: "sb-btn sb-model-trigger",
                "data-active": Boolean(notebook.model),
                title: `Model: ${activeModelLabel} (click to switch across authenticated Hermes providers)`,
                children: [
                  /* @__PURE__ */ jsx19(Icon, { name: "Cpu", size: 12 }),
                  /* @__PURE__ */ jsx19("span", { className: "sb-model-trigger-label", children: activeModelLabel }),
                  /* @__PURE__ */ jsx19(Icon, { name: "ChevronDown", size: 11 })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs17(NativeDropdownMenuContent, { align: "end", style: { width: "min(320px, calc(100vw - 24px))", padding: 0 }, children: [
              NativeDropdownMenuItem ? /* @__PURE__ */ jsx19("div", { style: { padding: "4px 4px 0" }, children: /* @__PURE__ */ jsx19(
                NativeDropdownMenuItem,
                {
                  onSelect: async () => {
                    await patchNotebook({ provider: "", model: "" });
                    setModelMenuOpen(false);
                  },
                  children: /* @__PURE__ */ jsxs17("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: 8 }, children: [
                    /* @__PURE__ */ jsx19("span", { style: { fontWeight: !notebook.model ? 650 : 500 }, children: "Auto (Active Hermes)" }),
                    /* @__PURE__ */ jsx19("span", { className: "sb-mono", style: { fontSize: 10.5, opacity: 0.72, maxWidth: 136, overflow: "hidden", textOverflow: "ellipsis" }, children: defaultModelName || "default" })
                  ] })
                }
              ) }) : null,
              NativeDropdownMenuSeparator ? /* @__PURE__ */ jsx19(NativeDropdownMenuSeparator, {}) : null,
              /* @__PURE__ */ jsx19(NativeModelMenuCloseContext.Provider, { value: () => setModelMenuOpen(false), children: /* @__PURE__ */ jsx19(NativeModelCatalogMenu, { controller: nativeModelController }) }),
              modelsInfo && !modelsInfo.override_ready ? /* @__PURE__ */ jsxs17("div", { style: { padding: "6px 10px 8px", fontSize: 10.5, color: "var(--ui-text-tertiary)", borderTop: "1px solid var(--ui-stroke-tertiary)", lineHeight: 1.4 }, children: [
                "Enable ",
                /* @__PURE__ */ jsx19("span", { className: "sb-mono", children: "allow_model_override" }),
                " in Hermes config to pin overrides (see Settings)."
              ] }) : null
            ] })
          ] }) : /* @__PURE__ */ jsxs17("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxs17(
              "button",
              {
                type: "button",
                className: "sb-btn sb-model-trigger",
                "data-active": Boolean(notebook.model),
                onClick: () => {
                  setNbMenuOpen(false);
                  setCustomProvider(notebook.provider || "");
                  setCustomModel(notebook.model || "");
                  setModelSearch("");
                  if (!modelMenuOpen) loadGatewayCatalog();
                  setModelMenuOpen((v) => !v);
                },
                title: `Model: ${activeModelLabel} (click to switch across authenticated Hermes providers)`,
                children: [
                  /* @__PURE__ */ jsx19(Icon, { name: "Cpu", size: 12 }),
                  /* @__PURE__ */ jsx19("span", { className: "sb-model-trigger-label", children: activeModelLabel }),
                  /* @__PURE__ */ jsx19(Icon, { name: "ChevronDown", size: 11 })
                ]
              }
            ),
            modelMenuOpen ? /* @__PURE__ */ jsxs17("div", { className: "sb-model-menu", children: [
              /* @__PURE__ */ jsxs17("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 2px" }, children: [
                /* @__PURE__ */ jsx19("span", { style: { fontSize: 10.5, fontWeight: 650, color: "var(--ui-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Hermes Model Picker" }),
                modelsInfo?.override_ready ? /* @__PURE__ */ jsx19("span", { className: "sb-verdict", "data-v": "supported", style: { fontSize: 10, padding: "1px 6px" }, children: "Any model ready" }) : null
              ] }),
              /* @__PURE__ */ jsxs17(
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
                    /* @__PURE__ */ jsx19("span", { children: "Auto (Active Hermes)" }),
                    /* @__PURE__ */ jsx19("span", { className: "sb-mono", style: { fontSize: 10.5, opacity: 0.72, maxWidth: 148, overflow: "hidden", textOverflow: "ellipsis" }, children: defaultModelName || "default" })
                  ]
                }
              ),
              mergedCatalog.length > 0 ? /* @__PURE__ */ jsxs17("div", { style: { padding: "4px 4px 2px", display: "flex", flexDirection: "column", gap: 4 }, children: [
                /* @__PURE__ */ jsx19(
                  "input",
                  {
                    className: "sb-input",
                    style: { height: 28, fontSize: 11.5 },
                    value: modelSearch,
                    onChange: (e) => setModelSearch(e.target.value),
                    placeholder: `Search ${mergedCatalog.length} Hermes models...`
                  }
                ),
                /* @__PURE__ */ jsx19("div", { className: "sb-scroll", style: { maxHeight: "min(240px, 42vh)", display: "flex", flexDirection: "column", gap: 6, paddingRight: 2 }, children: groupedCatalog.map((grp) => /* @__PURE__ */ jsxs17("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [
                  /* @__PURE__ */ jsxs17("div", { style: { fontSize: 10, fontWeight: 650, color: "var(--ui-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 6px" }, children: [
                    grp.label,
                    " (",
                    grp.items.length,
                    ")"
                  ] }),
                  grp.items.slice(0, 24).map((opt) => {
                    const active = notebook.model === opt.model && (notebook.provider || "") === (opt.provider || "");
                    return /* @__PURE__ */ jsxs17(
                      "button",
                      {
                        type: "button",
                        className: "sb-btn sb-btn-ghost",
                        style: { width: "100%", justifyContent: "space-between", height: 26 },
                        "data-active": active,
                        onClick: async () => {
                          await patchNotebook({ provider: opt.provider || "", model: opt.model });
                          setModelMenuOpen(false);
                        },
                        children: [
                          /* @__PURE__ */ jsx19("span", { className: "sb-src-title", style: { fontSize: 12 }, children: opt.model }),
                          active ? /* @__PURE__ */ jsx19(Icon, { name: "Check", size: 12, style: { color: "var(--ui-accent)" } }) : null
                        ]
                      },
                      `${opt.provider}:${opt.model}`
                    );
                  })
                ] }, grp.slug)) })
              ] }) : null,
              /* @__PURE__ */ jsxs17("div", { style: { borderTop: "1px solid var(--ui-stroke-tertiary)", marginTop: 4, paddingTop: 4 }, children: [
                /* @__PURE__ */ jsxs17(
                  "button",
                  {
                    type: "button",
                    className: "sb-btn sb-btn-ghost",
                    style: { width: "100%", justifyContent: "space-between", fontSize: 11 },
                    onClick: () => setShowCustomModel((v) => !v),
                    children: [
                      /* @__PURE__ */ jsx19("span", { children: "Custom provider / model ID" }),
                      /* @__PURE__ */ jsx19(Icon, { name: showCustomModel ? "ChevronDown" : "ChevronRight", size: 11 })
                    ]
                  }
                ),
                showCustomModel ? /* @__PURE__ */ jsxs17(
                  "form",
                  {
                    style: { padding: "6px 4px 4px", display: "flex", flexDirection: "column", gap: 6 },
                    onSubmit: async (e) => {
                      e.preventDefault();
                      await patchNotebook({ provider: customProvider.trim(), model: customModel.trim() });
                      setModelMenuOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsx19(
                        "input",
                        {
                          className: "sb-input",
                          value: customProvider,
                          onChange: (e) => setCustomProvider(e.target.value),
                          placeholder: "Provider (e.g. openrouter, ollama, anthropic)"
                        }
                      ),
                      /* @__PURE__ */ jsx19(
                        "input",
                        {
                          className: "sb-input",
                          value: customModel,
                          onChange: (e) => setCustomModel(e.target.value),
                          placeholder: "Model ID (e.g. claude-opus-5-5, qwen3:32b)"
                        }
                      ),
                      /* @__PURE__ */ jsx19("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: !customModel.trim(), children: "Apply model" })
                    ]
                  }
                ) : null,
                modelsInfo && !modelsInfo.override_ready ? /* @__PURE__ */ jsxs17("div", { style: { padding: "4px 6px", fontSize: 10.5, color: "var(--ui-text-tertiary)", lineHeight: 1.4 }, children: [
                  "Enable ",
                  /* @__PURE__ */ jsx19("span", { className: "sb-mono", children: "allow_model_override" }),
                  " in Hermes config to pin overrides (see Settings)."
                ] }) : null
              ] })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxs17(
            "button",
            {
              type: "button",
              className: "sb-cov-meter sb-hide-compact",
              title: "Open Coverage Map",
              onClick: () => {
                setCenterTab("coverage");
                if (isCompact) setCompactPane("workspace");
              },
              children: [
                /* @__PURE__ */ jsx19("span", { className: "sb-cov-label", children: "Coverage" }),
                /* @__PURE__ */ jsx19("span", { className: "sb-cov-track", children: /* @__PURE__ */ jsx19("span", { className: "sb-cov-fill sb-dither-fill", style: { width: `${covPct}%` } }) }),
                /* @__PURE__ */ jsxs17("span", { className: "sb-mono", style: { fontWeight: 600 }, children: [
                  covPct,
                  "%"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs17(
            "button",
            {
              type: "button",
              className: "sb-btn sb-top-strict-btn",
              "data-active": Boolean(notebook.strict),
              onClick: () => patchNotebook({ strict: !notebook.strict }),
              title: "Strict grounding refuses any claim unsupported by active sources",
              children: [
                /* @__PURE__ */ jsx19(Icon, { name: "Lock", size: 12 }),
                " ",
                /* @__PURE__ */ jsx19("span", { className: "sb-top-label", children: notebook.strict ? "Strict" : "Grounded" })
              ]
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxs17(
          "button",
          {
            type: "button",
            className: "sb-btn sb-top-search-btn",
            onClick: () => {
              setSearchQuery("");
              setSearchHits([]);
              setSearchOpen(true);
            },
            title: "Search across all notebooks (Ctrl+K)",
            children: [
              /* @__PURE__ */ jsx19(Icon, { name: "Search", size: 12 }),
              " ",
              /* @__PURE__ */ jsx19("span", { className: "sb-top-label", children: "Search" })
            ]
          }
        ),
        !isCompact && nbId ? /* @__PURE__ */ jsx19(
          "button",
          {
            type: "button",
            className: "sb-btn sb-btn-ghost sb-btn-icon",
            "data-active": !rightCollapsed,
            title: rightCollapsed ? "Show Studio rail" : "Hide Studio rail",
            onClick: () => {
              if (studioExpanded) setStudioExpanded(false);
              setRightCollapsed((v) => !v);
            },
            children: /* @__PURE__ */ jsx19(Icon, { name: "PanelRight", size: 14 })
          }
        ) : null
      ] })
    ] }),
    nbId && isCompact ? /* @__PURE__ */ jsx19("nav", { className: "sb-compact-bar", "aria-label": "Workspace panes", children: /* @__PURE__ */ jsxs17("div", { className: "sb-seg sb-compact-tabs", role: "tablist", children: [
      /* @__PURE__ */ jsxs17(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": compactPane === "sources",
          className: "sb-seg-btn",
          "data-active": compactPane === "sources",
          onClick: () => setCompactPane("sources"),
          children: [
            /* @__PURE__ */ jsx19(Icon, { name: "Library", size: 12 }),
            " Sources ",
            /* @__PURE__ */ jsx19("span", { className: "sb-num", style: { opacity: 0.72 }, children: sources.length })
          ]
        }
      ),
      /* @__PURE__ */ jsxs17(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": compactPane === "workspace",
          className: "sb-seg-btn",
          "data-active": compactPane === "workspace",
          onClick: () => setCompactPane("workspace"),
          children: [
            /* @__PURE__ */ jsx19(Icon, { name: "MessageSquare", size: 12 }),
            " Workspace"
          ]
        }
      ),
      /* @__PURE__ */ jsxs17(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": compactPane === "studio",
          className: "sb-seg-btn",
          "data-active": compactPane === "studio",
          onClick: () => setCompactPane("studio"),
          children: [
            /* @__PURE__ */ jsx19(Icon, { name: "Sparkles", size: 12 }),
            " Studio ",
            /* @__PURE__ */ jsx19("span", { className: "sb-num", style: { opacity: 0.72 }, children: artifacts.length })
          ]
        }
      )
    ] }) }) : null,
    error ? /* @__PURE__ */ jsxs17("div", { className: "sb-error-bar", role: "alert", children: [
      /* @__PURE__ */ jsx19("span", { children: error }),
      /* @__PURE__ */ jsx19("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setError(""), children: /* @__PURE__ */ jsx19(Icon, { name: "X", size: 13 }) })
    ] }) : null,
    !loading && !nbId ? /* @__PURE__ */ jsxs17("div", { className: "sb-empty", style: { flex: 1, justifyContent: "center", position: "relative", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsx19(
        DitherCanvas,
        {
          variant: "aurora",
          animated: false,
          opacity: 0.22,
          style: { position: "absolute", inset: "0 0 auto 0", width: "100%", height: 150, pointerEvents: "none" }
        }
      ),
      /* @__PURE__ */ jsx19(BrandMark, { size: 38, style: { color: "var(--ui-text-primary)", position: "relative" } }),
      /* @__PURE__ */ jsx19("div", { style: { fontSize: 16, fontWeight: 650, color: "var(--ui-text-primary)", position: "relative" }, children: "Create your first research notebook" }),
      /* @__PURE__ */ jsx19("div", { style: { maxWidth: 440, fontSize: 13, position: "relative" }, children: "Collect PDFs, DOCX files, Markdown, CSV tables, YouTube videos, local folders, and web URLs in one workspace. Every answer cites exact passages and runs on any model configured in Hermes." }),
      /* @__PURE__ */ jsxs17("button", { type: "button", className: "sb-btn sb-btn-primary", style: { position: "relative" }, onClick: () => setCreateOpen(true), children: [
        /* @__PURE__ */ jsx19(Icon, { name: "Plus", size: 13 }),
        " New notebook"
      ] })
    ] }) : /* @__PURE__ */ jsxs17(
      "div",
      {
        className: "sb-workbench",
        "data-tier": layoutTier,
        "data-left-collapsed": !isCompact && !isSplit && leftCollapsed,
        "data-right-collapsed": !isCompact && rightCollapsed,
        "data-left-drawer": isSplit && leftDrawerOpen,
        "data-compact-pane": compactPane,
        "data-studio-expanded": !isCompact && studioExpanded,
        children: [
          isSplit && leftDrawerOpen ? /* @__PURE__ */ jsx19("div", { className: "sb-drawer-backdrop", onClick: () => setLeftDrawerOpen(false), "aria-hidden": "true" }) : null,
          /* @__PURE__ */ jsx19(
            SidebarSources,
            {
              ctx,
              nbId,
              sources,
              notes,
              coverage,
              selectedSourceId: inspectorTarget?.sourceId || null,
              onSelectSource: (target) => {
                setInspectorTarget(target);
                if (isSplit) setLeftDrawerOpen(false);
              },
              onOpenArtifact: handleSelectArtifact,
              onSaveMemory: handleSaveMemory,
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          ),
          /* @__PURE__ */ jsx19(
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
              onSaveMemory: handleSaveMemory,
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          ),
          /* @__PURE__ */ jsx19(
            StudioPanel,
            {
              ctx,
              nbId,
              sources,
              hasActiveSources,
              capabilities,
              artifacts,
              selectedArtifactId,
              expanded: !isCompact && studioExpanded,
              onToggleExpand: isCompact ? void 0 : () => setStudioExpanded((v) => !v),
              onSelectArtifact: handleSelectArtifact,
              onOpenChunk: (cid) => setInspectorTarget({ sourceId: String(cid).split(":")[0], chunkId: cid }),
              onRefresh: () => loadNotebookData(nbId),
              onError: setError
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx19(
      SourceInspector,
      {
        nbId,
        target: inspectorTarget,
        onClose: () => setInspectorTarget(null),
        onPromoteQuote: handlePromoteQuote,
        onSaveMemory: handleSaveMemory
      }
    ),
    createOpen ? /* @__PURE__ */ jsx19("div", { className: "sb-modal-backdrop", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsxs17("form", { className: "sb-modal", onClick: (e) => e.stopPropagation(), onSubmit: handleCreateNotebook, children: [
      /* @__PURE__ */ jsxs17("div", { className: "sb-modal-head", children: [
        /* @__PURE__ */ jsx19("span", { children: "New research notebook" }),
        /* @__PURE__ */ jsx19("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setCreateOpen(false), children: /* @__PURE__ */ jsx19(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsx19("div", { className: "sb-modal-body", children: /* @__PURE__ */ jsxs17("label", { className: "sb-field", children: [
        /* @__PURE__ */ jsx19("span", { className: "sb-label", children: "Notebook title" }),
        /* @__PURE__ */ jsx19(
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
      /* @__PURE__ */ jsxs17("div", { className: "sb-modal-foot", children: [
        /* @__PURE__ */ jsx19("button", { type: "button", className: "sb-btn", onClick: () => setCreateOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx19("button", { type: "submit", className: "sb-btn sb-btn-primary", disabled: !newTitle.trim(), children: "Create" })
      ] })
    ] }) }) : null,
    searchOpen ? /* @__PURE__ */ jsx19("div", { className: "sb-modal-backdrop", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsxs17("div", { className: "sb-modal", style: { width: "min(620px, 94vw)" }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs17("div", { className: "sb-modal-head", style: { flexWrap: "wrap", gap: 8 }, children: [
        /* @__PURE__ */ jsxs17("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }, children: [
          /* @__PURE__ */ jsx19("span", { children: "Cross-Notebook Search" }),
          /* @__PURE__ */ jsxs17("div", { className: "sb-seg", children: [
            /* @__PURE__ */ jsxs17(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": searchScope === "all",
                onClick: () => {
                  setSearchScope("all");
                  runCrossSearch(searchQuery, "all");
                },
                children: [
                  "All (",
                  notebooks.length,
                  ")"
                ]
              }
            ),
            /* @__PURE__ */ jsx19(
              "button",
              {
                type: "button",
                className: "sb-seg-btn",
                "data-active": searchScope === "current",
                disabled: !nbId,
                onClick: () => {
                  setSearchScope("current");
                  runCrossSearch(searchQuery, "current");
                },
                children: "Current"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx19("button", { type: "button", className: "sb-btn sb-btn-ghost sb-btn-icon", onClick: () => setSearchOpen(false), children: /* @__PURE__ */ jsx19(Icon, { name: "X", size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxs17("div", { className: "sb-modal-body sb-scroll", style: { maxHeight: "68vh" }, children: [
        /* @__PURE__ */ jsx19(
          "input",
          {
            className: "sb-input",
            value: searchQuery,
            onChange: (e) => runCrossSearch(e.target.value),
            placeholder: searchScope === "all" ? "Hybrid semantic + BM25 search across every notebook..." : "Search passages inside this notebook...",
            autoFocus: true
          }
        ),
        searchHits.length === 0 && searchQuery.trim() ? /* @__PURE__ */ jsx19("div", { className: "sb-empty", children: "No matching passages found." }) : null,
        searchHits.map((hit) => /* @__PURE__ */ jsxs17(
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
              /* @__PURE__ */ jsxs17("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11.5 }, children: [
                /* @__PURE__ */ jsxs17("div", { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxs17("strong", { className: "sb-src-title", children: [
                    hit.notebook_title,
                    " / ",
                    hit.source_title
                  ] }),
                  hit.source_kind ? /* @__PURE__ */ jsx19("span", { className: "sb-kind-tag", children: hit.source_kind }) : null,
                  hit.page > 1 ? /* @__PURE__ */ jsxs17("span", { className: "sb-kind-tag", children: [
                    "p.",
                    hit.page
                  ] }) : null
                ] }),
                /* @__PURE__ */ jsxs17("div", { style: { display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }, onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsx19("span", { className: "sb-mono", style: { color: "var(--ui-accent)", fontSize: 10.5 }, children: hit.chunk_id }),
                  /* @__PURE__ */ jsx19(
                    "button",
                    {
                      type: "button",
                      className: "sb-btn sb-btn-ghost sb-btn-icon",
                      title: "Save this passage to Hermes persistent memory",
                      onClick: () => handleSaveMemory({ title: hit.source_title, content: hit.snippet, citations: [hit.chunk_id], targetNb: hit.notebook_id }),
                      children: /* @__PURE__ */ jsx19(Icon, { name: "Brain", size: 12 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx19("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", lineHeight: 1.48 }, children: hit.snippet })
            ]
          },
          `${hit.notebook_id}-${hit.chunk_id}`
        ))
      ] })
    ] }) }) : null
  ] });
}

// desktop-src/SettingsPage.jsx
import { useEffect as useEffect12, useState as useState14 } from "react";
import { jsx as jsx20, jsxs as jsxs18 } from "react/jsx-runtime";
function SettingsPage() {
  const [caps, setCaps] = useState14(null);
  const [modelsInfo, setModelsInfo] = useState14(null);
  const [err, setErr] = useState14("");
  useEffect12(() => {
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
    ["PDF extractor & previews", caps?.pymupdf ? "PyMuPDF active (OCR + visual page previews)" : pdfStatus],
    ["DOCX extractor", caps?.python_docx ? "python-docx active" : "Built-in stdlib XML extractor"],
    ["Image generation", caps?.image_generate ? [caps.image_gen_provider, caps.image_gen_model].filter(Boolean).join(" \xB7 ") || "Available for Slides & Infographics" : "Not configured"],
    ["Hermes Memory bridge", caps?.memory_tool ? "Native Hermes memory tool active" : "Direct profile MEMORY.md bridge active"]
  ];
  const setupCmd = (modelsInfo?.setup_commands || [
    "hermes config set plugins.entries.sourcebook.llm.allow_model_override true",
    "hermes config set plugins.entries.sourcebook.llm.allow_provider_override true"
  ]).join("\n");
  return /* @__PURE__ */ jsxs18("div", { className: "sb-root", style: { height: "auto", overflow: "visible", background: "transparent" }, children: [
    /* @__PURE__ */ jsx20(Styles, {}),
    /* @__PURE__ */ jsxs18("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 760, width: "100%" }, children: [
      /* @__PURE__ */ jsxs18("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxs18("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: "1 1 240px" }, children: [
          /* @__PURE__ */ jsx20("span", { className: "sb-brand-mark", style: { width: 32, height: 32, borderRadius: 8, flexShrink: 0 }, children: /* @__PURE__ */ jsx20(BrandMark, { size: 20 }) }),
          /* @__PURE__ */ jsxs18("div", { style: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx20("div", { style: { fontWeight: 650, fontSize: 14 }, children: "SourceBook Research Notebooks" }),
            /* @__PURE__ */ jsx20("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)", marginTop: 2 }, children: "Universal Hermes model routing, hybrid search, Claim Ledger contradictions, and 8 Studio formats including Audio Overviews." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs18("button", { type: "button", className: "sb-btn sb-btn-primary", style: { flexShrink: 0 }, onClick: () => sdk.host?.navigate?.("/sourcebook"), children: [
          /* @__PURE__ */ jsx20(BrandMark, { size: 13, accent: "rgba(255,255,255,0.72)" }),
          " Open SourceBook"
        ] })
      ] }),
      err ? /* @__PURE__ */ jsx20("div", { className: "sb-error-bar", style: { margin: 0 }, children: err }) : null,
      /* @__PURE__ */ jsx20("div", { className: "sb-table-wrap", children: /* @__PURE__ */ jsxs18("table", { className: "sb-table", children: [
        /* @__PURE__ */ jsx20("thead", { children: /* @__PURE__ */ jsxs18("tr", { children: [
          /* @__PURE__ */ jsx20("th", { children: "Capability" }),
          /* @__PURE__ */ jsx20("th", { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsx20("tbody", { children: rows.map(([label, status]) => /* @__PURE__ */ jsxs18("tr", { children: [
          /* @__PURE__ */ jsx20("td", { style: { fontWeight: 550, minWidth: 130 }, children: label }),
          /* @__PURE__ */ jsx20("td", { style: { color: "var(--ui-text-secondary)", overflowWrap: "anywhere" }, children: caps ? status : "Checking..." })
        ] }, label)) })
      ] }) }),
      /* @__PURE__ */ jsxs18("div", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsxs18("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx20("strong", { style: { fontSize: 12 }, children: "Use any Hermes model per notebook" }),
          /* @__PURE__ */ jsxs18(
            "button",
            {
              type: "button",
              className: "sb-btn",
              onClick: async () => {
                await copyText(setupCmd);
                sdk.host?.notify?.({ kind: "success", title: "SourceBook", message: "Copied Hermes config commands." });
              },
              children: [
                /* @__PURE__ */ jsx20(Icon, { name: "Copy", size: 12 }),
                " Copy commands"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs18("div", { style: { fontSize: 12, color: "var(--ui-text-secondary)" }, children: [
          "SourceBook automatically works with your active Hermes model or auxiliary task slots (",
          /* @__PURE__ */ jsx20("span", { className: "sb-mono", children: "sourcebook_chat" }),
          ", ",
          /* @__PURE__ */ jsx20("span", { className: "sb-mono", children: "sourcebook_studio" }),
          ", ",
          /* @__PURE__ */ jsx20("span", { className: "sb-mono", children: "sourcebook_audio" }),
          ", ",
          /* @__PURE__ */ jsx20("span", { className: "sb-mono", children: "sourcebook_ingest" }),
          "). To pick any provider or model per notebook directly inside SourceBook, run:"
        ] }),
        /* @__PURE__ */ jsx20("pre", { className: "sb-mono sb-code-pre", style: { borderRadius: 7, border: "1px solid var(--ui-stroke-tertiary)", maxWidth: "100%" }, children: setupCmd })
      ] }),
      /* @__PURE__ */ jsxs18("div", { className: "sb-ledger-row", children: [
        /* @__PURE__ */ jsx20("strong", { style: { fontSize: 12 }, children: "Slash commands" }),
        /* @__PURE__ */ jsxs18("div", { className: "sb-mono", style: { fontSize: 11.5, color: "var(--ui-text-secondary)", lineHeight: 1.7, overflowWrap: "anywhere" }, children: [
          "/sourcebook list",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook use <nb_id>",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook model <nb_id> <provider/model|auto>",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook sync <nb_id> <local_path>",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook add <nb_id> <url or text>",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook ask <nb_id> <question>",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook make <nb_id> <kind> [focus]",
          /* @__PURE__ */ jsx20("br", {}),
          "/sourcebook research <nb_id> <topic>"
        ] })
      ] })
    ] })
  ] });
}

// desktop-src/plugin.jsx
import { jsx as jsx21, jsxs as jsxs19 } from "react/jsx-runtime";
var ROUTE = "/sourcebook";
function StatusChip({ externalState }) {
  const state = typeof sdk.useValue === "function" && externalState ? sdk.useValue(externalState) : null;
  if (!state?.title) return null;
  return /* @__PURE__ */ jsxs19(
    "button",
    {
      type: "button",
      className: "sb-status-chip",
      onClick: () => sdk.host?.navigate?.(ROUTE),
      title: `Open SourceBook: ${state.title}`,
      children: [
        /* @__PURE__ */ jsx21(BrandMark, { size: 13 }),
        /* @__PURE__ */ jsx21("span", { children: state.title }),
        state.dueCards > 0 ? /* @__PURE__ */ jsxs19("span", { className: "sb-mono", children: [
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
  return /* @__PURE__ */ jsxs19(
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
        /* @__PURE__ */ jsx21(BrandMark, { size: 14 }),
        /* @__PURE__ */ jsx21("span", { children: "SourceBook source" }),
        chunk ? /* @__PURE__ */ jsx21("span", { className: "sb-mono", children: chunk }) : null
      ]
    }
  );
}
var plugin_default = {
  id: "sourcebook",
  name: "SourceBook",
  description: "Source-grounded research notebooks, Claim Ledger, Coverage Map, and 8-format interactive Studio.",
  register(ctx) {
    bindContext(ctx);
    const externalState = typeof sdk.atom === "function" ? sdk.atom({ title: "", dueCards: 0, nbId: "", pendingJump: null }) : null;
    ctx.register({
      id: "page",
      area: sdk.ROUTES_AREA,
      data: { path: ROUTE },
      render: () => /* @__PURE__ */ jsx21(SourceBookWorkspace, { ctx, externalState })
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
        render: () => /* @__PURE__ */ jsx21(StatusChip, { externalState })
      });
    }
    if (sdk.TRANSCRIPT_DIRECTIVE_AREA) {
      ctx.register({
        id: "cite-directive",
        area: sdk.TRANSCRIPT_DIRECTIVE_AREA,
        data: { name: "cite" },
        render: (props) => /* @__PURE__ */ jsx21(CiteDirective, { props, externalState })
      });
    }
    if (typeof ctx.registerSettingsPage === "function") {
      ctx.registerSettingsPage({
        id: "sourcebook",
        title: "SourceBook",
        description: "Source-grounded research notebooks and Studio.",
        render: () => /* @__PURE__ */ jsx21(SettingsPage, {})
      });
    }
  }
};
export {
  plugin_default as default
};
