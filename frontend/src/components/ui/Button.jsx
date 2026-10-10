import styles from './Button.module.css';

/**
 * A button in one of the three action styles (UI-05): `primary` for the main action,
 * `secondary` for the alternative, `danger` for Delete.
 *
 * Any `className` passed in is kept alongside the variant class rather than replacing it, so a
 * caller can nudge layout without silently losing the button's own styling.
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
      className={[styles.button, styles[variant], styles[size], className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
