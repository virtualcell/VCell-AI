from openai import AsyncOpenAI

from app.core.config import settings


def get_litellm_client(virtual_key: str) -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=virtual_key,
        base_url=settings.LITELLM_URL,
    )
