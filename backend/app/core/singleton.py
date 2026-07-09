from openai import AzureOpenAI, OpenAI
from qdrant_client import QdrantClient
from app.core.config import settings
from supabase import Client, create_client

embeddings_client = None
qdrant_client = None
supabase_client = None


# Embeddings / document extraction client
def connect_embeddings_client():
    global embeddings_client
    if embeddings_client is None:
        if settings.PROVIDER == "azure":
            embeddings_client = AzureOpenAI(
                api_key=settings.AZURE_API_KEY,
                api_version=settings.AZURE_API_VERSION,
                azure_endpoint=settings.AZURE_ENDPOINT,
            )
        else:
            ## THIS IS FOR LOCAL LLM ONLY
            embeddings_client = OpenAI(
                api_key=settings.AZURE_API_KEY,
                base_url=settings.AZURE_ENDPOINT,
                project=None,
                organization=None,
            )
    return embeddings_client


def get_embeddings_client():
    connect_embeddings_client()
    return embeddings_client


def connect_qdrant():
    global qdrant_client
    if qdrant_client is None:
        qdrant_client = QdrantClient(url=settings.QDRANT_URL)
    return qdrant_client


def get_qdrant_client():
    connect_qdrant()
    qdrant = qdrant_client
    return qdrant


def connect_supabase():
    global supabase_client
    if supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("Supabase configuration is missing")
        supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return supabase_client


def get_supabase_client() -> Client:
    connect_supabase()
    supabase = supabase_client
    return supabase
