from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    database_url: Optional[str] = "sqlite:///./campocode_forge.db"
    
    # JWT settings
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS settings
    allowed_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    project_name: str = "CampoCode Forge"
    
    class Config:
        env_file = ".env"

settings = Settings()
