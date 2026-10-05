# Product

This file condenses `docs/SRS.md` sections 1, 2, 4.1 and 15. The SRS wins if they differ.

## Words to use

- **Property**: one rental house the company owns. It is the asset the app manages. Never call it a listing.
- **Listing**: one read-only record in the market reference set. Never call it a property.
- **Portfolio**: all the properties. The user adds, edits and deletes them.
- **Market reference set**: public rental listings from 2021, used only for comparables, estimates and market insights.
- Property types are Villa and Duplex. Statuses are Vacant, Occupied and Under maintenance. Cities are Riyadh, Jeddah, Dammam and Al Khobar.
- The only user is the portfolio manager, a staff member who keeps the records up to date. Part 1 has no login.

## Pages

| Page | URL | Reached from |
| --- | --- | --- |
| Dashboard | `/` | Menu |
| Property list | `/properties` | Menu |
| Add property | `/properties/new` | Menu |
| Property detail | `/properties/:id` | A row or card in the list |
| Edit property | `/properties/:id/edit` | The list or the detail page |
| Market insights | `/insights` | Menu |
| About | `/about` | Menu |

The menu shows Dashboard, Properties, Add property and About on every page, plus Market insights once that page exists (FR-NAV-01, FR-NAV-02). An unknown URL shows a "Page not found" page (FR-NAV-07).

## Features and priority

| Feature | SRS section | Priority |
| --- | --- | --- |
| Menu, one URL per page, Back and Forward | 4.1 | Must |
| Dashboard totals, status counts, occupancy rate, rent | 4.2 | Must |
| Property list as a table, with View, Edit and Delete | 4.3 | Must |
| Property detail page | 4.4 | Must |
| Add, update, and delete with confirmation | 5 | Must |
| Keyword search and filters, in Arabic and English | 6 | Must |
| About page with team names and student IDs | 8.1 | Must |
| Confirmation messages, error screen, in-memory data service | 8.2, 8.3 | Must |
| Sorting, amenity filters, search state in the URL | 6 | Should |
| Card view, pagination, undo delete, reset demo data | 4.3, 5.3, 8.3 | Should |
| Comparable listings, fair-rent estimate, market insights | 7.2 to 7.4 | Should |
| Search by meaning | 7.1 | Should |
| Plain-language input, CSV export, bulk delete, dark theme | 7.5, 8.3, 5.3, 9.1 | Could |

Check the Priority column of the SRS table for each requirement ID: one section can mix Must, Should and Could.

## Build order

SRS section 15.4 gives this order. Do not start a later step while an earlier one has failing Must requirements.

| Step | Dates in October 2026 |
| --- | --- |
| Design, menu, About, seed data | 6 to 7 |
| List, detail, dashboard | 7 to 9 |
| Add, edit, delete | 9 to 11 |
| Search, filters, sort | 11 to 12 |
| All Must requirements pass | 12 |
| Comparables, estimate, insights | 13 to 14 |
| Search by meaning | 14 to 15 |
| Final tests, review, documents | 15 to 16 |
| Submit the repository URL | 17 |

## Out of scope for Part 1

Do not build any of these, even if they look helpful (SRS section 15.1):

- A backend, an API or a database
- Login, user accounts or roles
- Keeping changes after a page reload
- Property types other than villas and duplexes
- Rent collection, payments, invoices or maintenance requests
- Photos, documents or other file uploads
- Maps or location lookup
- An Arabic user interface. Arabic data is supported; the labels are English.
- Live or current market data
- Email or push notifications

## Acceptance

SRS section 14 lists 23 acceptance scenarios, AC-01 to AC-23. AC-01 to AC-17 are Must. Each starts from the 40-property seed, RP-0001 to RP-0040. Use them as manual test scripts and as the basis for integration tests.
