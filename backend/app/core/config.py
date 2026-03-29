from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load environment variables from the local .env file
    # so the backend can run correctly during local development.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    FRONTEND_URL: str
    PROVIDER: str
    AZURE_API_VERSION: str
    AZURE_ENDPOINT: str
    AZURE_API_KEY: str
    AZURE_DEPLOYMENT_NAME: str
    AZURE_EMBEDDING_DEPLOYMENT_NAME: str
    QDRANT_URL: str
    QDRANT_COLLECTION_NAME: str
    LANGFUSE_SECRET_KEY: str
    LANGFUSE_PUBLIC_KEY: str
    LANGFUSE_HOST: str


# Create one shared settings object for the app
settings = Settings()