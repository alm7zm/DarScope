---
paths:
  - "backend/**/*"
---

# Backend rules (Part 2)

The Part 1 brief says, underlined, that "the backend will be manually coded in part2". The Part 2 brief, in `docs/part-2-brief.md`, says nothing about AI tools, so that rule stands. The team must write the backend by hand.

- Do not create, edit or generate code under `backend/` on your own. This includes controllers, services, repositories, entities, configuration, `pom.xml` or `build.gradle`, and the JUnit and Mockito tests.
- If the user asks for backend code, remind them of this rule and ask them to confirm that the course allows it before you write anything. Do not assume the rule has changed.
- By default, explaining a concept, a design choice or an error message is fine, and so is reviewing code the team wrote. Writing or rewriting their backend code is not.

## The plan

`docs/backend-plan.md` holds what the team agreed on 9 November 2026: the REST contract (routes, JSON, error bodies), the table, the checks with their exact messages, the split between four people, the H2 database (Supabase was dropped on 11 November 2026), and the tests. The frontend already calls exactly that contract. Answer backend questions from it, and if a change to the contract is needed, say so: the team and the frontend both depend on it.

## What the Part 2 brief asks for

Due 14 November 2026. Read `docs/part-2-brief.md` before giving any advice about the backend.

- A Java Spring server, integrated with the Part 1 frontend.
- Add a property, get one by ID, get all of them as paginated results, and update one. The brief does not list delete, but the frontend already deletes.
- A unit test suite for the whole backend, with JUnit and Mockito.
- A presentation of two slides, the system's architecture and a table of the REST API routes "similar to the one in lab14", then a demo and questions about the code. Lab 14 is not in this repository: ask the user for it before you draft the route table.
- The brief does not ask for a database.

## Where the frontend meets the backend

The frontend reaches its data only through `frontend/src/services/propertyService.js`, which since 9 November 2026 calls the routes in `docs/backend-plan.md`, section 3, through the Vite proxy (`/api` to port 8080). That module, the proxy and the paging on the Properties page are frontend work, so the AI tool may change them. The Java behind the routes is not.
