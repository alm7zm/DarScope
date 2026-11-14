# Test report

Deliverable PD-05 (SRS section 12) and requirement NFR-TST-05: the proof that the tests were
run. Every number below comes from the runs described in Run details. The complete output of both
frontend commands is at the end, as printed.

## Run details

| | |
| --- | --- |
| Date and time | 14 November 2026, 19:38 Arabia Standard Time (UTC+3) |
| Code | `dev` at commit `d99c8e7`, plus the changes of 14 November 2026 for SRS version 1.2, before they were committed: the `/insights` placeholder page, its route test and four unused messages removed |
| Node.js | v22.20.0 |
| npm | 11.3.0 |
| Java | JDK 26.0.2; the server targets Java 21 |
| Operating system | Windows 11 Pro |
| Commands | `npm test`, then `npm run coverage`, both in `frontend/`. `mvnw.cmd test "-Dmaven.repo.local=C:\Users\<short name>\.m2\repository"` in `backend/` (see Backend) |
| Run by | Claude Code (Claude Opus 5.5), at the team's request |

## Summary

| | `npm test` | `npm run coverage` |
| --- | --- | --- |
| Test files | 35 passed, of 35 | 35 passed, of 35 |
| Tests | 480 passed, of 480 | 480 passed, of 480 |
| Failed | 0 | 0 |
| Skipped | 0 | 0 |
| Duration | 30.67 s | 38.53 s |
| Exit code | 0 | 0 |

No frontend test reaches the Spring server. Every test except `services/propertyService.test.js`
runs against `src/test/fakePropertyService.js`, an in-memory stand-in for the server. That one
file tests the real HTTP calls with `fetch` replaced by a stub.

There are 480 tests, one fewer than earlier the same day: SRS version 1.2 withdrew Market
insights, and the route test for its placeholder page went with the page.

## Coverage

| Measure | Covered | Total | Coverage |
| --- | --- | --- | --- |
| Statements | 869 | 904 | **96.12%** |
| Branches | 635 | 691 | 91.89% |
| Functions | 304 | 317 | 95.89% |
| Lines | 798 | 814 | 98.03% |

NFR-TST-06 asks for at least **70%** of the statements under `src/`. The run reaches **96.12%**.
`vite.config.js` leaves only `src/test/` out.

The table in the raw output lists the 22 files that are not fully covered. Every other file has
every statement, branch and function covered.

The five least-covered files, by statements:

| File | Statements | Lines not run | What those lines do |
| --- | --- | --- | --- |
| `src/App.jsx` | 0% | 6 to 10 | Create the browser router. The tests render the same routes with a memory router (`src/test/render.jsx`). |
| `src/main.jsx` | 0% | 7 | Mount the app in the page |
| `src/pages/ErrorPage.jsx` | 50% | 11 | The Reload button reloading the page |
| `src/services/rentModelService.js` | 66.66% | 19 to 20 | Let a later form try again after the rent model failed to load |
| `src/components/dashboard/CityTable.jsx` | 75% | 11 | Show nothing when no city holds a property; no test reaches that `return null` |

Two other gaps in the table matter for the Part 2 demo. `DashboardPage.jsx` line 30 and
`PropertyListPage.jsx` line 72 show the server-unavailable message, and no test makes those two
pages fail to load. The detail and edit pages do have that test, through `__setServerDown` in
the stand-in.

## Coverage of the SRS

The areas NFR-TST-02 (unit tests) and NFR-TST-03 (component tests) name in SRS version 1.2, and
the test files that cover each. Paths are under `frontend/src/` unless they say `backend/`. Every
area has tests.

| Area | Requirement | Test files |
| --- | --- | --- |
| Field checks | NFR-TST-02 | `utils/validation.test.js`, `pages/PropertyFormPage.test.jsx`, `services/propertyService.test.js` (the server's 400 messages shown beside their fields) |
| Keyword search | NFR-TST-02 | `utils/search.test.js`, `components/search/SearchControls.test.jsx`, `hooks/usePropertySearch.test.js` |
| Filters | NFR-TST-02 | `utils/search.test.js`, `utils/validation.test.js` (the range check), `components/search/SearchControls.test.jsx`, `components/search/FilterChips.test.jsx`, `pages/PropertyListPage.test.jsx` (filters in the URL and their chips) |
| Sorting | NFR-TST-02 | `utils/sort.test.js`, `hooks/usePropertySearch.test.js`, `pages/PropertyListPage.test.jsx` (the chosen order, kept in the URL, FR-SRC-09) |
| ID generation | NFR-TST-02 | Since Part 2 the server's database issues the IDs. `services/propertyService.test.js` tests the conversion between `RP-0007` and the server's number, `components/properties/DeletePropertyDialog.test.jsx` tests that a deleted ID is not reissued against the stand-in, and `backend/`'s `DarscopeApplicationTests` tests it on the real database |
| Arabic normalisation | NFR-TST-02 | `utils/arabic.test.js`, `utils/search.test.js` |
| The form, with valid and invalid input | NFR-TST-03 | `pages/PropertyFormPage.test.jsx`, `components/properties/DistrictField.test.jsx`, `components/properties/RentSuggestion.test.jsx` |
| The list | NFR-TST-03 | `pages/PropertyListPage.test.jsx`, `components/properties/PropertyTable.test.jsx`, `components/ui/Pager.test.jsx` |
| The delete dialog | NFR-TST-03 | `components/properties/DeletePropertyDialog.test.jsx`, `components/ui/Dialog.test.jsx` |
| The About page | NFR-TST-03 | `pages/AboutPage.test.jsx`, `components/about/TeamGallery.test.jsx`, `components/about/PersonCard.test.jsx`, `constants/team.test.js` |

The other test files cover navigation (`routes/routes.test.jsx`), the layout and the collapsing
menu, the Dashboard, the detail page with its search by ID (Part 2 brief, requirement 3), the
portfolio state, the paged list from the server (requirement 4), the loading and error states,
the calls to the server, formatting, the Dashboard figures, the rent model, the search state in
the URL and the team photos.

SRS version 1.2 withdrew NFR-TST-04, the stub for the language model, with search by meaning. No
test uses the network: the rent model's tests read its weights from the local file.

## Acceptance scenarios

SRS section 14 lists 23 scenarios, in SRS version 1.2. Each starts from the 8-property seed,
RP-0001 to RP-0008, which both the server's `data.sql` and the tests' stand-in hold.

| Scenario | Priority | Automated test |
| --- | --- | --- |
| AC-01 Navigate | Must | `routes/routes.test.jsx` |
| AC-02 Add a valid property | Must | `pages/PropertyFormPage.test.jsx` |
| AC-03 Reject invalid input | Must | `pages/PropertyFormPage.test.jsx` |
| AC-04 Cancel an add | Must | `pages/PropertyFormPage.test.jsx` |
| AC-05 Update | Must | `pages/PropertyFormPage.test.jsx` |
| AC-06 Status change clears tenancy | Must | `pages/PropertyFormPage.test.jsx` |
| AC-07 Delete with confirmation | Must | `components/properties/DeletePropertyDialog.test.jsx`, `pages/PropertyDetailPage.test.jsx` |
| AC-08 IDs are not reused | Must | `components/properties/DeletePropertyDialog.test.jsx`, against the stand-in. In the real app this is the server's job, tested in `backend/` |
| AC-09 Keyword search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-10 Arabic search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-11 Combined filters | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-12 No results | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-13 Invalid range | Must | `components/search/SearchControls.test.jsx` |
| AC-14 Dashboard figures | Must | `pages/DashboardPage.test.jsx` |
| AC-15 About page | Must | `pages/AboutPage.test.jsx`: every member's name and student ID, the course and the term |
| AC-16 Keyboard only | Must | None: it needs a person at a keyboard. See Manual checks. |
| AC-17 Reload | Must | None: it needs the real server and a real page reload. See Manual checks. |
| AC-18 Undo a delete | Withdrawn | None: withdrawn in SRS 1.1, with FR-DEL-07 |
| AC-19 Comparables and estimate | Withdrawn | None: withdrawn in SRS 1.2, with SRS 7.2 and 7.3 |
| AC-20 Not enough market data | Withdrawn | None: withdrawn in SRS 1.2, with SRS 7.2 |
| AC-21 Search by meaning | Withdrawn | None: withdrawn in SRS 1.2, with SRS 7.1 |
| AC-22 Meaning search fails safely | Withdrawn | None: withdrawn in SRS 1.2, with SRS 7.1 |
| AC-23 Small screen | Should | In part: `layouts/NavMenu.test.jsx` tests the Menu button. The layout at 360 px needs a real browser. See Manual checks. |

### Manual checks

For the team to fill in: who checked each one, when, and what they saw. The Part 2 end-to-end
checklist, with the real server, is in `docs/backend-plan.md`, section 10.

| Check | What to do | Result | Checked by | Date |
| --- | --- | --- | --- | --- |
| AC-16 Keyboard only | With the keyboard alone, add a property and then delete it. Every control must be reachable with a visible focus ring, and Esc must close the delete dialog. | | | |
| AC-17 Reload | With the Spring server running, add a property, then reload the page. The new property must still be there. | | | |
| AC-23 Small screen | At 360 px wide, open every page. No page may scroll sideways, the menu must fold behind the Menu button, and the property table must scroll inside its frame. | | | |
| NFR-COM-01 Browsers | Run AC-01 to AC-15 in the latest two versions of Chrome, Edge, Firefox and Safari. | | | |

## Backend (Part 2)

Run on 14 November 2026 at 19:38 (UTC+3), inside `backend/`, on JDK 26.0.2 with H2:

| Test class | What it covers | Tests | Result |
| --- | --- | --- | --- |
| `PropertyServiceTest` | The service with a Mockito mock for the repository: pages, get by ID, create, update, delete, the tenant and lease rules | 19 | Pass |
| `PropertyControllerTest` | The five routes through MockMvc with a Mockito mock for the service: status codes, Location, the 400 and 404 bodies with their exact messages | 17 | Pass |
| `DarscopeApplicationTests` | The whole server on H2: the 8 starting properties, Arabic text, pages newest first, add, update, delete, IDs never reused | 6 | Pass |
| **Total** | | **42** | **0 failures, 0 errors** |

On this laptop the command needs `-Dmaven.repo.local` set to the Maven repository's short folder
name, because the Windows user folder's name is in Arabic letters. Without it, Mockito cannot
attach its agent from that path, and the 36 tests that use a mock fail to start. The same day, at
18:26, the plain `mvnw.cmd test` ended with 42 run and 36 errors, all "Could not initialize
plugin: interface org.mockito.plugins.MockMaker". The code is not at fault: the 6 tests that use
no mock passed in that run too.

End to end, the same day at 18:28, before the SRS 1.2 changes (which touch neither the server
nor these pages), with the server on the default H2 profile and the app through `npm run dev`:

- 18 requests through the app's `/api` proxy covered all five routes. They saw 201 with
  `Location: /api/v1/properties/9`, 400 with the exact messages for a rent of 500 and for an
  Occupied property with no tenant, 404 "Property not found", 204 on delete, and a new property
  given ID 10 after ID 9 was deleted.
- In a browser, the list loaded the 8 properties from the server. At 5 per page, Next sent
  `GET /api/v1/properties?page=1&size=5` and showed RP-0003 to RP-0001.
  `/properties/RP-9999` showed "Property not found". The Dashboard showed the server's figures,
  and the About page showed all four names with their student IDs.

## Gaps

- AC-16, AC-17, AC-23 and NFR-COM-01 have not been checked by hand yet.
- No test makes the Dashboard or the property list fail to load.
- No automated test runs the frontend against the real Spring server. The end-to-end check above
  was made once, by script and in a browser.
- No backend test sends a property without its 13 amenity fields. The server answers such a
  request 400 "The request could not be read" (`docs/tasks.md`, task 6).

## Raw output

### `npm test`

```text

> darscope-frontend@0.0.0 test
> vitest run


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend


 Test Files  35 passed (35)
      Tests  480 passed (480)
   Start at  19:38:44
   Duration  30.67s (environment 56%, tests 27%, setup 9%, transform 4%, import 4%)

Environment  jsdom was created 35 times · 144.40s total, 56% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

```

### `npm run coverage`

```text

> darscope-frontend@0.0.0 coverage
> vitest run --coverage


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend
      Coverage enabled with v8


 Test Files  35 passed (35)
      Tests  480 passed (480)
   Start at  19:39:16
   Duration  38.53s (environment 49%, tests 34%, setup 10%, import 3%, transform 3%, worker 1%)

Environment  jsdom was created 35 times · 120.32s total, 49% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.12 |    91.89 |   95.89 |   98.03 |                   
 src               |       0 |      100 |       0 |       0 |                   
  App.jsx          |       0 |      100 |       0 |       0 | 6-10              
  main.jsx         |       0 |      100 |     100 |       0 | 7                 
 ...mponents/about |     100 |    86.66 |     100 |     100 |                   
  PersonCard.jsx   |     100 |    80.64 |     100 |     100 | 6-10,90,107-117   
 ...ents/dashboard |   88.88 |    92.85 |     100 |     100 |                   
  CityTable.jsx    |      75 |       50 |     100 |     100 | 11                
 ...nts/properties |   92.36 |    87.75 |   94.64 |   94.21 |                   
  ...rtyDialog.jsx |   84.61 |       50 |     100 |   91.66 | 38                
  PropertyForm.jsx |   88.88 |    77.77 |    90.9 |    90.9 | 172-176,366-375   
 src/components/ui |   98.11 |    93.02 |     100 |     100 |                   
  Dialog.jsx       |   92.85 |    92.85 |     100 |     100 | 39                
  FormField.jsx    |     100 |     90.9 |     100 |     100 | 131,184,235-240   
 src/context       |   96.42 |     87.5 |      90 |     100 |                   
  ...oProvider.jsx |   95.34 |    66.66 |   88.23 |     100 | 27-30             
 src/hooks         |   92.47 |    80.55 |   85.71 |   98.71 |                   
  ...ertySearch.js |     100 |       95 |     100 |     100 | 86                
  useServerPage.js |   78.94 |       50 |    62.5 |   92.85 | 40                
  ...erProperty.js |   84.21 |    66.66 |   71.42 |     100 | 30-33             
 src/pages         |   95.71 |    87.93 |      96 |   95.65 |                   
  ...boardPage.jsx |   85.71 |    83.33 |     100 |   85.71 | 30                
  ErrorPage.jsx    |      50 |      100 |      50 |      50 | 11                
  ...yListPage.jsx |   96.29 |       75 |     100 |   96.15 | 72                
 src/services      |   93.75 |    94.73 |   94.11 |   96.42 |                   
  ...rtyService.js |   96.55 |    94.73 |     100 |     100 | 173,191           
  ...delService.js |   66.66 |      100 |   66.66 |   66.66 | 19-20             
 src/utils         |   98.76 |    95.45 |     100 |     100 |                   
  format.js        |   92.68 |     87.5 |     100 |     100 | 51-61,106         
  rentModel.js     |     100 |       96 |     100 |     100 | 83                
  search.js        |     100 |    91.17 |     100 |     100 | 163-164,191-209   
  searchParams.js  |     100 |       95 |     100 |     100 | 108-112           
  sort.js          |   96.55 |    96.66 |     100 |     100 | 46                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 96.12% ( 869/904 )
Branches     : 91.89% ( 635/691 )
Functions    : 95.89% ( 304/317 )
Lines        : 98.03% ( 798/814 )
================================================================================
```

### `mvnw.cmd test`, in `backend/`

The lines that report the result, from the Maven output:

```text
[INFO] Tests run: 17, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.256 s -- in edu.psu.se411.darscope.controller.PropertyControllerTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.116 s -- in edu.psu.se411.darscope.DarscopeApplicationTests
[INFO] Tests run: 19, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.294 s -- in edu.psu.se411.darscope.service.PropertyServiceTest
[INFO] Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
[INFO] Total time:  13.568 s
[INFO] Finished at: 2026-11-14T19:38:58+03:00
```
