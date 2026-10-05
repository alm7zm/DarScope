---
paths:
  - "frontend/**/*"
---

# Frontend rules

This file condenses `docs/SRS.md` sections 4 to 6 and 8 to 10. The SRS wins if they differ.

## Structure

- Organise code by feature under `src/features/` (dashboard, properties, market, about). Shared pieces go in `src/components/` (NFR-MNT-03).
- Field checks, filtering, sorting, Arabic normalisation, similarity and the estimate are pure functions in `src/lib/`, with no React or DOM code, so they can be unit-tested (NFR-MNT-01).
- Choices, thresholds, labels, messages and team details live in `src/config/`. Never repeat them inside components (NFR-MNT-04).
  - `options.js`: cities, property types, statuses, front directions, amenities with their labels
  - `messages.js`: every fixed message, copied exactly from SRS Appendix C
  - `market.js`: the constants in `.claude/rules/ai-features.md`
  - `team.js`: team names and student IDs (FR-ABT-06)
- Use function components and hooks. Split a component file that grows past about 250 lines.
- State is one portfolio context with a reducer in `src/state/`. Its async actions call `propertyService`. Components never import the service's data or the JSON files.

## Routing and layout

- Use React Router with the URLs in `.claude/rules/product.md`. Navigation never reloads the whole app, and Back and Forward work (FR-NAV-03, FR-NAV-06).
- Every page shares one layout: a header with the app name and menu, the page content, and a footer with the course, the data credit and the notice that changes last only until the page reloads (UI-01, FR-DAT-06).
- Mark the current menu item visually and with `aria-current="page"` (FR-NAV-04).
- Each page has exactly one `h1` that names it, and sets the tab title in the form "Properties · Darscope" (UI-02, FR-NAV-09).
- Below 768 px the menu collapses behind a toggle button (FR-NAV-08).

## Dashboard

- Show total properties; the number Occupied, Vacant and Under maintenance; the occupancy rate; yearly rent from occupied properties; and potential yearly rent from all properties (FR-DSH-01).
- Occupancy rate is occupied divided by total, as a whole percentage. With no properties, show a dash (FR-DSH-02).
- Recalculate every figure at once after an add, update, delete, undo or reset (FR-DSH-03).

## List and detail

- Table columns, in order: ID, City, District, Type, Size, Bedrooms, Yearly rent, Status, Actions. Each row offers View, Edit and Delete (FR-LST-02, FR-LST-03).
- Show the count as "Showing X of Y properties" (FR-LST-04).
- Format rent with thousands separators and "SAR", and size with "m²" (FR-LST-06).
- Show status as a word with a coloured badge, never by colour alone (FR-LST-08).
- The detail page groups fields under Location, Building, Amenities, Rent and tenancy, Description, Record. Show tenant and lease details only when the status is Occupied (FR-DET-01, FR-DET-04).
- A missing or deleted ID shows "Property not found" with a link to the list (FR-DET-03).

## Forms

- One `PropertyForm` component serves both Add and Edit.
- Group the fields under Location, Building, Amenities, Rent and tenancy, Description. Put labels above inputs, mark required fields, and show the unit (m², SAR, years) beside number fields (UI-03, UI-04, FR-ADD-02).
- Validate on Save with `src/lib/validation.js`. If any check fails: save nothing, show each error beside its field, move focus to the first invalid field, and keep everything the user typed (FR-ADD-03).
- Enable tenant name and lease dates only when Status is Occupied (FR-ADD-07).
- After a successful add or update, open the detail page and show the confirmation message (FR-ADD-05, FR-UPD-04).
- When the status leaves Occupied on Edit, warn that tenant and lease details will be cleared (FR-UPD-07).

## Delete

- Delete always opens a confirmation dialog that names the property by ID, type, district and city. Cancel has focus first, and Esc cancels (FR-DEL-02).
- The dialog keeps focus inside while open and returns focus to the control that opened it (NFR-ACC-06).
- After a delete from the detail page, return to the list (FR-DEL-05).

## Search, filters and sort

- Keyword search keeps a property when every word typed appears, ignoring letter case, in at least one of: ID, city, district, type, status, tenant name, description, or the labels of the amenities it has (FR-SRC-02).
- Update results 300 ms after typing stops, and at once on Enter (FR-SRC-03).
- Filters: City (one or more), Status (one or more), Type, yearly rent from and to, size from and to, minimum bedrooms. The search box and all filters combine with AND (FR-SRC-04, FR-SRC-05).
- A range whose "from" is above its "to" shows a message and is not applied (FR-SRC-07).
- Arabic words must be searchable (FR-SRC-08). Normalise both the query and the text with `src/lib/arabic.js`, following SRS Appendix B.4. Normalise for matching only; always display the original text.
- Default sort is Last updated, newest first (FR-SRC-09).

## Arabic text

- Put `dir="auto"` on every element that shows district, description or tenant name, so Arabic displays right-to-left inside the English layout (FR-LST-07).
- Add `lang="ar"` when the text contains Arabic letters (NFR-ACC-07).
- Never reverse, pad or reorder strings by hand to fix direction.

## Messages

- Use the exact wording in SRS Appendix C for field errors and fixed messages. Do not rephrase them.
- Show a confirmation message after every add, update, delete, undo and reset. It disappears after 5 seconds, or 8 seconds when it offers Undo, and can be dismissed sooner (FR-FBK-01).
- Announce messages to screen readers with a live region (FR-FBK-02).
- Wrap the routes in an error boundary that shows an error screen with a Reload button, never a blank page (FR-FBK-03).

## Styling

- Use CSS Modules. Define colours, spacing and type sizes once as CSS variables, and use only those tokens in components (UI-06).
- The layout works from 360 px to 1920 px wide without the page scrolling sideways. Wide tables scroll inside their own frame (NFR-USE-02).
- Primary actions look different from secondary ones, and Delete uses a warning style (UI-05).
- Follow the wireframes and style guide in `docs/design/` once they exist.

## Accessibility

- Every feature works with the keyboard alone, with a visible focus indicator (NFR-ACC-01).
- Text contrast is at least 4.5:1 (NFR-ACC-02).
- Every input has a label, and each error is linked to its field with `aria-describedby` (NFR-ACC-03).
- Use `header`, `nav`, `main` and `footer` landmarks and a logical heading order (NFR-ACC-04).

## Performance

- Load the AI library and the market reference file with dynamic `import()`, only when first needed (NFR-PERF-04, FR-DAT-07).
- Search, filter and sort results appear within 200 ms for 500 properties (NFR-PERF-02).
- The app's own JavaScript, without the AI library, stays under 300 kB compressed (NFR-PERF-07).
