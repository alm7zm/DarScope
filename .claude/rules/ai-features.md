---
paths:
  - "frontend/src/services/embeddingService*"
  - "frontend/src/services/marketService*"
  - "frontend/src/components/market/**/*"
  - "frontend/src/pages/MarketInsightsPage*"
  - "frontend/src/utils/similarity*"
  - "frontend/src/utils/estimate*"
  - "frontend/src/constants/market*"
---

# AI features

This file condenses `docs/SRS.md` section 7 and Appendix B. The SRS wins if they differ. Appendix B holds the full algorithms and worked examples.

All of these are Should or Could. Build them only after every Must requirement passes. None may break a Must feature when it fails (NFR-REL-02).

## What is and is not a trained model

Describe these features accurately in code comments, the interface and the documents:

- Search by meaning uses a ready-made neural language model. The team trains no model.
- Comparable listings and the fair-rent estimate use a nearest-neighbour method with fixed weights. Nothing is trained.
- Market insights are plain statistics, not AI.
- A rent-prediction model is planned in `ai-model/`. It will be the only model the team trains. It is not built yet, the app does not use it, and the SRS has no requirements for it: do not describe any feature as using it until that changes.

## Constants

Keep these in `frontend/src/constants/market.js` and nowhere else (FR-EST-06).

| Constant | Value |
| --- | --- |
| Comparables shown | 5 |
| Minimum comparables for an estimate | 3 |
| Size window | 50% to 200% of the property's size |
| Below market | rent under 85% of the estimate |
| Above market | rent over 115% of the estimate |
| Estimate rounding | nearest 500 SAR |
| Results for search by meaning | 20 |

## Comparable listings (SRS 7.2, Appendix B.2)

1. Start with the market listings in the property's city.
2. Keep listings whose size is within the size window.
3. If at least 5 of those have the property's type, keep only that type.
4. If fewer than 3 remain, show "Not enough market data" and no estimate (FR-CMP-05).
5. Give each remaining listing a distance from the weighted terms below. Lower is closer.
6. Take the 5 with the lowest distance. Break ties by the smaller size difference, then by `refId`.
7. Show similarity as (1 − distance) × 100, rounded to a whole percentage.

| Term | Value, from 0 to 1 | Weight |
| --- | --- | --- |
| Size | Absolute size difference, divided by the larger size | 0.35 |
| Bedrooms | Absolute difference, capped at 4, divided by 4 | 0.15 |
| Bathrooms | Absolute difference, capped at 4, divided by 4 | 0.05 |
| Living rooms | Absolute difference, capped at 4, divided by 4 | 0.05 |
| Age | Absolute difference in years, capped at 20, divided by 20 | 0.10 |
| Amenities | 1 minus (amenities both have, divided by amenities either has); 0 when neither has any | 0.15 |
| District | 0 when the normalised district names are equal, otherwise 1 | 0.15 |

- Compare district names after the normalisation in Appendix B.4, including step 8.
- Title the panel "2021 market listings" and say they are not company properties (FR-CMP-04).

## Fair-rent estimate (SRS 7.3, Appendix B.3)

1. Take the median of the comparables' yearly rents. With an even count, use the mean of the two middle values.
2. Round to the nearest 500 SAR. This is the estimate.
3. Divide the property's rent by the estimate. Under 0.85 is Below market, 0.85 to 1.15 inclusive is In line, over 1.15 is Above market.
4. Show the estimate, the lowest and highest comparable rent, the label, and the difference in SAR and as a percentage (FR-EST-02, FR-EST-04).
5. Always show the note "Based on 2021 listings. Indicative only, not a valuation." (FR-EST-05).

## Worked examples to use as tests

- Appendix B.2: a 400 m² villa against a 360 m² listing in the same district gives distance 0.16 and similarity 84%.
- Appendix B.3: rents of 90,000, 100,000, 104,000, 110,000 and 130,000 SAR give an estimate of 104,000 SAR. A property at 125,000 SAR has ratio 1.20 and is Above market by 21,000 SAR (20%).

## Search by meaning (SRS 7.1, Appendix B.1)

- Model: `Xenova/multilingual-e5-small`, run with `@huggingface/transformers`. Load the 8-bit quantised weights with `{ dtype: 'q8' }`, never the full-precision file (FR-AIS-12).
- Import the library with a dynamic `import()` inside `frontend/src/services/embeddingService.js`, the one module that wraps the model, only after the user turns the switch on and agrees to the download (FR-AIS-02, NFR-PERF-04). Before the download, show the Appendix C message that names its size.
- Show download progress. Keyword search stays usable meanwhile (FR-AIS-03).
- Build each property's search text with the template in Appendix B.1: the structured facts first, then the description.
- Prefix property texts with `passage: ` and queries with `query: `. Use mean pooling and normalise the embeddings. Similarity is the dot product.
- Apply the filters first, then rank what passes. Show the 20 closest with a relevance bar scaled to the best match (FR-AIS-06, FR-AIS-07).
- Rank by order only. The model's scores cluster between 0.7 and 1.0, so never use a fixed cut-off score.
- Keep each embedding in memory with the text it was built from. Embed a property again only when that text changes, and drop the embedding when the property is deleted (FR-AIS-08).
- If the model cannot load or run: say so, turn the switch off, and fall back to keyword search (FR-AIS-09).
- No query text or property data leaves the browser. No API key, ever (FR-AIS-10).
- Never commit model files. They are fetched from their public host at run time (IF-04).

## Market insights (SRS 7.4)

From the market reference set: listings per city, median yearly rent per city, median yearly rent by number of bedrooms, and the 10 districts with the highest median rent among districts with at least 5 listings. Beside each city's market median, show the portfolio's median. Name the data source, the year 2021 and the number of listings (FR-INS-01 to FR-INS-03).

## Plain-language input (SRS 7.5)

This is a Could, and it works only where the browser offers Chrome's on-device Prompt API. Detect it with `LanguageModel.availability()` and hide the box everywhere else. It accepts English, not Arabic. The user reviews every filled value, and nothing is saved until Save (FR-NLI-01 to FR-NLI-04).
