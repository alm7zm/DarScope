---
paths:
  - "frontend/**/*.test.{js,jsx}"
  - "frontend/vitest.config.*"
  - "frontend/src/test/**/*"
  - "docs/test-report.md"
---

# Testing rules

This file condenses `docs/SRS.md` section 10.8. The SRS wins if they differ. The course brief requires AI-generated tests and proof that they were run.

## Setup

- Use Vitest with React Testing Library and the jsdom environment.
- `npm test` runs every test once and exits. `npm run coverage` adds a coverage summary (NFR-TST-01).
- Put each test file beside the module it tests: `validation.js` and `validation.test.js`.
- Shared fixtures and helpers go in `frontend/src/test/`.

## What must be covered

| Kind | Must cover | Requirement |
| --- | --- | --- |
| Unit tests | Field checks, keyword search, filters, sorting, ID generation, Arabic normalisation, comparables, the estimate | NFR-TST-02 |
| Component tests | The form with valid and invalid input, the list, the delete dialog, the About page | NFR-TST-03 |

Statement coverage of `frontend/src/`, excluding the model wrapper in `src/ai/`, should be at least 70% (NFR-TST-06).

## How to write them

- Test behaviour through the interface: find elements by role and label, as a user would. Do not test implementation details.
- Take expected values from the SRS, not from the code under test. Use the exact messages in Appendix C and the worked examples in Appendix B.
- Cover the edges the SRS names: every boundary of each number range, Occupied without a tenant name, a "from" above a "to", an unknown ID, an empty portfolio, a search with no matches.
- Check that a deleted ID is never issued again (FR-DEL-06, scenario AC-08).
- Include Arabic input in search tests: a district name in Arabic, and spelling variants that Appendix B.4 says must match.
- Never load the real language model in a test. Replace the embedding wrapper with a stub that returns fixed vectors, so tests run offline in seconds (NFR-TST-04).
- Tests must not use the network, the real clock or random values. Use fake timers for the 300 ms search delay and the 8-second undo.
- Start each test from a fresh copy of the data. Tests must not depend on each other or on their order.

## Acceptance scenarios

SRS section 14 lists AC-01 to AC-23. Turn the Must scenarios, AC-01 to AC-17, into integration tests where a test can express them. Name each test after its scenario, for example `AC-07 delete with confirmation`. Scenarios that need a real browser, such as AC-16 (keyboard only) and AC-23 (360 px), stay manual: list them in the test report as manual checks.

## Honest results

- Never weaken, skip or delete a failing test to make the run pass. Fix the code, or tell the user the test is wrong and why.
- Never write expected results into the test report by hand. `docs/test-report.md` holds the real output of the real run, with its date (NFR-TST-05, PD-05).
