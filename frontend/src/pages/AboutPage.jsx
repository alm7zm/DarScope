import { ViewTransition } from 'react';
import PersonCard from '../components/about/PersonCard.jsx';
import TeamGallery from '../components/about/TeamGallery.jsx';
import Page from '../components/ui/Page.jsx';
import {
  AI_TOOLS,
  COURSE,
  DATASET,
  INSTRUCTOR,
  REPOSITORY_URL,
  TEAM,
  TECHNOLOGIES,
} from '../constants/team.js';
import styles from './AboutPage.module.css';

/**
 * Identifies the team and the course (SRS 8.1). The panels after the team each sit in a
 * ViewTransition, so they glide out of the way when a team photo opens instead of jumping.
 */
export default function AboutPage() {
  return (
    <Page
      title="About"
      description="Darscope keeps one company's rental villas and duplexes in Riyadh, Jeddah, Dammam and Al Khobar in one place."
    >
      <div className={styles.panels}>
        <section
          className={`${styles.panel} ${styles.wide}`}
          aria-labelledby="team-heading"
        >
          <h2 className={styles.panelTitle} id="team-heading">
            Team
          </h2>

          <TeamGallery team={TEAM} />
        </section>

        <ViewTransition>
          <section
            className={styles.panel}
            aria-labelledby="instructor-heading"
          >
            <h2 className={styles.panelTitle} id="instructor-heading">
              Instructor
            </h2>
            <PersonCard
              person={INSTRUCTOR}
              detail={INSTRUCTOR.role}
              pendingLabel="Name to add"
            />
          </section>
        </ViewTransition>

        <ViewTransition>
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
        </ViewTransition>

        <ViewTransition>
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
              <a
                href={REPOSITORY_URL}
                rel="noreferrer noopener"
                target="_blank"
              >
                GitHub
              </a>
              . Part 1 runs entirely in the browser: there is no server and no
              database, so changes are kept only until the page reloads.
            </p>
          </section>
        </ViewTransition>

        <ViewTransition>
          <section className={styles.panel} aria-labelledby="credits-heading">
            <h2 className={styles.panelTitle} id="credits-heading">
              Credits
            </h2>
            <p className={styles.note}>
              The rent suggestion is learned from{' '}
              <a href={DATASET.url} rel="noreferrer noopener" target="_blank">
                {DATASET.name}
              </a>
              , published on {DATASET.source} in {DATASET.year}. The sample
              properties and their tenants are invented.
            </p>
            <p className={styles.note}>
              Built with the help of {AI_TOOLS.join(', ')}. Which tool produced
              each part is recorded in{' '}
              <code className={styles.code}>docs/ai-usage.md</code>.
            </p>
          </section>
        </ViewTransition>
      </div>
    </Page>
  );
}
