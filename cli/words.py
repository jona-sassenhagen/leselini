#!/usr/bin/env python3
"""CLI loader for word sets via YAML files."""
import shutil
import uuid
from pathlib import Path

import typer
import yaml

from app_backend.settings import settings
from app_backend.db import SessionLocal, engine
from app_backend.models import Base, WordSet, WordEntry

def main(file: Path):
    """Load a wordset from the given YAML file."""
    if not file.exists():
        typer.echo(f"File {file} does not exist")
        raise typer.Exit(code=1)
    data = yaml.safe_load(file.read_text())
    title = data.get("title")
    if not title:
        typer.echo("YAML missing 'title'")
        raise typer.Exit(code=1)
    entries = data.get("entries", [])
    if not entries:
        typer.echo("YAML missing 'entries'")
        raise typer.Exit(code=1)
    diff = data.get("difficulty", {}) or {}
    max_word_length = diff.get("max_word_length")
    min_levenshtein = diff.get("min_levenshtein")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    wordset_id = str(uuid.uuid4())
    dest_dir = settings.static_dir / "sets" / wordset_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    ws = WordSet(
        id=wordset_id,
        title=title,
        max_word_length=max_word_length,
        min_levenshtein=min_levenshtein,
    )
    db.add(ws)
    # Diagnostic: print current working directory and available image files
    typer.echo(f"[DEBUG] cwd={Path.cwd()} file.parent={file.parent}")
    try:
        imgs = list((file.parent / 'images').iterdir())
    except Exception as ex:
        typer.echo(f"[DEBUG] cannot list images folder: {ex}")
    else:
        typer.echo(f"[DEBUG] images folder contains: {[i.name for i in imgs]}")
    for e in entries:
        img = e.get("img")
        src = file.parent / img
        typer.echo(f"[DEBUG] processing entry img={img!r} src={src} exists={src.exists()}")
        if not src.exists():
            typer.echo(f"Image file {src} does not exist")
            raise typer.Exit(code=1)
        dst = dest_dir / img
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(src, dst)
        entry = WordEntry(
            id=str(uuid.uuid4()),
            wordset_id=wordset_id,
            image_path=f"sets/{wordset_id}/{img}",
            correct_word=e.get("correct"),
            distractors=e.get("distractors", []),
        )
        db.add(entry)
    db.commit()
    typer.echo(
        f"Loaded wordset {wordset_id!r} '{title}' with {len(entries)} entries"
    )


if __name__ == "__main__":
    typer.run(main)