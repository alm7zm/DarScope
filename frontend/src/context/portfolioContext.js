import { createContext } from 'react';

/**
 * The portfolio every page reads from. `PortfolioProvider` fills it and `usePortfolio` reads it;
 * nothing else should touch this object. It lives in its own file so that the provider file
 * exports a component and nothing else, which is what Vite needs for fast refresh.
 */
export const PortfolioContext = createContext(null);
