---
name: project-docs
description: Write or refresh docs/architecture.md and docs/features.md from the actual Darscope code, a course deliverable. Use when the user asks for the architecture, technology stack or features documentation.
---

Produce the documentation the course brief asks for (deliverable PD-04). Read the code first. Document what exists today, not what the SRS plans.

## `docs/architecture.md`

1. **Overview**: one paragraph on what the app is and that it runs entirely in the browser.
2. **Modules**: a Mermaid diagram of pages, portfolio state, the data service, the market module and the AI wrapper, with one line on what each does.
3. **Data flow**: what happens, step by step, when the user adds, updates, deletes and searches.
4. **The Part 2 seam**: the data service contract, and what Part 2 will replace.
5. **Technology stack**: a table of each tool, its version from `frontend/package.json`, and what it is used for.
6. **Folder guide**: one line for each folder under `frontend/src/`.
7. **AI features**: how each one works and loads, described as `.claude/rules/ai-features.md` requires.

## `docs/features.md`

1. One section for each feature that works today: what the user can do, where the code is, and the requirement IDs it meets.
2. A table of the SRS requirements that are not built yet, with their priority.

## Also

- Update the Run, Test and Build sections of `README.md` if the commands changed.
- Update `docs/ai-usage.md` so it names the AI tool used for each deliverable (PD-07).
- Take every version number, file path and feature from the repository. If you cannot find something, leave it out and tell the user.
