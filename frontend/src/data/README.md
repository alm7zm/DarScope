# Data files

| File | Holds | Made by |
| --- | --- | --- |
| `rent-model.json` | The rent model's weights, and one number per district; no rows of the dataset | Step 19 of `ai-model/prepare.ipynb` |
| `districts.json` | Each city's districts in the 2021 data: an English name and the most common Arabic spelling | Step 19 of `ai-model/prepare.ipynb` |

Never edit either file by hand: run the notebook again.

## Where the properties went

Since Part 2 the portfolio lives in the Spring server's database, and its starting rows are in the
server's `data.sql` (`docs/backend-plan.md`, section 4). The 8 hand-written properties that used to
sit here moved to `src/test/portfolio.seed.json`. They are now the starting data of the in-memory
stand-in the tests use (`src/test/fakePropertyService.js`), and the first rows to copy into
`data.sql`. None of them comes from the Kaggle dataset.

`market.reference.json`, the market listings for comparables and insights, is still not built: it
needs `frontend/scripts/prepare-data.mjs` (`.claude/rules/data-prep.md`), which does not exist yet.
Do not commit anything made from the dataset until the instructor answers the licence question
(SRS 15.3).
