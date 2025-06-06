from openai import AzureOpenAI
from app.core.config import settings

openai_client = None

# OpenAI
def connect_openai():
    global openai_client
    if openai_client is None:
        openai_client = AzureOpenAI(
            api_key=settings.AZURE_API_KEY,
            api_version=settings.AZURE_API_VERSION,
            azure_endpoint=settings.AZURE_ENDPOINT,
        )
    return openai_client


def get_openai_client():
    connect_openai()
    openai = openai_client
    return openai