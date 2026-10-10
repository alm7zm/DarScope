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

1. Download the Kaggle CSV into `frontend/data-raw/`. Git ignores that folder.
2. Build the real files with `npm run prepare-data`, which writes 40 properties `RP-0001` to
   `RP-0040` here and overwrites this placeholder.
3. Do not commit the generated files until the instructor answers whether the dataset licence
   allows publishing data derived from it (SRS 15.3, `docs/tasks.md`).

Nothing else needs to change: the pages read the portfolio through
`src/services/propertyService.js`, which does not care how many properties the seed holds.
