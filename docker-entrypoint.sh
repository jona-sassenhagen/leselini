#!/usr/bin/env sh
# Entry point to auto-load the built-in word set and start the FastAPI server.
# If 'my_set.yaml' exists in /app, run the CLI loader before launching Uvicorn.
if [ -f "/app/my_set.yaml" ]; then
  echo "==> Loading default word set from /app/my_set.yaml"
  # Diagnostics: list images directory and verify YAML before loading
  echo "=== DEBUG: raw listing /app/images (non-printable escapes) ==="
  ls -lab /app/images || true
  echo "=== DEBUG: raw listing /app/my_set.yaml ==="
  ls -laQ /app/my_set.yaml || true
  echo "=== DEBUG: raw listing /app directory ==="
  ls -labC /app || true
  echo "=== DEBUG: raw listing /app/static directory ==="
  ls -labC /app/static || true
  python /app/cli/words.py /app/my_set.yaml
fi
exec uvicorn app_backend.main:app --host 0.0.0.0 --port 8000