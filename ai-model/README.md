# AI model

A model that predicts the yearly rent of a rental house from its attributes: city, district, size, rooms, age and amenities. It is trained on the public Kaggle dataset [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar), which holds rental listings from 2021.

**Status: built.** `prepare.ipynb` explores and cleans the data, compares models, takes the final test and exports the chosen model. The app shows its suggestion beside Yearly rent on the Add and Edit forms (FR-ADD-13, SRS 7.6), and its district list, with an English name for each district, fills the form's District dropdown (FR-ADD-14). `plan.md` lists every step and what it found.

## Results

| On 304 houses held out from training | Average error (MAPE) | Average error (SAR) | Within 15% |
| --- | --- | --- | --- |
| Ridge regression, the model the app runs | 23.1% | 22,998 | 46.1% |
| Ridge and gradient boosting averaged | 23.1% | 22,871 | 46.4% |
| Baseline: city and size only | 38.8% | 34,562 | 24.7% |

The score holds for yearly rents between 10,000 and 500,000 SAR in the 2021 market. When the district is one the model doesn't know, typed through "Other district…" because the 2021 data lacks it, the error rises to about 32%, and the app says so.

## Running it

1. Download the CSV into `ai-model/data-raw/` (`plan.md`, step 1). Git ignores that folder.
2. Install the libraries: `pip install -r requirements.txt`.
3. Open `prepare.ipynb` and click Run All. Step 19 rewrites `frontend/src/data/rent-model.json` and `frontend/src/data/districts.json`. Then copy the two rents it prints into `frontend/src/utils/rentModel.test.js`.

## Rules that keep the result honest

- The raw CSV lives in `ai-model/data-raw/`, which git ignores. Never commit it.
- Remove duplicate rows before splitting the data into a training set and a test set. About 60% of the rows are copies, and a copy on both sides of the split makes the model look far more accurate than it is.
- Keep the 40 portfolio properties out of training. They are the properties the app asks the model to price.
- Report the error measured on the test set, in SAR and as a percentage, whatever it turns out to be.
- Commit the notebook without its outputs: they show rows of the dataset.

## The licence

The dataset's licence is "Data files © Original Authors", and SRS open question 3 is not answered yet. `frontend/src/data/rent-model.json` holds only the model's weights and one number per district, no rows of the dataset; the team chose to commit it on 16 October 2026. `frontend/src/data/districts.json` holds only the districts' names, which the weights file already contains, each with an English name written by hand. Ask the instructor before publishing anything else made from the data.
