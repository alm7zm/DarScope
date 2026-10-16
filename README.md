# DarScope


DarScope (*dar*, دار, "house" + scope) is a web application that keeps a company's rental villas and duplexes in one place. A portfolio manager can add, update, delete, search and view properties in Riyadh, Jeddah, Dammam and Al Khobar, and see occupancy and rent on a dashboard.

This repository holds both parts of the SE411 project (Fall 2026-27):

| Part | Scope | Status |
| --- | --- | --- |
| Part 1 | React frontend. Data is a collection of objects held in the browser. | In progress |
| Part 2 | Hand-coded backend that replaces the in-browser data service. | Planned |

One AI feature runs entirely in the browser, with no API key: the Add and Edit forms suggest a yearly rent from a model the team trained on 2021 listings. Search by meaning, comparable market listings and a fair-rent estimate are planned.

The rent model is trained on the public Kaggle dataset "Saudi Arabia Real Estate (AQAR)" (2021). The 8 sample properties are written by hand until the 40 from the same dataset are prepared.
https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar

## Getting started

You need Node.js 22.13 or later (22 or 24 LTS) and npm. Run every command inside `frontend/`.

| Command | What it does |
| --- | --- |
| `npm install` | Install the dependencies |
| `npm run dev` | Start the development server |
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
│   ├── scripts/        the script that prepares the data files
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── routes/     the URL to page table
│       ├── layouts/    the header, menu and footer every page shares
│       ├── pages/      one component per URL
│       ├── components/ ui/ for shared pieces, then one folder per feature
│       ├── context/    the portfolio state
│       ├── hooks/      shared hooks
│       ├── services/   data access; Part 2 replaces propertyService.js
│       ├── utils/      pure functions: validation, search, sorting
│       ├── constants/  choices, messages, team details
│       ├── styles/     design tokens and base styles
│       ├── data/       the seed portfolio, the rent model's weights and the district list
│       ├── assets/     team photos, at any size: the build crops and shrinks them
│       └── test/       test setup and fixtures
├── ai-model/           the rent model behind the suggested rent, trained on the dataset
└── backend/            Part 2: hand-coded, added later
```

A folder appears when its first file is written. Each test file sits beside the module it tests.

## Status

Everything the course brief asks of the app is built and tested: the menu, the property list, the
detail page, the one form that adds and edits, delete with confirmation, keyword search and
filters in Arabic and English, the Dashboard and the About page. The app runs entirely in the
browser, with no server. Two Must requirements of the specification are only partly met: the
seed holds 8 properties instead of at least 30 (FR-DAT-01), and two student IDs are still to be
added (FR-ABT-02).

| Area | State |
| --- | --- |
| Navigation, layout, About | Done, except two student IDs |
| Property list, detail, add, edit, delete | Done |
| Search and filters | Done |
| Dashboard | Done |
| Rent suggestion on the Add and Edit forms | Done |
| Sorting, pages, filter chips, search in the URL | Functions written and tested, not on a page yet |
| Card view, undo delete | Not started |
| Market insights, comparables, fair-rent estimate | Not started |
| Search by meaning | Not started |

Two things are worth knowing before you run it:

- **The sample data is a placeholder.** `frontend/src/data/portfolio.seed.json` holds 8
  hand-written properties, not the 40 the specification asks for. Building the real files needs
  the raw Kaggle CSV, which is not in the repository, and the preparation script
  `frontend/scripts/prepare-data.mjs`, which is not written yet. See
  [frontend/src/data/README.md](frontend/src/data/README.md).
- **Changes are kept only until the page reloads.** That is required, not a gap: Part 1 holds the
  portfolio in memory and Part 2 replaces the data service with a real backend.

[docs/tasks.md](docs/tasks.md) lists what is left, most important first.

## Documents

| Document | What it holds |
| --- | --- |
| [docs/SRS.md](docs/SRS.md) | The requirements |
| [docs/design/style-guide.md](docs/design/style-guide.md), [docs/design/wireframes.md](docs/design/wireframes.md) | The visual design |
| [docs/architecture.md](docs/architecture.md) | How the app is built, and the technology stack |
| [docs/features.md](docs/features.md) | What works, where the code is, and what is not built yet |
| [docs/test-report.md](docs/test-report.md) | The last full test run, with coverage |
| [docs/code-review.md](docs/code-review.md) | The code review: security, performance, code quality and code reuse |
| [docs/ai-usage.md](docs/ai-usage.md) | Which AI tool produced each part |
