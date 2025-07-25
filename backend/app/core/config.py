from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Frontend Config
    FRONTEND_URL: str

    # Azure OpenAI Config
    AZURE_API_VERSION: str
    AZURE_ENDPOINT: str
    AZURE_API_KEY: str
    AZURE_DEPLOYMENT_NAME: str

    # Qdrant Config
    QDRANT_URL: str

    class Config:
        env_file = ".env"
        cache_on_load = False


settings = Settings()
