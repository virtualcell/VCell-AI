from fastapi import HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import tempfile
import os
from typing import Optional
from app.services.knowledge_base_service import (
    create_knowledge_base_collection_if_not_exists,
    get_knowledge_base_files,
    upload_pdf_file,
    upload_text_file,
    get_similar_chunks,
    delete_knowledge_base_file,
    get_file_chunks,
)
from app.utils.response_formatter import ResponseFormatter


async def create_collection_controller() -> JSONResponse:
    """
    Create the knowledge base collection if it doesn't exist.
    Returns:
        JSONResponse: Standardized response for collection creation.
    """
    try:
        result = create_knowledge_base_collection_if_not_exists()
        if result["status"] == "success":
            return ResponseFormatter.success_response(
                data=None,
                message=result["message"]
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to create knowledge base collection: {str(e)}",
            status_code=500
        )


async def get_files_controller() -> JSONResponse:
    """
    Get all files in the knowledge base.
    Returns:
        JSONResponse: Standardized response with knowledge base files.
    """
    try:
        result = get_knowledge_base_files()
        if result["status"] == "success":
            files = result.get("files", [])
            return ResponseFormatter.success_response(
                data=files,
                message=f"Retrieved {len(files)} files from knowledge base"
            )
        else:
            return ResponseFormatter.error_response(
                message="Failed to retrieve knowledge base files",
                status_code=500
            )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to get knowledge base files: {str(e)}",
            status_code=500
        )


async def upload_pdf_controller(file: UploadFile = File(...)) -> JSONResponse:
    """
    Upload a PDF file to the knowledge base.
    """
    temp_file_path = None
    try:
        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="File must be a PDF")

        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        file_name = file.filename

        # Upload to knowledge base
        result = upload_pdf_file(temp_file_path, file_name)

        if result["status"] == "success":
            return ResponseFormatter.success_response(
                data={"file_name": file_name},
                message=result["message"]
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )

    except HTTPException as e:
        return ResponseFormatter.error_response(
            message=str(e.detail),
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message="Failed to upload PDF file",
            status_code=500
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors


async def upload_text_controller(file: UploadFile = File(...)) -> JSONResponse:
    """
    Upload a text file to the knowledge base.
    Returns:
        JSONResponse: Standardized response for text file upload.
    """
    temp_file_path = None
    try:
        # Validate file type
        if not file.filename.lower().endswith(".txt"):
            raise HTTPException(status_code=400, detail="File must be a text file")

        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        file_name = file.filename

        # Upload to knowledge base
        result = upload_text_file(temp_file_path, file_name)

        if result["status"] == "success":
            return ResponseFormatter.success_response(
                data={"file_name": file_name},
                message=result["message"]
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )

    except HTTPException as e:
        return ResponseFormatter.error_response(
            message=str(e.detail),
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message="Failed to upload text file",
            status_code=500
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors


async def delete_file_controller(file_name: str) -> JSONResponse:
    """
    Delete a file from the knowledge base.
    Returns:
        JSONResponse: Standardized response for file deletion.
    """
    try:
        if not file_name:
            return ResponseFormatter.error_response(
                message="File name is required",
                status_code=400
            )

        result = delete_knowledge_base_file(file_name)
        if result["status"] == "success":
            return ResponseFormatter.success_response(
                data={"file_name": file_name},
                message=result["message"]
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )
    except Exception as e:
        return ResponseFormatter.error_response(
            message="Failed to delete file from knowledge base",
            status_code=500
        )


async def get_similar_controller(query: str, limit: int = 10) -> JSONResponse:
    """
    Get similar chunks from the knowledge base.
    Returns:
        JSONResponse: Standardized response with similar chunks.
    """
    try:
        if not query:
            return ResponseFormatter.error_response(
                message="Query is required",
                status_code=400
            )

        if limit <= 0 or limit > 100:
            return ResponseFormatter.error_response(
                message="Limit must be between 1 and 100",
                status_code=400
            )

        result = get_similar_chunks(query=query, limit=limit)
        if result["status"] == "success":
            results = result.get("results", [])
            return ResponseFormatter.success_response(
                data=results,
                message=f"Found {len(results)} similar chunks for query"
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )
    except Exception as e:
        return ResponseFormatter.error_response(
            message="Failed to perform similarity search",
            status_code=500
        )


async def get_file_chunks_controller(file_name: str) -> JSONResponse:
    """
    Get all chunks for a specific file.
    Returns:
        JSONResponse: Standardized response with file chunks.
    """
    try:
        if not file_name:
            return ResponseFormatter.error_response(
                message="File name is required",
                status_code=400
            )

        result = get_file_chunks(file_name)
        if result["status"] == "success":
            chunks = result.get("chunks", [])
            return ResponseFormatter.success_response(
                data=chunks,
                message=f"Retrieved {len(chunks)} chunks for file {file_name}"
            )
        else:
            return ResponseFormatter.error_response(
                message=result["message"],
                status_code=500
            )
    except Exception as e:
        return ResponseFormatter.error_response(
            message="Failed to get file chunks",
            status_code=500
        )
