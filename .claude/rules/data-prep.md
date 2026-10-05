---
paths:
  - "frontend/scripts/**/*"
  - "frontend/src/data/**/*"
---

# Data preparation rules

This file condenses `docs/SRS.md` section 3.4 and Appendix A. The SRS wins if they differ. Appendix A holds the nine steps, the column mapping (A.2) and the Arabic value table (A.3): follow them exactly.

## What the script does

`frontend/scripts/prepare-data.mjs` runs with `npm run prepare-data`. It turns the raw Kaggle CSV, "Saudi Arabia Real Estate (AQAR)", into the two JSON files in `frontend/src/data/`. It is a one-off tool, not part of the app.

- Keep the raw CSV in `frontend/data-raw/`, and keep that folder in `.gitignore`. Never commit the raw file.
- The app never reads the raw CSV. It loads only the two JSON files.
- If the raw CSV is missing, stop and ask the user to download it. Do not invent data in its place.

## Rules

- **Profile first.** Step 1 prints the row count, the duplicate count, the distinct values of `city` and `front`, and the minimum and maximum of each number column. Save that report in `docs/`. Confirm the real column names from it before mapping: the SRS flags `property_age`, `garage`, `driver_room` and `maid_room` as unconfirmed.
- **Parse the CSV properly.** Descriptions contain commas, quotes and line breaks. Use a real CSV parser, never `split(',')`.
- **Remove exact duplicate rows.** A published analysis found that about 60% of the rows are duplicates.
- **Strip personal data** from every description: phone numbers (7 or more digits in a row, in Western or Arabic-Indic digits), web links and email addresses (NFR-SEC-02).
- **Keep Arabic text as written.** Map `city` and `front` with table A.3. Leave `district` and `description` untouched apart from the cleaning above.
- **Be repeatable.** Choose the seed with a fixed random seed and a stable sort, so running the script twice gives identical files.
- **Seed composition.** 40 properties with IDs RP-0001 to RP-0040, 10 per city. Where a city has fewer than 30 clean listings, take 5 from it and top up from Riyadh. Set 28 to Occupied, 9 to Vacant and 3 to Under maintenance. Each Occupied property gets an invented tenant name and lease dates.
- **Tenant names are fictional.** Make them plainly invented. Never copy a name from the dataset.
- **Market reference.** Every other cleaned, unique listing, with `refId` from MR-0001. No listing appears in both files.
- **Print the final counts** and record them in the README.

## Open points

- The SRS assumes every non-duplex listing is a villa (assumption A-06). Read a sample of descriptions during profiling, and tell the user what you find before relying on it.
- The dataset's licence is unconfirmed (open question 3). Tell the user before the generated files are committed.
