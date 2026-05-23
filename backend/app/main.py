from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
import uvicorn
import os
from app.routes import resume
from app.database import init_db

app = FastAPI(title="Resume Skill Extractor API", version="1.0.0")

def load_env():
    load_dotenv(find_dotenv())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    load_env()
    init_db()

app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Resume Skill Extractor API is running"}

@app.get("/api/health")
def api_health_check():
    return {"status": "ok", "message": "Resume Skill Extractor API is running"}

@app.get("/api/config")
def config_status():
    load_env()
    return {"groq_api_key_set": bool(os.getenv("GROQ_API_KEY"))}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
