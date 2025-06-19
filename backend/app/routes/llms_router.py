from fastapi import APIRouter
from app.controllers.llms_controller import (
    get_llm_response,
    analyse_biomodel_controller,
)

router = APIRouter()


@router.post("/query")
async def query_llm(user_prompt: str):
    """
    Endpoint to query the LLM and execute the necessary tools.
    Args:
        user_prompt (str): The prompt entered by the user.
    Returns:
        dict: The final response after processing the prompt with the tools.
    """
    result, bmkeys = await get_llm_response(user_prompt)
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
