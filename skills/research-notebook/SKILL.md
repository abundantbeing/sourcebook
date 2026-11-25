---
name: research-notebook
description: Use SourceBook notebooks for strictly source-grounded answers, note-taking, tabular data analysis, and Studio artifact generation. Load when the user references a SourceBook notebook or asks to answer from their uploaded sources.
---

# SourceBook Research Notebook Workflow

1. Call `sourcebook_list_notebooks` to find the target notebook ID (`nb_...`).
2. Call `sourcebook_search(notebook, query, k=8)` (hybrid semantic + BM25 retrieval) and ground every factual claim ONLY in the returned chunks.
3. Cite passages cleanly. In Hermes Desktop, transcript directives must occupy their own paragraph, so place a compact sources block at the end of your reply using one line per cited chunk:

   ::cite{nb="<nb_id>" chunk="<chunk_id>"}

4. When analyzing CSV, TSV, JSON, or tabular sources, call `sourcebook_analyze_data(notebook, source)` to compute exact statistics (min, max, mean, median, p95, sum) instead of estimating arithmetic.
5. When the user asks to save findings, call `sourcebook_save_note(notebook, title, markdown, citations)`.
6. For briefings, podcasts, diagrams, tables, or decks, call `sourcebook_studio(notebook, kind, focus)` where `kind` is one of `report`, `audio`, `mindmap`, `flashcards`, `quiz`, `table`, `infographic`, `slides`.
7. If the notebook's sources do not cover the user's question, say so plainly and suggest which source to add.
