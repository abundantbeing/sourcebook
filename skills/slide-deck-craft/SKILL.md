---
name: slide-deck-craft
description: Elite presentation design craft for SourceBook Slide Decks (pitch decks, executive briefings, technical architectures, editorial keynotes, and workshops). Enforces action titles, 60-30-10 color balance, strict layout diversity, narrative pacing, unified visual bibles for Hermes Image Generation, and high-craft editable vector slides when ImageGen is disabled.
---

# SourceBook Presentation & Slide Design Craft

Apply these rules whenever planning, outlining, drafting, or revising a SourceBook Slide Deck — whether Hermes Image Generation is **enabled** or **disabled**.

## 1. Narrative Arc by Purpose
Pick the arc that matches the user's deck purpose and audience:
- **Pitch Deck:** Cover Hook -> Problem / Tension -> Why Now -> Solution Architecture -> Product / Proof -> Traction / Metrics -> Business Model / Moat -> Roadmap -> Closing Ask.
- **Executive Brief:** Cover -> Executive Summary (BLUF) -> Key Metric Spotlight -> Core Findings (Comparison / Bento) -> Risks & Contradictions -> Strategic Recommendations -> Next Steps.
- **Technical Architecture:** Cover -> System Thesis -> Architecture Diagram / Core Hub -> Performance Benchmarks (Stat / Comparison) -> Protocol / Data Flow Timeline -> Tradeoffs & Failure Modes -> Production Readiness Closing.
- **Workshop / Teaching:** Cover -> Learning Objectives -> Core Mental Model -> Step-by-Step Sequence (Timeline) -> Worked Example (Two-Col / Bento) -> Common Pitfalls -> Summary Checklist.

## 2. Core Editorial Rules (Always Enforced)
1. **Action Titles Over Topic Labels:** Never write vague labels like `"Performance"` or `"Overview"`. Every content slide title MUST be a crisp claim or insight (e.g., `"WAL snapshots cut crash replay time by 84% under concurrent load"`).
2. **One Core Idea Per Slide:** If a slide carries two competing points, split it into two slides.
3. **Strict Layout Diversity:** Never repeat the exact same `layout` on two consecutive slides. Rotate intentionally across:
   - `title` — Opening keynote cover with subtitle & visual hook
   - `stat` — Single hero metric spotlight (radial ring / big numeral) + 2–3 supporting takeaways
   - `bento` — 3 to 4 modular metric/pillar cards in an asymmetric grid
   - `comparison` — Side-by-side `left` vs `right` (Before vs After, Option A vs Option B, Conflict resolution)
   - `timeline` — 3 to 5 sequential milestones, phases, or protocol steps
   - `two-col` — Balanced two-column evidence synthesis
   - `image-left` — Bespoke visual/diagram paired with crisp editable points (hybrid mode)
   - `image-full` — Full-bleed 16:9 art-directed illustrated slide (full-slide ImageGen mode)
   - `quote` — High-impact verbatim evidence or thesis pull-quote
   - `closing` — Crisp executive recap & verifiable source ledger
4. **Density Discipline:**
   - **Presenter Slides:** Max 3 concise talking points per slide (<= 11 words each); push depth and exact narrative transitions into `notes` (speaker notes).
   - **Detailed Deck:** Standalone readable — up to 4 crisp evidence points (<= 18 words each) plus a concise `body` takeaway and exact source citations (`cites`).
5. **60-30-10 Visual Hierarchy:** Maintain generous negative space (35–50% open area), one dominant palette ground, structured containers, and a single crisp accent reserved for numbers, callouts, and focal visuals.

## 3. Hermes Image Generation Art Direction (When ImageGen is ON)
Before writing individual slide `image_prompt` fields, define a cohesive **`visual_bible`** in the deck spec (palette, lighting, graphic style, material texture, mood) derived from the user's style instructions so every slide looks like one unified studio deck — never disconnected stock art.
- **Full-Slide Art Mode (`image_mode: "full_slide"`):** Write rich 16:9 widescreen slide composition prompts specifying exact layout structure (e.g. concentric security rings, 2x2 technical blueprint grid, split comparison diagram, hero emblem cover), exact concise title & stat text to render cleanly, dark/light palette continuity, high typographic legibility, clean safe margins, and **zero watermarks or logos from other platforms**.
- **Hybrid Visuals Mode (`image_mode: "hybrid"`):** Write text-free editorial illustration / architectural diagram / minimalist 3D iconographic prompts (`"no embedded text, clean dark/light ground matching theme"`) that pair beside crisp editable typography on screen and inside exported `.pptx` files.

## 4. Citation Grounding
Every claim, number, metric, and quote on every slide MUST trace back strictly to valid notebook chunk IDs in `cites`. Never invent statistics or unverified dates.
