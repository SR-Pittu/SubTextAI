const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function analyzeRequirements({ userStory, acceptanceCriteria, documents }) {
  const formData = new FormData();
  formData.append("user_story", userStory || "");
  formData.append("acceptance_criteria", acceptanceCriteria || "");
  (documents || []).forEach((f) => formData.append("documents", f));

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j?.detail || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
