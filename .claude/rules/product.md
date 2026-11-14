# Product

This file condenses `docs/SRS.md` sections 1, 2, 4.1 and 15. The SRS wins if they differ.

## Words to use

- **Property**: one rental house the company owns. It is the asset the app manages. Never call it a listing.
- **Listing**: one house in the public 2021 dataset, which the rent model learns from. Never call it a property.
- **Portfolio**: all the properties. The user adds, edits and deletes them.
- Property types are Villa and Duplex. Statuses are Vacant, Occupied and Under maintenance. Cities are Riyadh, Jeddah, Dammam and Al Khobar.
- The only user is the portfolio manager, a staff member who keeps the records up to date. Part 1 has no login.

## Pages

| Page | URL | Reached from |
| --- | --- | --- |
| Dashboard | `/` | Menu |
| Property list | `/properties` | Menu |
| Add property | `/properties/new` | Menu |
| Property detail | `/properties/:id` | A row in the list |
| Edit property | `/properties/:id/edit` | The list or the detail page |
| About | `/about` | Menu |

The menu shows Dashboard, Properties, Add property and About on every page (FR-NAV-01). An unknown URL shows a "Page not found" page (FR-NAV-07). That includes `/insights`: SRS version 1.2 withdrew Market insights.

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
| Confirmation messages, error screen, the data service that calls the server | 8.2, 8.3 | Must |
| Pages on the property list, cut by the server (Part 2 brief) | 4.3 | Must |
| Sorting, amenity filters, filter chips, search state in the URL | 6 | Should |
| Rent suggestion on the Add and Edit forms | 7.6 | Could |

Check the Priority column of the SRS table for each requirement ID: one section can mix Must, Should, Could and Withdrawn.

SRS version 1.2 (14 November 2026) withdrew every feature the app did not have: card view, search by meaning, comparable listings, the fair-rent estimate, Market insights, plain-language input, CSV export, bulk delete, the dark theme, and the smaller items in its "Changes in version 1.2" table. Do not build a withdrawn requirement unless the user says the team has brought it back.

## Build order

SRS section 15.4 gives this order. Do not start a later step while an earlier one has failing Must requirements.

| Step | Dates in October 2026 |
| --- | --- |
| Design, menu, About, seed data | 6 to 7 |
| List, detail, dashboard | 7 to 9 |
| Add, edit, delete | 9 to 11 |
| Search, filters, sort | 11 to 12 |
| All Must requirements pass | 12 |
| Final tests, review, documents | 15 to 16 |
| Submit the repository URL | 17 |

The two AI steps that were planned for 13 to 15 October were withdrawn in SRS version 1.2.

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

SRS section 14 lists 23 acceptance scenarios, AC-01 to AC-23. AC-01 to AC-17 are Must, AC-18 to AC-22 are withdrawn, and AC-23 is Should. Each starts from the 8-property seed, RP-0001 to RP-0008. Use them as manual test scripts and as the basis for integration tests.
