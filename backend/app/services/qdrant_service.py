from qdrant_client.models import (
    Distance, 
    VectorParams, 
    PointStruct
)
from app.core.singleton import get_qdrant_client

client = get_qdrant_client()

def create_qdrant_collection(collection_name: str, vector_size: int, distance: str):
    """
    Create a new collection in Qdrant.

    Args:
        collection_name (str): The name of the collection to create.
        vector_size (int): The size of the vector.
        distance (str): The distance metric to use. Can be "cosine" or "dot".
    """
    if distance == "cosine":
        distance = Distance.COSINE
    elif distance == "dot":
        distance = Distance.DOT
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=distance),
    )
    return {
        "status": "success",
        "message": collection_name + " created successfully."
    }

def insert_qdrant_points(
        collection_name: str,
        point_id: int,
        vector: list[float],
        payload: dict,
    ):
    """
    Insert a new point into a collection in Qdrant.

    Args:
        collection_name (str): The name of the collection to insert the point into.
        point_id (int): The ID of the point to insert.
        vector (list[float]): The vector of the point to insert.
        payload (dict): The payload of the point to insert.
    """
    operation_info = client.upsert(
        collection_name=collection_name,
        wait=True,
        points=[
            PointStruct(id=point_id, vector=vector, payload=payload),
        ],
    )
    return {
        "status": "success",
        "message": operation_info
    }

def search_qdrant_points(
    collection_name: str,
    vector: list[float],
    limit: int = 10,
):
    """
    Search for points in a collection in Qdrant.

    Args:
        collection_name (str): The name of the collection to search in.
        vector (list[float]): The vector to search for.
        limit (int): The maximum number of points to return.
    """
    search_result = client.query_points(
        collection_name=collection_name,
        query=vector,
        with_payload=True,
        limit=limit
    ).points

    return {
        "status": "success",
        "message": search_result
    }