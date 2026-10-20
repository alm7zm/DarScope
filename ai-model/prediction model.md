# Prediction model

This is how the team built its rent-prediction model. It covers the data, what exploring it showed, how it was cleaned, which models were tried, how well the chosen one does, and how the app uses it. Every number comes from a run of [`prepare.ipynb`](prepare.ipynb). The step numbers match the notebook's headings and [`plan.md`](plan.md).

## Summary

- **What it does:** it guesses the yearly rent of a villa or duplex in Riyadh, Jeddah, Dammam or Al Khobar. It uses the city, district, front, size, age, room counts, amenities and two phrases in the description.
- **The data:** [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar) on Kaggle, which holds rental ads from 2021. Of its 3,718 rows, 1,418 houses were left after removing copies and bad rows.
- **The model the app runs:** Ridge regression on the log of the rent. On 304 houses set aside before anything else was done:
  - its guesses are off by **23.1%** of the rent on average (22,998 SAR);
  - **46.1%** of the guesses fall within 15% of the real rent;
  - a guess from city and size alone is off by 38.8%.
- **Where it shows:** the Add and Edit property forms show its suggestion beside Yearly rent (FR-ADD-13, SRS 7.6).

| Stage | Houses | In train | In test |
| --- | --- | --- | --- |
| The raw file | 3,718 | | |
| After dropping exact copies (step 2) | 1,521 | 1,197 | 324 |
| After dropping true duplicates (step 6) | 1,513 | 1,191 | 322 |
| After the six cleaning rules (step 9) | 1,418 | 1,114 | 304 |

## The rules we kept to

- **Every decision was made with the training houses only.** The test houses were used for the final exam (step 18), and for Ridge's own exam score (step 19). Neither result changed any choice.
- **The data was changed only by code in the notebook,** never by editing the file by hand.
- **Nothing from the dataset is published.** Its licence reads "Data files © Original Authors", which is not an open licence.
  - The raw file, the notebook's outputs and the figures are never committed.
  - This document gives counts and medians only, never a listing.
  - The one exception the team accepted is the model's weights, `frontend/src/data/rent-model.json`, which hold no rows.

---

## Phase 1: Explore

### Step 1: load the data and check it

The file has 3,718 rows and 24 columns:

| Kind | Columns |
| --- | --- |
| Location | `city`, `district`, `front` (which way the house faces: north, east, three streets…) |
| Numbers | `size` (m²), `property_age` (years), `bedrooms`, `bathrooms`, `livingrooms` |
| Yes/no | 13 amenities (`kitchen`, `garage`, `driver_room`, `maid_room`, `furnished`, `ac`, `roof`, `pool`, `frontyard`, `basement`, `stairs`, `elevator`, `fireplace`), and `duplex` |
| What we predict | `price`: the rent in SAR |
| Text | `details`: the ad's description, in Arabic |

What the first checks showed:

- **Missing values:** only `details` has any. 80 ads have no description.
- **Price:** from 1,000 to 1,700,000 SAR, median 70,000.
- **Size:** from 1 to 95,000 m², median 330. Both ends are impossible for a house; step 4c reads those ads.
- **Room counts:** bedrooms run 1 to 7, bathrooms 1 to 5 and living rooms 1 to 5. Age runs 0 to 36 years.

### Step 2: drop the exact copies

- **What was repeated:** 60 ads appear more than once, between 2 and 54 times each (46 times for a typical one). Together they fill 2,257 rows.
- **The result:** keeping one row of each leaves **1,521 rows**. 59% of the file was copies.
- **Why it matters:** suppose one copy of a house lands in the training houses and another in the test houses. The model is then graded on a house it has already seen, and looks better than it is.

### Step 3: split off a test set

About 1 house in 5 was put aside as a **final exam**: the model never sees these houses while it learns. The split gave **1,197 training houses and 324 test houses**.

**How the split works:**

1. Join a house's 22 facts (every column except `price` and `details`) into one text.
2. Turn that text into a number with `crc32`.
3. Hide the house when the number divided by 5 leaves 0.

**Why not scikit-learn's usual random split (`train_test_split`):**

- **Copies stay together.** The same house always gets the same number, so all its copies land on the same side.
- **Removing rows later moves nothing.** Each house's side depends only on its own facts, so dropping other rows never moves it to the other side.

**A bug found and fixed:** the first version built the list of facts from `df.columns` and saved the answer in a new column, `is_test`. Running the cell a second time counted `is_test` as a fact and hid different houses. The fix was to write the 22 column names out by hand, so the cell gives the same split however often it runs.

### Step 4: read the descriptions

Some questions only the descriptions can answer: is a price monthly, or does the ad rent a whole house? Everything in this step used the training houses only.

**Cleaning up the Arabic text first.** The same word can be spelled several ways, such as شقة and شقه, or أحمد and احمد. A `normalise` function does exactly what `normalise()` does in the app (`frontend/src/utils/arabic.js`):

1. Lower-case the English letters.
2. Remove the short vowel marks and the stretching line (ـ).
3. Write أ إ آ ٱ as ا, ى as ي, and ة as ه.
4. Write the Arabic digits ٠ to ٩ as 0 to 9.
5. Leave one space between words.

**Cut-short descriptions:** 450 of the 1,197 descriptions end in "...". The dataset kept only their beginning.

#### 4a. Are the prices yearly or monthly?

A monthly price is about 12 times smaller than a yearly one. So if some ads gave monthly prices, they would form a second group of very cheap houses.

- **The histogram** of log10(price) has one hump, from about 30,000 to 200,000 SAR. So almost every price is yearly.
- **21 houses cost under 10,000 SAR.** Their descriptions show:
  - 6 monthly prices (شهري);
  - 7 daily prices for holiday chalets in Jeddah;
  - 1 house for sale;
  - 7 with no clue, whose price looks monthly.
- **One more house, at 14,000 SAR,** gives a weekly price (اسبوعي).
- **How often the descriptions say monthly or yearly**, by price band. Each band holds a fifth of the houses:

| Price band (SAR) | Houses | Say شهري (monthly) | Say سنوي (yearly) |
| --- | --- | --- | --- |
| up to 48,000 | 246 | 9.3% | 11.8% |
| 48,000 to 65,000 | 254 | 1.6% | 5.9% |
| 65,000 to 90,000 | 242 | 0.8% | 2.9% |
| 90,000 to 130,000 | 229 | 0.0% | 6.1% |
| over 130,000 | 226 | 0.9% | 5.8% |

Above 10,000 SAR, شهري usually means "monthly payments accepted" or "the owner refuses monthly". The price itself is still yearly.

**Became rule 1:** drop prices under 10,000 SAR, and every ad that mentions a weekly price.

#### 4b. Which ads don't rent a whole house?

An apartment, a single floor, a building, a chalet or an office has different prices from a house, and would confuse the model.

- **Searching for words anywhere in the ad doesn't work.** شقه (apartment) is in 31 ads, but most of them are villas that *contain* an apartment. دور (floor) is in 639 ads, because it is also part of دورين (two floors) and دورات مياه (bathrooms).
- **The ad's first word works better.** It usually says what is rented. A `first_word` function skips symbols, emojis, greetings and the words for "for rent". The most common first words are فيلا (villa, 567 ads), فله (villa, 161) and دبلكس (duplex, 37).
- **What was found:**
  - 29 ads start with a word for something that isn't a house: a floor, an apartment, a building, a chalet or a rest house.
  - 4 ads are hotel villas and 9 are offices.
  - 4 are for sale and never mention rent.
- **In all, 42 of the 1,197 training ads (3.5%) do not rent a home.** So SRS assumption A-06, "every listing is a villa or a duplex", holds for about 96% of the ads.
- **The rule's price:** three real villas are lost too. Two are described floor by floor, and one says "a single floor" to mean a one-storey villa. We accepted that for a rule that is simple and treats the test houses the same way.

**Became rules 2, 3 and 4.**

#### 4c. Impossible sizes and prices

- **1 m² is the only impossible small size.** The next smallest, 100 to 140 m², are real small houses.
- **None of the 8 ads of 2,000 m² or more is one house.** They are 5 compounds, a commercial property, and two villas whose size can't be their own, one of them a typing mistake. Between 1,500 and 2,000 m², the ads are real large villas.
- **No price above 500,000 SAR is the yearly rent of one house.** These ads are sale prices, a whole compound, offices, a commercial property, and two that look like an extra zero. At 450,000 SAR and below, the ads are mostly real luxury and compound villas.

**Became rules 5 and 6.**

#### 4d. Words that move the price

Some things change the rent but have no column, though the descriptions mention them. For each candidate word, the table compares the median rent of houses that mention it with those that don't. It uses Riyadh only, so the comparison isn't just Riyadh against the cheaper cities.

| Word | Houses | Share | Median with | Median without | With ÷ without |
| --- | --- | --- | --- | --- | --- |
| ملحق (annex) | 106 | 14.7% | 90,000 | 75,000 | 1.20 |
| درج داخلي (internal staircase) | 118 | 16.3% | 50,000 | 85,000 | 0.59 |
| شقه (an apartment inside) | 23 | 3.2% | 80,000 | 79,000 | 1.01 |
| جديد (new) | 132 | 18.3% | 60,000 | 80,000 | 0.75 |
| فاخر (luxury) | 28 | 3.9% | 120,000 | 75,000 | 1.60 |

- **An annex** goes with higher rents.
- **An internal staircase** goes with lower ones. Those are the smaller villas built close together.
- **Not used:** "new" is already covered by the age column, and "luxury" is in too few houses to learn from.
- **One trap:** ملحق به means "attached to it", such as a bathroom attached to a bedroom. The search excludes it.

**Became two flags:** `has_annex` and `has_internal_stairs`.

### Step 5: new columns

Every new value went into a **new** column, and the 22 original columns were never changed. That keeps the split from step 3 the same.

- **English names.** City, front and type use the names in SRS Appendix A.3, the same ones the app uses. Type is Duplex where `duplex` is 1 and Villa elsewhere.
  - Of the 1,521 houses, 904 are in Riyadh, 411 in Jeddah, 123 in Dammam and 83 in Al Khobar.
  - 948 are villas and 573 duplexes.
- **District names** go through `normalise`, and lose a leading "حي" (district). The 174 spellings became 173 districts.
- **New numbers:**

| Column | What it is | Why it may help |
| --- | --- | --- |
| `log_size` | log10 of the size | Rent grows more slowly than size |
| `total_rooms` | bedrooms + bathrooms + living rooms | One number for how big the house is inside |
| `size_per_bedroom` | size ÷ bedrooms, with 0 bedrooms counted as 1 | A few large rooms or many small ones |
| `is_new` | 1 when the age is 0 | New houses may rent for more |
| `amenity_count` | how many of the 13 amenities | One number for how well equipped it is |
| `is_corner` | 1 when it faces 3 or 4 streets | Corner plots are often wanted |
| `has_annex` | 1 when the description mentions an annex | Step 4d; 21.6% of houses |
| `has_internal_stairs` | 1 when it mentions an internal staircase | Step 4d; 11.1% of houses |

**Left out on purpose:** a district's average rent. It is worked out from the prices, so it has to be learned inside the model, from the training houses only (step 14).

### Step 6: drop the true duplicates

Some houses were posted twice with a **different description**: the same 22 facts, keyword flags and price. That is still one house, so only the first row stayed. **1,521 rows became 1,513**: 1,191 training houses and 322 test houses.

### Step 7: graphs

All on the 1,191 training houses. The labels are in English, because matplotlib draws Arabic letters unjoined. The figures are saved in `ai-model/figures/`, which git ignores; running the notebook makes them again.

**Price against size, one colour per city.** Price rises with size, but houses of the same size can differ by 3 times or more in rent. The rank correlation between size and price is only 0.30. The few dots far below the cloud are the problem rows that step 9 removes.

**Median rent by city:**

| Jeddah | Riyadh | Al Khobar | Dammam |
| --- | --- | --- | --- |
| 100,000 SAR | 77,500 SAR | 65,000 SAR | 60,000 SAR |

**By type:** villas 80,000 SAR and duplexes 75,000 SAR, so they are close.

**By bedrooms:** more bedrooms doesn't mean more rent. Bedrooms stop at 7 in the data, and big old houses with many rooms are often cheap.

| Bedrooms | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Houses | 10 | 9 | 128 | 278 | 488 | 84 | 194 |
| Median rent (SAR) | 75,000 | 60,000 | 85,000 | 80,000 | 80,000 | 68,500 | 70,000 |

**Amenities, in Riyadh:** each amenity's median rent with it, divided by the median without it.

| Amenity | Ratio | Amenity | Ratio |
| --- | --- | --- | --- |
| basement | 2.07 | stairs | 1.23 |
| air conditioning | 1.95 | front yard | 1.23 |
| elevator | 1.87 | annex | 1.20 |
| pool | 1.86 | roof | 0.88 |
| driver's room | 1.82 | fireplace | 0.71 |
| furnished | 1.71 | internal staircase | 0.59 |
| maid's room | 1.70 | kitchen, garage | 1.33 each |

A ratio below 1 doesn't mean the amenity lowers the rent. More likely, cheaper districts simply have more of it.

**Rank correlation (Spearman) with price:**

| | Size | Bedrooms | Bathrooms | Living rooms |
| --- | --- | --- | --- | --- |
| With price | 0.30 | −0.02 | 0.14 | 0.32 |

- **Living rooms** go with price as strongly as size does.
- **Size and the room counts** are only weakly linked to each other (0.12 to 0.31), so each one adds information and all of them stay.

**Districts:** the training houses come from 164 districts, and 99 of them have fewer than 5 houses. So the model must not trust a district it has seen only a few times. Step 14 handles this.

### Step 8: checkpoint

The findings of steps 4 and 7 were turned into the cleaning rules below. The guiding rule: **remove a row only when it would teach the model a wrong price**, never because it is unusual or hard to predict.

---

## Phase 2: Clean

### Step 9: the six cleaning rules

Each rule ran on the whole data, so the test houses were cleaned exactly like the training ones. The rules run in order, so a row is counted only under the first rule that removes it.

| Rule | Removes | Found in | Train | Test |
| --- | --- | --- | --- | --- |
| 1. Not a yearly price | prices under 10,000 SAR, and weekly prices | 4a | 22 | 3 |
| 2. Not a whole house | ads whose first word is a floor, an apartment, a building, a chalet or a rest house | 4b | 27 | 7 |
| 3. Not a home | hotel villas and offices | 4b | 11 | 1 |
| 4. For sale | ads that say "for sale" and never mention rent | 4b | 3 | 0 |
| 5. Impossible size | under 50 m², or 2,000 m² and more | 4c | 9 | 4 |
| 6. Impossible price | over 500,000 SAR | 4c | 5 | 3 |
| **In all** | | | **77** | **18** |

**What was left:** 1,418 houses, 1,114 for training and 304 for the test.

- **Training houses by city:** 675 in Riyadh, 286 in Jeddah, 92 in Dammam and 61 in Al Khobar.
- **Their rents:** from 15,000 to 450,000 SAR, median 80,000.

**Seen while reading, and kept on purpose:**

- **Two prices in one ad.** Some ads give two prices, such as paying at once or in two payments, or furnished or not. The price column holds one of them, and the gap is 5 to 25%. That is noise a model can live with.
- **Rare oddities.** A few ads rent two villas for one price, or have a price typed differently from the one in the description. They are too few for a rule.
- **Cut-short descriptions.** About 40% of the descriptions are cut short, so a few ads may hide a monthly price or a sale in the missing part.

### Step 10: the model's inputs

The model gets **29 inputs**:

- **4 names:** city, district, front and type.
- **25 numbers:** the 6 new numbers and 2 keyword flags from step 5, the age, the 3 room counts, `size_per_bedroom` and the 13 amenities.

The answer it learns to give is `price`.

**Not inputs:**

- the description itself, which the two keyword flags summarise;
- the Arabic city, district and front, replaced by their cleaned versions;
- `size`, replaced by `log_size`;
- `duplex`, replaced by `type`.

---

## Phase 3: Models

### Step 11: the library

The models come from **scikit-learn 1.7.2**, which `requirements.txt` pins, together with pandas 2.3.3 and matplotlib 3.10.6.

### Step 12: how every model is graded

**Cross-validation is a set of practice exams.** The 1,114 training houses are cut into 5 parts. A model learns from 4 parts and guesses the 5th, and this repeats until every house has a guess from a model that never saw it.

- **Copies stay together.** `GroupKFold` keeps the 8 houses that appear twice at two prices in the same part.
- **Every model gets three numbers.** Take a house that rents for 100,000 SAR and is guessed at 90,000:

| Number | What it is | In the example |
| --- | --- | --- |
| **MAPE** | the average miss as a share of the rent. **The lowest MAPE wins.** | 10% |
| **MAE** | the average miss in SAR | 10,000 SAR |
| **Within 15%** | the share of houses guessed within 15% of their rent | counts: 10% is under 15% |

**Every model learns the log of the rent.** It then turns its guess back into SAR with `exp`. On the log scale, a model cares about the miss in percent: 10,000 SAR off a 40,000 rent is a big miss, but off a 400,000 rent it is small.

### Step 13: the baselines

A baseline is the simplest possible guess. If a clever model can't beat "the usual rent in that city", it is useless.

| Practice exams (1,114 houses) | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| B1: knows only the city | 43.8% | 37,636 | 21.8% |
| B2: knows the city and the size | 41.4% | 35,357 | 21.8% |

Adding the size helps only a little, as step 7 predicted. The score to beat is B2's 41.4%.

### Step 14: Ridge regression

Ridge learns one weight per input and adds the weighted inputs up. Some inputs say almost the same thing: `total_rooms` is the sum of the three room counts. Plain linear regression can then give silly weights, such as +1,000 to one input and −1,000 to its twin. **Ridge keeps every weight small**, and `alpha` sets how strongly.

**Getting the inputs ready:**

- **City, front and type become yes/no columns** (`OneHotEncoder`). `handle_unknown="ignore"` stops the model from failing on a rare value, such as "Four streets", that is missing from the parts it learned from.
- **The district becomes its typical rent** (`TargetEncoder`), learned from the training parts only.
  - A district seen only a few times leans towards the overall average.
  - A house's own rent is never used to describe that same house.
  - This is how step 7's problem is handled: 99 districts have fewer than 5 houses.
- **All numbers are put on one scale** (`StandardScaler`). Ridge can then treat `size_per_bedroom` (about 80) and `is_new` (0 or 1) fairly.

| Ridge, practice exams | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| alpha = 0.1 | 23.6% | 22,405 | 44.6% |
| **alpha = 1 (kept)** | **23.6%** | **22,406** | **44.9%** |
| alpha = 10 | 23.7% | 22,464 | 45.3% |
| alpha = 100 | 25.4% | 23,896 | 43.1% |

### Step 15: gradient boosting

Gradient boosting builds many small decision trees. Each tree asks yes/no questions, such as "Is it in Jeddah? Is it over 400 m²?", and each new tree corrects part of the mistakes of the trees before it. Unlike a weighted sum, trees can learn combinations of inputs. They use the same encoders, but no scaling.

| Learning rate / leaves per tree / trees | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| **0.05 / 15 / 200 (kept)** | **23.1%** | **22,217** | **46.8%** |
| 0.05 / 31 / 200 | 23.7% | 22,666 | 48.6% |
| 0.1 / 15 / 200 | 24.0% | 22,673 | 45.6% |
| 0.05 / 15 / 500 | 24.2% | 22,706 | 46.1% |
| 0.1 / 31 / 200 | 24.7% | 23,236 | 45.5% |
| 0.05 / 31 / 500 | 24.9% | 23,368 | 45.0% |
| 0.1 / 15 / 500 | 25.3% | 23,296 | 44.5% |
| 0.1 / 31 / 500 | 25.6% | 23,696 | 44.6% |

**The most careful setting won.** More trees made it worse: with only 1,114 houses, extra trees start memorising the training houses instead of learning general rules.

### Step 16: the first comparison

Both models almost halve the baselines' error, from 41% to about 23%. Boosting led Ridge by only 0.5 points. The plan's rule was to choose Ridge when the two are within about 1 point, because it is simpler and runs easily in a browser. Before choosing, step 17 looked for ways to miss less.

### Step 17: where the model misses, and how to miss less

**Ridge's misses on the practice exams:**

| By city | MAPE |
| --- | --- |
| Al Khobar | 29.6% |
| Jeddah | 26.5% |
| Riyadh | 22.7% |
| Dammam | 18.0% |

| By rent (SAR) | 15,000 to 50,000 | 50,000 to 65,000 | 65,000 to 90,000 | 90,000 to 130,000 | 130,000 to 450,000 |
| --- | --- | --- | --- | --- | --- |
| MAPE | 31.8% | 20.8% | 19.1% | 17.9% | 27.1% |

- **The guesses are pulled towards the middle.** The cheapest and the most expensive houses miss most.
- **The worst 5% of houses make 21% of all the error.** Most are big houses at low prices, and only the description says why: "needs some repairs", "second floor unfinished", "an old traditional house". A few are odd ads, such as one offered for sale or for rent.
- **29 district names exist in more than one city.** They are used by 286 houses, a quarter of the training data. The same name in Riyadh and in Jeddah was being treated as one district with one typical rent.

**Fix 1: keep districts apart by city.** Joining the city to the district name, as in `Riyadh|الروضه`, turned 160 district names into 191 districts.

**Fix 2: average the two models.** Ridge sees straight-line effects and the trees see combinations, so they make different mistakes. Take a house that rents for 100,000 SAR:

- Ridge guesses 120,000 SAR (+20%).
- Boosting guesses 90,000 SAR (−10%).
- Their average on the log scale is about 104,000 SAR (+4%).

`VotingRegressor` asks both models and averages their guesses.

| Practice exams (1,114 houses) | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| **Average of both, districts by city** | **21.6%** | **20,716** | **50.4%** |
| Boosting, districts by city | 22.4% | 21,496 | 49.6% |
| Ridge, districts by city | 22.9% | 21,725 | 46.4% |
| Boosting | 23.1% | 22,217 | 46.8% |
| Ridge | 23.6% | 22,406 | 44.9% |
| B2: city and size | 41.4% | 35,357 | 21.8% |
| B1: city only | 43.8% | 37,636 | 21.8% |

**Tried on the same five parts, and dropped because they didn't help:**

- condition words (repairs, old, unfinished): 23.9%, because only 1 to 14 houses mention each one;
- seven more keyword flags (luxury, garden, sea and others): 23.5%;
- a separate size effect for each city: 23.6%.

**The choice:** the average of both, with districts kept apart by city. It was more than 1 point better than Ridge.

**One caution:** about 15 ideas were tried on the same five parts and the best was kept, so its 21.6% is a little optimistic. Only the final exam gives an honest number.

### Step 18: the final exam

The chosen model learned from all 1,114 training houses and guessed the 304 test houses once. **Nothing was changed after this.** Changing the model because of this score would turn the test into one more practice exam, and the score would stop being honest.

| Final exam (304 houses) | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| **Average of both** | **23.1%** | **22,871** | **46.4%** |
| B2: city and size, for comparison | 38.8% | 34,562 | 24.7% |

| By city | Houses | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- | --- |
| Riyadh | 175 | 24.7% | 24,148 | 42.3% |
| Jeddah | 87 | 21.8% | 24,536 | 47.1% |
| Dammam | 23 | 15.6% | 9,769 | 78.3% |
| Al Khobar | 19 | 22.8% | 19,347 | 42.1% |

- **The exam is 1.5 points worse than the practice exams** (23.1% against 21.6%), as expected: the practice score was the best of about 15 tries.
- **Dammam and Al Khobar** rest on only 23 and 19 houses, so their numbers are rough.
- **The score holds** for yearly rents between 10,000 and 500,000 SAR, in the 2021 market.

---

## Phase 4: The model in the app

### Step 19: the model for the app

**Why Ridge, not the average of both.** Ridge is one weighted sum. Its numbers fit in a small file and a few lines of JavaScript. The average would also need boosting's 200 trees in the browser. This choice was made before Ridge took the exam, so Ridge's exam score is honest:

| Final exam (304 houses) | MAPE | MAE (SAR) | Within 15% |
| --- | --- | --- | --- |
| **Ridge, the model the app runs** | **23.1%** | **22,998** | **46.1%** |
| Average of both | 23.1% | 22,871 | 46.4% |

**Learning from every house.** With the exam over, the app's model learned from all 1,418 clean houses, training and test together. More houses give better typical rents per district. Its score stays the one above.

**What the app gets.** Not a scikit-learn model, but a list of numbers in `frontend/src/data/rent-model.json`, under 10 KB:

- one base number;
- 4 city numbers, 10 front numbers and 2 type numbers;
- 203 district numbers, plus one for an unknown district;
- 25 weights for the numeric inputs;
- the sizes the model learned from, 100 to 1,652 m².

The app works out the rent like this:

```
log(rent) = base + city + front + type + district + Σ (weight × input)
rent      = exp(log(rent))
```

- **The scaler is folded into the numbers.** Each weight is divided by its column's scale, and the column means move into the base, so the app needs no `StandardScaler`.
- **An unknown district** gets the value the target encoder gives it: the average over all houses.
- **The numbers are shortened** to 6 significant digits. That keeps the file small and changes no rent by more than 0.001%.

**Checks that the file matches scikit-learn:**

- **Every clean house:** worked out from the file the way the app does it, all 1,418 houses get the same rent as scikit-learn. The largest gap is 0.00056%.
- **Two made-up houses,** not from the data, whose rents the app's tests check in `frontend/src/utils/rentModel.test.js`:
  - a new 400 m² Riyadh villa in Al Malqa with an annex: 123,468.08 SAR, which the form shows as 123,500;
  - a 10-year-old 300 m² Jeddah duplex in a district the data doesn't have: 49,742.77 SAR.

**When the district is unknown, the error rises.** On the exam houses with every district made unknown, Ridge is off by 31.7% on average (29,449 SAR), and 31.9% of its guesses fall within 15%. So the app says when it doesn't know the district.

**The district list for the form.** Step 19 also writes `frontend/src/data/districts.json`: the 203 districts the model knows, grouped by city (Riyadh 105, Jeddah 48, Dammam 26, Al Khobar 24).

- **Two names for each district.** Each pairs an English name, which the form shows and saves, with the Arabic spelling the ads use most, which leads the app to the model's number for that district.
- **The English names were written by hand** in a table in the notebook. To correct one, change the table and run the notebook again.
- **Checks in the notebook** make sure every district has exactly one English name, and that no city has two districts with the same name.

**How the app uses it** (FR-ADD-13 to FR-ADD-15, FR-RNT-01 to FR-RNT-07):

- **Always visible.** The Add and Edit forms show the suggestion beside Yearly rent, and it updates as the fields change.
- **Rounded.** The suggestion is rounded to the nearest 500 SAR.
- **"Use this rent"** copies it into the field. The suggestion never changes the field by itself.
- **Suggests nothing** until the city, size, age and room counts are filled in, and for sizes outside 100 to 1,652 m², where a weighted sum gives absurd rents.
- **Typo warning.** It warns when the entered rent is more than 3 times the suggestion or under a third of it. That flags 0.3% of real rents, and catches an extra or a missing zero. The warning never stops Save.
- **A note** says when the district is not in the 2021 data.
- **Fails safely.** The file loads only when a form first opens. If it can't load, the form says so and works as before.
- **Shown as a suggestion, never a valuation:** "Based on 2021 listings. Indicative only, not a valuation."

---

## Limits

- **The market is from 2021.** Rents have changed since, so the suggestion is a starting point, not a price.
- **Only typical houses.** The model knows yearly rents from 10,000 to 500,000 SAR and sizes from 100 to 1,652 m².
- **Small cities, rough numbers.** Dammam and Al Khobar have few houses, so their scores are rough.
- **Condition is invisible.** The biggest misses are houses in poor condition, which only the description reveals. About 40% of the descriptions are cut short.
- **Guesses lean to the middle.** Very cheap and very expensive houses are guessed less well.
- **English names are ours.** The English district names were written by the team and may not match official spellings.
- **Keep the app's properties out of training.** None of the portfolio's sample properties may be among the training houses (rule in [`README.md`](README.md)).

## Data downloaded but not used

Two more sets were downloaded on 16 October: 12,290 villa rentals from Aqar in 2023, and 190 Riyadh villas from Bayut in 2024. They lack the amenity and description columns this model uses, so they were left out. They live in `ai-model/data-raw/`, which git ignores.

## Running it again

1. Download the CSV into `ai-model/data-raw/`. Git ignores that folder.
2. Install the libraries: `pip install -r requirements.txt`.
3. Open `prepare.ipynb`, restart the kernel and click Run All. The numbers come out the same on every run.
4. Step 19 rewrites `rent-model.json` and `districts.json`. If the two made-up rents change, copy them into `frontend/src/utils/rentModel.test.js`.
5. Click Clear All Outputs before committing: the outputs show rows of the dataset.

`docs/ai-usage.md` records which parts of the notebook and this write-up an AI tool produced.
