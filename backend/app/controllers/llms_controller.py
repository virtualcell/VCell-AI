from fastapi import HTTPException
from app.services.llms_service import (
    get_response_with_tools,
    analyse_biomodel,
)


async def get_llm_response(user_prompt: str) -> str:
    """
    Controller function to interact with the LLM service.
    Args:
        user_prompt (str): The query or input provided by the user.
    Returns:
        str: The final response after processing the user's query.
    """
    try:
        result = await get_response_with_tools(user_prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


async def analyse_biomodel_controller(biomodel_id: str, user_prompt: str) -> dict:
    """
    Controller function to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The query or input provided by the user.
    Returns:
        dict: The analysis result from the LLM service.
    """
    try:
        result = await analyse_biomodel(biomodel_id, user_prompt)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing biomodel {biomodel_id}: {str(e)}"
        )
