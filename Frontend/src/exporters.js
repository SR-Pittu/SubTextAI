function esc(s) {
  return String(s ?? "").trim();
}

function section(title, items) {
  if (!items || items.length === 0) return "";
  const lines = items.map((x) => `- ${esc(x)}`).join("\n");
  return `## ${title}\n${lines}\n\n`;
}

/**
 * Markdown export (README-style)
 */
export function toMarkdown({ userStory, acceptanceCriteria, result, cards }) {
  const now = new Date().toISOString();

  const md =
`# Silent Requirements Report
Generated: ${now}

## Inputs

### User stories
${userStory?.trim() ? userStory.trim() : "_(none)_"} 

### Acceptance criteria
${acceptanceCriteria?.trim() ? acceptanceCriteria.trim() : "_(none)_"} 

---

${section("Clarifying questions", result?.clarifying_questions)}
${section("Missing edge cases", result?.missing_edge_cases)}
${section("Ambiguous phrases", result?.ambiguous_phrases)}

## Findings (cards)
${cards?.length ? cards.map((c) => {
  const label =
    c.type === "edge" ? "Missing edge case" :
    c.type === "clarifying" ? "Clarifying question" : "Ambiguity";
  return `- **${label}** (${c.severity || "MEDIUM"}) — ${esc(c.title)}`;
}).join("\n") : "_(none)_"}
${result?.improved_acceptance_criteria ? `

---

## Improved acceptance criteria
${result.improved_acceptance_criteria}
` : ""}

`;

  return md;
}

/**
 * Jira-ready checklist (copy/paste into Jira description)
 * Uses Markdown checkboxes: - [ ] item
 */
export function toJiraChecklist({ result }) {
  const mkList = (items) =>
    (items || []).map((x) => `- [ ] ${esc(x)}`).join("\n");

  const now = new Date().toISOString();

  return (
`h2. Silent Requirements Checklist
Generated: ${now}

h3. Clarifying questions
${mkList(result?.clarifying_questions) || "- [ ] _(none)_"}

h3. Missing edge cases
${mkList(result?.missing_edge_cases) || "- [ ] _(none)_"}

h3. Ambiguous phrases to tighten
${mkList(result?.ambiguous_phrases) || "- [ ] _(none)_"}
`
  );
}

/**
 * Download helper
 */
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
