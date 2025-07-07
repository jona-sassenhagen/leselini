#!/usr/bin/env sh
# Entry point to auto-load the built-in word set and start the FastAPI server.
# If 'my_set.yaml' exists in /app, run the CLI loader before launching Uvicorn.


# Initialize the database tables
echo "==> Initializing database tables"
python -m app_backend.init_db

exec uvicorn app_backend.main:app --host 0.0.0.0 --port 8000