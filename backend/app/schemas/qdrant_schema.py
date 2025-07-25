from pydantic import BaseModel, Field
from typing import List, Optional


class CreateCollectionRequest(BaseModel):
    """Schema for creating a Qdrant collection."""
    collection_name: str = Field(..., description="Name of the collection to create")
    vector_size: int = Field(..., description="Size of the vector", gt=0)
    distance: str = Field(..., description="Distance metric to use", pattern="^(cosine|dot)$")


class InsertPointRequest(BaseModel):
    """Schema for inserting a point into Qdrant."""
    collection_name: str = Field(..., description="Name of the collection to insert the point into")
    point_id: int = Field(..., description="ID of the point to insert")
    vector: List[float] = Field(..., description="Vector of the point to insert")
    payload: dict = Field(..., description="Payload of the point to insert")


class SearchPointsRequest(BaseModel):
    """Schema for searching points in Qdrant."""
    collection_name: str = Field(..., description="Name of the collection to search in")
    vector: List[float] = Field(..., description="Vector to search for")
    limit: Optional[int] = Field(default=10, description="Maximum number of points to return", gt=0, le=100)


class DeleteDocumentRequest(BaseModel):
    """Schema for deleting a document from Qdrant."""
    collection_name: str = Field(..., description="Name of the collection to delete the document from")
    file_name: str = Field(..., description="Name of the document to delete") 