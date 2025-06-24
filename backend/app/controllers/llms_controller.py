from fastapi import HTTPException
from app.services.llms_service import (
    get_response_with_tools,
    analyse_biomodel,
    analyse_vcml,
    analyse_diagram,
)


async def get_llm_response(user_prompt: str) -> tuple[str, list]:
    """
    Controller function to interact with the LLM service.
    Args:
        user_prompt (str): The query or input provided by the user.
    Returns:
        tuple[str, list]: A tuple containing the final response and bmkeys list.
    """
    try:
        result, bmkeys = await get_response_with_tools(user_prompt)
        return result, bmkeys
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


async def analyse_vcml_controller(biomodel_id: str) -> str:
    """
    Controller function to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        str: The VCML analysis response.
    """
    try:
        result = await analyse_vcml(biomodel_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing VCML for biomodel {biomodel_id}: {str(e)}"
        )


async def analyse_diagram_controller(biomodel_id: str) -> str:
    """
    Controller function to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        str: The diagram analysis response.
    """
    try:
        result = await analyse_diagram(biomodel_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing diagram for biomodel {biomodel_id}: {str(e)}"
        )


async def analyse_biomodel_controller(biomodel_id: str, user_prompt: str) -> str:
    """
    Controller function to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The query or input provided by the user.
    Returns:
        str: The analysis result from the LLM service.
    """
    try:
        result = await analyse_biomodel(biomodel_id, user_prompt)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing biomodel {biomodel_id}: {str(e)}"
        )
