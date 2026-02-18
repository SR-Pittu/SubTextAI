import json
from dotenv import load_dotenv
load_dotenv()
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .llm import analyze_requirements
from .schemas import AnalyzeResponse


app = FastAPI(title="Silent Requirements Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://subtextai.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    user_story: Optional[str] = Form(None),
    acceptance_criteria: Optional[str] = Form(None),
    documents: Optional[List[UploadFile]] = File(None),  # renamed from screenshots -> documents
):
    # validation (edge cases covered)
    has_text = bool((user_story or "").strip() or (acceptance_criteria or "").strip())
    has_documents = bool(documents)

    if not (has_text or has_documents):
        raise HTTPException(
            status_code=400,
            detail="Provide at least one of: user story, acceptance criteria, or documents."
        )

    # Allowlist for document types (images + pdf + docx + txt)
    allowed_mimes = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
        "text/plain",
    }
    allowed_exts = {".png", ".jpg", ".jpeg", ".pdf", ".txt"}

    max_file_bytes = 8 * 1024 * 1024   # 8MB per file
    max_total_bytes = 20 * 1024 * 1024 # 20MB total

    document_payload = []
    total_bytes = 0

    if documents:
        for f in documents:
            data = await f.read()

            # Edge case: empty upload
            if not data or len(data) == 0:
                continue

            # Size checks
            if len(data) > max_file_bytes:
                raise HTTPException(
                    status_code=400,
                    detail=f"Document '{f.filename or 'upload'}' is too large. Max 8MB per file."
                )

            total_bytes += len(data)
            if total_bytes > max_total_bytes:
                raise HTTPException(
                    status_code=400,
                    detail="Total document upload is too large. Max 20MB combined."
                )

            filename = f.filename or "upload"
            mime = (f.content_type or "application/octet-stream").lower()

            # Basic type validation (mime OR extension)
            ext = ""
            dot = filename.rfind(".")
            if dot != -1:
                ext = filename[dot:].lower()

            if (mime not in allowed_mimes) and (ext not in allowed_exts):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported document type for '{filename}'. Upload PDF, DOCX, TXT, PNG, or JPG."
                )

            # If mime is octet-stream, try to infer for better model handling
            if mime == "application/octet-stream":
                if ext == ".pdf":
                    mime = "application/pdf"
                elif ext == ".docx":
                    mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                elif ext == ".txt":
                    mime = "text/plain"
                elif ext in (".jpg", ".jpeg"):
                    mime = "image/jpeg"
                elif ext == ".png":
                    mime = "image/png"

            document_payload.append((data, mime, filename))

    # If user sent only empty files, treat as "no documents"
    if not has_text and len(document_payload) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded documents were empty. Provide text or a valid document."
        )

    try:
        result = await analyze_requirements(
            user_story=user_story,
            acceptance_criteria=acceptance_criteria,
            document_files=document_payload if document_payload else None,
        )
        return result

    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process requirements with Gemini."
        )
