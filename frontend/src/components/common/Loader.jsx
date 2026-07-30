// components/common/Loader.jsx
// Small inline spinner — for buttons, cards, or partial-page loading.
// For the full-page "AI is working" experience, use ProcessingState instead.

export default function Loader({ size = 20, className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-outline-variant border-t-primary ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}