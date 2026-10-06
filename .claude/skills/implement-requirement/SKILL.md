---
name: implement-requirement
description: Build one or more Darscope requirements from docs/SRS.md by ID, with tests. Use when the user names requirement IDs such as FR-ADD-03, or asks to implement a section of the SRS.
argument-hint: "[requirement IDs or SRS section]"
---

Implement these requirements from `docs/SRS.md`: $ARGUMENTS

If no IDs or section were given, ask which requirements to build and stop.

1. **Read.** Open `docs/SRS.md` and read each requirement named, the rest of its table, and every appendix it cites. Restate each requirement in one line so the user can see what you will build.
2. **Check the order.** Look at each requirement's priority. If Must requirements from an earlier step of the build order in `.claude/rules/product.md` are not done, say so before you start a Should or a Could.
3. **Check the scope.** If a requirement needs code under `backend/`, stop and follow `.claude/rules/backend.md`.
4. **Plan.** List the files you will add or change, following the layout in `CLAUDE.md`. Read the rule file for the area first.
5. **Build.** Write the logic as pure functions in `frontend/src/utils/` with unit tests, then the components and pages with component tests. Take expected values and messages from the SRS.
6. **Verify.** Run `npm test` and `npm run lint` in `frontend/`. Fix what fails.
7. **Walk the scenarios.** In SRS section 14, find the acceptance scenarios whose "Covers" column names these IDs. Check each step and expected result against the code.
8. **Report.** List the files changed, the requirement IDs covered, the test result, the scenarios checked, and anything not done or uncertain. Do not call a requirement done if a part of it is missing.
