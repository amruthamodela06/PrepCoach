# PrepCoach — AI-Powered Technical & Product Interview Coach

**PrepCoach** is a full-stack AI mock interview platform built with **FastAPI** and **React 19 (Vite)**. It simulates realistic, high-bar technical and product interviews with live follow-up probing, real-time speech & draft coaching, anti-inflated 4-dimension scorecards, and downloadable Markdown study guides.

---

## Key Features

- **5 Specialized Interview Roles**
  - **Software Engineer (`swe`)**: Data structures, system design, APIs/databases, and project ownership.
  - **Data Science (`data`)**: Statistical reasoning, SQL, A/B testing & experimentation, and ML modeling.
  - **Product Manager (`pm`)**: Product sense, prioritization, metrics/RCA, and structured strategy.
  - **DevOps / SRE (`devops`)**: Cloud architecture, Kubernetes, CI/CD, observability/SLOs, and incident response.
  - **Security Engineer (`security`)**: Threat modeling, OWASP AppSec, IAM/cryptography, and incident containment.
- **3 Interviewer Persona Styles**
  - **Standard Interviewer**: Balanced, objective industry engineering bar.
  - **Bar Raiser (Strict)**: Pushes relentlessly on scale limits, edge cases, and quantified proof.
  - **Tech Lead Mentor**: Guides architectural reasoning while maintaining technical rigor.
- **Resume, Topic & Company Context Tailoring**
  - Select custom **Focus Topics** per role, paste a **Target Company / Job Description**, and paste your **Resume** (with pre-interview AI **Resume Readiness Analysis**).
- **Live Voice Mode & Real-Time Draft Coach**
  - Hands-free Web Speech API recognition (self-healing across pauses) + configurable interviewer TTS playback speed (`0.9x`–`1.25x`).
  - Live client-side **Draft Coach Bar** tracking word count, speaking duration, filler words, quantification (`+Quantified`), and structure (`+Structured`), plus one-click **AI Draft Polish** and on-demand **Coaching Hints (`Alt+H`)**.
- **Calibrated 4-Axis Scorecard & Radar Visualization**
  - Anti-inflation anchored scoring (`Needs Work`, `Fair`, `Strong`, `Excellent`) with server-side band derivation, SVG **RadarChart**, deterministic **Communication Analytics**, retake delta comparison, and one-click **Markdown Study Guide (`.md`)** or **Print / PDF** export.
- **Curated Question Bank & Progress History**
  - Browse high-signal questions by role and difficulty tier, practice in an interactive scratchpad, bookmark questions/ideal answers, and track your score trajectory across sessions in `localStorage`.

---

## Multi-Provider LLM Backend

PrepCoach supports three interchangeable LLM providers out of the box via a single `PROVIDER` environment variable:

| Provider | Env Variable | Default Model | Notes |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude** | `PROVIDER=anthropic` | `claude-sonnet-5` | Requires `ANTHROPIC_API_KEY` |
| **Groq Cloud** | `PROVIDER=groq` | `llama-3.3-70b-versatile` | Requires `GROQ_API_KEY` (fast, free tier available) |
| **Ollama (Local)** | `PROVIDER=ollama` | `qwen2.5-coder:7b-instruct` | Connects to `http://localhost:11434/v1` (no API key needed) |

---

## Quick Start

### 1. Backend Setup (FastAPI)

```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PROVIDER and API key
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Development (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

To build the production bundle directly into `app/static` (served automatically by FastAPI on `/`):

```bash
cd frontend
npm run build
```

### 3. Run Unit Tests

```bash
python -m unittest discover -s tests
```

---

## API Reference

| Method & Path | Description |
| :--- | :--- |
| `GET /health` | Returns active `provider`, `model`, and service health status. |
| `GET /roles` | Lists all supported roles, their 4 scoring dimensions, focus topics, and interviewer styles. |
| `GET /questions` | Returns curated practice questions filtered by `role` and optional `difficulty`. |
| `POST /chat` | Streams interviewer responses as Server-Sent Events (`text/event-stream`). |
| `POST /score` | Evaluates the completed interview transcript and returns normalized scorecard JSON + `transcript_metrics`. |
| `POST /hint` | Generates a concise conceptual coaching hint for the active interview question. |
| `POST /rewrite-answer` | Polishes a candidate's draft answer into a structured, high-impact response. |
| `POST /analyze-resume` | Evaluates a pasted resume for role readiness, strong signals, probe areas, and predicted questions. |
| `POST /export-markdown` | Generates a formatted Markdown study guide from the scorecard and transcript. |
