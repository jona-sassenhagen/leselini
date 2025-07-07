# Status Update

## Current State

This Kids Word-Match app now provides two fully dynamic game modes, legacy YAML-based word sets, localization, dark mode, and real-time feedback:

### Backend (FastAPI)
- **Dynamic WordMatch** (`/api/wordsets/dynamic/next`) scans `images/`, filters filenames by `max_len`, selects N items, uses 3 random filename-stems as distractors, and returns image-based questions.  
- **Dynamic ImageMatch** (`/api/wordsets/dynamic-images/next-images`) scans `images/`, picks N items, then for each word shows 4 image choices (3 random + correct) for an image-selection quiz.  
- **Legacy WordSet loader** via CLI (`words load my_set.yaml`) populates a SQLite DB and copies images into `static/sets/{uuid}/`.  
- Standard CRUD endpoints:
  - `GET /api/wordsets`: list all WordSets plus two dynamic cards.
  - `GET /api/wordsets/{id}/next`: WordMatch batch for static sets.
  - `GET /api/wordsets/{id}/next-images`: ImageMatch batch (dynamic-images only).
  - `POST /api/trials`: record a trial result.
  - `GET /api/stats/{id}`: retrieve best & total scores.
- Static files served under `/static/sets/...` (WordSets) and `/images/...` (dynamic quizzes).

### Frontend (React + Vite)
- **Landing**: shows an AppCard grid of:
  - Dynamic cards: "All Images" (WordMatch) and "Image Match".
  - User-defined WordSets from the database.
- **WordMatch** (`/wordmatch/:id`): show one image + multiple-choice words, with:
  - Error counter (red tally).
  - Smiley feedback (correct/neutral/wrong) from feedback assets.
  - Bottom progress bar filling per question.
- **ImageMatch** (`/imagematch/:id`): show one target word + multiple images, with the same error counter, smiley feedback, and progress bar.
- **Localization**: English/German support via `react-i18next`, auto-detected by browser.
- **Dark Mode**: CSS variables and `prefers-color-scheme` media query switch the theme automatically.

## How It All Connects

```
  images/                  # raw image assets (jpg/png/webp)
  my_set.yaml              # example YAML for legacy CLI loader

  cli/words.py             # loader: parses YAML, writes DB rows, copies images to static/sets/{uuid}/

  app_backend/             # FastAPI backend
    main.py                # application routes and dynamic/legacy quiz logic
    models.py              # SQLAlchemy models for WordSet/WordEntry/TrialResult
    settings.py            # static_dir pointing at static/
    db.py                  # database session

  static/sets/{uuid}/      # per-set image folders for legacy WordSets

  frontend/                # React app (Vite)
    src/
      i18n.js              # i18next initialization
      locales/             # translation JSON for en/de
      utils/fetcher.js     # base API fetcher + API_BASE
      pages/
        Landing.jsx        # game selection grid
        WordMatch.jsx      # image→word quiz
        ImageMatch.jsx     # word→image quiz
      components/
        AppCard.jsx        # card UI for both dynamic & static sets
      assets/feedback/      # correct.png, wrong.png, neutral.png
      index.css             # global CSS variables & dark mode
    App.jsx                # React Router config for both games
    vite.config.js         # Vite config

```

## Next Steps / To-Do

- **UI polish**: refine button states, feedback transitions, and responsive layouts.
- **User override**: add manual toggles for dark mode and language selection.
- **Persistence**: migrate from SQLite to PostgreSQL for multi-user support.
- **Authentication**: optional light auth to track multiple users or high scores.
- **Testing**: add unit/integration tests for backend endpoints and component tests on React.
- **CI/CD**: configure GitHub Actions for linting, testing, and Docker image publishing.
- **Accessibility**: audit for keyboard navigation and screen-reader friendliness.

---

*Status generated on* `$(date)`