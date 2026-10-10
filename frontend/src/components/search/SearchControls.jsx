import Button from '../ui/Button.jsx';
import { SelectField, TextField } from '../ui/FormField.jsx';
import { CITIES, PROPERTY_TYPES, STATUSES } from '../../constants/options.js';
import styles from './SearchControls.module.css';

/**
 * The search box and the filters, above the property list (FR-SRC-01, FR-SRC-04). It holds no
 * state of its own: `usePropertySearch` owns all of it, so the page decides what the list shows.
 *
 * @param {{
 *   text: string,
 *   onTextChange: (text: string) => void,
 *   onSubmit: () => void,
 *   filters: Record<string, unknown>,
 *   onFilterChange: (name: string, value: unknown) => void,
 *   onFilterToggle: (name: string, value: string) => void,
 *   onClearAll: () => void,
 *   rangeErrors: Record<string, string>,
 * }} props
 */
export default function SearchControls({
  text,
  onTextChange,
  onSubmit,
  filters,
  onFilterChange,
  onFilterToggle,
  onClearAll,
  rangeErrors,
}) {
  return (
    <form
      className={styles.panel}
      role="search"
      // Enter searches at once, rather than waiting out the pause (FR-SRC-03).
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <TextField
            id="search"
            label="Search properties"
            // A real search input, so it carries the searchbox role and the browser's own
            // clear control (FR-SRC-01).
            type="search"
            hint="Any word from the ID, city, district, type, status, tenant, description or amenities. Arabic works too."
            value={text}
            onChange={onTextChange}
          />
        </div>
        {/* FR-SRC-06. It clears the box and every filter at once. */}
        <Button variant="secondary" onClick={onClearAll}>
          Clear all
        </Button>
      </div>

      <div className={styles.filters}>
        <CheckboxGroup
          legend="City"
          name="cities"
          options={CITIES}
          chosen={filters.cities}
          onToggle={onFilterToggle}
        />
        <CheckboxGroup
          legend="Status"
          name="statuses"
          options={STATUSES}
          chosen={filters.statuses}
          onToggle={onFilterToggle}
        />

        <div className={styles.column}>
          <SelectField
            id="filter-type"
            label="Type"
            value={filters.propertyType}
            options={PROPERTY_TYPES}
            placeholder="Any type"
            onChange={(value) => onFilterChange('propertyType', value)}
          />
          <SelectField
            id="filter-minBedrooms"
            label="Bedrooms, at least"
            value={filters.minBedrooms}
            options={['0', '1', '2', '3', '4', '5', '6', '7', '8']}
            placeholder="Any number"
            onChange={(value) => onFilterChange('minBedrooms', value)}
          />
        </div>

        <RangeGroup
          legend="Yearly rent (SAR)"
          name="rent"
          from={filters.rentFrom}
          to={filters.rentTo}
          error={rangeErrors.rent}
          onChange={onFilterChange}
        />
        <RangeGroup
          legend="Size (m²)"
          name="size"
          from={filters.sizeFrom}
          to={filters.sizeTo}
          error={rangeErrors.size}
          onChange={onFilterChange}
        />
      </div>
    </form>
  );
}

/**
 * A filter that accepts several values at once, such as City (FR-SRC-04). Tick boxes rather than
 * a multiple-select: a multiple-select is hard to use with a keyboard and worse on a phone.
 */
function CheckboxGroup({ legend, name, options, chosen = [], onToggle }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => {
        const id = `filter-${name}-${option.replace(/\s+/g, '-')}`;
        return (
          <div key={option} className={styles.checkbox}>
            <input
              id={id}
              type="checkbox"
              checked={chosen.includes(option)}
              onChange={() => onToggle(name, option)}
            />
            <label htmlFor={id}>{option}</label>
          </div>
        );
      })}
    </fieldset>
  );
}

/**
 * A "from" and a "to" that belong together. A range the wrong way round shows its message here
 * and is not applied to the list (FR-SRC-07).
 */
function RangeGroup({ legend, name, from, to, error, onChange }) {
  const fromField = `${name}From`;
  const toField = `${name}To`;

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.range}>
        <TextField
          id={`filter-${fromField}`}
          label="From"
          numeric
          value={from}
          onChange={(value) => onChange(fromField, value)}
        />
        <TextField
          id={`filter-${toField}`}
          label="To"
          numeric
          value={to}
          onChange={(value) => onChange(toField, value)}
        />
      </div>
      {error ? (
        <p className={styles.rangeError} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
