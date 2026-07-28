// components/common/Toast.jsx

"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Icon from "./Icon";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: "check_circle", color: "text-success", border: "border-success/30" },
  error: { icon: "error", color: "text-error", border: "border-error/30" },
  warning: { icon: "warning", color: "text-primary-container", border: "border-primary-container/30" },
  info: { icon: "info", color: "text-primary", border: "border-primary/30" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + Math.random());
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast stack - fixed bottom-right, above everything including mobile sidebar overlay */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[calc(100%-3rem)] max-w-sm flex-col gap-3">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          return (
            <div
              key={t.id}
              role="status"
              className={`glass-card animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border ${v.border} bg-surface-container p-4 shadow-2xl`}
            >
              <Icon name={v.icon} filled className={`mt-0.5 shrink-0 ${v.color}`} />
              <div className="flex-1">
                {t.title && (
                  <p className="font-body-md text-body-md font-bold text-on-surface">{t.title}</p>
                )}
                {t.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-on-surface-variant transition-colors hover:text-on-surface"
                aria-label="Dismiss notification"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}