import { Link } from 'react-router';
import styles from './Button.module.css';

/**
 * The classes for one of the three action styles (UI-05): `primary` for the main action,
 * `secondary` for the alternative, `danger` for Delete.
 *
 * Any `className` passed in is kept alongside the variant class rather than replacing it, so a
 * caller can nudge layout without silently losing the button's own styling.
 */
function buttonClasses(variant, size, className) {
  return [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
}

/**
 * A button in one of the three action styles.
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   size?: 'medium' | 'small',
 * } & import('react').ComponentProps<'button'>} props
 */
export default function Button({
  variant = 'secondary',
  size = 'medium',
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      {...rest}
      className={buttonClasses(variant, size, className)}
    />
  );
}

/**
 * A link that looks like a button, for an action that opens a page, such as Edit or Add property.
 * It stays a link, so it can open in a new tab and a screen reader announces it as one.
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   size?: 'medium' | 'small',
 * } & import('react-router').LinkProps} props
 */
export function ButtonLink({
  variant = 'secondary',
  size = 'medium',
  className = '',
  ...rest
}) {
  return <Link {...rest} className={buttonClasses(variant, size, className)} />;
}
