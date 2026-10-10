import { useState } from 'react';
import { Link } from 'react-router';
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog.jsx';
import PropertyTable from '../components/properties/PropertyTable.jsx';
import SearchControls from '../components/search/SearchControls.jsx';
import Button from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { usePropertySearch } from '../hooks/usePropertySearch.js';
import { PATHS } from '../routes/paths.js';
import styles from './PropertyListPage.module.css';

/** Find and browse properties (SRS 4.3 and 6). */
export default function PropertyListPage() {
  const { properties, loading, loadError } = usePortfolio();
  const search = usePropertySearch(properties);
  /** The property awaiting a confirmed delete, or null (FR-DEL-02). */
  const [pendingDelete, setPendingDelete] = useState(null);

  if (loading) {
    return (
      <Page title="Properties">
        <p>Loading properties…</p>
      </Page>
    );
  }

  if (loadError) {
    return (
      <Page title="Properties">
        <p className={styles.error} role="alert">
          The portfolio could not be loaded. {loadError}
        </p>
      </Page>
    );
  }

  const { matching } = search;

  return (
    <Page title="Properties">
      <SearchControls
        text={search.text}
        onTextChange={search.setText}
        onSubmit={search.commitSearch}
        filters={search.filters}
        onFilterChange={search.setFilter}
        onFilterToggle={search.toggleFilter}
        onClearAll={search.clearAll}
        rangeErrors={search.rangeErrors}
      />

      {/* FR-LST-04. Y stays the whole portfolio while X falls as the search narrows, which is
          what AC-09 expects. */}
      <p className={styles.count} role="status">
        Showing {matching.length} of {properties.length} properties
      </p>

      {matching.length === 0 ? (
        <NothingToShow searching={search.active} onClearAll={search.clearAll} />
      ) : (
        <PropertyTable properties={matching} onDelete={setPendingDelete} />
      )}

      {/* ponytail: after a confirmed delete the row that opened the dialog is gone, so the
          browser drops focus to the body. Acceptable while the list is short; move focus to
          the count if a keyboard pass finds it annoying. */}
      <DeletePropertyDialog
        property={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onDeleted={() => setPendingDelete(null)}
      />
    </Page>
  );
}

/**
 * The two empty states of FR-LST-05, which read differently and offer different ways out: an
 * empty portfolio needs a first property, a search with no matches needs clearing.
 * @param {{ searching: boolean, onClearAll: () => void }} props
 */
function NothingToShow({ searching, onClearAll }) {
  return (
    <div className={styles.empty}>
      <p>{searching ? TEXT.noSearchMatches : TEXT.emptyPortfolio}</p>
      {searching ? (
        <Button variant="primary" onClick={onClearAll}>
          Clear all
        </Button>
      ) : (
        <Link to={PATHS.addProperty} className={styles.emptyAction}>
          Add property
        </Link>
      )}
    </div>
  );
}
