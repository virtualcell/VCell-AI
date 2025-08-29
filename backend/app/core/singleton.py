from langfuse.openai import AzureOpenAI, OpenAI
from qdrant_client import QdrantClient
from app.core.config import settings

openai_client = None
qdrant_client = None


# OpenAI
def connect_openai():
    global openai_client
    if openai_client is None:
        if settings.PROVIDER == "azure":
            openai_client = AzureOpenAI(
                api_key=settings.AZURE_API_KEY,
                api_version=settings.AZURE_API_VERSION,
                azure_endpoint=settings.AZURE_ENDPOINT,
            )
        else:
            ## THIS IS FOR LOCAL LLM ONLY
            openai_client = OpenAI(
                api_key=settings.AZURE_API_KEY,
                azure_endpoint=settings.AZURE_ENDPOINT,
            )
    return openai_client


def get_openai_client():
    connect_openai()
    openai = openai_client
    return openai


def connect_qdrant():
    global qdrant_client
    if qdrant_client is None:
        qdrant_client = QdrantClient(url=settings.QDRANT_URL)
    return qdrant_client


def get_qdrant_client():
    connect_qdrant()
    qdrant = qdrant_client
    return qdrant
