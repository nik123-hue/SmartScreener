import re
import json
import requests
from typing import Dict, Any, List, Optional

# A robust list of common skills to match when running in offline/NLP fallback mode
SKILLS_DICTIONARY = [
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin", "scala", "r", "sql", "html", "css", "bash",
    # Frameworks & Libraries
    "react", "next.js", "nextjs", "vue", "angular", "svelte", "node.js", "nodejs", "express", "fastapi", "flask", "django", "spring boot", "laravel", 
    "react native", "flutter", "jquery", "tailwind", "bootstrap", "pandas", "numpy", "scipy", "pytorch", "tensorflow", "keras", "scikit-learn",
    # Databases
    "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "mariadb", "firebase", "oracle", "mssql",
    # DevOps & Cloud
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "ci/cd", "jenkins", "terraform", "ansible", "github actions", "git", "linux", "nginx",
    # AI / Data Science
    "machine learning", "deep learning", "nlp", "natural language processing", "llm", "large language models", "data science", "spark", "hadoop", "tableau", "power bi",
    # Tools & Methodologies
    "agile", "scrum", "jira", "confluence", "git", "github", "gitlab", "graphql", "rest api", "grpc", "microservices", "system design",
    # Business / Management / Soft Skills
    "project management", "product management", "leadership", "communication", "problem solving", "teamwork", "analytical", "creativity"
]

class RuleBasedExtractor:
    @staticmethod
    def extract_name(text: str) -> str:
        # Resumes usually have candidate's name in the first few lines
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        # Skip headers like "Resume", "Curriculum Vitae", or contact details
        skip_words = ["resume", "cv", "curriculum", "vitae", "contact", "email", "phone", "address", "page", "portfolio"]
        for line in lines[:5]:
            # Clean and check
            lower_line = line.lower()
            if any(word in lower_line for word in skip_words):
                continue
            if "@" in lower_line or "http" in lower_line or ":" in lower_line:
                continue
            # Check length: Name is typically 2-3 words, mostly alphabetic
            words = line.split()
            if 2 <= len(words) <= 4 and all(w.replace(".", "").isalpha() or "-" in w for w in words):
                return line
        return "Unknown Candidate"

    @staticmethod
    def extract_email(text: str) -> Optional[str]:
        match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        return match.group(0) if match else None

    @staticmethod
    def extract_phone(text: str) -> Optional[str]:
        # Match common phone formats, requiring at least 8 digits
        match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}", text)
        return match.group(0).strip() if match else None

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        text_lower = text.lower()
        extracted = []
        for skill in SKILLS_DICTIONARY:
            # Escape skill for regex (e.g. c++)
            escaped_skill = re.escape(skill)
            
            # Use word boundaries. For skills containing special chars like c++ or next.js, 
            # custom boundary check is needed because \b doesn't align with non-alphanumeric trailing characters
            if skill in ["c++", "c#", "net", "dot net", "next.js", "node.js"]:
                pattern = r"(?:^|[\s,;:\(\)])" + escaped_skill + r"(?:$|[\s,;:\(\)])"
            else:
                pattern = r"\b" + escaped_skill + r"\b"
                
            if re.search(pattern, text_lower):
                # Standardize casing to match the dictionary definition
                extracted.append(skill.title() if skill not in ["aws", "gcp", "sql", "css", "html", "ci/cd", "rest api", "graphql", "api"] else skill.upper())
        return list(set(extracted))

    @staticmethod
    def extract_experience_details(text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # 1. Total years extraction
        # Look for patterns like: "5 years of experience", "6+ yrs", "10 years"
        years = 0.0
        yr_matches = re.findall(r"\b(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\b", text_lower)
        if yr_matches:
            try:
                # Get the maximum mentioned years as total years
                years = max([float(x) for x in yr_matches])
            except ValueError:
                pass
                
        # 2. Date ranges extraction
        # e.g., "2018 - 2021", "2019 to Present", "2020-2024"
        date_pattern = r"\b(20\d{2})\s*(?:-|to|–)\s*(20\d{2}|present|current)\b"
        date_matches = re.findall(date_pattern, text_lower)
        calculated_years = 0.0
        current_year = 2026 # Context says current year is 2026
        
        for start, end in date_matches:
            start_y = int(start)
            end_y = current_year if end in ["present", "current"] else int(end)
            diff = end_y - start_y
            if 0 < diff < 20: # ignore outliers
                calculated_years += diff
        
        # Combine strategies
        total_years = max(years, calculated_years)
        if total_years == 0.0:
            # Default fallback if no years or ranges found
            total_years = 1.0

        # 3. Roles and Companies extraction (heuristic-based)
        roles = []
        companies = []
        
        # Look for standard role titles
        common_roles = ["software engineer", "developer", "architect", "manager", "data scientist", "analyst", "lead", "designer", "intern"]
        for role in common_roles:
            role_matches = re.findall(r"\b" + role + r"\b", text_lower)
            if role_matches:
                roles.append(role.title())
                
        # Heuristic for companies: lines containing "at [Company]" or "[Company] Inc/Ltd" or email domains
        # We can extract a few capitalize words near "worked at" or "engineer at"
        at_matches = re.findall(r"\b(?:engineer|developer|architect|manager)\s+at\s+([A-Z][a-zA-Z0-9]+)\b", text)
        for comp in at_matches:
            companies.append(comp)
            
        # Limit lists to top 5
        return {
            "years": round(total_years, 1),
            "roles": list(set(roles))[:5],
            "companies": list(set(companies))[:5]
        }

    @staticmethod
    def extract_education(text: str) -> str:
        text_lower = text.lower()
        # Check degrees from highest to lowest
        degrees = [
            ("Ph.D / Doctorate", ["phd", "ph.d", "doctor of philosophy", "doctorate"]),
            ("Master's Degree", ["master of science", "master of", "ms in", "msc", "m.tech", "mba", "m.s.", "m.b.a."]),
            ("Bachelor's Degree", ["bachelor of science", "bachelor of", "bs in", "bsc", "b.tech", "b.e.", "b.s.", "bba"]),
            ("Associate Degree", ["associate degree", "associate of"]),
        ]
        
        for name, keywords in degrees:
            for kw in keywords:
                if kw in text_lower:
                    # Find some context
                    idx = text_lower.find(kw)
                    start = max(0, idx - 10)
                    end = min(len(text), idx + 50)
                    context = text[start:end].replace("\n", " ").strip()
                    # Capitalize first letters
                    return f"{name} ({context[:40]}...)" if len(context) > 40 else name
                    
        return "Bachelor's Degree (Estimated)"

    @classmethod
    def parse_all(cls, text: str, job_desc: str) -> Dict[str, Any]:
        skills = cls.extract_skills(text)
        exp = cls.extract_experience_details(text)
        edu = cls.extract_education(text)
        name = cls.extract_name(text)
        email = cls.extract_email(text)
        phone = cls.extract_phone(text)
        
        # Generate 2-sentence verdict summary
        top_skills = ", ".join(skills[:4]) if skills else "relevant skills"
        jd_keywords = [w.lower() for w in job_desc.split() if len(w) > 4][:10]
        missing_skills = [s for s in ["React", "FastAPI", "Python", "Docker", "SQL", "Cloud"] if s not in skills]
        
        summary = f"Candidate {name} demonstrates key expertise in {top_skills} with {exp['years']} years of professional experience."
        if missing_skills:
            summary += f" Areas of growth relative to this role include expertise in {', '.join(missing_skills[:2])}."
        else:
            summary += f" Profile shows strong alignment with the technical requirements listed in the job description."
            
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "experience": exp,
            "education": edu,
            "summary": summary
        }

class LLMExtractionService:
    OLLAMA_URL = "http://localhost:11434/api/chat"

    @classmethod
    def is_ollama_available(cls) -> bool:
        try:
            # Send a quick check to see if Ollama is running
            response = requests.get("http://localhost:11434/", timeout=1.5)
            return response.status_code == 200
        except Exception:
            return False

    @classmethod
    def extract_candidate_data(cls, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Coordinates candidate details extraction. Tries Ollama first, falls back to RuleBasedExtractor.
        """
        if cls.is_ollama_available():
            try:
                # System prompt for structured JSON extraction
                system_prompt = (
                    "You are a structured resume extraction engine. Analyze the resume text against the provided job description. "
                    "Extract the details into a single valid JSON object. Do not include any formatting text, markdown block codes, or explanations. "
                    "You MUST reply with ONLY a raw JSON block matching this structure:\n"
                    "{\n"
                    '  "name": "Candidate Full Name (or Unknown)",\n'
                    '  "email": "email@example.com (or null)",\n'
                    '  "phone": "+1234567890 (or null)",\n'
                    '  "skills": ["Skill1", "Skill2", "Skill3"],\n'
                    '  "experience": {\n'
                    '    "years": 5.5,\n'
                    '    "roles": ["Software Engineer", "Lead Developer"],\n'
                    '    "companies": ["Google", "Stripe"]\n'
                    '  },\n'
                    '  "education": "Degree Name, Major, University (or null)",\n'
                    '  "summary": "Exactly a 2-sentence summary evaluating strengths and gaps of the candidate in relation to the job description."\n'
                    "}"
                )

                user_prompt = f"JOB DESCRIPTION:\n{job_description}\n\nRESUME TEXT:\n{resume_text}"

                payload = {
                    "model": "mistral",  # Default model, Ollama will map or fallback if another model is loaded
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": 0.1
                    },
                    "format": "json"
                }

                # Try sending the request
                response = requests.post(cls.OLLAMA_URL, json=payload, timeout=8.0)
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("message", {}).get("content", "")
                    data = json.loads(content)
                    
                    # Validate basic fields are present, otherwise fill defaults
                    if "name" in data and "skills" in data and "experience" in data:
                        # Clean experience structure
                        exp = data["experience"]
                        if not isinstance(exp, dict):
                            exp = {"years": 1.0, "roles": [], "companies": []}
                        else:
                            exp["years"] = float(exp.get("years", 1.0))
                            exp["roles"] = list(exp.get("roles", []))
                            exp["companies"] = list(exp.get("companies", []))
                        data["experience"] = exp
                        data["skills"] = list(data.get("skills", []))
                        
                        # Add a marker that it used LLM
                        data["parsed_by"] = "Ollama LLM"
                        return data
            except Exception as e:
                # Catch JSON parse or HTTP errors and log, then fallback
                print(f"Ollama extraction failed: {str(e)}. Falling back to NLP rules.")
        
        # Fallback to local rule-based extractor
        data = RuleBasedExtractor.parse_all(resume_text, job_description)
        data["parsed_by"] = "Local NLP Fallback"
        return data
