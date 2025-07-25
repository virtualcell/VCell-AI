from fastapi import APIRouter, UploadFile, File
from app.controllers.knowledge_base_controller import (
    create_collection_controller,
    get_files_controller,
    upload_pdf_controller,
    upload_text_controller,
    delete_file_controller,
    get_similar_controller,
    get_file_chunks_controller
)

router = APIRouter()


@router.post("/create-collection")
async def create_collection_endpoint():
    """
    Create the knowledge base collection if it doesn't exist.
    """
    try:
        return await create_collection_controller()
    except Exception as e:
        raise e


@router.get("/files")
async def get_files_endpoint():
    """
    Get all files in the knowledge base.
    """
    try:
        return await get_files_controller()
    except Exception as e:
        raise e


@router.post("/upload-pdf")
async def upload_pdf_endpoint(file: UploadFile = File(...)):
    """
    Upload a PDF file to the knowledge base.
    """
    try:
        return await upload_pdf_controller(file)
    except Exception as e:
        raise e


@router.post("/upload-text")
async def upload_text_endpoint(file: UploadFile = File(...)):
    """
    Upload a text file to the knowledge base.
    """
    try:
        return await upload_text_controller(file)
    except Exception as e:
        raise e


@router.delete("/files/{file_name}")
async def delete_file_endpoint(file_name: str):
    """
    Delete a file from the knowledge base.
    """
    try:
        return await delete_file_controller(file_name)
    except Exception as e:
        raise e


@router.get("/similar")
async def get_similar_endpoint(
    query: str,
    limit: int = 10
):
    """
    Get similar chunks from the knowledge base.
    """
    try:
        return await get_similar_controller(query, limit)
    except Exception as e:
        raise e


@router.get("/files/{file_name}/chunks")
async def get_file_chunks_endpoint_router(file_name: str):
    """
    Get all chunks for a specific file.
    """
    try:
        return await get_file_chunks_controller(file_name)
    except Exception as e:
        raise e 