# Development Plan – Kids Web App (Word-Match)

## 1. Purpose
Single-user web suite for a child. First release ships one game: **Word-Match**.

---

## 2. Tech stack

| Layer    | Choice                     | Reason                          |
|----------|----------------------------|---------------------------------|
| Backend  | **Python 3.12 + FastAPI**  | Async, type-safe, easy to deploy|
| DB       | **SQLite ± JSON columns**  | Zero setup, still ACID          |
| Frontend | **React 18** | Snappy dev cycle, touch-friendly|
| State    | REST (JSON) + *swr* on client | Simple, cache-aware           |
| Assets   | `/static/` by FastAPI      | Single-box deploy               |
| Auth     | None                       | Single local user               |

---

## 3. Domain model

```text
WordSet
 ├ id: uuid
 ├ title: str
 └ entries: [WordEntry]

WordEntry
 ├ image_path: str     # relative to /static/
 ├ correct_word: str
 └ distractors: [str]  # ≤4 other words

TrialResult
 ├ id: uuid
 ├ wordset_id: uuid
 ├ correct: int        # out of 5
 ├ answered_at: datetime

## 4. API surface

| Verb | Path                             | Payload / Query                 | Returns                       |
|------|----------------------------------|---------------------------------|-------------------------------|
| GET  | `/api/wordsets`                  | –                               | list WordSet (metadata only)  |
| GET  | `/api/wordsets/{id}/next?size=5&max_len=&lev=` | –                | 5 randomized entries          |
| POST | `/api/trials`                    | `{wordset_id, correct}`         | stored TrialResult            |
| GET  | `/api/stats/{wordset_id}`        | –                               | best score, total played      |

All JSON.

## 5. Frontend flows

### Landing
- Grid of **AppCard**s (only two for now).
- Each card shows 🏅 best score (like “4/5”) in a small progress ring.

### Word-Match
1. Fetch batch from `/next`.
2. Show image (max 80% viewport height).
3. Under it, 4-6 large buttons (min 48px tall).
4. On tap: flash green/red; overlay “✔ correct word was ____” if wrong.
5. Auto-advance after 750 ms.
6. Bottom progress bar fills 20% per solved item.
7. After 5th, POST result, navigate back.

### Image-Match
The same as Word-Match, but instead of matching one out of multiple strings to one image, we match
one out of multiple images to one string.

Use CSS grid + `touch-action: manipulation;` for smooth taps.

## 6. CLI configuration

title: "Animals – easy"
```bash
words load my_set.yaml
title: "Animals – easy"
entries:
  - img: images/cat.webp
    correct: cat
    distractors: [dog, cow, rat]
  - img: images/dog.webp
    correct: dog
    distractors: [cat, fox, wolf]
difficulty:
  max_word_length: 5
  min_levenshtein: 2
```

words load copies images to /static/sets/{uuid}/, writes rows to SQLite (legacy).

## 8. Dynamic All-Images Game

Any image in the root `images/` folder is auto-included in both dynamic quizzes—no CLI/YAML loader needed.

The landing page displays two dynamic cards:
- "All Images" → word-match dynamic quiz
- "Image Match" → image-match dynamic quiz

Use:
```
GET /api/wordsets/dynamic/next?size=N&max_len=L
```
- `size=N` → number of questions (default 5)
- `max_len=L` → max filename length filter (ignore to disable)
- 3 random distractors per question

## 7. Difficulty engine

- At batch-build pick distractors whose Levenshtein ≥ config, else pad with randoms.
- Filter exceeding `max_word_length`.
- Shuffle choices per challenge; track correct index.

---

## 8. File layout

proj/
 ├ app_backend/
 │   ├ main.py       # FastAPI app
 │   ├ db.py         # SQLAlchemy
 │   ├ models.py
 │   └ settings.py   # Pydantic
 ├ frontend/
 │   ├ index.html
 │   └ src/
 ├ cli/
 │   └ words.py
 ├ static/
 │   └ sets/...
 └ docker-compose.yml

---

## 9. Build & run

docker compose up --build     # prod
npm run dev                   # frontend hot reload
uvicorn backend.main:app --reload

---

## 10. Scalability levers (later)

- Swap SQLite → Postgres (SQLAlchemy stays).
- Move `static/` to S3 + CloudFront.
- JWT for multi-user if needed.
- WebSockets for live feedback.

---

**Ready to build.**

