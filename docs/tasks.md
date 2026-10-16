# Darscope tasks

What is left to build for Part 1, most important first. Each task names the section of [SRS.md](SRS.md) that describes it in full.

To take a task, write your name in **Owner**. Add ✔ when it is merged.

## Already built

In `main`:

- The project setup: React, the page router, the test tools and the npm commands in the README.
- The layout every page shares: the header with the menu, and the footer.
- A URL and a placeholder for every page, plus the "Page not found" and error screens.
- The data layer, the property list, the detail page, the add and edit form, delete with
  confirmation, search and filters, and the interface rework (merged through pull request #12).

On `dev`, not yet merged into `main`: the Dashboard, the About page with the team photos, and the
document updates. Together that is **every Must requirement of Part 1 except task 1, the sample
data.**

## Stage 1: main pages and features

Do these first. They are what the course brief requires, and the target is to have all of them working by 12 October.

Build only the **Must** requirements of each SRS section at this stage. The Should and Could ones come in stages 2 and 3.

### Built

**Every Must requirement of stage 1 is built.** Tasks 2 to 8 and the interface rework are in
`main`. Tasks 9 and 10, the Dashboard and the About page, are on `dev` and reach `main` with its
next merge.

They were first built as ten stacked pull requests, one per task. On 15 October 2026 the team
moved to two branches (see How we work) and closed pull requests #2 to #11. Nothing was lost:
their work is in `main` or on `dev`.

Three Should requirements were pulled forward out of stage 2, because the Dashboard is not worth
opening without them: the per-city table, the needs-attention list and the shortcuts
(FR-DSH-05 to FR-DSH-07). Everything else in stage 2 is still stage 2.

**Still blocked.** Task 1, the sample data, needs two things that do not exist yet: the Kaggle
CSV in `frontend/data-raw/`, and the script `frontend/scripts/prepare-data.mjs` that turns it
into the two JSON files. `package.json` already points at that script, so `npm run prepare-data`
fails with "Cannot find module" until somebody writes it. Until then
`src/data/portfolio.seed.json` holds 8 hand-written properties that are **not** derived from the
dataset, so the open licence question is untouched. See `frontend/src/data/README.md`.

**Before you submit**, two things still need a person:

- The other two student IDs in `frontend/src/constants/team.js`. Until they are filled in, the
  About page shows "Student ID to add" under each of those two names.
- The manual acceptance checks a test cannot make: AC-16 (keyboard only) and AC-23 (360 px).

### Foundations

Every page needs these three, so they start first.

| # | Task | What it is | SRS | Owner |
| --- | --- | --- | --- | --- |
| 1 | Sample data | The 40 starting properties, prepared from the Kaggle CSV by a script. The pages have nothing to show without them. | 3.4, Appendix A | |
| 2 | Data layer | The lists of choices and fixed messages, the checks on each field, the service that reads, adds, updates and deletes properties, and the state that the pages share. | 3.1, 3.2, 8.3, Appendix C | |
| 3 | Shared pieces | The status badge, the confirmation dialog and the confirmation message that several pages use. | 4.3, 5.3, 8.2 | |

### Pages and features

| # | Task | What it is | SRS | Owner |
| --- | --- | --- | --- | --- |
| 4 | Property list | A table of all properties, with View, Edit and Delete on each row. | 4.3 | |
| 5 | Property detail | Every field of one property, with Edit, Delete and Back to list. | 4.4 | |
| 6 | Add and Edit property | One form for both, with the checks and their error messages. | 5.1, 5.2 | |
| 7 | Delete property | A confirmation before every delete, from the list and from the detail page. | 5.3 | |
| 8 | Search and filters | A search box and filters above the list, working in Arabic and English. | 6 | |
| 9 | Dashboard | Totals, status counts, the occupancy rate and rent. | 4.2 | |
| 10 | About | The three names and student IDs, the course and the term. | 8.1 | |



## Stage 2: after the main features

Start these only when everything in stage 1 works. They are the Should requirements.

| Task | SRS | Owner |
| --- | --- | --- |
| List extras: sorting, amenity filters, pagination, card view, search kept in the URL | 4.3, 6 | |
| Undo a delete, and Reset demo data | 5.3, 8.3 | |
| Form extras: default values, a warning before leaving unsaved input, the duplicate warning | 5.1, 5.2 | |
| Dashboard extras: the per-city table, the needs-attention list, shortcuts | 4.2 | |
| The menu behind a button on small screens, and an accessibility check | 4.1, 10.3 | |
| Comparable listings and the fair-rent estimate on the detail page | 7.2, 7.3 | |
| Market insights page | 7.4 | |
| Search by meaning | 7.1 | |

## Stage 3: bonus

Only if time remains. These are the Could requirements in the SRS: bulk delete, CSV export, a dark theme, charts, a rent suggestion in the form (built on `ml-model`), highlighted search matches and plain-language input.

## AI model

A rent-prediction model in the `ai-model/` folder. It goes beyond the course brief, so it must not delay stage 1. [ai-model/README.md](../ai-model/README.md) has the rules for it.

**Built on the `ml-model` branch, not merged yet:** all four steps below. The Add and Edit forms show the model's rent suggestion as they are filled in (FR-ADD-13, SRS 7.6), and District is a dropdown of the districts the model knows, by their English names (FR-ADD-14). On 304 test houses, its suggestions are off by 23.1% of the rent on average.

| Step | Owner |
| --- | --- |
| Get the data and study it | |
| Clean it, and split it into a training set and a test set | |
| Train models and compare them with simple estimates | |
| Decide how the app uses the model, then connect it | |

## Documents to hand in

| Document | How | State | Owner |
| --- | --- | --- | --- |
| Style guide in `docs/design/` | Written from the tokens the app uses | ✔ written | |
| Wireframes in `docs/design/` | With an AI tool | Not started | |
| Architecture and features | Run `/project-docs` | Not started | |
| Test report | Run `/test-report` | Not started | |
| Code review | Run `/code-review-report` | Not started | |
| AI usage record in `docs/ai-usage.md` | Add a row each time an AI tool produces something | Kept up to date | Everyone |
| The repository URL | Submit it on or before 17 October | | |

The last three reports are worth running **after** `dev` is merged into `main`, so they describe
the code that is submitted.

## Team to-dos

- [ ] Add the other two student IDs to `frontend/src/constants/team.js`. Until then, the About page shows "Student ID to add" under each of those two names.
- [ ] Review `dev` and merge it into `main`: the Dashboard and the About page are not in `main` yet.
- [ ] Optional: the other two members' photos. Put each in `frontend/src/assets/team/` at any size and write its file name in `frontend/src/constants/team.js`.
- [ ] Download the Kaggle CSV into `frontend/data-raw/` for task 1. The AI model keeps its own copy in `ai-model/data-raw/`. Git ignores both folders: never commit the file.
- [ ] Ask the instructor the open questions in SRS section 15.3, above all whether the dataset may be published and whether changes must survive a page reload. Until the dataset question is answered, do not commit the data files that task 1 produces.
- [ ] Copy the new SRS section 11.2 into the team's master SRS document.
- [ ] Copy FR-ADD-12 to FR-ADD-15, the new SRS section 7.6 and the six new messages in Appendix C.2 into the team's master SRS document.
- [ ] Walk AC-16 (keyboard only) and AC-23 (360 px) by hand in a real browser. No test can make these two, and the test report has to list them as manual checks.

## Dates

| Dates in October | Goal |
| --- | --- |
| 6 to 12 | Stage 1: main pages and features |
| 13 to 15 | Stage 2: after the main features |
| 15 to 16 | Final tests, code review and documents |
| 17 | Submit the repository URL |

## How we work

- One owner per file, so that two people do not change the same file.
- Two branches always exist: `main`, which holds what is submitted, and `dev`, where the work
  comes together. Build each feature on one short-lived branch off `dev`, merge it back through a
  pull request that another member reads, then delete the branch. Do not stack pull requests.
- Before every pull request, run `npm test`, `npm run lint` and `npm run format` inside `frontend/`.
- To build a task, run `/implement-requirement` with its SRS section, read the change it makes, then check the matching scenarios in SRS section 14 by hand.
