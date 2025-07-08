PHONY: all build up down clean reset load-wordset

all: up

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

clean:
	rm -f wordmatch.db

reset:
	$(MAKE) clean
	$(MAKE) up

load-wordset:
	docker compose run --rm backend python cli/words.py my_set.yaml

app:
	docker compose up --build

