# Features

Part of deliverable PD-04 (SRS section 12), with [architecture.md](architecture.md) and the
[README](../README.md). It lists what works in the app on 14 November 2026, with the code behind
each feature and the requirements it meets, from SRS version 1.2. Paths are under
`frontend/src/`, apart from the server's, which are under `backend/`. Section 13 lists the checks
only a person can make, and section 14 what the SRS withdrew.

Since Part 2 the app reads and writes the portfolio through the team's Spring server, in
`backend/`. Every feature below has been tested against the in-memory stand-in for the server
(`test/fakePropertyService.js`), and the calls to the real server against a stubbed `fetch`. The
server has its own JUnit and Mockito tests. The end-to-end check with both running is in
`docs/backend-plan.md`, section 10.

Every functional requirement of SRS version 1.2 that is not withdrawn works. That covers what
the course brief asks for: the menu, adding, updating, deleting, searching and displaying
properties, and the About page. It also covers the Part 2 brief's add, search by ID, paginated
list and update, which section 12 maps to the code.

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
rent if every property were let. Each count is a link into the property list: the total opens the
whole portfolio, and each status count opens the list narrowed to that status. A table gives the
properties, occupied properties and rent of each city, and "Needs attention" lists every property
earning nothing, each linking to its page. "View all properties" opens the list. Every figure
follows an add, update or delete at once. With no properties, the page shows zeros, a dash for the
rate, and an "Add property" button. If the server cannot be reached, the page says so, with a Try
again button.

- **Code:** `pages/DashboardPage.jsx`, `components/dashboard/`, `utils/stats.js`
- **Meets:** FR-DSH-01 to FR-DSH-07

## 3. Property list

`/properties` shows the properties in a table with the columns ID, City, District, Type, Size,
Bedrooms, Yearly rent, Status and Actions, newest first. Each row offers View, Edit and Delete. A
count reads "Showing X of Y properties", rents carry thousands separators and "SAR", sizes "m²",
and each status is a word on a coloured badge. Arabic districts read right to left. At 360 px the
table scrolls sideways inside its frame while the page stays still.

Under the table, Previous and Next move between pages, with "Page 2 of 3 (11 to 20 of 27)"
between them, and "Per page" offers 5, 10, 25 or 50, with 10 by default. With no search, no
filter and the default order, each page comes from the server. Otherwise the browser pages the
matches. Any change to the search, the filters, the order or the page size goes back to page 1.
If the server cannot be reached, the page says so, with a Try again button.

- **Code:** `pages/PropertyListPage.jsx`, `components/properties/PropertyTable.jsx`,
  `components/ui/Pager.jsx`, `hooks/useServerPage.js`, `components/ui/Badge.jsx`,
  `utils/format.js`, `utils/arabic.js`, `paginate` in `utils/sort.js`
- **Meets:** FR-LST-01 to FR-LST-08, FR-LST-10, NFR-USE-02, NFR-ACC-05, NFR-ACC-07, and Part 2
  brief requirement 4

## 4. Search, filters and sort

A search box above the list finds properties by any word in their ID, city, district, type,
status, tenant, description or amenities, in English or Arabic, ignoring letter case. Arabic
spelling variants of a word match one another. The list follows 300 ms after typing stops, or at
once on Enter. Filters narrow the list by city, status, type, yearly rent from and to, size from
and to, and a minimum number of bedrooms, all at once. An Amenities line under them opens 13 tick
boxes, and the list then keeps only the properties that have every ticked amenity. A range the
wrong way round shows a message and is ignored. Each active filter shows as a chip, and choosing
a chip removes that filter. "Clear all" empties the box and every filter.

Sort by (Last updated, Yearly rent, Size, Bedrooms or City) and Order (Ascending or Descending)
change the order of the list. The default is Last updated, newest first. The search text, the
filters, the order, the page and the page size are kept in the address, so Back restores them and
the view can be bookmarked. The search runs in the browser, on the whole portfolio the server
sent at start.

- **Code:** `components/search/SearchControls.jsx`, `components/search/FilterChips.jsx`,
  `hooks/usePropertySearch.js`, `utils/search.js`, `utils/searchParams.js`,
  `sortProperties` in `utils/sort.js`, `utils/arabic.js`, `validateFilters` in
  `utils/validation.js`
- **Meets:** FR-SRC-01 to FR-SRC-13, NFR-PERF-02 (under 4 ms for 500 properties, measured on
  16 October 2026 for `docs/code-review.md`)

## 5. Property detail

`/properties/:id` shows every field of one property in six groups: Location, Building, Amenities,
Rent and tenancy, Description and Record. Amenities lists the ones the property has. The tenant
and the lease dates appear only for an Occupied property. The page offers Edit, Delete and Back to
list. An ID that does not exist, or a property just deleted, shows "Property not found" with a
link back to the list. The page asks the server for the property by its ID, so it always shows
the server's copy. If the server cannot be reached, the page says so, with a Try again button.

- **Code:** `pages/PropertyDetailPage.jsx`, `hooks/useServerProperty.js`,
  `components/properties/PropertyDetail.jsx`, `components/properties/PropertyNotFound.jsx`,
  `getById` in `services/propertyService.js`
- **Meets:** FR-DET-01 to FR-DET-05, and Part 2 brief requirement 3

## 6. Add a property

`/properties/new` is one form in five groups: Location, Building, Amenities, Rent and tenancy,
Description. Required fields say "(required)" and units are in the labels. City, district,
front, type, age, the room counts and status are dropdowns, so they cannot be mistyped. District
lists the chosen city's districts by their English names, with "Other district…" for any other.
The 13 amenities are tick boxes in three headed groups: Inside, Staff rooms, and Outside and
parking. Size and rent take only digits, turning Arabic digits into 0 to 9. Tenant name and the
lease dates open only when Status is Occupied, and the tenant's name is then required. On Save,
every field is checked against SRS Appendix C. A failure sends nothing, shows each message under
its field, moves focus to the first one and keeps everything typed. The server checks the values
again, and any message it returns appears under its field the same way. While the server
answers, Save reads "Saving…" and cannot be pressed again. A success opens the new property's
page with the ID the server gave it and confirms "Property RP-0009 added". If the server cannot
be reached, the form says so above Save and keeps everything typed. Cancel leaves without saving.

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
instead of showing the form, with a Try again button.

- **Code:** the same as section 6, with `updateProperty` in `context/PortfolioProvider.jsx` and
  `update` in `services/propertyService.js`
- **Meets:** FR-UPD-01 to FR-UPD-07, and Part 2 brief requirement 5

## 8. Delete a property

Delete, on every list row and on the detail page, opens a dialog that names the property by ID,
type, district and city. Cancel has focus first and Esc cancels, so nothing is deleted by
accident. While the server answers, the dialog is busy, so a double click deletes once.
Confirming removes the property from the list, the search results and the Dashboard at once, and
shows "Property RP-0001 deleted". From the detail page the app returns to the list. If the delete
fails, the dialog stays open and says why. The server's database never gives a deleted property's
number to a new one.

- **Code:** `components/properties/DeletePropertyDialog.jsx`, `components/ui/Dialog.jsx`,
  `remove` in `services/propertyService.js`
- **Meets:** FR-DEL-01 to FR-DEL-06, NFR-USE-03, NFR-ACC-06

## 9. Messages and waiting

Every add, update and delete shows a confirmation in one strip at the top of the page. Screen
readers announce it, it clears itself after 5 seconds and × dismisses it sooner. While a page
waits for the server, it shows a spinner beside "Loading…". Save and the delete dialog show they
are busy, as sections 6 and 8 say. The rent panel stays empty for the moment its weights, 2.86 kB
compressed, take to load.

- **Code:** `components/ui/Message.jsx`, `components/ui/PageStates.jsx`,
  `context/PortfolioProvider.jsx`, `context/portfolioReducer.js`, `constants/messages.js`
- **Meets:** FR-FBK-01, FR-FBK-02, FR-FBK-04

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
- **Meets:** FR-ABT-01 to FR-ABT-06

## 12. Data from the server

Only `services/propertyService.js` reads or writes properties, and every operation returns a
Promise. It calls the Spring server's routes under `/api/v1/properties`, which `npm run dev`
forwards to port 8080. It checks every property before sending it, translates between the
server's JSON and the app's shape, and turns each failure into a message the page can show.
Changes survive a page reload.

The server, in `backend/`, starts from the same 8 hand-written properties as the tests, issues
the IDs and timestamps, and never reuses a deleted ID. It checks every property again with the
same rules and messages as the form, and answers 400 with one message per bad field, or 404
"Property not found". On the default H2 profile a restart brings back the 8 starting properties.
On the `local` and `supabase` profiles changes survive a restart too.

- **Code:** `services/propertyService.js`, `context/PortfolioProvider.jsx`,
  `hooks/useServerPage.js`, `frontend/vite.config.js`; for the tests,
  `test/fakePropertyService.js` and `test/portfolio.seed.json`. On the server,
  `backend/src/main/java/edu/psu/se411/darscope/` and `backend/src/main/resources/`
- **Meets:** FR-DAT-01 to FR-DAT-04, IF-01, IF-02, NFR-REL-03, NFR-REL-04, and AC-17. The
  contract is in `docs/backend-plan.md`, section 3.

The Part 2 brief, and where each requirement is met:

| Brief requirement | Server | Frontend |
| --- | --- | --- |
| 1. A Java Spring server | `backend/`, Spring Boot 4.1.2 | – |
| 2. Add an element | `POST /api/v1/properties`, which answers 201 | The Add form, through `create` |
| 3. Search for an element by ID | `GET /api/v1/properties/{id}` | The detail page, through `getById` |
| 4. Search for all elements, paginated | `GET /api/v1/properties?page=&size=`, one page cut in the database | The property list, through `listPage` |
| 5. Update an element | `PUT /api/v1/properties/{id}` | The Edit form, through `update` |
| 6. A JUnit and Mockito test suite for the whole backend | 42 tests in `backend/src/test/`: the service with a Mockito mock for the repository, the controller through MockMvc with a Mockito mock for the service, and the whole server on H2 | – |

## 13. Still to check by hand

Nothing the SRS still asks for is missing. Four checks need a person, and are listed as manual
checks in [test-report.md](test-report.md): AC-16 (keyboard only), AC-17 (reload, with the server
running), AC-23 (360 px) and NFR-COM-01 (the latest two versions of Chrome, Edge, Firefox and
Safari).

One gap lies outside the SRS. The server rejects a property sent without one of the 13 amenity
fields, with 400 "The request could not be read", although `docs/backend-plan.md` says a missing
amenity counts as false. The app always sends all 13, so only a hand-written request is affected
(`docs/tasks.md`, task 6).

## 14. Withdrawn

SRS version 1.1 (11 November 2026) and version 1.2 (14 November 2026) withdrew these, and the app
does not have them. Each version's "Changes" table gives every change and its source.

| Requirement | What it was | Withdrawn in |
| --- | --- | --- |
| FR-DEL-07, AC-18 | Undo for 8 seconds after a delete | 1.1 |
| FR-DAT-05 | Reset demo data | 1.1 |
| FR-DAT-06 | A footer notice that changes last until a reload | 1.1 |
| FR-AIS-01 to FR-AIS-13, NFR-PERF-04, NFR-PERF-06, NFR-COM-03, NFR-TST-04, IF-04, AC-21, AC-22 | Search by meaning | 1.2 |
| FR-CMP-01 to FR-CMP-07, FR-EST-01 to FR-EST-07, FR-DET-06, FR-DSH-09, NFR-PERF-05, AC-19, AC-20 | Comparable listings, the fair-rent estimate and the market panel | 1.2 |
| FR-INS-01 to FR-INS-04, FR-NAV-02 | Market insights | 1.2 |
| FR-NLI-01 to FR-NLI-04 | Plain-language input | 1.2 |
| FR-DAT-07 | The market reference set | 1.2 |
| FR-LST-09 | Card view | 1.2 |
| FR-LST-11 | Opening a property by selecting its row | 1.2 |
| FR-ADD-10 | A warning before leaving a form with unsaved input | 1.2 |
| FR-ADD-11 | The possible-duplicate warning | 1.2 |
| FR-UPD-08 | Save disabled until a value changes | 1.2 |
| FR-UPD-09 | Switching between Vacant and Under maintenance from the list | 1.2 |
| FR-DEL-08 | Deleting several properties at once | 1.2 |
| FR-DSH-08 | Leases ending within 60 days | 1.2 |
| FR-SRC-14 | Highlighted matches | 1.2 |
| FR-DAT-08 | CSV export | 1.2 |
| UI-07 | A dark theme | 1.2 |
| NFR-ACC-08 | An automated accessibility check of every page | 1.2 |
| NFR-MNT-06 | At most about 250 lines per component file | 1.2 |

Version 1.2 also narrowed three requirements to what the app does: FR-DAT-01 (a seed of 8
hand-written properties, not 40 from the dataset), FR-DSH-07 (the "View all properties" shortcut)
and FR-DET-05 (the amenities the property has, not a checklist of all 13).
