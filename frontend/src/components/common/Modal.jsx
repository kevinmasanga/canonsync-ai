// components/common/Modal.jsx

"use client";

import { useEffect } from "react";
import Icon from "./Icon";

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="glass-card animate-fade-in relative w-full max-w-md rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}