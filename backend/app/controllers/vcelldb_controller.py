import httpx
from typing import List
from fastapi import HTTPException
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_url,
    get_sbml_url,
    get_diagram_url,
)

async def get_biomodels_controller(params: BiomodelRequestParams) -> List[dict]:
    """
    Controller function to retrieve biomodels based on filters and sorting.
    Raises:
        HTTPException: If the VCell API request fails.
    """
    try:
        biomodels = await fetch_biomodels(params)
        return biomodels
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error fetching biomodels.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail="Error communicating with VCell API.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_simulation_details_controller(params: SimulationRequestParams) -> dict:
    """
    Controller function to fetch detailed simulation data for a biomodel.
    Raises:
        HTTPException: If the VCell API request fails.
    """
    try:
        simulation = await fetch_simulation_details(params)
        return simulation
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error fetching simulation details.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail="Error communicating with VCell API.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_vcml_url_controller(biomodel_id: str) -> str:
    """
    Controller function to fetch the URL of the VCML file for a biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_vcml_url(biomodel_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching VCML URL.")


async def get_sbml_url_controller(biomodel_id: str) -> str:
    """
    Controller function to fetch the URL of the SBML file for a biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_sbml_url(biomodel_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching SBML URL.")


async def get_diagram_url_controller(biomodel_id: str) -> str:
    """
    Controller function to fetch the URL of the diagram image for a biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_diagram_url(biomodel_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching diagram URL.")
