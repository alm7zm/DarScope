import { formatCount, formatRent } from '../../utils/format.js';
import styles from './CityTable.module.css';

/**
 * Properties, occupied properties and total yearly rent for each city that holds at least one
 * property (FR-DSH-05).
 *
 * @param {{ rows: Array<{ city: string, total: number, occupied: number, rent: number }> }} props
 */
export default function CityTable({ rows }) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="city-heading">
      <h2 className={styles.title} id="city-heading">
        By city
      </h2>
      <div className={styles.frame}>
        <table className={styles.table}>
          <caption className="visuallyHidden">
            Properties, occupied properties and yearly rent for each city
          </caption>
          <thead>
            <tr>
              <th scope="col">City</th>
              <th scope="col" className={styles.numberCell}>
                Properties
              </th>
              <th scope="col" className={styles.numberCell}>
                Occupied
              </th>
              <th scope="col" className={styles.numberCell}>
                Yearly rent
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.city}>
                <th scope="row">{row.city}</th>
                <td className={styles.numberCell}>{formatCount(row.total)}</td>
                <td className={styles.numberCell}>
                  {formatCount(row.occupied)}
                </td>
                <td className={styles.numberCell}>{formatRent(row.rent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
