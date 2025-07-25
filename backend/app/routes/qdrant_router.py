from fastapi import APIRouter, HTTPException
from app.schemas.qdrant_schema import (
    CreateCollectionRequest,
    InsertPointRequest,
    SearchPointsRequest,
    DeleteDocumentRequest
)
from app.controllers.qdrant_controller import (
    create_collection_controller,
    insert_point_controller,
    search_points_controller,
    delete_document_controller,
)

router = APIRouter()


@router.post("/collection", response_model=dict)
async def create_collection(request: CreateCollectionRequest):
    """
    Endpoint to create a new Qdrant collection.
    """
    try:
        return await create_collection_controller(request)
    except HTTPException as e:
        raise e


@router.post("/points", response_model=dict)
async def insert_point(request: InsertPointRequest):
    """
    Endpoint to insert a point into a Qdrant collection.
    """
    try:
        return await insert_point_controller(request)
    except HTTPException as e:
        raise e


@router.post("/search", response_model=dict)
async def search_points(request: SearchPointsRequest):
    """
    Endpoint to search for points in a Qdrant collection.
    """
    try:
        return await search_points_controller(request)
    except HTTPException as e:
        raise e


@router.delete("/documents", response_model=dict)
async def delete_document(request: DeleteDocumentRequest):
    """
    Endpoint to delete a document from a Qdrant collection.
    """
    try:
        return await delete_document_controller(request)
    except HTTPException as e:
        raise e
