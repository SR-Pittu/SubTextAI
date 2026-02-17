export async function analyzeRequirements({
  userStory,
  acceptanceCriteria,
  documents
}) {
  const formData = new FormData();

  // ✅ MUST match FastAPI Form(...) parameter names
  formData.append("user_story", userStory || "");
  formData.append("acceptance_criteria", acceptanceCriteria || "");

  // ✅ MUST match FastAPI File(...) parameter name
  (documents || []).forEach((file) => {
    formData.append("documents", file); // <-- NOT documents[]
  });

  const res = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    let message = "Failed to process requirements.";
    try {
      const data = await res.json();
      message = data?.detail || data?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}
