# Rent model plan

You write the code in `prepare.ipynb`. Claude explains each step, names the functions to use, warns about traps and reviews what you wrote.

## Where you are

- Phases 1 to 3 (steps 1 to 18) are done. On the test set, the model's guesses are off by **23.1%** of the rent on average (22,871 SAR), and 46.4% of the houses are guessed within 15%.
- ✔ Step 19: the app runs Ridge (23.1% on the test set). Its suggestion is always shown beside Yearly rent on the Add and Edit forms.
- **Next: step 20**, the write-up.

## Rules for every step

- Explore and decide with `train` only. Use `test` once, in step 18.
- Change the data only with code in the notebook, never by editing the CSV.
- Start each section with a markdown cell that gives its step number, so you always know where you are.
- Before calling a phase done, restart the kernel and click Run All. The numbers must come out the same.
- Before every commit, click Clear All Outputs. Commit only the notebook, `requirements.txt` and documents. Never commit the CSV, figures or model files: the dataset's licence does not allow it.

## Phase 1: Explore

1. ✔ Load the data, and check the column types and missing values. Only `details` has missing values (80).
2. ✔ Drop the exact copies: 3,718 → 1,521 rows.
3. ✔ Split: 1,197 train and 324 test. `FACTS` is written out by name, and `split(df)` makes `train` and `test` again whenever rows or columns change.
4. Read the descriptions, on `train`.
   - ✔ **a. Yearly or monthly?**
     - A histogram of `np.log10(train["price"])`. Two humps would mean monthly prices are mixed in.
     - The share of شهري (monthly) and سنوي (yearly) in each price band, using `pd.qcut(train["price"], 5)`.
     - The descriptions of the 20 cheapest houses.
     - **Found (16 October):** prices are yearly, except 21 houses in `train` under 10,000 SAR and one at 14,000 SAR. Of the 21: 6 say monthly (شهري), 7 are daily holiday chalets in Jeddah (يومي, دره العروس), 1 is for sale (للبيع مليون ريال), and 7 give no clue but look monthly from the price. The 14,000 one is a weekly price (اسبوعي). Above 10,000 SAR, شهري usually means "monthly payments accepted" or "the owner refuses monthly", and the price is still yearly.
     - **Two prices in one description (16 October):** 42 houses in `train`. Only 3 give prices for different periods (rows 333, 490, 904). Rows 490 and 904 are already removed by the step 9 rule, and row 333 has a yearly price. The rest are mostly one payment vs two payments (13), several units in one ad (10) and furnished vs not (5). That adds a little noise, but no rule is needed. Rows 976 and 1052 (hotel villas) give only a monthly price; their price column is 6 times it, and the yearly price is cut off. 450 of the 1,197 descriptions end in "...", so their full text isn't in the data. Candidates for 4b: row 1145 (one rent for two villas), the hotel villas, and the compound ads with price ranges (rows 85, 117, 325, 399, 839).
   - ✔ **b. Which rows aren't houses?** Look for شقة / شقه, عمارة, استراحة, and دور when it means a single floor. Read the matches.
     - **Found:** the ad's first word tells what it rents. 29 ads start with دور, شقه, عماره or شاليه; there are also 4 hotel villas, 9 offices and 4 sales. A-06 holds for about 96% of the ads.
   - ✔ **c. Impossible sizes and prices:** read their descriptions.
     - **Found:** 1 m² is the only impossible small size. Every ad of 2,000 m² or more is a compound, a typo or a commercial property. Every price above 500,000 SAR is a sale price, a compound, an office or a typo.
   - ✔ **d. Keyword candidates**, ملحق (annex) first: how many houses mention it, and the median price with and without it, in Riyadh only.
     - **Found:** ملحق is in 14.7% of Riyadh houses, with a median 1.20 times higher; درج داخلي is in 16.3%, with a median 0.59 times. Both became flags.
   - Traps:
     - Normalise the text first (ة→ه, أ/إ/آ→ا, ى→ي).
     - Use `na=False`.
     - Short words hide inside longer ones: دور matches دورين, and الف matches الفيلا.
     - City names start with a space, so use `.str.strip()`.
5. ✔ Feature engineering. Put new values in new columns and never overwrite the 22 FACTS columns, so the split cell gives the same answer whenever you run it.
   - `city` and `front` in English (SRS A.3), and `type` as Duplex or Villa from `duplex`.
   - `district` normalised: translate `normalise()` from `frontend/src/utils/arabic.js`, also removing a leading "حي ". Check it with `assert` ("الروضة" → "الروضه").
   - New numbers: log size, total rooms, size per bedroom, a new-building flag (age 0), an amenity count and a corner flag (3 or 4 streets).
   - Keyword flags from 4d, such as `has_annex`.
   - Not here: a district's average rent. It is learned from prices, so it goes inside the model in step 14.
   - Then make `train` and `test` again.
6. ✔ Delete the true duplicates: rows identical on FACTS, your new flags and `price`. Print the row count before and after. (1,521 → 1,513.)
7. ✔ Graphs, on `train`, with English labels (matplotlib draws Arabic letters broken):
   - a histogram of log price
   - log price against log size, one colour per city
   - median price by city, by type and by bedrooms
   - median price with and without each amenity, Riyadh only
   - number of houses per district
   - the Spearman correlation between size and the room counts
8. ✔ Checkpoint: bring the outputs to Claude and turn them into cleaning rules together.

## Phase 2: Clean

9. ✔ Cleaning rules, chosen by looking at `train` and applied to `df`. Write one cell per rule, and print how many rows it removes from train and from test.
   - The six rules, in order, with the rows each removes from train / test:
     1. prices that aren't yearly: under 10,000 SAR, or اسبوعي (22 / 3)
     2. not a whole house, by the ad's first word (27 / 7)
     3. hotel villas and offices (11 / 1)
     4. for sale, with no word for rent (3 / 0)
     5. sizes under 50 m² or of 2,000 m² and more (9 / 4)
     6. prices over 500,000 SAR (5 / 3)
   - Never drop a row only because it is hard to predict.
   - Result: 1,418 houses, 1,114 in `train` and 304 in `test`.
10. ✔ Write the model's inputs as a list, `FEATURES`, and set the target to `price`. `details` isn't an input. You don't need to save CSV files, because the models use `train` and `test` in the same notebook.

## Phase 3: Models

11. ✔ scikit-learn 1.7.2 was already installed in the notebook's Python (Anaconda "base"). `requirements.txt` pins it. Tell the team it is a new dependency.
12. ✔ How every model is scored: 5-fold cross-validation on `train`. `three_numbers` grades a set of guesses, and `score` grades a model's cross-validated guesses.
    - Use `GroupKFold(n_splits=5)` with `groups = train[FACTS].apply(house_text, axis=1)`, so copies stay in the same fold.
    - Three numbers for each model:
      - average error in % (MAPE), which decides the winner
      - average error in SAR (MAE)
      - the share of houses guessed within ±15%
    - Trap: scikit-learn reports errors as negative numbers (`neg_...`), and MAPE as a fraction (0.12 means 12%).
13. ✔ Baselines, the scores to beat (found: B1 43.8%, B2 41.4%):
    - B1: a model that knows only the city.
    - B2: a model that knows only the city and the size.
    - Optional B3: the app's own comparables estimate (SRS B.2 and B.3).
14. ✔ Ridge regression (found: 23.6% with `alpha` = 1; a plain loop over the four values replaced `GridSearchCV`).
    - A `Pipeline` with a `ColumnTransformer`: `OneHotEncoder` for city, front and type, `TargetEncoder` for district and `StandardScaler` for the numbers. Put `Ridge` last.
    - Wrap it in `TransformedTargetRegressor(func=np.log, inverse_func=np.exp)`, so it learns log price but answers in SAR.
    - Try `alpha` = 0.1, 1, 10 and 100 with `GridSearchCV`.
15. ✔ `HistGradientBoostingRegressor` (found: 23.1% with 0.05 / 15 / 200; more trees made it worse).
    - The same encoders without the scaler, and the same log wrapper.
    - Try `learning_rate` 0.05 and 0.1, `max_leaf_nodes` 15 and 31, and `max_iter` 200 and 500.
16. ✔ One comparison table. The best MAPE wins. If Ridge and boosting are within about 1 point, choose Ridge: it is simpler, and it runs easily in a browser.
17. Error analysis, using `cross_val_predict`:
    - errors by city and by price band
    - the 10 biggest misses
    - If they reveal bad data, go back to step 9.
    - ✔ **Found:** 29 district names exist in more than one city (286 houses), so `district_city` joins the city to the name. Averaging Ridge and boosting with `VotingRegressor` helped too. Together: 21.6%. Dropped after testing: condition words, seven more keyword flags, a size effect per city.
18. ✔ The final exam: fit the winner on all of `train` and predict `test` once. Report the three numbers overall and per city. Change nothing after this.
    - **Result:** the average of both, 23.1% MAPE, 22,871 SAR MAE, 46.4% within 15%. B2 on the same houses: 38.8%. By city: Jeddah 21.8%, Riyadh 24.7%, Dammam 15.6% and Al Khobar 22.8% (only 23 and 19 houses).
19. ✔ The model for the app. Ridge was chosen for the browser before its exam, then took it once: 23.1% MAPE, 22,998 SAR MAE, 46.1% within 15%. It then learned from all 1,418 clean houses and was written to `frontend/src/data/rent-model.json`, with the sizes it learned from (100 to 1,652 m²). The app's rent suggestion (FR-ADD-13, SRS 7.6) reads that file. Step 19 also writes `frontend/src/data/districts.json` for the form's District dropdown (FR-ADD-14): each city's districts by an English name, written by hand in a table, paired with the Arabic spelling the ads use most. Every name in it leads the model to its own district.
    - An unknown district, one the 2021 data doesn't have, raises the error to 31.7%, so the app says when it happens.
    - Outside 100 to 1,652 m² the weighted sum gives absurd rents (millions for 90,000 m²), so the app suggests nothing there.

## Phase 4: Write up

20. Update the documents, then commit.
    - `ai-model/README.md`: findings and scores (counts and medians only, no rows).
    - `docs/ai-usage.md`: a row saying what the AI tool did.
    - `docs/tasks.md`: tick the AI model steps.
    - Commit with the outputs cleared, and check that `git status` shows no data.

## If time runs short

The app (due 17 October) comes first. The shortest path through this plan is steps 4a to 4c, 9 to 13 (B1 and B2 only), 14, 15 with the default settings, 16, 18 and 19.

## Extra data: not used

`data-raw/aqar-2023/` (12,290 villa rentals from 2023) and `data-raw/bayut-riyadh-2024/` (190 Riyadh villas) were downloaded on 16 October. They lack the amenity and description columns this plan uses, so leave them alone. After step 18 you may try the model on the 2023 prices as an extra check. Never commit them.

## Later: team decisions

- ✔ Decided on 16 October: the model runs in the browser, and its suggestion is shown on the Add and Edit forms.
- The licence: the team chose to commit the model's weights, which hold no rows. Ask the instructor before committing anything else made from the data.
- The portfolio properties: keep the 40 properties out of training once task 1 creates them.

## Housekeeping

- ✔ `ai-model/README.md` now says the CSV lives in `ai-model/data-raw/`.
