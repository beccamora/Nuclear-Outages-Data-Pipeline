"""
Configuration with pydantic settings
- Load API key and URL from environment variable
"""

from pathlib import Path
from pydantic_settings import BaseSettings

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    # EIA API
    EIA_API_KEY: str
    EIA_BASE_URL: str
    EIA_ID: str = "nuclear-outages"

    page_size: int = 500
    max_retries: int = 3
    retry_delay: int = 2

    # STORAGE
    data_dir: Path = Path("data")
    outages_file: Path = Path("data/outages.parquet")
    yearly_file: Path = Path("data/yearly_outage.parquet")

    class Config:
        env_file = str(ENV_FILE)

settings = Settings()
