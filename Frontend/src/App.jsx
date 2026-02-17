import React, { useMemo, useState } from "react";
import Shell from "./components/Shell.jsx";
import Card from "./components/Card.jsx";
import Tabs from "./components/Tabs.jsx";
import Pill from "./components/Pill.jsx";
import FileDrop from "./components/FileDrop.jsx";
import Findings, { buildFindingCards } from "./components/Findings.jsx";
import { analyzeRequirements } from "./api";
import {
  Sparkles,
  FileText,
  ArrowRight,
  Download,
  ChevronRight,
  CheckCircle2,
  Search,
  Zap,
  FileUp
} from "lucide-react";
import { toMarkdown, toJiraChecklist, downloadText } from "./exporters";

const headerSubtext = {
  detect: "Upload user stories, acceptance criteria, and supporting documents.",
  stories: "Start by pasting user stories and acceptance criteria.",
  docs: "Add documents (PRD, Jira, Confluence export, specs) to catch gaps and missing states."
};

export default function App() {
  const [topTab, setTopTab] = useState("detect");
  const [bottomTab, setBottomTab] = useState("how");
  const [filter, setFilter] = useState("all");

  const [userStory, setUserStory] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [documents, setDocuments] = useState([]); // <-- renamed

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const cards = useMemo(() => buildFindingCards(result || {}), [result]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const canAnalyze =
    userStory.trim().length > 0 ||
    acceptanceCriteria.trim().length > 0 ||
    documents.length > 0;

  async function runAnalysis() {
    setErr("");
    setLoading(true);
    try {
      // ✅ backend now expects documents instead of screenshots
      const data = await analyzeRequirements({
        userStory,
        acceptanceCriteria,
        documents
      });
      setResult(data);
      setTimeout(() => scrollTo("findings"), 150);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function exportMarkdown() {
    if (!result) return;
    const md = toMarkdown({ userStory, acceptanceCriteria, result, cards });
    downloadText("silent-requirements-report.md", md);
  }

  function exportJiraChecklist() {
    if (!result) return;
    const jira = toJiraChecklist({ result });
    downloadText("jira-checklist.txt", jira);
  }

  // tabs: swap screenshots -> docs
  const showStories = topTab === "detect" || topTab === "stories";
  const showDocs = topTab === "detect" || topTab === "docs";

  return (
    <Shell>
      {/* HERO + HOW IT WORKS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* HERO */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-10 shadow-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/10 blur-[70px]" />
            <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-sky-400/10 blur-[80px]" />
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Pill
                tone="gray"
                active={topTab === "detect"}
                onClick={() => {
                  setTopTab("detect");
                  scrollTo("workspace");
                }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Detect silent requirements
              </Pill>

              <Pill
                tone="gray"
                active={topTab === "stories"}
                onClick={() => {
                  setTopTab("stories");
                  scrollTo("workspace");
                }}
              >
                <FileText className="h-3.5 w-3.5" /> Stories &amp; criteria
              </Pill>

              <Pill
                tone="gray"
                active={topTab === "docs"}
                onClick={() => {
                  setTopTab("docs");
                  scrollTo("workspace");
                }}
              >
                <FileUp className="h-3.5 w-3.5" /> Documents
              </Pill>
            </div>

            <div className="mt-7 max-w-4xl">
              <h2 className="text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl">
                AI that finds the requirements people never write down.
              </h2>

              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                {headerSubtext[topTab]}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollTo("workspace")}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-soft hover:bg-violet-700"
                >
                  Try the detector <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-soft">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/10 blur-[70px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-400/10 blur-[80px]" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Zap className="h-4 w-4 text-amber-500" />
              How it works
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  icon: <FileText className="h-4 w-4" />,
                  text: "Paste User Story & Acceptance Criteria"
                },
                {
                  icon: <FileUp className="h-4 w-4" />,
                  text: "Upload documents (PRD, tickets, specs)"
                },
                {
                  icon: <Search className="h-4 w-4" />,
                  text: "Generate gaps, edge cases, and questions"
                }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-9 w-9 rounded-full bg-slate-100/80 border border-slate-200/70 flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  {step.text}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Tabs
                value={bottomTab}
                onChange={setBottomTab}
                items={[
                  { value: "how", label: "Details" },
                  { value: "out", label: "Outputs" },
                  { value: "ex", label: "Example" }
                ]}
              />
            </div>

            <div className="mt-4 text-sm leading-relaxed text-slate-600">
              {bottomTab === "how" && (
                <div>
                  It compares what you wrote vs. what teams assume: error states, permissions,
                  validation, empty states, and cross-screen consistency.
                </div>
              )}
              {bottomTab === "out" && (
                <ul className="list-disc space-y-1 pl-5">
                  <li>Ambiguous language flags</li>
                  <li>Missing edge cases</li>
                  <li>Clarifying questions</li>
                  <li>Improved acceptance criteria</li>
                </ul>
              )}
              {bottomTab === "ex" && (
                <div>
                  “User can submit form” → what happens on network failure, duplicate submit, missing
                  required fields, and permission denied?
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div id="workspace" className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <Card
            title="Project workspace"
            subtitle="Requirements & supporting documents"
            right={
              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading || !canAnalyze}
                className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                title={!canAnalyze ? "Add a story, criteria, or documents to enable analysis." : ""}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <>
                    Start analysis
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            }
          >
            {err ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {err}
              </div>
            ) : null}

            {/* Stories + Criteria side-by-side */}
            {showStories ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">User stories</label>
                  <textarea
                    className="mt-2 h-56 w-full resize-none rounded-xl border border-slate-200 bg-white/85 backdrop-blur p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder={"As a PM, I want...\nAs a user, I need..."}
                    value={userStory}
                    onChange={(e) => setUserStory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Acceptance criteria</label>
                  <textarea
                    className="mt-2 h-56 w-full resize-none rounded-xl border border-slate-200 bg-white/85 backdrop-blur p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder={"Given...\nWhen...\nThen..."}
                    value={acceptanceCriteria}
                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-600">
                Stories &amp; criteria hidden by your top filter.
              </div>
            )}

            {/* Documents full width below */}
            {showDocs ? (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium text-slate-700">
                  Supporting documents (optional)
                </div>

                <FileDrop files={documents} setFiles={setDocuments} />

                <div className="mt-2 text-xs text-slate-500">
                  Tip: upload PRD/specs/Jira exports to catch hidden assumptions and missing states.
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-600">
                Documents hidden by your top filter.
              </div>
            )}
          </Card>
        </div>

        {/* Compact export */}
        <div className="lg:col-span-3">
          <Card
            title="Export"
            subtitle="Deliverables"
            icon={<Download className="h-4 w-4" />}
            className="lg:sticky lg:top-6"
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={exportMarkdown}
                disabled={!result}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Markdown Report
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={exportJiraChecklist}
                disabled={!result}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Jira Checklist
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {!result ? (
              <div className="mt-3 text-xs text-slate-500">Run analysis to enable exports.</div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] text-slate-500 font-medium uppercase text-center">
                  Ready for Review
                </p>
                <div className="flex justify-center mt-2">
                  <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Findings */}
      <div id="findings" className="mt-8">
        <Card title="Findings" subtitle="Mini-cards grouped by type and severity.">
          <Findings filter={filter} setFilter={setFilter} cards={cards} layout="mini-grid" />
        </Card>
      </div>

      {/* FOOTER */}
      <div className="mt-10 border-t border-slate-200/60 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Subtext AI. A personal project by{" "}
        <span className="font-medium text-slate-700">Sobhareddy Pittu</span> ·{" "}
        <a
          href="https://www.linkedin.com/in/sobhareddy-pittu-712b39207/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </Shell>
  );
}
