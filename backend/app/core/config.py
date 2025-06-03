from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Frontend Config
    FRONTEND_URL: str

    class Config:
        env_file = ".env"
        cache_on_load = False


settings = Settings()
