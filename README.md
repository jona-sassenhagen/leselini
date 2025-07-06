# Kids Word-Match App

## Setup

### CLI & Backend (Docker)
You can run the loader CLI and FastAPI entirely in Docker via Compose:
```bash
# Build images and start backend + frontend (auto-loads my_set.yaml)
docker-compose up --build
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