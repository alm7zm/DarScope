---
paths:
  - "frontend/src/**/*"
---

# Data model

This file condenses `docs/SRS.md` sections 3 and 8.3. The SRS wins if they differ. The exact error message for every rule is in SRS Appendix C.

## Property

A property is one object in the portfolio.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | Text | Set by the app | Format `RP-0001`; generated; never edited |
| `city` | Choice | Yes | Riyadh, Jeddah, Dammam or Al Khobar |
| `district` | Text | Yes | 2 to 60 characters; Arabic or English |
| `front` | Choice | No | North, South, East, West, Northeast, Northwest, Southeast, Southwest, Three streets, Four streets |
| `propertyType` | Choice | Yes | Villa or Duplex; default Villa |
| `sizeSqm` | Whole number | Yes | 20 to 100,000 |
| `propertyAgeYears` | Whole number | Yes | 0 to 100; 0 means new |
| `bedrooms` | Whole number | Yes | 0 to 20 |
| `bathrooms` | Whole number | Yes | 0 to 20 |
| `livingRooms` | Whole number | Yes | 0 to 20 |
| `amenities` | 13 yes/no flags | Yes | Listed in 3.2; each defaults to no |
| `yearlyRentSar` | Whole number | Yes | 1,000 to 10,000,000 |
| `description` | Text | No | Up to 2,000 characters; Arabic or English |
| `status` | Choice | Yes | Vacant, Occupied or Under maintenance; default Vacant |
| `tenantName` | Text | When Occupied | 2 to 80 characters; empty for any other status |
| `leaseStart` | Date | No | Allowed only when Occupied |
| `leaseEnd` | Date | No | Allowed only when Occupied; later than `leaseStart` |
| `createdAt` | Date and time | Set by the app | Set once, when the property is created |
| `updatedAt` | Date and time | Set by the app | Set on every save |

- `amenities` is an object with 13 booleans: `kitchen`, `garage`, `driverRoom`, `maidRoom`, `furnished`, `ac`, `roof`, `pool`, `frontyard`, `basement`, `stairs`, `elevator`, `fireplace`. SRS section 3.2 gives the label shown for each.
- The number ranges are wide on purpose so that real listings pass. Do not tighten them unless the user asks.

## Data files

| File | Holds | How it is used |
| --- | --- | --- |
| `frontend/src/test/portfolio.seed.json` | 8 hand-written properties, RP-0001 to RP-0008 | The starting data of the tests' in-memory stand-in for the server (`src/test/fakePropertyService.js`). Since Part 2 the app's own starting rows are in the server's `data.sql` |
| `frontend/src/data/rent-model.json` | The rent model's weights (SRS 7.6), no rows of the dataset | Read-only. Loaded with a dynamic `import()` by `services/rentModelService.js` when a form first shows the suggestion (FR-RNT-02). |
| `frontend/src/data/districts.json` | Each city's districts in the 2021 data: the English name, paired with the most common Arabic spelling | The District dropdown's choices (FR-ADD-14), read through `DISTRICTS` in `constants/options.js`; the rent model finds a district by the Arabic spelling |

`rent-model.json` and `districts.json` come from step 19 of `ai-model/prepare.ipynb` and are never edited by hand. SRS version 1.2 withdrew the market reference set, so no other data file is planned.

## Rules for property data

- **IDs.** The server's database issues a number (an identity column), which is never edited and never reused after a delete (FR-ADD-04, FR-DEL-06, FR-DAT-04). The frontend shows it as `RP-` plus four digits: `formatId` and `idNumber` in `propertyService.js` convert between the two. Never derive an ID from the collection's length.
- **Timestamps.** The server sets them: `createdAt` once, `updatedAt` on every save. `id` and `createdAt` never change (FR-UPD-03).
- **Tenancy.** `tenantName` is required when `status` is Occupied. Lease dates are allowed only then. When the status leaves Occupied, clear the tenant and lease fields on save (FR-ADD-07, FR-UPD-07).
- **Text.** Trim leading and trailing spaces. Number fields accept digits and one decimal point only, and no more digits than their largest value has (FR-ADD-12).
- **No mutation.** Never change the collection or a property in place. Every change produces new objects (NFR-REL-04).
- **Derived values are never stored**: the display title ("Villa in {district}, {city}") and the rent suggestion (SRS section 3.5).
- **One validator.** All field checks live in pure functions in `frontend/src/utils/validation.js`. The form uses them to show errors, and the service uses them again before it sends anything. The server repeats the same checks with the same messages (`docs/backend-plan.md`, section 5), and the form shows any it returns beside the field (NFR-REL-03).

## The data service

`frontend/src/services/propertyService.js` is the only code that reads or writes properties. Since Part 2 it calls the Spring server's REST routes, listed in `docs/backend-plan.md`, section 3. Every operation returns a Promise.

| Operation | Input | Returns | Fails when | Route |
| --- | --- | --- | --- | --- |
| `list()` | Nothing | All properties | The server cannot be reached | `GET ?page=0&size=1000` |
| `listPage(page, perPage)` | A page counted from 1, and its size | `{ items, page, pageCount, from, to, total }`, the shape of `paginate` in `utils/sort.js` | The server cannot be reached | `GET ?page=&size=` |
| `getById(id)` | A property ID | That property | No property has the ID | `GET /{n}` |
| `create(values)` | Field values without `id` or timestamps | The new property | A check in Appendix C fails | `POST` |
| `update(id, values)` | A property ID and the changed values | The updated property | No property has the ID, or a check fails | `PUT /{n}` |
| `remove(id)` | A property ID | `{ id }` | No property has the ID | `DELETE /{n}` |

- The server keeps lab 14's shape: a numeric ID, the 13 amenities as flat fields, and `null` for an empty field. `fromServer` and `toServer` in the service translate to and from the app's shape (`RP-0007`, an `amenities` object, empty text), so no page sees the difference.
- React state holds what the service returned. After a write, update state from the service's return value.
- A failed check rejects with `ValidationError`, whose `errors` holds one message per field, whether the form's own check or the server's 400 found it. An unknown ID rejects with `NotFoundError`. A server that cannot be reached, or answers 5xx, rejects with `TEXT.serverUnavailable`.
- `restore` (undo, FR-DEL-07) and `reset` ("Reset demo data", FR-DAT-05) were removed in Part 2. Nothing on screen used them, and resetting a shared database is risky.
- Tests never reach the server: `src/test/setup.js` swaps this module for `src/test/fakePropertyService.js`, which keeps the same functions in memory. Only `propertyService.test.js` tests the real module, with `fetch` stubbed.
