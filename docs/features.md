# Features

Part of deliverable PD-04 (SRS section 12), with [architecture.md](architecture.md) and the
[README](../README.md). It lists what works in the app on 11 November 2026, with the code behind
each feature and the requirements it meets, from SRS version 1.1. Paths are under
`frontend/src/`. Section 13 lists what is not built yet, and section 14 what SRS 1.1 withdrew.

Since Part 2 the app reads and writes the portfolio through the team's Spring server, whose code
is not in the repository yet. Every feature below has been tested against the in-memory stand-in
for the server (`test/fakePropertyService.js`), and the calls to the real server against a
stubbed `fetch`. The end-to-end check with the server is in `docs/backend-plan.md`, section 10.

Every Must requirement of the course brief works: the menu, adding, updating, deleting,
searching and displaying properties, and the About page. On the frontend side, so do the Part 2
brief's add, search by ID, paginated list and update (section 12). Three Must requirements of the
SRS are only partly met; section 13 lists them.

## 1. Menu and pages

The menu at the top of every page leads to the Dashboard, the property list, Add property and
About. Below 768 px it folds behind a Menu button. Choosing an item or pressing Esc closes it,
and Esc puts focus back on the button. Each page has its own address, the current page is marked
in the menu, and the browser's Back and Forward buttons move between pages without reloading the
app. The tab title names the page, an unknown address shows "Page not found", and a page that
fails shows an error screen with a Reload button instead of a blank page. The footer names the
course and credits the dataset.

- **Code:** `routes/routes.jsx`, `routes/paths.js`, `layouts/AppLayout.jsx`,
  `layouts/NavMenu.jsx`, `layouts/Footer.jsx`, `components/ui/Page.jsx`,
  `pages/NotFoundPage.jsx`, `pages/ErrorPage.jsx`
- **Meets:** FR-NAV-01, FR-NAV-03 to FR-NAV-09, FR-FBK-03, UI-01, UI-02, NFR-ACC-04

## 2. Dashboard

The first page shows the portfolio at a glance: the number of properties, how many are Occupied,
Vacant and Under maintenance, the occupancy rate, the yearly rent from occupied properties and the
rent if every property were let. A table gives the properties, occupied properties and rent of
each city, and "Needs attention" lists every property earning nothing, each linking to its page.
Every figure follows an add, update or delete at once. With no properties, the page shows zeros,
a dash for the rate, and an "Add property" button. If the server cannot be reached, the page says
so.

- **Code:** `pages/DashboardPage.jsx`, `components/dashboard/`, `utils/stats.js`
- **Meets:** FR-DSH-01 to FR-DSH-06, and FR-DSH-07 in part: "View all properties" is there, and
  "Add property" only on an empty Dashboard.

## 3. Property list

`/properties` shows the properties in a table with the columns ID, City, District, Type, Size,
Bedrooms, Yearly rent, Status and Actions, newest first. Each row offers View, Edit and Delete. A
count reads "Showing X of Y properties", rents carry thousands separators and "SAR", sizes "m²",
and each status is a word on a coloured badge. Arabic districts read right to left. At 360 px the
table scrolls sideways inside its frame while the page stays still.

Under the table, Previous and Next move between pages, with "Page 2 of 3 (11 to 20 of 27)"
between them, and "Per page" offers 5, 10, 25 or 50, with 10 by default. With no search, each page
comes from the server. While a search or filter is active, the browser pages the matches. Any
change to the search, the filters or the page size goes back to page 1. If the server cannot be
reached, the page says so.

- **Code:** `pages/PropertyListPage.jsx`, `components/properties/PropertyTable.jsx`,
  `components/ui/Pager.jsx`, `hooks/useServerPage.js`, `components/ui/Badge.jsx`,
  `utils/format.js`, `utils/arabic.js`, `paginate` in `utils/sort.js`
- **Meets:** FR-LST-01 to FR-LST-08, FR-LST-10, NFR-USE-02, NFR-ACC-05, NFR-ACC-07, and Part 2
  brief requirement 4

## 4. Search and filters

A search box above the list finds properties by any word in their ID, city, district, type,
status, tenant, description or amenities, in English or Arabic, ignoring letter case. Arabic
spelling variants of a word match one another. The list follows 300 ms after typing stops, or at
once on Enter. Filters narrow the list by city, status, type, yearly rent from and to, size from
and to, and a minimum number of bedrooms, all at once. A range the wrong way round shows a
message and is ignored. "Clear all" empties the box and every filter. The search runs in the
browser, on the whole portfolio the server sent at start.

- **Code:** `components/search/SearchControls.jsx`, `hooks/usePropertySearch.js`,
  `utils/search.js`, `utils/arabic.js`, `validateFilters` in `utils/validation.js`
- **Meets:** FR-SRC-01 to FR-SRC-08, FR-SRC-11, NFR-PERF-02 (under 4 ms for 500 properties,
  measured on 16 October 2026 for `docs/code-review.md`)

## 5. Property detail

`/properties/:id` shows every field of one property in six groups: Location, Building, Amenities,
Rent and tenancy, Description and Record. The tenant and the lease dates appear only for an
Occupied property. The page offers Edit, Delete and Back to list. An ID that does not exist, or a
property just deleted, shows "Property not found" with a link back to the list. The page asks the
server for the property by its ID, so it always shows the server's copy. If the server cannot be
reached, the page says so.

- **Code:** `pages/PropertyDetailPage.jsx`, `hooks/useServerProperty.js`,
  `components/properties/PropertyDetail.jsx`, `components/properties/PropertyNotFound.jsx`,
  `getById` in `services/propertyService.js`
- **Meets:** FR-DET-01 to FR-DET-04, Part 2 brief requirement 3, and FR-DET-05 in part: the
  amenities the property has are listed, not all 13 as a checklist.

## 6. Add a property

`/properties/new` is one form in five groups: Location, Building, Amenities, Rent and tenancy,
Description. Required fields say "(required)" and units are in the labels. City, district,
front, type, age, the room counts and status are dropdowns, so they cannot be mistyped. District
lists the chosen city's districts by their English names, with "Other district…" for any other.
Size and rent take only digits, turning Arabic digits into 0 to 9. Tenant name and the lease
dates open only when Status is Occupied, and the tenant's name is then required. On Save, every
field is checked against SRS Appendix C. A failure sends nothing, shows each message under its
field, moves focus to the first one and keeps everything typed. The server checks the values
again, and any message it returns appears under its field the same way. A success opens the new
property's page with the ID the server gave it and confirms "Property RP-0009 added". If the
server cannot be reached, the form says so above Save and keeps everything typed. Cancel leaves
without saving.

- **Code:** `pages/PropertyFormPage.jsx`, `components/properties/PropertyForm.jsx`,
  `components/properties/DistrictField.jsx`, `components/ui/FormField.jsx`, `utils/validation.js`,
  `constants/options.js`, `data/districts.json`, `create` in `services/propertyService.js`
- **Meets:** FR-ADD-01 to FR-ADD-09, FR-ADD-12, FR-ADD-14, FR-ADD-15, UI-03, UI-04, NFR-ACC-03,
  NFR-USE-04, NFR-REL-03, and Part 2 brief requirement 2

## 7. Edit a property

Edit, from a list row or the detail page, opens the same form filled with the property's values.
Saving applies the same checks, keeps the ID and the created date, gets a new "last updated" time
from the server, opens the property and confirms "Property RP-0001 updated". Moving the status
away from Occupied warns that the tenant and lease will be cleared, and they are cleared on save.
Cancel returns to the property unchanged. If the server cannot be reached, the page says so
instead of showing the form.

- **Code:** the same as section 6, with `updateProperty` in `context/PortfolioProvider.jsx` and
  `update` in `services/propertyService.js`
- **Meets:** FR-UPD-01 to FR-UPD-07, and Part 2 brief requirement 5

## 8. Delete a property

Delete, on every list row and on the detail page, opens a dialog that names the property by ID,
type, district and city. Cancel has focus first and Esc cancels, so nothing is deleted by
accident. Confirming removes the property from the list, the search results and the Dashboard at
once, and shows "Property RP-0001 deleted". From the detail page the app returns to the list. If
the delete fails, the dialog stays open and says why. The server's database never gives a deleted
property's number to a new one.

- **Code:** `components/properties/DeletePropertyDialog.jsx`, `components/ui/Dialog.jsx`,
  `remove` in `services/propertyService.js`
- **Meets:** FR-DEL-01 to FR-DEL-06, NFR-USE-03, NFR-ACC-06

## 9. Confirmation messages

Every add, update and delete shows a confirmation in one strip at the top of the page. Screen
readers announce it, it clears itself after 5 seconds and × dismisses it sooner.

- **Code:** `components/ui/Message.jsx`, `context/PortfolioProvider.jsx`,
  `context/portfolioReducer.js`, `constants/messages.js`
- **Meets:** FR-FBK-01, FR-FBK-02

## 10. Rent suggestion

Beside Yearly rent, the Add and Edit forms suggest a yearly rent from the rent model the team
trained on 2021 listings. The figure moves as the form is filled, rounded to the nearest 500 SAR,
under the note "Based on 2021 listings. Indicative only, not a valuation." "Use this rent" copies
it into the field. Nothing else changes the field. The panel says what it still needs, says when
a size is outside the data, says when a district is unknown and the figure less precise, and
warns when the typed rent is more than 3 times the suggestion or under a third of it. If the model
cannot load, it says so and the form works as before. [architecture.md](architecture.md),
section 7, explains the model.

- **Code:** `components/properties/RentSuggestion.jsx`, `utils/rentModel.js`,
  `services/rentModelService.js`, `constants/market.js`, `data/rent-model.json`; the model is
  trained in `ai-model/prepare.ipynb`
- **Meets:** FR-ADD-13, FR-RNT-01 to FR-RNT-07, NFR-REL-02

## 11. About

The About page, from the About menu item, shows the four team members side by side with their
photos or initials, names and student IDs, then the instructor, the course (SE411) and term
(Fall 2026-27), the technologies with a link to the repository, and the dataset credit. Choosing
a member's photo puts them in the spotlight with their paragraph and links, including a personal
site when one is given. The page lays out however many members `constants/team.js` lists.

- **Code:** `pages/AboutPage.jsx`, `components/about/`, `constants/team.js`
- **Meets:** FR-ABT-01, FR-ABT-03 to FR-ABT-06, and FR-ABT-02 in part: Muhammad Yawar's entry
  in `constants/team.js` is still empty, and the page shows "Student ID to add" under that name.

## 12. Data from the server

Only `services/propertyService.js` reads or writes properties, and every operation returns a
Promise. It calls the Spring server's routes under `/api/v1/properties`, which `npm run dev`
forwards to port 8080. It checks every property before sending it, translates between the
server's JSON and the app's shape, and turns each failure into a message the page can show. The
server issues the IDs and timestamps. Changes are kept in its in-memory H2 database, so they
survive a page reload but not a restart of the server.

- **Code:** `services/propertyService.js`, `context/PortfolioProvider.jsx`,
  `hooks/useServerPage.js`, `frontend/vite.config.js`; for the tests,
  `test/fakePropertyService.js` and `test/portfolio.seed.json`
- **Meets:** FR-DAT-02, FR-DAT-03, IF-01, IF-02, NFR-REL-03, NFR-REL-04, and on the server's side
  FR-DAT-04 and AC-17. The contract is in `docs/backend-plan.md`, section 3.

The frontend side of the Part 2 brief:

| Brief requirement | Frontend |
| --- | --- |
| 2. Add an element | The Add form, through `create` and `POST` |
| 3. Search for an element by ID | The detail page, through `getById` and `GET /api/v1/properties/{id}` |
| 4. Search for all elements, paginated | The property list, through `listPage`, when no search is active |
| 5. Update an element | The Edit form, through `update` and `PUT` |

## 13. Not built yet

Requirements of the SRS that do not work yet, with their priority. "In part" marks one that is
partly met: the cell says what is missing. Some have their pure functions written and tested but
not used by any page yet.

| Requirement | What is missing | Priority |
| --- | --- | --- |
| FR-DAT-01, in part | The starting properties are now the server's `data.sql`, which is not in the repository yet. The tests start from 8 hand-written properties; the SRS asks for at least 30, and 40 from the dataset once the licence question is answered (`frontend/src/data/README.md`). | Must |
| FR-ABT-02, in part | Muhammad Yawar's student ID and details, in `constants/team.js` | Must |
| NFR-TST-02, in part | Unit tests for comparables and the estimate, which are not built | Must |
| FR-NAV-02 | Market insights in the menu, once that page exists | Should |
| FR-DSH-07, in part | "Add property" on a Dashboard that has properties | Should |
| FR-DSH-08 | Leases ending within 60 days | Could |
| FR-DSH-09 | Counts of properties below and above market | Could |
| FR-LST-09 | Card view | Should |
| FR-LST-11 | Opening a property by selecting its row | Should |
| FR-DET-05, in part | All 13 amenities as a checklist | Should |
| FR-DET-06 | The market panel on the detail page | Should |
| FR-ADD-10 | A confirmation before leaving a form with unsaved input | Should |
| FR-ADD-11 | The possible-duplicate warning | Should |
| FR-UPD-08 | Save disabled until a value changes | Should |
| FR-UPD-09 | Switching between Vacant and Under maintenance from the list | Could |
| FR-DEL-08 | Deleting several properties at once | Could |
| FR-SRC-09, in part | A control to change the order. The list is always newest first; `sortProperties` in `utils/sort.js` sorts by the other keys and is tested. | Should |
| FR-SRC-10 | Amenity tick boxes in the filters. The filter is in `utils/search.js`. | Should |
| FR-SRC-12 | The search kept in the URL. `utils/searchParams.js` is written and tested. | Should |
| FR-SRC-13 | A chip for each active filter. `activeFilterChips` in `utils/search.js` is written and tested. | Should |
| FR-SRC-14 | Highlighted matches | Could |
| FR-AIS-01 to FR-AIS-12 | Search by meaning | Should |
| FR-AIS-13 | Keyword matches ranked first | Could |
| FR-CMP-01 to FR-CMP-06 | Comparable listings | Should |
| FR-CMP-07 | Comparables on the form | Could |
| FR-EST-01 to FR-EST-06 | The fair-rent estimate. The rent suggestion already shows FR-EST-05's note. | Should |
| FR-EST-07 | The market position as a badge and a filter | Could |
| FR-INS-01 to FR-INS-03 | The Market insights page. Its address shows a placeholder. | Should |
| FR-INS-04 | Its bar charts | Could |
| FR-NLI-01 to FR-NLI-04 | Plain-language input | Could |
| FR-FBK-04, in part | A progress indicator. Pages show "Loading…" text while the server answers, and the rent panel stays empty until the model arrives. | Should |
| FR-DAT-07 | Loading the market reference set on demand: the set does not exist yet | Should |
| FR-DAT-08 | CSV export | Could |
| UI-07 | A dark theme | Could |
| NFR-ACC-08 | An automated accessibility check of every page | Should |
| NFR-MNT-06 | Two component files are past 250 lines: `PropertyForm.jsx` (401) and `FormField.jsx` (266) (`docs/code-review.md`, CR-13) | Could |

Three things can only be checked by hand, and are listed as manual checks in
[test-report.md](test-report.md): AC-16 (keyboard only), AC-23 (360 px) and NFR-COM-01 (the
latest two versions of Chrome, Edge, Firefox and Safari).

## 14. Withdrawn in SRS version 1.1

SRS version 1.1 (11 November 2026) updated the requirements for Part 2. Its "Changes in version
1.1" list gives every change and its source. These were withdrawn, and the app does not have
them:

| Requirement | What it was | Why |
| --- | --- | --- |
| FR-DEL-07, AC-18 | Undo for 8 seconds after a delete | Nothing on screen used it, and `restore` was removed from the data service |
| FR-DAT-05 | Reset demo data | Resetting a database the team shares is risky, and `reset` was removed |
| FR-DAT-06 | A footer notice that changes last until a reload | Since Part 2, changes survive a reload |
