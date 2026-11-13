# DarScope


DarScope (*dar*, دار, "house" + scope) is a web application that keeps a company's rental villas and duplexes in one place. A portfolio manager can add, update, delete, search and view properties in Riyadh, Jeddah, Dammam and Al Khobar, and see occupancy and rent on a dashboard.

This repository holds both parts of the SE411 project (Fall 2026-27):

| Part | Scope | Status |
| --- | --- | --- |
| Part 1 | React frontend. | Done |
| Part 2 | Java Spring server with a SQL database (Supabase Postgres, or H2 locally), built with AI assistance (docs/ai-usage.md). The frontend calls it. | Written, being tested, due 14 November 2026: [docs/backend-plan.md](docs/backend-plan.md) |

One AI feature runs entirely in the browser, with no API key: the Add and Edit forms suggest a yearly rent from a model the team trained on 2021 listings. Search by meaning, comparable market listings and a fair-rent estimate are planned.

The rent model is trained on the public Kaggle dataset "Saudi Arabia Real Estate (AQAR)" (2021). The 8 sample properties are written by hand until the 40 from the same dataset are prepared.
https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar

## Getting started

The app needs both halves running, in two terminals:

1. **The server**, in `backend/`: `mvnw.cmd spring-boot:run` (`./mvnw` on macOS and Linux). It needs JDK 21 or later, and starts on <http://localhost:8080> with an in-memory H2 database, where changes last until the server stops. To keep changes on your laptop between restarts, add `-Dspring-boot.run.profiles=local` (H2 saved to `backend/data/`). To use the team's Supabase database instead, add `-Dspring-boot.run.profiles=supabase` and see [docs/backend-plan.md](docs/backend-plan.md), section 7.
2. **The app**, in `frontend/`: `npm install` once, then `npm run dev`, and open <http://localhost:5173>. It forwards every `/api` call to the server.

The frontend commands need Node.js 22.13 or later (22 or 24 LTS) and npm. Run them inside `frontend/`. None of the tests needs the server.

| Command | What it does |
| --- | --- |
| `npm install` | Install the dependencies |
| `npm run dev` | Start the development server, which forwards `/api` to the Spring server |
| `npm test` | Run all tests once |
| `npm run coverage` | Run the tests with a coverage summary |
| `npm run lint` | Check the code with ESLint |
| `npm run format` | Format the code with Prettier |
| `npm run build` | Build static files into `frontend/dist/` |

## Repository layout

```
darscope/
├── docs/               the requirements (SRS.md), design/, the task list and the reports
├── frontend/           Part 1: the React app
│   ├── public/         static files
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── routes/     the URL to page table
│       ├── layouts/    the header, menu and footer every page shares
│       ├── pages/      one component per URL
│       ├── components/ ui/ for shared pieces, then one folder per feature
│       ├── context/    the portfolio state
│       ├── hooks/      shared hooks
│       ├── services/   data access; propertyService.js calls the Spring server
│       ├── utils/      pure functions: validation, search, sorting
│       ├── constants/  choices, messages, team details
│       ├── styles/     design tokens and base styles
│       ├── data/       the rent model's weights and the district list
│       ├── assets/     team photos, at any size: the build crops and shrinks them
│       └── test/       test setup, fixtures, and the in-memory stand-in for the server
├── ai-model/           the rent model behind the suggested rent, trained on the dataset
└── backend/            Part 2: the Java Spring server
```

A folder appears when its first file is written. Each test file sits beside the module it tests.

## Status

Everything the course brief asks of the app is built and tested: the menu, the property list, the
detail page, the one form that adds and edits, delete with confirmation, keyword search and
filters in Arabic and English, the Dashboard and the About page. Since Part 2, the app reads and
writes its properties through the Spring server, and the property list shows them a page at a
time. One team member's student ID is still to be added (FR-ABT-02).

| Area | State |
| --- | --- |
| Navigation, layout, About | Done, except one student ID |
| Property list, detail, add, edit, delete | Done |
| Search and filters | Done |
| Dashboard | Done |
| Rent suggestion on the Add and Edit forms | Done |
| Pages on the property list (5, 10, 25 or 50 a page) | Done: from the server, or in the browser while searching |
| Spring server (add, get by ID, paginated list, update, JUnit and Mockito tests) | Being written by the team: [docs/backend-plan.md](docs/backend-plan.md) |
| Sorting controls, filter chips, search in the URL | Functions written and tested, not on a page yet |
| Card view | Not started |
| Undo delete, Reset demo data | Dropped in Part 2: nothing on screen used them |
| Market insights, comparables, fair-rent estimate | Not started |
| Search by meaning | Not started |

The starting properties live in the server's `data.sql`. The 8 hand-written ones in
`frontend/src/test/portfolio.seed.json` are the starting data for the tests, and the first rows to
copy into `data.sql`.

[docs/tasks.md](docs/tasks.md) lists what is left, most important first.

## Documents

| Document | What it holds |
| --- | --- |
| [docs/SRS.md](docs/SRS.md) | The requirements (Part 1) |
| [docs/part-2-brief.md](docs/part-2-brief.md), [docs/backend-plan.md](docs/backend-plan.md) | Part 2: the brief, and the plan for the server: the API contract, who does what, Supabase and H2 |
| [docs/design/style-guide.md](docs/design/style-guide.md), [docs/design/wireframes.md](docs/design/wireframes.md) | The visual design |
| [docs/architecture.md](docs/architecture.md) | How the app is built, and the technology stack |
| [docs/features.md](docs/features.md) | What works, where the code is, and what is not built yet |
| [docs/test-report.md](docs/test-report.md) | The last full test run, with coverage |
| [docs/code-review.md](docs/code-review.md) | The code review: security, performance, code quality and code reuse |
| [docs/ai-usage.md](docs/ai-usage.md) | Which AI tool produced each part |
