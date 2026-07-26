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

# Plausible exam-year window. Used to tell a real year apart from a
# 4-digit syllabus/subject code (e.g. 9188, 6030, 9709) which can
# otherwise look identical to a year at a glance.
YEAR_MIN = 1990
YEAR_MAX = 2035

# Tokens that explicitly say "what follows is a paper number"
PAPER_KEYWORDS = {'paper', 'ppr', 'pp', 'p', 'qp'}

# Fused session+paper shorthand, e.g. "np3" -> Nov Paper 3, "jp1" -> June Paper 1
COMPOUND_SESSION_PAPER = re.compile(r'^[jn]p$')


# ==========================================
# TOKENIZATION
# ==========================================

def _tokenize(raw_filename: str) -> List[str]:
    """
    Turns a chaotic filename into a clean list of lowercase word/number
    tokens. Separates glued letter-digit boundaries first (so "p2",
    "2physics", "9188-2PHYSICS", "paper_1Suggested" all become cleanly
    separable tokens), then collapses every separator style into spaces.
    """
    name = raw_filename.rsplit(".", 1)[0].lower().strip()

    # Insert a boundary wherever a digit and a letter are glued together
    # in either direction. This is what makes "9188-2physics" -> "9188 2 physics"
    # and "paper_1Suggested" -> "paper 1 suggested" work correctly.
    name = re.sub(r'(\d)([a-z])', r'\1 \2', name)
    name = re.sub(r'([a-z])(\d)', r'\1 \2', name)

    # Collapse every separator style (space, underscore, hyphen, period,
    # hash, parentheses, apostrophe) into a single space.
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
    # e.g. "paper 2", "ppr 1", "p 11", "qp 1"
    for i, tok in enumerate(tokens[:-1]):
        if tok in PAPER_KEYWORDS and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 2: fused session+paper token, e.g. "np 3" (Nov Paper 3), "jp 1"
    for i, tok in enumerate(tokens[:-1]):
        if COMPOUND_SESSION_PAPER.fullmatch(tok) and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 3: syllabus-code-adjacent number, e.g. "9188 2" or "6030 02"
    # (4-digit code, immediately followed by the paper number, with no
    # explicit "paper" keyword anywhere). The code itself is excluded from
    # being mistaken for a year via the year_set check.
    for i, tok in enumerate(tokens[:-1]):
        if re.fullmatch(r'\d{4}', tok) and tok not in year_set and re.fullmatch(r'\d{1,2}', tokens[i + 1]):
            return tokens[i + 1], 'high'

    # Priority 4 (fallback, low confidence): first remaining standalone
    # 1-2 digit token that isn't a year. Flagged low-confidence so the
    # sync log can route it for a quick human glance.
    for tok in tokens:
        if re.fullmatch(r'\d{1,2}', tok):
            return tok, 'low'

    return None, 'none'


def _normalize_paper_digit(raw_paper_number: str) -> Optional[str]:
    """
    Defensively extracts a clean paper digit from whatever shape a caller
    hands in — "1", "01", "P1", "Paper 1", "11" all resolve correctly.
    This exists so build_clean_names() never has to trust a caller's exact
    formatting; the cascade in clean_and_parse_filename() already produces
    a bare digit string, but a human-selected dropdown value elsewhere in
    the platform may not.
    """
    if not raw_paper_number:
        return None
    match = re.search(r'\d{1,2}', str(raw_paper_number))
    if not match:
        return None
    return str(int(match.group()))  # drop any leading zero


def build_clean_names(level_name: str, subject_name: str, year: Any,
                       session: str, paper_number: str,
                       is_marking_scheme: bool = False) -> Optional[Dict[str, str]]:
    """
    The single source of truth for turning already-known structured fields
    into the platform's canonical naming convention. Used by:
      - clean_and_parse_filename() — after its detection cascade has
        guessed a paper number from a messy raw filename
      - the dashboard upload endpoint — where level/subject/year/session/
        paper_number are all directly human-selected, with no detection
        needed at all

    Returns None if no paper number could be resolved from the input.
    Both callers MUST go through this function rather than re-implementing
    the token assembly — that duplication is exactly how the sync engine
    and the dashboard upload path would silently drift apart over time.
    """
    paper_digit = _normalize_paper_digit(paper_number)
    if not paper_digit:
        return None

    short_level   = LEVEL_SHORT_MAP.get(level_name or "Unknown", (level_name or "Unknown").replace(" ", ""))
    short_subject = STUDENT_SHORT_MAP.get(subject_name or "Unknown", (subject_name or "Unknown")[:5].strip().capitalize())
    short_session = SESSION_SHORT_MAP.get((session or "June").capitalize(), (session or "June")[:3].capitalize())

    # One canonical name — the database title IS the Drive filename (minus
    # the .pdf extension). No two-format split, no drift possible.
    canonical_name = f"{short_level} {short_subject} {year} {short_session} P{paper_digit}"
    if is_marking_scheme:
        canonical_name += " MS"

    return {
        "title":         canonical_name,           # saved to Resource.title
        "drive_filename": f"{canonical_name}.pdf", # uploaded/renamed on Drive
        "paper_number":  f"Paper {paper_digit}",   # saved to Question_Paper.paper_number
    }


# ==========================================
# MAIN ENTRY POINT
# ==========================================

def clean_and_parse_filename(raw_filename: str, folder_metadata: dict) -> Dict[str, Any]:
    """
    Takes a chaotic filename and the trusted database folder_metadata
    (level/subject/year/session) and returns structured database titles
    and mobile filenames.

    IMPORTANT CHANGE FROM THE ORIGINAL VERSION: this always returns a
    dict, never None. Check result["status"]:
      - "ok"            -> proceed with ingestion, all fields populated
      - "needs_review"  -> do NOT auto-ingest; log result["reason"] and
                            result["original_filename"] via sync_log so
                            an admin can resolve it manually
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

    # Guard: two or more distinct plausible years anywhere in the filename
    # strongly signals a multi-year compilation (e.g. "2018-2024 Geo Paper 2").
    # The folder year is ground truth, but a bundled file covers multiple years
    # by definition so no single folder year can correctly describe it.
    if len(set(year_values)) >= 2:
        return _rejected("multiple years detected in filename (possible multi-year compilation)")

    paper_digit, confidence = _detect_paper_number(tokens, year_values)
    if not paper_digit:
        return _rejected("no paper number could be detected")

    # Normalize leading zeros ("02" -> "2") while preserving genuine
    # multi-digit Cambridge variant codes ("11", "21", "32" stay as-is)
    paper_digit = str(int(paper_digit))

    # All five structural fields come from folder_metadata — the folder is
    # the human's deliberate decision and is always trusted over the filename.
    # The filename's only job is to supply the paper number, which is the one
    # field not derivable from folder structure alone.
    full_subject = folder_metadata.get("subject_name", "Unknown")
    full_level   = folder_metadata.get("level_name", "Unknown")
    full_session = folder_metadata.get("session", "June")
    year         = folder_metadata.get("year", "YYYY")
    is_ms        = folder_metadata.get("is_marking_scheme", False)

    names = build_clean_names(full_level, full_subject, year, full_session, paper_digit, is_ms)
    # names cannot be None here — paper_digit was already validated above

    return {
        "status":            "ok",
        "reason":            None,
        "original_filename": original,
        "title":             names["title"],
        "drive_filename":    names["drive_filename"],
        "paper_number":      names["paper_number"],
        "confidence":        confidence,
    }