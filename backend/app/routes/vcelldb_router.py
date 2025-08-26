from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.controllers.vcelldb_controller import (
    get_biomodels_controller,
    get_simulation_details_controller,
    get_vcml_controller,
    get_sbml_controller,
    get_diagram_url_controller,
    get_diagram_image_controller,
    get_biomodel_applications_files_controller,
    get_publications_controller,
)

router = APIRouter()


@router.get("/biomodel", response_model=dict)
async def get_biomodels(params: BiomodelRequestParams = Depends()):
    """
    Endpoint to retrieve biomodels based on provided filters and sorting.
    """
    try:
        return await get_biomodels_controller(params)
    except HTTPException as e:
        raise e


@router.get("/biomodel/{biomodel_id}/simulations", response_model=dict)
async def get_simulations(
    biomodel_id: str, params: SimulationRequestParams = Depends()
):
    """
    Endpoint to retrieve simulations for a specific biomodel by biomodel ID.
    """
    params.bmId = biomodel_id
    try:
        return await get_simulation_details_controller(params)
    except HTTPException as e:
        raise e


@router.get("/biomodel/{biomodel_id}/biomodel.vcml", response_model=str)
async def get_vcml(biomodel_id: str, truncate: bool = False):
    """
    Endpoint to get VCML file contents for a given biomodel.
    """
    try:
        return await get_vcml_controller(biomodel_id, truncate)
    except HTTPException as e:
        raise e


@router.get("/biomodel/{biomodel_id}/biomodel.sbml", response_model=str)
async def get_sbml(biomodel_id: str):
    """
    Endpoint to get SBML file contents for a given biomodel.
    """
    try:
        return await get_sbml_controller(biomodel_id)
    except HTTPException as e:
        raise e


@router.get("/biomodel/{biomodel_id}/diagram", response_model=str)
async def get_diagram_url(biomodel_id: str):
    """
    Endpoint to get the diagram image URL for a given biomodel.
    """
    try:
        return await get_diagram_url_controller(biomodel_id)
    except HTTPException as e:
        raise e


@router.get("/biomodel/{biomodel_id}/diagram/image")
async def get_diagram_image(biomodel_id: str):
    """
    Endpoint to get the diagram image (PNG) for a given biomodel.
    """
    return await get_diagram_image_controller(biomodel_id)


@router.get("/biomodel/{biomodel_id}/applications/files", response_model=dict)
async def get_biomodel_applications_files(biomodel_id: str):
    """
    Endpoint to get applications data along with SBML and BNGL file URLs for a given biomodel.
    """
    try:
        return await get_biomodel_applications_files_controller(biomodel_id)
    except HTTPException as e:
        raise e


@router.get("/publications", response_model=List[dict])
async def get_publications():
    """
    Endpoint to retrieve publications from the VCell API.
    """
    try:
        return await get_publications_controller()
    except HTTPException as e:
        raise e
