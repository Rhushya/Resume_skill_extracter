from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from app.extractor import extract_text_from_pdf, extract_resume_data
from app.database import (save_resume, get_all_resumes, get_resume_by_id,
                          delete_resume_by_id, search_resumes_by_skill)

router = APIRouter()
MAX_SIZE = 5 * 1024 * 1024   # 5 MB

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(413, "File too large. Max 5 MB.")
    try:
        raw_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(422, f"Failed to read PDF: {e}")
    if not raw_text.strip():
        raise HTTPException(422, "Could not extract text. Is the PDF image-only?")
    try:
        data = extract_resume_data(raw_text)
    except ValueError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"LLM extraction failed: {e}")
    rid = save_resume(file.filename, raw_text, data)
    return JSONResponse({"id": rid, "filename": file.filename,
                         "extracted_data": data, "message": "Success"})

@router.get("/all")
def list_resumes():
    rows = get_all_resumes()
    return {"resumes": rows, "total": len(rows)}

@router.get("/search")
def search(skill: str = Query(...)):
    rows = search_resumes_by_skill(skill)
    return {"resumes": rows, "total": len(rows), "query": skill}

@router.get("/{resume_id}")
def get_one(resume_id: int):
    r = get_resume_by_id(resume_id)
    if not r:
        raise HTTPException(404, "Resume not found")
    return r

@router.delete("/{resume_id}")
def delete_one(resume_id: int):
    if not delete_resume_by_id(resume_id):
        raise HTTPException(404, "Resume not found")
    return {"message": "Deleted"}
