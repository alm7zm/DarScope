# Data files

| File | Holds | Made by |
| --- | --- | --- |
| `rent-model.json` | The rent model's weights, and one number per district; no rows of the dataset | Step 19 of `ai-model/prepare.ipynb` |
| `districts.json` | Each city's districts in the 2021 data: an English name and the most common Arabic spelling | Step 19 of `ai-model/prepare.ipynb` |

Never edit either file by hand: run the notebook again.

## Where the properties went

Since Part 2 the portfolio lives in the Spring server's database, and its starting rows are in the
server's `data.sql` (`docs/backend-plan.md`, section 4). The 8 hand-written properties that used to
sit here moved to `src/test/portfolio.seed.json`, the starting data of the in-memory stand-in the
tests use (`src/test/fakePropertyService.js`). `data.sql` holds the same 8. None of them comes
from the Kaggle dataset.

SRS version 1.2 withdrew the market reference set, `market.reference.json`, with the features that
needed it, so no other data file will be added here. Apart from the two files above, commit nothing
made from the dataset until the instructor answers the licence question (SRS 15.3).
