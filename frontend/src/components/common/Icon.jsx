// components/common/Icon.jsx

export default function Icon({ name, filled = false, className = "", size }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? `${size}px` : undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}