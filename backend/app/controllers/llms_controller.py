from fastapi import HTTPException
from supabase import Client

from app.core.singleton import get_supabase_client
from app.services.litellm_service import get_or_create_virtual_key
from app.services.llms_service import (
    get_response_with_tools,
    analyse_biomodel,
    analyse_vcml,
    analyse_diagram,
)


async def _get_virtual_key(payload: dict, supabase: Client) -> str:
    auth0_sub = payload.get("sub")
    if not auth0_sub:
        raise HTTPException(status_code=401, detail="Missing Auth0 subject claim")

    return await get_or_create_virtual_key(
        auth0_sub=auth0_sub,
        email=payload.get("email") or "",
        supabase=supabase,
    )


async def get_llm_response(
    conversation_history: list[dict],
    model: str,
    payload: dict,
) -> tuple[str, list]:
    """
    Controller function to interact with the LLM service.
    Args:
        conversation_history (list[dict]): The conversation history containing user prompts and responses.
        model (str): The LiteLLM model alias to use.
        payload (dict): The verified Auth0 token payload for the caller.
    Returns:
        tuple[str, list]: A tuple containing the final response and bmkeys list.
    """
    try:
        supabase = get_supabase_client()
        virtual_key = await _get_virtual_key(payload, supabase)
        result, bmkeys = await get_response_with_tools(
            conversation_history, virtual_key, model
        )
        return result, bmkeys
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


async def analyse_vcml_controller(biomodel_id: str, model: str, payload: dict) -> str:
    """
    Controller function to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
        model (str): The LiteLLM model alias to use.
        payload (dict): The verified Auth0 token payload for the caller.
    Returns:
        str: The VCML analysis response.
    """
    try:
        supabase = get_supabase_client()
        virtual_key = await _get_virtual_key(payload, supabase)
        result = await analyse_vcml(biomodel_id, virtual_key, model)
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing VCML for biomodel {biomodel_id}: {str(e)}",
        )


async def analyse_diagram_controller(biomodel_id: str, model: str, payload: dict) -> str:
    """
    Controller function to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
        model (str): The LiteLLM model alias to use.
        payload (dict): The verified Auth0 token payload for the caller.
    Returns:
        str: The diagram analysis response.
    """
    try:
        supabase = get_supabase_client()
        virtual_key = await _get_virtual_key(payload, supabase)
        result = await analyse_diagram(biomodel_id, virtual_key, model)
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing diagram for biomodel {biomodel_id}: {str(e)}",
        )


async def analyse_biomodel_controller(
    biomodel_id: str, user_prompt: str, model: str, payload: dict
) -> str:
    """
    Controller function to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The query or input provided by the user.
        model (str): The LiteLLM model alias to use.
        payload (dict): The verified Auth0 token payload for the caller.
    Returns:
        str: The analysis result from the LLM service.
    """
    try:
        supabase = get_supabase_client()
        virtual_key = await _get_virtual_key(payload, supabase)
        result = await analyse_biomodel(biomodel_id, user_prompt, virtual_key, model)
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500, detail=f"Error analyzing biomodel {biomodel_id}: {str(e)}"
        )
