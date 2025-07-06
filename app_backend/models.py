from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class WordSet(Base):
    __tablename__ = "word_sets"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    max_word_length = Column(Integer, nullable=True)
    min_levenshtein = Column(Integer, nullable=True)

    entries = relationship(
        "WordEntry", back_populates="wordset", cascade="all, delete-orphan"
    )


class WordEntry(Base):
    __tablename__ = "word_entries"

    id = Column(String, primary_key=True, index=True)
    wordset_id = Column(String, ForeignKey("word_sets.id"), nullable=False)
    image_path = Column(String, nullable=False)
    correct_word = Column(String, nullable=False)
    distractors = Column(JSON, nullable=False)

    wordset = relationship("WordSet", back_populates="entries")


class TrialResult(Base):
    __tablename__ = "trial_results"

    id = Column(String, primary_key=True, index=True)
    wordset_id = Column(String, ForeignKey("word_sets.id"), nullable=False)
    correct = Column(Integer, nullable=False)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)