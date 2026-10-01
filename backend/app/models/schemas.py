from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class JobDescriptionCreate(BaseModel):
    title: str = Field(..., example="Senior Full-Stack Engineer")
    description: str = Field(..., example="We are looking for a backend specialist with Python, FastAPI, and Next.js experience.")

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description: str
    requirements: List[str]
    created_at: str

class ExperienceDetail(BaseModel):
    years: float = Field(0.0, description="Total years of experience extracted")
    roles: List[str] = Field(default_factory=list, description="Roles/positions held")
    companies: List[str] = Field(default_factory=list, description="Companies worked at")

class CandidateResponse(BaseModel):
    id: int
    job_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience: Dict[str, Any]  # Matches ExperienceDetail structure
    education: Optional[str] = None
    summary: Optional[str] = None
    score: float
    technical_score: float
    experience_score: float
    education_score: float
    resume_text: Optional[str] = None
    created_at: str

class CandidateCompareResponse(BaseModel):
    candidate_ids: List[int]
    comparison_grid: List[Dict[str, Any]]
