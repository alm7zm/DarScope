# Darscope style guide

Part of deliverable PD-03 (SRS section 12). It records the design decisions the app actually
uses, so a new screen looks like the ones already built.

Everything here is defined once, in
[`frontend/src/styles/tokens.css`](../../frontend/src/styles/tokens.css). Components read those
variables and never write a raw colour, size or spacing value (UI-06). If a value below and the
token file disagree, **the token file is right** and this document is out of date.

> **Still to do:** the wireframes. This covers the style half of PD-03 only.

## Principles

1. **Information first.** This is a tool someone uses all day to find and change records, not a
   landing page. Density and legibility beat decoration.
2. **Never colour alone.** Every status, error and current-page marker carries a word or a shape
   as well as a colour, so it survives greyscale and a screen reader (NFR-ACC-05).
3. **One way to do each thing.** One button component, one field component, one set of tokens. A
   screen that needs something new adds it to the shared layer rather than styling in place.
4. **English interface, bilingual data.** Labels are English. Any element showing a district,
   tenant name or description carries `dir="auto"`, and `lang="ar"` when it holds Arabic, so the
   browser lays it out correctly inside the English page (FR-LST-07, NFR-ACC-07).

## Colour

Every pair below was measured before it was used. Body text clears 4.5:1 and the focus ring
clears 3:1 against both the page and a card (NFR-ACC-02, WCAG 1.4.11).

### Neutrals

| Token | Value | Used for |
| --- | --- | --- |
| `--color-bg` | `#f6f7f9` | The page behind everything |
| `--color-surface` | `#ffffff` | Cards, the table, the header, dialogs |
| `--color-surface-sunken` | `#eef1f5` | Table headers, chips, hover rows |
| `--color-border` | `#d8dee6` | Card and table edges |
| `--color-border-strong` | `#b9c2cd` | Input edges, dashed empty states |
| `--color-text` | `#111822` | Body text — 16.6:1 on the page |
| `--color-text-muted` | `#59636f` | Labels, hints, secondary figures — 5.7:1 |

### Brand and intent

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary` | `#0a6357` | The main action on a screen, links |
| `--color-primary-strong` | `#07463d` | Its hover and active state |
| `--color-primary-tint` | `#e3efed` | The current menu item, confirmation messages |
| `--color-danger` | `#a81d13` | Delete, and only Delete |
| `--color-danger-strong` | `#7d150e` | Its hover state |
| `--color-danger-tint` | `#fdecea` | Error panels |
| `--color-focus` | `#1d4ed8` | The focus ring, on everything |

### Status

Each status has a background and a text colour, and the chip always carries the status **word**
and a dot. The colour is a shortcut for people who can use it, never the only signal.

| Status | Background | Text | Contrast |
| --- | --- | --- | --- |
| Vacant | `#e6f4ec` | `#15603c` | 6.7:1 |
| Occupied | `#e7edfb` | `#1d3f91` | 8.2:1 |
| Under maintenance | `#fcf0dc` | `#7a4a07` | 6.6:1 |

## Type

The stack is `system-ui` first, falling back through fonts that carry Arabic letters
(`Noto Sans Arabic`, `Tahoma`). No web font is loaded: nothing to download, and Arabic renders in
whatever the device has.

| Token | Size | Used for |
| --- | --- | --- |
| `--font-size-xs` | 12px | Section labels, hints, chips |
| `--font-size-sm` | 14px | Table body, secondary text |
| `--font-size-md` | 16px | Body, form controls |
| `--font-size-lg` | 18px | Dialog titles, empty-state text |
| `--font-size-xl` | 22px | Dialog headings |
| `--font-size-2xl` | 28px | Page titles, dashboard figures |
| `--font-size-3xl` | 36px | Page titles from 768px up |

Weights are 500 (`--font-weight-medium`) and 600 (`--font-weight-bold`) only. Line height is 1.55
for prose and 1.25 for headings.

Two rules that matter more than they look:

- **`font-variant-numeric: tabular-nums` on every figure.** Rent and size columns only line up
  because digits share a width.
- **Section labels are uppercase 12px muted**, not headings. "LOCATION", "BY CITY" and the table
  column heads all use this, which is what makes the cards read as one family.

## Spacing and shape

Spacing steps from `--space-1` (4px) to `--space-12` (48px), on a 4px grid. Cards use
`--space-5` (20px) of padding; page sections are `--space-8` (32px) apart.

| Token | Value | Used for |
| --- | --- | --- |
| `--radius-sm` | 4px | Chips inside text, focus rings |
| `--radius` | 8px | Buttons, inputs, messages |
| `--radius-lg` | 12px | Cards, tables, dialogs |
| `--radius-pill` | 999px | Status chips, amenity chips |

Elevation is deliberately shallow: `--shadow-sm` for a resting card, `--shadow-md` for the form
action bar, `--shadow-overlay` for a dialog. Nothing floats without a reason.

## Components

### Buttons

Three variants, and the variant carries the meaning (UI-05):

| Variant | Looks like | Used for |
| --- | --- | --- |
| `primary` | Filled green | The one main action on a screen: Save, Add property |
| `secondary` | White with a border | Cancel, Clear all, and anything that is not the main action |
| `danger` | Filled red | Delete, and nothing else |

Two sizes: `medium` (44px tall, the default) and `small` (32px, for dense table rows). Pass
`size="small"` rather than styling a button from the outside — `Button` merges an incoming
`className`, but the size belongs to the component.

**A button acts; a link navigates.** View and Edit in a table row are links, so Ctrl-click and
middle-click work. Delete is a button, because it does something.

### Form fields

Use `TextField`, `SelectField`, `TextAreaField` and `CheckboxField` from
`components/ui/FormField.jsx`. Each one owns its label, its required marker, its hint and its
error, and links the error to the control with `aria-describedby` (NFR-ACC-03), so a field cannot
be wired up wrongly by accident.

- Labels sit **above** the control, hints **below** it. A hint above pushes its input down and the
  inputs on a row stop lining up.
- Required is the **word** "(required)", not an asterisk and not a colour.
- Number fields are text inputs with `inputMode="numeric"`, not `type="number"`: a number input
  discards what it cannot parse, and FR-ADD-03 says everything the user typed must survive a
  failed save.
- Units go in the label: "Size (m²)", "Yearly rent (SAR)", "Age (years)" (UI-03).

### Cards and tables

A card is `--color-surface`, a `--color-border` edge, `--radius-lg`, `--shadow-sm` and
`--space-5` of padding. A titled card gets an uppercase 12px label with a rule under it.

A table lives inside a frame with `overflow-x: auto`, so a wide table scrolls **inside itself**
and the page never scrolls sideways at 360px (NFR-USE-02). Table headers are sticky. Any grid
holding a table needs `min-width: 0` on its children, or the table will push the column wider
than the screen instead of scrolling.

### Messages and dialogs

One confirmation strip lives in the layout, in a `aria-live="polite"` region that is always on
the page, so a message is announced wherever the action happened (FR-FBK-01, FR-FBK-02).

Dialogs are the browser's own `<dialog>` element with `showModal()`. That gives focus trapping,
Esc to close and focus returning to the control that opened it for free — a hand-written focus
trap would be more code and worse. Cancel is focused first, so Enter never destroys anything.

## Layout and responsiveness

The content column is `--content-width` (76rem) and centred. The app works from **360px to
1920px** with no sideways page scroll.

Breakpoints are expressed in `rem` and chosen where the content needs them, not at device sizes:
30rem (field pairs), 36rem (form columns), 40rem (filter columns), 48rem (larger page titles),
54rem (About panels), 60rem (detail cards), 64rem (dashboard panels).

## Accessibility checklist for a new screen

- [ ] One `h1` that names the page, with section headings below it in order (NFR-ACC-04)
- [ ] Every control reachable by keyboard, with the focus ring visible (NFR-ACC-01)
- [ ] Every input has a label; every error is linked to its field (NFR-ACC-03)
- [ ] Text at 4.5:1, the focus ring at 3:1 — measure, do not guess (NFR-ACC-02)
- [ ] Targets at least 24×24, and 44×44 where there is room (WCAG 2.5.8)
- [ ] No meaning carried by colour alone (NFR-ACC-05)
- [ ] `dir="auto"` on anything showing property text, `lang="ar"` when it holds Arabic
- [ ] No sideways page scroll at 360px (NFR-USE-02)
- [ ] Nothing animates for anyone who asked for reduced motion
