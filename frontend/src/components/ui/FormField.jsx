import styles from './FormField.module.css';

/**
 * The form controls the app uses. Each one owns its own label, its required marker, its unit and
 * its error, and links the error to the control with `aria-describedby`, so no caller can wire a
 * field up wrongly (NFR-ACC-03, FR-ADD-02).
 *
 * Number fields are text inputs with a numeric keypad rather than `type="number"`. A number input
 * throws away input it cannot parse, and FR-ADD-03 says every value the user entered must still
 * be there after a failed save. `utils/validation.js` decides what counts as a whole number.
 */

/** The id of the element holding a field's error message. */
function errorId(id) {
  return `${id}-error`;
}

/** The id of the element holding a field's hint. */
function hintId(id) {
  return `${id}-hint`;
}

/** What a control should point `aria-describedby` at, given which of hint and error exist. */
function describedBy(id, { hint, error }) {
  const ids = [hint ? hintId(id) : null, error ? errorId(id) : null].filter(
    Boolean,
  );
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Label, required marker, hint and error around one control.
 * @param {{
 *   id: string, label: string, required?: boolean, hint?: string, error?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
function Wrapper({ id, label, required = false, hint, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          /* The marker is a word, not only an asterisk, so it is never colour or symbol
             alone (FR-ADD-02, NFR-ACC-05). */
          <span className={styles.required}> (required)</span>
        ) : null}
      </label>
      {children}
      {/* The hint sits below the control, not above it: a hint above pushes its input down, and
          the inputs on a row stop lining up. `aria-describedby` reads it either way. */}
      {hint ? (
        <p className={styles.hint} id={hintId(id)}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId(id)}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A single-line text field. `numeric` shows a numeric keypad on a phone.
 * @param {{
 *   id: string, label: string, value: string, onChange: (value: string) => void,
 *   required?: boolean, hint?: string, error?: string, numeric?: boolean, type?: string,
 *   disabled?: boolean,
 * }} props
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  required = false,
  hint,
  error,
  numeric = false,
  type = 'text',
  disabled = false,
}) {
  return (
    <Wrapper
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <input
        id={id}
        name={id}
        type={type}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        // These are property records, not the person's own details, so the browser should not
        // offer to fill them in or flag districts as misspelt.
        autoComplete="off"
        spellCheck={type === 'search' ? false : undefined}
        // District, tenant name and description may be Arabic, so the field reads
        // right-to-left as soon as Arabic is typed into it (FR-LST-07).
        dir={type === 'date' ? undefined : 'auto'}
        inputMode={numeric ? 'numeric' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
      />
    </Wrapper>
  );
}

/**
 * A choice from a fixed list. An optional field offers a blank first option.
 * @param {{
 *   id: string, label: string, value: string, options: string[],
 *   onChange: (value: string) => void, required?: boolean, hint?: string, error?: string,
 *   placeholder?: string,
 * }} props
 */
export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  required = false,
  hint,
  error,
  placeholder,
}) {
  return (
    <Wrapper
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
    >
      <select
        id={id}
        name={id}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
      >
        {placeholder !== undefined ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

/**
 * A multi-line text field.
 * @param {{
 *   id: string, label: string, value: string, onChange: (value: string) => void,
 *   hint?: string, error?: string, rows?: number,
 * }} props
 */
export function TextAreaField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  rows = 4,
}) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className={`${styles.control} ${error ? styles.invalid : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        dir="auto"
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
      />
    </Wrapper>
  );
}

/**
 * One yes/no flag, with its label beside the box.
 * @param {{
 *   id: string, label: string, checked: boolean, onChange: (checked: boolean) => void,
 * }} props
 */
export function CheckboxField({ id, label, checked, onChange }) {
  return (
    <div className={styles.checkbox}>
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
