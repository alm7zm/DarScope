# Features

Part of deliverable PD-04 (SRS section 12), with [architecture.md](architecture.md) and the
[README](../README.md). It lists what works in the app on 16 October 2026, at commit `af9b312` on
the `ml-model` branch, with the code behind each feature and the SRS requirements it meets.
Paths are under `frontend/src/`. Section 13 lists what is not built yet.

Every Must requirement of the course brief works: the menu, adding, updating, deleting,
searching and displaying properties, and the About page. Two Must requirements of the SRS are only
partly met: the seed holds 8 properties instead of 30 (FR-DAT-01), and two of the three student
IDs are still to be filled in (FR-ABT-02).

## 1. Menu and pages

The menu at the top of every page leads to the Dashboard, the property list, Add property and
About. Each page has its own address, the current page is marked in the menu, and the browser's
Back and Forward buttons move between pages without reloading the app. The tab title names the
page, an unknown address shows "Page not found", and a page that fails shows an error screen with
a Reload button instead of a blank page.

- **Code:** `routes/routes.jsx`, `routes/paths.js`, `layouts/AppLayout.jsx`,
  `layouts/NavMenu.jsx`, `layouts/Footer.jsx`, `components/ui/Page.jsx`,
  `pages/NotFoundPage.jsx`, `pages/ErrorPage.jsx`
- **Meets:** FR-NAV-01, FR-NAV-03 to FR-NAV-07, FR-NAV-09, FR-FBK-03, FR-DAT-06, UI-01, UI-02,
  NFR-ACC-04

## 2. Dashboard

The first page shows the portfolio at a glance: the number of properties, how many are Occupied,
Vacant and Under maintenance, the occupancy rate, the yearly rent from occupied properties and the
rent if every property were let. A table gives the properties, occupied properties and rent of
each city, and "Needs attention" lists every property earning nothing, each linking to its page.
Every figure follows an add, update or delete at once. With no properties, the page shows zeros,
a dash for the rate, and an "Add property" button.

- **Code:** `pages/DashboardPage.jsx`, `components/dashboard/`, `utils/stats.js`
- **Meets:** FR-DSH-01 to FR-DSH-06, and FR-DSH-07 in part: "View all properties" is there, and
  "Add property" only on an empty Dashboard.

## 3. Property list

`/properties` shows every property in a table with the columns ID, City, District, Type, Size,
Bedrooms, Yearly rent, Status and Actions. Each row offers View, Edit and Delete. A count reads
"Showing X of Y properties", rents carry thousands separators and "SAR", sizes "m²", and each
status is a word on a coloured badge. Arabic districts read right to left. At 360 px the table
scrolls sideways inside its frame while the page stays still.

- **Code:** `pages/PropertyListPage.jsx`, `components/properties/PropertyTable.jsx`,
  `components/ui/Badge.jsx`, `utils/format.js`, `utils/arabic.js`
- **Meets:** FR-LST-01 to FR-LST-08, NFR-USE-02, NFR-ACC-05, NFR-ACC-07

## 4. Search and filters

A search box above the list finds properties by any word in their ID, city, district, type,
status, tenant, description or amenities, in English or Arabic, ignoring letter case. Arabic
spelling variants of a word match one another. The list follows 300 ms after typing stops, or at
once on Enter. Filters narrow the list by city, status, type, yearly rent from and to, size from
and to, and a minimum number of bedrooms, all at once. A range the wrong way round shows a
message and is ignored. "Clear all" empties the box and every filter. Search and filtering take
under 4 ms for 500 properties.

- **Code:** `components/search/SearchControls.jsx`, `hooks/usePropertySearch.js`,
  `utils/search.js`, `utils/arabic.js`, `validateFilters` in `utils/validation.js`
- **Meets:** FR-SRC-01 to FR-SRC-08, FR-SRC-11, NFR-PERF-02

## 5. Property detail

`/properties/:id` shows every field of one property in six groups: Location, Building, Amenities,
Rent and tenancy, Description and Record. The tenant and the lease dates appear only for an
Occupied property. The page offers Edit, Delete and Back to list. An ID that does not exist, or a
property just deleted, shows "Property not found" with a link back to the list.

- **Code:** `pages/PropertyDetailPage.jsx`, `components/properties/PropertyDetail.jsx`,
  `components/properties/PropertyNotFound.jsx`
- **Meets:** FR-DET-01 to FR-DET-04, and FR-DET-05 in part: the amenities the property has are
  listed, not all 13 as a checklist.

## 6. Add a property

`/properties/new` is one form in five groups: Location, Building, Amenities, Rent and tenancy,
Description. Required fields say "(required)" and units are in the labels. City, district,
front, type, age, the room counts and status are dropdowns, so they cannot be mistyped. District
lists the chosen city's districts by their English names, with "Other district…" for any other.
Size and rent take only digits, turning Arabic digits into 0 to 9. Tenant name and the lease
dates open only when Status is Occupied, and the tenant's name is then required. On Save, every
field is checked against SRS Appendix C. A failure saves nothing, shows each message under its
field, moves focus to the first one and keeps everything typed. A success gives the property the
next ID, opens its page and confirms "Property RP-0009 added". Cancel leaves without saving.

- **Code:** `pages/PropertyFormPage.jsx`, `components/properties/PropertyForm.jsx`,
  `components/properties/DistrictField.jsx`, `components/ui/FormField.jsx`, `utils/validation.js`,
  `constants/options.js`, `data/districts.json`
- **Meets:** FR-ADD-01 to FR-ADD-09, FR-ADD-12, FR-ADD-14, FR-ADD-15, UI-03, UI-04, NFR-ACC-03,
  NFR-USE-04

## 7. Edit a property

Edit, from a list row or the detail page, opens the same form filled with the property's values.
Saving applies the same checks, keeps the ID and the created date, sets a new "last updated"
time, opens the property and confirms "Property RP-0001 updated". Moving the status away from
Occupied warns that the tenant and lease will be cleared, and they are cleared on save. Cancel
returns to the property unchanged.

- **Code:** the same as section 6, with `updateProperty` in `context/PortfolioProvider.jsx`
- **Meets:** FR-UPD-01 to FR-UPD-07

## 8. Delete a property

Delete, on every list row and on the detail page, opens a dialog that names the property by ID,
type, district and city. Cancel has focus first and Esc cancels, so nothing is deleted by
accident. Confirming removes the property from the list, the search results and the Dashboard at
once, and shows "Property RP-0001 deleted". From the detail page the app returns to the list. A
deleted property's ID is never given to a new one.

- **Code:** `components/properties/DeletePropertyDialog.jsx`, `components/ui/Dialog.jsx`,
  `remove` in `services/propertyService.js`
- **Meets:** FR-DEL-01 to FR-DEL-06, NFR-USE-03, NFR-ACC-06

## 9. Confirmation messages

Every add, update and delete shows a confirmation in one strip at the top of the page. Screen
readers announce it, it clears itself after 5 seconds and × dismisses it sooner.

- **Code:** `components/ui/Message.jsx`, `context/PortfolioProvider.jsx`,
  `context/portfolioReducer.js`, `constants/messages.js`
- **Meets:** FR-FBK-01 and FR-FBK-02, for the actions that exist

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

The About page, from the About menu item, names the team with photos or initials, the instructor,
the course (SE411, Fall 2026-27, Project Part 1), the technologies, a link to the repository, the
dataset and the AI tools. Choosing a member's photo shows their paragraph and links.

- **Code:** `pages/AboutPage.jsx`, `components/about/`, `constants/team.js`
- **Meets:** FR-ABT-01, FR-ABT-03 to FR-ABT-06, and FR-ABT-02 in part: two of the three
  student IDs are still empty in `constants/team.js`, and the page shows "Student ID to add"
  under those names.

## 12. Data held in memory

The portfolio is an array of objects in memory, copied from `data/portfolio.seed.json` when the
app starts. Only `services/propertyService.js` reads or writes it, and every operation returns a
Promise. The service checks every property it is given, never changes the array in place, and
never issues an ID twice. A reload starts again from the seed, as the footer says.

- **Code:** `services/propertyService.js`, `data/portfolio.seed.json`
- **Meets:** FR-DAT-02 to FR-DAT-04, NFR-REL-03, NFR-REL-04, and FR-DAT-01 in part: the seed
  holds 8 hand-written properties, not the 30 or more the SRS asks for (see section 13).

## 13. Not built yet

Requirements of the SRS that do not work yet, with their priority. "In part" marks one that is
partly met: the cell says what is missing. Some have their pure functions written and tested but
not used by any page yet.

| Requirement | What is missing | Priority |
| --- | --- | --- |
| FR-DAT-01, in part | 22 or more properties. The seed holds 8 hand-written ones; task 1 builds 40 from the dataset once the licence question is answered (`frontend/src/data/README.md`). | Must |
| FR-ABT-02, in part | Two student IDs, in `constants/team.js` | Must |
| NFR-TST-02, in part | Unit tests for comparables and the estimate, which are not built | Must |
| FR-NAV-02 | Market insights in the menu, once that page exists | Should |
| FR-NAV-08 | The menu behind a toggle button below 768 px | Should |
| FR-DSH-07, in part | "Add property" on a Dashboard that has properties | Should |
| FR-DSH-08 | Leases ending within 60 days | Could |
| FR-DSH-09 | Counts of properties below and above market | Could |
| FR-LST-09 | Card view | Should |
| FR-LST-10 | Pages of 10, 25 or 50. `paginate` in `utils/sort.js` is written and tested. | Should |
| FR-LST-11 | Opening a property by selecting its row | Should |
| FR-DET-05, in part | All 13 amenities as a checklist | Should |
| FR-DET-06 | The market panel on the detail page | Should |
| FR-ADD-10 | A confirmation before leaving a form with unsaved input | Should |
| FR-ADD-11 | The possible-duplicate warning | Should |
| FR-UPD-08 | Save disabled until a value changes | Should |
| FR-UPD-09 | Switching between Vacant and Under maintenance from the list | Could |
| FR-DEL-07 | Undo for 8 seconds after a delete. `restore` in the data service is written and tested. | Should |
| FR-DEL-08 | Deleting several properties at once | Could |
| FR-SRC-09 | Sorting. `sortProperties` in `utils/sort.js` is written and tested. | Should |
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
| FR-FBK-04, in part | A progress indicator while the rent model loads. The panel stays empty until it arrives. | Should |
| FR-DAT-05 | Reset demo data. `reset` in the data service is written and tested. | Should |
| FR-DAT-07 | Loading the market reference set on demand: the set does not exist yet | Should |
| FR-DAT-08 | CSV export | Could |
| UI-07 | A dark theme | Could |
| NFR-ACC-08 | An automated accessibility check of every page | Should |
| NFR-MNT-06 | Two component files are past 250 lines (`docs/code-review.md`, CR-13) | Could |

Three things can only be checked by hand, and are listed as manual checks in
[test-report.md](test-report.md): AC-16 (keyboard only), AC-23 (360 px) and NFR-COM-01 (the
latest two versions of Chrome, Edge, Firefox and Safari).
