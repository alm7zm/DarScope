import { describe, expect, it } from 'vitest';
import { initialPortfolioState, portfolioReducer } from './portfolioReducer.js';

describe('initialPortfolioState', () => {
  it('starts empty and loading, with nothing to report', () => {
    expect(initialPortfolioState).toEqual({
      properties: [],
      loading: true,
      loadError: null,
      message: null,
    });
  });
});

describe('portfolioReducer', () => {
  const state = {
    properties: [{ id: 'RP-0001', city: 'Riyadh' }],
    loading: false,
    loadError: null,
    message: null,
  };

  it('replaces the collection when the load finishes', () => {
    const next = portfolioReducer(
      { ...state, loading: true },
      { type: 'load/success', properties: [{ id: 'RP-0002' }] },
    );
    expect(next.loading).toBe(false);
    expect(next.properties).toEqual([{ id: 'RP-0002' }]);
  });

  it('keeps the failure message when the load fails', () => {
    const next = portfolioReducer(state, {
      type: 'load/failure',
      error: 'no data',
    });
    expect(next.loadError).toBe('no data');
    expect(next.loading).toBe(false);
  });

  it('adds a property and names it in the message (FR-ADD-05)', () => {
    const next = portfolioReducer(state, {
      type: 'property/added',
      property: { id: 'RP-0009' },
    });
    expect(next.properties.map((p) => p.id)).toEqual(['RP-0001', 'RP-0009']);
    expect(next.message).toBe('Property RP-0009 added');
  });

  it('replaces the changed property only (FR-UPD-04)', () => {
    const next = portfolioReducer(state, {
      type: 'property/updated',
      property: { id: 'RP-0001', city: 'Jeddah' },
    });
    expect(next.properties).toEqual([{ id: 'RP-0001', city: 'Jeddah' }]);
    expect(next.message).toBe('Property RP-0001 updated');
  });

  it('takes the property out and names it in the message (FR-DEL-04)', () => {
    const next = portfolioReducer(state, {
      type: 'property/removed',
      id: 'RP-0001',
    });
    expect(next.properties).toEqual([]);
    expect(next.message).toBe('Property RP-0001 deleted');
  });

  it('clears the message', () => {
    const next = portfolioReducer(
      { ...state, message: 'Property RP-0001 deleted' },
      { type: 'message/clear' },
    );
    expect(next.message).toBeNull();
  });

  it('never changes the state it was given (NFR-REL-04)', () => {
    const before = structuredClone(state);
    portfolioReducer(state, {
      type: 'property/added',
      property: { id: 'RP-0009' },
    });
    expect(state).toEqual(before);
  });

  it('ignores an action it does not know', () => {
    expect(portfolioReducer(state, { type: 'nonsense' })).toBe(state);
  });
});
