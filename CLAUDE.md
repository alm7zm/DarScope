# Darscope

Darscope is a web app that manages one company's rental villas and duplexes in Riyadh, Jeddah, Dammam and Al Khobar. The name joins *dar* (Arabic for "house") and *scope*. It is the SE411 course project (Fall 2026-27) of a three-student team, and this repository is public.

## Two parts, one repository

| Part | Folder | What it is | Who writes the code |
| --- | --- | --- | --- |
| 1 | `frontend/` | React single-page app. Data is a collection of objects held in memory. Due 17 October 2026. | You, reviewed by the team |
| 2 | `backend/` | Backend that replaces the in-memory data service. | The team, by hand |

**Never write or change code under `backend/` on your own.** The course requires Part 2 to be coded by hand. If a request needs backend code, say so and stop until the user confirms that the course rules allow it.

## Where the truth lives

- `docs/SRS.md` is the specification. Every requirement has an ID such as `FR-ADD-03`, `NFR-ACC-01` or `AC-07`. Read the relevant section before you build or change a feature.
- `.claude/rules/` holds working rules that condense the SRS. If a rule and the SRS disagree, follow the SRS and tell the user about the mismatch.
- Priorities: **Must** is required by the course brief, **Should** is planned, **Could** is a bonus. Finish every Must before you start a Should.
- Do not invent requirements. If the SRS is silent or unclear, ask the user.

## Repository layout

```
darscope/
├── CLAUDE.md, README.md
├── .claude/            rules, settings, skills
├── docs/               SRS.md, design/, architecture.md, features.md,
│                       test-report.md, code-review.md, ai-usage.md
├── frontend/           Part 1
│   ├── package.json, index.html, vite.config.js
│   ├── scripts/        prepare-data.mjs
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── config/     choices, thresholds, messages, team details
│       ├── data/       portfolio.seed.json, market.reference.json
│       ├── services/   propertyService.js, marketService.js
│       ├── state/      portfolio context and reducer
│       ├── lib/        validation, search, sort, arabic, similarity, estimate
│       ├── ai/         embedding wrapper, loaded on demand
│       ├── components/ Layout, Menu, Dialog, Message, Badge
│       └── features/   dashboard/, properties/, market/, about/
└── backend/            Part 2, hand-coded later
```

Each test file sits beside the module it tests and ends in `.test.js` or `.test.jsx`.

## Commands

Run these inside `frontend/`. If `frontend/package.json` does not exist, the app has not been scaffolded yet: create it with Vite's React template and add these scripts.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the development server |
| `npm test` | Run all tests once with Vitest |
| `npm run coverage` | Run the tests with a coverage summary |
| `npm run lint` | Check the code with ESLint |
| `npm run format` | Format the code with Prettier |
| `npm run build` | Build static files into `frontend/dist/` |
| `npm run prepare-data` | Rebuild the two JSON data files from the raw CSV |

The team works on Windows. Every npm script must also run on macOS and Linux, so use Node scripts instead of shell commands such as `rm`, `cp` or `VAR=value command`.

## Stack

These are the defaults from SRS section 11. Ask before you swap one.

- React 19 or later, in JavaScript with JSDoc type comments. No TypeScript unless the user says the team switched.
- Vite, React Router, and React Context with a reducer for state. No state library.
- CSS Modules, with design tokens as CSS variables. No component library or CSS framework.
- Vitest with React Testing Library. ESLint and Prettier.
- `@huggingface/transformers` version 4 or later, loaded only when search by meaning is first turned on.

## Rules that never bend

1. Part 1 is frontend only: no server code, no database, no API keys, no secrets, no analytics, no cookies.
2. The app manages one kind of asset: rental houses.
3. The portfolio is a collection of objects in memory, loaded from the seed file. Changes are lost when the page reloads. Do not add `localStorage` or any other persistence unless the user says the instructor asked for it.
4. Components never import the data files or change the collection themselves. Every read and write goes through `frontend/src/services/propertyService.js`, whose functions return Promises. Part 2 replaces that one module.
5. The interface text is English. Property data may be Arabic or English, so render data text with `dir="auto"` and never assume left-to-right.
6. Render user-entered text as text. Never use `dangerouslySetInnerHTML`.
7. The AI features are optional extras. No Must requirement may depend on them, and each one must fail safely.
8. Never commit the raw Kaggle CSV, model files, `.env` files or `node_modules`.
9. Never invent team names or student IDs. They live in `frontend/src/config/team.js`: leave placeholders and ask the user.
10. Tell the user before you add a dependency, and say why it is needed.

## How to work on a task

1. Find the requirement IDs the task touches in `docs/SRS.md` and read them.
2. Put logic in pure functions under `frontend/src/lib/` and test it there first. Keep components thin.
3. Write or update tests with the code, in a file beside the module.
4. Run `npm test` and `npm run lint` in `frontend/`, and fix what fails before you report.
5. Report what changed, which requirement IDs it covers, the test result, and anything left undone or uncertain.

## Done means

- The behaviour matches the SRS wording, including the exact messages in Appendix C.
- Tests for the change exist and pass, and lint is clean.
- The browser console shows no errors.
- It works with the keyboard alone and at 360 px wide.
- Every Must feature still works when the language model cannot load.

## Rule files

| File | Covers |
| --- | --- |
| `.claude/rules/product.md` | Vocabulary, pages, feature priorities, build order. Always loaded. |
| `.claude/rules/data-model.md` | Property fields, IDs, seed files, the data service |
| `.claude/rules/frontend.md` | Components, forms, search, styling, accessibility, messages |
| `.claude/rules/ai-features.md` | Search by meaning, comparables, fair-rent estimate |
| `.claude/rules/testing.md` | What to test and how |
| `.claude/rules/data-prep.md` | The script that builds the data files |
| `.claude/rules/backend.md` | The hand-coded rule for Part 2 |

Each one loads when you open a file it covers. When you start in an area that has no files yet, read its rule file yourself first.

## Skills

| Command | What it does |
| --- | --- |
| `/implement-requirement FR-ADD-03` | Builds the named requirements with tests |
| `/test-report` | Runs the tests and writes `docs/test-report.md` |
| `/code-review-report` | Reviews the code and writes `docs/code-review.md` |
| `/project-docs` | Writes `docs/architecture.md` and `docs/features.md` from the code |

## Course deliverables

The brief asks for all of these in the repository by the deadline (SRS section 12):

- Requirements: `docs/SRS.md`
- Visual design: wireframes and a style guide in `docs/design/`
- Documentation: `docs/architecture.md`, `docs/features.md`, `README.md`
- Tests, and proof they ran: test files plus `docs/test-report.md`
- Code review of security, performance, code quality and code reuse: `docs/code-review.md`
- A record of which AI tool produced each deliverable: `docs/ai-usage.md`. Update it when you produce one.

## Still undecided

Do not assume an answer to any of these. Ask the user when a task depends on one (SRS section 15.3).

- Whether changes must survive a page reload.
- Whether TypeScript, or a particular test, styling or build tool, is required or forbidden.
- Whether the app must be deployed online.
- Whether the dataset's licence allows publishing data derived from it. Tell the user before generated data files are committed.
- Whether every non-duplex listing in the dataset is a villa (assumption A-06).
