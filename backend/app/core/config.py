from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Joyida"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Use env var or dynamic path for sqlite
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:////home/joidauz/backend/joyida.db" if os.path.exists("/home/joidauz") 
        else f"sqlite:///{os.path.join(os.getcwd(), 'joyida.db')}"
    )
    
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
