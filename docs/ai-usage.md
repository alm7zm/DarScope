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
| 11 Oct 2026 | Source code (PD-01) | The interface rework: the design token set, the page header, the app shell, the table, the filter panel and the form controls, together with the accessibility fixes a guideline and WCAG review turned up | Claude Code (Claude Opus 5) |
| 11 Oct 2026 | Source code (PD-01) | The Dashboard: the portfolio figures, the occupancy rate, the per-city table and the needs-attention list (SRS 4.2) | Claude Code (Claude Opus 5) |
| 11 Oct 2026 | Source code (PD-01) | The About page: the team, the course, the technologies and the credits (SRS 8.1) | Claude Code (Claude Opus 5) |
| 11 Oct 2026 | Tests (PD-05) | 42 further tests for the Dashboard figures, the About page and the skip link, including acceptance scenarios AC-14 and AC-15 | Claude Code (Claude Opus 5) |
| 11 Oct 2026 | Visual design (PD-03) | `docs/design/style-guide.md`, written from the design tokens the app actually uses. The wireframes are still to do | Claude Code (Claude Opus 5) |
| 11 Oct 2026 | Documentation (PD-04) | The Status section of `README.md`, the review order in `docs/tasks.md`, and this record | Claude Code (Claude Opus 5) |

Still to record by the team: the tool that produced the SRS itself (PD-02) and the tool configuration under `.claude/`.
