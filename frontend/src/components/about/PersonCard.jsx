import styles from './PersonCard.module.css';

/** The first letter of the first and last word of a name, shown when there is no photo. */
function initials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words.at(-1)[0] : '';
  return (first + last).toUpperCase();
}

/**
 * A person's photo from `frontend/public/team/`, or their initials when there is none.
 *
 * @param {{
 *   person: { name: string, photo?: string, pending?: boolean },
 *   className?: string,
 * }} props `className` sets the size and the shape.
 */
export function PersonPhoto({ person, className = '' }) {
  const { name, photo, pending } = person;
  const classes = `${styles.photo} ${className}`;

  return photo ? (
    // The name is always beside the picture or on the button around it, so repeating it as alt
    // text would only make a screen reader say it twice.
    <img
      className={classes}
      src={`${import.meta.env.BASE_URL}team/${photo}`}
      alt=""
      width="72"
      height="72"
    />
  ) : (
    <span className={classes} aria-hidden="true">
      {pending ? '?' : initials(name)}
    </span>
  );
}

/**
 * The person's name, and one line of detail under it such as the student ID.
 *
 * @param {{
 *   person: { name: string, pending?: boolean },
 *   detail?: import('react').ReactNode,
 *   pendingLabel?: string,
 * }} props `pendingLabel` replaces `detail` on a row nobody has filled in yet.
 */
export function PersonSummary({ person, detail, pendingLabel }) {
  return (
    <>
      <h3 className={styles.name} dir="auto">
        {person.name}
      </h3>
      {person.pending ? (
        /* Never invent a name or a number: an unfilled row says so plainly, so an incomplete
           submission is obvious on screen. */
        <span className={styles.pending}>{pendingLabel}</span>
      ) : detail ? (
        <span className={styles.detail}>{detail}</span>
      ) : null}
    </>
  );
}

/**
 * The person's short paragraph and the ways to reach them. Whatever `constants/team.js` leaves
 * empty is left out, so a person with neither shows nothing here.
 *
 * @param {{
 *   person: { name: string, bio?: string, email?: string, linkedin?: string, github?: string },
 * }} props
 */
export function PersonMore({ person }) {
  const { name, bio, email, linkedin, github } = person;
  const hasContact = Boolean(email || linkedin || github);

  return (
    <>
      {bio ? (
        <p className={styles.bio} dir="auto">
          {bio}
        </p>
      ) : null}

      {hasContact ? (
        <p className={styles.contact}>
          {email ? (
            <a href={`mailto:${email}`} translate="no">
              {email}
            </a>
          ) : null}
          {/* Each link names its person, so three "GitHub" links are told apart out of
              context (NFR-ACC-01). */}
          {linkedin ? (
            <a
              href={linkedin}
              rel="noreferrer noopener"
              target="_blank"
              aria-label={`LinkedIn profile of ${name}`}
            >
              LinkedIn
            </a>
          ) : null}
          {github ? (
            <a
              href={github}
              rel="noreferrer noopener"
              target="_blank"
              aria-label={`GitHub profile of ${name}`}
            >
              GitHub
            </a>
          ) : null}
        </p>
      ) : null}
    </>
  );
}

/**
 * One person on a card, such as the instructor on the About page: a small round photo, the name,
 * a line of detail, a short paragraph and the ways to reach them. Everything but the name is
 * optional and is simply left out when `constants/team.js` has no value for it.
 *
 * @param {{
 *   person: {
 *     name: string, bio?: string, photo?: string, email?: string, linkedin?: string,
 *     github?: string, pending?: boolean,
 *   },
 *   detail?: import('react').ReactNode,
 *   pendingLabel?: string,
 * }} props `pendingLabel` replaces `detail` on a row nobody has filled in yet.
 */
export default function PersonCard({ person, detail, pendingLabel }) {
  return (
    <div className={styles.card}>
      <PersonPhoto person={person} className={styles.avatar} />

      <div className={styles.body}>
        <PersonSummary
          person={person}
          detail={detail}
          pendingLabel={pendingLabel}
        />
        <PersonMore person={person} />
      </div>
    </div>
  );
}
