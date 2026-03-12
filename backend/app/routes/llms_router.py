from fastapi import APIRouter
from app.controllers.llms_controller import (
    get_llm_response,
    analyse_biomodel_controller,
    analyse_vcml_controller,
    analyse_diagram_controller,
)

router = APIRouter()


@router.post("/query")
async def query_llm(conversation_history: dict):
    """
    Endpoint to query the LLM and execute the necessary tools.
    Args:
        conversation_history (dict): The conversation history containing user prompts and responses.
    Returns:
        JSONResponse: Standardized response with LLM output and metadata.
    """
    return await get_llm_response(
        conversation_history.get("conversation_history", [])
    )


@router.post("/analyse/{biomodel_id}")
async def analyse_biomodel(biomodel_id: str, user_prompt: str):
    """
    Endpoint to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The prompt entered by the user.
    Returns:
        JSONResponse: Standardized response with biomodel analysis.
    """
    return await analyse_biomodel_controller(biomodel_id, user_prompt)


@router.post("/analyse/{biomodel_id}/vcml")
async def analyse_vcml(biomodel_id: str):
    """
    Endpoint to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        JSONResponse: Standardized response with VCML analysis.
    """
    return await analyse_vcml_controller(biomodel_id)


@router.post("/analyse/{biomodel_id}/diagram")
async def analyse_diagram(biomodel_id: str):
    """
    Endpoint to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        JSONResponse: Standardized response with diagram analysis.
    """
    return await analyse_diagram_controller(biomodel_id)
