// components/common/Button.jsx

const VARIANTS = {
  primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90",
  secondary: "border border-outline-variant text-on-surface hover:bg-surface-variant/30",
  ghost: "text-on-surface-variant hover:text-on-surface",
};

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "…" : children}
    </button>
  );
}