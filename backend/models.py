from sqlalchemy import Column, Integer, String, Float
from database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    score = Column(Float)
    matched_skills = Column(String)
    missing_skills = Column(String)