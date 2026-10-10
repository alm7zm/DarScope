import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  COURSE,
  DATASET,
  REPOSITORY_URL,
  TEAM,
  TECHNOLOGIES,
} from '../constants/team.js';
import { renderRoutes } from '../test/render.jsx';
import { routes } from '../routes/routes.jsx';

function renderAbout() {
  return renderRoutes(routes, { initialEntries: ['/about'] });
}

/** The panel under a given section heading. */
function panel(name) {
  return within(
    screen.getByRole('heading', { level: 2, name }).closest('section'),
  );
}

describe('AboutPage: the team (FR-ABT-02)', () => {
  it('names the page and sets the tab title', () => {
    renderAbout();

    expect(
      screen.getByRole('heading', { level: 1, name: 'About' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('About · Darscope');
  });

  it('lists every team member', () => {
    renderAbout();

    const members = panel('Team').getAllByRole('listitem');
    expect(members).toHaveLength(TEAM.length);

    for (const member of TEAM) {
      expect(panel('Team').getByText(member.name)).toBeInTheDocument();
    }
  });

  it('shows the student ID of every member who has one', () => {
    renderAbout();

    for (const member of TEAM.filter((each) => !each.pending)) {
      expect(panel('Team').getByText(member.studentId)).toBeInTheDocument();
    }
  });

  it('marks a member with no details as unfinished, rather than inventing one', () => {
    renderAbout();

    const pending = TEAM.filter((member) => member.pending);
    expect(panel('Team').getAllByText('Student ID to add')).toHaveLength(
      pending.length,
    );
  });

  it('says how many members are still missing, so nobody submits without noticing', () => {
    renderAbout();

    const pending = TEAM.filter((member) => member.pending).length;
    expect(
      panel('Team').getByText(
        new RegExp(`${pending} of ${TEAM.length} team members`),
      ),
    ).toBeInTheDocument();
  });
});

describe('AboutPage: the course (FR-ABT-03)', () => {
  it('shows the course code, the term and the submission', () => {
    renderAbout();

    expect(panel('Course').getByText(COURSE.code)).toBeInTheDocument();
    expect(panel('Course').getByText(COURSE.term)).toBeInTheDocument();
    expect(panel('Course').getByText(COURSE.part)).toBeInTheDocument();
  });

  it('AC-15 shows all three together with the names', () => {
    renderAbout();

    const main = within(screen.getByRole('main'));
    expect(main.getByText('SE411')).toBeInTheDocument();
    expect(main.getByText('Fall 2026-27')).toBeInTheDocument();
    expect(main.getByText('Project Part 1')).toBeInTheDocument();
    expect(main.getByText(TEAM[0].name)).toBeInTheDocument();
  });
});

describe('AboutPage: how it is built (FR-ABT-04)', () => {
  it('describes the app in a sentence', () => {
    renderAbout();
    expect(
      screen.getByText(/rental villas and duplexes in Riyadh/),
    ).toBeInTheDocument();
  });

  it('lists the technologies', () => {
    renderAbout();

    for (const technology of TECHNOLOGIES) {
      expect(
        panel('How it is built').getByText(technology),
      ).toBeInTheDocument();
    }
  });

  it('links to the repository', () => {
    renderAbout();

    expect(
      panel('How it is built').getByRole('link', { name: 'GitHub' }),
    ).toHaveAttribute('href', REPOSITORY_URL);
  });
});

describe('AboutPage: credits (FR-ABT-05)', () => {
  it('credits the dataset by name, source and year', () => {
    renderAbout();

    const credits = panel('Credits');
    expect(credits.getByRole('link', { name: DATASET.name })).toHaveAttribute(
      'href',
      DATASET.url,
    );
    expect(
      credits.getByText(new RegExp(`${DATASET.source} in ${DATASET.year}`)),
    ).toBeInTheDocument();
  });

  it('says the tenant names are invented, since they are', () => {
    renderAbout();
    expect(
      panel('Credits').getByText(/tenant names are invented/),
    ).toBeInTheDocument();
  });

  it('names the AI tools used to build the app', () => {
    renderAbout();
    expect(panel('Credits').getByText(/Claude Code/)).toBeInTheDocument();
  });
});
