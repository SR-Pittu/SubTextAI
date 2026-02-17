import React from "react";
import Pill from "./Pill.jsx";
import {
  HelpCircle,
  AlertTriangle,
  Sparkles,
  Box,
  FileCheck,
  Terminal
} from "lucide-react";

function iconFor(type) {
  if (type === "clarifying") return <HelpCircle className="h-4 w-4" />;
  if (type === "edge") return <AlertTriangle className="h-4 w-4" />;
  if (type === "architectural") return <Box className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

function labelFor(type) {
  if (type === "clarifying") return "Clarify";
  if (type === "edge") return "Edge Case";
  if (type === "architectural") return "Tech Risk";
  if (type === "ambiguity") return "Ambiguity";
  return "Finding";
}

function severityTone(sev) {
  if (sev === "LOW") return "low";
  if (sev === "MEDIUM") return "med";
  if (sev === "HIGH") return "high";
  return "gray";
}

function severityClasses(sev) {
  const tone = severityTone(sev);
  if (tone === "high") return "bg-rose-50 text-rose-700 border-rose-200";
  if (tone === "med") return "bg-amber-50 text-amber-800 border-amber-200";
  if (tone === "low") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

/**
 * Maps the list-based findings into cards
 */
export function buildFindingCards(result) {
  const cards = [];

  (result?.architectural_risks || []).forEach((x) => {
    cards.push({
      type: "architectural",
      title: x,
      body: "Validate system assumptions (state, scale, consistency) and add guardrails before build.",
      severity: "HIGH",
      tag: "infra"
    });
  });

  (result?.clarifying_questions || []).forEach((q) => {
    cards.push({
      type: "clarifying",
      title: q,
      body: "Confirm expected behavior early to prevent scope drift and mid-sprint blockers.",
      severity: "MEDIUM",
      tag: "scope"
    });
  });

  (result?.missing_edge_cases || []).forEach((x) => {
    cards.push({
      type: "edge",
      title: x,
      body: "Define behavior for this state and add a test to lock it in.",
      severity: "MEDIUM",
      tag: "logic"
    });
  });

  (result?.ambiguous_phrases || []).forEach((x) => {
    cards.push({
      type: "ambiguity",
      title: x,
      body: "Rewrite as measurable criteria so it’s testable and unambiguous.",
      severity: "LOW",
      tag: "wording"
    });
  });

  return cards;
}

export default function Findings({
  filter,
  setFilter,
  cards,
  result,
  layout = "mini-grid"
}) {
  const counts = {
    all: cards.length,

    // Severity buckets
    critical: cards.filter((c) => c.severity === "HIGH").length,
    medium: cards.filter((c) => c.severity === "MEDIUM").length,
    low: cards.filter((c) => c.severity === "LOW").length,

    // Type buckets
    architectural: cards.filter((c) => c.type === "architectural").length,
    edge: cards.filter((c) => c.type === "edge").length,
    ambiguity: cards.filter((c) => c.type === "ambiguity").length,
    clarifying: cards.filter((c) => c.type === "clarifying").length
  };

  const filtered =
    filter === "all"
      ? cards
      : filter === "critical"
      ? cards.filter((c) => c.severity === "HIGH")
      : filter === "medium"
      ? cards.filter((c) => c.severity === "MEDIUM")
      : filter === "low"
      ? cards.filter((c) => c.severity === "LOW")
      : cards.filter((c) => c.type === filter);

  return (
    <div className="space-y-6">
      {/* SECTION 1: Improved Acceptance Criteria */}
      {result?.improved_acceptance_criteria && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <FileCheck className="h-4 w-4" />
            Optimized Acceptance Criteria
          </div>
          <div className="p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {result.improved_acceptance_criteria}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: Technical Notes */}
      {result?.technical_notes && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Terminal className="h-4 w-4 text-emerald-400" />
            Architect&apos;s Implementation Notes
          </div>
          <div className="p-4 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
            {result.technical_notes}
          </div>
        </div>
      )}

      <hr className="border-slate-100" />

      {/* SECTION 3: Filters & Cards */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Pill
            tone="purple"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All <span className="ml-1 opacity-60">{counts.all}</span>
          </Pill>

          <Pill active={filter === "critical"} onClick={() => setFilter("critical")}>
            Critical <span className="ml-1 opacity-60">{counts.critical}</span>
          </Pill>

          <Pill active={filter === "medium"} onClick={() => setFilter("medium")}>
            Medium <span className="ml-1 opacity-60">{counts.medium}</span>
          </Pill>

          <Pill active={filter === "low"} onClick={() => setFilter("low")}>
            Low <span className="ml-1 opacity-60">{counts.low}</span>
          </Pill>

          <Pill
            active={filter === "architectural"}
            onClick={() => setFilter("architectural")}
          >
            Tech Risks <span className="ml-1 opacity-60">{counts.architectural}</span>
          </Pill>

          <Pill active={filter === "edge"} onClick={() => setFilter("edge")}>
            Edge Case <span className="ml-1 opacity-60">{counts.edge}</span>
          </Pill>

          <Pill active={filter === "ambiguity"} onClick={() => setFilter("ambiguity")}>
            Ambiguity <span className="ml-1 opacity-60">{counts.ambiguity}</span>
          </Pill>

          <Pill active={filter === "clarifying"} onClick={() => setFilter("clarifying")}>
            Clarify <span className="ml-1 opacity-60">{counts.clarifying}</span>
          </Pill>
        </div>

        {filtered.length ? (
          <div
            className={
              layout === "mini-grid"
                ? "grid grid-cols-1 gap-3 md:grid-cols-2"
                : "space-y-3"
            }
          >
            {filtered.map((c, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-violet-300"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      {iconFor(c.type)} {labelFor(c.type)}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${severityClasses(
                        c.severity
                      )}`}
                    >
                      {c.severity}
                    </span>

                    {c.tag && (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                        {c.tag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-900 group-hover:text-violet-700">
                  {c.title}
                </div>
                <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {c.body}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-100 py-10 text-center text-sm text-slate-400">
            No items matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
