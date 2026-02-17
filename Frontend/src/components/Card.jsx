import React from "react";

export default function Card({
  id,
  title,
  subtitle,
  icon,
  right,
  children,
  className = ""
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white/75 backdrop-blur shadow-soft ${className}`}
    >
      {(title || subtitle || icon || right) && (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700">
                {icon}
              </div>
            ) : null}

            <div>
              {title ? <div className="font-semibold text-slate-900">{title}</div> : null}
              {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
            </div>
          </div>

          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      )}

      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
