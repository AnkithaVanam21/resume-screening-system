skills_db = [
    "python",
    "java",
    "react",
    "node.js",
    "sql",
    "machine learning",
    "aws",
    "html",
    "css",
    "javascript"
]


def extract_skills(text):
    found_skills = []

    for skill in skills_db:
        if skill.lower() in text.lower():
            found_skills.append(skill)

    return found_skills


def calculate_score(jd_text, resume_text):

    jd_words = set(jd_text.lower().split())
    resume_words = set(resume_text.lower().split())

    common_words = jd_words.intersection(resume_words)

    similarity_score = 0

    if len(jd_words) > 0:
        similarity_score = (
            len(common_words) / len(jd_words)
        ) * 100

    jd_skills = extract_skills(jd_text)
    resume_skills = extract_skills(resume_text)

    matched_skills = list(set(jd_skills) & set(resume_skills))
    missing_skills = list(set(jd_skills) - set(resume_skills))

    skill_score = 0

    if len(jd_skills) > 0:
        skill_score = (
            len(matched_skills) / len(jd_skills)
        ) * 100

    final_score = round(
        (0.7 * similarity_score) + (0.3 * skill_score),
        2
    )

    return final_score, matched_skills, missing_skills