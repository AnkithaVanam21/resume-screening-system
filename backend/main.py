from database import SessionLocal, engine, Base
from models import Candidate

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from parser import extract_text
from scorer import calculate_score

import shutil

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_resumes(
    jd: str = Form(None),
    jd_file: UploadFile = File(None),
    resumes: list[UploadFile] = File(...)
):
    
    results = []

    db = SessionLocal()

    for resume in resumes:

        file_path = f"uploads/{resume.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        resume_text = extract_text(file_path)

        score, matched_skills, missing_skills = calculate_score(
            jd,
            resume_text
        )

        results.append({
            "name": resume.filename,
            "score": score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        })

        candidate = Candidate(
            name=resume.filename,
            score=score,
            matched_skills=",".join(matched_skills),
            missing_skills=",".join(missing_skills)
        )

        db.add(candidate)
        db.commit()

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results