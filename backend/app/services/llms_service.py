from app.utils.tools_utils import (
    ToolsDefinitions as tools,
    execute_tool,
)

from app.services.vcelldb_service import (
    fetch_biomodels,
    get_vcml_file,
    get_diagram_url,
    get_diagram_image,
)

from app.utils.system_prompt import SYSTEM_PROMPT

from app.schemas.vcelldb_schema import BiomodelRequestParams
from app.core.litellm import get_litellm_client
from app.core.config import settings
import json
import base64
from app.core.logger import get_logger

logger = get_logger("llm_service")

LOCAL_MODEL = "local-model"


def _key_for_model(virtual_key: str, model: str) -> str:
    """
    A user's budget is enforced across every model on their virtual key, so
    retrying a budget-exceeded request against local-model with that same
    key would just fail again. Use the unconstrained master key instead.
    """
    if model == LOCAL_MODEL and settings.LITELLM_MASTER_KEY:
        return settings.LITELLM_MASTER_KEY
    return virtual_key


def _is_budget_error(error: Exception) -> bool:
    status_code = getattr(error, "status_code", None)
    error_text = str(error).lower()
    return status_code in {400, 402, 429} and any(
        marker in error_text for marker in ("budget", "quota", "limit", "exceeded")
    )


async def _create_chat_completion(virtual_key: str, model: str, **kwargs):
    """
    Call the requested model; on a budget-exceeded error, silently retry
    against local-model using the master key.
    """
    client = get_litellm_client(_key_for_model(virtual_key, model))
    try:
        return await client.chat.completions.create(model=model, **kwargs)
    except Exception as error:
        if model != LOCAL_MODEL and _is_budget_error(error):
            logger.info(
                f"Budget limit reached for {model}; falling back to {LOCAL_MODEL}"
            )
            local_client = get_litellm_client(_key_for_model(virtual_key, LOCAL_MODEL))
            return await local_client.chat.completions.create(
                model=LOCAL_MODEL, **kwargs
            )
        raise


async def get_llm_response(
    system_prompt: str,
    user_prompt: str,
    virtual_key: str,
    model: str,
):
    """
    Helper function to get a response from the LLM.
    args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user's query or request.
        virtual_key (str): The caller's LiteLLM virtual key.
        model (str): The LiteLLM model alias to use.
    returns:
        str: The response from the LLM.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    response = await _create_chat_completion(
        virtual_key,
        model,
        messages=messages,
    )

    return response.choices[0].message.content


async def get_response_with_tools(
    conversation_history: list[dict],
    virtual_key: str,
    model: str,
) -> tuple[str, list, str]:
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
    ]

    messages = messages + conversation_history

    user_prompt = conversation_history[-1]["content"]

    logger.info(f"User prompt: {user_prompt}")

    response = await _create_chat_completion(
        virtual_key,
        model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    # Handle the tool calls
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    messages.append(response_message.model_dump(exclude_none=True))

    bmkeys = []

    if not tool_calls:
        final_response = response_message.content or ""
        logger.info(f"LLM Response: {final_response}")
        return final_response, bmkeys, response.model

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
    completion = await _create_chat_completion(
        virtual_key,
        model,
        messages=messages,
    )

    final_response = completion.choices[0].message.content

    logger.info(f"LLM Response: {final_response}")

    return final_response, bmkeys, completion.model


async def analyse_vcml(biomodel_id: str, virtual_key: str, model: str):
    """
    Analyze VCML content for a given biomodel.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
        virtual_key (str): The caller's LiteLLM virtual key.
        model (str): The LiteLLM model alias to use.
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
        vcml_analysis = await get_llm_response(
            vcml_system_prompt, vcml_prompt, virtual_key, model
        )
        return vcml_analysis
    except Exception as e:
        logger.error(
            f"Error analyzing VCML for biomodel {biomodel_id}: {str(e)}", exc_info=True
        )
        return f"An error occurred during VCML analysis: {str(e)}"


async def analyse_biomodel(
    biomodel_id: str, user_prompt: str, virtual_key: str, model: str
):
    """
    Analyze user query with biomodel context.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
        user_prompt (str): The user's query or request.
        virtual_key (str): The caller's LiteLLM virtual key.
        model (str): The LiteLLM model alias to use.
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
            system_prompt, enhanced_user_prompt, virtual_key, model
        )
        return user_analysis_response
    except Exception as e:
        logger.error(f"Error analyzing AI for biomodel {biomodel_id}: {str(e)}")
        return f"An error occurred during AI analysis: {str(e)}"


async def analyse_diagram(biomodel_id: str, virtual_key: str, model: str):
    """
    Analyze diagram for a given biomodel.

    args:
        biomodel_id (str): The ID of the biomodel to analyze.
        virtual_key (str): The caller's LiteLLM virtual key.
        model (str): The LiteLLM model alias to use.
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

        # Fetch Diagram Image as bytes and convert to base64
        diagram_image_bytes = await get_diagram_image(biomodel_id)
        diagram_base64 = base64.b64encode(diagram_image_bytes).decode('utf-8')
        
        # Diagram Analysis
        diagram_analysis_prompt = (
            "You are a VCell BioModel Assistant, designed to help users understand and interact with biological models in VCell. "
            + biomodel_info
            + "Your task is to analyze the diagram of the biomodel and provide a concise description of its components, interactions, and any other relevant information. "
        )
        diagram_analysis_prompt = [
            {"type": "text", "text": diagram_analysis_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{diagram_base64}"}},
        ]
        response = await _create_chat_completion(
            virtual_key,
            model,
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
