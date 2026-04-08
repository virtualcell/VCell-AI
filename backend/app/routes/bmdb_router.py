from multiprocessing import process

from fastapi import APIRouter, HTTPException
import httpx
import requests
from app.controllers.llms_controller import (
    get_llm_response,
)
from app.controllers.bmdb_controller import (
    get_bmdb_models_controller,
    get_xml_controller,
)

router = APIRouter()

# For BioModelsDB search using BioModelsDB API 
@router.post("/bmdb-search")
async def search_llm(conversation_history: dict):
    """
    Endpoint to query the LLM and execute the necessary tools.
    Args:
        conversation_history (dict): The conversation history containing user prompts and responses.
        database (str): The database to query - bmdb in this case.
    Returns:
        dict: The final response after processing the prompt with the tools.
    """

    print("DEBUG20: BMDB POST: ROUTER")
    result, bmdbkeys, tool_summary = await get_llm_response(
        conversation_history.get("conversation_history", []), database="bmdb"
    )
    return {"response": result, "bmkeys": bmdbkeys, "tool_summary": tool_summary}


# @router.get("/", response_model=dict)
# async def get_biomodels(params: BiomodelRequestParams = Depends()):
#     """
#     Endpoint to retrieve biomodels based on provided filters and sorting.
#     """
#     try:
#         return await get_biomodels_controller(params)
#     except HTTPException as e:
#         raise e

# @router.get("/", response_model=str)
# async def get_xml(bmdbID: str, truncate: bool = False):
#     """
#     Endpoint to get XML file contents for a given biomodel.
#     """
#     try:
#         return await get_xml_controller(bmdbID, truncate)
#     except HTTPException as e:
#         raise e