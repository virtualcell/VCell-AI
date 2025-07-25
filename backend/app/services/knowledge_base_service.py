from app.core.config import settings
from app.core.singleton import get_openai_client
from langchain.text_splitter import RecursiveCharacterTextSplitter

openai_client = get_openai_client()


def embed_text(text: str):
    """
    Embed a text string using Azure OpenAI.

    Args:
        text (str): The text to embed.
    """
    response = openai_client.embeddings.create(
        input=text, model=settings.AZURE_EMBEDDING_DEPLOYMENT_NAME
    )
    return response.data[0].embedding


def chunk_text(text: str):
    """
    Chunk a text string into smaller chunks using LangChain RecursiveCharacterTextSplitter.
    The chunk size is 1000 characters and the overlap is 200 characters.

    Args:
        text (str): The text to chunk.
    """
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    return text_splitter.split_text(text)


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
