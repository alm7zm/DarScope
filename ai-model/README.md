# AI model

A model that predicts the yearly rent of a rental house from its attributes: city, district, size, rooms, age and amenities. It is trained on the public Kaggle dataset [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar), which holds rental listings from 2021.

**Status: not started.** The app does not use anything in this folder yet.

## Still undecided

- Where the model runs: in the browser, or on the Part 2 backend.
- How the app shows the model's prediction beside the fair-rent estimate from comparable listings (SRS section 7.3).

`docs/SRS.md` has no requirements for the model yet. They are added when these two points are decided.

## Rules that keep the result honest

- The raw CSV lives in `frontend/data-raw/`, which git ignores. Never commit it.
- Remove duplicate rows before splitting the data into a training set and a test set. About 60% of the rows are copies, and a copy on both sides of the split makes the model look far more accurate than it is.
- Keep the 40 portfolio properties out of training. They are the properties the app asks the model to price.
- Report the error measured on the test set, in SAR and as a percentage, whatever it turns out to be.
