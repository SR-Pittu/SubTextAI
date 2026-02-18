from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeResponse(BaseModel):
    ambiguous_phrases: List[str] = Field(default_factory=list)
    missing_edge_cases: List[str] = Field(default_factory=list)
    architectural_risks: List[str] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
    improved_acceptance_criteria: Optional[str] = None
    technical_notes: Optional[str] = None