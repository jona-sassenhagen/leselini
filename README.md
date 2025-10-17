# Kids Word-Match App

## Setup

### CLI & Backend (Docker)
You can run the loader CLI and FastAPI entirely in Docker via Compose:
```bash
# Build images and start backend + frontend (auto-loads my_set.yaml)
docker-compose up --build
```

### Dynamic All-Images Game (Static)

Any image files you place in the repo’s top-level `images/` folder (jpg, jpeg, png, webp) are bundled into the quizzes at build time—no loader or YAML change needed. When you start the dev server or run a production build, the images are copied into `frontend/public/images` and a manifest (`frontend/src/data/images-manifest.json`) is regenerated automatically.

The landing page cards "All Images" and "Image Match" launch their respective quizzes. Scores are stored locally in the browser (`localStorage`).

### Frontend (development)
```bash
cd frontend
npm install
npm run dev
```

The dev server runs a sync step that copies `../images` into `frontend/public/images` and regenerates `frontend/src/data/images-manifest.json`. To refresh the manifest manually (without restarting the dev server), run:

```bash
npm run generate:manifest
```

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

## Production (Docker)
```bash
docker-compose up --build
```

## Deployment (GitHub Pages)
- Push the repository to GitHub with the `main` branch as the default branch.
- In the repo settings under Pages, choose "GitHub Actions" as the deployment source.
- The included workflow (`.github/workflows/deploy.yml`) builds the frontend and publishes the `dist` folder to GitHub Pages on every push to `main`.
- Once the workflow finishes, the site is available at `https://<your-username>.github.io/<this-repo>/`.
- The site runs entirely as static content (no backend). Scores are stored per-browser via `localStorage`.
- If you later use a custom domain or a user-site repo (e.g. `username.github.io`), update `frontend/vite.config.js` to set `base` to `'/'` so assets resolve correctly.
