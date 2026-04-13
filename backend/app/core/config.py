from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Joyida"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # DATABASE_URL: str = "postgresql://user:password@localhost/joyida"
    DATABASE_URL: str = "sqlite:///./joyida.db"
    
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
