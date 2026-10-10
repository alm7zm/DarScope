import Page from '../components/ui/Page.jsx';
import {
  AI_TOOLS,
  COURSE,
  DATASET,
  REPOSITORY_URL,
  TEAM,
  TECHNOLOGIES,
} from '../constants/team.js';
import styles from './AboutPage.module.css';

/** Identifies the team and the course (SRS 8.1). */
export default function AboutPage() {
  const missing = TEAM.filter((member) => member.pending).length;

  return (
    <Page
      title="About"
      description="Darscope keeps one company's rental villas and duplexes in Riyadh, Jeddah, Dammam and Al Khobar in one place."
    >
      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="team-heading">
          <h2 className={styles.panelTitle} id="team-heading">
            Team
          </h2>

          <ul className={styles.team}>
            {TEAM.map((member) => (
              <li key={member.name} className={styles.member}>
                <span className={styles.memberName}>{member.name}</span>
                {member.pending ? (
                  /* Never invent a name or a number: an unfilled row says so plainly, so an
                     incomplete submission is obvious on screen. */
                  <span className={styles.pending}>Student ID to add</span>
                ) : (
                  <span className={styles.studentId} translate="no">
                    {member.studentId}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {missing > 0 ? (
            <p className={styles.warning} role="status">
              {missing} of {TEAM.length} team members still need a name and a
              student ID. Add them in{' '}
              <code className={styles.code}>src/constants/team.js</code>.
            </p>
          ) : null}
        </section>

        <section className={styles.panel} aria-labelledby="course-heading">
          <h2 className={styles.panelTitle} id="course-heading">
            Course
          </h2>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Course</dt>
              <dd className={styles.factValue}>{COURSE.code}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Term</dt>
              <dd className={styles.factValue}>{COURSE.term}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Submission</dt>
              <dd className={styles.factValue}>{COURSE.part}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel} aria-labelledby="built-heading">
          <h2 className={styles.panelTitle} id="built-heading">
            How it is built
          </h2>
          <ul className={styles.tags}>
            {TECHNOLOGIES.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
          <p className={styles.note}>
            The code is on{' '}
            <a href={REPOSITORY_URL} rel="noreferrer noopener" target="_blank">
              GitHub
            </a>
            . Part 1 runs entirely in the browser: there is no server and no
            database, so changes are kept only until the page reloads.
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="credits-heading">
          <h2 className={styles.panelTitle} id="credits-heading">
            Credits
          </h2>
          <p className={styles.note}>
            Sample data comes from{' '}
            <a href={DATASET.url} rel="noreferrer noopener" target="_blank">
              {DATASET.name}
            </a>
            , published on {DATASET.source} in {DATASET.year}. The properties
            shown are a cleaned sample of it; tenant names are invented.
          </p>
          <p className={styles.note}>
            Built with the help of {AI_TOOLS.join(', ')}. Which tool produced
            each part is recorded in{' '}
            <code className={styles.code}>docs/ai-usage.md</code>.
          </p>
        </section>
      </div>
    </Page>
  );
}
