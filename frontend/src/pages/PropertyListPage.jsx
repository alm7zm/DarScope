import { useState } from 'react';
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog.jsx';
import PropertyTable from '../components/properties/PropertyTable.jsx';
import SearchControls from '../components/search/SearchControls.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { EmptyState, LoadError } from '../components/ui/PageStates.jsx';
import Pager from '../components/ui/Pager.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { usePropertySearch } from '../hooks/usePropertySearch.js';
import { useServerPage } from '../hooks/useServerPage.js';
import { PATHS } from '../routes/paths.js';
import { paginate, sortProperties } from '../utils/sort.js';
import styles from './PropertyListPage.module.css';

/**
 * Find and browse properties (SRS 4.3 and 6), a page at a time (FR-LST-10).
 *
 * With nothing searched, each page comes from the Spring server (Part 2 brief, requirement 4).
 * The search and filters work in the browser on the whole portfolio, Arabic matching included,
 * so while one is active the browser cuts the matches into pages itself. Both orders are newest
 * first (FR-SRC-09).
 */
export default function PropertyListPage() {
  const { properties, loading, loadError } = usePortfolio();
  const search = usePropertySearch(properties);
  const server = useServerPage(search.page, search.perPage, !search.active);
  /** The property awaiting a confirmed delete, or null (FR-DEL-02). */
  const [pendingDelete, setPendingDelete] = useState(null);

  if (loading) {
    return (
      <Page title="Properties">
        <p>Loading properties…</p>
      </Page>
    );
  }

  if (loadError || server.error) {
    return (
      <Page title="Properties">
        <LoadError reason={loadError ?? server.error} />
      </Page>
    );
  }

  const { matching } = search;
  const shown = search.active
    ? {
        ...paginate(sortProperties(matching), {
          page: search.page,
          perPage: search.perPage,
        }),
        total: matching.length,
      }
    : server.result;

  return (
    // No "Add property" action in the header: FR-NAV-01 already puts one in the menu, and a
    // second copy a few centimetres away is clutter rather than convenience. The empty state
    // still offers one, where it is the only thing to do (FR-LST-05).
    <Page
      title="Properties"
      description="Every rental house in the portfolio. Search and filter to narrow the list."
    >
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
      ) : shown === null ? (
        <p>Loading properties…</p>
      ) : (
        <>
          <PropertyTable properties={shown.items} onDelete={setPendingDelete} />
          <Pager
            page={shown.page}
            pageCount={shown.pageCount}
            from={shown.from}
            to={shown.to}
            total={shown.total}
            perPage={search.perPage}
            onPageChange={search.setPage}
            onPerPageChange={search.setPerPage}
          />
        </>
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
    <EmptyState
      message={searching ? TEXT.noSearchMatches : TEXT.emptyPortfolio}
    >
      {searching ? (
        <Button variant="primary" onClick={onClearAll}>
          Clear all
        </Button>
      ) : (
        <ButtonLink variant="primary" to={PATHS.addProperty}>
          Add property
        </ButtonLink>
      )}
    </EmptyState>
  );
}
