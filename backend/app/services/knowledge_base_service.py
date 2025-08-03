import os
import uuid
from markitdown import MarkItDown
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.singleton import get_openai_client, get_qdrant_client
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.services.qdrant_service import (
    create_qdrant_collection,
    insert_qdrant_points,
    search_qdrant_points,
    delete_qdrant_documents,
)

openai_client = get_openai_client()
qdrant_client = get_qdrant_client()
markitdown_client = MarkItDown(llm_client=openai_client, model=settings.AZURE_DEPLOYMENT_NAME)

KB_COLLECTION_NAME = settings.QDRANT_COLLECTION_NAME


def create_knowledge_base_collection_if_not_exists():
    """
    Create a knowledge base collection in Qdrant if it does not exist.
    """
    try:
        # Check if collection exists
        collections = qdrant_client.get_collections()
        collection_names = [col.name for col in collections.collections]

        if KB_COLLECTION_NAME not in collection_names:
            # Create collection with 1536 dimensions (Azure OpenAI text-embedding-ada-002)
            result = create_qdrant_collection(
                collection_name=KB_COLLECTION_NAME, vector_size=1536, distance="cosine"
            )
            return {"status": "success", "message": result}
        else:
            return {
                "status": "success",
                "message": f"Collection {KB_COLLECTION_NAME} already exists.",
            }
    except Exception as e:
        return {"status": "error", "message": f"Error creating collection: {str(e)}"}


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
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1250, chunk_overlap=250)
    return text_splitter.split_text(text)


def get_knowledge_base_files(collection_name: str = KB_COLLECTION_NAME):
    """
    Get all files names from a collection in Qdrant.

    Args:
        collection_name (str): The name of the collection to get the files from.
    """
    try:
        # Get all points from the collection
        points = qdrant_client.scroll(
            collection_name=collection_name,
            limit=1000,  # Adjust as needed
            with_payload=True,
        )[0]

        # Extract unique file names from payloads
        file_names = set()
        for point in points:
            if point.payload and "file_name" in point.payload:
                file_names.add(point.payload["file_name"])

        return {"status": "success", "files": list(file_names)}
    except Exception as e:
        return {"status": "error", "message": f"Error getting files: {str(e)}"}


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file.

    Args:
        file_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the PDF.
    """
    try:
        result = markitdown_client.convert(file_path)
        return result.text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def upload_pdf_file(file_path: str, file_name: str = None):
    """
    Upload a PDF file to a collection in Qdrant.
    The file is converted to text and then chunked into smaller chunks.
    The chunks are then embedded and uploaded to the collection.

    Args:
        file_path (str): Path to the PDF file to upload.
        file_name (str): Name to use for the file in the collection. If None, uses the original filename.
    """
    try:
        # Ensure collection exists
        create_knowledge_base_collection_if_not_exists()

        # Use provided file_name or extract from path
        if file_name is None:
            file_name = os.path.basename(file_path)

        # Extract text from PDF
        text = extract_text_from_pdf(file_path)

        # Chunk the text
        chunks = chunk_text(text)

        # Embed and upload each chunk
        for i, chunk in enumerate(chunks):
            # Create unique point ID
            point_id = int(uuid.uuid4().hex[:16], 16)

            # Embed the chunk
            embedding = embed_text(chunk)

            # Create payload with file name and chunk
            payload = {
                "file_name": file_name,
                "chunk": chunk,
                "chunk_index": i,
                "total_chunks": len(chunks),
            }

            # Insert into Qdrant
            insert_qdrant_points(
                collection_name=KB_COLLECTION_NAME,
                point_id=point_id,
                vector=embedding,
                payload=payload,
            )

        return {
            "status": "success",
            "message": f"PDF file {file_name} uploaded successfully with {len(chunks)} chunks.",
        }
    except Exception as e:
        return {"status": "error", "message": f"Error uploading PDF file: {str(e)}"}


def upload_text_file(file_path: str, file_name: str = None):
    """
    Upload a text file to a collection in Qdrant.
    The file is converted to text and then chunked into smaller chunks.
    The chunks are then embedded and uploaded to the collection.

    Args:
        file_path (str): Path to the text file to upload.
        file_name (str): Name to use for the file in the collection. If None, uses the original filename.
    """
    try:
        # Ensure collection exists
        create_knowledge_base_collection_if_not_exists()

        # Use provided file_name or extract from path
        if file_name is None:
            file_name = os.path.basename(file_path)

        # Read text from file
        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()

        # Chunk the text
        chunks = chunk_text(text)

        # Embed and upload each chunk
        for i, chunk in enumerate(chunks):
            # Create unique point ID
            point_id = int(uuid.uuid4().hex[:16], 16)

            # Embed the chunk
            embedding = embed_text(chunk)

            # Create payload with file name and chunk
            payload = {
                "file_name": file_name,
                "chunk": chunk,
                "chunk_index": i,
                "total_chunks": len(chunks),
            }

            # Insert into Qdrant
            insert_qdrant_points(
                collection_name=KB_COLLECTION_NAME,
                point_id=point_id,
                vector=embedding,
                payload=payload,
            )

        return {
            "status": "success",
            "message": f"Text file {file_name} uploaded successfully with {len(chunks)} chunks.",
        }
    except Exception as e:
        return {"status": "error", "message": f"Error uploading text file: {str(e)}"}


def delete_knowledge_base_file(
    file_name: str, collection_name: str = KB_COLLECTION_NAME
):
    """
    Delete a file from a collection in Qdrant.

    Args:
        file_name (str): The name of the file to delete.
        collection_name (str): The name of the collection to delete from.
    """
    try:
        result = delete_qdrant_documents(collection_name, file_name)
        return result
    except Exception as e:
        return {"status": "error", "message": f"Error deleting file: {str(e)}"}


def get_similar_chunks(
    collection_name: str = KB_COLLECTION_NAME, query: str = "", limit: int = 10
):
    """
    Get similar chunks from a collection in Qdrant.

    Args:
        collection_name (str): The name of the collection to get the similar chunks from.
        query (str): The query to get the similar chunks from.
        limit (int): The number of similar chunks to return.
    """
    try:
        # Embed the query
        query_embedding = embed_text(query)

        # Search for similar chunks
        result = search_qdrant_points(
            collection_name=collection_name, vector=query_embedding, limit=limit
        )

        # Format the results
        formatted_results = []
        for point in result["message"]:
            formatted_results.append(
                {
                    "score": point.score,
                    "file_name": point.payload.get("file_name", ""),
                    "chunk": point.payload.get("chunk", ""),
                }
            )

        return {"status": "success", "results": formatted_results}
    except Exception as e:
        return {"status": "error", "message": f"Error getting similar chunks: {str(e)}"}


def get_file_chunks(file_name: str, collection_name: str = KB_COLLECTION_NAME):
    """
    Get all chunks for a specific file from the knowledge base.

    Args:
        file_name (str): The name of the file to get chunks for.
        collection_name (str): The name of the collection to search in.
    """
    try:
        # Get all points from the collection
        points = qdrant_client.scroll(
            collection_name=collection_name, limit=1000, with_payload=True
        )[0]

        # Filter points for the specific file
        file_chunks = []
        for point in points:
            if point.payload and point.payload.get("file_name") == file_name:
                file_chunks.append(
                    {
                        "chunk_index": point.payload.get("chunk_index", 0),
                        "chunk": point.payload.get("chunk", ""),
                        "total_chunks": point.payload.get("total_chunks", 0),
                    }
                )

        # Sort by chunk index
        file_chunks.sort(key=lambda x: x["chunk_index"])

        return {"status": "success", "chunks": file_chunks}
    except Exception as e:
        return {"status": "error", "message": f"Error getting file chunks: {str(e)}"}
