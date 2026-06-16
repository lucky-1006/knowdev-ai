import os
from pathlib import Path
from dotenv import load_dotenv

# Load variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    ENV_MODE: str = os.getenv("ENV_MODE", "development")
    
    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./knowdev.db")
    
    # JWT Auth settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "knowdev_secret_12345_dev")
    JWT_ALGORITHM: str = "HS256"
    
    # GitHub Access Token
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Qdrant configurations
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "memory")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    # AI Local Inference settings
    LOCAL_INFERENCE: bool = os.getenv("LOCAL_INFERENCE", "false").lower() == "true"
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "qwen2.5")
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./models/weights")

settings = Settings()
