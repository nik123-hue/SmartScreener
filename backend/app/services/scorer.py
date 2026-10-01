import re
import math
from collections import Counter
from typing import Dict, Any, List
from app.services.extractor import SKILLS_DICTIONARY

class ScoringEngine:
    @staticmethod
    def get_cosine_similarity(text1: str, text2: str) -> float:
        # Standardize and tokenize to words, filtering out short words
        words1 = [w.lower() for w in re.findall(r"\w+", text1) if len(w) > 2]
        words2 = [w.lower() for w in re.findall(r"\w+", text2) if len(w) > 2]
        
        if not words1 or not words2:
            return 0.0
            
        vec1 = Counter(words1)
        vec2 = Counter(words2)
        
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        
        sum1 = sum([vec1[x]**2 for x in vec1.keys()])
        sum2 = sum([vec2[x]**2 for x in vec2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        
        if not denominator:
            return 0.0
        return numerator / denominator

    @staticmethod
    def extract_jd_required_skills(job_desc: str) -> List[str]:
        text_lower = job_desc.lower()
        required = []
        for skill in SKILLS_DICTIONARY:
            escaped = re.escape(skill)
            if skill in ["c++", "c#", "net", "dot net", "next.js", "node.js"]:
                pattern = r"(?:^|[\s,;:\(\)])" + escaped + r"(?:$|[\s,;:\(\)])"
            else:
                pattern = r"\b" + escaped + r"\b"
            if re.search(pattern, text_lower):
                required.append(skill)
        return required

    @staticmethod
    def extract_jd_experience_target(job_desc: str) -> float:
        text_lower = job_desc.lower()
        # Look for numbers near "years" e.g., "5+ years", "3 to 5 years", "requires 4 years"
        matches = re.findall(r"\b(\d+)\+?\s*(?:to\s*\d+\s*)?(?:years?|yrs?)\b", text_lower)
        if matches:
            try:
                return float(max([int(x) for x in matches]))
            except ValueError:
                pass
        
        # Keyword indicators
        if "senior" in text_lower or "lead" in text_lower or "principal" in text_lower:
            return 5.0
        if "junior" in text_lower or "associate" in text_lower:
            return 2.0
        if "intern" in text_lower:
            return 0.0
            
        return 3.0  # Reasonable default mid-level target

    @classmethod
    def calculate_scores(cls, candidate_data: Dict[str, Any], job_desc: str, resume_text: str) -> Dict[str, float]:
        # --- 1. Technical Score (40% Weight) ---
        # Get target skills requested in JD
        jd_skills = cls.extract_jd_required_skills(job_desc)
        candidate_skills = [s.lower() for s in candidate_data.get("skills", [])]
        
        # Measure skill coverage
        if jd_skills:
            matching_skills = [s for s in jd_skills if s in candidate_skills]
            skill_overlap_ratio = len(matching_skills) / len(jd_skills)
        else:
            # If JD lists no recognizable skills, fallback to overlap with standard tech skills candidate possesses
            skill_overlap_ratio = min(len(candidate_skills) / 8.0, 1.0)
            
        # Cosine similarity of the whole text to capture context
        cosine_sim = cls.get_cosine_similarity(resume_text, job_desc)
        
        # Combine (70% skill coverage + 30% contextual similarity)
        tech_score = (0.7 * skill_overlap_ratio + 0.3 * cosine_sim) * 100
        tech_score = min(max(tech_score, 0.0), 100.0)

        # --- 2. Experience Score (40% Weight) ---
        target_years = cls.extract_jd_experience_target(job_desc)
        candidate_years = candidate_data.get("experience", {}).get("years", 0.0)
        
        if target_years == 0.0:
            exp_score = 100.0
        else:
            # Score experiences: candidates exceeding get 100, under gets ratio
            ratio = candidate_years / target_years
            exp_score = min(ratio, 1.2) * 100.0  # cap slightly above 100 if they exceed
            exp_score = min(max(exp_score, 0.0), 100.0)

        # --- 3. Education Score (20% Weight) ---
        edu_text = (candidate_data.get("education") or "").lower()
        edu_score = 60.0  # Base score
        
        if "ph" in edu_text or "doctor" in edu_text:
            edu_score = 100.0
        elif "master" in edu_text or "ms" in edu_text or "m.tech" in edu_text or "mba" in edu_text:
            edu_score = 90.0
        elif "bachelor" in edu_text or "bs" in edu_text or "b.tech" in edu_text or "b.e." in edu_text:
            edu_score = 80.0
        elif "associate" in edu_text:
            edu_score = 70.0

        # Adjust education based on Job Description requirements (e.g. if PhD is explicitly requested)
        if "phd" in job_desc.lower() or "ph.d" in job_desc.lower():
            if not ("ph" in edu_text or "doctor" in edu_text):
                edu_score = max(edu_score - 15.0, 40.0)  # penalty if they want a PhD and candidate doesn't have it

        # --- 4. Overall Weighted Score ---
        overall_score = (0.4 * tech_score) + (0.4 * exp_score) + (0.2 * edu_score)
        
        return {
            "score": round(overall_score, 1),
            "technical_score": round(tech_score, 1),
            "experience_score": round(exp_score, 1),
            "education_score": round(edu_score, 1)
        }
