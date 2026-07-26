
def clean_filename(name:str):
    name=name.replace(" ","_")
    common_bad_chars=[("#","_"),("!","_"),(":","_"),(";","_"),("=","_"),("+","_"),
                      ("\\","_"),("*",""),("/",""),("?","_"),("|","_"),('"',"")]
    for bad,good in common_bad_chars:
        name=name.replace(bad,good)
    safe="".join(c for c in name if c.isalnum or c in ("._-"))
    safe=safe.replace("__","_").replace("--","-").replace("..",".")
    while "--" in safe or "__" in safe or ".." in safe:
        safe=safe.replace("__","_")
        safe=safe.replace("..",".")
        safe=safe.replace("--",'-')
    safe=safe.strip("_-.")
    return safe if safe else "Unamed_file"

SUBJECT_IMOJIS={'mathematics':'📐','computer science':'💻','combined science':'🔬','physics':'⚛️','chemistry':'⚗️','mechanics':'⚙️',
               'biology':'🧬','principles of accounts':'💰','crop science':'🌱' ,'software engineering':'👨‍💻','statistics':'📊',
               'geography':'🌍','french':'FR','shona':'📚','history':'📜','english':'📖','literature in shona':'📕','ndebele':'🗣️',
               'heritage studies':'🏛️','literature in english':'📚','family and religious studies':'⛪','economics':'📊',
               'agriculture':'🌾','commerce':'💼' ,'business studies':'💼'
              }

#------------Subjects normaalization function ------------
SUBJCT_MAP={'maths':'Mathematics','math':'Mathematics','mathematics':'Mathematics',
            'computer':'Computer Science', 'computers':'Computer Science','computer science':'Computer Science',
            'science':'Combined Science','sciences':'Combined Science','combined science':'Combined Science',
            'accounts':'Principles of Accounts','accounting':'Principles of Accounts','Principles of Accounts':'Principles of Accounts','account':'Principles of Accounts',
            'heritage':'Heritage Studies','heritage studies':'Heritage Studies','chem':'Chemistry','chemistry':'Chemistry',
            'crop':'Crop Science','crop science':'Crop Science','phy':'Physics','phys':'Physics','physics':'Physics',
            'stats':'Statistics','statistics':'Statistics','bio':'Biology','biology':'Biology','agric':'Agriculture','agric':'Agriculture','agriculture':'Agriculture',
            'geo':'Geography','geography':'Geography','hist':'History','history':'History','eng':'English','english':'English',
            'lits':'Literature in English','literature in english':'Literature in English','frs':'Family and Religious Studies','family and religious studies':'Family and Religious Studies',
            'se':'Software Engineering','software engineering':'Software Engineering'
            }
def subject_nomalization(user_input):
    if not user_input:
        return None
    clean_userinput=user_input.lower().strip()
    return SUBJCT_MAP.get(clean_userinput,user_input.title())

# Used to convert full database subject strings into ultra-short mobile tokens
STUDENT_SHORT_MAP = {
    # Core Sciences & Tech
    'Mathematics': 'Maths',
    'Computer Science': 'CompSci',
    'Combined Science': 'Science',
    'Physics': 'Physics',
    'Chemistry': 'Chem',
    'Biology': 'Bio',
    
    # Commercials & Arts
    'Principles of Accounts': 'Accounts',
    'History': 'Hist',
    'Geography': 'Geo',
    'English': 'Eng',
    'Literature in English': 'Lit',
    
    # Practical & Vocations
    'Agriculture': 'Agric',
    'Crop Science': 'CropSci',
    'Software Engineering': 'SoftEng',
    'Statistics': 'Stats',
    
    # Social Sciences
    'Heritage Studies': 'Heritage',
    'Family and Religious Studies': 'FRS'
}
# Shortens the academic session months for compact storage view
SESSION_SHORT_MAP = {
    'June': 'Jun',
    'November': 'Nov'
}

# Standardizes and compresses the level names
LEVEL_SHORT_MAP = {
    'Ordinary Level': 'O-Level',
    'Advanced Level': 'A-Level',
    'Grade 7': 'Grade7'
}