try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = "sqlite:///./wordmatch.db"
    static_dir: Path = Path(__file__).parent.parent / "static"


settings = Settings()