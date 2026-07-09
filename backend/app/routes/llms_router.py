from fastapi import APIRouter, Depends

from app.controllers.llms_controller import (
    get_llm_response,
    analyse_biomodel_controller,
    analyse_vcml_controller,
    analyse_diagram_controller,
)
from app.core.auth import verify_auth0_token
from app.schemas.llms_schema import AnalysisResponse, ChatRequest, ChatResponse, LLMModel

router = APIRouter()


@router.post("/query", response_model=ChatResponse)
async def query_llm(
    request: ChatRequest,
    payload: dict = Depends(verify_auth0_token),
):
    """
    Endpoint to query the LLM and execute the necessary tools.
    Args:
        request (ChatRequest): The conversation history and model choice.
    Returns:
        dict: The final response after processing the prompt with the tools.
    """
    result, bmkeys, model_used = await get_llm_response(
        request.conversation_history,
        request.model,
        payload,
    )
    return {"response": result, "bmkeys": bmkeys, "model_used": model_used}


@router.post("/analyse/{biomodel_id}", response_model=AnalysisResponse)
async def analyse_biomodel(
    biomodel_id: str,
    user_prompt: str,
    model: str = "openai-model",
    payload: dict = Depends(verify_auth0_token),
):
    """
    Endpoint to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The prompt entered by the user.
    Returns:
        dict: The analysis result from the LLM service.
    """
    result = await analyse_biomodel_controller(biomodel_id, user_prompt, model, payload)
    return {"response": result}


@router.post("/analyse/{biomodel_id}/vcml", response_model=AnalysisResponse)
async def analyse_vcml(
    biomodel_id: str,
    model: str = "openai-model",
    payload: dict = Depends(verify_auth0_token),
):
    """
    Endpoint to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        dict: The VCML analysis response.
    """
    result = await analyse_vcml_controller(biomodel_id, model, payload)
    return {"response": result}


@router.post("/analyse/{biomodel_id}/diagram", response_model=AnalysisResponse)
async def analyse_diagram(
    biomodel_id: str,
    model: str = "openai-model",
    payload: dict = Depends(verify_auth0_token),
):
    """
    Endpoint to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        dict: The diagram analysis response.
    """
    result = await analyse_diagram_controller(biomodel_id, model, payload)
    return {"response": result}
