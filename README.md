# Subtext AI

AI-powered silent requirements detector that analyzes user stories, acceptance criteria, and documents to identify ambiguities, missing edge cases, and implicit assumptions.

---

### Overview

Subtext AI helps product teams, QA engineers, and developers identify hidden gaps in requirements before development begins.

In real-world software projects, requirements often contain:

- Ambiguous language
- Missing validations
- Undefined edge cases
- Implicit assumptions
- Incomplete acceptance criteria

Subtext AI uses LLM-powered analysis to surface these issues automatically in a structured, actionable format.

---

### Features

- **Analyze Requirements**: Paste user stories and acceptance criteria for LLM-powered analysis
- **Document Upload**: Upload supporting documents (PRD, Jira exports, specs) to catch hidden assumptions
- **Detect Ambiguities**: Automatically identify ambiguous language and unclear statements
- **Edge Case Detection**: Find missing edge cases and undefined error states
- **Assumption Highlighting**: Surface implicit assumptions that teams often miss
- **Clarifying Questions**: Generate questions to resolve gaps before development
- **Multi-Tab Interface**: Switch between Stories, Criteria, and Documents views
- **Export Options**: Download findings as Markdown reports or Jira checklists
- **Reset Workspace**: Clear inputs and start fresh with a single click
- **Real-time Filtering**: Filter findings by type and severity for focused review


---

### Tech Stack

#### Frontend
- React
- Vite
- Tailwind CSS

#### Backend
- FastAPI
- Python
- Pydantic

#### AI Integration
- LLM API
- Structured response schema validation

---

### Getting Started

#### Prerequisites

- Python 3.8+
- Node.js 16+
- Docker & Docker Compose (optional, for containerized deployment)

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SR-Pittu/SubTextAI.git
   cd SubTextAI
   ```

2. **Set up the Backend**
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

3. **Set up the Frontend**
   ```bash
   cd ../Frontend
   npm install
   ```

---

### Environment Setup

⚠️ **IMPORTANT**: This project requires environment variables for both backend and frontend. These files are gitignored for security reasons and must be created locally.

#### Backend Setup

1. Copy the example file:
   ```bash
   cd Backend
   cp .env.example .env
   ```

2. Update `.env` with your API credentials:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

#### Frontend Setup

1. Copy the example file:
   ```bash
   cd Frontend
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your backend URL:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

   For production deployment, set this to your actual backend URL (e.g., `https://api.subtextai.net`).

#### Configuration Reference

| File | Location | Required | Purpose |
|------|----------|----------|---------|
| `.env` | `Backend/` | ✅ Yes | LLM API credentials |
| `.env.local` | `Frontend/` | ✅ Yes | Backend API endpoint |

**Note**: These files are listed in `.gitignore` and will not be committed to the repository for security reasons.


---

### Usage

#### Running Locally

1. **Start the Backend**
   ```bash
   cd Backend
   python -m uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`

2. **Start the Frontend** (in another terminal)
   ```bash
   cd Frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

#### Using Docker Compose

```bash
docker-compose up
```

### How It Works

1. **Input**: Paste or upload your requirements, user stories, or acceptance criteria
   - Add user stories in the "Stories & Criteria" tab
   - Upload supporting documents (PRD, Jira exports, specs) in the "Documents" tab
   - Use the multi-tab interface to organize your inputs

2. **Analysis**: Subtext AI processes the text using LLM-powered analysis
   - Compares written requirements against typical edge cases and error states
   - Identifies ambiguous language and implicit assumptions
   - Checks for missing validations, permissions, and cross-screen consistency
   - Generates clarifying questions for stakeholders

3. **Output**: Get structured findings including:
   - **Ambiguous phrases** with suggestions for clarification
   - **Missing edge cases** (network failures, duplicate submissions, empty states)
   - **Implicit assumptions** that may cause development delays
   - **Clarifying questions** to resolve gaps before coding begins
   - **Improved acceptance criteria** suggestions

4. **Export**: Download findings in your preferred format
   - **Markdown Report**: Comprehensive report for documentation and review
   - **Jira Checklist**: Ready-to-import checklist for Jira tickets
   - Use the Reset button to start analyzing new requirements

### Project Structure

```
SubTextAI/
├── Backend/                    # FastAPI backend service
│   ├── app/
│   │   ├── main.py            # FastAPI application setup
│   │   ├── llm.py             # LLM integration logic
│   │   └── schemas.py         # Data validation schemas
│   ├── Dockerfile
│   └── requirements.txt
├── Frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── api.js             # API communication
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml         # Container orchestration
└── README.md
```

---


