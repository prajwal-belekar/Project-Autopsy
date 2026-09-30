from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./project_autopsy.db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    REPOSITORY_WORKSPACE: str = ""
    LOG_LEVEL: str = "INFO"
    API_PREFIX: str = "/api"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_workspace_dir() -> str:
    if settings.REPOSITORY_WORKSPACE:
        return settings.REPOSITORY_WORKSPACE
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "workspace")