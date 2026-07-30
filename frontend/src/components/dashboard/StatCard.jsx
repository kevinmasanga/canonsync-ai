// components/dashboard/StatCard.jsx

import Icon from "@/components/common/Icon";

export default function StatCard({ icon, value, label, trend, urgent = false, filled = false }) {
  return (
    <div
      className={`glass-card flex flex-col gap-2 rounded-xl p-5 ${
        urgent ? "border-primary-container/40 bg-primary-container/5" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <Icon name={icon} filled={filled} className="text-primary-container" />
        {urgent ? (
          <span className="rounded bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary">
            URGENT
          </span>
        ) : (
          <span className="font-label-caps text-xs text-on-surface-variant">{trend}</span>
        )}
      </div>
      <div>
        <p
          className={`font-headline-md text-4xl font-bold ${
            urgent ? "text-primary-container" : "text-on-surface"
          }`}
        >
          {value}
        </p>
        <p className="mt-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
          {label}
        </p>
      </div>
    </div>
  );
}