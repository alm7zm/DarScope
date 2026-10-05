---
paths:
  - "backend/**/*"
---

# Backend rules (Part 2)

The course brief says the backend "will be manually coded" in Part 2. The team must write it by hand.

- Do not create, edit or generate code under `backend/` on your own. This includes route handlers, models, database schemas, migrations, configuration and backend tests.
- If the user asks for backend code, remind them of this rule and ask them to confirm that the course allows it before you write anything. Do not assume the rule has changed.
- By default, explaining a concept or an error message is fine. Writing or rewriting their backend code is not.
- The Part 2 brief is not in this repository yet. When the user adds it, read it before giving any advice about the backend, and follow what it says about AI tools.

## What Part 1 promises Part 2

The frontend reaches its data only through `frontend/src/services/propertyService.js`. Part 2 replaces the inside of that module with calls to the backend and keeps its function names and return shapes. The contract is in `.claude/rules/data-model.md` and SRS section 8.3. Changing that frontend module to call the backend is frontend work.
