---
paths:
  - "frontend/src/**/*"
  - "frontend/scripts/**/*"
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

## Market listing

A market listing has the descriptive fields of a property, `city` through `description`, plus `refId` in the format `MR-0001`. It has no status, tenant, lease or timestamp fields. The app never edits a listing.

## Data files

| File | Holds | How it is used |
| --- | --- | --- |
| `frontend/src/data/portfolio.seed.json` | 40 properties, RP-0001 to RP-0040 | Copied into memory when the app starts |
| `frontend/src/data/market.reference.json` | About 1,350 listings | Read-only. Load it with a dynamic `import()` the first time a page needs it (FR-DAT-07). |

No listing appears in both files. `npm run prepare-data` builds both; do not edit them by hand.

## Rules for property data

- **IDs.** The service generates `RP-` plus four digits. An ID is unique for the session, is never edited, and is never reused after a delete (FR-ADD-04, FR-DEL-06, FR-DAT-04). Keep a counter of the highest ID issued. Never derive the next ID from the collection's length.
- **Timestamps.** `createdAt` is set once. `updatedAt` is set on every save. `id` and `createdAt` never change (FR-UPD-03).
- **Tenancy.** `tenantName` is required when `status` is Occupied. Lease dates are allowed only then. When the status leaves Occupied, clear the tenant and lease fields on save (FR-ADD-07, FR-UPD-07).
- **Text.** Trim leading and trailing spaces. Number fields accept digits only (FR-ADD-12).
- **No mutation.** Never change the collection or a property in place. Every change produces new objects (NFR-REL-04).
- **Derived values are never stored**: the display title ("Villa in {district}, {city}"), comparables, the fair-rent estimate, the market position and embeddings (SRS section 3.5).
- **One validator.** All field checks live in pure functions in `frontend/src/lib/validation.js`. The form uses them to show errors, and the service uses them again to reject invalid input, so no invalid property can enter the portfolio (NFR-REL-03).

## The data service

`frontend/src/services/propertyService.js` is the only code that reads or writes properties, and the only module Part 2 replaces. Every operation returns a Promise.

| Operation | Input | Returns | Fails when |
| --- | --- | --- | --- |
| `list()` | Nothing | All properties | Never |
| `getById(id)` | A property ID | That property | No property has the ID |
| `create(values)` | Field values without `id` or timestamps | The new property | A check in Appendix C fails |
| `update(id, values)` | A property ID and the changed values | The updated property | No property has the ID, or a check fails |
| `remove(id)` | A property ID | The removed property | No property has the ID |
| `restore(property)` | A property that `remove` returned | The restored property, with the same ID and values | A property with that ID already exists |
| `reset()` | Nothing | The seed properties | Never |

- In Part 1 the service keeps the collection in a module-level variable, seeded from `portfolio.seed.json`.
- React state holds what the service returned. After a write, update state from the service's return value, as you would with an API response.
- When a check fails, reject with an error that carries the message for each invalid field.
- The first five operations are Must. `restore` supports undo (FR-DEL-07) and `reset` supports "Reset demo data" (FR-DAT-05); both are Should.
- Keep the function names and return shapes stable. Part 2 will implement the same contract over HTTP.
