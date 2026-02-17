import React from "react";

const styles = {
  purple: "bg-violet-600 text-white border-violet-600",
  gray: "bg-white text-slate-700 border-slate-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  med: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200"
};

export default function Pill({ children, tone = "gray", onClick, active }) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition";
  const cls = styles[tone] || styles.gray;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${cls} ${active ? "ring-2 ring-violet-200" : "hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}
