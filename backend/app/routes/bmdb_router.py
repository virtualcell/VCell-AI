from fastapi import APIRouter, Depends, HTTPException
from app.schemas.bmdb_schema import BMDBRequestParams
from app.controllers.bmdb_controller import (
    get_bmdb_models_controller,
    get_xml_controller,
    get_bmdb_model_info_controller,
)

router = APIRouter()


@router.get("/search", response_model=dict)
async def get_biomodels(params: BMDBRequestParams = Depends()):
    """
    Endpoint to retrieve bmdb models based on provided parameters.
    """
    try:
        return await get_bmdb_models_controller(params)
    except HTTPException as e:
        raise e


@router.get("/get-xml", response_model=str)
async def get_xml(bmdbID: str, truncate: bool = False):
    """
    Endpoint to get XML file contents for a given biomodel.
    """
    try:
        return await get_xml_controller(bmdbID, truncate)
    except HTTPException as e:
        raise e
    

@router.get("/model-info", response_model=dict)
async def get_model_info(bmdbID: str):
    """
    Endpoint to get information about a specific BMDB model.
    """
    try:
        return await get_bmdb_model_info_controller(bmdbID)
    except HTTPException as e:
        raise e