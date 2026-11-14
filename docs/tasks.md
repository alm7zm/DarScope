# Darscope tasks

What is left before the Part 2 deadline, 14 November 2026, most important first. [SRS.md](SRS.md),
version 1.2, is the specification.

To take a task, write your name in **Owner**. Add ✔ when it is done.

## Done

- Part 1: every Must requirement, the rent suggestion on the Add and Edit forms, and the Should
  requirements listed in [features.md](features.md).
- Part 2: the Spring server with its JUnit and Mockito tests, and the frontend calling it
  ([backend-plan.md](backend-plan.md)).
- Every team member's name and student ID on the About page.

## Withdrawn

On 14 November 2026, SRS version 1.2 withdrew every requirement the app did not meet: the 40
sample properties from the dataset, card view, search by meaning, comparable listings, the
fair-rent estimate, Market insights, plain-language input, CSV export, bulk delete, the dark theme
and some smaller items. The SRS's "Changes in version 1.2" table lists them all. The app starts
from 8 hand-written properties instead.

## Left to do

| # | Task | Owner |
| --- | --- | --- |
| 1 | Merge `dev` into `main` through a pull request, so that the submitted branch holds the server. Keep `dev` afterwards. | |
| 2 | The two slides: the architecture, and a REST route table like lab 14's ([backend-plan.md](backend-plan.md), section 11) | |
| 3 | Rehearse the demo with [backend-plan.md](backend-plan.md), section 10, on the laptop you will present from, with the H2 profile ready in case the network fails | |
| 4 | Decide each Low finding in [code-review.md](code-review.md): Fixed, or Accepted with the team's reason. CR-06, CR-07 and CR-14 are already fixed. | |
| 5 | Fill in the manual checks in [test-report.md](test-report.md): AC-16 (keyboard only), AC-17 (reload), AC-23 (360 px) and the browsers | |
| 6 | Optional: let the server accept a property sent without an amenity. Today such a request gets 400 "The request could not be read". The app always sends all 13, so only a hand-written request, such as one from Postman, is affected. One line in `backend/src/main/resources/application.properties` fixes it: `spring.jackson.deserialization.fail-on-null-for-primitives=false`. | |
| 7 | Optional: ask the instructor the open questions in SRS section 15.3, above all whether data derived from the dataset may be published | |

## How we work

- One owner per file, so that two people do not change the same file.
- Two branches always exist: `main`, which holds what is submitted, and `dev`, where the work
  comes together. Build each feature on one short-lived branch off `dev`, merge it back through a
  pull request that another member reads, then delete the branch. Do not stack pull requests.
- Before every pull request, run `npm test`, `npm run lint` and `npm run format` inside `frontend/`,
  and `mvnw.cmd test` inside `backend/`.
