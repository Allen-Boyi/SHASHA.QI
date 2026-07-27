import re
from typing import Any, Dict, List, Optional, Tuple

# ==========================================
# CONSTANTS & SMART PHONE SHORT TOKENS ONLY
# ==========================================

STUDENT_SHORT_MAP = {
    # Core Sciences & Tech
    'Mathematics': 'Maths',
    'Additional Mathematics': 'AddMaths',
    'Pure Mathematics': 'PureMaths',
    'Computer Science': 'CompSci',
    'Combined Science': 'Science',
    'Physics': 'Physics',
    'Chemistry': 'Chem',
    'Biology': 'Bio',
    'Statistics': 'Stats',

    # Commercials & Arts
    'Principles of Accounts': 'Accounts',
    'Business and Enterprise Skills': 'Business',
    'Commerce': 'Commerce',
    'Commercial Studies': 'CommStudies',
    'Economics': 'Econ',
    'Economic History': 'EconHist',
    'History': 'Hist',
    'Geography': 'Geo',
    'English Language': 'Eng',
    'Literature in English': 'Lit',
    'Literature in Ndebele': 'LitNdebele',
    'Literature in Shona': 'LitShona',
    'Ndebele Language': 'Ndebele',
    'Shona Language': 'Shona',
    'Sociology': 'Sociology',
    'French': 'French',

    # Technical, Practical & Social Sciences
    'Agriculture': 'Agric',
    'Crop Science': 'CropSci',
    'Software Engineering': 'SoftEng',
    'Heritage Studies': 'Heritage',
    'Family and Religious Studies': 'FRS',
    'Building Technology and Design': 'BldgTech',
    'Design and Technology': 'DesignTech',
    'Food Technology and Design': 'FoodTech',
    'Home Management and Design': 'HomeMgmt',
    'Metal Technology and Design': 'MetalTech',
    'Technical Graphics and Design': 'TechGraphics',
    'Textile Technology and Design': 'Textiles',
    'Wood Technology and Design': 'WoodTech',
    'Art': 'Art',
    'Dance': 'Dance',
    'Musical Arts': 'Music',
    'Theatre Arts': 'Theatre',
    'Physical Education, Sport and Mass Displays': 'PE'
}

SESSION_SHORT_MAP = {
    'June': 'Jun',
    'November': 'Nov'
}

LEVEL_SHORT_MAP = {
    'Ordinary Level': 'OLevel',
    'Advanced Level': 'ALevel',
    'Grade 7': 'Grade7'
}

# ==========================================
# PARSING CONSTANTS
# ==========================================

YEAR_MIN = 1990
YEAR_MAX = 2035

# 🛡️ MAXIMUM ALLOWED PAPER NUMBER
MAX_PAPER_NUMBER = 5

PAPER_KEYWORDS = {'paper', 'ppr', 'pp', 'p', 'qp'}
COMPOUND_SESSION_PAPER = re.compile(r'^[jn]p$')


# ==========================================
# TOKENIZATION
# ==========================================

def _tokenize(raw_filename: str) -> List[str]:
    """
    Turns a chaotic filename into a clean list of lowercase word/number
    tokens.
    """
    name = raw_filename.rsplit(".", 1)[0].lower().strip()

    name = re.sub(r'(\d)([a-z])', r'\1 \2', name)
    name = re.sub(r'([a-z])(\d)', r'\1 \2', name)

    name = re.sub(r"[\s_#\-\.\(\)']+", ' ', name).strip()

    return name.split()


def _extract_year_values(tokens: List[str]) -> List[int]:
    """Returns every 4-digit token that falls in a plausible exam-year range."""
    years = []
    for tok in tokens:
        if re.fullmatch(r'\d{4}', tok):
            val = int(tok)
            if YEAR_MIN <= val <= YEAR_MAX:
                years.append(val)
    return years


# ==========================================
# PAPER NUMBER RESOLUTION (priority cascade)
# ==========================================

def _detect_paper_number(tokens: List[str], year_values: List[int]) -> Tuple[Optional[str], str]:
    """
    Resolves the paper number using the most confident available signal,
    in order. Returns (paper_digit_string, confidence) or (None, 'none').
    """
    year_set = {str(y) for y in year_values}

    # Priority 1: explicit keyword immediately followed by a 1-2 digit number
    for i, tok in enumerate(tokens[:-1]):
        if tok in PAPER_KEYWORDS and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 2: fused session+paper token, e.g. "np 3", "jp 1"
    for i, tok in enumerate(tokens[:-1]):
        if COMPOUND_SESSION_PAPER.fullmatch(tok) and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 3: syllabus-code-adjacent number, e.g. "9188 2" or "6030 02"
    for i, tok in enumerate(tokens[:-1]):
        if re.fullmatch(r'\d{4}', tok) and tok not in year_set and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 4 (fallback, low confidence): first remaining standalone 1-2 digit token
    for tok in tokens:
        if re.fullmatch(r'\d{1,2}', tok):
            return tok, 'low'

    return None, 'none'


def _normalize_paper_digit(raw_paper_number: Any, max_paper: int = MAX_PAPER_NUMBER) -> Optional[str]:
    """
    Defensively extracts a clean paper digit.
    Caps any value > max_paper to max_paper (e.g., 7 -> 5).
    """
    if raw_paper_number is None:
        return None
        
    match = re.search(r'\d{1,2}', str(raw_paper_number))
    if not match:
        return None
        
    digit_val = int(match.group())

    # 🛡️ Cap at max_paper (e.g. Paper 7 -> 5)
    if digit_val > max_paper:
        digit_val = max_paper
    elif digit_val < 1:
        digit_val = 1

    return str(digit_val)


def build_clean_names(level_name: str, subject_name: str, year: Any,
                       session: str, paper_number: str,
                       is_marking_scheme: bool = False) -> Optional[Dict[str, str]]:
    """
    The single source of truth for turning already-known structured fields
    into the platform's canonical naming convention.
    """
    paper_digit = _normalize_paper_digit(paper_number)
    if not paper_digit:
        return None

    short_level   = LEVEL_SHORT_MAP.get(level_name or "Unknown", (level_name or "Unknown").replace(" ", ""))
    short_subject = STUDENT_SHORT_MAP.get(subject_name or "Unknown", (subject_name or "Unknown")[:5].strip().capitalize())
    short_session = SESSION_SHORT_MAP.get((session or "June").capitalize(), (session or "June")[:3].capitalize())

    canonical_name = f"{short_level} {short_subject} {year} {short_session} P{paper_digit}"
    if is_marking_scheme:
        canonical_name += " MS"

    return {
        "title":          canonical_name,           # saved to Resource.title
        "drive_filename": f"{canonical_name}.pdf", # uploaded/renamed on Drive
        "paper_number":   f"Paper {paper_digit}",   # saved to Question_Paper.paper_number
    }


# ==========================================
# MAIN ENTRY POINT
# ==========================================

def clean_and_parse_filename(raw_filename: str, folder_metadata: dict) -> Dict[str, Any]:
    """
    Takes a chaotic filename and folder_metadata and returns structured output.
    """
    original = raw_filename
    tokens = _tokenize(raw_filename)
    year_values = _extract_year_values(tokens)

    def _rejected(reason: str) -> Dict[str, Any]:
        return {
            "status":            "needs_review",
            "reason":            reason,
            "original_filename": original,
            "title":             None,
            "drive_filename":    None,
            "paper_number":      None,
            "confidence":        None,
        }

    if len(set(year_values)) >= 2:
        return _rejected("multiple years detected in filename (possible multi-year compilation)")

    paper_digit, confidence = _detect_paper_number(tokens, year_values)
    if not paper_digit:
        return _rejected("no paper number could be detected")

    # Normalize digit & cap to 5 max
    paper_digit = _normalize_paper_digit(paper_digit)

    full_subject = folder_metadata.get("subject_name", "Unknown")
    full_level   = folder_metadata.get("level_name", "Unknown")
    full_session = folder_metadata.get("session", "June")
    year         = folder_metadata.get("year", "YYYY")
    is_ms        = folder_metadata.get("is_marking_scheme", False)

    names = build_clean_names(full_level, full_subject, year, full_session, paper_digit, is_ms)

    return {
        "status":            "ok",
        "reason":            None,
        "original_filename": original,
        "title":             names["title"],
        "drive_filename":    names["drive_filename"],
        "paper_number":      names["paper_number"],
        "confidence":        confidence,
    }
