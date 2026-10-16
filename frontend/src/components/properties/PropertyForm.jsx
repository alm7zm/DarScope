import { useRef, useState } from 'react';
import Button from '../ui/Button.jsx';
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from '../ui/FormField.jsx';
import { TEXT } from '../../constants/messages.js';
import {
  AMENITIES,
  CITIES,
  DISTRICTS,
  FRONTS,
  PROPERTY_TYPES,
  STATUSES,
  emptyAmenities,
  maxDigits,
  numberChoices,
} from '../../constants/options.js';
import { validateProperty } from '../../utils/validation.js';
import DistrictField from './DistrictField.jsx';
import RentSuggestion from './RentSuggestion.jsx';
import styles from './PropertyForm.module.css';

/**
 * The one form that both adds and edits a property (SRS 5.1 and 5.2). It validates with
 * `utils/validation.js`, the same module the data service uses, so the messages beside the fields
 * are the messages that would have rejected the save (FR-ADD-03, FR-UPD-02).
 */

/**
 * The fields in the order they appear on screen. A failed save moves focus to the first invalid
 * one, which has to mean first on the page, not first in the error object (FR-ADD-03).
 */
const FIELD_ORDER = [
  'city',
  'district',
  'front',
  'propertyType',
  'sizeSqm',
  'propertyAgeYears',
  'bedrooms',
  'bathrooms',
  'livingRooms',
  'yearlyRentSar',
  'status',
  'tenantName',
  'leaseStart',
  'leaseEnd',
  'description',
];

/** A blank form: Type Villa, Status Vacant, no amenities ticked (FR-ADD-09). */
function blankValues() {
  return {
    city: '',
    district: '',
    front: '',
    propertyType: 'Villa',
    sizeSqm: '',
    propertyAgeYears: '',
    bedrooms: '',
    bathrooms: '',
    livingRooms: '',
    amenities: emptyAmenities(),
    yearlyRentSar: '',
    description: '',
    status: 'Vacant',
    tenantName: '',
    leaseStart: '',
    leaseEnd: '',
  };
}

/**
 * A stored property as form values. Numbers become text, because that is what an input holds and
 * what FR-ADD-03 has to be able to give back unchanged after a failed save.
 */
function valuesFrom(property) {
  const values = blankValues();
  for (const field of FIELD_ORDER) {
    const stored = property[field];
    values[field] =
      stored === null || stored === undefined ? '' : String(stored);
  }
  values.amenities = { ...emptyAmenities(), ...property.amenities };
  return values;
}

/**
 * @param {{
 *   property?: Record<string, unknown>,
 *   onSave: (values: Record<string, unknown>) => Promise<unknown>,
 *   onCancel: () => void,
 * }} props `property` is given when editing and left out when adding.
 */
export default function PropertyForm({ property, onSave, onCancel }) {
  const isEdit = Boolean(property);
  const [values, setValues] = useState(() =>
    property ? valuesFrom(property) : blankValues(),
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const formRef = useRef(null);

  const isOccupied = values.status === 'Occupied';
  // FR-UPD-07: warn as soon as the status leaves Occupied, before the save clears the details.
  const willClearTenancy =
    isEdit && property.status === 'Occupied' && !isOccupied;

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear this field's error as soon as it is touched; it is re-checked on the next save.
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  /**
   * Put the cursor in one field by id, if it is there and can take focus. A district typed
   * through "Other district…" has its own box, which is where its error shows (FR-ADD-03).
   */
  function focusField(field) {
    if (!field) return;
    const form = formRef.current;
    const target =
      (field === 'district' && form?.querySelector('#districtOther')) ||
      form?.querySelector(`#${field}`);
    target?.focus();
  }

  /** A district belongs to one city, so a new city keeps it only if the city has it too. */
  function setCity(city) {
    setField('city', city);
    if (values.district && !(DISTRICTS[city] ?? []).includes(values.district)) {
      setField('district', '');
    }
  }

  function setAmenity(key, checked) {
    setValues((current) => ({
      ...current,
      amenities: { ...current.amenities, [key]: checked },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError(null);

    const found = validateProperty(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Nothing is saved, every entered value stays, and focus goes to the first field on the
      // page that failed (FR-ADD-03).
      focusField(FIELD_ORDER.find((field) => field in found));
      return;
    }

    setSaving(true);
    try {
      await onSave(values);
    } catch (error) {
      // The service validates again, so this catches anything the form did not (NFR-REL-03).
      if (error?.errors) {
        setErrors(error.errors);
        focusField(FIELD_ORDER.find((field) => field in error.errors));
      } else {
        setSaveError(error?.message ?? 'The property could not be saved.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Location</legend>
        <div className={styles.fields}>
          <SelectField
            id="city"
            label="City"
            required
            value={values.city}
            options={CITIES}
            placeholder="Choose a city"
            error={errors.city}
            onChange={setCity}
          />
          <DistrictField
            city={values.city}
            value={values.district}
            error={errors.district}
            onChange={(value) => setField('district', value)}
          />
          <SelectField
            id="front"
            label="Front"
            value={values.front}
            options={FRONTS}
            placeholder="Not recorded"
            error={errors.front}
            onChange={(value) => setField('front', value)}
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Building</legend>
        <div className={styles.fields}>
          <SelectField
            id="propertyType"
            label="Type"
            required
            value={values.propertyType}
            options={PROPERTY_TYPES}
            error={errors.propertyType}
            onChange={(value) => setField('propertyType', value)}
          />
          <TextField
            id="sizeSqm"
            label="Size (m²)"
            required
            numeric
            maxDigits={maxDigits('sizeSqm')}
            hint="20 to 100,000"
            value={values.sizeSqm}
            error={errors.sizeSqm}
            onChange={(value) => setField('sizeSqm', value)}
          />
          {/* FR-ADD-15: whole numbers from a list, so none can be mistyped. */}
          <SelectField
            id="propertyAgeYears"
            label="Age (years)"
            required
            hint="0 means new"
            placeholder="Choose"
            options={numberChoices('propertyAgeYears')}
            value={values.propertyAgeYears}
            error={errors.propertyAgeYears}
            onChange={(value) => setField('propertyAgeYears', value)}
          />
          <SelectField
            id="bedrooms"
            label="Bedrooms"
            required
            placeholder="Choose"
            options={numberChoices('bedrooms')}
            value={values.bedrooms}
            error={errors.bedrooms}
            onChange={(value) => setField('bedrooms', value)}
          />
          <SelectField
            id="bathrooms"
            label="Bathrooms"
            required
            placeholder="Choose"
            options={numberChoices('bathrooms')}
            value={values.bathrooms}
            error={errors.bathrooms}
            onChange={(value) => setField('bathrooms', value)}
          />
          <SelectField
            id="livingRooms"
            label="Living rooms"
            required
            placeholder="Choose"
            options={numberChoices('livingRooms')}
            value={values.livingRooms}
            error={errors.livingRooms}
            onChange={(value) => setField('livingRooms', value)}
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Amenities</legend>
        <div className={styles.amenities}>
          {AMENITIES.map((amenity) => (
            <CheckboxField
              key={amenity.key}
              id={amenity.key}
              label={amenity.label}
              checked={values.amenities[amenity.key]}
              onChange={(checked) => setAmenity(amenity.key, checked)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Rent and tenancy</legend>
        <div className={styles.fields}>
          <TextField
            id="yearlyRentSar"
            label="Yearly rent (SAR)"
            required
            numeric
            maxDigits={maxDigits('yearlyRentSar')}
            hint="1,000 to 10,000,000"
            value={values.yearlyRentSar}
            error={errors.yearlyRentSar}
            onChange={(value) => setField('yearlyRentSar', value)}
          />
          {/* FR-ADD-13: the rent suggestion sits beside Yearly rent, on Add and Edit. */}
          <div className={styles.suggestion}>
            <RentSuggestion
              values={values}
              onUse={(rent) => setField('yearlyRentSar', String(rent))}
            />
          </div>
          <SelectField
            id="status"
            label="Status"
            required
            value={values.status}
            options={STATUSES}
            error={errors.status}
            onChange={(value) => setField('status', value)}
          />
          {/* FR-ADD-07: these three are usable only while the status is Occupied. */}
          <TextField
            id="tenantName"
            label="Tenant name"
            required={isOccupied}
            disabled={!isOccupied}
            hint={
              isOccupied
                ? '2 to 80 characters'
                : 'Available when the status is Occupied'
            }
            value={values.tenantName}
            error={errors.tenantName}
            onChange={(value) => setField('tenantName', value)}
          />
          <TextField
            id="leaseStart"
            label="Lease start"
            type="date"
            disabled={!isOccupied}
            value={values.leaseStart}
            error={errors.leaseStart}
            onChange={(value) => setField('leaseStart', value)}
          />
          <TextField
            id="leaseEnd"
            label="Lease end"
            type="date"
            disabled={!isOccupied}
            value={values.leaseEnd}
            error={errors.leaseEnd}
            onChange={(value) => setField('leaseEnd', value)}
          />
        </div>

        {willClearTenancy ? (
          <p className={styles.warning} role="status">
            {TEXT.statusLeavesOccupied}
          </p>
        ) : null}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Description</legend>
        <div className={styles.fields}>
          <TextAreaField
            id="description"
            label="Description"
            hint="Up to 2,000 characters, in Arabic or English"
            value={values.description}
            error={errors.description}
            onChange={(value) => setField('description', value)}
          />
        </div>
      </fieldset>

      {saveError ? (
        <p className={styles.saveError} role="alert">
          {saveError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {/* Cancel leaves without saving anything (FR-ADD-08, FR-UPD-06). */}
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
