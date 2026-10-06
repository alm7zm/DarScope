import styles from './Placeholder.module.css';

/**
 * Temporary body of a page that is not built yet: it lists what the page will contain.
 * Delete this component when the last page stops using it.
 * @param {{ sections: string[] }} props
 */
export default function Placeholder({ sections }) {
  return (
    <div className={styles.box}>
      <p>This page is not built yet. It will contain:</p>
      <ul>
        {sections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ul>
    </div>
  );
}
