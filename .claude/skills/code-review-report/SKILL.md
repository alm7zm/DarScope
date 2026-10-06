---
name: code-review-report
description: Review the Darscope frontend code for security, performance, code quality and code reuse, and write docs/code-review.md, a course deliverable. Use when the user asks for the code review.
---

Produce `docs/code-review.md` (deliverable PD-06). Review `frontend/src/` and `frontend/scripts/`. Do not review or change `backend/`.

Read the code itself. Report only what you can point to in a file. Do not change any code during the review.

## The four areas the course brief names

**Security**
- Secrets, keys or tokens anywhere in the repository (NFR-SEC-01)
- User text rendered as HTML, or any use of `dangerouslySetInnerHTML` (NFR-SEC-03)
- Personal data in the seed files: real names, phone numbers, links, email addresses (NFR-SEC-02)
- Network requests other than GET for the app's own files and the model files, and any analytics or cookies (IF-01 to IF-03)
- Dependencies: run `npm audit` in `frontend/` and include its result (NFR-SEC-05)
- Input checks that the form applies but the data service does not (NFR-REL-03)

**Performance**
- The AI library or the market reference file loaded before they are needed (NFR-PERF-04, FR-DAT-07)
- Work repeated on every render that could be memoised or moved out
- Search without the 300 ms delay, or filtering slower than NFR-PERF-02 allows
- Bundle size against NFR-PERF-07: run `npm run build` and quote the sizes it prints

**Code quality**
- Logic inside pages or components that belongs in `src/utils/`
- State changed in place (NFR-REL-04)
- Missing error handling, dead code, unclear names, components past about 250 lines
- Accessibility gaps against SRS section 10.3
- Requirements the code claims but does not fully meet, and code paths with no test

**Code reuse**
- Duplicated logic, markup or styles that should be one function or component
- Constants or messages repeated in components that belong in `src/constants/` (NFR-MNT-04)
- Shared components that are bypassed

## The report

Give each finding an ID (`CR-01`, `CR-02`, ...), its area, a severity (High, Medium or Low), the file and line, what is wrong, why it matters, and the fix you suggest.

Write `docs/code-review.md` with:

1. The date, the commit reviewed (`git rev-parse --short HEAD`), and the tool used.
2. A summary table: the count of findings by area and severity.
3. The findings, grouped by area, most severe first.
4. A decisions table with one row per finding and the columns ID, Severity, Decision and Reason. Leave Decision and Reason empty.

Then ask the user which findings to fix. After fixing, set each row's Decision to "Fixed", or to "Accepted" with the team's reason. The team decides what to accept: do not fill in a reason yourself.

If an area has no findings, say so and state what you checked. Do not invent findings to fill a section.
