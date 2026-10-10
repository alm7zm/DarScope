import { Link, generatePath } from 'react-router';
import Badge from '../ui/Badge.jsx';
import { PATHS } from '../../routes/paths.js';
import { formatCount, formatRent, formatSize } from '../../utils/format.js';
import { textDirection } from '../../utils/arabic.js';
import styles from './PropertyTable.module.css';

/** The columns of the list, in the order SRS 4.3 gives them (FR-LST-02). */
const COLUMNS = [
  'ID',
  'City',
  'District',
  'Type',
  'Size',
  'Bedrooms',
  'Yearly rent',
  'Status',
  'Actions',
];

/**
 * The portfolio as a table, one row per property (FR-LST-02). Every row links to the property and
 * to its edit form (FR-LST-03). The frame around the table scrolls sideways on its own, so the
 * page never does, down to 360 px (NFR-USE-02).
 *
 * @param {{ properties: Array<Record<string, unknown>> }} props
 */
export default function PropertyTable({ properties }) {
  return (
    <div className={styles.frame}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Properties in the portfolio
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** @param {{ property: Record<string, unknown> }} props */
function PropertyRow({ property }) {
  const detailPath = generatePath(PATHS.propertyDetail, { id: property.id });
  const editPath = generatePath(PATHS.editProperty, { id: property.id });

  return (
    <tr>
      <th scope="row" className={styles.idCell}>
        {property.id}
      </th>
      <td>{property.city}</td>
      {/* District may be Arabic, so it reads right-to-left inside the English table
          (FR-LST-07, NFR-ACC-07). */}
      <td {...textDirection(property.district)}>{property.district}</td>
      <td>{property.propertyType}</td>
      <td className={styles.numberCell}>{formatSize(property.sizeSqm)}</td>
      <td className={styles.numberCell}>{formatCount(property.bedrooms)}</td>
      <td className={styles.numberCell}>
        {formatRent(property.yearlyRentSar)}
      </td>
      <td>
        <Badge status={property.status} />
      </td>
      <td>
        <div className={styles.actions}>
          {/* Each action names its property, so the links are told apart out of context
              (NFR-ACC-01). The visible text stays short. */}
          <Link
            to={detailPath}
            className={styles.action}
            aria-label={`View ${property.id}`}
          >
            View
          </Link>
          <Link
            to={editPath}
            className={styles.action}
            aria-label={`Edit ${property.id}`}
          >
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}
