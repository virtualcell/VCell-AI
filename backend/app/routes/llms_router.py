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
        dict: The final response after processing the prompt with the tools.
    """
    result, bmkeys = await get_llm_response(conversation_history.get("conversation_history", []))
    return {"response": result, "bmkeys": bmkeys}


@router.post("/analyse/{biomodel_id}")
async def analyse_biomodel(biomodel_id: str, user_prompt: str):
    """
    Endpoint to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The prompt entered by the user.
    Returns:
        dict: The analysis result from the LLM service.
    """
    result = await analyse_biomodel_controller(biomodel_id, user_prompt)
    return {"response": result}


@router.post("/analyse/{biomodel_id}/vcml")
async def analyse_vcml(biomodel_id: str):
    """
    Endpoint to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        dict: The VCML analysis response.
    """
    result = await analyse_vcml_controller(biomodel_id)
    return {"response": result}


@router.post("/analyse/{biomodel_id}/diagram")
async def analyse_diagram(biomodel_id: str):
    """
    Endpoint to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        dict: The diagram analysis response.
    """
    result = await analyse_diagram_controller(biomodel_id)
    return {"response": result}
