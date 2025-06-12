from fastapi import APIRouter
from app.controllers.llms_controller import get_llm_response

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
    result = await get_llm_response(user_prompt)
    return {"response": result}
