---
paths:
  - "backend/**/*"
---

# Backend rules (Part 2)

The Part 1 brief says, underlined, that "the backend will be manually coded in part2". On 13 November 2026 Muhammad Yawar decided to build the server with AI assistance instead, and Claude Code wrote `backend/`.

- Backend changes are allowed. Record each one in `docs/ai-usage.md`, honestly, because the course asks which AI tool produced each part.
- Keep the code plain and explained in comments: the team must be able to answer the instructor's questions about every line.
- Run `mvnw.cmd test` (or `./mvnw test`) inside `backend/` before you report a change.

## The plan

`docs/backend-plan.md` holds what the team agreed on 9 November 2026: the REST contract (routes, JSON, error bodies), the table, the checks with their exact messages, the split between four people, the Supabase setup, and the tests. The frontend already calls exactly that contract. Answer backend questions from it, and if a change to the contract is needed, say so: the team and the frontend both depend on it.

## What the Part 2 brief asks for

Due 14 November 2026. Read `docs/part-2-brief.md` before giving any advice about the backend.

- A Java Spring server, integrated with the Part 1 frontend.
- Add a property, get one by ID, get all of them as paginated results, and update one. The brief does not list delete, but the frontend already deletes.
- A unit test suite for the whole backend, with JUnit and Mockito.
- A presentation of two slides, the system's architecture and a table of the REST API routes "similar to the one in lab14", then a demo and questions about the code. Lab 14 is not in this repository: ask the user for it before you draft the route table.
- The brief does not ask for a database.

## Where the frontend meets the backend

The frontend reaches its data only through `frontend/src/services/propertyService.js`, which since 9 November 2026 calls the routes in `docs/backend-plan.md`, section 3, through the Vite proxy (`/api` to port 8080). That module, the proxy and the paging on the Properties page are frontend work, so the AI tool may change them. The Java behind the routes is not.
