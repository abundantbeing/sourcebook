"""Deterministic, read-only tabular data profiler & chart builder for CSV/TSV/JSON notebook sources."""

from __future__ import annotations

import csv
import io
import json
import math
import re
from statistics import median
from typing import Any, Optional

from . import store

_NUM_CLEAN_RE = re.compile(r"[,$%\s]")


def _to_float(val: Any) -> Optional[float]:
    if isinstance(val, (int, float)) and not isinstance(val, bool) and math.isfinite(val):
        return float(val)
    s = str(val or "").strip()
    if not s:
        return None
    # Strip trailing units like ms, GB, x, %
    cleaned = re.sub(r"(ms|sec|s|gb|mb|kb|mib|x|usd)$", "", _NUM_CLEAN_RE.sub("", s), flags=re.IGNORECASE)
    try:
        v = float(cleaned)
        return v if math.isfinite(v) else None
    except ValueError:
        return None


def _parse_source_rows(nb: str, src_id: str) -> tuple[dict[str, Any], list[str], list[dict[str, Any]]]:
    data = store.get_source_text(nb, src_id)
    meta = data["source"]
    d = store.nb_dir(nb, must_exist=True)
    sdir = d / "sources" / src_id

    # 1. Prefer raw CSV/TSV/JSON if preserved
    for ext in ("csv", "tsv", "json"):
        orig = sdir / f"original.{ext}"
        if orig.is_file():
            raw_text = orig.read_text(encoding="utf-8-sig", errors="replace")
            if ext in ("csv", "tsv"):
                reader = csv.DictReader(io.StringIO(raw_text), delimiter="\t" if ext == "tsv" else ",")
                rows = [dict(r) for r in reader if any(str(v or "").strip() for v in r.values())]
                cols = list(reader.fieldnames or [])
                return meta, cols, rows
            if ext == "json":
                parsed = json.loads(raw_text)
                if isinstance(parsed, list) and parsed and isinstance(parsed[0], dict):
                    cols = list(dict.fromkeys(k for r in parsed[:50] for k in r.keys()))
                    return meta, cols, parsed

    # 2. Fallback: parse Markdown pipe tables inside text.md
    text = data.get("text") or ""
    table_lines = [ln.strip() for ln in text.splitlines() if ln.strip().startswith("|") and ln.strip().endswith("|")]
    if len(table_lines) >= 3:
        headers = [c.strip() for c in table_lines[0].strip("|").split("|")]
        rows = []
        for ln in table_lines[2:]:
            if re.fullmatch(r"[\s|:\-]+", ln):
                continue
            vals = [c.strip() for c in ln.strip("|").split("|")]
            rows.append({headers[i]: (vals[i] if i < len(vals) else "") for i in range(len(headers))})
        return meta, headers, rows

    raise ValueError(f"Source {meta.get('title', src_id)!r} does not contain tabular CSV, JSON, or Markdown table data.")


def analyze_source(nb: str, src_id: str, *, metric_col: Optional[str] = None, label_col: Optional[str] = None) -> dict[str, Any]:
    """Compute exact column statistics and chart-ready series for a tabular notebook source."""
    meta, cols, rows = _parse_source_rows(nb, src_id)
    if not cols or not rows:
        raise ValueError("Source table has no rows to analyze.")

    col_profiles: list[dict[str, Any]] = []
    numeric_cols: list[str] = []
    text_cols: list[str] = []

    for col in cols[:24]:
        raw_vals = [r.get(col) for r in rows]
        non_empty = [v for v in raw_vals if v is not None and str(v).strip() != ""]
        nums = [n for n in (_to_float(v) for v in non_empty) if n is not None]
        if non_empty and len(nums) >= max(1, int(len(non_empty) * 0.7)):
            numeric_cols.append(col)
            s_nums = sorted(nums)
            p95_idx = min(len(s_nums) - 1, max(0, int(round(0.95 * (len(s_nums) - 1)))))
            col_profiles.append({
                "column": col,
                "type": "number",
                "count": len(nums),
                "min": round(s_nums[0], 4),
                "max": round(s_nums[-1], 4),
                "mean": round(sum(nums) / len(nums), 4),
                "median": round(float(median(s_nums)), 4),
                "p95": round(s_nums[p95_idx], 4),
                "sum": round(sum(nums), 4),
            })
        else:
            text_cols.append(col)
            freq: dict[str, int] = {}
            for v in non_empty:
                k = str(v).strip()[:64]
                freq[k] = freq.get(k, 0) + 1
            top = sorted(freq.items(), key=lambda kv: kv[1], reverse=True)[:5]
            col_profiles.append({
                "column": col,
                "type": "category",
                "count": len(non_empty),
                "unique": len(freq),
                "top_values": [{"value": k, "count": c} for k, c in top],
            })

    chosen_metric = metric_col if metric_col in numeric_cols else (numeric_cols[0] if numeric_cols else None)
    chosen_label = label_col if label_col in cols else (text_cols[0] if text_cols else cols[0])

    chart: Optional[dict[str, Any]] = None
    if chosen_metric:
        series: list[dict[str, Any]] = []
        for idx, r in enumerate(rows[:20]):
            v = _to_float(r.get(chosen_metric))
            if v is None:
                continue
            lbl = str(r.get(chosen_label) or f"Row {idx + 1}").strip()[:36]
            series.append({"label": lbl, "value": round(v, 4)})
        if series:
            chart = {
                "title": f"{chosen_metric} by {chosen_label}",
                "metric": chosen_metric,
                "label_col": chosen_label,
                "max_value": max(abs(pt["value"]) for pt in series) or 1.0,
                "series": series,
            }

    return {
        "source_id": src_id,
        "source_title": meta.get("title", src_id),
        "chunk_id": f"{src_id}:0",
        "row_count": len(rows),
        "column_count": len(cols),
        "numeric_columns": numeric_cols,
        "profiles": col_profiles,
        "chart": chart,
    }
