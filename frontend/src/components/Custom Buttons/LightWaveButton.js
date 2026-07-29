import styles from './LightWaveButton.module.css';

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Pure-CSS light wave button, sliding glass fill + diagonal sheen, no JS needed.
// Layer stack: ::before (sliding fill) → ::after (static sheen) → .content

const LightWaveButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    className = '',
    ...rest
}) => (
    <button
        type={type}
        className={`${styles.button} ${className}`}
        disabled={disabled}
        onClick={onClick}
        {...rest}
    >
        <span className={styles.content}>{children}</span>
    </button>
);

export default LightWaveButton;
