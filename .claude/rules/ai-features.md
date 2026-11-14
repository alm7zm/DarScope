---
paths:
  - "frontend/src/constants/market*"
  - "frontend/src/utils/rentModel*"
  - "frontend/src/services/rentModelService*"
  - "frontend/src/components/properties/RentSuggestion*"
  - "ai-model/**/*"
---

# AI features

This file condenses `docs/SRS.md` section 7.6. The SRS wins if they differ.

The rent model is the app's one AI feature. Its requirements are Could, and it must never stop a Must feature from working when it fails (NFR-REL-02). SRS version 1.2 withdrew search by meaning, comparable listings, the fair-rent estimate, Market insights and plain-language input (sections 7.1 to 7.5). Do not build them unless the user says the team has brought them back.

## What the model is

Describe it accurately in code comments, the interface and the documents. It is the only model the team trains: Ridge regression in `ai-model/prepare.ipynb`, learned from the 2021 listings. The app runs its exported weights for the rent suggestion on the Add and Edit forms (FR-ADD-13, SRS 7.6). Call it a suggestion from 2021 listings, never a valuation.

## Constants

Keep these in `frontend/src/constants/market.js` and nowhere else.

| Constant | Value |
| --- | --- |
| `RENT_ROUNDING_SAR` | 500: a suggestion is rounded to the nearest 500 SAR |
| `RENT_CHECK_FACTOR` | 3: a rent more than 3 times the suggestion, or under a third of it, gets a warning |

## Rent model (SRS 7.6, FR-ADD-13)

- The weights are `frontend/src/data/rent-model.json`, written by step 19 of `ai-model/prepare.ipynb`. Never edit the file by hand. After exporting it again, copy the two rents step 19 prints into `utils/rentModel.test.js`.
- `utils/rentModel.js` turns a property into the model's inputs the way the notebook does (steps 5, 17 and 19). Change both together, or the app and the notebook disagree.
- Load the file only in `services/rentModelService.js`, with a dynamic `import()`, when a form first shows the suggestion (FR-RNT-02).
- The suggestion is always visible beside Yearly rent on Add and Edit, and follows the values as they change. It is not a live region: it changes with every keystroke. "Use this rent" copies it into the field, which it never changes by itself (FR-ADD-13).
- Round to the nearest 500 SAR (`RENT_ROUNDING_SAR`) and show the note "Based on 2021 listings. Indicative only, not a valuation." (`TEXT.estimateDisclaimer` in `constants/messages.js`).
- Warn when the entered rent is more than `RENT_CHECK_FACTOR` (3) times the suggestion or under a third of it, without stopping Save (FR-RNT-07).
- The District dropdown's names come from `frontend/src/data/districts.json`, also written by step 19. It pairs each district's English name, which the form shows and saves, with the Arabic spelling the model learned, and `modelInputs` looks the English name up, so every district picked from the list is one the model knows (FR-ADD-14, FR-RNT-01). The English names are a hand-written table in step 19; correct a spelling there, never in the JSON file.
- Compare district names after SRS Appendix B.4, including step 8, and only within their city (FR-RNT-01).
- Suggest nothing outside the file's `sizeRange`, say when the district is unknown, and fail safely when the file cannot load (FR-RNT-03 to FR-RNT-06). The messages are in Appendix C.2.
