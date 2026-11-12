# Test report

Deliverable PD-05 (SRS section 12) and requirement NFR-TST-05: the proof that the tests were
run. Every number below comes from the run described in Run details. The complete output of both
commands is at the end, as printed, with the terminal's colour codes removed.

## Run details

| | |
| --- | --- |
| Date and time | 11 November 2026, 23:23 Arabia Standard Time (UTC+3) |
| Code | `dev` at commit `8ed8a60`, plus the Part 2 changes of 11 November 2026 before they were committed: the Part 2 frontend, with the detail page asking the server by ID |
| Node.js | v22.20.0 |
| npm | 11.3.0 |
| Operating system | Windows 11 Pro |
| Commands | `npm test`, then `npm run coverage`, both in `frontend/` |
| Run by | Claude Code (Claude Opus 5.5), at the team's request |

## Summary

| | `npm test` | `npm run coverage` |
| --- | --- | --- |
| Test files | 33 passed, of 33 | 33 passed, of 33 |
| Tests | 463 passed, of 463 | 463 passed, of 463 |
| Failed | 0 | 0 |
| Skipped | 0 | 0 |
| Duration | 29.15 s | 42.56 s |
| Exit code | 0 | 0 |

No test reaches the Spring server. Every test except `services/propertyService.test.js` runs
against `src/test/fakePropertyService.js`, an in-memory stand-in for the server. That one file
tests the real HTTP calls with `fetch` replaced by a stub.

## Coverage

| Measure | Covered | Total | Coverage |
| --- | --- | --- | --- |
| Statements | 824 | 852 | **96.71%** |
| Branches | 602 | 653 | 92.18% |
| Functions | 286 | 294 | 97.27% |
| Lines | 757 | 774 | 97.8% |

NFR-TST-06 asks for at least **70%** of the statements under `src/`, leaving out the language-model
wrapper. The run reaches **96.71%**. The wrapper, `src/services/embeddingService.js`, does not
exist yet, and `vite.config.js` already leaves it out, together with `src/test/`.

The coverage tool measured 60 files. 38 have every statement, branch and function covered, so
the table in the raw output leaves them out and lists the other 22.

The five least-covered files, by statements:

| File | Statements | Lines not run | What those lines do |
| --- | --- | --- | --- |
| `src/App.jsx` | 0% | 6 to 10 | Create the browser router. The tests render the same routes with a memory router (`src/test/render.jsx`). |
| `src/main.jsx` | 0% | 7 | Mount the app in the page |
| `src/pages/ErrorPage.jsx` | 50% | 11 | The Reload button reloading the page |
| `src/services/rentModelService.js` | 66.67% | 19 to 20 | Let a later form try again after the rent model failed to load |
| `src/components/dashboard/CityTable.jsx` | 75% | 11 | Show nothing when no city holds a property; no test reaches that `return null` |

Two other gaps in the table matter for the Part 2 demo. `DashboardPage.jsx` line 26 and
`PropertyListPage.jsx` line 41 show the server-unavailable message, and no test makes those two
pages fail to load. The detail and edit pages do have that test, through `__setServerDown` in
the stand-in.

## Coverage of the SRS

The areas NFR-TST-02 (unit tests) and NFR-TST-03 (component tests) name, and the test files that
cover each. Paths are under `frontend/src/`.

| Area | Requirement | Test files |
| --- | --- | --- |
| Field checks | NFR-TST-02 | `utils/validation.test.js`, `pages/PropertyFormPage.test.jsx`, `services/propertyService.test.js` (the server's 400 messages shown beside their fields) |
| Keyword search | NFR-TST-02 | `utils/search.test.js`, `components/search/SearchControls.test.jsx` |
| Filters | NFR-TST-02 | `utils/search.test.js`, `utils/validation.test.js` (the range check), `components/search/SearchControls.test.jsx` |
| Sorting | NFR-TST-02 | `utils/sort.test.js`, `pages/PropertyListPage.test.jsx` (newest first). There is no control to change the order yet (FR-SRC-09 in part). |
| ID generation | NFR-TST-02 | Since Part 2 the server's database issues the IDs. `services/propertyService.test.js` tests the conversion between `RP-0007` and the server's number, and `components/properties/DeletePropertyDialog.test.jsx` tests that a deleted ID is not reissued, against the stand-in. The server's own behaviour belongs to the team's JUnit suite. |
| Arabic normalisation | NFR-TST-02 | `utils/arabic.test.js`, `utils/search.test.js` |
| Comparables | NFR-TST-02 | **None.** Comparables (SRS 7.2) are not built. |
| The estimate | NFR-TST-02 | **None.** The fair-rent estimate (SRS 7.3) is not built. |
| The form, with valid and invalid input | NFR-TST-03 | `pages/PropertyFormPage.test.jsx`, `components/properties/DistrictField.test.jsx`, `components/properties/RentSuggestion.test.jsx` |
| The list | NFR-TST-03 | `pages/PropertyListPage.test.jsx`, `components/properties/PropertyTable.test.jsx`, `components/ui/Pager.test.jsx` |
| The delete dialog | NFR-TST-03 | `components/properties/DeletePropertyDialog.test.jsx`, `components/ui/Dialog.test.jsx` |
| The About page | NFR-TST-03 | `pages/AboutPage.test.jsx`, `components/about/TeamGallery.test.jsx`, `components/about/PersonCard.test.jsx`, `constants/team.test.js` |

The other test files cover navigation (`routes/routes.test.jsx`), the layout and the collapsing
menu, the Dashboard, the detail page with its search by ID (Part 2 brief, requirement 3), the
portfolio state, the paged list from the server (requirement 4), the calls to the server,
formatting, the Dashboard figures, the rent model, the search state in the URL and the team
photos.

NFR-TST-04 asks for the language model to be replaced by a stub. There is no language model yet,
so there is nothing to replace. No test uses the network: the rent model's tests read its weights
from the local file.

## Acceptance scenarios

SRS section 14 lists 23 scenarios, in SRS version 1.1. Each starts from the 40-property seed,
RP-0001 to RP-0040, which the server's `data.sql` is to hold. That file is not in the repository
yet, and the tests' stand-in starts from 8 hand-written properties, so the automated tests start
from those 8 or from fixtures of their own.

| Scenario | Priority | Automated test |
| --- | --- | --- |
| AC-01 Navigate | Must | `routes/routes.test.jsx` |
| AC-02 Add a valid property | Must | `pages/PropertyFormPage.test.jsx` |
| AC-03 Reject invalid input | Must | `pages/PropertyFormPage.test.jsx` |
| AC-04 Cancel an add | Must | `pages/PropertyFormPage.test.jsx` |
| AC-05 Update | Must | `pages/PropertyFormPage.test.jsx` |
| AC-06 Status change clears tenancy | Must | `pages/PropertyFormPage.test.jsx` |
| AC-07 Delete with confirmation | Must | `components/properties/DeletePropertyDialog.test.jsx`, `pages/PropertyDetailPage.test.jsx` |
| AC-08 IDs are not reused | Must | `components/properties/DeletePropertyDialog.test.jsx`, against the stand-in. In the real app this is the server's job. |
| AC-09 Keyword search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-10 Arabic search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-11 Combined filters | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-12 No results | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-13 Invalid range | Must | `components/search/SearchControls.test.jsx` |
| AC-14 Dashboard figures | Must | `pages/DashboardPage.test.jsx` |
| AC-15 About page | Must | `pages/AboutPage.test.jsx`, **in part**: it checks the course, the term and a name, not the student IDs. Muhammad Yawar's ID is still empty in `constants/team.js`, so the scenario fails by hand until it is added. |
| AC-16 Keyboard only | Must | None: it needs a person at a keyboard. See Manual checks. |
| AC-17 Reload | Must | None: it needs the real server and a real page reload. See Manual checks. |
| AC-18 Undo a delete | Withdrawn | None: withdrawn in SRS 1.1, with FR-DEL-07 |
| AC-19 Comparables and estimate | Should | None: not built (SRS 7.2, 7.3) |
| AC-20 Not enough market data | Should | None: not built (SRS 7.2) |
| AC-21 Search by meaning | Should | None: not built (SRS 7.1) |
| AC-22 Meaning search fails safely | Should | None: not built (SRS 7.1) |
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

## Gaps

- No tests for comparables or the fair-rent estimate, because neither is built (NFR-TST-02).
- AC-15 cannot pass by hand until Muhammad Yawar's student ID is added.
- AC-16, AC-17, AC-23 and NFR-COM-01 have not been checked by hand yet.
- No automated test runs against the real Spring server, which is not in the repository yet.
- No test makes the Dashboard or the property list fail to load.
- The scenarios assume the 40-property seed. The tests use 8, and the server's seed is not in the
  repository yet.

## Raw output

### `npm test`

```text

> darscope-frontend@0.0.0 test
> vitest run


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend


 Test Files  33 passed (33)
      Tests  463 passed (463)
   Start at  23:23:39
   Duration  29.15s (environment 54%, tests 27%, setup 12%, import 4%, transform 4%)

Environment  jsdom was created 33 times · 122.88s total, 54% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

```

### `npm run coverage`

```text

> darscope-frontend@0.0.0 coverage
> vitest run --coverage


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend
      Coverage enabled with v8


 Test Files  33 passed (33)
      Tests  463 passed (463)
   Start at  23:24:10
   Duration  42.56s (environment 50%, tests 32%, setup 11%, import 3%, transform 3%, worker 1%)

Environment  jsdom was created 33 times · 136.40s total, 50% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.71 |    92.18 |   97.27 |    97.8 |                   
 src               |       0 |      100 |       0 |       0 |                   
  App.jsx          |       0 |      100 |       0 |       0 | 6-10              
  main.jsx         |       0 |      100 |     100 |       0 | 7                 
 ...mponents/about |     100 |    86.66 |     100 |     100 |                   
  PersonCard.jsx   |     100 |    80.64 |     100 |     100 | 6-10,90,107-117   
 ...ents/dashboard |    87.5 |       90 |     100 |     100 |                   
  CityTable.jsx    |      75 |       50 |     100 |     100 | 11                
 ...nts/properties |   92.74 |    88.54 |   94.44 |   93.91 |                   
  ...rtyDialog.jsx |    87.5 |       50 |     100 |    87.5 | 35                
  PropertyForm.jsx |   88.57 |    77.77 |   90.32 |   90.62 | 171-175,350-359   
 src/components/ui |   98.14 |    92.59 |     100 |     100 |                   
  Dialog.jsx       |   92.85 |     90.9 |     100 |     100 | 34                
  FormField.jsx    |     100 |     90.9 |     100 |     100 | 131,184,235-240   
 src/context       |     100 |     87.5 |     100 |     100 |                   
  ...oProvider.jsx |     100 |    66.66 |     100 |     100 | 23-26             
 src/hooks         |      96 |    72.72 |   92.59 |   96.96 |                   
  ...ertySearch.js |   97.56 |    66.66 |   93.33 |   97.29 | 66                
  useServerPage.js |   86.66 |     62.5 |   83.33 |   91.66 | 37                
  ...erProperty.js |     100 |    83.33 |     100 |     100 | 26                
 src/pages         |   94.82 |     92.3 |   94.73 |   94.82 |                   
  ...boardPage.jsx |   85.71 |    83.33 |     100 |   85.71 | 26                
  ErrorPage.jsx    |      50 |      100 |      50 |      50 | 11                
  ...yListPage.jsx |   92.85 |    83.33 |     100 |   92.85 | 41                
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
Statements   : 96.71% ( 824/852 )
Branches     : 92.18% ( 602/653 )
Functions    : 97.27% ( 286/294 )
Lines        : 97.8% ( 757/774 )
================================================================================
```
