from fastapi import HTTPException
from app.services.llms_service import get_response_with_tools

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
