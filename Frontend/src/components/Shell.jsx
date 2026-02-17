import React from "react";

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Full width layout */}
      <div className="mx-auto w-full max-w-[1440px] px-6 py-10">
        {/* Big gradient container */}
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-violet-100 via-white to-amber-100 shadow-soft">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
