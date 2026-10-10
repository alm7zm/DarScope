import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Message from './Message.jsx';

describe('Message (FR-FBK-01, FR-FBK-02)', () => {
  it('shows the message text', () => {
    render(<Message text="Property RP-0009 added" onDismiss={() => {}} />);
    expect(screen.getByText('Property RP-0009 added')).toBeInTheDocument();
  });

  it('puts the message in a polite live region, so it is announced', () => {
    const { container } = render(
      <Message text="Property RP-0009 added" onDismiss={() => {}} />,
    );

    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('Property RP-0009 added');
  });

  it('keeps the live region on the page when there is no message, so the next one is announced', () => {
    const { container } = render(<Message text={null} onDismiss={() => {}} />);

    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    expect(
      container.querySelector('[aria-live="polite"]'),
    ).toBeEmptyDOMElement();
  });

  it('can be dismissed before its timer runs out', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Message text="Property RP-0009 added" onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: 'Dismiss message' }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('offers no dismiss button when there is nothing to dismiss', () => {
    render(<Message text={null} onDismiss={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
