# Data files

Both files in this folder are built by `npm run prepare-data` from the raw Kaggle CSV in
`frontend/data-raw/` (SRS 3.4, Appendix A). Never edit them by hand.

| File | Holds | State |
| --- | --- | --- |
| `portfolio.seed.json` | The starting portfolio | **Placeholder, 8 properties** |
| `market.reference.json` | The market reference set, about 1,350 listings | Not built yet |

## Why the placeholder exists

`portfolio.seed.json` currently holds 8 hand-written properties, not the 40 the SRS requires. They
exist only so that the list, detail, form, delete and search features have something to show while
the dataset question is still open. They cover all four cities, both property types, all three
statuses and both Arabic and English districts.

None of this data comes from the Kaggle dataset, so committing it does not touch the open licence
question in SRS section 15.3.

## What replaces it

Task 1 in `docs/tasks.md`, which has three parts and none of them are done:

1. **Download the Kaggle CSV** into `frontend/data-raw/`. Git ignores that folder, so the raw file
   is never committed.
2. **Write `frontend/scripts/prepare-data.mjs`.** It does not exist yet. `package.json` already
   has the `prepare-data` script pointing at it, so `npm run prepare-data` currently fails with
   "Cannot find module" — that is a missing script, not a broken setup.
   `.claude/rules/data-prep.md` and SRS Appendix A say what it has to do.
3. **Run it**, which writes 40 properties `RP-0001` to `RP-0040` here and overwrites this
   placeholder, plus `market.reference.json`.

Do not commit the generated files until the instructor answers whether the dataset licence allows
publishing data derived from it (SRS 15.3, `docs/tasks.md`).

Nothing else needs to change: the pages read the portfolio through
`src/services/propertyService.js`, which does not care how many properties the seed holds.
