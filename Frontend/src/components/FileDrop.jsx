import React, { useRef } from "react";
import { FileUp } from "lucide-react";

export default function FileDrop({ files, setFiles }) {
  const inputRef = useRef(null);

  // adjust as needed (kept broad, safe defaults)
  const ACCEPT =
    ".pdf,.doc,.docx,.txt,.md,.rtf,.csv,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

  return (
    <div
      className={`group flex min-h-[12rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
        files?.length
          ? "border-violet-200 bg-violet-50/30"
          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
      }`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <FileUp
        className={`mb-2 h-8 w-8 transition-colors ${
          files?.length ? "text-violet-500" : "text-slate-300 group-hover:text-slate-400"
        }`}
      />

      <p className="text-xs font-medium text-slate-600">
        {files?.length
          ? `${files.length} document(s) selected`
          : "Drop documents here or click to browse"}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        PDF, DOC/DOCX, TXT, MD, CSV, JSON
      </p>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPT}
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />

      {files?.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {files.map((f) => (
            <span
              key={f.name}
              className="max-w-[260px] truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
              title={f.name}
            >
              {f.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
