import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "./data/resumes.db")

def _ensure_dir():
    d = os.path.dirname(DB_PATH)
    if d:
        os.makedirs(d, exist_ok=True)

def get_db():
    _ensure_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    _ensure_dir()
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            filename     TEXT    NOT NULL,
            raw_text     TEXT,
            extracted_data TEXT,
            tags         TEXT,
            uploaded_at  TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_resume(filename: str, raw_text: str, extracted_data: dict) -> int:
    conn = get_db()
    tags = json.dumps(extracted_data.get("skills", []))
    cur  = conn.execute(
        "INSERT INTO resumes (filename, raw_text, extracted_data, tags, uploaded_at) VALUES (?,?,?,?,?)",
        (filename, raw_text, json.dumps(extracted_data), tags, datetime.utcnow().isoformat())
    )
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid

def _row_to_dict(row):
    d = dict(row)
    d["extracted_data"] = json.loads(d["extracted_data"]) if d.get("extracted_data") else {}
    d["tags"]           = json.loads(d["tags"])           if d.get("tags")           else []
    return d

def get_all_resumes():
    conn = get_db()
    rows = conn.execute(
        "SELECT id,filename,extracted_data,tags,uploaded_at FROM resumes ORDER BY uploaded_at DESC"
    ).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def get_resume_by_id(rid: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM resumes WHERE id=?", (rid,)).fetchone()
    conn.close()
    return _row_to_dict(row) if row else None

def delete_resume_by_id(rid: int) -> bool:
    conn = get_db()
    cur = conn.execute("DELETE FROM resumes WHERE id=?", (rid,))
    conn.commit()
    conn.close()
    return cur.rowcount > 0

def search_resumes_by_skill(skill: str):
    conn = get_db()
    rows = conn.execute(
        "SELECT id,filename,extracted_data,tags,uploaded_at FROM resumes WHERE LOWER(tags) LIKE ?",
        (f"%{skill.lower()}%",)
    ).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]
