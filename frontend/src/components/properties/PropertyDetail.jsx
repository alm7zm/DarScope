import Badge from '../ui/Badge.jsx';
import { AMENITIES } from '../../constants/options.js';
import { textDirection } from '../../utils/arabic.js';
import {
  formatAge,
  formatCount,
  formatDate,
  formatDateTime,
  formatRent,
  formatSize,
} from '../../utils/format.js';
import styles from './PropertyDetail.module.css';

/**
 * Every field of one property, in the six groups SRS 4.4 names: Location, Building, Amenities,
 * Rent and tenancy, Description, Record (FR-DET-01). Tenant and lease rows appear only for an
 * occupied property (FR-DET-04).
 *
 * @param {{ property: Record<string, unknown> }} props
 */
export default function PropertyDetail({ property }) {
  const isOccupied = property.status === 'Occupied';
  const owned = AMENITIES.filter(
    (amenity) => property.amenities?.[amenity.key],
  );

  return (
    <div className={styles.groups}>
      <Group title="Location">
        <FieldList>
          <Field label="City" value={property.city} />
          <Field label="District" value={property.district} text />
          <Field label="Front" value={property.front || 'Not recorded'} />
        </FieldList>
      </Group>

      <Group title="Building">
        <FieldList>
          <Field label="Type" value={property.propertyType} />
          <Field label="Size" value={formatSize(property.sizeSqm)} />
          <Field label="Age" value={formatAge(property.propertyAgeYears)} />
          <Field label="Bedrooms" value={formatCount(property.bedrooms)} />
          <Field label="Bathrooms" value={formatCount(property.bathrooms)} />
          <Field
            label="Living rooms"
            value={formatCount(property.livingRooms)}
          />
        </FieldList>
      </Group>

      <Group title="Amenities">
        {owned.length === 0 ? (
          <p className={styles.none}>No amenities recorded.</p>
        ) : (
          <ul className={styles.amenities}>
            {owned.map((amenity) => (
              <li key={amenity.key}>{amenity.label}</li>
            ))}
          </ul>
        )}
      </Group>

      <Group title="Rent and tenancy">
        <FieldList>
          <Field
            label="Yearly rent"
            value={formatRent(property.yearlyRentSar)}
          />
          <Field label="Status" value={<Badge status={property.status} />} />
          {/* FR-DET-04: a vacant property has no tenant, so these rows are not shown at all. */}
          {isOccupied ? (
            <>
              <Field label="Tenant" value={property.tenantName} text />
              <Field
                label="Lease start"
                value={formatDate(property.leaseStart)}
              />
              <Field label="Lease end" value={formatDate(property.leaseEnd)} />
            </>
          ) : null}
        </FieldList>
      </Group>

      <Group title="Description">
        {property.description ? (
          <p
            className={styles.description}
            {...textDirection(property.description)}
          >
            {property.description}
          </p>
        ) : (
          <p className={styles.none}>No description recorded.</p>
        )}
      </Group>

      <Group title="Record">
        <FieldList>
          <Field label="ID" value={property.id} />
          <Field label="Created" value={formatDateTime(property.createdAt)} />
          <Field
            label="Last updated"
            value={formatDateTime(property.updatedAt)}
          />
        </FieldList>
      </Group>
    </div>
  );
}

/**
 * One titled group. The heading level is 2, below the page's single h1 (NFR-ACC-04).
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
function Group({ title, children }) {
  return (
    <section className={styles.group}>
      <h2 className={styles.groupTitle}>{title}</h2>
      {children}
    </section>
  );
}

/**
 * A description list of label-and-value pairs. It holds `Field`s only: a `<dl>` may contain just
 * `<dt>`, `<dd>` and `<div>`, so the amenity list and the description sit outside one.
 * @param {{ children: import('react').ReactNode }} props
 */
function FieldList({ children }) {
  return <dl className={styles.list}>{children}</dl>;
}

/**
 * One label and its value. `text` marks a value that may be Arabic, such as a district, a tenant
 * name or a description (FR-LST-07, NFR-ACC-07).
 * @param {{ label: string, value: import('react').ReactNode, text?: boolean }} props
 */
function Field({ label, value, text = false }) {
  return (
    <div className={styles.field}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value} {...(text ? textDirection(value) : {})}>
        {value}
      </dd>
    </div>
  );
}
