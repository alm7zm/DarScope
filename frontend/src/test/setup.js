import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without global test functions here, so React Testing Library cannot register its
// own cleanup. Unmount after every test so that tests never see each other's output.
afterEach(cleanup);

// jsdom implements the <dialog> element but not its modal behaviour: showModal, close, the
// backdrop, the focus trap, and the `cancel` event that Esc raises. The app uses the real element
// because a browser gives it focus trapping and Esc for nothing (NFR-ACC-06), so rather than hand
// the app a worse dialog, this gives jsdom just enough of the standard to test the behaviour.
// The focus trap itself cannot be tested here and stays a manual check (AC-16).
if (
  typeof HTMLDialogElement !== 'undefined' &&
  typeof HTMLDialogElement.prototype.showModal !== 'function'
) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };

  HTMLDialogElement.prototype.show = function show() {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(returnValue) {
    if (!this.open) return;
    this.open = false;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event('close'));
  };

  // In a browser, Esc inside an open modal raises `cancel` on the dialog.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dialog = event.target?.closest?.('dialog[open]');
    dialog?.dispatchEvent(new Event('cancel', { cancelable: true }));
  });
}
