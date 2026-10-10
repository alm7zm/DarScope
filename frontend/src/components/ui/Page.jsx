import styles from './Page.module.css';

/**
 * The frame of every page: sets the browser tab title and renders the page's one main heading
 * (UI-02, FR-NAV-09).
 * @param {{ title: string, children?: import('react').ReactNode }} props
 */
export default function Page({ title, children }) {
  return (
    <>
      <title>{`${title} · Darscope`}</title>
      {/* A page title can carry property data, such as an Arabic district, so the browser
          decides its direction (FR-LST-07). */}
      <h1 className={styles.title} dir="auto">
        {title}
      </h1>
      {children}
    </>
  );
}
