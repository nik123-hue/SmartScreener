import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json

from app.database import init_db, Database
from app.models.schemas import JobDescriptionCreate, JobDescriptionResponse, CandidateResponse
from app.services.parser import ResumeParserService
from app.services.extractor import LLMExtractionService
from app.services.scorer import ScoringEngine

app = FastAPI(title="SmartScreener Backend API", version="1.0.0")

# CORS middleware configuration to allow communication from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart-screener-silk.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    ollama_ok = LLMExtractionService.is_ollama_available()
    return {
        "status": "healthy",
        "ollama_status": "connected" if ollama_ok else "fallback_mode",
        "message": "SmartScreener API is active." if ollama_ok else "SmartScreener API active in Local NLP Fallback Mode."
    }

@app.post("/api/jobs", response_model=JobDescriptionResponse)
def create_job(job_data: JobDescriptionCreate):
    try:
        # Dynamically extract key requirements (skills) from the job description text
        extracted_requirements = ScoringEngine.extract_jd_required_skills(job_data.description)
        # Always make sure we include the title keywords or basic tags if none extracted
        if not extracted_requirements:
            extracted_requirements = [w.strip(",.()").title() for w in job_data.title.split() if len(w) > 3][:4]
            
        job_id = Database.create_job(job_data.title, job_data.description, extracted_requirements)
        
        job = Database.get_job(job_id)
        if not job:
            raise HTTPException(status_code=500, detail="Failed to create job description record.")
            
        return JobDescriptionResponse(
            id=job["id"],
            title=job["title"],
            description=job["description"],
            requirements=job["requirements"],
            created_at=job["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job description: {str(e)}")

@app.get("/api/jobs", response_model=List[JobDescriptionResponse])
def list_jobs():
    jobs = Database.get_all_jobs()
    return [
        JobDescriptionResponse(
            id=job["id"],
            title=job["title"],
            description=job["description"],
            requirements=job["requirements"],
            created_at=job["created_at"]
        ) for job in jobs
    ]

@app.get("/api/jobs/{job_id}", response_model=JobDescriptionResponse)
def get_job(job_id: int):
    job = Database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return JobDescriptionResponse(
        id=job["id"],
        title=job["title"],
        description=job["description"],
        requirements=job["requirements"],
        created_at=job["created_at"]
    )

@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int):
    deleted = Database.delete_job(job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return {"message": "Job description and all associated candidates deleted successfully."}

@app.post("/api/jobs/{job_id}/resumes", response_model=List[CandidateResponse])
async def upload_resumes(job_id: int, files: List[UploadFile] = File(...)):
    # 1. Fetch job description details
    job = Database.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Target job description not found.")
        
    candidates_processed = []
    
    for file in files:
        filename = file.filename or "unknown_resume"
        try:
            # Read file bytes
            file_bytes = await file.read()
            
            # Parse text
            resume_text = ResumeParserService.parse_file(filename, file_bytes)
            if not resume_text or len(resume_text.strip()) < 50:
                # Text extraction failed or too short, continue with next file
                continue
                
            # Extract structured candidate profile details
            candidate_details = LLMExtractionService.extract_candidate_data(resume_text, job["description"])
            
            # Compute scores (Tech, Exp, Edu, Overall)
            scores = ScoringEngine.calculate_scores(candidate_details, job["description"], resume_text)
            
            # Combine payload for database insertion
            candidate_payload = {
                "job_id": job_id,
                "name": candidate_details.get("name", "Unknown Candidate"),
                "email": candidate_details.get("email"),
                "phone": candidate_details.get("phone"),
                "skills": candidate_details.get("skills", []),
                "experience": candidate_details.get("experience", {"years": 1.0, "roles": [], "companies": []}),
                "education": candidate_details.get("education"),
                "summary": candidate_details.get("summary"),
                "score": scores["score"],
                "technical_score": scores["technical_score"],
                "experience_score": scores["experience_score"],
                "education_score": scores["education_score"],
                "resume_text": resume_text
            }
            
            # Persist to database
            candidate_id = Database.add_candidate(candidate_payload)
            
            # Fetch persisted record
            candidate_record = Database.get_candidate(candidate_id)
            if candidate_record:
                candidates_processed.append(candidate_record)
                
        except Exception as e:
            # Print error logs but don't fail the entire batch upload
            print(f"Error processing resume '{filename}': {str(e)}")
            continue
            
    # Return list of newly processed candidates
    return [
        CandidateResponse(
            id=c["id"],
            job_id=c["job_id"],
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            skills=c["skills"],
            experience=c["experience"],
            education=c["education"],
            summary=c["summary"],
            score=c["score"],
            technical_score=c["technical_score"],
            experience_score=c["experience_score"],
            education_score=c["education_score"],
            resume_text=c["resume_text"],
            created_at=c["created_at"]
        ) for c in candidates_processed
    ]

@app.get("/api/jobs/{job_id}/candidates", response_model=List[CandidateResponse])
def get_job_candidates(job_id: int):
    candidates = Database.get_candidates_for_job(job_id)
    return [
        CandidateResponse(
            id=c["id"],
            job_id=c["job_id"],
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            skills=c["skills"],
            experience=c["experience"],
            education=c["education"],
            summary=c["summary"],
            score=c["score"],
            technical_score=c["technical_score"],
            experience_score=c["experience_score"],
            education_score=c["education_score"],
            resume_text=c["resume_text"],
            created_at=c["created_at"]
        ) for c in candidates
    ]

@app.get("/api/candidates/{candidate_id}", response_model=CandidateResponse)
def get_candidate_detail(candidate_id: int):
    c = Database.get_candidate(candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    return CandidateResponse(
        id=c["id"],
        job_id=c["job_id"],
        name=c["name"],
        email=c["email"],
        phone=c["phone"],
        skills=c["skills"],
        experience=c["experience"],
        education=c["education"],
        summary=c["summary"],
        score=c["score"],
        technical_score=c["technical_score"],
        experience_score=c["experience_score"],
        education_score=c["education_score"],
        resume_text=c["resume_text"],
        created_at=c["created_at"]
    )

@app.get("/api/jobs/{job_id}/compare", response_model=List[CandidateResponse])
def compare_candidates(job_id: int, ids: str = Query(..., description="Comma-separated candidate IDs")):
    try:
        candidate_ids = [int(x) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid candidate IDs format.")
        
    candidates = []
    for c_id in candidate_ids:
        c = Database.get_candidate(c_id)
        if c and c["job_id"] == job_id:
            candidates.append(c)
            
    return [
        CandidateResponse(
            id=c["id"],
            job_id=c["job_id"],
            name=c["name"],
            email=c["email"],
            phone=c["phone"],
            skills=c["skills"],
            experience=c["experience"],
            education=c["education"],
            summary=c["summary"],
            score=c["score"],
            technical_score=c["technical_score"],
            experience_score=c["experience_score"],
            education_score=c["education_score"],
            resume_text=c["resume_text"],
            created_at=c["created_at"]
        ) for c in candidates
    ]

