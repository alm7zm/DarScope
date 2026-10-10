import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Dialog from './Dialog.jsx';

function renderDialog(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const result = render(
    <Dialog
      open
      title="Delete property?"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    >
      <p>RP-0001, Villa in Al Malqa, Riyadh</p>
    </Dialog>,
  );
  return { ...result, onConfirm, onCancel };
}

describe('Dialog (FR-DEL-02, NFR-ACC-06)', () => {
  it('shows its title and what it is about', () => {
    renderDialog();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Delete property?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('RP-0001, Villa in Al Malqa, Riyadh'),
    ).toBeInTheDocument();
  });

  it('names the dialog for assistive technology', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete property?');
  });

  it('gives Cancel focus first, so Enter never deletes by accident', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('offers Cancel and the named confirm action', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls back when the confirm action is chosen', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls back when Cancel is chosen', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancels on Esc (FR-DEL-02)', async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('is not shown while closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
