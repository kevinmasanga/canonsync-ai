// components/common/Input.jsx

export default function Input({ label, error, className = "", id, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="ml-1 block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-etched w-full rounded-lg px-4 py-3 font-body-md text-on-surface placeholder-on-tertiary-fixed-variant ${className}`}
        {...props}
      />
      {error && <p className="ml-1 text-[12px] text-error">{error}</p>}
    </div>
  );
}