from app.utils.tools_utils import (
    ToolsDefinitions as tools,
    execute_tool,
)

from app.services.vcelldb_service import (
    fetch_biomodels,
    get_vcml_file,
    get_diagram_url,
)

from app.utils.system_prompt import SYSTEM_PROMPT

from app.schemas.vcelldb_schema import BiomodelRequestParams
from app.core.singleton import get_openai_client
from app.core.config import settings
import json
from app.core.logger import get_logger

logger = get_logger("llm_service")
client = get_openai_client()


async def get_llm_response(system_prompt: str, user_prompt: str):
    """
    Helper function to get a response from the LLM.
    args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user's query or request.
    returns:
        str: The response from the LLM.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = client.chat.completions.create(
        name="GET_LLM_RESPONSE",
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
    )

    return response.choices[0].message.content


async def get_response_with_tools(conversation_history: list[dict]):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
    ]

    messages = messages + conversation_history

    user_prompt = conversation_history[-1]["content"]

    logger.info(f"User prompt: {user_prompt}")

    response = client.chat.completions.create(
        name="GET_RESPONSE_WITH_TOOLS::RETRIEVE_TOOLS",
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    # Handle the tool calls
    tool_calls = response.choices[0].message.tool_calls

    messages.append(response.choices[0].message)

    bmkeys = []

    if tool_calls:
        for tool_call in tool_calls:
            # Extract the function name and arguments
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            logger.info(f"Tool Call: {name} with args: {args}")

            # Execute the tool function
            result = await execute_tool(name, args)

            logger.info(f"Tool Result: {str(result)[:500]}")

            # Extract bmkeys only if result is a dictionary and contains the expected key
            if isinstance(result, dict):
                bmkeys = result.get("unique_model_keys (bmkey)", [])

            # Send the result back to the model
            messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": str(result)}
            )

    logger.info(str(messages))

    # Send back the final response incorporating the tool result
    completion = client.chat.completions.create(
        name="GET_RESPONSE_WITH_TOOLS::PROCESS_TOOL_RESULTS",
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        metadata={
            "tool_calls": tool_calls,
        },
    )

    final_response = completion.choices[0].message.content

    logger.info(f"LLM Response: {final_response}")

    return final_response, bmkeys


async def analyse_vcml(biomodel_id: str):
    """
    Analyze VCML content for a given biomodel.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
    returns:
        str: The VCML analysis response.
    """
    try:
        # Fetch VCML details
        logger.info(f"Fetching VCML file for biomodel: {biomodel_id}")
        vcml = await get_vcml_file(biomodel_id, truncate=False)
        # Analyze VCML with LLM
        logger.info(
            f"Analyzing VCML file for biomodel: {biomodel_id} with content: {str(vcml[:500])}"
        )
        vcml_system_prompt = "You are a VCell BioModel Assistant, designed to help users understand and interact with biological models in VCell. Your task is to provide human-readable, concise responses based on the given VCML."
        vcml_prompt = f"Analyze the following VCML content for Biomodel {biomodel_id}: {str(vcml)}"
        vcml_analysis = await get_llm_response(vcml_system_prompt, vcml_prompt)
        return vcml_analysis
    except Exception as e:
        logger.error(
            f"Error analyzing VCML for biomodel {biomodel_id}: {str(e)}", exc_info=True
        )
        return f"An error occurred during VCML analysis: {str(e)}"


async def analyse_biomodel(biomodel_id: str, user_prompt: str):
    """
    Analyze user query with biomodel context.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
        user_prompt (str): The user's query or request.
    returns:
        str: The AI analysis response.
    """
    try:
        # Fetch Biomodel Information using BiomodelRequestParams
        params_dict = {
            "bmId": biomodel_id,
            "bmName": "",
            "category": "all",
            "owner": "",
            "startRow": 1,
            "maxRows": 1,
            "orderBy": "date_desc",
        }
        # Fetch biomodel details
        biomodel_params = BiomodelRequestParams(**params_dict)
        biomodels_info = await fetch_biomodels(biomodel_params)
        # Include relevant biomodel details in the user prompt
        biomodel_info = f"Here is some information about Biomodel {biomodel_id}: {str(biomodels_info)}"
        enhanced_user_prompt = f"{biomodel_info}\n\n{user_prompt}"
        # Analyze the user prompt with added biomodel context
        system_prompt = "You are a VCell BioModel Assistant, designed to help users understand and interact with biological models in VCell. Your task is to provide human-readable, accurate responses based on the given data. Give a response to the user's query, considering the provided biomodel information."
        user_analysis_response = await get_llm_response(
            system_prompt, enhanced_user_prompt
        )
        return user_analysis_response
    except Exception as e:
        logger.error(f"Error analyzing AI for biomodel {biomodel_id}: {str(e)}")
        return f"An error occurred during AI analysis: {str(e)}"


async def analyse_diagram(biomodel_id: str):
    """
    Analyze diagram for a given biomodel.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
    returns:
        str: The diagram analysis response.
    """
    try:
        # Fetch Biomodel Information for context
        params_dict = {
            "bmId": biomodel_id,
            "bmName": "",
            "category": "all",
            "owner": "",
            # "savedLow": None,
            # "savedHigh": None,
            "startRow": 1,
            "maxRows": 1,
            "orderBy": "date_desc",
        }
        biomodel_params = BiomodelRequestParams(**params_dict)
        biomodels_info = await fetch_biomodels(biomodel_params)
        biomodel_info = f"Here is some information about Biomodel {biomodel_id}: {str(biomodels_info)}"

        # Fetch Diagram URL
        diagram_url = await get_diagram_url(biomodel_id)
        # Diagram Analysis
        diagram_analysis_prompt = (
            "You are a VCell BioModel Assistant, designed to help users understand and interact with biological models in VCell. "
            + biomodel_info
            + "Your task is to analyze the diagram of the biomodel and provide a concise description of its components, interactions, and any other relevant information. "
        )
        diagram_analysis_prompt = [
            {"type": "text", "text": diagram_analysis_prompt},
            {"type": "image_url", "image_url": {"url": diagram_url}},
        ]
        response = client.chat.completions.create(
            name="ANALYSE_DIAGRAM",
            model=settings.AZURE_DEPLOYMENT_NAME,
            messages=[
                {
                    "role": "user",
                    "content": diagram_analysis_prompt,
                }
            ],
        )
        diagram_analysis = response.choices[0].message.content
        return diagram_analysis
    except Exception as e:
        logger.error(f"Error analyzing diagram for biomodel {biomodel_id}: {str(e)}")
        return f"An error occurred during diagram analysis: {str(e)}"
