import { Link, generatePath } from 'react-router';
import Badge from '../ui/Badge.jsx';
import { PATHS } from '../../routes/paths.js';
import { textDirection } from '../../utils/arabic.js';
import { displayTitle, formatRent } from '../../utils/format.js';
import styles from './NeedsAttentionList.module.css';

/**
 * Every property that is earning nothing right now, each linking to its detail page
 * (FR-DSH-06). Under maintenance comes first: it cannot be let at all until the work is done.
 *
 * @param {{ properties: Array<Record<string, unknown>> }} props
 */
export default function NeedsAttentionList({ properties }) {
  return (
    <section aria-labelledby="attention-heading">
      <h2 className={styles.title} id="attention-heading">
        Needs attention
      </h2>

      {properties.length === 0 ? (
        <p className={styles.allLet}>
          Every property is occupied. Nothing needs attention.
        </p>
      ) : (
        <ul className={styles.list}>
          {properties.map((property) => (
            <li key={property.id}>
              <Link
                to={generatePath(PATHS.propertyDetail, { id: property.id })}
                className={styles.row}
              >
                <span className={styles.name}>
                  <span className={styles.id} translate="no">
                    {property.id}
                  </span>
                  {/* The district may be Arabic, so the browser decides its direction
                      (FR-LST-07). */}
                  <span {...textDirection(property.district)}>
                    {displayTitle(property)}
                  </span>
                </span>
                <span className={styles.meta}>
                  <Badge status={property.status} />
                  <span className={styles.rent}>
                    {formatRent(property.yearlyRentSar)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
