/** Course details shown in the footer and on the About page (FR-ABT-03). */
export const COURSE = {
  code: 'SE411',
  term: 'Fall 2026-27',
  part: 'Project Part 1',
};

/** Where the code lives, linked from the About page (FR-ABT-04). */
export const REPOSITORY_URL = 'https://github.com/alm7zm/DarScope';

/**
 * Team members listed on the About page (FR-ABT-02, FR-ABT-06).
 *
 * `pending: true` marks a row nobody has filled in yet. The About page shows those rows as
 * clearly unfinished rather than printing an invented name, so an incomplete submission is
 * obvious on screen instead of being discovered by the marker.
 */
export const TEAM = [
  { name: 'Hussam Aldossary', studentId: '222110518' },
  { name: 'Team member 2', studentId: '', pending: true },
  { name: 'Team member 3', studentId: '', pending: true },
];

/**
 * The dataset both data files are built from (FR-ABT-05).
 * @see docs/SRS.md section 3.4
 */
export const DATASET = {
  name: 'Saudi Arabia Real Estate (AQAR)',
  source: 'Kaggle',
  year: '2021',
  url: 'https://www.kaggle.com/datasets/lama122/saudi-arabia-real-estate-aqar',
};

/** What the app is built with (FR-ABT-04), taken from SRS section 11.1. */
export const TECHNOLOGIES = [
  'React with JavaScript and JSDoc types',
  'Vite',
  'React Router',
  'React Context with a reducer',
  'CSS Modules with design tokens',
  'Vitest with React Testing Library',
  'ESLint and Prettier',
];

/** The AI tools that helped build the app (FR-ABT-05). The full record is docs/ai-usage.md. */
export const AI_TOOLS = ['Claude Code (Claude Opus 5 and 5.5)'];
