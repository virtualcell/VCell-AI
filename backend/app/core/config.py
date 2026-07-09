from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from decimal import Decimal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

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

    # Auth0 Config
    AUTH0_DOMAIN: Optional[str] = None
    AUTH0_AUDIENCE: Optional[str] = None

    # Supabase Config
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # LiteLLM Proxy Config
    LITELLM_URL: str = "http://litellm:4000"
    LITELLM_MASTER_KEY: Optional[str] = None
    DEFAULT_USER_BUDGET: Decimal = Decimal("10.00")
    DEFAULT_BUDGET_DURATION: str = "30d"


settings = Settings()
