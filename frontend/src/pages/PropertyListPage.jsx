import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import DeletePropertyDialog from '../components/properties/DeletePropertyDialog.jsx';
import PropertyTable from '../components/properties/PropertyTable.jsx';
import FilterChips from '../components/search/FilterChips.jsx';
import SearchControls from '../components/search/SearchControls.jsx';
import Button, { ButtonLink } from '../components/ui/Button.jsx';
import Page from '../components/ui/Page.jsx';
import { SelectField } from '../components/ui/FormField.jsx';
import {
  EmptyState,
  LoadError,
  Loading,
} from '../components/ui/PageStates.jsx';
import Pager from '../components/ui/Pager.jsx';
import { TEXT } from '../constants/messages.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import { usePropertySearch } from '../hooks/usePropertySearch.js';
import { useServerPage } from '../hooks/useServerPage.js';
import { PATHS } from '../routes/paths.js';
import { readSearchState, writeSearchState } from '../utils/searchParams.js';
import {
  DIRECTIONS,
  SORT_OPTIONS,
  paginate,
  sortProperties,
} from '../utils/sort.js';
import styles from './PropertyListPage.module.css';

/**
 * Find and browse properties (SRS 4.3 and 6), a page at a time (FR-LST-10).
 *
 * With nothing searched, each page comes from the Spring server (Part 2 brief, requirement 4).
 * The search and filters work in the browser on the whole portfolio, Arabic matching included,
 * so while one is active the browser cuts the matches into pages itself. Both orders are newest
 * first (FR-SRC-09), unless the user picks another order, which the browser then applies.
 *
 * The search, filters, order and page live in the URL (FR-SRC-12), so a refresh keeps them and a
 * narrowed list can be bookmarked or sent to a colleague. The URL is read once, when the page
 * opens, and written whenever the state changes, with `replace` so typing never fills the history.
 */
export default function PropertyListPage() {
  const { properties, loading, loadError, reload } = usePortfolio();
  const [params, setParams] = useSearchParams();
  const [initial] = useState(() => readSearchState(params));
  const search = usePropertySearch(properties, initial);
  const server = useServerPage(
    search.page,
    search.perPage,
    !search.browserPaged,
  );

  const { query, filters, sort, page, perPage } = search;
  useEffect(() => {
    const next = writeSearchState({ query, filters, sort, page, perPage });
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [query, filters, sort, page, perPage, params, setParams]);
  /** The property awaiting a confirmed delete, or null (FR-DEL-02). */
  const [pendingDelete, setPendingDelete] = useState(null);

  if (loading) {
    return (
      <Page title="Properties">
        <Loading message="Loading properties…" />
      </Page>
    );
  }

  if (loadError || server.error) {
    return (
      <Page title="Properties">
        <LoadError
          reason={loadError ?? server.error}
          onRetry={loadError ? reload : server.retry}
        />
      </Page>
    );
  }

  const { matching } = search;
  const shown = search.browserPaged
    ? {
        ...paginate(sortProperties(matching, search.sort), {
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
      <FilterChips
        filters={search.filters}
        onRemove={(chip) =>
          chip.value === null
            ? search.setFilter(chip.name, '')
            : search.toggleFilter(chip.name, chip.value)
        }
      />

      <div className={styles.listBar}>
        <p className={styles.count} role="status">
          Showing {matching.length} of {properties.length} properties
        </p>
        <div className={styles.sort}>
          <SelectField
            id="sort-key"
            label="Sort by"
            value={search.sort.key}
            options={SORT_OPTIONS.map(({ key, label }) => ({
              value: key,
              label,
            }))}
            onChange={(key) => search.setSort({ key })}
          />
          <SelectField
            id="sort-direction"
            label="Order"
            value={search.sort.direction}
            options={DIRECTIONS.map(({ key, label }) => ({
              value: key,
              label,
            }))}
            onChange={(direction) => search.setSort({ direction })}
          />
        </div>
      </div>

      {matching.length === 0 ? (
        <NothingToShow searching={search.active} onClearAll={search.clearAll} />
      ) : shown === null ? (
        <Loading message="Loading properties…" />
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
