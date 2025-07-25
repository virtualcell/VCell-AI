from typing import Dict, Any
from fastapi import HTTPException
from app.schemas.qdrant_schema import (
    CreateCollectionRequest,
    InsertPointRequest,
    SearchPointsRequest,
    DeleteDocumentRequest,
)
from app.services.qdrant_service import (
    create_qdrant_collection,
    insert_qdrant_points,
    search_qdrant_points,
    delete_qdrant_documents,
)


async def create_collection_controller(
    request: CreateCollectionRequest,
) -> Dict[str, Any]:
    """
    Controller function to create a new Qdrant collection.

    Args:
        request: CreateCollectionRequest containing collection details

    Returns:
        Dict containing status and message

    Raises:
        HTTPException: If the collection creation fails.
    """
    try:
        result = create_qdrant_collection(
            collection_name=request.collection_name,
            vector_size=request.vector_size,
            distance=request.distance,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating collection: {str(e)}"
        )


async def insert_point_controller(request: InsertPointRequest) -> Dict[str, Any]:
    """
    Controller function to insert a point into a Qdrant collection.

    Args:
        request: InsertPointRequest containing point details

    Returns:
        Dict containing status and operation info

    Raises:
        HTTPException: If the point insertion fails.
    """
    try:
        result = insert_qdrant_points(
            collection_name=request.collection_name,
            point_id=request.point_id,
            vector=request.vector,
            payload=request.payload,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting point: {str(e)}")


async def search_points_controller(request: SearchPointsRequest) -> Dict[str, Any]:
    """
    Controller function to search for points in a Qdrant collection.

    Args:
        request: SearchPointsRequest containing search parameters

    Returns:
        Dict containing status and search results

    Raises:
        HTTPException: If the search operation fails.
    """
    try:
        result = search_qdrant_points(
            collection_name=request.collection_name,
            vector=request.vector,
            limit=request.limit,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching points: {str(e)}")


async def delete_document_controller(request: DeleteDocumentRequest) -> Dict[str, Any]:
    """
    Controller function to delete a document from a Qdrant collection.

    Args:
        request: DeleteDocumentRequest containing deletion parameters

    Returns:
        Dict containing status and message

    Raises:
        HTTPException: If the document deletion fails.
    """
    try:
        result = delete_qdrant_documents(
            collection_name=request.collection_name, file_name=request.file_name
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )
