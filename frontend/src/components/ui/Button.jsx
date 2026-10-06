import styles from './Button.module.css';

/**
 * A button in one of the three action styles (UI-05): `primary` for the main action,
 * `secondary` for the alternative, `danger` for Delete.
 * @param {{ variant?: 'primary' | 'secondary' | 'danger' } & import('react').ComponentProps<'button'>} props
 */
export default function Button({
  variant = 'secondary',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      {...rest}
      className={`${styles.button} ${styles[variant]}`}
    />
  );
}
