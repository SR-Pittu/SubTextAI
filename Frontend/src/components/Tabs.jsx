import React from "react";

export default function Tabs({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
