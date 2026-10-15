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
| 11 Oct 2026 | Source code and tests (PD-01, PD-05) | The person card on the About page (`components/about/PersonCard.jsx` and its test): a photo, a short paragraph and contact links for each team member and the instructor, read from `constants/team.js` | Claude Code (Claude Opus 5.5) |
| 15 Oct 2026 | Source code and tests (PD-01, PD-05) | The team gallery on the About page (`components/about/TeamGallery.jsx` and its test): three photo tiles that morph into a spotlight for the member chosen and turn the others grey, using React's `<ViewTransition>`, plus one About page test. The warning about missing team details was removed at the team's request | Claude Code (Claude Opus 5.5) |
| 15 Oct 2026 | Visual design (PD-03) | The Motion section and the team gallery entry in `docs/design/style-guide.md` | Claude Code (Claude Opus 5.5) |
| 15 Oct 2026 | Source code and tests (PD-01, PD-05) | Team photos of any size or shape: `components/about/teamPhotos.js` and `utils/photos.js` find a photo by its file name, and the build crops and shrinks it with the `vite-imagetools` dev dependency. Tests in `utils/photos.test.js`, `constants/team.test.js` and `PersonCard.test.jsx` | Claude Code (Claude Opus 5.5) |
| 15 Oct 2026 | Documentation (PD-04) | `docs/tasks.md`, `README.md`, `CLAUDE.md` and `.claude/rules/frontend.md` brought up to date with the two branches (`main` and `dev`) and the team photo folder | Claude Code (Claude Opus 5.5) |
| 15 Oct 2026 | Source code (PD-01) | The first steps of the rent model in `ai-model/prepare.ipynb`: guidance and review while the student loaded the dataset, checked it, removed the exact copies and split off a test set. The duplicate-count and train/test split cells, and the note explaining the split, were written by the AI tool on request; the student wrote the rest | Claude Code (Claude Opus 5.5) |

Still to record by the team: the tool that produced the SRS itself (PD-02) and the tool configuration under `.claude/`.
