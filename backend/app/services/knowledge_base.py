from app.core.config import settings
from app.core.singleton import get_openai_client

openai_client = get_openai_client()

def embed_text(text: str):
    """
    Embed a text string using Azure OpenAI.

    Args:
        text (str): The text to embed.
    """
    response = openai_client.embeddings.create(
        input=text,
        model=settings.AZURE_EMBEDDING_DEPLOYMENT_NAME
    )
    return response.data[0].embedding

def chunk_text(text: str):
    raise NotImplementedError("Not implemented")



def get_knowledge_base_files(collection_name: str):
    raise NotImplementedError("Not implemented")

def upload_pdf_file(collection_name: str, file_name: str):
    raise NotImplementedError("Not implemented")

def upload_text_file(collection_name: str, file_name: str):
    raise NotImplementedError("Not implemented")

def delete_knowledge_base_file(collection_name: str, file_name: str):
    raise NotImplementedError("Not implemented")

def get_similar_chunks(collection_name: str, query: str, limit: int = 10):
    raise NotImplementedError("Not implemented")