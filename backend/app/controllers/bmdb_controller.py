import httpx
from typing import List
from fastapi import HTTPException, Response
from app.schemas.bmdb_schema import BMDBRequestParams
from app.services.databases_service import (
    get_xml_file,
    fetch_bmdb_models,
)


async def get_bmdb_models_controller(params: BMDBRequestParams) -> dict:
    """
    Controller function to retrieve biomodels based on filters and sorting.
    Raises:
        HTTPException: If the BMDB API request fails.
    """
    try:
        biomodels = await fetch_bmdb_models(params)
        return biomodels
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail="Error fetching biomodels."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with BMDB API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_xml_controller(bmdbID: str, truncate: bool = False) -> str:
    """
    Controller function to fetch the contents of the XML file for a bmdb biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_xml_file(bmdbID, truncate)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching XML file.")