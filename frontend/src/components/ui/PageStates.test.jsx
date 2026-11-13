import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState, LoadError, Loading } from './PageStates.jsx';

describe('Loading', () => {
  it('announces what is loading as a status, politely', () => {
    render(<Loading message="Loading properties…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading properties…');
  });
});

describe('LoadError', () => {
  it('says the portfolio could not be loaded, with the reason, as an alert', () => {
    render(<LoadError reason="The Darscope server could not be reached." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The portfolio could not be loaded. The Darscope server could not be reached.',
    );
  });

  it('offers no Try again button when nothing can be retried', () => {
    render(<LoadError reason="Nope." />);

    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
  });

  it('asks again when Try again is pressed', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<LoadError reason="Nope." onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('shows its message and the action that goes with it', () => {
    render(
      <EmptyState message="Nothing here yet.">
        <button type="button">Add</button>
      </EmptyState>,
    );

    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
