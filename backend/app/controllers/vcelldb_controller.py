import httpx
from typing import List
from fastapi import HTTPException, Response
from fastapi.responses import JSONResponse
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    get_sbml_file,
    get_diagram_url,
    get_diagram_image,
    fetch_biomodel_applications_files,
    fetch_publications,
)
from app.utils.response_formatter import ResponseFormatter


async def get_biomodels_controller(params: BiomodelRequestParams) -> JSONResponse:
    """
    Controller function to retrieve biomodels based on filters and sorting.
    Returns:
        JSONResponse: Standardized response with biomodel data and metadata.
    """
    try:
        biomodels = await fetch_biomodels(params)
        
        # Extract data and metadata
        bmkeys = biomodels.get("unique_model_keys (bmkey)", [])
        models_data = biomodels.get("data", [])
        models_count = biomodels.get("models_count", 0)
        
        meta = {"bmkeys": bmkeys} if bmkeys else None
        
        return ResponseFormatter.success_response(
            data=models_data,
            message=f"Retrieved {models_count} biomodels successfully",
            meta=meta
        )
    except httpx.HTTPStatusError as e:
        return ResponseFormatter.error_response(
            message="Failed to fetch biomodels from VCell API",
            status_code=e.response.status_code
        )
    except httpx.RequestError as e:
        return ResponseFormatter.error_response(
            message=f"Error communicating with VCell API: {str(e)}",
            status_code=500
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Error fetching biomodels: {str(e)}",
            status_code=500
        )


async def get_simulation_details_controller(params: SimulationRequestParams) -> JSONResponse:
    """
    Controller function to fetch detailed simulation data for a biomodel.
    Returns:
        JSONResponse: Standardized response with simulation details.
    """
    try:
        simulation = await fetch_simulation_details(params)
        return ResponseFormatter.success_response(
            data=simulation,
            message=f"Simulation details retrieved for biomodel {params.bmId}"
        )
    except httpx.HTTPStatusError as e:
        return ResponseFormatter.error_response(
            message="Failed to fetch simulation details from VCell API",
            status_code=e.response.status_code
        )
    except httpx.RequestError as e:
        return ResponseFormatter.error_response(
            message=f"Error communicating with VCell API: {str(e)}",
            status_code=500
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Error fetching simulation details: {str(e)}",
            status_code=500
        )


async def get_vcml_controller(biomodel_id: str, truncate: bool = False) -> JSONResponse:
    """
    Controller function to fetch the contents of the VCML file for a biomodel.
    Returns:
        JSONResponse: Standardized response with VCML content.
    """
    try:
        vcml_content = await get_vcml_file(biomodel_id, truncate)
        return ResponseFormatter.success_response(
            data={"content": vcml_content},
            message=f"VCML file retrieved for biomodel {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to fetch VCML file for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


async def get_sbml_controller(biomodel_id: str) -> JSONResponse:
    """
    Controller function to fetch the contents of the SBML file for a biomodel.
    Returns:
        JSONResponse: Standardized response with SBML content.
    """
    try:
        sbml_content = await get_sbml_file(biomodel_id)
        return ResponseFormatter.success_response(
            data={"content": sbml_content},
            message=f"SBML file retrieved for biomodel {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to fetch SBML file for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


async def get_diagram_url_controller(biomodel_id: str) -> JSONResponse:
    """
    Controller function to fetch the URL of the diagram image for a biomodel.
    Returns:
        JSONResponse: Standardized response with diagram URL.
    """
    try:
        diagram_url = await get_diagram_url(biomodel_id)
        return ResponseFormatter.success_response(
            data={"url": diagram_url},
            message=f"Diagram URL retrieved for biomodel {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to fetch diagram URL for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


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


async def get_biomodel_applications_files_controller(biomodel_id: str) -> JSONResponse:
    """
    Controller function to fetch applications data along with SBML and BNGL file URLs for a biomodel.
    Returns:
        JSONResponse: Standardized response with biomodel applications and file URLs.
    """
    try:
        applications_data = await fetch_biomodel_applications_files(biomodel_id)
        return ResponseFormatter.success_response(
            data=applications_data,
            message=f"Applications and file URLs retrieved for biomodel {biomodel_id}"
        )
    except httpx.HTTPStatusError as e:
        error_message = "Biomodel not found" if e.response.status_code == 404 else "Error fetching biomodel applications"
        return ResponseFormatter.error_response(
            message=error_message,
            status_code=e.response.status_code
        )
    except httpx.RequestError as e:
        return ResponseFormatter.error_response(
            message=f"Error communicating with VCell API: {str(e)}",
            status_code=500
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Error fetching applications for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


async def get_publications_controller() -> JSONResponse:
    """
    Controller function to fetch publications from the VCell API.
    Returns:
        JSONResponse: Standardized response with publications data.
    """
    try:
        publications = await fetch_publications()
        return ResponseFormatter.success_response(
            data=publications,
            message=f"Retrieved {len(publications)} publications successfully"
        )
    except httpx.HTTPStatusError as e:
        return ResponseFormatter.error_response(
            message="Failed to fetch publications from VCell API",
            status_code=e.response.status_code
        )
    except httpx.RequestError as e:
        return ResponseFormatter.error_response(
            message=f"Error communicating with VCell API: {str(e)}",
            status_code=500
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Error fetching publications: {str(e)}",
            status_code=500
        )
