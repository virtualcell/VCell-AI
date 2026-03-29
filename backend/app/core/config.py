from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Frontend Config
    FRONTEND_URL: str = "http://localhost:5173"

    # LLM Provider
    PROVIDER: str = "azure"

    # Azure OpenAI Config
    AZURE_API_VERSION: str = "2023-05-15"
    AZURE_ENDPOINT: str = ""
    AZURE_API_KEY: str = ""
    AZURE_DEPLOYMENT_NAME: str = ""
    AZURE_EMBEDDING_DEPLOYMENT_NAME: str = ""

    # Qdrant Config
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION_NAME: str = "default_collection"

    # Langfuse Config
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_HOST: str = ""

settings = Settings()
