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
    get_file_chunks
)


async def create_collection_controller():
    """
    Create the knowledge base collection if it doesn't exist.
    """
    try:
        result = create_knowledge_base_collection_if_not_exists()
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating collection: {str(e)}")


async def get_files_controller():
    """
    Get all files in the knowledge base.
    """
    try:
        result = get_knowledge_base_files()
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting files: {str(e)}")


async def upload_pdf_controller(file: UploadFile = File(...)):
    """
    Upload a PDF file to the knowledge base.
    """
    temp_file_path = None
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        

        file_name = file.filename
        
        # Upload to knowledge base
        result = upload_pdf_file(temp_file_path, file_name)
        
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors


async def upload_text_controller(file: UploadFile = File(...)):
    """
    Upload a text file to the knowledge base.
    """
    temp_file_path = None
    try:
        # Validate file type
        if not file.filename.lower().endswith('.txt'):
            raise HTTPException(status_code=400, detail="File must be a text file")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        file_name = file.filename
        
        # Upload to knowledge base
        result = upload_text_file(temp_file_path, file_name)
        
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading text file: {str(e)}")
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors


async def delete_file_controller(file_name: str):
    """
    Delete a file from the knowledge base.
    """
    try:
        if not file_name:
            raise HTTPException(status_code=400, detail="File name is required")
        
        result = delete_knowledge_base_file(file_name)
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")


async def get_similar_controller(query: str, limit: int = 10):
    """
    Get similar chunks from the knowledge base.
    """
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        if limit <= 0 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        result = get_similar_chunks(query=query, limit=limit)
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting similar chunks: {str(e)}")


async def get_file_chunks_controller(file_name: str):
    """
    Get all chunks for a specific file.
    """
    try:
        if not file_name:
            raise HTTPException(status_code=400, detail="File name is required")
        
        result = get_file_chunks(file_name)
        if result["status"] == "success":
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=500)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting file chunks: {str(e)}") 