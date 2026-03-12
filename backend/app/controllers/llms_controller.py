from fastapi.responses import JSONResponse
from app.services.llms_service import (
    get_response_with_tools,
    analyse_biomodel,
    analyse_vcml,
    analyse_diagram,
)
from app.utils.response_formatter import ResponseFormatter


async def get_llm_response(conversation_history: list[dict]) -> JSONResponse:
    """
    Controller function to interact with the LLM service.
    Args:
        conversation_history (list[dict]): The conversation history containing user prompts and responses.
    Returns:
        JSONResponse: Standardized response with LLM output and biomodel keys.
    """
    try:
        result, bmkeys = await get_response_with_tools(conversation_history)
        
        # Simple data structure for backward compatibility
        data = {"response": result}
        
        # Simple metadata - only bmkeys if present
        meta = {"bmkeys": bmkeys} if bmkeys else None
            
        return ResponseFormatter.success_response(
            data=data,
            message="LLM query processed successfully",
            meta=meta
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to process LLM query: {str(e)}",
            status_code=500
        )


async def analyse_vcml_controller(biomodel_id: str) -> JSONResponse:
    """
    Controller function to analyze VCML content for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        JSONResponse: Standardized response with VCML analysis.
    """
    try:
        result = await analyse_vcml(biomodel_id)
        return ResponseFormatter.success_response(
            data={"response": result},
            message=f"VCML analysis completed for biomodel {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to analyze VCML for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


async def analyse_diagram_controller(biomodel_id: str) -> JSONResponse:
    """
    Controller function to analyze diagram for a given biomodel.
    Args:
        biomodel_id (str): The ID of the biomodel to analyze.
    Returns:
        JSONResponse: Standardized response with diagram analysis.
    """
    try:
        result = await analyse_diagram(biomodel_id)
        return ResponseFormatter.success_response(
            data={"response": result},
            message=f"Diagram analysis completed for biomodel {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to analyze diagram for biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )


async def analyse_biomodel_controller(biomodel_id: str, user_prompt: str) -> JSONResponse:
    """
    Controller function to analyze a biomodel using the LLM service.
    Args:
        biomodel_id (str): The ID of the biomodel to be analyzed.
        user_prompt (str): The query or input provided by the user.
    Returns:
        JSONResponse: Standardized response with biomodel analysis.
    """
    try:
        result = await analyse_biomodel(biomodel_id, user_prompt)
        return ResponseFormatter.success_response(
            data={"response": result},
            message=f"Biomodel analysis completed for {biomodel_id}"
        )
    except Exception as e:
        return ResponseFormatter.error_response(
            message=f"Failed to analyze biomodel {biomodel_id}: {str(e)}",
            status_code=500
        )
