from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Frontend Config
    FRONTEND_URL: str

    # LLM Provider
    PROVIDER: str

    # Azure OpenAI Config
    AZURE_API_VERSION: str
    AZURE_ENDPOINT: str
    AZURE_API_KEY: str
    AZURE_DEPLOYMENT_NAME: str
    AZURE_EMBEDDING_DEPLOYMENT_NAME: str

    # Qdrant Config
    QDRANT_URL: str
    QDRANT_COLLECTION_NAME: str

    # Langfuse Config
    LANGFUSE_SECRET_KEY: str
    LANGFUSE_PUBLIC_KEY: str
    LANGFUSE_HOST: str

    class Config:
        env_file = ".env"
        cache_on_load = False


settings = Settings()
