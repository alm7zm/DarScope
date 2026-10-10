# AI usage record

Deliverable PD-07 (SRS section 12): which AI tool produced each deliverable. Add a row whenever an AI tool produces or changes one.

| Date | Deliverable | What the AI tool produced | AI tool |
| --- | --- | --- | --- |
| 6 Oct 2026 | Source code (PD-01) | The app scaffold and shell: build and test tooling, the shared layout, the menu, the route table, placeholder pages, the not-found and error screens, design tokens | Claude Code (Claude Opus 5.5) |
| 6 Oct 2026 | Tests (PD-05) | `routes.test.jsx` and `AppLayout.test.jsx`: navigation, layout, not-found and error-screen tests | Claude Code (Claude Opus 5.5) |
| 6 Oct 2026 | Documentation (PD-04) | The Getting started, Repository layout and Status sections of `README.md`, and `docs/tasks.md` | Claude Code (Claude Opus 5.5) |
| 6 Oct 2026 | Requirements (PD-02) | The repository structure in SRS section 11.2, rewritten for the layered layout the team chose | Claude Code (Claude Opus 5.5) |
| 10 Oct 2026 | Source code (PD-01) | The data layer: the choice lists and fixed messages, the field checks of Appendix C, Arabic normalisation (Appendix B.4), display formats, the in-memory data service, the portfolio state, and the Badge, Dialog and Message components | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Source code (PD-01) | The property list as a table, with View, Edit and Delete on each row (SRS 4.3) | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Source code (PD-01) | The property detail page, with all six field groups and the not-found screen (SRS 4.4) | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Source code (PD-01) | The one form that adds and edits a property, with inline errors from Appendix C (SRS 5.1, 5.2) | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Source code (PD-01) | The delete confirmation, from a list row and from the detail page (SRS 5.3) | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Source code (PD-01) | Keyword search and the filters, in Arabic and English (SRS section 6) | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Tests (PD-05) | 313 unit and component tests covering the field checks, search, filters, the data service, the state, the list, the detail page, the form and the delete dialog, including acceptance scenarios AC-02 to AC-13 | Claude Code (Claude Opus 5) |
| 10 Oct 2026 | Sample data | A placeholder `portfolio.seed.json` of 8 properties, written by hand and not derived from the Kaggle dataset, so the pages have something to show until the CSV arrives | Claude Code (Claude Opus 5) |

Still to record by the team: the tool that produced the SRS itself (PD-02) and the tool configuration under `.claude/`.
