import { useEffect, useState } from 'react';
import { usePortfolio } from './usePortfolio.js';

/**
 * One property as the Spring server has it (Part 2 brief, requirement 3), for the detail page.
 * It asks again whenever the ID or the portfolio changes, so an edit or a delete shows at once.
 * While it asks again, the last answer stays on screen.
 *
 * @param {string} id Such as `RP-0007`.
 * @returns {{ property: Record<string, unknown> | null, notFound: boolean,
 *   error: string | null }} All three empty means the first answer has not arrived yet.
 */
export function useServerProperty(id) {
  const { properties, loadProperty } = usePortfolio();
  const [state, setState] = useState({
    property: null,
    notFound: false,
    error: null,
  });

  useEffect(() => {
    let active = true;

    loadProperty(id)
      .then((property) => {
        if (active) setState({ property, notFound: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        // The name, not the class, so this hook never imports the service.
        if (error?.name === 'NotFoundError') {
          setState({ property: null, notFound: true, error: null });
        } else {
          setState({ property: null, notFound: false, error: error.message });
        }
      });

    return () => {
      active = false;
    };
  }, [id, properties, loadProperty]);

  return state;
}
