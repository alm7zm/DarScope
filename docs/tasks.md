# Darscope tasks

What is left to build for Part 1, most important first. Each task names the section of [SRS.md](SRS.md) that describes it in full.

To take a task, write your name in **Owner**. Add ✔ when it is merged.

## Already built

- The project setup: React, the page router, the test tools and the npm commands in the README.
- The layout every page shares: the header with the menu, and the footer.
- A URL and a placeholder for every page, plus the "Page not found" and error screens.
- The design colours and a Button in three styles.

## Stage 1: main pages and features

Do these first. They are what the course brief requires, and the target is to have all of them working by 12 October.

Build only the **Must** requirements of each SRS section at this stage. The Should and Could ones come in stages 2 and 3.

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

### One way to split the work

This is a suggestion: the team decides. Each person starts with one foundation task, and each person's tasks stay in different files, so two people rarely change the same one.

| Person | Starts with | Then |
| --- | --- | --- |
| 1 | 2 Data layer | 6 Add and Edit property |
| 2 | 1 Sample data | 4 Property list, 8 Search and filters |
| 3 | 3 Shared pieces | 5 Property detail, 7 Delete property, 9 Dashboard, 10 About |

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

Only if time remains. These are the Could requirements in the SRS: bulk delete, CSV export, a dark theme, charts, a "Suggest rent" button, highlighted search matches and plain-language input.

## AI model

A rent-prediction model in the `ai-model/` folder. It goes beyond the course brief, so it must not delay stage 1. [ai-model/README.md](../ai-model/README.md) has the rules for it.

| Step | Owner |
| --- | --- |
| Get the data and study it | |
| Clean it, and split it into a training set and a test set | |
| Train models and compare them with simple estimates | |
| Decide how the app uses the model, then connect it | |

## Documents to hand in

| Document | How | Owner |
| --- | --- | --- |
| Visual design: wireframes and a style guide in `docs/design/` | With an AI tool, ideally before the pages are styled | |
| Architecture and features | Run `/project-docs` | |
| Test report | Run `/test-report` | |
| Code review | Run `/code-review-report` | |
| AI usage record in `docs/ai-usage.md` | Add a row each time an AI tool produces something | Everyone |
| The repository URL | Submit it on or before 17 October | |

## Team to-dos

- [ ] Add the other two names and student IDs to `frontend/src/constants/team.js`.
- [ ] Download the Kaggle CSV into `frontend/data-raw/`. Git ignores that folder: never commit the file. Task 1 and the AI model wait for it.
- [ ] Ask the instructor the open questions in SRS section 15.3, above all whether the dataset may be published and whether changes must survive a page reload. Until the dataset question is answered, do not commit the data files that task 1 produces.
- [ ] Copy the new SRS section 11.2 into the team's master SRS document.

## Dates

| Dates in October | Goal |
| --- | --- |
| 6 to 12 | Stage 1: main pages and features |
| 13 to 15 | Stage 2: after the main features |
| 15 to 16 | Final tests, code review and documents |
| 17 | Submit the repository URL |

## How we work

- One owner per file, so that two people do not change the same file.
- One branch and one pull request per task. Another member reads it before it is merged.
- Before every pull request, run `npm test`, `npm run lint` and `npm run format` inside `frontend/`.
- To build a task, run `/implement-requirement` with its SRS section, read the change it makes, then check the matching scenarios in SRS section 14 by hand.
