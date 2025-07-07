from .models import Base
from .db import engine, SessionLocal
from sqlalchemy import text

print("Attempting to create database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables creation attempt complete.")

# Optional: Verify connection and a simple query
try:
    db = SessionLocal()
    # Try to query a table to ensure it exists
    db.execute(text("SELECT 1 FROM word_sets LIMIT 1"))
    print("Successfully connected to the database and found word_sets table.")
except Exception as e:
    print(f"Error during database connection or table check: {e}")
finally:
    db.close()