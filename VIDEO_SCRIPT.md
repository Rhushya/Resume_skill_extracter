# 🎬 Video Recording Script — Resume Skill Extractor (7 min)

Use this as your narration guide while recording your Loom video.
Keep Windsurf open throughout so the evaluators can see you built it there.

---

## ⏱ SEGMENT 1 — Intro & Goal (0:00 – 0:30)

**Screen:** Windsurf IDE open, project folder visible in sidebar

**Say:**
> "Hi, I'm Rhushya. I built a Resume Skill Extractor — an AI-powered tool that takes any PDF resume
> and extracts structured data: name, contact info, skills, experience, projects — all in one click.
> I built this entirely in Windsurf, using FastAPI on the backend and React with Tailwind on the frontend.
> Let me walk you through the codebase first, then demo it live."

---

## ⏱ SEGMENT 2 — Extractor Logic (0:30 – 1:30)

**Screen:** Open `backend/app/extractor.py` in Windsurf

**Say:**
> "This is the brain of the app. I use **pdfplumber** to read the raw text from any PDF.
> Then I send that text to **Groq's Llama 3.3 70B** model via their Python SDK.
> The key here is the prompt — I give the LLM a strict JSON schema and tell it to return
> ONLY valid JSON with no extra text. Temperature is set to 0.1 so it's deterministic.
> After getting the response, I strip any accidental markdown fences and parse it with json.loads.
> If it fails, I have a regex fallback that hunts for the JSON object in the response."

**Show in Windsurf:** Highlight the PROMPT_TEMPLATE, the Groq client call, and the json.loads line.

---

## ⏱ SEGMENT 3 — Backend Routes + Database (1:30 – 2:30)

**Screen:** Open `routes/resume.py` then `database.py`

**Say:**
> "The API has five endpoints — upload, list all, search by skill, get by ID, and delete.
> The upload endpoint validates file type and size first, then calls the extractor,
> then saves everything to a SQLite database via `database.py`.
> SQLite keeps it simple and portable — no external DB needed, perfect for this use case.
> Skills are also stored as a JSON array in a `tags` column so we can do fast LIKE queries
> to filter resumes by skill."

**Show in Windsurf:** The `/upload` route flow, then `save_resume()` and `search_resumes_by_skill()`.

---

## ⏱ SEGMENT 4 — Live Demo (2:30 – 4:30)

**Screen:** Switch to browser, `http://localhost:3000` (or `5173` for local dev)

**Say:**
> "Let me show it working live. I'll upload my own resume."

**Do:**
1. Drag and drop your PDF onto the upload zone
2. Watch the spinner — say: *"Groq is processing it — takes under 10 seconds"*
3. When result appears, scroll through it:
   - Point to the profile card: *"Name, email, phone, location, LinkedIn and GitHub links"*
   - Skills section: *"All skills extracted as tags — X skills detected"*
   - Experience: *"Each role, company, duration and bullet points"*
   - Projects: *"Tech stack auto-detected per project"*

---

## ⏱ SEGMENT 5 — History & Search (4:30 – 5:15)

**Screen:** Click "History" tab in the navbar

**Say:**
> "Every extracted resume is saved to SQLite and shows up here.
> I can filter by skill — let me search for 'Python'."

**Do:** Type "Python" in the search box and hit Search. Show the results.

> "The search does a case-insensitive LIKE query on the skills tags column.
> You can also delete resumes individually from here."

---

## ⏱ SEGMENT 6 — Docker Demo (5:15 – 6:00)

**Screen:** Terminal running `docker compose up`, then browser at `localhost:3000`

**Say:**
> "The entire project is Dockerized. One command — `docker compose up --build` —
> spins up both the FastAPI backend and the React frontend served by nginx.
> Nginx also proxies `/api` calls to the backend container, so there's no CORS issue in production.
> This is what you'd run in the demo."

---

## ⏱ SEGMENT 7 — Windsurf Usage + Wrap Up (6:00 – 7:00)

**Screen:** Back to Windsurf, show the AI chat / Cascade panel

**Say:**
> "Throughout this build, I used Windsurf's Cascade to scaffold the FastAPI routes,
> generate the Groq prompt template, and debug the JSON parsing edge cases.
> It cut my build time significantly — I'd estimate it saved me 60-70% of the typing.
> 
> If I were to extend this: I'd add CSV export of skills, bulk upload for multiple resumes,
> and a comparison view to put two candidates side by side.
> 
> The code is clean, the flow is simple, and every part is explainable.
> Thanks for watching!"

---

## 💡 Tips

- Record in 1080p, keep the font size in Windsurf large enough to read
- Use Loom — free, one-click screen recording, automatic sharing link
- Keep your terminal visible when running docker so evaluators see it working
- Practice the demo once before recording — the Groq call takes ~5-8 seconds
