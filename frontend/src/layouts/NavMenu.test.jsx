import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoutes } from '../test/render.jsx';
import NavMenu from './NavMenu.jsx';

// jsdom applies no CSS, so these tests check the toggle's state and wiring. Whether the list is
// hidden below 768 px is the stylesheet's job, checked by hand at 360 px (AC-23).
function renderMenu(url = '/') {
  return renderRoutes(
    [
      {
        path: '*',
        element: (
          <>
            <NavMenu />
            <a href="#after">After the menu</a>
          </>
        ),
      },
    ],
    { initialEntries: [url] },
  );
}

describe('NavMenu toggle (FR-NAV-08)', () => {
  it('starts closed, with a Menu button that controls the list of items', () => {
    renderMenu();

    const menu = screen.getByRole('navigation', { name: 'Main' });
    const toggle = within(menu).getByRole('button', { name: 'Menu' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute(
      'aria-controls',
      within(menu).getByRole('list').id,
    );
  });

  it('opens and closes when the button is pressed', async () => {
    const user = userEvent.setup();
    renderMenu();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('can be opened from the keyboard', async () => {
    const user = userEvent.setup();
    renderMenu();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    toggle.focus();
    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes once an item is chosen, on the chosen page', async () => {
    const user = userEvent.setup();
    const { router } = renderMenu();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'About' }));

    expect(router.state.location.pathname).toBe('/about');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('closes on Esc and puts focus back on the button (NFR-ACC-01)', async () => {
    const user = userEvent.setup();
    renderMenu();
    const toggle = screen.getByRole('button', { name: 'Menu' });

    await user.click(toggle);
    screen.getByRole('link', { name: 'Properties' }).focus();
    await user.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('leaves focus alone on Esc when the menu is already closed', async () => {
    const user = userEvent.setup();
    renderMenu();
    const link = screen.getByRole('link', { name: 'Dashboard' });

    link.focus();
    await user.keyboard('{Escape}');

    expect(link).toHaveFocus();
  });
});
