# Resume Skill Extractor

An AI-powered web app that parses PDF resumes and extracts structured data — name, email, phone,
skills, work experience, education, and projects — using **Groq's Llama 3.3 70B** model.

Built with:
- **Backend** — FastAPI + pdfplumber + Groq SDK + SQLite
- **Frontend** — React + TypeScript + Tailwind CSS + Vite
- **AI** — Groq API (`llama-3.3-70b-versatile`)
- **Deployment** — Docker + Docker Compose

---

## Live Deployment

- Frontend: https://resume-skill-extracter.vercel.app/
- Backend: https://resume-skill-extractor-backend.onrender.com

---

## Assignment Criteria Checklist

| Requirement | Status |
|---|---|
| Upload PDF through GUI | Yes |
| Extract name, email, phone, skills, experience | Yes |
| Display in clean summary view | Yes |
| Store results for later access (SQLite) | Yes |
| Filter resumes by skill tags | Yes (bonus) |
| Dockerized — runs via docker compose | Yes |
| Simple, explainable codebase | Yes |

---

## Step 1 — Get Your Groq API Key

1. Go to **https://console.groq.com**
2. Sign in (free) → API Keys → **Create API Key**
3. Copy it — looks like `gsk_xxxxxxxxxxxx`

---

## Option A — Run with Docker (for your demo)

> **Requirements:** Docker Desktop installed and running

```bash
# 1. Enter the project folder
cd resume-skill-extractor

# 2. Create the .env file (copy the example and add your key)
cp .env.example .env
# Now open .env in any editor and replace the placeholder with your real key:
#   GROQ_API_KEY=gsk_your_actual_key_here

# 3. Build and start everything
docker compose up --build

# 4. Open in browser:
#   Frontend  → http://localhost:3000
#   API Docs  → http://localhost:8000/docs
#   API Health→ http://localhost:8000/health

# 5. To stop:
docker compose down
```

> First build takes ~2-3 minutes. Subsequent starts are instant.

---

## Option B — Run Locally (for development)

> **Requirements:** Python 3.10+, Node.js 18+

### Backend

```bash
cd resume-skill-extractor/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env → set GROQ_API_KEY=gsk_your_key_here

# Start backend
uvicorn app.main:app --reload --port 8000
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend (new terminal)

```bash
cd resume-skill-extractor/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend running at http://localhost:5173
```

---

## Project Structure

```
resume-skill-extractor/
├── docker-compose.yml          # Orchestrates backend + frontend
├── .env.example                # Copy to .env and add your key
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app + CORS + startup
│       ├── database.py         # SQLite — save/fetch/delete/search
│       ├── extractor.py        # PDF text extraction + Groq LLM call
│       └── routes/
│           └── resume.py       # All API endpoints
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # Serves React + proxies /api → backend
    ├── src/
    │   ├── App.tsx             # Router + header + dark mode
    │   ├── lib/
    │   │   ├── api.ts          # Axios client + typed API calls
    │   │   └── utils.ts        # cn() helper
    │   └── pages/
    │       ├── HomePage.tsx    # Upload + result display
    │       └── HistoryPage.tsx # All stored resumes + skill search
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resume/upload` | Upload PDF → extract + store |
| `GET` | `/api/resume/all` | Get all stored resumes |
| `GET` | `/api/resume/search?skill=python` | Filter by skill |
| `GET` | `/api/resume/{id}` | Get one resume by ID |
| `DELETE` | `/api/resume/{id}` | Delete a resume |
| `GET` | `/health` | Health check |

---

## How It Works

```
User uploads PDF
      │
      ▼
pdfplumber extracts raw text
      │
      ▼
Groq API (Llama 3.3 70B) receives structured prompt + resume text
      │
      ▼
LLM returns clean JSON {name, email, skills, experience...}
      │
      ▼
FastAPI saves to SQLite database
      │
      ▼
React frontend displays the structured result
```

---

## Common Issues

| Problem | Fix |
|---|---|
| `GROQ_API_KEY not set` | Make sure `.env` has `GROQ_API_KEY=gsk_...` |
| `Could not extract text` | Your PDF might be image-based — use a text PDF |
| `npm install` fails | Make sure Node 18+ is installed: `node --version` |
| Docker port busy | Change `3000:80` to `3001:80` in `docker-compose.yml` |
| Backend 503 error | Double-check your Groq key is valid and has quota |
