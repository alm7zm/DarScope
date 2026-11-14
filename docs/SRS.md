# Software Requirements Specification: Darscope

Version 1.2, 14 November 2026: the requirements the app does not meet are withdrawn. Version 1.1, 11 November 2026: updated for Part 2. Version 1.0 was exported on 5 October 2026 from the team's SRS document, which these updates do not change. The two diagrams are given as text.

### Changes in version 1.2

On 14 November 2026 the team withdrew every requirement the app does not meet, so that this document describes the app as submitted. None of them is needed by the Part 1 or the Part 2 brief. Every ID is kept: a withdrawn requirement stays in its table, marked Withdrawn.

| IDs | Change | Source |
| --- | --- | --- |
| FR-AIS-01 to FR-AIS-13, FR-CMP-01 to FR-CMP-07, FR-EST-01 to FR-EST-07, FR-INS-01 to FR-INS-04, FR-NLI-01 to FR-NLI-04, FR-NAV-02, FR-DET-06, FR-DSH-09, FR-DAT-07, AC-19 to AC-22 | Withdrawn: search by meaning, comparable listings, the fair-rent estimate, Market insights and plain-language input (sections 7.1 to 7.5), with the market reference set (3.3), Appendix A and Appendix B.1 to B.3. Section 7.6, the rent model, stays | Team |
| NFR-PERF-04 to NFR-PERF-06, NFR-COM-03, NFR-TST-04, IF-04, A-03, R-2 to R-4, R-7 | Withdrawn with the features above | Team |
| FR-LST-09, FR-LST-11, FR-ADD-10, FR-ADD-11, FR-UPD-08, FR-UPD-09, FR-DEL-08, FR-DSH-08, FR-SRC-14, FR-DAT-08, UI-07, NFR-ACC-08, NFR-MNT-06 | Withdrawn: card view, opening a property by selecting its row, the warning before leaving unsaved input, the duplicate warning, Save disabled until a change, the status switch on the list, bulk delete, leases ending soon, highlighted matches, CSV export, the dark theme, the automated accessibility check and the 250-line limit | Team |
| FR-DAT-01, 3.4, section 14 | The portfolio starts from 8 hand-written properties, RP-0001 to RP-0008, not 40 from the dataset, and the acceptance scenarios start from those 8 | Team |
| FR-DSH-07, FR-DET-05 | Narrowed to what the app does: the "View all properties" shortcut, and a list of the amenities the property has | Team |
| FR-ADD-13, NFR-TST-02, NFR-TST-06, NFR-PERF-07, NFR-MNT-01, NFR-MNT-03, NFR-SEC-02, NFR-USE-05, NFR-REL-02, IF-01, A-02, A-04, A-06, R-5, R-6, Appendix B.4, Appendix C.2 | Reworded to drop what the withdrawn features needed | Follows from the rows above |

### Changes in version 1.1

Part 2 moved the portfolio to the team's Spring server ([part-2-brief.md](part-2-brief.md), [backend-plan.md](backend-plan.md)). On 9 November 2026 the team also removed undo, Reset demo data, the reload notice and "Project Part 1" (commits `f78e10b` and `51b3a9f`). Every ID is kept: a dropped requirement stays in its table, marked Withdrawn.

| IDs | Change | Source |
| --- | --- | --- |
| C-02, A-01, FR-DAT-02, IF-01, IF-02 | The portfolio lives in the Spring server's database, reached through its REST API, so changes survive a reload | Part 2 brief |
| FR-DAT-01, FR-DAT-04, FR-DEL-06 | The server's database holds the seed and issues the IDs, and never reuses one | Part 2 brief |
| FR-DAT-03 | The data-service table gains `listPage` and the route of every operation; `restore` and `reset` are removed | Part 2 brief, team |
| FR-LST-10 | Now Must, because the Part 2 brief asks for paginated results. 5 per page is added, and with no search the server cuts each page | Part 2 brief requirement 4, team |
| FR-DEL-07, FR-DAT-05, AC-18 | Withdrawn: undo and Reset demo data. Nothing on screen used them, and resetting a shared database is risky | Team |
| FR-DAT-06 | Withdrawn: the reload notice, which no longer holds | Team |
| FR-ABT-03, FR-ABT-05, AC-15 | The About page no longer shows "Project Part 1" or names the AI tools; `docs/ai-usage.md` records the tools (PD-07) | Team |
| FR-DSH-03, FR-FBK-01, UI-01, NFR-REL-04, NFR-USE-03, AC-17, Appendix C.2 | Reworded to match the rows above, and the server-unavailable message added | Follows from the rows above |

## 1. Introduction

This SRS defines what the frontend must do: a React application that manages a company's rental houses. In Part 1 it ran entirely in the browser. Since Part 2 it keeps the portfolio on the team's Spring server, whose design is in [backend-plan.md](backend-plan.md).

### 1.1 Purpose and readers

| Reader | Uses this document to |
| --- | --- |
| The team | Agree what to build, split the work and test it |
| The AI coding tool | Generate the design, code and tests from numbered requirements |
| The instructor | Check the app against the course brief |

### 1.2 Product scope

The product is **Darscope**, a rental property asset manager. The name joins *dar* (دار, Arabic for "house") and *scope*. It manages one kind of asset: rental houses (villas and duplexes) that one company owns in four Saudi cities.

In scope for Part 1:

- Add, update and delete properties.
- Search, filter and sort the portfolio.
- Display properties as a list, a detail page and a dashboard.
- A navigation menu and an About page with the team's names and student IDs.
- A rent suggestion on the Add and Edit forms, from a model the team trained on 2021 listings and run in the browser (7.6).

Section 15 lists what is out of scope, including the backend that Part 2 adds.

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| Property | One rental house the company owns; the asset this app manages |
| Portfolio | All properties the user manages in the app |
| Listing | One rental house in the public 2021 dataset, which the rent model learns from; never a company property |
| Rent suggestion | The yearly rent the rent model suggests for the values on the Add or Edit form (7.6) |
| Seed data | The properties the server's database starts with |
| CRUD | Create, read, update, delete |
| SPA | Single-page application |
| SAR | Saudi riyal |
| RTL | Right-to-left text direction, used for Arabic |

### 1.4 Conventions

- "Shall" marks a requirement. Each has a unique ID: `FR-` functional, `NFR-` non-functional, `C-` constraint, `PD-` project deliverable, `BR-` brief requirement, `AC-` acceptance scenario. Section 9 adds UI- and IF- for interface requirements.
- **Must**: needed to meet the course brief or for the app to work.
- **Should**: planned; dropped only if time runs out.
- **Could**: a bonus, built last.
- The Must requirements alone satisfy the brief. Section 13 shows the mapping.

### 1.5 Document status

| Item | Value |
| --- | --- |
| Course | SE411, Fall 2026-27 |
| Project | Part 1 (frontend) and Part 2 (Spring server) |
| Version | 1.2 |
| Submission deadline | Part 1: Oct 17, 2026. Part 2: Nov 14, 2026 |
| Team | Four members, named with their student IDs on the About page and in `frontend/src/constants/team.js` (FR-ABT-06) |

## 2. Overall description

Darscope is a single-page app. Its interface and every AI feature run in the browser. Since Part 2 the portfolio is stored by the team's Spring server.

### 2.1 Product perspective

Part 1 delivered the frontend only, with all data access behind one service module (C-07). Part 2 adds the hand-coded Spring server, and that module now calls it.

The app works with one collection, the **portfolio**: the company's own properties. The user adds, edits and deletes these.

**Architecture, as text.** The original document shows this as a diagram.

- **Pages** (Dashboard, Properties, Add and Edit, Detail, About) use two modules:
  - **Portfolio state**: the property objects the server returned. Every read and write goes through the data service.
  - **Rent model**: suggests a yearly rent on the Add and Edit forms (7.6). Its weights are one of the app's own files, loaded the first time a form needs them.
- **Data service**: `list`, `listPage`, `getById`, `create`, `update`, `remove`. Since Part 2 it calls the Spring server's REST API.
- **Spring server** (Part 2, outside the browser): stores the portfolio, which starts from the seed, and answers the data service at `/api/v1/properties`.
- The properties go only to the team's Spring server. Nothing else typed or stored in the browser is sent to any server.

Pages read and change the portfolio only through the data service, which since Part 2 calls the Spring server.

### 2.2 Product functions

| Function | What the user can do | Section |
| --- | --- | --- |
| Navigate | Move between pages from a menu | 4.1 |
| Dashboard | See portfolio totals, occupancy and rent | 4.2 |
| Display | Browse the property list and open one property | 4.3, 4.4 |
| Add | Register a new property | 5.1 |
| Update | Change any detail of a property | 5.2 |
| Delete | Remove a property, after a confirmation | 5.3 |
| Search | Find properties by keyword, filters and sorting | 6 |
| Rent suggestion | See a suggested yearly rent from the team's rent model while adding or editing a property | 5.1, 7.6 |
| About | See the team and course details | 8.1 |

### 2.3 Users

There is one user class, the **portfolio manager**: a staff member who keeps the property records up to date. They are comfortable with web apps and read English; the data they enter may be Arabic.

Part 1 has no login, so every visitor has full access. The instructor evaluates the app through the same interface.

### 2.4 Operating environment

- Desktop and laptop browsers: the latest two versions of Chrome, Edge, Firefox and Safari.
- Screen widths from 360 px to 1920 px.
- The team's Spring server, running and reachable from the browser (9.3).
- For developers: a current Node.js LTS release and npm.

### 2.5 Constraints

| ID | Constraint | Source |
| --- | --- | --- |
| C-01 | The app shall be a React project. | Brief |
| C-02 | The app's interface shall run in the browser. In Part 1 it had no server-side code and no database; since Part 2 the portfolio is stored by the team's Spring server. | Brief, Part 2 brief |
| C-03 | Data shall be defined as collections of JavaScript objects. | Brief |
| C-04 | The app shall manage one kind of asset only: rental houses. | Brief |
| C-05 | The source code shall be in a public GitHub repository and contain no secrets. | Brief |
| C-06 | Requirements, visual design, code, documentation, tests and the code review shall be produced with an AI tool. | Brief |
| C-07 | All data access shall go through one service module, so Part 2 can replace it with calls to a backend. | Team decision |
| C-08 | The user interface shall be in English; property data may be in Arabic or English. | Team decision |
| C-09 | AI features shall run in the browser with no API key and no paid service. | Team decision |

### 2.6 Assumptions and dependencies

| ID | Assumption | If it is wrong |
| --- | --- | --- |
| A-01 | Withdrawn in version 1.1: since Part 2 the server keeps every change, so nothing is lost on reload. | – |
| A-02 | The public dataset may be used to train the rent model, with credit. | Drop the rent suggestion (FR-ADD-13). |
| A-03 | Withdrawn in version 1.2, with search by meaning. | – |
| A-04 | Rents from 2021 are acceptable for a demonstration. | The rent suggestion already says it is indicative; no requirement changes. |
| A-05 | The evaluator uses a current desktop browser. | Must requirements still work on every browser in 2.4. |
| A-06 | Every listing in the dataset is a villa or a duplex, told apart by its duplex column. | Add the other house types to the Type choices in 3.1, or leave those listings out of the rent model's training. |

## 3. Data requirements

The app holds one collection of objects: the portfolio of properties, kept by the Spring server.

### 3.1 Property record

Each property in the portfolio shall have the fields below. Appendix C gives the error message for each rule.

| Field | Type | Required | Rules | Dataset column |
| --- | --- | --- | --- | --- |
| `id` | Text | Set by the app | Format `RP-0001`; generated; never edited | None |
| `city` | Choice | Yes | Riyadh, Jeddah, Dammam or Al Khobar | `city` |
| `district` | Text | Yes | 2 to 60 characters; Arabic or English | `district` |
| `front` | Choice | No | North, South, East, West, Northeast, Northwest, Southeast, Southwest, Three streets, Four streets | `front` |
| `propertyType` | Choice | Yes | Villa or Duplex; default Villa | `duplex` |
| `sizeSqm` | Whole number | Yes | 20 to 100,000 | `size` |
| `propertyAgeYears` | Whole number | Yes | 0 to 100; 0 means new | `property_age` |
| `bedrooms` | Whole number | Yes | 0 to 20 | `bedrooms` |
| `bathrooms` | Whole number | Yes | 0 to 20 | `bathrooms` |
| `livingRooms` | Whole number | Yes | 0 to 20 | `livingrooms` |
| `amenities` | 13 yes/no flags | Yes | Listed in 3.2; each defaults to no | 13 columns |
| `yearlyRentSar` | Whole number | Yes | 1,000 to 10,000,000 | `price` |
| `description` | Text | No | Up to 2,000 characters; Arabic or English | `details` |
| `status` | Choice | Yes | Vacant, Occupied or Under maintenance; default Vacant | None |
| `tenantName` | Text | When Occupied | 2 to 80 characters; empty for any other status | None |
| `leaseStart` | Date | No | Allowed only when Occupied | None |
| `leaseEnd` | Date | No | Allowed only when Occupied; later than `leaseStart` | None |
| `createdAt` | Date and time | Set by the app | Set once, when the property is created | None |
| `updatedAt` | Date and time | Set by the app | Set on every save | None |

The number ranges are deliberately wide so that real houses pass. The dataset column is where the rent model finds each field (7.6).

### 3.2 Amenity flags

| Field | Label shown | Field | Label shown |
| --- | --- | --- | --- |
| `kitchen` | Kitchen | `pool` | Pool |
| `garage` | Garage | `frontyard` | Front yard |
| `driverRoom` | Driver's room | `basement` | Basement |
| `maidRoom` | Maid's room | `stairs` | Stairs |
| `furnished` | Furnished | `elevator` | Elevator |
| `ac` | Air conditioning | `fireplace` | Fireplace |
| `roof` | Roof space |  |  |

### 3.3 Market reference listing

Withdrawn in version 1.2, with the features that read the market reference set (7.1 to 7.4).

### 3.4 Seed data

The portfolio starts from 8 properties written by hand, RP-0001 to RP-0008: 3 in Riyadh, 2 in Jeddah, 2 in Dammam and 1 in Al Khobar, of which 3 are Occupied, 4 Vacant and 1 Under maintenance. Three have an Arabic district and description. The tenant names are invented, and none of the properties comes from the dataset.

| Collection | File | Records | Editable |
| --- | --- | --- | --- |
| Portfolio seed | The server's `data.sql` ([backend-plan.md](backend-plan.md), section 4). The tests start from the same 8, in `frontend/src/test/portfolio.seed.json` | 8 | Yes, in the server's database |

The Kaggle dataset [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar), rental-house listings from four cities in 2021, is used only to train the rent model (7.6). The app holds the model's weights and its district list, `src/data/rent-model.json` and `src/data/districts.json`, and no rows of the dataset.

### 3.5 Data lifecycle

- The server's database starts from the seed. When the app starts, it loads the portfolio from the server.
- Changes are kept in the server's database and survive a page reload (C-02). On Supabase Postgres, and on H2 saved to a file (the `local` profile), they also survive a restart of the server. On the default H2 database, which lives in the server's memory, a restart brings back the seed.

These values are calculated when needed and never stored: the display title ("Villa in {district}, {city}") and the rent suggestion.

## 4. Functional requirements: navigation and display

The user reaches every feature from one menu and sees the portfolio three ways: dashboard totals, a list and a detail page.

### 4.1 Navigation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-NAV-01 | Every page shall show the same navigation menu with these items: Dashboard, Properties, Add property, About. | Must |
| FR-NAV-02 | Withdrawn in version 1.2, with Market insights (7.4). | Withdrawn |
| FR-NAV-03 | Choosing a menu item shall open its page without reloading the whole app. | Must |
| FR-NAV-04 | The menu shall mark the current page, both visually and for screen readers. | Must |
| FR-NAV-05 | Each page shall have its own URL, as listed below. | Must |
| FR-NAV-06 | The browser's Back and Forward buttons shall move between visited pages. | Must |
| FR-NAV-07 | An unknown URL shall show a "Page not found" page with a link to the Dashboard. | Should |
| FR-NAV-08 | Below 768 px wide, the menu shall collapse behind a toggle button. | Should |
| FR-NAV-09 | The browser tab title shall name the current page, for example "Properties · Darscope". | Should |

| Page | URL | Reached from |
| --- | --- | --- |
| Dashboard | `/` | Menu |
| Property list | `/properties` | Menu |
| Add property | `/properties/new` | Menu |
| Property detail | `/properties/:id` | A row in the list |
| Edit property | `/properties/:id/edit` | The list or the detail page |
| About | `/about` | Menu |

### 4.2 Dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DSH-01 | The Dashboard shall show: total properties; the number Occupied, Vacant and Under maintenance; the occupancy rate; yearly rent from occupied properties; potential yearly rent from all properties. | Must |
| FR-DSH-02 | The occupancy rate shall be occupied divided by total, shown as a whole percentage. With no properties it shall show a dash. | Must |
| FR-DSH-03 | Every figure shall be recalculated at once after an add, update or delete. | Must |
| FR-DSH-04 | With an empty portfolio, the Dashboard shall show zeros and invite the user to add the first property. | Must |
| FR-DSH-05 | A table shall show, for each city: properties, occupied properties and total yearly rent. | Should |
| FR-DSH-06 | A "Needs attention" list shall show every Vacant and Under maintenance property, each linking to its detail page. | Should |
| FR-DSH-07 | The Dashboard shall offer a "View all properties" shortcut. An empty Dashboard offers "Add property" (FR-DSH-04). | Should |
| FR-DSH-08 | Withdrawn in version 1.2: a list of the leases that end within the next 60 days. | Withdrawn |
| FR-DSH-09 | Withdrawn in version 1.2, with the fair-rent estimate (7.3): counts of the properties Below and Above market. | Withdrawn |

### 4.3 Property list

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-LST-01 | The Properties page shall list every property that matches the current search and filters (section 6). | Must |
| FR-LST-02 | The list shall be a table with these columns: ID, City, District, Type, Size, Bedrooms, Yearly rent, Status, Actions. | Must |
| FR-LST-03 | Each row shall offer View, Edit and Delete. | Must |
| FR-LST-04 | A count shall read "Showing X of Y properties". | Must |
| FR-LST-05 | An empty portfolio shall show a message and an "Add property" button. A search with no matches shall show a message and a "Clear all" button. | Must |
| FR-LST-06 | Rent shall show thousands separators and "SAR"; size shall show "m²". | Must |
| FR-LST-07 | Arabic text shall display right-to-left and correctly shaped inside the English layout. | Must |
| FR-LST-08 | Status shall be shown as a word with a coloured badge, never by colour alone. | Must |
| FR-LST-09 | Withdrawn in version 1.2: a card view beside the table. | Withdrawn |
| FR-LST-10 | The list shall show 5, 10, 25 or 50 properties per page (default 10) and return to page 1 when the search, the filters or the page size change. With no search active, the server shall cut each page. | Must |
| FR-LST-11 | Withdrawn in version 1.2: opening a property by selecting its row. Each row's View opens it (FR-LST-03). | Withdrawn |

### 4.4 Property detail

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DET-01 | The detail page shall show every field of the property in these groups: Location, Building, Amenities, Rent and tenancy, Description, Record. | Must |
| FR-DET-02 | The page shall offer Edit, Delete and Back to list. | Must |
| FR-DET-03 | An ID that does not exist, or was deleted, shall show "Property not found" with a link to the list. | Must |
| FR-DET-04 | Tenant and lease details shall appear only when the status is Occupied. | Must |
| FR-DET-05 | The Amenities group shall list the amenities the property has. | Should |
| FR-DET-06 | Withdrawn in version 1.2, with sections 7.2 and 7.3: the market panel. | Withdrawn |

## 5. Functional requirements: add, update and delete

One form adds and edits properties, and every delete is confirmed before it happens.

### 5.1 Add a property

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-ADD-01 | The Add property page shall show a form with every editable field in 3.1. | Must |
| FR-ADD-02 | Required fields shall be visibly marked. | Must |
| FR-ADD-03 | On Save, the app shall check every field against Appendix C. If any check fails: nothing is saved, each error appears beside its field, focus moves to the first invalid field and all entered values stay. | Must |
| FR-ADD-04 | When all checks pass, the app shall create the property with a new unique ID and set `createdAt` and `updatedAt` to the current time. | Must |
| FR-ADD-05 | After saving, the app shall open the new property's detail page and show "Property RP-xxxx added". | Must |
| FR-ADD-06 | The new property shall appear at once in the list, search results and Dashboard figures. | Must |
| FR-ADD-07 | Tenant name and lease dates shall be enabled only when Status is Occupied. Tenant name is then required. | Must |
| FR-ADD-08 | Cancel shall leave the page without saving anything. | Must |
| FR-ADD-09 | The form shall start with Type set to Villa, Status set to Vacant and all amenities unticked. | Should |
| FR-ADD-10 | Withdrawn in version 1.2: asking the user to confirm before leaving a form that has unsaved input. | Withdrawn |
| FR-ADD-11 | Withdrawn in version 1.2: the possible-duplicate warning. | Withdrawn |
| FR-ADD-12 | Text shall be trimmed of leading and trailing spaces. Number fields shall accept only digits and one decimal point: Arabic-Indic digits become 0 to 9, and letters, spaces and thousands separators are dropped as they are typed. A field shall take no more digits than its largest allowed value has (3.1). The decimal point is kept so that the check in Appendix C reports it, instead of the number silently changing. | Should |
| FR-ADD-13 | The Add and Edit forms shall always show the rent model's suggestion for the values entered (7.6), updated as they change and rounded to the nearest 500 SAR, with the note "Based on 2021 listings. Indicative only, not a valuation." A "Use this rent" button shall copy it into Yearly rent; the suggestion shall never change the field by itself. | Could |
| FR-ADD-14 | District shall be chosen from a dropdown of the chosen city's districts in the 2021 data, by their English names. "Other district…" shall open a text box for a district the list lacks, and a stored district the list lacks shall stay a choice when editing. A new city shall clear a district it does not have. | Should |
| FR-ADD-15 | Age and the counts of bedrooms, bathrooms and living rooms shall be chosen from dropdowns of the whole numbers in their ranges (3.1), starting blank. | Should |

### 5.2 Update a property

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-UPD-01 | The Edit page shall open from a list row and from the detail page, with the form filled with the property's current values. | Must |
| FR-UPD-02 | Saving shall apply the same checks as adding (FR-ADD-03). | Must |
| FR-UPD-03 | On Save, the app shall store the new values and set `updatedAt`. The `id` and `createdAt` values shall never change. | Must |
| FR-UPD-04 | After saving, the app shall open the detail page and show "Property RP-xxxx updated". | Must |
| FR-UPD-05 | The updated values shall appear at once in the list, search results and Dashboard figures. | Must |
| FR-UPD-06 | Cancel shall discard the changes. | Must |
| FR-UPD-07 | When Status changes from Occupied to another value, the form shall warn that tenant and lease details will be cleared, and shall clear them on Save. | Must |
| FR-UPD-08 | Withdrawn in version 1.2: keeping Save disabled until a value changes. | Withdrawn |
| FR-UPD-09 | Withdrawn in version 1.2: switching a property between Vacant and Under maintenance from the list. | Withdrawn |

### 5.3 Delete a property

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DEL-01 | Delete shall be available on every list row and on the detail page. | Must |
| FR-DEL-02 | Delete shall open a confirmation dialog that names the property (ID, type, district, city) and offers Cancel and Delete. Cancel shall have focus first, and Esc shall cancel. | Must |
| FR-DEL-03 | On confirmation, the app shall remove the property. It shall disappear at once from the list, search results and Dashboard figures. | Must |
| FR-DEL-04 | The app shall show "Property RP-xxxx deleted". | Must |
| FR-DEL-05 | After a delete from the detail page, the app shall return to the list. | Must |
| FR-DEL-06 | The ID of a deleted property shall never be given to a new property. | Must |
| FR-DEL-07 | Withdrawn in version 1.1: Undo after a delete. Nothing on screen used it, and the data service no longer offers `restore`. | Withdrawn |
| FR-DEL-08 | Withdrawn in version 1.2: deleting several properties together. | Withdrawn |

## 6. Functional requirements: search, filter and sort

Keyword search and filters work together on the property list, in Arabic and in English.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-SRC-01 | A search box shall sit above the property list. | Must |
| FR-SRC-02 | Keyword search shall keep a property when every word typed appears, ignoring letter case, in at least one of: ID, city, district, type, status, tenant name, description, or the labels of the amenities it has. | Must |
| FR-SRC-03 | Results shall update 300 ms after the user stops typing, and at once on Enter. | Must |
| FR-SRC-04 | The page shall offer these filters: City (one or more), Status (one or more), Type, Yearly rent from and to, Size from and to, minimum Bedrooms. | Must |
| FR-SRC-05 | The search box and all filters shall combine: a property is listed only if it satisfies every one of them. | Must |
| FR-SRC-06 | "Clear all" shall empty the search box and reset every filter. | Must |
| FR-SRC-07 | A range whose "from" is greater than its "to" shall show a message and shall not be applied. | Must |
| FR-SRC-08 | Arabic words shall be searchable: typing a district name in Arabic finds the properties in that district. | Must |
| FR-SRC-09 | The user shall be able to sort by Yearly rent, Size, Bedrooms, City or Last updated, ascending or descending. The default is Last updated, newest first. | Should |
| FR-SRC-10 | Amenity tick boxes shall narrow the list to properties that have every ticked amenity. | Should |
| FR-SRC-11 | Arabic matching shall follow Appendix B.4, so that spelling variants of the same word match. | Should |
| FR-SRC-12 | The search text, filters, sort order and page number shall be kept in the URL, so Back restores them and the view can be bookmarked. | Should |
| FR-SRC-13 | Each active filter shall appear as a chip that removes that filter when dismissed. | Should |
| FR-SRC-14 | Withdrawn in version 1.2: highlighting the matched words. | Withdrawn |

Examples of the expected behaviour:

| Typed in the search box | Filters set | Properties listed |
| --- | --- | --- |
| `riyadh villa` | None | Villas in Riyadh |
| `الملقا` | Status: Vacant | Vacant properties whose district or description contains that word |
| `rp-0005` | None | Only the property RP-0005 |
| Nothing | Rent 50,000 to 100,000; Bedrooms at least 4 | Every property in that rent range with four or more bedrooms |
| `pool` | City: Jeddah, Riyadh | Properties in either city that have a pool, or whose description contains "pool" |

## 7. Functional requirements: AI features

The rent model (7.6) is the app's one AI feature. It runs in the browser with no API key, none of its requirements is needed to meet either brief, and it fails safely. Version 1.2 withdrew sections 7.1 to 7.5, which were never built. Their IDs are kept below.

### 7.1 Search by meaning

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-AIS-01 to FR-AIS-13 | Withdrawn in version 1.2: ranking properties by meaning, with a language model run in the browser. | Withdrawn |

### 7.2 Comparable listings

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-CMP-01 to FR-CMP-07 | Withdrawn in version 1.2: the 2021 market listings most like a property. | Withdrawn |

### 7.3 Fair-rent estimate

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-EST-01 to FR-EST-07 | Withdrawn in version 1.2: an estimate from the comparables' median rent, with a market position. The rent suggestion keeps the note "Based on 2021 listings. Indicative only, not a valuation." (FR-ADD-13). | Withdrawn |

### 7.4 Market insights

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-INS-01 to FR-INS-04 | Withdrawn in version 1.2: a page of market statistics at `/insights`, which now shows "Page not found". | Withdrawn |

### 7.5 Plain-language input

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-NLI-01 to FR-NLI-04 | Withdrawn in version 1.2: filling the Add form from an English sentence, with Chrome's on-device language model. | Withdrawn |

### 7.6 Rent model

The team trains one model, in `ai-model/prepare.ipynb`: Ridge regression on the log of the yearly rent, learned from the 2021 listings after cleaning. On 304 houses held out from training, its suggestions are off by 23.1% of the rent on average (22,998 SAR), and 46.1% of them fall within 15% of the real rent. The app runs it in the browser from its exported weights, `frontend/src/data/rent-model.json`, which hold no rows of the dataset. FR-ADD-13 is its one use.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-RNT-01 | The model shall use the city, district, front, type, size, age, room counts and amenities, and whether the description mentions an annex (ملحق) or an internal staircase (درج داخلي). District names are compared after Appendix B.4, including step 8, and only within their city. A district chosen by its English name (FR-ADD-14) is found by the Arabic name the list pairs it with. | Could |
| FR-RNT-02 | The weights shall be loaded when a form first shows the suggestion, never with the first page. No property data shall leave the browser. | Could |
| FR-RNT-03 | When the city, size, age or a room count is missing or fails its check in Appendix C, the app shall ask for them and suggest nothing. | Could |
| FR-RNT-04 | For a size outside the sizes the model learned from (100 to 1,652 m²), the app shall suggest nothing and say why. | Could |
| FR-RNT-05 | When the district is not in the model's data, the app shall still suggest a rent and say that it is less precise. | Could |
| FR-RNT-06 | If the weights cannot be loaded, the app shall say so, and the form shall work as before. | Could |
| FR-RNT-07 | When the entered rent is more than 3 times the suggestion or less than a third of it, the form shall warn that it may be mistyped. The warning shall not stop Save. | Could |

## 8. Functional requirements: About, feedback and data

The About page identifies the team, every action gets visible feedback, and all data goes through one service module, which calls the Spring server.

### 8.1 About page

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-ABT-01 | The About page shall open from the About menu item. | Must |
| FR-ABT-02 | The page shall list every team member with full name and student ID. | Must |
| FR-ABT-03 | The page shall show the course (SE411) and the term (Fall 2026-27). | Must |
| FR-ABT-04 | The page shall describe the app in one paragraph, list the technologies used and link to the GitHub repository. | Should |
| FR-ABT-05 | The page shall credit the dataset (name, source, year). | Should |
| FR-ABT-06 | Team names and IDs shall be kept in one configuration file. | Should |

### 8.2 Feedback and errors

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-FBK-01 | Every add, update and delete shall show a confirmation message. It disappears after 5 seconds and can be dismissed sooner. | Must |
| FR-FBK-02 | Confirmation and error messages shall be announced to screen readers. | Must |
| FR-FBK-03 | An unexpected error on a page shall show an error screen with a Reload button, not a blank page. | Must |
| FR-FBK-04 | Any wait longer than 300 ms shall show a progress indicator. | Should |

### 8.3 Data management

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DAT-01 | At start, the app shall load the portfolio from the Spring server, whose database starts from a seed of 8 property objects (3.4). | Must |
| FR-DAT-02 | The portfolio shall be stored in the Spring server's database and reached only through its REST API. The browser shall keep only what the server returned. | Must |
| FR-DAT-03 | All reading and writing of properties shall go through one data-service module with the operations in the table below, each returning a Promise. | Must |
| FR-DAT-04 | Every property ID shall be unique and never reused. The server's database issues it. | Must |
| FR-DAT-05 | Withdrawn in version 1.1: Reset demo data. Resetting a database the team shares is risky, and the data service no longer offers `reset`. | Withdrawn |
| FR-DAT-06 | Withdrawn in version 1.1: the reload notice. Since Part 2, changes survive a reload. | Withdrawn |
| FR-DAT-07 | Withdrawn in version 1.2, with the market reference set (3.3). | Withdrawn |
| FR-DAT-08 | Withdrawn in version 1.2: downloading the portfolio as a CSV file. | Withdrawn |

Since Part 2 the data service calls the Spring server's routes ([backend-plan.md](backend-plan.md), section 3):

| Operation | Input | Returns | Fails when | Route |
| --- | --- | --- | --- | --- |
| `list()` | Nothing | All properties | Only when the server cannot be reached | `GET /api/v1/properties?page=0&size=1000` |
| `listPage(page, perPage)` | A page counted from 1, and its size | That page, newest first, with the totals | Only when the server cannot be reached | `GET /api/v1/properties?page=&size=` |
| `getById(id)` | A property ID | That property | No property has the ID | `GET /api/v1/properties/{n}` |
| `create(values)` | Field values without `id` or timestamps | The new property | A check in Appendix C fails | `POST /api/v1/properties` |
| `update(id, values)` | A property ID and the changed values | The updated property | No property has the ID, or a check fails | `PUT /api/v1/properties/{n}` |
| `remove(id)` | A property ID | The removed property's ID | No property has the ID | `DELETE /api/v1/properties/{n}` |

Every operation also fails when the server cannot be reached. All six are Must. `restore` and `reset` were removed in version 1.1, with FR-DEL-07 and FR-DAT-05.

## 9. External interface requirements

The app talks to one thing outside the browser: the team's Spring server, which keeps the portfolio.

### 9.1 User interface

| ID | Requirement | Priority |
| --- | --- | --- |
| UI-01 | Every page shall share one layout: a header with the app name and menu, the page content, and a footer with the course and the data credit. | Must |
| UI-02 | Each page shall have one main heading that names it. | Must |
| UI-03 | Form labels shall sit above their inputs, with units (m², SAR, years) shown beside number fields. | Must |
| UI-04 | The Add and Edit forms shall group fields under: Location, Building, Amenities, Rent and tenancy, Description. | Must |
| UI-05 | Primary actions (Save, Add property) shall look different from secondary actions (Cancel). Delete shall use a warning style. | Should |
| UI-06 | Colours, spacing and type sizes shall come from one set of design tokens. | Should |
| UI-07 | Withdrawn in version 1.2: a dark theme. | Withdrawn |

| Screen | Purpose | Main elements |
| --- | --- | --- |
| Dashboard | See the portfolio at a glance | Summary figures, city table, needs-attention list, shortcuts |
| Property list | Find and browse properties | Search box, filters, filter chips, sort, table, pagination |
| Property detail | Read one property in full | Field groups, Edit, Delete |
| Add and Edit property | Enter or change a property | Grouped form, inline errors, rent suggestion, Save, Cancel |
| About | Identify the team | Names, student IDs, course, credits |
| Delete dialog | Confirm a delete | Property name, Cancel, Delete |
| Not found | Recover from a bad URL | Message, link to the Dashboard |

### 9.2 Hardware interfaces

None. The app needs no camera, microphone, location or other device access.

### 9.3 Software interfaces

| Interface | Used for | Notes |
| --- | --- | --- |
| Web browser | Running the app | The browsers listed in 2.4 |
| The team's Spring server | Storing the portfolio (Part 2) | REST routes under `/api/v1/properties`, reached through the development server's `/api` proxy ([backend-plan.md](backend-plan.md)) |

### 9.4 Communication interfaces

| ID | Requirement | Priority |
| --- | --- | --- |
| IF-01 | Apart from its calls to the team's Spring server, the app shall make HTTPS GET requests only, for its own files. | Must |
| IF-02 | The app shall send property data only to the team's Spring server, and no search text to any server. | Must |
| IF-03 | The app shall use no cookies, analytics or third-party trackers. | Must |
| IF-04 | Withdrawn in version 1.2, with search by meaning: fetching the language model's files at run time. | Withdrawn |

## 10. Non-functional requirements

The app must stay fast, work by keyboard alone, and keep secrets and personal data out of a public repository.

### 10.1 Performance

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-PERF-01 | The first page shall be usable within 3 seconds on a laptop with a broadband connection. | Must |
| NFR-PERF-02 | Search, filter and sort results shall appear within 200 ms of being triggered, for a portfolio of 500 properties. For typed search, that is after the pause in FR-SRC-03. | Must |
| NFR-PERF-03 | An add, update or delete shall show in the interface within 100 ms. | Must |
| NFR-PERF-04 | Withdrawn in version 1.2, with search by meaning: loading the AI library only on first use. FR-RNT-02 keeps that rule for the rent model. | Withdrawn |
| NFR-PERF-05 | Withdrawn in version 1.2, with comparables and the estimate. | Withdrawn |
| NFR-PERF-06 | Withdrawn in version 1.2, with search by meaning. | Withdrawn |
| NFR-PERF-07 | The JavaScript the first page loads shall be under 300 kB compressed. | Should |

### 10.2 Usability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-USE-01 | Add, edit, delete and search shall each be reachable within 2 clicks from any page. | Must |
| NFR-USE-02 | The layout shall work from 360 px to 1920 px wide without the page scrolling sideways. Wide tables may scroll inside their own frame. | Must |
| NFR-USE-03 | Every destructive action shall need a confirmation (FR-DEL-02). | Must |
| NFR-USE-04 | Error messages shall say what is wrong and how to fix it, in plain words (Appendix C). | Must |
| NFR-USE-05 | The same word shall name the same thing on every page: always "property" for a portfolio item, and "listing" only for a house in the 2021 data. | Should |

### 10.3 Accessibility

The target is WCAG 2.2 level AA for the points below.

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-ACC-01 | Every feature shall work with the keyboard alone, with a visible focus indicator. | Must |
| NFR-ACC-02 | Text shall have a contrast ratio of at least 4.5:1 against its background. | Must |
| NFR-ACC-03 | Every form input shall have a label that assistive technology can read, and each error shall be linked to its field. | Must |
| NFR-ACC-04 | Pages shall use header, navigation, main and footer landmarks and a logical heading order. | Must |
| NFR-ACC-05 | Information shall never be conveyed by colour alone. | Must |
| NFR-ACC-06 | Dialogs shall keep focus inside while open, close on Esc and return focus to the control that opened them. | Should |
| NFR-ACC-07 | Arabic text shall be marked with its language and direction, so screen readers pronounce it correctly. | Should |
| NFR-ACC-08 | Withdrawn in version 1.2: an automated accessibility check of every page. NFR-ACC-01 to NFR-ACC-07 still apply. | Withdrawn |

### 10.4 Reliability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-REL-01 | The acceptance scenarios in section 14 shall run with no uncaught error in the browser console. | Must |
| NFR-REL-02 | A failure of the rent model (7.6) shall not stop any Must feature from working. | Must |
| NFR-REL-03 | No invalid property shall ever enter the portfolio. The data service shall apply the Appendix C checks itself and not rely on the form. | Must |
| NFR-REL-04 | The portfolio state shall never be changed in place; every change shall produce a new collection. | Should |

### 10.5 Security and privacy

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-SEC-01 | The repository and the built app shall contain no API keys, tokens or passwords. | Must |
| NFR-SEC-02 | Seed data shall contain no real personal data. The properties and tenant names are invented (3.4). | Must |
| NFR-SEC-03 | User-entered text shall always be rendered as text, never as HTML. | Must |
| NFR-SEC-04 | The README and the About page shall credit the dataset. The team shall confirm that its licence allows reuse before publishing data derived from it (open question 3). | Must |
| NFR-SEC-05 | Dependencies shall be pinned with a lockfile, and `npm audit` shall report no high or critical issue at submission. | Should |

### 10.6 Maintainability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-MNT-01 | Field checks, filtering, sorting and the rent model's logic shall be pure functions with no interface code, so they can be unit-tested. | Must |
| NFR-MNT-02 | The README shall explain how to install, run, test and build the app. | Must |
| NFR-MNT-03 | Code shall be organised by feature (properties, dashboard, search, about), with shared components kept separately. | Should |
| NFR-MNT-04 | Choices, thresholds, labels and team details shall live in configuration modules, not be repeated in components. | Should |
| NFR-MNT-05 | The linter and formatter shall report no errors at submission. | Should |
| NFR-MNT-06 | Withdrawn in version 1.2: a limit of about 250 lines per component file. | Withdrawn |

### 10.7 Compatibility

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-COM-01 | Every Must requirement shall work in the latest two versions of Chrome, Edge, Firefox and Safari. | Must |
| NFR-COM-02 | The app shall start with `npm install` then `npm run dev`. `npm run build` shall produce static files that any static host can serve. | Must |
| NFR-COM-03 | Withdrawn in version 1.2, with search by meaning. | Withdrawn |

### 10.8 Testability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-TST-01 | `npm test` shall run all automated tests, and they shall pass at submission. | Must |
| NFR-TST-02 | Unit tests shall cover: field checks, keyword search, filters, sorting, ID generation and Arabic normalisation. | Must |
| NFR-TST-03 | Component tests shall cover: the form with valid and invalid input, the list, the delete dialog and the About page. | Must |
| NFR-TST-04 | Withdrawn in version 1.2, with search by meaning: replacing the language model with a stub in tests. | Withdrawn |
| NFR-TST-05 | The test output and coverage summary shall be saved in the repository (PD-05). | Must |
| NFR-TST-06 | Statement coverage of the code under `src/` shall be at least 70%. | Should |

## 11. Technology stack and repository structure

React is required by the brief. Every other choice below is a recommended default that the team may change before coding starts.

### 11.1 Technology stack

| Concern | Choice | Reason |
| --- | --- | --- |
| Interface library | React 19 or later | Required by the brief (C-01) |
| Language | JavaScript with JSDoc type comments | No extra tooling to learn. TypeScript is an accepted alternative (open question 5) |
| Build tool | Vite | One of the build tools [React's own guide](https://react.dev/learn/build-a-react-app-from-scratch) names for apps built from scratch |
| Routing | React Router | Client-side pages and URLs (FR-NAV-03, FR-NAV-05) |
| State | React Context with a reducer | The portfolio is one small collection, so no state library is needed |
| Styling | CSS Modules, with design tokens as CSS variables | No dependency; satisfies UI-06 |
| Tests | Vitest with React Testing Library | Runs in the Vite toolchain and tests behaviour through the interface |
| Code quality | ESLint and Prettier | NFR-MNT-05 |
| Team photos | `vite-imagetools` | Crops and shrinks the photos on the About page when the app is built |
| Server (Part 2) | Java 21, Spring Boot 4.1, Spring Data JDBC, H2 or Supabase Postgres | [backend-plan.md](backend-plan.md) |

Use the latest stable release of each tool when the project starts, and commit the lockfile (NFR-SEC-05).

### 11.2 Repository structure

The repository holds both parts of the project. Part 1 lives in `frontend/`, and paths in this document that begin with `src/` are relative to that folder. Part 2, the Spring server, lives in `backend/` ([backend-plan.md](backend-plan.md)).

```
darscope/
├── README.md              install, run, test, build, credits
├── CLAUDE.md              instructions for the AI coding tool
├── .claude/               rules, settings and skills for the AI coding tool
├── docs/
│   ├── SRS.md             this document, exported
│   ├── part-2-brief.md    the Part 2 brief
│   ├── backend-plan.md    the server's REST contract, table, checks and tests
│   ├── tasks.md           the open tasks, most important first
│   ├── design/            wireframes and style guide
│   ├── architecture.md
│   ├── features.md
│   ├── test-report.md
│   ├── code-review.md
│   └── ai-usage.md
├── frontend/              Part 1: the React app
│   ├── package.json
│   ├── index.html
│   ├── public/            favicon
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            the router and the providers every page needs
│       ├── routes/            routes.jsx (the URL to page table), paths.js
│       ├── layouts/           AppLayout, NavMenu, Footer
│       ├── pages/             one component per URL
│       ├── components/
│       │   ├── ui/            Button, Badge, Dialog, FormField, Message, Page, Pager
│       │   ├── properties/    table, form, delete dialog, rent suggestion
│       │   ├── dashboard/
│       │   ├── search/        search box, filters, filter chips
│       │   └── about/         the team gallery
│       ├── context/           portfolio context and reducer
│       ├── hooks/             shared hooks
│       ├── services/          propertyService.js, rentModelService.js
│       ├── utils/             validation, search, searchParams, sort, arabic, format,
│       │                      stats, photos, rentModel
│       ├── constants/         choices, thresholds, labels, team details
│       ├── styles/            tokens.css, global.css
│       ├── data/              rent-model.json, districts.json
│       ├── assets/            the team photos
│       └── test/              setup, shared fixtures, and the in-memory stand-in for
│                              the server with its seed, portfolio.seed.json
├── ai-model/              the rent model, trained in prepare.ipynb
└── backend/               Part 2: the Spring server
```

The layout is layered: each folder under `src/` holds one kind of code. Each test file sits beside the module it tests and ends in `.test.js` or `.test.jsx`.

## 12. Project deliverables

The brief asks for more than working code: the repository must also hold the AI-generated requirements, design, documentation, tests and code review.

| ID | Deliverable | Location | Complete when | Source |
| --- | --- | --- | --- | --- |
| PD-01 | Public GitHub repository with the full source | Repository root | One team member has submitted its URL | Brief |
| PD-02 | Requirements produced with an AI tool | `docs/SRS.md` | This SRS is exported and committed | Brief |
| PD-03 | Visual design produced with an AI tool | `docs/design/` | Wireframes for every screen in 9.1 and a style guide (colours, type, spacing) are committed | Brief |
| PD-04 | Documentation of the architecture, technology stack and features | `docs/architecture.md`, `docs/features.md`, `README.md` | Each matches the code as submitted | Brief |
| PD-05 | Tests generated with an AI tool, and proof they were run | Test files under `src/`; `docs/test-report.md` | The report holds the full test output, the coverage summary and the date of the run | Brief |
| PD-06 | AI code review covering security, performance, code quality and code reuse | `docs/code-review.md` | Each finding has a severity and a decision: fixed, or accepted with a reason | Brief |
| PD-07 | Record of AI use | `docs/ai-usage.md` | It names the AI tool used for each deliverable above | Team decision |
| PD-08 | Submission on time | Course submission page | The repository URL is submitted on or before 17 October 2026 | Brief |

## 13. Traceability matrix

Every requirement in the course brief is covered by at least one Must requirement, constraint or deliverable in this SRS.

| ID | Brief requirement | Covered by |
| --- | --- | --- |
| BR-01 | The project must be a React project | C-01; section 11.1 |
| BR-02 | Manage one kind of company asset | C-04; section 1.2 |
| BR-03 | Store (add) data | FR-ADD-01 to FR-ADD-08 |
| BR-04 | Remove or delete data | FR-DEL-01 to FR-DEL-06 |
| BR-05 | Update data | FR-UPD-01 to FR-UPD-07 |
| BR-06 | Search data | FR-SRC-01 to FR-SRC-08 |
| BR-07 | Display data | FR-LST-01 to FR-LST-08; FR-DET-01 to FR-DET-04; FR-DSH-01 to FR-DSH-04 |
| BR-08 | A menu to navigate between the app's features | FR-NAV-01; FR-NAV-03 to FR-NAV-06 |
| BR-09 | An About page with each member's name and student ID, opened from a menu item | FR-ABT-01 to FR-ABT-03; FR-NAV-01 |
| BR-10 | Data defined as a collection of objects, not stored in a database | C-02; C-03; FR-DAT-01 to FR-DAT-04 |
| BR-11 | Use an AI tool to specify the requirements | PD-02 |
| BR-12 | Use an AI tool for the visual design | PD-03 |
| BR-13 | Use an AI tool to code the frontend | C-06; PD-07 |
| BR-14 | Share the code on a public GitHub repository | C-05; PD-01 |
| BR-15 | Generate documentation of the architecture, technology stack and features | PD-04 |
| BR-16 | Generate tests and run them | PD-05; NFR-TST-01 to NFR-TST-05 |
| BR-17 | Generate a code review covering security, performance, code quality and code reuse | PD-06 |
| BR-18 | Groups of three; one student submits the repository URL | FR-ABT-02; PD-01 |
| BR-19 | Deadline of 17 October 2026 | PD-08 |

Section 7.6, the rent model, goes beyond the brief. None of its requirements is a Must, so the app meets the brief without it. Sections 7.1 to 7.5 were withdrawn in version 1.2.

## 14. Acceptance scenarios

The app is accepted when every Must scenario below passes in a current desktop browser. Each scenario starts from the 8-property seed, with IDs RP-0001 to RP-0008 (3.4). On the server's default H2 database, restarting the server brings the seed back.

| ID | Scenario and steps | Expected result | Covers | Priority |
| --- | --- | --- | --- | --- |
| AC-01 | **Navigate.** Open the app. Choose each menu item in turn. Press Back twice. | Each page opens without a full reload. The current item is marked. Back returns through the pages visited. | FR-NAV-01, 03 to 06 | Must |
| AC-02 | **Add a valid property.** Open Add property. Enter City Riyadh, District Al Malqa, Type Villa, Size 400, Age 3, Bedrooms 5, Bathrooms 4, Living rooms 2, Yearly rent 120000, Status Vacant. Save. | The detail page opens with "Property RP-0009 added". The list count is 9. The Dashboard total is 9. | FR-ADD-01 to 06 | Must |
| AC-03 | **Reject invalid input.** Open Add property. Fill in every required field correctly, except: leave District empty, enter Size 5 and choose Status Occupied with no tenant name. Save. | Nothing is saved. Errors appear beside District, Size and Tenant name. Focus is on District. The other entries remain. | FR-ADD-03, 07 | Must |
| AC-04 | **Cancel an add.** Fill in the Add form. Choose Cancel. | The list still shows 8 properties. | FR-ADD-08 | Must |
| AC-05 | **Update.** Open RP-0003. Choose Edit. Change Yearly rent to 98000. Save. | The detail page shows 98,000 SAR and "Property RP-0003 updated". ID and created date are unchanged. Last updated is now. Dashboard rent totals reflect the change. | FR-UPD-01 to 05 | Must |
| AC-06 | **Status change clears tenancy.** Edit an Occupied property. Set Status to Vacant. Save. | A warning appears before saving. Afterwards the tenant and lease details are gone. The Dashboard shows one fewer Occupied and one more Vacant. | FR-UPD-07; FR-DSH-03 | Must |
| AC-07 | **Delete with confirmation.** On the list, choose Delete on RP-0005, then Cancel. Choose Delete again and confirm. | After Cancel the property remains. After confirming it disappears, the count is 7 and "Property RP-0005 deleted" shows. The URL `/properties/RP-0005` shows "Property not found". | FR-DEL-01 to 05; FR-DET-03 | Must |
| AC-08 | **IDs are not reused.** Delete RP-0008. Add a new property. | The new property is RP-0009, not RP-0008. | FR-DEL-06; FR-DAT-04 | Must |
| AC-09 | **Keyword search.** On the list, type `jeddah`. | Only properties whose text contains "jeddah" are listed. The count reads "Showing X of 8 properties". | FR-SRC-01 to 03; FR-LST-04 | Must |
| AC-10 | **Arabic search.** Type the Arabic name of a district that exists in the seed. | Properties in that district are listed, with the Arabic text displayed right-to-left. | FR-SRC-08; FR-LST-07 | Must |
| AC-11 | **Combined filters.** Set City to Riyadh, Status to Vacant and minimum Bedrooms to 4. Then choose Clear all. | Only vacant Riyadh properties with 4 or more bedrooms are listed. Clear all restores all 8. | FR-SRC-04 to 06 | Must |
| AC-12 | **No results.** Type `zzzz`. | A "no properties match" message and a Clear all button appear. | FR-LST-05 | Must |
| AC-13 | **Invalid range.** Set Yearly rent from 200000 to 100000. | A message explains that the range is invalid. The list is unchanged. | FR-SRC-07 | Must |
| AC-14 | **Dashboard figures.** Note the Dashboard figures. Add one Occupied property with rent 60000. Return to the Dashboard. | Total and Occupied each rise by 1. Rent from occupied properties rises by 60,000. The occupancy rate is recalculated. | FR-DSH-01 to 03 | Must |
| AC-15 | **About page.** Choose About. | Every team member's name with student ID, SE411 and Fall 2026-27 are shown. | FR-ABT-01 to 03 | Must |
| AC-16 | **Keyboard only.** Using only the keyboard, add a property and then delete it. | Every control is reachable with a visible focus indicator. The delete dialog closes on Esc. | NFR-ACC-01; FR-DEL-02 | Must |
| AC-17 | **Reload.** Add a property. Reload the page. | The new property is still there, because the server kept it. | FR-DAT-01, 02 | Must |
| AC-18 | Withdrawn in version 1.1, with FR-DEL-07. | – | FR-DEL-07 | Withdrawn |
| AC-19 | Withdrawn in version 1.2, with comparables and the estimate (7.2, 7.3). | – | FR-CMP-01 to 04; FR-EST-01 to 05 | Withdrawn |
| AC-20 | Withdrawn in version 1.2, with comparables (7.2). | – | FR-CMP-05 | Withdrawn |
| AC-21 | Withdrawn in version 1.2, with search by meaning (7.1). | – | FR-AIS-01 to 06 | Withdrawn |
| AC-22 | Withdrawn in version 1.2, with search by meaning (7.1). | – | FR-AIS-09 | Withdrawn |
| AC-23 | **Small screen.** Narrow the browser to 360 px. | The page does not scroll sideways. The menu collapses behind a toggle. Every action remains reachable. | NFR-USE-02; FR-NAV-08 | Should |

## 15. Scope limits, risks, open questions and build order

Part 1 stops at the browser. The main risk was the deadline, handled by building every Must requirement first.

### 15.1 Out of scope for Part 1

- A backend, an API and a database. These are Part 2.
- Login, user accounts and roles.
- Keeping changes after a page reload.
- Property types other than villas and duplexes, because the reference data covers rental houses only.
- Rent collection, payments, invoices and maintenance requests.
- Photos, documents and other file uploads.
- Maps and location lookup.
- An Arabic user interface. Arabic data is supported; the labels are English.
- Live or current market data.
- Email or push notifications.

### 15.2 Risks

| ID | Risk | Effect | Response |
| --- | --- | --- | --- |
| R-1 | The deadline is 17 October 2026 | AI features crowd out required ones | Build all Must requirements first (15.4). AI features are Should or Could |
| R-2 | Withdrawn in version 1.2, with search by meaning | – | – |
| R-3 | Withdrawn in version 1.2, with the market reference set | – | – |
| R-4 | Withdrawn in version 1.2, with comparables | – | – |
| R-5 | The dataset's rents date from 2021 | Suggestions differ from today's market | A fixed note under every suggestion (FR-ADD-13) |
| R-6 | The dataset's licence is unconfirmed | Derived data may not be publishable | Commit only the rent model's weights and district list, never rows of the dataset (open question 3) |
| R-7 | Withdrawn in version 1.2: the app holds no listing descriptions | – | – |
| R-8 | AI-generated code may contain defects or weak tests | Rework late in the project | Review each generated change, run the tests, act on the code review (PD-05, PD-06) |

### 15.3 Open questions for the instructor

- [x] 1\. Is it acceptable that changes are lost when the page reloads, or should the app use browser storage? No longer applies: since Part 2 the server keeps every change.
- [ ] 2\. Does "remove data, delete" in the brief mean one delete feature?
- [ ] 3\. May a public Kaggle dataset be used to train the rent model, with credit? The team must also read the licence on the dataset's page.
- [ ] 4\. Are any testing, styling or build tools required or forbidden?
- [ ] 5\. Is TypeScript allowed in place of JavaScript?
- [ ] 6\. Must the app be deployed online, or is the repository URL enough?
- [ ] 7\. Are AI features welcome as extras, and should they be documented in a particular way?

### 15.4 Suggested build order

| Step | Dates in October 2026 |
| --- | --- |
| Design, menu, About, seed data | 6 to 7 |
| List, detail, dashboard | 7 to 9 |
| Add, edit, delete | 9 to 11 |
| Search, filters, sort | 11 to 12 |
| **All Must requirements pass** | **12** |
| Comparables, estimate, insights | 13 to 14 |
| Search by meaning | 14 to 15 |
| Final tests, review, documents | 15 to 16 |
| Submit the repository URL | 17 |

The visual design (PD-03) is produced on 6 October, before any code. Tests are written alongside each feature. 15 and 16 October are for the final test run, the code review and the documents. Version 1.2 withdrew the features of the two AI steps (sections 7.1 to 7.4).

## Appendix A. Seed data preparation

Withdrawn in version 1.2. The starting properties are written by hand (3.4), so no script turns the dataset into data files, and no rows of it are committed. The rent model's own cleaning of the dataset is in `ai-model/prepare.ipynb`.

## Appendix B. Reference algorithms

B.1 to B.3 were withdrawn in version 1.2 with the features that used them. B.4 is still in use: keyword search (FR-SRC-11) and the rent model (FR-RNT-01) follow it.

### B.1 Search text and embeddings

Withdrawn in version 1.2, with search by meaning (7.1).

### B.2 Comparables

Withdrawn in version 1.2, with comparable listings (7.2).

### B.3 Fair-rent estimate and market position

Withdrawn in version 1.2, with the fair-rent estimate (7.3).

### B.4 Text normalisation for matching

Apply these steps to both the words typed and the text searched. They are for matching only; the app always displays the original text.

1. Lower-case Latin letters.
2. Remove Arabic diacritics (U+064B to U+0652) and the tatweel (U+0640).
3. Replace أ, إ, آ and ٱ with ا.
4. Replace ى with ي.
5. Replace ة with ه.
6. Convert the Arabic-Indic digits ٠ to ٩ into 0 to 9.
7. Collapse repeated spaces and trim.
8. For comparing district names in the rent model (FR-RNT-01) only, also remove a leading "حي " (the word for district).

| Input | After normalisation |
| --- | --- |
| ` Al Malqa  ` | `al malqa` |
| `الروضة` | `الروضه` |
| `أحمد` | `احمد` |
| `حي المَلْقا` | `حي الملقا` |

## Appendix C. Validation rules and messages

The form and the data service apply the same checks, in this order, and show these exact messages.

### C.1 Field checks

| Field | Check | Message |
| --- | --- | --- |
| City | A city is chosen | Choose a city. |
| District | Not empty after trimming | Enter the district. |
| District | 2 to 60 characters | District must be 2 to 60 characters. |
| Type | Villa or Duplex is chosen | Choose a property type. |
| Size | A whole number is entered | Enter the size in m² as a whole number. |
| Size | 20 to 100,000 | Size must be between 20 and 100,000 m². |
| Property age | A whole number from 0 to 100 | Age must be a whole number from 0 to 100 years. |
| Bedrooms | A whole number from 0 to 20 | Bedrooms must be a whole number from 0 to 20. |
| Bathrooms | A whole number from 0 to 20 | Bathrooms must be a whole number from 0 to 20. |
| Living rooms | A whole number from 0 to 20 | Living rooms must be a whole number from 0 to 20. |
| Yearly rent | A whole number is entered | Enter the yearly rent in SAR as a whole number. |
| Yearly rent | 1,000 to 10,000,000 | Yearly rent must be between 1,000 and 10,000,000 SAR. |
| Description | At most 2,000 characters | Description must be 2,000 characters or fewer. |
| Status | A status is chosen | Choose a status. |
| Tenant name | Present when Status is Occupied | Enter the tenant's name for an occupied property. |
| Tenant name | 2 to 80 characters | Tenant name must be 2 to 80 characters. |
| Lease end | Later than lease start, when both are given | Lease end must be after lease start. |
| Rent filter | "From" is not above "to" | The lowest rent cannot be above the highest. |
| Size filter | "From" is not above "to" | The smallest size cannot be above the largest. |

### C.2 Other fixed messages

| Event | Message |
| --- | --- |
| Property added | Property RP-xxxx added |
| Property updated | Property RP-xxxx updated |
| Property deleted | Property RP-xxxx deleted |
| Delete undone | Withdrawn in version 1.1, with FR-DEL-07 |
| Demo data reset | Withdrawn in version 1.1, with FR-DAT-05 |
| Server cannot be reached | The Darscope server could not be reached. Check that it is running, then try again. |
| Search has no matches | No properties match your search. |
| Portfolio is empty | No properties yet. Add your first property. |
| Unknown property ID | Property not found |
| Possible duplicate | Withdrawn in version 1.2, with FR-ADD-11 |
| Status leaves Occupied | Changing the status will clear the tenant and lease details. |
| Before the model download | Withdrawn in version 1.2, with section 7.1 |
| Model cannot load | Withdrawn in version 1.2, with section 7.1 |
| Too few comparables | Withdrawn in version 1.2, with section 7.2 |
| Under every rent suggestion | Based on 2021 listings. Indicative only, not a valuation. |
| Rent suggested | The label "Suggested rent", with the amount under it: X SAR |
| Rent suggestion without the fields it needs | Enter the city, size, age and room counts to get a suggestion. |
| Rent suggestion for a size outside the model's data | The 2021 data has no houses of this size, so no rent is suggested. |
| Rent suggestion for an unknown district | This district is not in the 2021 data, so the suggestion is less precise. |
| Rent model cannot load | The rent suggestion could not be loaded. Enter the rent yourself. |
| Rent far from the suggestion | This rent is far from the suggestion. Check it for a typing mistake. |

## References

- Course brief: Project SE411 (Fall 2026-27), Part 1, as issued to the team, and Part 2, copied in [part-2-brief.md](part-2-brief.md).
- Dataset, for the rent model: [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar), Kaggle.
- Project setup: [Build a React app from scratch](https://react.dev/learn/build-a-react-app-from-scratch), react.dev.
- Accessibility target: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C.
