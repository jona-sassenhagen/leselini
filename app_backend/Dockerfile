FROM python:3.12-slim

WORKDIR /app
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y sqlite3

COPY my_set.yaml ./
COPY app_backend/ ./app_backend
RUN mkdir -p /app/data && chmod 777 /app/data
RUN python -m app_backend.init_db
COPY cli/ ./cli
COPY images/ ./images
COPY static/ ./static
COPY dev_plan.md ./

# auto-load the default word set on startup, then launch Uvicorn
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]