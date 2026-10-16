import { useState } from 'react';
import { SelectField, TextField } from '../ui/FormField.jsx';
import { DISTRICTS } from '../../constants/options.js';

/** The dropdown's value for "Other district…". No district is written this way. */
const OTHER = '(other)';

/**
 * District as a dropdown of the chosen city's districts in the 2021 data, by their English names
 * (FR-ADD-14), so that no name is mistyped and the rent model knows each one. "Other district…"
 * opens a text box for a district the list lacks. A stored name that is in neither, such as an
 * older property's Arabic name, stays as an extra choice, so editing never loses it.
 *
 * @param {{
 *   city: string, value: string, error?: string, onChange: (value: string) => void,
 * }} props
 */
export default function DistrictField({ city, value, error, onChange }) {
  const [typing, setTyping] = useState(false);
  const districts = DISTRICTS[city] ?? [];
  const kept = value && !typing && !districts.includes(value) ? [value] : [];

  return (
    <>
      <SelectField
        id="district"
        label="District"
        required
        disabled={!city}
        hint={city ? undefined : 'Choose a city first'}
        placeholder="Choose a district"
        value={typing ? OTHER : value}
        options={[
          ...kept,
          ...districts,
          { value: OTHER, label: 'Other district…' },
        ]}
        error={typing ? undefined : error}
        onChange={(chosen) => {
          setTyping(chosen === OTHER);
          onChange(chosen === OTHER ? '' : chosen);
        }}
      />
      {typing ? (
        <TextField
          id="districtOther"
          label="Other district"
          required
          hint="2 to 60 characters, in Arabic or English"
          value={value}
          error={error}
          onChange={onChange}
        />
      ) : null}
    </>
  );
}
