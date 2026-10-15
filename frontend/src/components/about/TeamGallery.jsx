import { startTransition, useState, ViewTransition } from 'react';
import { PersonMore, PersonPhoto, PersonSummary } from './PersonCard.jsx';
import styles from './TeamGallery.module.css';

/**
 * The team on the About page (FR-ABT-02): one photo per member in equal columns, with the name
 * and student ID beneath each. Choosing a photo puts that member in the spotlight with their
 * paragraph and links, and turns the others grey; choosing it again goes back.
 *
 * The change is a morph: each `ViewTransition` lets the browser glide its photo or caption from
 * the old place and size to the new one. A browser without View Transitions shows the new state
 * at once.
 *
 * @param {{
 *   team: Array<{
 *     name: string, studentId: string, bio?: string, photo?: string, email?: string,
 *     linkedin?: string, github?: string, pending?: boolean,
 *   }>,
 * }} props
 */
export default function TeamGallery({ team }) {
  const [openIndex, setOpenIndex] = useState(
    /** @type {number | null} */ (null),
  );

  function toggle(index) {
    // React only runs a view transition for an update made inside a transition.
    startTransition(() => {
      setOpenIndex((current) => (current === index ? null : index));
    });
  }

  return (
    <ul
      className={`${styles.gallery} ${openIndex === null ? '' : styles.spotlight}`}
    >
      {team.map((member, index) => {
        const open = index === openIndex;
        const dimmed = openIndex !== null && !open;

        return (
          <li
            key={member.name}
            className={`${styles.member} ${open ? styles.open : ''} ${dimmed ? styles.dimmed : ''}`}
          >
            <ViewTransition>
              <button
                type="button"
                className={styles.photoButton}
                aria-expanded={open}
                aria-label={member.name}
                onClick={() => toggle(index)}
              >
                <PersonPhoto person={member} className={styles.photo} />
              </button>
            </ViewTransition>

            {/* The caption changes width, so it moves at its own size: stretched, it would show
                twice at two sizes while it fades (the morph-text rule in styles/global.css). */}
            <ViewTransition update="morph-text">
              <div className={styles.text}>
                <PersonSummary
                  person={member}
                  // An identifier, which machine translation should leave alone.
                  detail={<span translate="no">{member.studentId}</span>}
                  pendingLabel="Student ID to add"
                />
                {open ? <PersonMore person={member} /> : null}
              </div>
            </ViewTransition>
          </li>
        );
      })}
    </ul>
  );
}
