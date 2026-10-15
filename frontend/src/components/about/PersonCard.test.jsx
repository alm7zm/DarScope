import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PersonCard from './PersonCard.jsx';

/** A person with every optional detail filled in. */
function makePerson(overrides = {}) {
  return {
    name: 'Sara Al Qahtani',
    bio: 'Builds the search and the filters.',
    photo: 'sara.jpg',
    email: 'sara@example.com',
    linkedin: 'https://www.linkedin.com/in/sara-example',
    github: 'https://github.com/sara-example',
    ...overrides,
  };
}

describe('PersonCard', () => {
  it('shows the name, the detail line and the paragraph', () => {
    render(<PersonCard person={makePerson()} detail="222000001" />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Sara Al Qahtani' }),
    ).toBeInTheDocument();
    expect(screen.getByText('222000001')).toBeInTheDocument();
    expect(
      screen.getByText('Builds the search and the filters.'),
    ).toBeInTheDocument();
  });

  it('shows the photo from the team folder', () => {
    const { container } = render(<PersonCard person={makePerson()} />);

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/team/sara.jpg',
    );
  });

  it('shows initials when there is no photo', () => {
    const { container } = render(
      <PersonCard person={makePerson({ photo: '' })} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('SQ')).toBeInTheDocument();
  });

  it('links the email, LinkedIn and GitHub, each naming the person', () => {
    render(<PersonCard person={makePerson()} />);

    expect(
      screen.getByRole('link', { name: 'sara@example.com' }),
    ).toHaveAttribute('href', 'mailto:sara@example.com');
    expect(
      screen.getByRole('link', { name: 'LinkedIn profile of Sara Al Qahtani' }),
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/sara-example');
    expect(
      screen.getByRole('link', { name: 'GitHub profile of Sara Al Qahtani' }),
    ).toHaveAttribute('href', 'https://github.com/sara-example');
  });

  it('leaves out whatever is empty, rather than showing a dead link', () => {
    render(
      <PersonCard
        person={{ name: 'Sara Al Qahtani', bio: '', email: '', github: '' }}
      />,
    );

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('marks an unfilled person as unfinished instead of showing a detail', () => {
    render(
      <PersonCard
        person={makePerson({ name: 'Team member 2', pending: true })}
        detail="should not show"
        pendingLabel="Student ID to add"
      />,
    );

    expect(screen.getByText('Student ID to add')).toBeInTheDocument();
    expect(screen.queryByText('should not show')).toBeNull();
  });
});
