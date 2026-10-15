import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TeamGallery from './TeamGallery.jsx';

/** Two members with every detail, and one whose student ID nobody has filled in yet. */
const TEAM = [
  {
    name: 'Sara Al Qahtani',
    studentId: '222000001',
    bio: 'Builds the search and the filters.',
    photo: 'sara.jpg',
    email: 'sara@example.com',
    linkedin: 'https://www.linkedin.com/in/sara-example',
    github: 'https://github.com/sara-example',
  },
  {
    name: 'Faisal Al Harbi',
    studentId: '222000002',
    bio: 'Writes the forms and their checks.',
    photo: '',
    email: '',
    linkedin: '',
    github: '',
  },
  {
    name: 'Noura Al Saud',
    studentId: '',
    bio: '',
    photo: '',
    email: '',
    linkedin: '',
    github: '',
    pending: true,
  },
];

function renderGallery() {
  const user = userEvent.setup();
  render(<TeamGallery team={TEAM} />);
  return user;
}

/** A member's photo, which is the button that opens their details. */
function photo(name) {
  return screen.getByRole('button', { name });
}

describe('TeamGallery', () => {
  it('shows every member as a photo with the name and student ID beneath it (FR-ABT-02)', () => {
    renderGallery();

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    for (const name of [
      'Sara Al Qahtani',
      'Faisal Al Harbi',
      'Noura Al Saud',
    ]) {
      expect(photo(name)).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.getByRole('heading', { level: 3, name }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText('222000001')).toBeInTheDocument();
    expect(screen.getByText('222000002')).toBeInTheDocument();
    expect(screen.getByText('Student ID to add')).toBeInTheDocument();
  });

  it('keeps the bio and the links back until a photo is chosen', () => {
    renderGallery();

    expect(photo('Sara Al Qahtani')).toBeInTheDocument();
    expect(screen.queryByText('Builds the search and the filters.')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('opens the details of the member chosen, and only theirs', async () => {
    const user = renderGallery();

    await user.click(photo('Sara Al Qahtani'));

    expect(photo('Sara Al Qahtani')).toHaveAttribute('aria-expanded', 'true');
    expect(photo('Faisal Al Harbi')).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByText('Builds the search and the filters.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'GitHub profile of Sara Al Qahtani' }),
    ).toHaveAttribute('href', 'https://github.com/sara-example');
    expect(screen.queryByText('Writes the forms and their checks.')).toBeNull();
  });

  it('closes the details when the same photo is chosen again', async () => {
    const user = renderGallery();

    await user.click(photo('Sara Al Qahtani'));
    await user.click(photo('Sara Al Qahtani'));

    expect(photo('Sara Al Qahtani')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Builds the search and the filters.')).toBeNull();
  });

  it('moves the spotlight when another photo is chosen', async () => {
    const user = renderGallery();

    await user.click(photo('Sara Al Qahtani'));
    await user.click(photo('Faisal Al Harbi'));

    expect(photo('Sara Al Qahtani')).toHaveAttribute('aria-expanded', 'false');
    expect(photo('Faisal Al Harbi')).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('Writes the forms and their checks.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Builds the search and the filters.')).toBeNull();
  });

  it('opens and closes from the keyboard (NFR-ACC-01)', async () => {
    const user = renderGallery();

    await user.tab();
    expect(photo('Sara Al Qahtani')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(photo('Sara Al Qahtani')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(photo('Sara Al Qahtani')).toHaveAttribute('aria-expanded', 'false');
  });
});
