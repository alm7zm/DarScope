# Software Requirements Specification: Darscope

Version 1.0 draft, exported 5 October 2026 from the team's SRS document. The two diagrams are given as text.

## 1. Introduction

This SRS defines what the Part 1 frontend must do: a React application that manages a company's rental houses, running entirely in the browser.

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
- Three AI-assisted features that run in the browser: search by meaning, comparable listings and a fair-rent estimate.

Section 15 lists what is out of scope, including the backend that Part 2 adds.

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| Property | One rental house the company owns; the asset this app manages |
| Portfolio | All properties the user manages in the app |
| Market reference set | Read-only public rental listings from 2021, used only for comparison |
| Comparable | A market listing similar to a given property |
| Fair-rent estimate | The median yearly rent of a property's comparables |
| Search by meaning | Search that ranks properties by how close their meaning is to the query, not by matching words |
| Embedding | A list of numbers a language model produces to represent the meaning of a text |
| Seed data | The properties loaded when the app starts |
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
| Project | Part 1 (frontend) |
| Version | 1.0 draft |
| Submission deadline | Oct 17, 2026 |
| Team member 1 | Name and student ID to add |
| Team member 2 | Name and student ID to add |
| Team member 3 | Name and student ID to add |

## 2. Overall description

Darscope is a standalone single-page app: all data and every AI feature run in the browser, and nothing is stored on a server.

### 2.1 Product perspective

Part 1 delivers the frontend only. Part 2 adds a hand-coded backend, so Part 1 keeps all data access behind one service module (C-07).

The app works with two separate collections:

- **Portfolio**: the company's own properties. The user adds, edits and deletes these.
- **Market reference set**: public rental listings from 2021. Read-only, used for comparables, estimates and market insights.

**Architecture, as text.** The original document shows this as a diagram.

- **Pages** (Dashboard, Properties, Add and Edit, Detail, Market insights, About) use three modules:
  - **Portfolio state**: the property objects, held in memory. Every read and write goes through the data service.
  - **Market module**: comparables, estimate and insights. It reads the market reference set.
  - **Meaning search**: embeds and ranks properties by meaning. It uses Transformers.js.
- **Data service**: `list`, `getById`, `create`, `update`, `remove`. Part 2 replaces this module. It loads the seed file (40 property objects) at start.
- **Market reference**: read-only listings from 2021, loaded on first use.
- **Transformers.js**: runs the language model on the device, loaded on request.
- **Model host** (the only part outside the browser): the Hugging Face hub. About 135 MB, fetched once when the user agrees.
- Nothing typed or stored in the browser is sent to any server.

Pages read and change the portfolio only through the data service, which Part 2 will replace. The language model is the one thing fetched from outside.

### 2.2 Product functions

| Function | What the user can do | Section |
| --- | --- | --- |
| Navigate | Move between pages from a menu | 4.1 |
| Dashboard | See portfolio totals, occupancy and rent | 4.2 |
| Display | Browse the property list and open one property | 4.3, 4.4 |
| Add | Register a new property | 5.1 |
| Update | Change any detail of a property | 5.2 |
| Delete | Remove a property, with undo | 5.3 |
| Search | Find properties by keyword, filters and sorting | 6 |
| Search by meaning | Find properties by describing them in Arabic or English | 7.1 |
| Comparables and estimate | See similar market listings and a fair-rent estimate | 7.2, 7.3 |
| Market insights | Read market statistics by city and district | 7.4 |
| About | See the team and course details | 8.1 |

### 2.3 Users

There is one user class, the **portfolio manager**: a staff member who keeps the property records up to date. They are comfortable with web apps and read English; the data they enter may be Arabic.

Part 1 has no login, so every visitor has full access. The instructor evaluates the app through the same interface.

### 2.4 Operating environment

- Desktop and laptop browsers: the latest two versions of Chrome, Edge, Firefox and Safari.
- Screen widths from 360 px to 1920 px.
- An internet connection to load the app, and once more to download the language model for search by meaning.
- For developers: a current Node.js LTS release and npm.

### 2.5 Constraints

| ID | Constraint | Source |
| --- | --- | --- |
| C-01 | The app shall be a React project. | Brief |
| C-02 | The app shall run entirely in the browser, with no server-side code and no database. | Brief |
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
| A-01 | The instructor accepts that changes are lost when the page reloads. | Add browser storage (open question 1 in section 15). |
| A-02 | The public dataset may be used as seed and reference data, with credit. | Replace it with invented data and drop comparables and estimates. |
| A-03 | The language model stays downloadable from its public host. | Search by meaning falls back to keyword search (FR-AIS-09). |
| A-04 | Market rents from 2021 are acceptable for a demonstration. | The app already labels them as indicative; no requirement changes. |
| A-05 | The evaluator uses a current desktop browser. | Must requirements still work on every browser in 2.4. |
| A-06 | Every listing in the dataset is a villa or a duplex, told apart by its duplex column. | Add the other house types to the Type choices in 3.1, or drop those rows in Appendix A, step 3. |

## 3. Data requirements

The app holds two collections of objects: an editable portfolio of properties and a read-only market reference set, both built from one public dataset.

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

The number ranges are deliberately wide so that real listings pass. Tighten them only after the preparation script reports the actual minimum and maximum of each column (Appendix A, step 1).

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

A market reference listing has the descriptive fields of a property, `city` through `description`, plus `refId` in the format `MR-0001`. It has no status, tenant, lease or timestamp fields, and the app never edits it.

### 3.4 Seed data

Both collections come from the Kaggle dataset [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar): 3,718 rental-house listings scraped in 2021 from four cities, in 24 columns.

A [published analysis of the dataset](https://turkinass.github.io/Aqar_Real_Estate_EDA/aqar_report.html) found that about 60% of the rows are duplicates, which leaves about 1,400 unique listings. It also found far fewer listings for Dammam and Al Khobar than for Riyadh and Jeddah.

| Collection | File | Records | Editable |
| --- | --- | --- | --- |
| Portfolio seed | `src/data/portfolio.seed.json` | 40 | Yes, in memory |
| Market reference | `src/data/market.reference.json` | About 1,350; the script records the exact count | No |

- The portfolio seed is 40 cleaned listings, 10 per city where the data allows, with status, tenant and lease fields added. Tenant names are fictional.
- The market reference is every other cleaned, unique listing. No listing appears in both collections.
- A script prepares both files once (Appendix A). The files are committed; the app never reads the raw dataset.

### 3.5 Data lifecycle

- When the app starts, the portfolio is a copy of the seed.
- Changes live in memory and are lost when the page reloads (C-02, A-01).
- "Reset demo data" restores the seed on request (FR-DAT-05).
- The market reference never changes while the app runs.

These values are calculated when needed and never stored: the display title ("Villa in {district}, {city}"), comparables, the fair-rent estimate, the market position and embeddings.

## 4. Functional requirements: navigation and display

The user reaches every feature from one menu and sees the portfolio three ways: dashboard totals, a list and a detail page.

### 4.1 Navigation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-NAV-01 | Every page shall show the same navigation menu with these items: Dashboard, Properties, Add property, About. | Must |
| FR-NAV-02 | The menu shall also show Market insights when section 7.4 is implemented. | Should |
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
| Property detail | `/properties/:id` | A row or card in the list |
| Edit property | `/properties/:id/edit` | The list or the detail page |
| Market insights | `/insights` | Menu |
| About | `/about` | Menu |

### 4.2 Dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DSH-01 | The Dashboard shall show: total properties; the number Occupied, Vacant and Under maintenance; the occupancy rate; yearly rent from occupied properties; potential yearly rent from all properties. | Must |
| FR-DSH-02 | The occupancy rate shall be occupied divided by total, shown as a whole percentage. With no properties it shall show a dash. | Must |
| FR-DSH-03 | Every figure shall be recalculated at once after an add, update, delete, undo or reset. | Must |
| FR-DSH-04 | With an empty portfolio, the Dashboard shall show zeros and invite the user to add the first property. | Must |
| FR-DSH-05 | A table shall show, for each city: properties, occupied properties and total yearly rent. | Should |
| FR-DSH-06 | A "Needs attention" list shall show every Vacant and Under maintenance property, each linking to its detail page. | Should |
| FR-DSH-07 | The Dashboard shall offer "Add property" and "View all properties" shortcuts. | Should |
| FR-DSH-08 | A list shall show leases that end within the next 60 days. | Could |
| FR-DSH-09 | The Dashboard shall count properties priced Below market and Above market (needs 7.3). | Could |

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
| FR-LST-09 | The user shall be able to switch between the table and a card view; the choice shall last for the session. | Should |
| FR-LST-10 | The list shall show 10, 25 or 50 properties per page (default 10) and return to page 1 when the search or filters change. | Should |
| FR-LST-11 | Selecting a row or card shall open that property's detail page. | Should |

### 4.4 Property detail

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DET-01 | The detail page shall show every field of the property in these groups: Location, Building, Amenities, Rent and tenancy, Description, Record. | Must |
| FR-DET-02 | The page shall offer Edit, Delete and Back to list. | Must |
| FR-DET-03 | An ID that does not exist, or was deleted, shall show "Property not found" with a link to the list. | Must |
| FR-DET-04 | Tenant and lease details shall appear only when the status is Occupied. | Must |
| FR-DET-05 | Amenities shall appear as a checklist that shows which ones the property has. | Should |
| FR-DET-06 | The page shall include the market panel defined in 7.2 and 7.3. | Should |

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
| FR-ADD-10 | Leaving a form that has unsaved input shall ask the user to confirm. | Should |
| FR-ADD-11 | If city, district, size, bedrooms and rent all equal an existing property, the app shall warn of a possible duplicate and let the user save anyway. | Should |
| FR-ADD-12 | Text shall be trimmed of leading and trailing spaces. Number fields shall accept digits only. | Should |
| FR-ADD-13 | A "Suggest rent" button shall fill Yearly rent with the fair-rent estimate for the values entered (needs 7.3). | Could |

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
| FR-UPD-08 | Save shall stay disabled until at least one value differs from the stored one. | Should |
| FR-UPD-09 | The user shall be able to switch a property between Vacant and Under maintenance directly from the list. | Could |

### 5.3 Delete a property

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DEL-01 | Delete shall be available on every list row and on the detail page. | Must |
| FR-DEL-02 | Delete shall open a confirmation dialog that names the property (ID, type, district, city) and offers Cancel and Delete. Cancel shall have focus first, and Esc shall cancel. | Must |
| FR-DEL-03 | On confirmation, the app shall remove the property. It shall disappear at once from the list, search results and Dashboard figures. | Must |
| FR-DEL-04 | The app shall show "Property RP-xxxx deleted". | Must |
| FR-DEL-05 | After a delete from the detail page, the app shall return to the list. | Must |
| FR-DEL-06 | The ID of a deleted property shall never be given to a new property in the same session. | Must |
| FR-DEL-07 | The deleted message shall offer Undo for 8 seconds. Undo restores the property with the same ID and values. | Should |
| FR-DEL-08 | The user shall be able to tick several rows and delete them together after one confirmation that states the count. | Could |

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
| FR-SRC-14 | Matched words shall be highlighted in the district and description shown in the results. | Could |

Examples of the expected behaviour:

| Typed in the search box | Filters set | Properties listed |
| --- | --- | --- |
| `riyadh villa` | None | Villas in Riyadh |
| `الملقا` | Status: Vacant | Vacant properties whose district or description contains that word |
| `rp-0012` | None | Only the property RP-0012 |
| Nothing | Rent 50,000 to 100,000; Bedrooms at least 4 | Every property in that rent range with four or more bedrooms |
| `pool` | City: Jeddah, Riyadh | Properties in either city that have a pool, or whose description contains "pool" |

## 7. Functional requirements: AI features

Three AI-assisted features run in the browser with no API key: search by meaning, comparable listings and a fair-rent estimate. None is needed to meet the brief, and each fails safely.

### 7.1 Search by meaning

A multilingual language model, [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small) run with [Transformers.js](https://huggingface.co/docs/transformers.js), turns the query and each property into an embedding. Typing "villa with a pool for a big family" can then find a property whose Arabic description uses none of those words.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-AIS-01 | A "Search by meaning" switch shall sit beside the search box, off by default. | Should |
| FR-AIS-02 | The first time the switch is turned on, the app shall state that language-model files of about 135 MB (a 118 MB model and a 17 MB tokenizer) will download once and run on the device. The download shall start only after the user agrees. | Should |
| FR-AIS-03 | The app shall show download and preparation progress. Keyword search shall stay usable meanwhile. | Should |
| FR-AIS-04 | With the switch on, the app shall rank properties by the cosine similarity between the query's embedding and each property's embedding (Appendix B.1). | Should |
| FR-AIS-05 | The query may be in Arabic or English, whatever the language of the property's data. | Should |
| FR-AIS-06 | The list shall show the 20 closest properties, closest first, each with a relevance bar scaled to the best match. | Should |
| FR-AIS-07 | Filters (FR-SRC-04, FR-SRC-10) shall apply first; ranking covers only the properties that pass them. | Should |
| FR-AIS-08 | Property embeddings shall be computed once after the model loads, recomputed when a property is added or its searchable fields change, and removed when it is deleted. | Should |
| FR-AIS-09 | If the model cannot load or run, the app shall say so, switch back to keyword search and keep working. | Should |
| FR-AIS-10 | No query text or property data shall leave the browser, and no API key shall be used. | Should |
| FR-AIS-11 | The browser shall cache the model, so later visits do not download it again. | Should |
| FR-AIS-12 | The app shall load the 8-bit quantised model file (118 MB), never the 470 MB full-precision file. | Should |
| FR-AIS-13 | Properties that also match the query as keywords shall rank above those that do not. | Could |

The [model's own card](https://huggingface.co/intfloat/multilingual-e5-small) says its similarity scores cluster between 0.7 and 1.0. The app therefore ranks by order and uses no fixed cut-off score. File sizes are from the repository's [model files](https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx) and [tokenizer files](https://huggingface.co/Xenova/multilingual-e5-small/tree/main).

### 7.2 Comparable listings

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-CMP-01 | The detail page shall show up to 5 listings from the market reference set that are most similar to the property, chosen by Appendix B.2. | Should |
| FR-CMP-02 | Comparables shall come from the same city, and from the same type when at least 5 listings of that type exist. | Should |
| FR-CMP-03 | Each comparable shall show district, type, size, bedrooms, bathrooms, age, yearly rent and a similarity percentage. | Should |
| FR-CMP-04 | The panel shall be titled "2021 market listings" and state that they are not company properties. | Should |
| FR-CMP-05 | With fewer than 3 suitable listings, the panel shall say "Not enough market data" and show no estimate. | Should |
| FR-CMP-06 | Comparables shall be recalculated whenever the property's city, type, district, size, rooms, age or amenities change. | Should |
| FR-CMP-07 | The Add and Edit forms shall show comparables for the values entered so far. | Could |

### 7.3 Fair-rent estimate

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-EST-01 | The estimate shall be the median yearly rent of the property's comparables, rounded to the nearest 500 SAR. | Should |
| FR-EST-02 | The app shall show the lowest and highest comparable rent beside the estimate. | Should |
| FR-EST-03 | The app shall label the property's market position: Below market when its rent is under 85% of the estimate, In line from 85% to 115%, Above market over 115%. | Should |
| FR-EST-04 | The detail page shall show the estimate, the label, and the difference in SAR and as a percentage. | Should |
| FR-EST-05 | Every estimate shall carry the note "Based on 2021 listings. Indicative only, not a valuation." | Should |
| FR-EST-06 | The number of comparables (5), the minimum (3) and the thresholds (85%, 115%) shall be set in one configuration file. | Should |
| FR-EST-07 | The property list shall show the market position as a badge and allow filtering by it. | Could |

### 7.4 Market insights

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-INS-01 | The Market insights page shall show, from the market reference set: listings per city; median yearly rent per city; median yearly rent by number of bedrooms; the 10 districts with the highest median rent among districts with at least 5 listings. | Should |
| FR-INS-02 | For each city, the page shall show the portfolio's median rent beside the market's median rent. | Should |
| FR-INS-03 | The page shall name the data source, the year (2021) and the number of listings after cleaning. | Should |
| FR-INS-04 | Each statistic shall also be drawn as a bar chart, with its figures still available as a table. | Could |

### 7.5 Plain-language input

This is a bonus that works in one browser only. Chrome's built-in [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) runs a language model on the device from Chrome 148. It needs 22 GB of free storage and either more than 4 GB of video memory or 16 GB of RAM. It accepts English, Japanese, Spanish, German and French, not Arabic.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-NLI-01 | When the browser offers an on-device language model, the Add page shall show a "Describe the property" box. The app shall turn an English sentence into field values and fill the form. | Could |
| FR-NLI-02 | The user shall review and be able to change every filled value. Nothing is saved until Save, and the usual checks apply. | Could |
| FR-NLI-03 | Where the browser offers no such model, the box shall not appear. | Could |
| FR-NLI-04 | The feature shall use no external AI service and no API key. | Could |

## 8. Functional requirements: About, feedback and data

The About page identifies the team, every action gets visible feedback, and all data lives in memory behind one service module.

### 8.1 About page

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-ABT-01 | The About page shall open from the About menu item. | Must |
| FR-ABT-02 | The page shall list every team member with full name and student ID. | Must |
| FR-ABT-03 | The page shall show the course (SE411), the term (Fall 2026-27) and "Project Part 1". | Must |
| FR-ABT-04 | The page shall describe the app in one paragraph, list the technologies used and link to the GitHub repository. | Should |
| FR-ABT-05 | The page shall credit the dataset (name, source, year) and name the AI tools used to build the app. | Should |
| FR-ABT-06 | Team names and IDs shall be kept in one configuration file. | Should |

### 8.2 Feedback and errors

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-FBK-01 | Every add, update, delete, undo and reset shall show a confirmation message. It disappears after 5 seconds, or 8 seconds when it offers Undo, and can be dismissed sooner. | Must |
| FR-FBK-02 | Confirmation and error messages shall be announced to screen readers. | Must |
| FR-FBK-03 | An unexpected error on a page shall show an error screen with a Reload button, not a blank page. | Must |
| FR-FBK-04 | Any wait longer than 300 ms shall show a progress indicator. | Should |

### 8.3 Data management

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-DAT-01 | At start, the portfolio shall be loaded from the seed collection of at least 30 property objects (3.4). | Must |
| FR-DAT-02 | The portfolio shall be held in memory as a collection of objects, with no database and no server. | Must |
| FR-DAT-03 | All reading and writing of properties shall go through one data-service module with the operations in the table below, each returning a Promise. | Must |
| FR-DAT-04 | Every property ID shall be unique within a session. | Must |
| FR-DAT-05 | "Reset demo data" shall restore the seed after the user confirms. | Should |
| FR-DAT-06 | The page footer shall state that changes are kept only until the page reloads. | Should |
| FR-DAT-07 | The market reference set shall be loaded only when a page first needs it. | Should |
| FR-DAT-08 | The user shall be able to download the portfolio as a CSV file. | Could |

The data service is the only code Part 2 has to replace:

| Operation | Input | Returns | Fails when |
| --- | --- | --- | --- |
| `list()` | Nothing | All properties | Never |
| `getById(id)` | A property ID | That property | No property has the ID |
| `create(values)` | Field values without `id` or timestamps | The new property | A check in Appendix C fails |
| `update(id, values)` | A property ID and the changed values | The updated property | No property has the ID, or a check fails |
| `remove(id)` | A property ID | The removed property | No property has the ID |
| `restore(property)` | A property that `remove` returned | The restored property, with the same ID and values | A property with that ID already exists |
| `reset()` | Nothing | The seed properties | Never |

The first five operations are Must. `restore` supports undo (FR-DEL-07) and `reset` supports "Reset demo data" (FR-DAT-05); both are Should.

## 9. External interface requirements

The browser is the only external interface: the app talks to no backend and fetches one language model from a public host.

### 9.1 User interface

| ID | Requirement | Priority |
| --- | --- | --- |
| UI-01 | Every page shall share one layout: a header with the app name and menu, the page content, and a footer with the course, the data credit and the reload notice. | Must |
| UI-02 | Each page shall have one main heading that names it. | Must |
| UI-03 | Form labels shall sit above their inputs, with units (m², SAR, years) shown beside number fields. | Must |
| UI-04 | The Add and Edit forms shall group fields under: Location, Building, Amenities, Rent and tenancy, Description. | Must |
| UI-05 | Primary actions (Save, Add property) shall look different from secondary actions (Cancel). Delete shall use a warning style. | Should |
| UI-06 | Colours, spacing and type sizes shall come from one set of design tokens. | Should |
| UI-07 | The app shall offer a dark theme. | Could |

| Screen | Purpose | Main elements |
| --- | --- | --- |
| Dashboard | See the portfolio at a glance | Summary figures, city table, needs-attention list, shortcuts |
| Property list | Find and browse properties | Search box, meaning switch, filters, sort, table or cards, pagination |
| Property detail | Read one property in full | Field groups, Edit, Delete, market panel |
| Add and Edit property | Enter or change a property | Grouped form, inline errors, Save, Cancel |
| Market insights | Read market statistics | Tables or charts by city, bedrooms and district |
| About | Identify the team | Names, student IDs, course, credits |
| Delete dialog | Confirm a delete | Property name, Cancel, Delete |
| Not found | Recover from a bad URL | Message, link to the Dashboard |

### 9.2 Hardware interfaces

None. The app needs no camera, microphone, location or other device access.

### 9.3 Software interfaces

| Interface | Used for | Notes |
| --- | --- | --- |
| Web browser | Running the app | The browsers listed in 2.4 |
| Transformers.js (`@huggingface/transformers`) | Running the language model in the browser | Loaded only when search by meaning is first turned on |
| Model files for Xenova/multilingual-e5-small | Search by meaning | Fetched from the Hugging Face hub over HTTPS; MIT licence |
| Chrome Prompt API | Plain-language input (7.5) | Optional; present only in some Chrome installations |

### 9.4 Communication interfaces

| ID | Requirement | Priority |
| --- | --- | --- |
| IF-01 | The app shall make HTTPS GET requests only: for its own files and, once the user agrees, for the language model and its runtime files. | Must |
| IF-02 | The app shall send no property data, search text or personal data to any server. | Must |
| IF-03 | The app shall use no cookies, analytics or third-party trackers. | Must |
| IF-04 | Model files shall be fetched from their public host at run time and never committed to the repository. | Should |

## 10. Non-functional requirements

The app must stay fast without the AI model, work by keyboard alone, and keep secrets and personal data out of a public repository.

### 10.1 Performance

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-PERF-01 | The first page shall be usable within 3 seconds on a laptop with a broadband connection. | Must |
| NFR-PERF-02 | Search, filter and sort results shall appear within 200 ms of being triggered, for a portfolio of 500 properties. For typed search, that is after the pause in FR-SRC-03. | Must |
| NFR-PERF-03 | An add, update or delete shall show in the interface within 100 ms. | Must |
| NFR-PERF-04 | The AI library and model shall load only when search by meaning is first turned on. No Must feature shall wait for them. | Should |
| NFR-PERF-05 | Comparables and the estimate shall appear within 300 ms of opening a detail page, once the market reference set is loaded. | Should |
| NFR-PERF-06 | After the model and the property embeddings are ready, a search by meaning shall return within 1 second for 500 properties. | Should |
| NFR-PERF-07 | The app's own JavaScript, without the AI library, shall be under 300 kB compressed. | Should |

### 10.2 Usability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-USE-01 | Add, edit, delete and search shall each be reachable within 2 clicks from any page. | Must |
| NFR-USE-02 | The layout shall work from 360 px to 1920 px wide without the page scrolling sideways. Wide tables may scroll inside their own frame. | Must |
| NFR-USE-03 | Every destructive action shall need a confirmation (FR-DEL-02, FR-DAT-05). | Must |
| NFR-USE-04 | Error messages shall say what is wrong and how to fix it, in plain words (Appendix C). | Must |
| NFR-USE-05 | The same word shall name the same thing on every page: always "property" for a portfolio item and "listing" for a market reference item. | Should |

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
| NFR-ACC-08 | An automated accessibility check shall report no serious or critical issue on any page. | Should |

### 10.4 Reliability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-REL-01 | The acceptance scenarios in section 14 shall run with no uncaught error in the browser console. | Must |
| NFR-REL-02 | A failure in any AI feature shall not stop any Must feature from working. | Must |
| NFR-REL-03 | No invalid property shall ever enter the portfolio. The data service shall apply the Appendix C checks itself and not rely on the form. | Must |
| NFR-REL-04 | The portfolio in memory shall never be changed in place; every change shall produce a new collection. | Should |

### 10.5 Security and privacy

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-SEC-01 | The repository and the built app shall contain no API keys, tokens or passwords. | Must |
| NFR-SEC-02 | Seed data shall contain no real personal data. Tenant names are invented; phone numbers, links and email addresses are stripped from descriptions (Appendix A). | Must |
| NFR-SEC-03 | User-entered text shall always be rendered as text, never as HTML. | Must |
| NFR-SEC-04 | The README and the About page shall credit the dataset. The team shall confirm that its licence allows reuse before publishing data derived from it (open question 3). | Must |
| NFR-SEC-05 | Dependencies shall be pinned with a lockfile, and `npm audit` shall report no high or critical issue at submission. | Should |

### 10.6 Maintainability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-MNT-01 | Field checks, filtering, sorting, similarity and estimate logic shall be pure functions with no interface code, so they can be unit-tested. | Must |
| NFR-MNT-02 | The README shall explain how to install, run, test and build the app. | Must |
| NFR-MNT-03 | Code shall be organised by feature (properties, dashboard, market, search, about), with shared components kept separately. | Should |
| NFR-MNT-04 | Choices, thresholds, labels and team details shall live in configuration modules, not be repeated in components. | Should |
| NFR-MNT-05 | The linter and formatter shall report no errors at submission. | Should |
| NFR-MNT-06 | No component file shall exceed about 250 lines; larger ones shall be split. | Could |

### 10.7 Compatibility

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-COM-01 | Every Must requirement shall work in the latest two versions of Chrome, Edge, Firefox and Safari. | Must |
| NFR-COM-02 | The app shall start with `npm install` then `npm run dev`. `npm run build` shall produce static files that any static host can serve. | Must |
| NFR-COM-03 | Search by meaning shall work in at least the latest Chrome and Edge. Elsewhere, FR-AIS-09 applies. | Should |

### 10.8 Testability

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-TST-01 | `npm test` shall run all automated tests, and they shall pass at submission. | Must |
| NFR-TST-02 | Unit tests shall cover: field checks, keyword search, filters, sorting, ID generation, Arabic normalisation, comparables and the estimate. | Must |
| NFR-TST-03 | Component tests shall cover: the form with valid and invalid input, the list, the delete dialog and the About page. | Must |
| NFR-TST-04 | Tests shall replace the language model with a stub, so they run offline in seconds. | Must |
| NFR-TST-05 | The test output and coverage summary shall be saved in the repository (PD-05). | Must |
| NFR-TST-06 | Statement coverage of the code under `src/`, excluding the model wrapper, shall be at least 70%. | Should |

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
| AI in the browser | Transformers.js (`@huggingface/transformers`), version 4 or later | Runs the embedding model with no server |
| Data preparation | A Node.js script in `scripts/` | Run once; not part of the app |

Use the latest stable release of each tool when the project starts, and commit the lockfile (NFR-SEC-05).

### 11.2 Repository structure

The repository holds both parts of the project. Part 1 lives in `frontend/`, and paths in this document that begin with `src/` or `scripts/` are relative to that folder. Part 2 will live in `backend/` and is coded by hand.

```
darscope/
├── README.md              install, run, test, build, credits
├── CLAUDE.md              instructions for the AI coding tool
├── .claude/               rules, settings and skills for the AI coding tool
├── docs/
│   ├── SRS.md             this document, exported
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
│   ├── scripts/
│   │   └── prepare-data.mjs   builds the two JSON files (Appendix A)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            the router and the providers every page needs
│       ├── routes/            routes.jsx (the URL to page table), paths.js
│       ├── layouts/           AppLayout, NavMenu, Footer
│       ├── pages/             one component per URL
│       ├── components/
│       │   ├── ui/            Button, Badge, Dialog, Message, Page
│       │   ├── properties/    table, form, delete dialog
│       │   ├── dashboard/
│       │   ├── market/        comparables panel
│       │   └── search/        search box, filters
│       ├── context/           portfolio context and reducer
│       ├── hooks/             shared hooks
│       ├── services/          propertyService.js, marketService.js,
│       │                      embeddingService.js (loaded on demand)
│       ├── utils/             validation, search, sort, arabic, similarity, estimate
│       ├── constants/         choices, thresholds, labels, team details
│       ├── styles/            tokens.css, global.css
│       ├── data/              portfolio.seed.json, market.reference.json
│       └── test/              setup and shared fixtures
└── backend/               Part 2: hand-coded, added later
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

Sections 7.1 to 7.5 go beyond the brief. None of their requirements is a Must, so the app meets the brief without them.

## 14. Acceptance scenarios

The app is accepted when every Must scenario below passes in a current desktop browser. Each scenario starts from the 40-property seed, with IDs RP-0001 to RP-0040.

| ID | Scenario and steps | Expected result | Covers | Priority |
| --- | --- | --- | --- | --- |
| AC-01 | **Navigate.** Open the app. Choose each menu item in turn. Press Back twice. | Each page opens without a full reload. The current item is marked. Back returns through the pages visited. | FR-NAV-01, 03 to 06 | Must |
| AC-02 | **Add a valid property.** Open Add property. Enter City Riyadh, District Al Malqa, Type Villa, Size 400, Age 3, Bedrooms 5, Bathrooms 4, Living rooms 2, Yearly rent 120000, Status Vacant. Save. | The detail page opens with "Property RP-0041 added". The list count is 41. The Dashboard total is 41. | FR-ADD-01 to 06 | Must |
| AC-03 | **Reject invalid input.** Open Add property. Fill in every required field correctly, except: leave District empty, enter Size 5 and choose Status Occupied with no tenant name. Save. | Nothing is saved. Errors appear beside District, Size and Tenant name. Focus is on District. The other entries remain. | FR-ADD-03, 07 | Must |
| AC-04 | **Cancel an add.** Fill in the Add form. Choose Cancel. | The list still shows 40 properties. | FR-ADD-08 | Must |
| AC-05 | **Update.** Open RP-0003. Choose Edit. Change Yearly rent to 95000. Save. | The detail page shows 95,000 SAR and "Property RP-0003 updated". ID and created date are unchanged. Last updated is now. Dashboard rent totals reflect the change. | FR-UPD-01 to 05 | Must |
| AC-06 | **Status change clears tenancy.** Edit an Occupied property. Set Status to Vacant. Save. | A warning appears before saving. Afterwards the tenant and lease details are gone. The Dashboard shows one fewer Occupied and one more Vacant. | FR-UPD-07; FR-DSH-03 | Must |
| AC-07 | **Delete with confirmation.** On the list, choose Delete on RP-0005, then Cancel. Choose Delete again and confirm. | After Cancel the property remains. After confirming it disappears, the count is 39 and "Property RP-0005 deleted" shows. The URL `/properties/RP-0005` shows "Property not found". | FR-DEL-01 to 05; FR-DET-03 | Must |
| AC-08 | **IDs are not reused.** Delete RP-0040. Add a new property. | The new property is RP-0041, not RP-0040. | FR-DEL-06; FR-DAT-04 | Must |
| AC-09 | **Keyword search.** On the list, type `jeddah`. | Only properties whose text contains "jeddah" are listed. The count reads "Showing X of 40 properties". | FR-SRC-01 to 03; FR-LST-04 | Must |
| AC-10 | **Arabic search.** Type the Arabic name of a district that exists in the seed. | Properties in that district are listed, with the Arabic text displayed right-to-left. | FR-SRC-08; FR-LST-07 | Must |
| AC-11 | **Combined filters.** Set City to Riyadh, Status to Vacant and minimum Bedrooms to 4. Then choose Clear all. | Only vacant Riyadh properties with 4 or more bedrooms are listed. Clear all restores all 40. | FR-SRC-04 to 06 | Must |
| AC-12 | **No results.** Type `zzzz`. | A "no properties match" message and a Clear all button appear. | FR-LST-05 | Must |
| AC-13 | **Invalid range.** Set Yearly rent from 200000 to 100000. | A message explains that the range is invalid. The list is unchanged. | FR-SRC-07 | Must |
| AC-14 | **Dashboard figures.** Note the Dashboard figures. Add one Occupied property with rent 60000. Return to the Dashboard. | Total and Occupied each rise by 1. Rent from occupied properties rises by 60,000. The occupancy rate is recalculated. | FR-DSH-01 to 03 | Must |
| AC-15 | **About page.** Choose About. | Three names with student IDs, SE411, Fall 2026-27 and "Project Part 1" are shown. | FR-ABT-01 to 03 | Must |
| AC-16 | **Keyboard only.** Using only the keyboard, add a property and then delete it. | Every control is reachable with a visible focus indicator. The delete dialog closes on Esc. | NFR-ACC-01; FR-DEL-02 | Must |
| AC-17 | **Reload.** Add a property. Reload the page. | The portfolio is back to the 40 seed properties. | FR-DAT-01, 02 | Must |
| AC-18 | **Undo a delete.** Delete a property. Choose Undo within 8 seconds. | The property returns with the same ID and values, and the counts are restored. | FR-DEL-07 | Should |
| AC-19 | **Comparables and estimate.** Open a Riyadh property. | Up to 5 Riyadh market listings appear with similarity percentages. An estimate, a range, a market position and the 2021 note are shown. | FR-CMP-01 to 04; FR-EST-01 to 05 | Should |
| AC-20 | **Not enough market data.** Add a property of 90,000 m² and open it. | The panel says "Not enough market data" and shows no estimate. | FR-CMP-05 | Should |
| AC-21 | **Search by meaning.** Turn on Search by meaning and agree to the download. Type `family house with a swimming pool`. | Progress is shown during the download. Then up to 20 properties are listed, closest first, each with a relevance bar. If the seed holds a property with a pool, one appears in the first 5. | FR-AIS-01 to 06 | Should |
| AC-22 | **Meaning search fails safely.** Go offline before first turning the switch on. | A message explains that the model could not load. The switch turns off. Keyword search still works. | FR-AIS-09; NFR-REL-02 | Should |
| AC-23 | **Small screen.** Narrow the browser to 360 px. | The page does not scroll sideways. The menu collapses behind a toggle. Every action remains reachable. | NFR-USE-02; FR-NAV-08 | Should |

## 15. Scope limits, risks, open questions and build order

Part 1 stops at the browser. The main risks are the deadline and the size of the language model, and both are handled by building every Must requirement first.

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
| R-2 | The language-model files are a download of about 135 MB | Slow first use; it may fail on a weak connection | Download only on request, show progress, fall back to keyword search (FR-AIS-02, 03, 09) |
| R-3 | About 60% of the dataset's rows are duplicates | Fewer usable listings than the 3,718 published | Remove duplicates in the preparation script; about 1,400 remain |
| R-4 | Few listings exist for Dammam and Al Khobar | Weak or missing comparables in those cities | The "Not enough market data" rule (FR-CMP-05) |
| R-5 | Market rents date from 2021 | Estimates differ from today's market | A fixed note on every estimate (FR-EST-05) |
| R-6 | The dataset's licence is unconfirmed | Derived data may not be publishable | Confirm before committing data (open question 3). Fall back to invented data (A-02) |
| R-7 | Listing descriptions may contain phone numbers | Personal data in a public repository | Strip them in the preparation script (NFR-SEC-02) |
| R-8 | AI-generated code may contain defects or weak tests | Rework late in the project | Review each generated change, run the tests, act on the code review (PD-05, PD-06) |

### 15.3 Open questions for the instructor

- [ ] 1\. Is it acceptable that changes are lost when the page reloads, or should the app use browser storage?
- [ ] 2\. Does "remove data, delete" in the brief mean one delete feature?
- [ ] 3\. May a public Kaggle dataset be used as seed data, with credit? The team must also read the licence on the dataset's page.
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

The visual design (PD-03) is produced on 6 October, before any code. Tests are written alongside each feature. 15 and 16 October are for the final test run, the code review and the documents.

## Appendix A. Seed data preparation

A one-off script turns the raw dataset into the two JSON files the app loads. The raw file is never committed.

### A.1 Steps

1. Profile the raw file. Count the rows and the exact duplicates, list the distinct values of `city` and `front`, and print the minimum and maximum of every number column. Save this report in `docs/`.
2. Remove exact duplicate rows.
3. Remove rows with a missing city, district, size or price, and rows that break a rule in 3.1.
4. Clean each description. Remove phone numbers (7 or more digits in a row, in Western or Arabic-Indic digits), web links and email addresses. Trim it and cut it to 2,000 characters.
5. Convert columns to fields using A.2 and A.3.
6. Choose the portfolio seed with a fixed random seed, so the result is repeatable. Take 10 listings per city. Where a city has fewer than 30 clean listings, take 5 and top up from Riyadh so the seed totals 40.
7. Add the app-only fields to the seed: IDs RP-0001 to RP-0040; 28 Occupied, 9 Vacant and 3 Under maintenance; an invented tenant name and lease dates for each Occupied property; fixed `createdAt` and `updatedAt` values.
8. Give every remaining listing a `refId`, starting at MR-0001, and write it to the market reference file.
9. Write both JSON files and print the final counts. Record the counts in the README.

### A.2 Column mapping

| Dataset column | App field | Conversion |
| --- | --- | --- |
| `city` | `city` | Arabic name to a choice (A.3) |
| `district` | `district` | Kept as written |
| `front` | `front` | Arabic value to a choice (A.3); unknown values become empty |
| `size` | `sizeSqm` | Whole number |
| `property_age` | `propertyAgeYears` | Whole number |
| `bedrooms` | `bedrooms` | Whole number |
| `bathrooms` | `bathrooms` | Whole number |
| `livingrooms` | `livingRooms` | Whole number |
| `kitchen`, `garage`, `driver_room`, `maid_room`, `furnished`, `ac`, `roof`, `pool`, `frontyard`, `basement`, `stairs`, `elevator`, `fireplace` | The matching flag in `amenities` | 1 becomes yes, 0 becomes no |
| `duplex` | `propertyType` | 1 becomes Duplex, 0 becomes Villa |
| `price` | `yearlyRentSar` | Whole number, treated as yearly rent in SAR |
| `details` | `description` | Cleaned as in step 4 |

The published analysis lists 21 of the 24 column names. Confirm the exact spelling of `property_age`, `garage`, `driver_room` and `maid_room` in step 1.

The dataset has no type column apart from `duplex`. Treating every other listing as a villa is assumption A-06: read a sample of descriptions in step 1 to confirm it.

### A.3 Arabic values

| Field | Value in the dataset | Stored as |
| --- | --- | --- |
| `city` | الرياض | Riyadh |
| `city` | جدة | Jeddah |
| `city` | الدمام | Dammam |
| `city` | الخبر | Al Khobar |
| `front` | شمال | North |
| `front` | جنوب | South |
| `front` | شرق | East |
| `front` | غرب | West |
| `front` | شمال شرقي | Northeast |
| `front` | شمال غربي | Northwest |
| `front` | جنوب شرقي | Southeast |
| `front` | جنوب غربي | Southwest |
| `front` | 3 شوارع | Three streets |
| `front` | 4 شوارع | Four streets |

Step 1 prints the values actually present. Extend this table if others appear.

## Appendix B. Reference algorithms

These rules make the AI-assisted features repeatable: two implementations give the same result, and tests can check exact values.

### B.1 Search text and embeddings

Each property's search text is one string, with the structured facts first:

```
{propertyType} in {district}, {city}. {sizeSqm} square metres, {bedrooms} bedrooms,
{bathrooms} bathrooms, {livingRooms} living rooms. Has: {labels of its amenities}.
Status: {status}. {description}
```

- Property texts are prefixed with ` passage:  ` and queries with ` query:  `, as the model's card requires.
- Embeddings use mean pooling and are normalised to length 1. Each has 384 numbers.
- Similarity is the dot product of the two normalised embeddings.
- The model cuts text beyond 512 tokens, which is why the facts come before the description.
- Each embedding is kept in memory with the text it was built from. A property is embedded again only when that text changes.

```js
import { pipeline } from '@huggingface/transformers';

const extractor = await pipeline(
  'feature-extraction',
  'Xenova/multilingual-e5-small',
  { dtype: 'q8' }
);
const output = await extractor(
  ['query: villa with a pool for a big family'],
  { pooling: 'mean', normalize: true }
);
```

The `dtype` option selects the weights file. Confirm in the browser's network panel that the file downloaded is `model_quantized.onnx` (118 MB), and adjust the option if it is not.

### B.2 Comparables

1. Start with the market listings in the property's city.
2. Keep listings whose size is between 50% and 200% of the property's size.
3. If at least 5 of those have the property's type, keep only that type.
4. If fewer than 3 listings remain, stop: there is not enough market data.
5. Give each remaining listing a distance, using the table below. Lower means closer.
6. Take the 5 listings with the lowest distance. Break ties by the smaller size difference, then by `refId`.
7. Show similarity as (1 − distance) × 100, rounded to a whole percentage.

| Term | Value, from 0 to 1 | Weight |
| --- | --- | --- |
| Size | Absolute size difference, divided by the larger size | 0.35 |
| Bedrooms | Absolute difference, capped at 4, divided by 4 | 0.15 |
| Bathrooms | Absolute difference, capped at 4, divided by 4 | 0.05 |
| Living rooms | Absolute difference, capped at 4, divided by 4 | 0.05 |
| Age | Absolute difference in years, capped at 20, divided by 20 | 0.10 |
| Amenities | 1 minus (amenities both have, divided by amenities either has); 0 when neither has any | 0.15 |
| District | 0 when the normalised district names are equal, otherwise 1 | 0.15 |

```latex
d = \sum_{i=1}^{7} w_i \, t_i \qquad \text{with} \qquad \sum_{i=1}^{7} w_i = 1
```

Worked example. The property is a 400 m² villa with 5 bedrooms, 4 bathrooms, 2 living rooms, age 3, with air conditioning, a kitchen and a garage. The listing is in the same district: 360 m², 4 bedrooms, 4 bathrooms, 1 living room, age 8, with air conditioning and a kitchen.

| Term | Value | Weight | Contribution |
| --- | --- | --- | --- |
| Size | 40 ÷ 400 = 0.10 | 0.35 | 0.0350 |
| Bedrooms | 1 ÷ 4 = 0.25 | 0.15 | 0.0375 |
| Bathrooms | 0 | 0.05 | 0 |
| Living rooms | 1 ÷ 4 = 0.25 | 0.05 | 0.0125 |
| Age | 5 ÷ 20 = 0.25 | 0.10 | 0.0250 |
| Amenities | 1 − 2 ÷ 3 = 0.333 | 0.15 | 0.0500 |
| District | 0 | 0.15 | 0 |

The distance is 0.16, so the similarity shown is 84%.

### B.3 Fair-rent estimate and market position

1. Sort the comparables' yearly rents and take the median. With an even count, use the mean of the two middle values.
2. Round the median to the nearest 500 SAR. This is the estimate.
3. Divide the property's yearly rent by the estimate to get the ratio.
4. Label the property Below market when the ratio is under 0.85, In line from 0.85 to 1.15 inclusive, and Above market over 1.15.
5. Show the lowest and highest comparable rent as the range.

Worked example. Comparable rents of 90,000, 100,000, 104,000, 110,000 and 130,000 SAR give an estimate of 104,000 SAR and a range of 90,000 to 130,000. A property rented at 125,000 SAR has a ratio of 1.20, so it is Above market by 21,000 SAR (20%).

### B.4 Text normalisation for matching

Apply these steps to both the words typed and the text searched. They are for matching only; the app always displays the original text.

1. Lower-case Latin letters.
2. Remove Arabic diacritics (U+064B to U+0652) and the tatweel (U+0640).
3. Replace أ, إ, آ and ٱ with ا.
4. Replace ى with ي.
5. Replace ة with ه.
6. Convert the Arabic-Indic digits ٠ to ٩ into 0 to 9.
7. Collapse repeated spaces and trim.
8. For the district comparison in B.2 only, also remove a leading "حي " (the word for district).

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
| Property deleted | Property RP-xxxx deleted (with Undo) |
| Delete undone | Property RP-xxxx restored |
| Demo data reset | Demo data restored |
| Search has no matches | No properties match your search. |
| Portfolio is empty | No properties yet. Add your first property. |
| Unknown property ID | Property not found |
| Possible duplicate | A property with the same city, district, size, bedrooms and rent already exists. |
| Status leaves Occupied | Changing the status will clear the tenant and lease details. |
| Before the model download | Search by meaning downloads a language model of about 135 MB once. It runs on this device. |
| Model cannot load | The language model could not be loaded. Keyword search is still available. |
| Too few comparables | Not enough market data |
| Under every estimate | Based on 2021 listings. Indicative only, not a valuation. |

## References

- Course brief: Project SE411 (Fall 2026-27), Part 1, as issued to the team.
- Dataset: [Saudi Arabia Real Estate (AQAR)](https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar), Kaggle.
- Dataset analysis (columns, row count, duplicates): [Aqar Real Estate EDA](https://turkinass.github.io/Aqar_Real_Estate_EDA/aqar_report.html).
- Embedding model for the browser: [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small) and its [file list](https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx).
- Base model card (input prefixes, 384 dimensions, 512-token limit, MIT licence): [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small).
- Library: [Transformers.js documentation](https://huggingface.co/docs/transformers.js).
- Optional on-device model: [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api).
- Project setup: [Build a React app from scratch](https://react.dev/learn/build-a-react-app-from-scratch), react.dev.
- Accessibility target: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C.
