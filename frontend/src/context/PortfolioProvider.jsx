import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { MESSAGE_TIMEOUT_MS } from '../constants/messages.js';
import * as propertyService from '../services/propertyService.js';
import { PortfolioContext } from './portfolioContext.js';
import { initialPortfolioState, portfolioReducer } from './portfolioReducer.js';

/**
 * Holds the portfolio for the whole app and wraps the router in `App.jsx`. Its actions are the
 * only callers of `propertyService`, and state always holds what the service returned, so a page
 * never sees a value the service has not accepted.
 */
export default function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);

  // Load the portfolio once, when the app starts (FR-DAT-01).
  useEffect(() => {
    let active = true;
    dispatch({ type: 'load/start' });

    propertyService
      .list()
      .then((properties) => {
        if (active) dispatch({ type: 'load/success', properties });
      })
      .catch((error) => {
        if (active) dispatch({ type: 'load/failure', error: error.message });
      });

    return () => {
      active = false;
    };
  }, []);

  // A confirmation message clears itself, and the timer starts again whenever a new one arrives
  // (FR-FBK-01). The Message component also lets the user dismiss it sooner.
  useEffect(() => {
    if (state.message === null) return undefined;
    const timer = setTimeout(
      () => dispatch({ type: 'message/clear' }),
      MESSAGE_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [state.message]);

  const addProperty = useCallback(async (values) => {
    const property = await propertyService.create(values);
    dispatch({ type: 'property/added', property });
    return property;
  }, []);

  const updateProperty = useCallback(async (id, values) => {
    const property = await propertyService.update(id, values);
    dispatch({ type: 'property/updated', property });
    return property;
  }, []);

  const deleteProperty = useCallback(async (id) => {
    const removed = await propertyService.remove(id);
    dispatch({ type: 'property/removed', id });
    return removed;
  }, []);

  // One page as the server cuts it (Part 2 brief, requirement 4). It is not kept in state: the
  // Properties page asks for the page it shows, through `useServerPage`.
  const loadPage = useCallback(
    (page, perPage) => propertyService.listPage(page, perPage),
    [],
  );

  // One property as the server has it (Part 2 brief, requirement 3), for the detail page,
  // through `useServerProperty`. Not kept in state either.
  const loadProperty = useCallback((id) => propertyService.getById(id), []);

  const clearMessage = useCallback(() => {
    dispatch({ type: 'message/clear' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addProperty,
      updateProperty,
      deleteProperty,
      loadPage,
      loadProperty,
      clearMessage,
    }),
    [
      state,
      addProperty,
      updateProperty,
      deleteProperty,
      loadPage,
      loadProperty,
      clearMessage,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
