import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Job Descriptions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT, -- JSON array of required skills
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create Candidates table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            skills TEXT, -- JSON array of candidate skills
            experience TEXT, -- JSON structure of candidate experience details
            education TEXT,
            summary TEXT,
            score REAL NOT NULL,
            technical_score REAL NOT NULL,
            experience_score REAL NOT NULL,
            education_score REAL NOT NULL,
            resume_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (job_id) REFERENCES job_descriptions (id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

class Database:
    @staticmethod
    def create_job(title: str, description: str, requirements: List[str]) -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO job_descriptions (title, description, requirements) VALUES (?, ?, ?)",
            (title, description, json.dumps(requirements))
        )
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return job_id

    @staticmethod
    def get_job(job_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_descriptions WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            job = dict(row)
            job["requirements"] = json.loads(job["requirements"]) if job["requirements"] else []
            return job
        return None

    @staticmethod
    def get_all_jobs() -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_descriptions ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        jobs = []
        for row in rows:
            job = dict(row)
            job["requirements"] = json.loads(job["requirements"]) if job["requirements"] else []
            jobs.append(job)
        return jobs

    @staticmethod
    def delete_job(job_id: int) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM job_descriptions WHERE id = ?", (job_id,))
        cursor.execute("DELETE FROM candidates WHERE job_id = ?", (job_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        conn.close()
        return deleted

    @staticmethod
    def add_candidate(candidate_data: Dict[str, Any]) -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO candidates (
                job_id, name, email, phone, skills, experience, education, 
                summary, score, technical_score, experience_score, education_score, resume_text
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                candidate_data["job_id"],
                candidate_data["name"],
                candidate_data.get("email"),
                candidate_data.get("phone"),
                json.dumps(candidate_data.get("skills", [])),
                json.dumps(candidate_data.get("experience", {})),
                candidate_data.get("education"),
                candidate_data.get("summary"),
                candidate_data["score"],
                candidate_data["technical_score"],
                candidate_data["experience_score"],
                candidate_data["education_score"],
                candidate_data.get("resume_text")
            )
        )
        candidate_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return candidate_id

    @staticmethod
    def get_candidates_for_job(job_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates WHERE job_id = ? ORDER BY score DESC", (job_id,))
        rows = cursor.fetchall()
        conn.close()
        candidates = []
        for row in rows:
            c = dict(row)
            c["skills"] = json.loads(c["skills"]) if c["skills"] else []
            c["experience"] = json.loads(c["experience"]) if c["experience"] else {}
            candidates.append(c)
        return candidates

    @staticmethod
    def get_candidate(candidate_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            c = dict(row)
            c["skills"] = json.loads(c["skills"]) if c["skills"] else []
            c["experience"] = json.loads(c["experience"]) if c["experience"] else {}
            return c
        return None
