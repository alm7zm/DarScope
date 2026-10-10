/**
 * How the portfolio state changes. A pure function with no React in it, so every transition can be
 * tested on its own (NFR-MNT-01). The provider owns the side effects; this owns the rules.
 */
import { MESSAGES, TEXT } from '../constants/messages.js';

/** @typedef {{ properties: Array<Record<string, unknown>>, loading: boolean, loadError: string | null, message: string | null }} PortfolioState */

/** @type {PortfolioState} */
export const initialPortfolioState = {
  properties: [],
  loading: true,
  loadError: null,
  message: null,
};

/**
 * @param {PortfolioState} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {PortfolioState} A new state object; the one passed in is never changed (NFR-REL-04).
 */
export function portfolioReducer(state, action) {
  switch (action.type) {
    case 'load/start':
      return { ...state, loading: true, loadError: null };

    case 'load/success':
      return {
        ...state,
        loading: false,
        loadError: null,
        properties: action.properties,
      };

    case 'load/failure':
      return { ...state, loading: false, loadError: action.error };

    case 'property/added':
      return {
        ...state,
        properties: [...state.properties, action.property],
        message: MESSAGES.added(action.property.id),
      };

    case 'property/updated':
      return {
        ...state,
        properties: state.properties.map((property) =>
          property.id === action.property.id ? action.property : property,
        ),
        message: MESSAGES.updated(action.property.id),
      };

    case 'property/removed':
      return {
        ...state,
        properties: state.properties.filter(
          (property) => property.id !== action.id,
        ),
        message: MESSAGES.deleted(action.id),
      };

    case 'portfolio/reset':
      return {
        ...state,
        properties: action.properties,
        message: TEXT.demoDataReset,
      };

    case 'message/clear':
      return { ...state, message: null };

    default:
      return state;
  }
}
