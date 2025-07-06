# Kids Word-Match App

## Setup

### CLI & Backend (Docker)
You can run the loader CLI and FastAPI entirely in Docker via Compose:
```bash
# Build images and start backend + frontend (auto-loads my_set.yaml)
docker-compose up --build
```

### Dynamic All-Images Game

Any image files you place in the repo’s top-level `images/` folder (jpg, jpeg, png, webp) are auto-included in the "All Images" quiz—no loader or YAML change needed.

The landing page card "All Images" launches a random quiz; you can customize:
```text
/wordmatch/dynamic?size=10&max_len=6
```
Where:
- `size=N` → number of questions (default 5)
- `max_len=L` → max word length filter (ignore to disable)
```

### Frontend (development)
```bash
cd frontend
npm install
# Set VITE_API_BASE_URL to point at the backend (default http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000 npm run dev

## Feedback Icons

Place the feedback assets in `frontend/src/assets/feedback/` with these filenames:

- `correct.png` (success smiley)
- `wrong.png` (failure smiley)
- `neutral.png` (neutral smiley)

Example:
```bash
cp path/to/your/correct.png frontend/src/assets/feedback/
cp path/to/your/wrong.png frontend/src/assets/feedback/
cp path/to/your/neutral.png frontend/src/assets/feedback/
```
```

## Production (Docker)
```bash
docker-compose up --build
```