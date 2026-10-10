import styles from './Page.module.css';

/**
 * The frame of every page: sets the browser tab title and renders the page's one main heading
 * (UI-02, FR-NAV-09), with an optional line of explanation and a row of page-level actions.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   actions?: import('react').ReactNode,
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function Page({ title, description, actions, children }) {
  return (
    <>
      <title>{`${title} · Darscope`}</title>
      <header className={styles.header}>
        <div className={styles.heading}>
          {/* A page title can carry property data, such as an Arabic district, so the browser
              decides its direction (FR-LST-07). */}
          <h1 className={styles.title} dir="auto">
            {title}
          </h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      {children}
    </>
  );
}
