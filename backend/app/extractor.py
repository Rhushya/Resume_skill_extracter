import pdfplumber, json, os, re
from groq import Groq
from io import BytesIO
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


SYSTEM_MSG = "You are a precise resume data extractor. Return ONLY valid JSON. No markdown, no extra text."

PROMPT_TEMPLATE = '''Extract structured data from the resume below.
Return ONLY a JSON object with these exact keys:
{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "languages_known": ["English"],
  "education": [{"degree":"","institution":"","year":"","score":""}],
  "experience": [{"role":"","company":"","duration":"","description":["point"]}],
  "projects": [{"name":"","tech_stack":[""],"description":""}],
  "certifications": [],
  "achievements": []
}

Resume:
'''

def extract_text_from_pdf(file_bytes: bytes) -> str:
    parts = []
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
    return "\n".join(parts)

def extract_resume_data(raw_text: str) -> dict:
    load_dotenv(find_dotenv())
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Add it to your .env file.")

    client = Groq(api_key=api_key)

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_MSG},
            {"role": "user",   "content": PROMPT_TEMPLATE + raw_text[:6000]}
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    text = completion.choices[0].message.content.strip()
    # Strip any accidental markdown fences
    text = re.sub(r"^```json\s*|^```\s*|\s*```$", "", text, flags=re.MULTILINE)

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            data = json.loads(m.group())
        else:
            raise ValueError("LLM did not return valid JSON.")

    defaults = {
        "name": "Unknown", "email": None, "phone": None, "location": None,
        "linkedin": None, "github": None, "summary": "",
        "skills": [], "languages_known": [], "education": [],
        "experience": [], "projects": [], "certifications": [], "achievements": []
    }
    for k, v in defaults.items():
        data.setdefault(k, v)
    return data
