# 🚀 Deployment Guide — Render (Backend) + Vercel (Frontend)

## STEP 1 — Deploy Backend to Render

1. Go to https://render.com → Sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `Rhushya/Resume_skill_extracter`
4. Fill in these settings:
   - **Name:** `resume-skill-extractor-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
5. Scroll to **Environment Variables** → Add:
   - Key: `GROQ_API_KEY`
   - Value: your key from https://console.groq.com
6. Click **Create Web Service**
7. Wait ~3 minutes for it to build
8. Your backend URL will be: `https://resume-skill-extractor-backend.onrender.com`
9. Test it: visit `https://resume-skill-extractor-backend.onrender.com/health` — should show `{"status":"ok"}`

---

## STEP 2 — Update Frontend with Your Render URL

Once Render gives you the actual URL (step 8 above), update these two files if the URL differs:

**`frontend/vercel.json`** — change the destination URL
**`frontend/.env.production`** — change VITE_API_BASE_URL

---

## STEP 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign in with GitHub
2. Click **Add New Project**
3. Import repo: `Rhushya/Resume_skill_extracter`
4. Fill in settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
5. Under **Environment Variables** add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://resume-skill-extractor-backend.onrender.com`
6. Click **Deploy**
7. Wait ~2 minutes
8. Your frontend URL: `https://resume-skill-extractor.vercel.app`

---

## STEP 4 — Keep Render Awake (Free Tier Fix)

Render free tier sleeps after 15 min inactivity. Fix it:

1. Go to https://cron-job.org → Free sign up
2. Create cronjob:
   - URL: `https://resume-skill-extractor-backend.onrender.com/health`
   - Every: 10 minutes
3. Save — your backend stays awake 24/7

---

## Final URLs

| Service | URL |
|---|---|
| Frontend (Vercel) | https://resume-skill-extractor.vercel.app |
| Backend (Render) | https://resume-skill-extractor-backend.onrender.com |
| API Docs | https://resume-skill-extractor-backend.onrender.com/docs |
| Health Check | https://resume-skill-extractor-backend.onrender.com/health |
