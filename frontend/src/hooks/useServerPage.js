import { useCallback, useEffect, useState } from 'react';
import { usePortfolio } from './usePortfolio.js';

/**
 * One page of the portfolio as the Spring server cuts it (Part 2 brief, requirement 4), for the
 * Properties page when no search is active. It asks again whenever the page, the page size or the
 * portfolio changes, so an add, edit or delete shows at once.
 *
 * While the next page loads, the last one stays on screen rather than flashing a loading line.
 *
 * @param {number} page Counted from 1.
 * @param {number} perPage
 * @param {boolean} enabled False while a search is active: the list then pages in the browser.
 * @returns {{ result: Awaited<ReturnType<ReturnType<typeof usePortfolio>['loadPage']>> | null,
 *   error: string | null, retry: () => void }} `retry` asks the server for the page again, after
 *   an error.
 */
export function useServerPage(page, perPage, enabled) {
  const { properties, loadPage } = usePortfolio();
  const [state, setState] = useState({ result: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;

    loadPage(page, perPage)
      // Past the end, which a delete on the last page causes: show the last page instead, the way
      // `paginate` does in the browser.
      .then((result) =>
        result.page > result.pageCount
          ? loadPage(result.pageCount, perPage)
          : result,
      )
      .then((result) => {
        if (active) setState({ result, error: null });
      })
      .catch((error) => {
        if (active) setState({ result: null, error: error.message });
      });

    return () => {
      active = false;
    };
  }, [page, perPage, enabled, properties, loadPage, attempt]);

  return { ...state, retry };
}
