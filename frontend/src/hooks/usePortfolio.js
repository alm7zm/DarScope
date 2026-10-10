import { useContext } from 'react';
import { PortfolioContext } from '../context/portfolioContext.js';

/**
 * The portfolio, and the actions that change it. The only way a component reads or writes
 * properties: the actions are the sole callers of `propertyService`, so Part 2 can swap the
 * service for HTTP without touching a page.
 *
 * @returns {import('../context/portfolioReducer.js').PortfolioState & {
 *   addProperty: (values: Record<string, unknown>) => Promise<Record<string, unknown>>,
 *   updateProperty: (id: string, values: Record<string, unknown>) => Promise<Record<string, unknown>>,
 *   deleteProperty: (id: string) => Promise<Record<string, unknown>>,
 *   resetDemoData: () => Promise<Array<Record<string, unknown>>>,
 *   clearMessage: () => void,
 * }}
 */
export function usePortfolio() {
  const value = useContext(PortfolioContext);
  if (value === null) {
    throw new Error('usePortfolio must be used inside a PortfolioProvider.');
  }
  return value;
}
