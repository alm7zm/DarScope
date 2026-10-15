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
 *
 * Everything after `studentId` is optional, and the page leaves out whatever is empty:
 * - `bio`: a short paragraph about the person.
 * - `photo`: the file name of a photo in `frontend/src/assets/team/`, such as `Sara.jpg`. Any
 *   size or shape will do: the build crops it to a square around the face and shrinks it. Only
 *   the file name counts, in any letter case. With none, the page shows the person's initials.
 * - `email`: an address, with no `mailto:`.
 * - `linkedin`, `github`: the full profile URL, starting with `https://`.
 *
 * This repository is public, so anything written here is published, and so is every photo in
 * `src/assets/team/` together with any location the camera stored in it.
 */
export const TEAM = [
  {
    name: 'Hussam Aldossary',
    studentId: '222110518',
    bio: 'A Software Engineering student at Prince Sultan University, passionate about building intelligent systems and pursuing a career in Agentic AI. Through personal projects, coursework, and national programming competitions, I have developed a strong interest in software engineering and machine learning. I aim to specialize in Agentic AI by graduation in 2027, building systems that can reason, make decisions, and act autonomously.',
    photo: 'Hussam Aldossary.jpeg',
    email: 'h.s.m.d.23@gmail.com',
    linkedin: 'https://www.linkedin.com/in/hussam-aldossary',
    github: 'https://github.com/alm7zm',
  },
  {
    name: 'Muhammad Yawar',
    studentId: '',
    bio: '',
    photo: '',
    email: '',
    linkedin: '',
    github: '',
    pending: true,
  },
  {
    name: 'Omar Alrajhi',
    studentId: '',
    bio: '',
    photo: '',
    email: '',
    linkedin: '',
    github: '',
    pending: true,
  },
];

/**
 * The course instructor, shown on the About page with the same optional details as a team
 * member. Remove `pending` once the name is filled in.
 */
export const INSTRUCTOR = {
  name: 'Dr. Skander Turki',
  role: `${COURSE.code} instructor`,
  bio: 'Software Engineer, PhD in model-based systems engineering Assistant Professor and Model-driven Engineering Consultant',
  photo: 'Dr. Skander Turki.jpg',
  email: 'skanderturki@gmail.com',
  linkedin: 'https://www.linkedin.com/in/skander-turki-96992218',
  github: 'https://github.com/skanderturki/',
};

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
