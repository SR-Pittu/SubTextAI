import os
import asyncio
import random
from typing import List, Optional, Tuple

from dotenv import load_dotenv
from google import genai
from google.genai import types

from .schemas import AnalyzeResponse

load_dotenv()

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
    http_options={"api_version": "v1beta"},
)

SYSTEM_PROMPT = """
You are an elite trio: a Senior QA Engineer, a Lead Product Manager, and a Principal Developer Architect.

Goal:
Perform a "Pre-Mortem" analysis on requirements to surface "silent requirements," technical debt risks, and implicit assumptions before a single line of code is written.

Input:
- User story text
- Acceptance criteria (AC)
- Optional documents/images

Return JSON ONLY with these keys:
{
  "ambiguous_phrases": [string],
  "missing_edge_cases": [string],
  "architectural_risks": [string],
  "clarifying_questions": [string],
  "improved_acceptance_criteria": string,
  "technical_notes": string
}

Rules:
- ARCHITECTURAL RIGOR: Identify where front-end and back-end state might desync.
- NON-FUNCTIONAL REQUIREMENTS: Performance, Security, Reliability.
- DATA INTEGRITY: orphan/related records, delete/modify effects.
- DOCUMENT/IMAGE ANALYSIS: Use document text if available.
- SPECIFICITY: Avoid generic advice; be concrete.
- PRIORITIZATION: Ask most expensive-to-fix questions first.
- ATOMIC AC: improved_acceptance_criteria must be testable pass/fail outcomes.
"""

# --- guardrails to reduce rate-limit pressure ---
MAX_TEXT_CHARS = 60_000      # per text document chunk
MAX_STORY_CHARS = 12_000     # user_story
MAX_AC_CHARS = 12_000        # acceptance_criteria
MAX_FILES = 6                # avoid too many inline parts
MODEL_ID = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


def _clip(s: str, limit: int) -> str:
    s = (s or "").strip()
    if len(s) <= limit:
        return s
    return s[:limit] + "\n\n[TRUNCATED]"


def _safe_decode_text(data: bytes) -> str:
    try:
        return data.decode("utf-8")
    except Exception:
        return data.decode("latin-1", errors="ignore")


async def _call_with_backoff(fn, max_retries: int = 4):
    """
    Retries only on Gemini/Vertex rate limiting (429 RESOURCE_EXHAUSTED).
    """
    for attempt in range(max_retries + 1):
        try:
            return await fn()
        except Exception as e:
            msg = str(e)
            is_429 = ("429" in msg) or ("RESOURCE_EXHAUSTED" in msg)
            if not is_429 or attempt == max_retries:
                raise

            # exponential backoff + jitter
            sleep_s = (2 ** attempt) + random.uniform(0.0, 0.7)
            await asyncio.sleep(sleep_s)


async def analyze_requirements(
    user_story: Optional[str] = None,
    acceptance_criteria: Optional[str] = None,
    document_files: Optional[List[Tuple[bytes, str, str]]] = None,  # (data, mime, filename)
) -> AnalyzeResponse:
    parts: List[types.Part] = []

    # text inputs (trimmed)
    story = _clip(user_story or "", MAX_STORY_CHARS)
    ac = _clip(acceptance_criteria or "", MAX_AC_CHARS)

    if story:
        parts.append(types.Part.from_text(text=f"USER STORY:\n{story}"))

    if ac:
        parts.append(types.Part.from_text(text=f"ACCEPTANCE CRITERIA:\n{ac}"))

    parts.append(types.Part.from_text(text="Analyze the requirements and provide feedback."))

    # files (limit count to reduce token/throughput pressure)
    if document_files:
        for (data, mime, filename) in document_files[:MAX_FILES]:
            mime = (mime or "").lower().strip()
            filename = filename or "upload"

            # ✅ text files: decode + send as text, clipped
            if mime == "text/plain" or filename.lower().endswith(".txt"):
                text = _clip(_safe_decode_text(data), MAX_TEXT_CHARS)
                parts.append(types.Part.from_text(text=f"DOCUMENT ({filename}):\n{text}"))
                continue

            # ✅ images/pdf: send as inline bytes
            # (keep only safe types from your backend allowlist)
            parts.append(types.Part.from_bytes(data=data, mime_type=mime))

    # ✅ Correct structure
    contents = [types.Content(role="user", parts=parts)]

    async def _do_call():
        return await client.aio.models.generate_content(
            model=MODEL_ID,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AnalyzeResponse,
                temperature=0.1,
            ),
        )

    try:
        response = await _call_with_backoff(_do_call, max_retries=4)
        return response.parsed
    except Exception as e:
        # Keep the message informative so FastAPI can decide if it was a 429
        raise RuntimeError(f"Gemini generate_content failed: {e}") from e
