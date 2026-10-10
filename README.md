# DarScope


DarScope (*dar*, دار, "house" + scope) is a web application that keeps a company's rental villas and duplexes in one place. A portfolio manager can add, update, delete, search and view properties in Riyadh, Jeddah, Dammam and Al Khobar, and see occupancy and rent on a dashboard.

This repository holds both parts of the SE411 project (Fall 2026-27):

| Part | Scope | Status |
| --- | --- | --- |
| Part 1 | React frontend. Data is a collection of objects held in the browser. | In progress |
| Part 2 | Hand-coded backend that replaces the in-browser data service. | Planned |

Optional AI features run entirely in the browser, with no API key: search by meaning in Arabic and English, comparable market listings, and a fair-rent estimate.

Sample data comes from the public Kaggle dataset "Saudi Arabia Real Estate (AQAR)" (2021).
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
├── docs/               the requirements (SRS.md), the task list (tasks.md) and the reports
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
│       ├── data/       the seed portfolio and the market reference set
│       └── test/       test setup and fixtures
├── ai-model/           a rent-prediction model trained on the dataset (not started)
└── backend/            Part 2: hand-coded, added later
```

A folder appears when its first file is written. Each test file sits beside the module it tests.

## Status

Every **Must** requirement of Part 1 is built and tested: the property list, the detail page, the
one form that adds and edits, delete with confirmation, keyword search and filters in Arabic and
English, the Dashboard and the About page. The app runs entirely in the browser, with no server.

| Area | State |
| --- | --- |
| Navigation, layout, About | Done |
| Property list, detail, add, edit, delete | Done |
| Search and filters | Done |
| Dashboard | Done |
| Market insights, comparables, fair-rent estimate | Not started |
| Search by meaning | Not started |
| Sorting, pagination, card view, undo delete | Not started |

Two things are worth knowing before you run it:

- **The sample data is a placeholder.** `frontend/src/data/portfolio.seed.json` holds 8
  hand-written properties, not the 40 the specification asks for, because the raw Kaggle CSV is
  not in the repository. Drop it into `frontend/data-raw/` and run `npm run prepare-data` to
  build the real files. See [frontend/src/data/README.md](frontend/src/data/README.md).
- **Changes are kept only until the page reloads.** That is required, not a gap: Part 1 holds the
  portfolio in memory and Part 2 replaces the data service with a real backend.

[docs/tasks.md](docs/tasks.md) lists what is left, most important first.
