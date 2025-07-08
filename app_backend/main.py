from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import uuid4
from datetime import datetime
from typing import List, Optional

from .settings import settings
from .db import SessionLocal, engine
from .models import Base, WordSet, WordEntry, TrialResult
from .utils import levenshtein
from pydantic import BaseModel, ConfigDict

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static", StaticFiles(directory=str(settings.static_dir)), name="static"
)

# Serve the raw images directory under /images for dynamic games
app.mount(
    "/images", StaticFiles(directory=str(settings.static_dir.parent / "images")), name="images"
)


class WordSetMetadata(BaseModel):
    id: str
    title: str
    model_config = ConfigDict(from_attributes=True)


class WordSetWithStats(WordSetMetadata):
    best: int


class NextEntry(BaseModel):
    id: str
    image_path: str
    choices: List[str]
    correct_index: int


class NextImageEntry(BaseModel):
    id: str
    word: str
    image_choices: List[str]
    correct_index: int


class TrialCreate(BaseModel):
    wordset_id: str
    correct: int


class TrialResponse(BaseModel):
    id: str
    wordset_id: str
    correct: int
    answered_at: datetime


class StatsResponse(BaseModel):
    best: int
    total: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/wordsets", response_model=List[WordSetWithStats])
def list_wordsets(db: Session = Depends(get_db)):
    # Get all sets from the DB
    db_sets = db.query(WordSet).all()

    # Get all trial results and group by wordset_id to find the max score
    stats_query = (
        db.query(
            TrialResult.wordset_id,
            func.max(TrialResult.correct).label("best_score"),
        )
        .group_by(TrialResult.wordset_id)
        .all()
    )
    
    # Create a dictionary for quick lookup of best scores
    best_scores = {wordset_id: best_score for wordset_id, best_score in stats_query}

    # Prepare the response list
    response_sets = []

    # Add dynamic sets
    response_sets.append(
        WordSetWithStats(
            id="dynamic",
            title="All Images",
            best=best_scores.get("dynamic", 0),
        )
    )
    response_sets.append(
        WordSetWithStats(
            id="dynamic-easy",
            title="All Images (Easy)",
            best=best_scores.get("dynamic-easy", 0),
        )
    )
    response_sets.append(
        WordSetWithStats(
            id="dynamic-images",
            title="Image Match",
            best=best_scores.get("dynamic-images", 0),
        )
    )
    response_sets.append(
        WordSetWithStats(
            id="dynamic-images-easy",
            title="Image Match (Easy)",
            best=best_scores.get("dynamic-images-easy", 0),
        )
    )
    # Add sets from the database

    return response_sets


@app.get("/api/wordsets/{wordset_id}/next", response_model=List[NextEntry])
def get_next(
    wordset_id: str,
    size: int = Query(5, ge=1),
    max_len: Optional[int] = None,
    lev: Optional[int] = None,
    db: Session = Depends(get_db),
):
    # Dynamic mode: scan static/images directory for all image files
    if wordset_id.startswith('dynamic'):
        import random

        img_dir = settings.static_dir.parent / 'images'
        try:
            files = [p for p in img_dir.iterdir() if p.is_file() and p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
        except Exception:
            raise HTTPException(status_code=500, detail='Could not read images folder')
        # derive valid words (stem) filtered by max word length
        max_len_filter = max_len if max_len is not None else None
        words = [(p.name, p.stem) for p in files if (max_len_filter is None or len(p.stem) <= max_len_filter)]
        total = len(words)
        if total == 0:
            raise HTTPException(status_code=404, detail='No images available')
        n = size if size <= total else total
        selected = random.sample(words, n)
        batch: List[NextEntry] = []
        for fname, stem in selected:
            # pick up to 3 distractors from remaining words
            pool = [w for f, w in words if w != stem]
            random.shuffle(pool)
            num_distractors = 1 if wordset_id == 'dynamic-easy' else 3
            distractors = pool[:num_distractors]
            choices = distractors + [stem]
            random.shuffle(choices)
            batch.append(
                NextEntry(
                    id=stem,
                    image_path=f"/images/{fname}",
                    choices=choices,
                    correct_index=choices.index(stem),
                )
            )
        return batch

    # Existing WordSet-backed logic (legacy)
    ws = db.query(WordSet).filter(WordSet.id == wordset_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="WordSet not found")
    entries = db.query(WordEntry).filter(WordEntry.wordset_id == wordset_id).all()
    if not entries:
        raise HTTPException(status_code=404, detail="No entries for WordSet")
    import random

    total = len(entries)
    if size > total:
        size = total
    selected = random.sample(entries, size)
    max_word_length = max_len if max_len is not None else ws.max_word_length
    batch: List[NextEntry] = []
    for entry in selected:
        original = entry.distractors or []
        filt = [d for d in original if max_word_length is None or len(d) <= max_word_length]
        desired = len(original)
        if len(filt) < desired:
            pool = [e.correct_word for e in entries if e.correct_word != entry.correct_word and e.correct_word not in filt]
            random.shuffle(pool)
            filt.extend(pool[: desired - len(filt)])
        choices = filt + [entry.correct_word]
        random.shuffle(choices)
        batch.append(
            NextEntry(
                id=entry.id,
                image_path=f"/static/{entry.image_path}",
                choices=choices,
                correct_index=choices.index(entry.correct_word),
            )
        )
    return batch


@app.get("/api/wordsets/{wordset_id}/next-images", response_model=List[NextImageEntry])
def get_next_images(
    wordset_id: str,
    size: int = Query(5, ge=1),
    max_len: Optional[int] = None,
    db: Session = Depends(get_db),
):
    # Only dynamic-images is supported for image-match
    if not wordset_id.startswith('dynamic-images'):
        raise HTTPException(status_code=404, detail='ImageMatch not available for this set')
    # Dynamic image-match: pick a word and 4 image choices
    import random
    img_dir = settings.static_dir.parent / 'images'
    try:
        files = [p for p in img_dir.iterdir() if p.is_file() and p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    except Exception:
        raise HTTPException(status_code=500, detail='Could not read images folder')
    # derive valid words (stem) filtered by max word length
    max_len_filter = max_len if max_len is not None else None
    items = [(p.name, p.stem) for p in files if max_len_filter is None or len(p.stem) <= max_len_filter]
    total = len(items)
    if total == 0:
        raise HTTPException(status_code=404, detail='No images available for image-match')
    n = size if size <= total else total
    selected = random.sample(items, n)
    batch: List[NextImageEntry] = []
    for fname, stem in selected:
        pool = [f for f, w in items if w != stem]
        random.shuffle(pool)
        num_distractors = 1 if wordset_id == 'dynamic-images-easy' else 3
        choices = pool[:num_distractors] + [fname]
        random.shuffle(choices)
        batch.append(
            NextImageEntry(
                id=stem,
                word=stem,
                image_choices=[f"/images/{f}" for f in choices],
                correct_index=choices.index(fname),
            )
        )
    return batch


@app.post("/api/trials", response_model=TrialResponse)
def create_trial(trial: TrialCreate, db: Session = Depends(get_db)):
    print(f"Received trial data: wordset_id={trial.wordset_id}, correct={trial.correct}")
    try:
        tr = TrialResult(
            id=str(uuid4()),
            wordset_id=trial.wordset_id,
            correct=trial.correct,
            answered_at=datetime.utcnow(),
        )
        db.add(tr)
        db.commit()
        db.refresh(tr)
        print(f"Successfully added trial result: {tr.id}")
        return tr
    except Exception as e:
        db.rollback()
        print(f"Error adding trial result: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record trial: {e}")


@app.get("/api/stats/{wordset_id}", response_model=StatsResponse)
def get_stats(wordset_id: str, db: Session = Depends(get_db)):
    results = db.query(TrialResult).filter(TrialResult.wordset_id == wordset_id).all()
    total = len(results)
    best = max((r.correct for r in results), default=0)
    return StatsResponse(best=best, total=total)