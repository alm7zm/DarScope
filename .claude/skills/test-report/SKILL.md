---
name: test-report
description: Run the Darscope frontend tests with coverage and write docs/test-report.md, the course deliverable that proves the tests were run. Use when the user asks for the test report or for a full test run before submission.
---

Produce `docs/test-report.md` (deliverable PD-05, requirement NFR-TST-05). Every number in it must come from a run you just made.

1. In `frontend/`, run `npm test`, then `npm run coverage`. Keep the complete output of both.
2. If a test fails, stop. Show the failures and ask whether to fix them first. Never write a report that hides or rewords a failure.
3. Write `docs/test-report.md` with these sections:
   - **Run details**: the date and time, the Node and npm versions, and the commands used.
   - **Summary**: test files, tests, passed, failed, skipped, and the duration.
   - **Coverage**: the summary table, the statement coverage against the 70% target in NFR-TST-06, and the five least-covered files.
   - **Coverage of the SRS**: a table with one row for each area in NFR-TST-02 and NFR-TST-03, naming the test files that cover it. Mark any area with no tests.
   - **Acceptance scenarios**: which of AC-01 to AC-23 have an automated test, and which were checked by hand, by whom and when. Leave the manual entries blank for the team to fill in. Do not fill them in yourself.
   - **Raw output**: the complete output of both commands in fenced code blocks.
4. Tell the user what the report shows, including every gap.
