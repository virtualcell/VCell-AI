import httpx
from typing import List
from fastapi import HTTPException, Response
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    get_sbml_file,
    get_diagram_url,
    get_diagram_image,
    fetch_biomodel_applications_files,
)


async def get_biomodels_controller(params: BiomodelRequestParams) -> dict:
    """
    Controller function to retrieve biomodels based on filters and sorting.
    Raises:
        HTTPException: If the VCell API request fails.
    """
    try:
        biomodels = await fetch_biomodels(params)
        return biomodels
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail="Error fetching biomodels."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
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
        raise HTTPException(
            status_code=e.response.status_code,
            detail="Error fetching simulation details.",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_vcml_controller(biomodel_id: str, truncate: bool = False) -> str:
    """
    Controller function to fetch the contents of the VCML file for a biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_vcml_file(biomodel_id, truncate)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching VCML URL.")


async def get_sbml_controller(biomodel_id: str) -> str:
    """
    Controller function to fetch the contents of the SBML file for a biomodel.
    Raises:
        HTTPException: If the URL cannot be generated.
    """
    try:
        return await get_sbml_file(biomodel_id)
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


async def get_diagram_image_controller(biomodel_id: str) -> Response:
    """
    Controller function to fetch the diagram image for a biomodel and return it as a PNG response.
    Raises:
        HTTPException: If the image cannot be fetched.
    """
    try:
        image_bytes = await get_diagram_image(biomodel_id)
        return Response(content=image_bytes, media_type="image/png")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Biomodel not found.")
        raise HTTPException(
            status_code=e.response.status_code, detail="Error fetching diagram image."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching diagram image.")


async def get_biomodel_applications_files_controller(biomodel_id: str) -> dict:
    """
    Controller function to fetch applications data along with SBML and BNGL file URLs for a biomodel.
    Raises:
        HTTPException: If the VCell API request fails.
    """
    try:
        return await fetch_biomodel_applications_files(biomodel_id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Biomodel not found.")
        raise HTTPException(
            status_code=e.response.status_code, detail="Error fetching biomodel applications."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API. " + str(e)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))