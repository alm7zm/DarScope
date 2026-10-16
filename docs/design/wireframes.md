# Darscope wireframes

Part of deliverable PD-03 (SRS section 12), with the [style guide](style-guide.md). There is one
wireframe for every screen in SRS section 9.1. A wireframe shows what each screen holds and where
it sits. Colour, type and spacing are in the style guide.

They were drawn on 16 October 2026 from the screens as built at commit `af9b312`, so they match
the app. Anything marked **planned** belongs to a Should or Could requirement that is not built
yet, and is named by its ID. Market insights is planned as a whole: its address shows a
placeholder today.

## How to read them

| Drawn as | Means |
| --- | --- |
| `[ Save ]` | A button |
| `(Edit)` | A link |
| `[Choose a city   v]` | A dropdown |
| `[______]` | A text field |
| `[ ] Pool` | A tick box |
| `(• Occupied)` | A status badge: the word, with a coloured dot |
| `‹›` | An area that scrolls sideways inside its frame |
| `┌ LOCATION ──┐` | A titled group: a card, or a fieldset on a form |

Desktop wireframes are drawn at about 1,280 px wide, phone ones at 360 px, the narrowest width the
app supports (NFR-USE-02). The figures are the 8 sample properties.

## Every page

Each page sits in one frame: a header with the name and the menu, then the page, then a footer
(UI-01). The page has one `h1` naming it, and sets the tab title to "Properties · Darscope"
(UI-02, FR-NAV-09). A confirmation appears in one strip at the top of the page after every add,
update and delete, is read out by screen readers, and clears itself after 5 seconds or on ×
(FR-FBK-01, FR-FBK-02).

```text
┌─ every page ─────────────────────────────────────────────────────────────────────────────────────┐
│ [D] Darscope   (Dashboard)  (Properties)  (Add property)  (About)                                │
│ ──────────────────────────────────────────────────────────────────────────────────────────────── │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Property RP-0009 added                                                                   [×] │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ Page title                                                                        [page actions] │
│ One line about the page                                                                          │
│                                                                                                  │
│   … the page …                                                                                   │
│                                                                                                  │
│ ──────────────────────────────────────────────────────────────────────────────────────────────── │
│ SE411 · Fall 2026-27 · Project Part 1    Data credit    Changes are kept only until              │
│                                                         the page reloads.                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The current page's menu item is a filled pill and carries `aria-current="page"` (FR-NAV-04).
  Market insights joins the menu once its page is built (FR-NAV-02).
- The first Tab shows a "Skip to content" link above the header.
- On a phone the menu wraps onto a second line. **Planned (FR-NAV-08):** below 768 px it folds
  behind a Menu button.

```text
┌─ every page, 360 px ───────────────┐
│ [D] Darscope                       │
│ (Dashboard)  (Properties)          │
│ (Add property)  (About)            │
│ ────────────────────────────────── │
│ Page title                         │
│ One line about the page            │
│   … one column …                   │
│ ────────────────────────────────── │
│ SE411 · Fall 2026-27 · Part 1      │
│ Data credit                        │
│ Changes are kept only until        │
│ the page reloads.                  │
└────────────────────────────────────┘
```

## 1. Dashboard

`/`, SRS 4.2. The portfolio at a glance: four headline figures, the three status counts, a table
per city and the properties that earn nothing right now (FR-DSH-01 to FR-DSH-07).

```text
┌─ /  Dashboard ───────────────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                                                ( View all properties ) │
│ The portfolio at a glance.                                                                       │
│                                                                                                  │
│ PORTFOLIO                                                                                        │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐  │
│ │ Total properties    │ │ Occupancy rate      │ │ Rent from occupied  │ │ Potential rent      │  │
│ │ 8                   │ │ 38%                 │ │ 532,000 SAR         │ │ 1,226,000 SAR       │  │
│ │                     │ │                     │ │                     │ │ If every property   │  │
│ │                     │ │                     │ │                     │ │ were let            │  │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘  │
│ BY STATUS                                                                                        │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌─────────────────────────────┐  │
│ │ (• Occupied)                │ │ (• Vacant)                  │ │ (• Under maintenance)       │  │
│ │ 3                           │ │ 4                           │ │ 1                           │  │
│ └─────────────────────────────┘ └─────────────────────────────┘ └─────────────────────────────┘  │
│ BY CITY                                  NEEDS ATTENTION                                         │
│ ┌──────────────────────────────────────┐ ┌─────────────────────────────────────────────────────┐ │
│ │ City       Props  Occ.  Yearly rent  │ │ (RP-0003  Duplex in Al Yasmin, Riyadh)              │ │
│ │ Riyadh     3      1     430,000 SAR  │ │          (• Under maintenance)           95,000 SAR │ │
│ │ Jeddah     2      1     288,000 SAR  │ │ (RP-0002  Villa in (Arabic), Riyadh)                │ │
│ │ Dammam     2      1     188,000 SAR  │ │          (• Vacant)                     145,000 SAR │ │
│ │ Al Khobar  1      0     320,000 SAR  │ │ … every Vacant or Under maintenance property        │ │
│ └──────────────────────────────────────┘ └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The occupancy rate shows a dash, not 0%, when there are no properties. The page then shows the
  zeros and offers "Add property" instead of the two tables (FR-DSH-02, FR-DSH-04).
- Each row of Needs attention links to that property. Under maintenance comes first.
- Below 1,024 px the two tables stack; below 544 px every card takes a whole row.

```text
┌─ /  360 px ────────────────────────┐
│ Dashboard                          │
│ The portfolio at a glance.         │
│ ( View all properties )            │
│ ┌────────────────────────────────┐ │
│ │ Total properties               │ │
│ │ 8                              │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Occupancy rate                 │ │
│ │ 38%                            │ │
│ └────────────────────────────────┘ │
│   … every card, one per row …      │
│ BY CITY                            │
│ ┌────────────────────────────────┐ │
│ │ City    Props  Occ.  Ren ‹›    │ │
│ └────────────────────────────────┘ │
│ NEEDS ATTENTION                    │
│ ┌────────────────────────────────┐ │
│ │ (RP-0003 Duplex in Al Yasmin…) │ │
│ │ (• Under maintenance) 95,000   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## 2. Property list

`/properties`, SRS 4.3 and 6. The search panel sits above the table, and everything in it combines
with AND (FR-SRC-01 to FR-SRC-08).

```text
┌─ /properties  Property list ─────────────────────────────────────────────────────────────────────┐
│ Properties                                                                                       │
│ Every rental house in the portfolio. Search and filter to narrow the list.                       │
│ ┌─ role=search ────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Search properties                                                                            │ │
│ │ [__________________________________________________________________]           [ Clear all ] │ │
│ │ Any word from the ID, city, district, type, status, tenant, description or amenities.        │ │
│ │ ──────────────────────────────────────────────────────────────────────────────────────────── │ │
│ │ CITY          STATUS                TYPE              YEARLY RENT (SAR)   SIZE (m²)          │ │
│ │ [ ] Riyadh    [ ] Vacant            [Any type   v]    From      To        From      To       │ │
│ │ [ ] Jeddah    [ ] Occupied          BEDROOMS, AT      [_____] [_____]     [____] [____]      │ │
│ │ [ ] Dammam    [ ] Under maintenance LEAST                                                    │ │
│ │ [ ] Al Khobar                       [Any number v]                                           │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ Showing 8 of 8 properties                    planned: Sort [Last updated v] [↓]  [Table | Cards] │
│ ┌─ Properties in the portfolio ────────────────────────────────────────────────────────────────┐ │
│ │ ID      City    District  Type   Size   Beds Yearly rent Status       Actions                │ │
│ │ ──────────────────────────────────────────────────────────────────────────────────────────── │ │
│ │ RP-0001 Riyadh  Al Malqa  Villa  620 m² 5    190,000 SAR (• Occupied) (View) (Edit) [Delete] │ │
│ │ RP-0002 Riyadh  (Arabic)  Villa  450 m² 4    145,000 SAR (• Vacant)   (View) (Edit) [Delete] │ │
│ │ RP-0003 Riyadh  Al Yasmin Duplex 310 m² 3    95,000 SAR  (• Under m.) (View) (Edit) [Delete] │ │
│ │ …                                                                                            │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                             planned: [10 v] per page   ‹ 1 2 3 › │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The table's columns are in the order FR-LST-02 gives. Each row offers View, Edit and Delete,
  and each of those names its property for screen readers ("Edit RP-0001", FR-LST-03).
- The count follows the search: "Showing 3 of 8 properties" (FR-LST-04).
- An Arabic district reads right to left inside the English table (FR-LST-07).
- With no match, the table gives way to "No properties match your search." and a Clear all
  button. With no properties at all, it says so and offers Add property (FR-LST-05).
- A rent or size range the wrong way round shows its message under the range and is not applied
  (FR-SRC-07).
- **Planned:** the sort control (FR-SRC-09), card view (FR-LST-09), pages of 10, 25 or 50
  (FR-LST-10), a chip per active filter (FR-SRC-13) and the "Search by meaning" switch beside the
  search box (FR-AIS-01).

```text
┌─ /properties  360 px ──────────────┐
│ Properties                         │
│ Every rental house in the          │
│ portfolio. Search and filter to    │
│ narrow the list.                   │
│ ┌────────────────────────────────┐ │
│ │ Search properties              │ │
│ │ [____________________________] │ │
│ │ Any word from the ID, city, …  │ │
│ │ [ Clear all ]                  │ │
│ │ CITY                           │ │
│ │ [ ] Riyadh                     │ │
│ │ [ ] Jeddah  …                  │ │
│ │ STATUS                         │ │
│ │ [ ] Vacant  …                  │ │
│ │ TYPE                           │ │
│ │ [Any type             v]       │ │
│ │   … one filter per row …       │ │
│ └────────────────────────────────┘ │
│ Showing 8 of 8 properties          │
│ ┌────────────────────────────────┐ │
│ │ ID       City    District  ‹›  │ │
│ │ RP-0001  Riyadh   Al Malqa  …  │ │
│ │ RP-0002  Riyadh   (Arabic)  …  │ │
│ └────────────────────────────────┘ │
│ The table scrolls sideways in      │
│ its frame; the page never does.    │
└────────────────────────────────────┘
```

## 3. Property detail

`/properties/:id`, SRS 4.4. Every field of one property, in the six groups of FR-DET-01. The title
is worked out from the type, district and city, never stored (SRS 3.5).

```text
┌─ /properties/:id  Property detail ───────────────────────────────────────────────────────────────┐
│ Villa in Al Malqa, Riyadh                                   [ Edit ]  [ Delete ]  (Back to list) │
│ Property RP-0001                                                                                 │
│ ┌─ LOCATION ──────────────────────────────────┐ ┌─ BUILDING ───────────────────────────────────┐ │
│ │ City         District      Front            │ │ Type         Size          Age               │ │
│ │ Riyadh       Al Malqa      North            │ │ Villa        620 m²        3 years           │ │
│ │                                             │ │ Bedrooms     Bathrooms     Living rooms      │ │
│ │                                             │ │ 5            6             2                 │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│ ┌─ AMENITIES ─────────────────────────────────┐ ┌─ RENT AND TENANCY ───────────────────────────┐ │
│ │ (Kitchen) (Garage) (Maid's room)            │ │ Yearly rent   Status         Tenant          │ │
│ │ (Air conditioning) (Pool)                   │ │ 190,000 SAR   (• Occupied)   Nora Al Harbi   │ │
│ │ (Front yard)                                │ │ Lease start         Lease end                │ │
│ │ or: No amenities recorded.                  │ │ 1 February 2026     31 January 2027          │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│ ┌─ DESCRIPTION ────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Spacious family villa with a private pool, close to the northern ring road.                  │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ RECORD ─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ID              Created                         Last updated                                 │ │
│ │ RP-0001         1 October 2026, 08:00 UTC       1 October 2026, 08:00 UTC                    │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ planned: MARKET, SRS 7.2 and 7.3 ───────────────────────────────────────────────────────────┐ │
│ │ Fair-rent estimate 104,000 SAR (low 90,000, high 130,000)   (Above market) +21,000 SAR       │ │
│ │ Up to 5 comparable listings: district, type, size, rooms, age, rent, similarity %            │ │
│ │ Based on 2021 listings. Indicative only, not a valuation.                                    │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The tenant and lease lines appear only for an Occupied property (FR-DET-04).
- Below 960 px the groups stack in one column.
- **Planned (SRS 7.2, 7.3):** the market panel, with the fair-rent estimate, the market position
  and up to 5 comparable listings.

An ID that does not exist, or a property that has just been deleted, gets this instead (FR-DET-03):

```text
┌─ /properties/RP-0099  an unknown or deleted ID ──────────────────────────────────────────────────┐
│ Property not found                                                                               │
│                                                                                                  │
│ No property has the ID RP-0099. It may have been deleted.                                        │
│ (Back to list)                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 4. Add and Edit property

`/properties/new` and `/properties/:id/edit`, SRS 5.1 and 5.2. One form for both, in the five
groups of UI-04, with labels above the fields and units in the labels (UI-03).

```text
┌─ /properties/new  and  /properties/:id/edit ─────────────────────────────────────────────────────┐
│ Add property            (Edit property: the same form, filled with the stored values)            │
│ ┌─ LOCATION ───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ City (required)               District (required)           Front                            │ │
│ │ [Choose a city      v]        [Choose a district  v]        [Not recorded       v]           │ │
│ │                               Choose a city first                                            │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ BUILDING ───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Type (required)         Size (m²) (required)    Age (years) (req.)    Bedrooms (req.)        │ │
│ │ [Villa          v]      [______________]        [Choose      v]       [Choose      v]        │ │
│ │                         20 to 100,000           0 means new                                  │ │
│ │ Bathrooms (req.)        Living rooms (req.)                                                  │ │
│ │ [Choose         v]      [Choose        v]                                                    │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ AMENITIES ──────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [ ] Kitchen        [ ] Garage        [ ] Driver's room   [ ] Maid's room   [ ] Furnished     │ │
│ │ [ ] Air conditioning  [ ] Roof space  [ ] Pool   [ ] Front yard   [ ] Basement               │ │
│ │ [ ] Stairs         [ ] Elevator      [ ] Fireplace                                           │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ RENT AND TENANCY ───────────────────────────────────────────────────────────────────────────┐ │
│ │ Yearly rent (SAR) (required)   Suggested rent                                                │ │
│ │ [______________]               ┌───────────────────────────────────────────────────────────┐ │ │
│ │ 1,000 to 10,000,000            │ 163,000 SAR                             [ Use this rent ] │ │ │
│ │                                │ ───────────────────────────────────────────────────────── │ │ │
│ │                                │ Based on 2021 listings. Indicative only, not a valuation. │ │ │
│ │                                └───────────────────────────────────────────────────────────┘ │ │
│ │ Status (required)       Tenant name             Lease start           Lease end              │ │
│ │ [Vacant         v]      [______________]        [dd/mm/yyyy]          [dd/mm/yyyy]           │ │
│ │                         Available when the                                                   │ │
│ │                         status is Occupied                                                   │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ DESCRIPTION ────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Description                                                                                  │ │
│ │ [__________________________________________________________________________________________] │ │
│ │ [__________________________________________________________________________________________] │ │
│ │ Up to 2,000 characters, in Arabic or English                                                 │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ sticky at the window's foot ────────┐                                                         │
│ │ [ Save ]  [ Cancel ]                 │                                                         │
│ └──────────────────────────────────────┘                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Where the choices are fixed, the field is a dropdown: city, district, front, type, age, the room
  counts and status (FR-ADD-14, FR-ADD-15). District lists the chosen city's districts, plus
  "Other district…", which opens a text box.
- A new form starts with Type Villa, Status Vacant and no amenities ticked (FR-ADD-09).
- Tenant name and the lease dates can be used only while Status is Occupied (FR-ADD-07). On Edit,
  moving the status away from Occupied shows a warning that the tenant and lease will be cleared
  (FR-UPD-07).
- The suggested rent sits beside Yearly rent and follows the form as it is filled. It changes the
  rent only through "Use this rent", and warns when the typed rent looks mistyped (FR-ADD-13,
  FR-RNT-07). Before the fields it needs are filled, the panel says what is missing.
- The Save and Cancel bar stays at the foot of the window while the form scrolls.

A failed Save keeps everything that was typed, puts each message under its field and moves focus
to the first field that failed (FR-ADD-03):

```text
┌─ a field after a failed Save ────────────────────────────┐
│ Size (m²) (required)                                     │
│ [ 12          ]   ← red edge, aria-invalid               │
│ Size must be between 20 and 100,000 m².                  │
└──────────────────────────────────────────────────────────┘
```

On a phone every field takes a whole row, and the suggestion drops under Yearly rent:

```text
┌─ /properties/new  360 px ──────────┐
│ Add property                       │
│ ┌─ LOCATION ─────────────────────┐ │
│ │ City (required)                │ │
│ │ [Choose a city          v]     │ │
│ │ District (required)            │ │
│ │ [Choose a district      v]     │ │
│ │ Front                          │ │
│ │ [Not recorded           v]     │ │
│ └────────────────────────────────┘ │
│   … every field, one per row …     │
│ ┌─ RENT AND TENANCY ─────────────┐ │
│ │ Yearly rent (SAR) (required)   │ │
│ │ [______________________]       │ │
│ │ Suggested rent                 │ │
│ │ 163,000 SAR [Use this rent]    │ │
│ │ Based on 2021 listings. …      │ │
│ │ Status (required)              │ │
│ │ [Vacant                 v]     │ │
│ └────────────────────────────────┘ │
│ ┌─ sticky ───────────────────────┐ │
│ │ [ Save ]  [ Cancel ]           │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## 5. Market insights (planned)

`/insights`, SRS 7.4, Should. Statistics from the market reference set, beside the portfolio's
own figures. Today this address shows a placeholder, and the page is not in the menu.

```text
┌─ /insights  Market insights  (planned: FR-INS-01 to FR-INS-04) ──────────────────────────────────┐
│ Market insights                                                                                  │
│ From the 2021 market reference set: Saudi Arabia Real Estate (AQAR), Kaggle,                     │
│ N listings after cleaning (FR-INS-03).                                                           │
│ ┌─ BY CITY ───────────────────────────────────┐ ┌─ BY BEDROOMS ────────────────────────────────┐ │
│ │ City       Listings  Market      Portfolio  │ │ Bedrooms    Median yearly rent               │ │
│ │                      median      median     │ │ 2           … SAR                            │ │
│ │ Riyadh     …         … SAR       … SAR      │ │ 3           … SAR                            │ │
│ │ Jeddah     …         … SAR       … SAR      │ │ 4           … SAR                            │ │
│ │ Dammam     …         … SAR       … SAR      │ │ 5 or more   … SAR                            │ │
│ │ Al Khobar  …         … SAR       … SAR      │ │                                              │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│ ┌─ HIGHEST-RENT DISTRICTS ─────────────────────────────────────────────────────────────────────┐ │
│ │ #   District                  City          Listings    Median yearly rent                   │ │
│ │ 1   …                         Riyadh        …           … SAR                                │ │
│ │ …  10 rows, from districts with at least 5 listings                                          │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ Could (FR-INS-04): each table also drawn as a bar chart, the table kept beside it.               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 6. About

`/about`, SRS 8.1. The team, the course and the credits (FR-ABT-01 to FR-ABT-06).

```text
┌─ /about  About ──────────────────────────────────────────────────────────────────────────────────┐
│ About                                                                                            │
│ Darscope keeps one company's rental villas and duplexes in Riyadh, Jeddah,                       │
│ Dammam and Al Khobar in one place.                                                               │
│ ┌─ TEAM ───────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐                       │ │
│ │ │                    │  │                    │  │                    │                       │ │
│ │ │   photo, or        │  │   photo, or        │  │   photo, or        │                       │ │
│ │ │   initials         │  │   initials         │  │   initials         │                       │ │
│ │ │                    │  │                    │  │                    │                       │ │
│ │ └────────────────────┘  └────────────────────┘  └────────────────────┘                       │ │
│ │ Member name             Member name             Member name                                  │ │
│ │ Student ID              Student ID              Student ID                                   │ │
│ │                                                                                              │ │
│ │ Choosing a photo shows that member's paragraph and links, and greys the others.              │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ INSTRUCTOR ────────────────────────────────┐ ┌─ COURSE ─────────────────────────────────────┐ │
│ │ (photo) Instructor's name                   │ │ Course        SE411                          │ │
│ │         SE411 instructor                    │ │ Term          Fall 2026-27                   │ │
│ │         Paragraph and links                 │ │ Submission    Project Part 1                 │ │
│ │                                             │ │                                              │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│ ┌─ HOW IT IS BUILT ───────────────────────────┐ ┌─ CREDITS ────────────────────────────────────┐ │
│ │ (React …) (Vite) (React Router) (Context …) │ │ The data comes from (the Kaggle dataset).    │ │
│ │ (CSS Modules …) (Vitest …) (ESLint …)       │ │ Built with the help of the AI tools named    │ │
│ │ The code is on (GitHub). No server, no      │ │ here; docs/ai-usage.md records which         │ │
│ │ database: changes last until a reload.      │ │ tool produced each part.                     │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Each member shows a name and a student ID. A member without a photo shows their initials.
- Below 864 px the panels under Team stack in one column.

## 7. Delete dialog

Opened by Delete on a list row or on the detail page, SRS 5.3. Nothing is deleted until it is
confirmed (FR-DEL-01, FR-DEL-02).

```text
┌─ Delete dialog, from a list row or the detail page ──────────────────────────────────────────────┐
│   the page behind is dimmed and blurred, and cannot be used                                      │
│                                                                                                  │
│                     ┌────────────────────────────────────────────────┐                           │
│                     │ Delete this property?                          │                           │
│                     │                                                │                           │
│                     │ RP-0001, Villa in Al Malqa, Riyadh             │                           │
│                     │ The property is removed from the portfolio.    │                           │
│                     │                                                │                           │
│                     │                         [ Cancel ]  [ Delete ] │                           │
│                     └────────────────────────────────────────────────┘                           │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- The dialog names the property by ID, type, district and city.
- Cancel has focus first, so Enter never deletes by accident. Esc cancels. Focus stays inside the
  dialog and returns to the control that opened it (NFR-ACC-06).
- After a delete the list shows "Property RP-0001 deleted". From the detail page, the app returns
  to the list (FR-DEL-04, FR-DEL-05). **Planned (FR-DEL-07):** an Undo button in that message for
  8 seconds.

## 8. Not found

Any address the app does not know, SRS 4.1 (FR-NAV-07).

```text
┌─ any unknown URL  Not found ─────────────────────────────────────────────────────────────────────┐
│ Page not found                                                                                   │
│                                                                                                  │
│ There is no page at this address.                                                                │
│ (Go to the Dashboard)                                                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
