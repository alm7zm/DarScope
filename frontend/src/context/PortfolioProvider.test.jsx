import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES, MESSAGE_TIMEOUT_MS } from '../constants/messages.js';
import { __resetForTests } from '../services/propertyService.js';
import { validValues } from '../test/fixtures.js';
import { usePortfolio } from '../hooks/usePortfolio.js';
import PortfolioProvider from './PortfolioProvider.jsx';

beforeEach(() => {
  __resetForTests();
});

/** A probe that shows the state and offers a button per action. */
function Probe() {
  const {
    properties,
    loading,
    message,
    addProperty,
    updateProperty,
    deleteProperty,
    resetDemoData,
    clearMessage,
  } = usePortfolio();

  return (
    <div>
      <p data-testid="count">{loading ? 'loading' : properties.length}</p>
      <p data-testid="message">{message ?? ''}</p>
      <button
        type="button"
        onClick={() => addProperty(validValues({ district: 'Al Rabwah' }))}
      >
        add
      </button>
      <button
        type="button"
        onClick={() =>
          updateProperty('RP-0001', validValues({ district: 'Changed' }))
        }
      >
        edit
      </button>
      <button type="button" onClick={() => deleteProperty('RP-0001')}>
        remove
      </button>
      <button type="button" onClick={() => resetDemoData()}>
        reset
      </button>
      <button type="button" onClick={clearMessage}>
        dismiss
      </button>
    </div>
  );
}

async function renderProbe() {
  const user = userEvent.setup();
  render(
    <PortfolioProvider>
      <Probe />
    </PortfolioProvider>,
  );
  await waitFor(() =>
    expect(screen.getByTestId('count')).not.toHaveTextContent('loading'),
  );
  return user;
}

describe('PortfolioProvider', () => {
  it('loads the portfolio when the app starts (FR-DAT-01)', async () => {
    await renderProbe();
    expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThan(0);
  });

  it('adds a property and confirms it (FR-ADD-06)', async () => {
    const user = await renderProbe();
    const before = Number(screen.getByTestId('count').textContent);

    await user.click(screen.getByRole('button', { name: 'add' }));

    await waitFor(() =>
      expect(Number(screen.getByTestId('count').textContent)).toBe(before + 1),
    );
    expect(screen.getByTestId('message')).toHaveTextContent(/added$/);
  });

  it('updates a property and confirms it (FR-UPD-05)', async () => {
    const user = await renderProbe();

    await user.click(screen.getByRole('button', { name: 'edit' }));

    await waitFor(() =>
      expect(screen.getByTestId('message')).toHaveTextContent(
        MESSAGES.updated('RP-0001'),
      ),
    );
  });

  it('deletes a property and confirms it (FR-DEL-03, FR-DEL-04)', async () => {
    const user = await renderProbe();
    const before = Number(screen.getByTestId('count').textContent);

    await user.click(screen.getByRole('button', { name: 'remove' }));

    await waitFor(() =>
      expect(Number(screen.getByTestId('count').textContent)).toBe(before - 1),
    );
    expect(screen.getByTestId('message')).toHaveTextContent(
      MESSAGES.deleted('RP-0001'),
    );
  });

  it('restores the seed on reset (FR-DAT-05)', async () => {
    const user = await renderProbe();
    const before = Number(screen.getByTestId('count').textContent);

    await user.click(screen.getByRole('button', { name: 'remove' }));
    await waitFor(() =>
      expect(Number(screen.getByTestId('count').textContent)).toBe(before - 1),
    );

    await user.click(screen.getByRole('button', { name: 'reset' }));
    await waitFor(() =>
      expect(Number(screen.getByTestId('count').textContent)).toBe(before),
    );
    expect(screen.getByTestId('message')).toHaveTextContent(
      'Demo data restored',
    );
  });

  it('lets the message be dismissed at once (FR-FBK-01)', async () => {
    const user = await renderProbe();

    await user.click(screen.getByRole('button', { name: 'remove' }));
    await waitFor(() =>
      expect(screen.getByTestId('message')).not.toBeEmptyDOMElement(),
    );

    await user.click(screen.getByRole('button', { name: 'dismiss' }));
    expect(screen.getByTestId('message')).toBeEmptyDOMElement();
  });
});

describe('PortfolioProvider: the message clears itself (FR-FBK-01)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('takes the message away after 5 seconds', async () => {
    // This test drives the clock itself, so it uses fireEvent rather than userEvent: userEvent
    // waits on timers of its own, which would deadlock against the fake clock.
    vi.useFakeTimers();

    render(
      <PortfolioProvider>
        <Probe />
      </PortfolioProvider>,
    );
    // The service resolves on a microtask, which an empty act flushes.
    await act(async () => {});
    expect(screen.getByTestId('count')).not.toHaveTextContent('loading');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    });
    expect(screen.getByTestId('message')).not.toBeEmptyDOMElement();

    // Still there just before the timeout, gone just after it.
    await act(async () => {
      vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS - 1);
    });
    expect(screen.getByTestId('message')).not.toBeEmptyDOMElement();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('message')).toBeEmptyDOMElement();
  });
});

describe('usePortfolio', () => {
  it('refuses to work outside the provider, rather than failing quietly', () => {
    // React logs the thrown error; silence it so the run stays readable.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/PortfolioProvider/);

    consoleError.mockRestore();
  });
});
