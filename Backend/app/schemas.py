import os
from google import genai
from google.genai import types  # Required for configuration and images
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

# 1. Define your schema
class AnalyzeResponse(BaseModel):
    ambiguous_phrases: List[str] = Field(default_factory=list)
    missing_edge_cases: List[str] = Field(default_factory=list)
    architectural_risks: List[str] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
    improved_acceptance_criteria: Optional[str] = None
    technical_notes: Optional[str] = None

# 2. Initialize the Client (Replaces genai.configure)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are a senior QA + Product reviewer.
Goal: Detect "silent requirements" (implicit assumptions) and prevent bugs before coding.
"""

async def analyze_requirements(
    user_story: str,
    acceptance_criteria: str,
    screenshot_files: Optional[List[Tuple[bytes, str, str]]] = None,
    model: Optional[str] = None,
) -> AnalyzeResponse:

    chosen_model_name = model or os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

    prompt_parts = [
        f"USER STORY:\n{user_story.strip()}",
        f"ACCEPTANCE CRITERIA:\n{acceptance_criteria.strip()}",
        "Analyze the requirements and provide feedback."
    ]

    if screenshot_files:
        for (data, mime, _) in screenshot_files:
            prompt_parts.append(
                types.Part.from_bytes(data=data, mime_type=mime)
            )

    response = client.models.generate_content(
        model=chosen_model_name,
        contents=prompt_parts,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=AnalyzeResponse,
        ),
    )

    return response.parsed
