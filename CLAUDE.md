# Darscope

Darscope is a web app that manages one company's rental villas and duplexes in Riyadh, Jeddah, Dammam and Al Khobar. The name joins *dar* (Arabic for "house") and *scope*. It is the SE411 course project (Fall 2026-27) of a four-student team (a fourth member joined in Part 2 and adds his own entry to `frontend/src/constants/team.js`), and this repository is public.

## Two parts, one repository

| Part | Folder | What it is | Who writes the code |
| --- | --- | --- | --- |
| 1 | `frontend/` | React single-page app. Data is a collection of objects held in memory. Due 17 October 2026. | You, reviewed by the team |
| 2 | `backend/` | Java Spring server whose REST API replaces the in-memory data service. Brief: `docs/part-2-brief.md`. Due 14 November 2026. | The team, by hand |

**Never write or change code under `backend/` on your own.** The Part 1 brief says the backend "will be manually coded in part2", and the Part 2 brief does not change that. If a request needs backend code, say so and stop until the user confirms that the course rules allow it.

## Where the truth lives

- `docs/SRS.md` is the specification. Every requirement has an ID such as `FR-ADD-03`, `NFR-ACC-01` or `AC-07`. Read the relevant section before you build or change a feature.
- `.claude/rules/` holds working rules that condense the SRS. If a rule and the SRS disagree, follow the SRS and tell the user about the mismatch.
- Priorities: **Must** is required by the course brief, **Should** is planned, **Could** is a bonus. Finish every Must before you start a Should.
- Do not invent requirements. If the SRS is silent or unclear, ask the user.

## Repository layout

```
darscope/
├── CLAUDE.md, README.md
├── .gitignore, .gitattributes
├── .claude/            rules, settings, skills
├── docs/               SRS.md, part-2-brief.md, backend-plan.md, tasks.md, design/,
│                       architecture.md, features.md, test-report.md, code-review.md,
│                       ai-usage.md
├── frontend/           Part 1
│   ├── package.json, index.html, vite.config.js, eslint.config.js
│   ├── public/         favicon.svg
│   ├── scripts/        prepare-data.mjs, not written yet (for market.reference.json)
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── routes/     routes.jsx (the URL to page table), paths.js
│       ├── layouts/    AppLayout, NavMenu, Footer
│       ├── pages/      one component per URL
│       ├── components/ ui/ (Button, Badge, Dialog, FormField, Message, Page, Pager), then
│       │               one folder per feature: properties/, dashboard/, market/, search/
│       ├── context/    portfolio context, reducer and provider
│       ├── hooks/      shared hooks: usePortfolio, usePropertySearch, useServerPage
│       ├── services/   propertyService.js, marketService.js, embeddingService.js,
│       │               rentModelService.js
│       ├── utils/      validation, search, sort, arabic, format, stats, similarity, estimate,
│       │               rentModel
│       ├── constants/  choices, thresholds, messages, team details
│       ├── styles/     tokens.css, global.css
│       ├── data/       rent-model.json, districts.json (market.reference.json once built)
│       ├── assets/     team/: the team photos, any size; the build crops and shrinks them
│       └── test/       setup.js, shared fixtures and helpers, and the in-memory stand-in
│                       for the server: fakePropertyService.js, portfolio.seed.json
├── ai-model/           rent-prediction model, trained outside the app; feeds the rent suggestion
└── backend/            Part 2: the Java Spring server, hand-coded by the team
```

The layout is layered: each folder under `src/` holds one kind of code. A folder appears when its first file is written, so not all of them exist yet. The open tasks, most important first, are in `docs/tasks.md`.

`ai-model/` holds the rent-prediction model that the team trains on the dataset, in `ai-model/prepare.ipynb`. The app uses only what the notebook exports: the weights in `frontend/src/data/rent-model.json`, for the rent suggestion on the Add and Edit forms (FR-ADD-13, SRS 7.6), and the district list in `frontend/src/data/districts.json`, for the District dropdown (FR-ADD-14). Nothing under `frontend/src/` imports from `ai-model/` itself. Read `ai-model/README.md` before working there.

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

`npm run dev` forwards `/api` to the Spring server on port 8080, so run the server too to use the app. The tests never need it. The server's commands, run inside `backend/` once the team has generated it: `mvnw.cmd spring-boot:run` (H2), the same with `-Dspring-boot.run.profiles=supabase`, and `mvnw.cmd test` (`docs/backend-plan.md`, section 8).

The team works on Windows. Every npm script must also run on macOS and Linux, so use Node scripts instead of shell commands such as `rm`, `cp` or `VAR=value command`.

## Stack

These are the defaults from SRS section 11. Ask before you swap one.

- React 19 or later, in JavaScript with JSDoc type comments. No TypeScript unless the user says the team switched.
- Vite, React Router, and React Context with a reducer for state. No state library.
- CSS Modules, with design tokens as CSS variables. No component library or CSS framework.
- Vitest with React Testing Library. ESLint and Prettier.
- `@huggingface/transformers` version 4 or later, loaded only when search by meaning is first turned on.
- `vite-imagetools`, a development dependency added on 15 October 2026, which crops and shrinks the team photos when the app is built.
- Part 2, chosen by the team on 9 November 2026: Java 21, Spring Boot 4.1 with Maven, Spring Data JDBC and Bean Validation, as in lab 14; Supabase Postgres, with H2 for local runs; JUnit and Mockito. The contract is in `docs/backend-plan.md`.

## Branches

`main` holds what is submitted and `dev` is where the work comes together. They are the only two permanent branches. Build each feature on one short-lived branch off `dev`, merge it back through a pull request, and delete the branch afterwards: GitHub does not delete it automatically. Do not stack pull requests.

## Rules that never bend

1. The frontend holds no server code, no database, no API keys, no secrets, no analytics and no cookies. The Supabase password lives only in each person's git-ignored `backend/.env`.
2. The app manages one kind of asset: rental houses.
3. The portfolio lives in the Spring server's database. The frontend keeps only what the server returned, in the portfolio context. Do not add `localStorage` or any other browser persistence unless the user says the instructor asked for it.
4. Components never import data files or change the collection themselves. Every read and write goes through `frontend/src/services/propertyService.js`, whose functions return Promises and call the server's REST routes (`docs/backend-plan.md`). In tests, `src/test/setup.js` swaps it for `src/test/fakePropertyService.js`. If a route or its JSON has to change, change the contract in `docs/backend-plan.md` first and tell the user: the team codes against it.
5. The interface text is English. Property data may be Arabic or English, so render data text with `dir="auto"` and never assume left-to-right.
6. Render user-entered text as text. Never use `dangerouslySetInnerHTML`.
7. The AI features are optional extras. No Must requirement may depend on them, and each one must fail safely.
8. Never commit the raw Kaggle CSV, language-model files, `.env` files or `node_modules`. The one model file that is committed is `frontend/src/data/rent-model.json`, the rent model's weights, which hold no rows of the dataset (the team's decision of 16 October 2026).
9. Never invent team names or student IDs. They live in `frontend/src/constants/team.js`: leave placeholders and ask the user.
10. Tell the user before you add a dependency, and say why it is needed.

## How to work on a task

1. Find the requirement IDs the task touches in `docs/SRS.md` and read them.
2. Put logic in pure functions under `frontend/src/utils/` and test it there first. Keep pages and components thin.
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
- Visual design: `docs/design/style-guide.md` and `docs/design/wireframes.md`
- Documentation: `docs/architecture.md`, `docs/features.md`, `README.md`
- Tests, and proof they ran: test files plus `docs/test-report.md`
- Code review of security, performance, code quality and code reuse: `docs/code-review.md`
- A record of which AI tool produced each deliverable: `docs/ai-usage.md`. Update it when you produce one.

Part 2 adds, by 14 November 2026: the Spring server integrated with the frontend, a JUnit and Mockito test suite for the whole backend, and a two-slide presentation (the architecture, and a REST route table like the one in lab 14), followed by a demo and questions about the code.

## Still undecided

Do not assume an answer to any of these. Ask the user when a task depends on one (SRS section 15.3).

- Whether TypeScript, or a particular test, styling or build tool, is required or forbidden.
- Whether the app must be deployed online.
- Whether the dataset's licence allows publishing data derived from it. Tell the user before generated data files are committed. The rent model's weights are the one exception the team has already accepted.
- Whether every non-duplex listing in the dataset is a villa (assumption A-06).