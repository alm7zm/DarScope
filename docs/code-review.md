# Code review

Deliverable PD-06 (SRS section 12): an AI code review of the frontend, covering security,
performance, code quality and code reuse.

| | |
| --- | --- |
| Date | 16 October 2026 |
| Commit reviewed | `af9b312`, on the `ml-model` branch |
| Scope | `frontend/src/`, 4,780 lines without the tests. `frontend/scripts/` does not exist yet. `backend/` is Part 2 and was not reviewed. |
| Tool | Claude Code (Claude Opus 5.5), following `.claude/skills/code-review-report/SKILL.md` |
| Method | Every file in scope was read. The checks were run at this commit: `npm audit`, `npm run build`, `npm run coverage`, `npm run lint`, searches of the repository for secrets and unsafe calls, and a timing of search, sort and the Dashboard figures over 500 properties. |

## Summary

No High finding. Three Medium: a credit on the About page that says something untrue, a focus
gap on the District field, and a button style written out three times.

| Area | High | Medium | Low | Total |
| --- | --- | --- | --- | --- |
| Security | 0 | 0 | 2 | 2 |
| Performance | 0 | 0 | 3 | 3 |
| Code quality | 0 | 2 | 6 | 8 |
| Code reuse | 0 | 1 | 5 | 6 |
| **Total** | **0** | **3** | **16** | **19** |

## Fixed while preparing this review

Two problems came to light while tests were being written for this review. Both were fixed
before commit `af9b312`, so they are not findings below.

- `utils/sort.js` listed a property without the sorted value first when sorting in descending
  order, although the file says it sorts last either way. A new test failed, then passed after
  the fix (commit `36b9198`).
- `npm run coverage` failed: one Dashboard test that fills in the whole form needed 5.3 seconds
  under coverage, past Vitest's default limit of 5. It never hung. The limit is now 15 seconds
  (commit `af9b312`). CR-03 explains why the form tests are slow.

## Security

**What was checked and found clean**

- No API key, token or password anywhere in the repository (NFR-SEC-01). The only matches for
  "token" are the design tokens.
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function`. All user text is rendered
  as React text (NFR-SEC-03).
- No `fetch`, `XMLHttpRequest`, WebSocket, cookie, `localStorage`, `sessionStorage` or
  analytics. `index.html` loads nothing from another site. Links that leave the app carry
  `rel="noreferrer noopener"` (IF-01 to IF-03).
- `portfolio.seed.json` holds invented tenant names and no email address, phone number or link
  (NFR-SEC-02).
- `npm audit`: **found 0 vulnerabilities**, for all dependencies and for production ones alone.
  `package-lock.json` is committed (NFR-SEC-05).
- The data service runs the same `validateProperty` as the form on every `create` and `update`,
  and `normaliseValues` copies only the known fields, so a caller cannot set `id`, `createdAt`
  or an unknown field (NFR-REL-03).
- The team photo's camera data holds no location: its GPS block has only a version number.

### CR-01 · Low · `restore` adds a property without checking it

- **Where:** `src/services/propertyService.js:163-181`
- **What:** `create` and `update` reject invalid values, but `restore` accepts any object whose
  ID is not in use and puts it into the portfolio as it is. It does not run `validateProperty`,
  and it does not check that the ID is one the service issued.
- **Why it matters:** NFR-REL-03 says no invalid property may ever enter the portfolio, and the
  service is where Part 2 will draw the line between trusted and untrusted input. Today only the
  tests call `restore`, because Undo (FR-DEL-07) is not built.
- **Fix:** In `restore`, run `validateProperty` and reject on errors, as `create` does, and
  reject an ID that does not match `RP-` plus digits or is above `highestIdIssued`.

### CR-02 · Low · A third person's contact details are published

- **Where:** `src/constants/team.js:65-73`, `src/assets/team/Dr. Skander Turki.jpg`
- **What:** The public repository and the built app carry the instructor's email address,
  LinkedIn and GitHub profiles and photo.
- **Why it matters:** NFR-SEC-02 covers only the seed data, but the same care applies here: the
  team chose to publish its own details, and the instructor's are someone else's.
- **Fix:** Confirm that the instructor agrees, or keep only the name and role.

## Performance

**What was checked and found clean**

- The rent model's weights are a separate 7.90 kB file (2.86 kB compressed), loaded with a
  dynamic `import()` the first time a form shows the suggestion (`services/rentModelService.js`,
  FR-RNT-02). The AI library and the market reference set are not built yet, so nothing is
  loaded too early (NFR-PERF-04, FR-DAT-07).
- Search waits 300 ms after the last keystroke (`hooks/usePropertySearch.js:24-27`, FR-SRC-03),
  and its results are memoised (`:69-72`).
- Timed over 500 properties (NFR-PERF-02 allows 200 ms): an Arabic and English keyword search
  with two filters takes 3.8 ms, a sort 0.04 to 0.2 ms, and all the Dashboard figures 0.14 ms.
- `npm run build`, against the 300 kB limit of NFR-PERF-07:

  | File | Size | Compressed |
  | --- | --- | --- |
  | `index-C_5cpKeN.js`, the app | 379.22 kB | **118.69 kB** |
  | `index-BQEJokuX.css` | 33.38 kB | 5.67 kB |
  | `rent-model-Bm6g7ibl.js` | 7.90 kB | 2.86 kB |
  | Team photos, as WebP | 26.79 kB and 6.89 kB | |

### CR-03 · Low · Every keystroke in the form re-renders about 290 dropdown options

- **Where:** `src/components/properties/PropertyForm.jsx:113-122` and `:232-272`,
  `src/components/properties/DistrictField.jsx:33-37`,
  `src/components/properties/RentSuggestion.jsx:45-46`
- **What:** `setField` replaces the form's values, so every field re-renders on every
  keystroke: Age has 101 options, the three room counts 21 each, and District up to 106 for
  Riyadh. The rent suggestion runs `validateProperty` and the model again each time.
- **Why it matters:** In a browser this costs a millisecond or two. In the test environment
  each keystroke costs 20 to 35 ms, so the tests that fill in the whole form take 2 to 5
  seconds under coverage, which is why the test time limit had to be raised.
- **Fix:** Wrap `SelectField` in `React.memo` and give it a stable change handler, such as one
  `useCallback` that takes the field name, so only the field that changed re-renders.

### CR-04 · Low · Each confirmation message re-renders the whole page

- **Where:** `src/context/PortfolioProvider.jsx:73-90`, `src/pages/DashboardPage.jsx:36`,
  `:62-63`
- **What:** The message and the properties share one context value, so showing a confirmation
  and clearing it 5 seconds later re-renders every page that reads the portfolio. The Dashboard
  then recalculates `summarise`, `byCity` and `needsAttention`, which are not memoised.
- **Why it matters:** It is work for nothing, though 0.14 ms for 500 properties is not
  noticeable. It grows with every page that reads the portfolio.
- **Fix:** Memoise the three Dashboard figures with `useMemo` on `properties`. If more pages
  need it, give the message its own context.

### CR-05 · Low · The repository holds a 9.4 MB original photo

- **Where:** `src/assets/team/Hussam Aldossary.jpeg`
- **What:** The file is the camera's 4016 × 6016 original, with its camera data (make, model,
  date taken, editing software). The build turns it into a 26.79 kB WebP without that data, but
  the repository keeps the original.
- **Why it matters:** Everyone who clones the repository, including the marker, downloads
  9.4 MB for a 27 kB picture, and the camera data is published with it.
- **Fix:** Commit a copy about 1,000 px across, without the camera data. The build still crops
  and shrinks it. The original stays in the history unless that is rewritten.

## Code quality

**What was checked and found clean**

- `npm run lint` reports no problem, and the code has no `eslint-disable`. Prettier is clean.
- `npm run coverage`: 447 tests pass, with 96.59% statement coverage (NFR-TST-06 asks for 70%).
- The reducer and the service never change the collection in place: they use spread, `map`,
  `filter`, `with` and `toSpliced` (NFR-REL-04).
- Field checks, search, sorting, statistics, formatting and the rent model are pure functions
  in `src/utils/` (NFR-MNT-01).
- Accessibility (SRS 10.3): a skip link, header, nav, main and footer landmarks, one `h1` per
  page, one live region for confirmations, every field's hint and error linked with
  `aria-describedby`, status shown as a word as well as a colour, `aria-current` on the menu,
  Arabic text marked with `lang` and `dir`, and the delete dialog built on the browser's own
  `<dialog>`.

### CR-06 · Medium · The About page and the footer credit the sample properties to the dataset

- **Where:** `src/pages/AboutPage.jsx:106-113`, `src/layouts/Footer.jsx:12`
- **What:** The About page says "The properties shown are a cleaned sample of it", and the
  footer says "Sample data: Saudi Arabia Real Estate (AQAR), Kaggle, 2021." The 8 properties in
  `portfolio.seed.json` were written by hand and none comes from the dataset
  (`src/data/README.md`). What does come from the dataset is the rent model behind the rent
  suggestion.
- **Why it matters:** Every visitor, including the marker, reads a statement about the data
  that is not true.
- **Fix:** Say that the 8 sample properties are invented, and credit the dataset for the rent
  suggestion. Change it back when task 1 replaces the seed with properties from the dataset.

### CR-07 · Medium · After a failed check on "Other district", focus goes to the wrong control

- **Where:** `src/components/properties/PropertyForm.jsx:36-38` and `:125-128`,
  `src/components/properties/DistrictField.jsx:38` and `:45-52`
- **What:** When "Other district…" is chosen and the typed name fails its check, the error is
  shown under the "Other district" text box (`id="districtOther"`), and the dropdown's own error
  is removed. But the form moves focus to `#district`, the dropdown, which then has no error
  linked to it. No test covers this case.
- **Why it matters:** FR-ADD-03 says focus moves to the first invalid field, and NFR-ACC-03
  (Must) says each error is linked to its field. A keyboard or screen reader user lands on a
  control that reports no problem.
- **Fix:** In `focusField`, try `#districtOther` before `#district`, or let `DistrictField`
  give the text box the `district` id while it is open. Add a test that leaves the box empty
  and checks where focus goes.

### CR-08 · Low · The detail and edit pages ignore a failed load

- **Where:** `src/pages/PropertyDetailPage.jsx:18-39`, `src/pages/PropertyFormPage.jsx:16-40`
- **What:** The list and the Dashboard show "The portfolio could not be loaded" when the load
  fails. These two pages read only `loading`, so after a failed load they say "Property not
  found" for every ID.
- **Why it matters:** The message is wrong, and it points the user at the ID rather than the
  failure. The Part 1 service never fails to load, but the Part 2 service, over the network,
  will.
- **Fix:** Read `loadError` and show the same message as the list. CR-14's shared component
  would hold it.

### CR-09 · Low · Code that no page uses

- **Where:** `src/utils/sort.js`, `src/utils/searchParams.js`, `src/utils/search.js:168-216`
  (`activeFilterChips`), `src/context/PortfolioProvider.jsx:63-67` (`resetDemoData`),
  `src/services/propertyService.js:163-181` (`restore`)
- **What:** These are written and tested, but nothing calls them except the tests, and the
  build leaves the first two out. They belong to Should requirements that are not wired up yet:
  sorting (FR-SRC-09), pages (FR-LST-10), the search in the URL (FR-SRC-12), filter chips
  (FR-SRC-13), Reset demo data (FR-DAT-05) and Undo (FR-DEL-07).
- **Why it matters:** A reader takes them for features of the app. The list is not sorted at
  all today, although FR-SRC-09 names Last updated, newest first, as the default order.
- **Fix:** Wire them into the property list and the delete flow (stage 2), or record them in
  `docs/tasks.md` as ready but unused.

### CR-10 · Low · The failure paths have no tests

- **Where:** Uncovered lines in the coverage run: `src/components/properties/PropertyForm.jsx:164-168`
  (the service rejects a save), `src/components/properties/DeletePropertyDialog.jsx:35` (a
  delete fails), `src/context/PortfolioProvider.jsx:26` with `src/pages/DashboardPage.jsx:25`
  and `src/pages/PropertyListPage.jsx:30` (the load fails), `src/services/rentModelService.js:19-20`
  (another try after the weights fail to load), `src/pages/ErrorPage.jsx:11` (Reload).
- **What:** Every success path is tested; these error paths never run in a test.
- **Why it matters:** Error handling that is never run is where Part 2 will find its bugs, once
  the service can really fail.
- **Fix:** Tests that replace a service function with one that rejects, and check the message
  each path shows.

### CR-11 · Low · The delete dialog can show an old error

- **Where:** `src/components/properties/DeletePropertyDialog.jsx:26-37`
- **What:** `failure` is cleared only when Delete is pressed. If a delete fails and the user
  cancels, the next property's dialog opens with the old error still showing.
- **Why it matters:** The message would describe a different property. In Part 1 a delete fails
  only when its property has already gone.
- **Fix:** Clear `failure` in the Cancel handler, or give the dialog `key={property?.id}` so it
  starts fresh for each property.

### CR-12 · Low · The dialog's title id is fixed

- **Where:** `src/components/ui/Dialog.jsx:49` and `:57`
- **What:** Every `Dialog` labels itself with `aria-labelledby="dialog-title"` and gives its
  heading that id.
- **Why it matters:** The dialog stays in the page while closed, so a page with two dialogs
  would have two elements with one id, and a screen reader could read the wrong title. Each
  page has one dialog today.
- **Fix:** Make the id with `useId()`, as `RentSuggestion.jsx:29` does.

### CR-13 · Low · Two files are past the 250-line limit

- **Where:** `src/components/properties/PropertyForm.jsx` (394 lines),
  `src/components/ui/FormField.jsx` (266 lines)
- **What:** NFR-MNT-06 and `.claude/rules/frontend.md` ask for a component file to be split at
  about 250 lines.
- **Why it matters:** The form is the most changed file in the app, and the pure parts inside
  it cannot be tested on their own.
- **Fix:** Move `FIELD_ORDER`, `blankValues` and `valuesFrom` to `src/utils/`, and each field
  group (Location, Building, Rent and tenancy) into its own component.

## Code reuse

**What was checked and found clean**

- Every form field except CR-17's tick boxes comes from `components/ui/FormField.jsx`, and every
  button from `components/ui/Button.jsx`.
- Numbers, dates and titles are formatted only in `utils/format.js`, and every element that can
  show Arabic text gets its attributes from `textDirection` in `utils/arabic.js`.
- Choices, ranges and the market constants are read from `src/constants/`, apart from CR-16 and
  CR-19.

### CR-14 · Medium · A button style, an empty state and an error box are each written more than once

- **Where:** The link styled as a primary button: `src/pages/PropertyDetailPage.module.css:8-25`,
  `src/pages/PropertyListPage.module.css:39-56`, `src/pages/DashboardPage.module.css:75-92`.
  The empty state: `PropertyListPage.module.css:19-36` with `PropertyListPage.jsx:89-106`, and
  `DashboardPage.module.css:56-73` with `DashboardPage.jsx:53-59`. The load error:
  `PropertyListPage.module.css:8-16` with `PropertyListPage.jsx:29-37`, and
  `DashboardPage.module.css:1-9` with `DashboardPage.jsx:24-32`.
- **What:** Three copies of the primary button's look, outside `Button`, and the copies have
  already drifted (`background-color` in one, `background` in another). Two copies of the empty
  state and of the load error, in markup and in CSS.
- **Why it matters:** A change to the primary button's colour or size has to be made in four
  places, and one will be missed. The rules say buttons are styled only through `Button`.
- **Fix:** A `ButtonLink` in `components/ui/` that gives a router `Link` the classes of
  `Button`, and shared `EmptyState` and `LoadError` components.

### CR-15 · Low · Messages written into components

- **Where:** "The portfolio could not be loaded." in `src/pages/DashboardPage.jsx:28` and
  `src/pages/PropertyListPage.jsx:33`; "The property could not be saved." in
  `src/components/properties/PropertyForm.jsx:168`; "The property could not be deleted." in
  `src/components/properties/DeletePropertyDialog.jsx:35`; the loading lines in
  `DashboardPage.jsx:19`, `PropertyListPage.jsx:24`, `PropertyDetailPage.jsx:25` and
  `PropertyFormPage.jsx:24`.
- **What:** These fixed messages are written where they are shown, one of them twice, instead
  of in `src/constants/messages.js`. None of them is in SRS Appendix C.
- **Why it matters:** NFR-MNT-04 keeps every fixed message in one module, so that wording is
  changed once and the tests can import it.
- **Fix:** Move them to `TEXT` in `messages.js`, and add them to Appendix C.

### CR-16 · Low · The bedroom filter lists its own numbers

- **Where:** `src/components/search/SearchControls.jsx:89`
- **What:** "Bedrooms, at least" offers `'0'` to `'8'`, written out in the component, while a
  property may have up to 20 bedrooms (`RANGES.bedrooms`) and `numberChoices('bedrooms')` in
  `constants/options.js` already builds the list.
- **Why it matters:** The filter and the form disagree on the range, and a choice list is
  repeated in a component (NFR-MNT-04).
- **Fix:** `options={numberChoices('bedrooms')}`, or a named constant in `options.js` if the
  shorter list is wanted.

### CR-17 · Low · The filter tick boxes bypass `CheckboxField`

- **Where:** `src/components/search/SearchControls.jsx:120-140`
- **What:** `CheckboxGroup` writes its own `<input type="checkbox">` and `<label>`, which is
  what `CheckboxField` in `src/components/ui/FormField.jsx:253-266` renders.
- **Why it matters:** `.claude/rules/frontend.md` says form controls come from `FormField.jsx`,
  so that a fix to one tick box reaches all of them.
- **Fix:** Render a `CheckboxField` for each option inside the group's `fieldset`.

### CR-18 · Low · Arabic-Indic digits are converted in two places

- **Where:** `src/components/ui/FormField.jsx:19-24` and `src/utils/arabic.js:35-37`
- **What:** Both turn ٠ to ٩ into 0 to 9 with the same expression.
- **Why it matters:** A change to one, such as accepting Persian digits too, would not reach
  the other, and search and number fields would disagree.
- **Fix:** Export one `westernDigits(text)` from `utils/arabic.js` and call it from both.

### CR-19 · Low · Status names are compared as literal strings

- **Where:** `src/utils/stats.js:38`, `:45`, `:48`, `:73`, `:87`; `src/utils/validation.js:134`,
  `:212`; `src/components/properties/PropertyForm.jsx:69`, `:108`, `:111`;
  `src/components/properties/PropertyDetail.jsx:22`; `src/components/ui/Badge.jsx:5-7`;
  `src/components/dashboard/SummaryCards.jsx:46-59`
- **What:** `STATUSES` in `constants/options.js` lists the three statuses, but the code
  compares against `'Occupied'`, `'Vacant'` and `'Under maintenance'` written out in seven
  files.
- **Why it matters:** Renaming a status, or a typing mistake in one comparison, would silently
  break the Dashboard counts or the tenancy rules, with no error to show it.
- **Fix:** Export named constants, such as `STATUS.occupied`, from `options.js`, and compare
  against those.

## Decisions

The team decides each finding: **Fixed**, or **Accepted** with the team's reason.

On 16 October 2026 the team chose to fix the three Medium findings first. The Low findings
wait for the team's decision.

| ID | Severity | Decision | Reason |
| --- | --- | --- | --- |
| CR-01 | Low | | |
| CR-02 | Low | | |
| CR-03 | Low | | |
| CR-04 | Low | | |
| CR-05 | Low | | |
| CR-06 | Medium | Fixed | Commit `4d55010`: the About page and the footer credit the dataset for the rent suggestion and say the sample properties are invented |
| CR-07 | Medium | Fixed | Commit `4d55010`: focus goes to the "Other district" box, with a test |
| CR-08 | Low | | |
| CR-09 | Low | | |
| CR-10 | Low | | |
| CR-11 | Low | | |
| CR-12 | Low | | |
| CR-13 | Low | | |
| CR-14 | Medium | Fixed | Commit `4d55010`: `ButtonLink`, `EmptyState` and `LoadError` replace the copies, and each button variant keeps its text colour on hover |
| CR-15 | Low | | |
| CR-16 | Low | | |
| CR-17 | Low | | |
| CR-18 | Low | | |
| CR-19 | Low | | |
