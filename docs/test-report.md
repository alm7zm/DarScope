# Test report

Deliverable PD-05 (SRS section 12) and requirement NFR-TST-05: the proof that the tests were
run. Every number below comes from the run described in Run details. The complete output of both
commands is at the end, as printed.

## Run details

| | |
| --- | --- |
| Date and time | 16 October 2026, 22:33 Arabia Standard Time (UTC+3) |
| Code | Commit `af9b312` on the `ml-model` branch. Only documents changed after it. |
| Node.js | v22.20.0 |
| npm | 11.3.0 |
| Operating system | Windows 11 Pro |
| Commands | `npm test`, then `npm run coverage`, both in `frontend/` |
| Run by | Claude Code (Claude Opus 5.5), at the team's request |

## Summary

| | `npm test` | `npm run coverage` |
| --- | --- | --- |
| Test files | 30 passed, of 30 | 30 passed, of 30 |
| Tests | 447 passed, of 447 | 447 passed, of 447 |
| Failed | 0 | 0 |
| Skipped | 0 | 0 |
| Duration | 22.82 s | 34.09 s |
| Exit code | 0 | 0 |

## Coverage

| Measure | Covered | Total | Coverage |
| --- | --- | --- | --- |
| Statements | 766 | 793 | **96.59%** |
| Branches | 544 | 591 | 92.04% |
| Functions | 268 | 277 | 96.75% |
| Lines | 706 | 724 | 97.51% |

NFR-TST-06 asks for at least **70%** of the statements under `src/`, leaving out the language-model
wrapper. The run reaches **96.59%**. The wrapper, `src/services/embeddingService.js`, does not
exist yet, and `vite.config.js` already leaves it out.

The coverage tool measured 56 files. 35 have every statement, branch and function covered, so
the table in the raw output leaves them out and lists the other 21.

The five least-covered files, by statements:

| File | Statements | Lines not run | What those lines do |
| --- | --- | --- | --- |
| `src/App.jsx` | 0% | 6 to 10 | Create the browser router. The tests render the same routes with a memory router (`src/test/render.jsx`). |
| `src/main.jsx` | 0% | 7 | Mount the app in the page |
| `src/pages/ErrorPage.jsx` | 50% | 11 | The Reload button reloading the page |
| `src/services/rentModelService.js` | 66.67% | 19 to 20 | Let a later form try again after the rent model failed to load |
| `src/components/dashboard/CityTable.jsx` | 75% | 11 | Render nothing for no cities. The Dashboard never passes it an empty list. |

## Coverage of the SRS

The areas NFR-TST-02 (unit tests) and NFR-TST-03 (component tests) name, and the test files that
cover each. Paths are under `frontend/src/`.

| Area | Requirement | Test files |
| --- | --- | --- |
| Field checks | NFR-TST-02 | `utils/validation.test.js`, `pages/PropertyFormPage.test.jsx` |
| Keyword search | NFR-TST-02 | `utils/search.test.js`, `components/search/SearchControls.test.jsx` |
| Filters | NFR-TST-02 | `utils/search.test.js`, `utils/validation.test.js` (the range check), `components/search/SearchControls.test.jsx` |
| Sorting | NFR-TST-02 | `utils/sort.test.js`. No page sorts yet (FR-SRC-09 is not built), so this tests the function only. |
| ID generation | NFR-TST-02 | `services/propertyService.test.js`, `components/properties/DeletePropertyDialog.test.jsx` |
| Arabic normalisation | NFR-TST-02 | `utils/arabic.test.js`, `utils/search.test.js` |
| Comparables | NFR-TST-02 | **None.** Comparables (SRS 7.2) are not built. |
| The estimate | NFR-TST-02 | **None.** The fair-rent estimate (SRS 7.3) is not built. |
| The form, with valid and invalid input | NFR-TST-03 | `pages/PropertyFormPage.test.jsx`, `components/properties/DistrictField.test.jsx`, `components/properties/RentSuggestion.test.jsx` |
| The list | NFR-TST-03 | `pages/PropertyListPage.test.jsx`, `components/properties/PropertyTable.test.jsx` |
| The delete dialog | NFR-TST-03 | `components/properties/DeletePropertyDialog.test.jsx`, `components/ui/Dialog.test.jsx` |
| The About page | NFR-TST-03 | `pages/AboutPage.test.jsx`, `components/about/TeamGallery.test.jsx`, `components/about/PersonCard.test.jsx`, `constants/team.test.js` |

The other test files cover navigation (`routes/routes.test.jsx`), the layout, the Dashboard, the
detail page, the portfolio state, formatting, the Dashboard figures, the rent model, the search
state in the URL and the team photos.

NFR-TST-04 asks for the language model to be replaced by a stub. There is no language model yet,
so there is nothing to replace. No test uses the network: the rent model's tests read its weights
from the local file.

## Acceptance scenarios

SRS section 14 lists 23 scenarios. Each starts from the 40-property seed, RP-0001 to RP-0040.
The seed holds 8 hand-written properties (FR-DAT-01 is not met yet), so the automated tests start
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
| AC-08 IDs are not reused | Must | `services/propertyService.test.js`, `components/properties/DeletePropertyDialog.test.jsx` |
| AC-09 Keyword search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-10 Arabic search | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-11 Combined filters | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-12 No results | Must | `components/search/SearchControls.test.jsx`, `utils/search.test.js` |
| AC-13 Invalid range | Must | `components/search/SearchControls.test.jsx` |
| AC-14 Dashboard figures | Must | `pages/DashboardPage.test.jsx` |
| AC-15 About page | Must | `pages/AboutPage.test.jsx`, **in part**: it checks the course, the term, "Project Part 1" and a name, not the student IDs. Two of the three IDs are still empty in `constants/team.js`, so the scenario fails by hand until they are added. |
| AC-16 Keyboard only | Must | None: it needs a person at a keyboard. See Manual checks. |
| AC-17 Reload | Must | None: it needs a real page reload. See Manual checks. |
| AC-18 Undo a delete | Should | None: Undo (FR-DEL-07) is not built |
| AC-19 Comparables and estimate | Should | None: not built (SRS 7.2, 7.3) |
| AC-20 Not enough market data | Should | None: not built (SRS 7.2) |
| AC-21 Search by meaning | Should | None: not built (SRS 7.1) |
| AC-22 Meaning search fails safely | Should | None: not built (SRS 7.1) |
| AC-23 Small screen | Should | None: it needs a real browser at 360 px. See Manual checks. |

### Manual checks

For the team to fill in: who checked each one, when, and what they saw.

| Check | What to do | Result | Checked by | Date |
| --- | --- | --- | --- | --- |
| AC-16 Keyboard only | With the keyboard alone, add a property and then delete it. Every control must be reachable with a visible focus ring, and Esc must close the delete dialog. | | | |
| AC-17 Reload | Add a property, then reload the page. The portfolio must be back to the seed: 8 properties today, 40 once task 1 is done. | | | |
| AC-23 Small screen | At 360 px wide, open every page. No page may scroll sideways; the property table scrolls inside its frame. | | | |
| NFR-COM-01 Browsers | Run AC-01 to AC-15 in the latest two versions of Chrome, Edge, Firefox and Safari. | | | |

## Gaps

- No tests for comparables or the fair-rent estimate, because neither is built (NFR-TST-02).
- AC-15 cannot pass by hand until the two missing student IDs are added.
- AC-16, AC-17, AC-23 and NFR-COM-01 have not been checked by hand yet.
- The scenarios assume the 40-property seed; the app has 8 properties until task 1 is done.

## Raw output

### `npm test`

```text
> darscope-frontend@0.0.0 test
> vitest run


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend


 Test Files  30 passed (30)
      Tests  447 passed (447)
   Start at  22:33:41
   Duration  22.82s (environment 52%, tests 31%, setup 9%, transform 4%, import 4%)

Environment  jsdom was created 30 times · 76.87s total, 52% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments
```

### `npm run coverage`

```text
> darscope-frontend@0.0.0 coverage
> vitest run --coverage


 RUN  v5.0.3 C:/Users/ش/Desktop/DarScope/frontend
      Coverage enabled with v8


 Test Files  30 passed (30)
      Tests  447 passed (447)
   Start at  22:34:05
   Duration  34.09s (environment 46%, tests 36%, setup 10%, transform 4%, import 3%, worker 1%)

Environment  jsdom was created 30 times · 86.37s total, 46% of tracked time
             create it once per worker with pool: 'vmThreads' (keeps per-file isolation) or isolate: false (shares it across files)
             learn more: https://vitest.dev/guide/improving-performance#test-environments

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.59 |    92.04 |   96.75 |   97.51 |                   
 src               |       0 |      100 |       0 |       0 |                   
  App.jsx          |       0 |      100 |       0 |       0 | 6-10              
  main.jsx         |       0 |      100 |     100 |       0 | 7                 
 ...mponents/about |     100 |       85 |     100 |     100 |                   
  PersonCard.jsx   |     100 |    78.57 |     100 |     100 | 6-10,87-104       
 ...ents/dashboard |    87.5 |       90 |     100 |     100 |                   
  CityTable.jsx    |      75 |       50 |     100 |     100 | 11                
 ...nts/properties |   92.62 |    88.17 |   94.44 |    93.8 |                   
  ...rtyDialog.jsx |    87.5 |       50 |     100 |    87.5 | 35                
  PropertyForm.jsx |   88.23 |    75.75 |   90.32 |   90.32 | 164-168,343-352   
 src/components/ui |   97.82 |     92.3 |     100 |     100 |                   
  Dialog.jsx       |   92.85 |     90.9 |     100 |     100 | 34                
  FormField.jsx    |     100 |     90.9 |     100 |     100 | 131,184,235-240   
 src/constants     |   97.29 |      100 |    90.9 |   97.14 |                   
  messages.js      |      90 |      100 |      75 |      90 | 34                
 src/context       |   96.22 |    82.35 |   94.11 |   97.95 |                   
  ...oProvider.jsx |   94.87 |       50 |   92.85 |   97.14 | 26                
 src/hooks         |   96.96 |    66.66 |   93.33 |   96.55 |                   
  ...ertySearch.js |   96.55 |       50 |   92.85 |      96 | 46                
 src/pages         |   94.44 |    94.73 |      95 |   94.33 |                   
  ...boardPage.jsx |   85.71 |    83.33 |     100 |   85.71 | 25                
  ErrorPage.jsx    |      50 |      100 |      50 |      50 | 11                
  ...yListPage.jsx |   91.66 |       90 |     100 |   91.66 | 30                
 src/services      |   97.01 |       85 |   95.65 |   96.77 |                   
  ...rtyService.js |     100 |       85 |     100 |     100 | 43-44,176         
  ...delService.js |   66.66 |      100 |   66.66 |   66.66 | 19-20             
 src/utils         |   98.76 |    95.45 |     100 |     100 |                   
  format.js        |   92.68 |     87.5 |     100 |     100 | 51-61,106         
  rentModel.js     |     100 |       96 |     100 |     100 | 83                
  search.js        |     100 |    91.17 |     100 |     100 | 163-164,191-209   
  searchParams.js  |     100 |       95 |     100 |     100 | 103-107           
  sort.js          |   96.42 |    96.66 |     100 |     100 | 46                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 96.59% ( 766/793 )
Branches     : 92.04% ( 544/591 )
Functions    : 96.75% ( 268/277 )
Lines        : 97.51% ( 706/724 )
================================================================================
```
