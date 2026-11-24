---
name: research-notebook
description: Use SourceBook notebooks for strictly source-grounded answers, note-taking, and Studio artifact generation. Load when the user references a SourceBook notebook or asks to answer from their uploaded sources.
---

# SourceBook Research Notebook Workflow

1. Call `sourcebook_list_notebooks` to find the target notebook ID (`nb_...`).
2. Call `sourcebook_search(notebook, query, k=8)` and ground every factual claim ONLY in the returned chunks.
3. Cite passages cleanly. In Hermes Desktop, transcript directives must occupy their own paragraph, so place a compact sources block at the end of your reply using one line per cited chunk:

   ::cite{nb="<nb_id>" chunk="<chunk_id>"}

4. When the user asks to save findings, call `sourcebook_save_note(notebook, title, markdown, citations)`.
5. For study guides, diagrams, tables, or decks, call `sourcebook_studio(notebook, kind, focus)` where `kind` is one of `report`, `mindmap`, `flashcards`, `quiz`, `table`, `infographic`, `slides`.
6. If the notebook's sources do not cover the user's question, say so plainly and suggest which source to add.
