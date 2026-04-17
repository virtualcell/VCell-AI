# IMPLEMENTATION: separating tools into subsets and sending only relevant tools to llm
from app.utils.tools_utils import (
   BMDB_TOOLS as bmdbtools,
   execute_tool,
   select_tools_for_prompt,
   should_use_tools,
   default_rows,
)

from app.services.databases_service import (
    fetch_biomodels,
    get_vcml_file,
    get_diagram_url,
)

from app.utils.system_prompt import SYSTEM_PROMPT
from app.utils.bmdb_system_prompt import BMDB_SYSTEM_PROMPT
from app.utils.vcdb_system_prompt import VCDB_SYSTEM_PROMPT

from app.schemas.vcelldb_schema import BiomodelRequestParams
from app.core.singleton import get_openai_client
from app.core.config import settings
import json
from app.core.logger import get_logger

import time

# adding specific time logs for easier profiling
def log_timing(label: str, start: float):
    duration = time.perf_counter() - start
    logger.info(f"{label}: {duration:.3f}s")

logger = get_logger("llm_service")
client = get_openai_client()

# IMPLEMENTATION: extract the last user message from the conversation history
def _last_user_message(conversation_history: list[dict]) -> str:
   for msg in reversed(conversation_history):
       if msg.get("role") == "user" and msg.get("content"):
           return str(msg["content"]).strip()
   return ""

# IMPLEMENTATION: directly call llm without any tools for simple, conversational queries
def _direct_chat_completion(messages: list[dict]) -> str:
   response = client.chat.completions.create(
       name="GET_RESPONSE_DIRECT",
       model=settings.AZURE_DEPLOYMENT_NAME,
       messages=messages,
   )
   return response.choices[0].message.content or ""


# do not change the tool call formatting, only shorten results
# this way the llm will stop returning false results
def summarize_tool_result(result):
    if isinstance(result, dict) and "models" in result:
        return {
            "models": [
                {
                    "id": m.get("id"),
                    "name": m.get("name"),
                    "description": m.get("description", "")[:200],
                    "score": m.get("score"),  # keep useful signals
                }
                for m in result["models"][:5]
            ],
            "total": result.get("total"),
        }

    return result 


# adding specific time logs for easier profiling
async def timed_tool_call(name, args):
    start = time.perf_counter()
    result = await execute_tool(name, args)
    log_timing(f"TOOL {name}", start)
    return result



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


async def get_response_with_tools(conversation_history: list[dict], database: str):
    # start the total request timer for timing of the entire process
    total_start = time.perf_counter()
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + (BMDB_SYSTEM_PROMPT if database == "bmdb" else VCDB_SYSTEM_PROMPT),
        },
    ]

    messages = messages + conversation_history

    # create a summary string of all timing logs to print to frontend
    tool_summary = ""

    # llm tool selection call
    llm1_start = time.perf_counter()

    if database == "bmdb":
        print("DEBUG20: BMDB POST: get_response_with_tools")
        response = client.chat.completions.create(
            model=settings.AZURE_DEPLOYMENT_NAME,
            messages=messages,
            tools=bmdbtools,
            tool_choice="auto",
        )

    # IMPLEMENTATION: changing the way llm sees/chooses tools
    elif database == "vcdb":
        # extract last user message
        user_prompt = _last_user_message(conversation_history)
        logger.info(f"User prompt: {user_prompt}")

        # avoid the tool-calling process for simple, conversational promptsß
        if not should_use_tools(user_prompt):
            # if no tools are used, then skip to immediate response
            llm_direct_start = time.perf_counter()

            # generate the response directly
            final_response = _direct_chat_completion(messages)

            # log timing for profiling
            log_timing("LLM direct (no tools)", llm_direct_start)
            log_timing("TOTAL REQUEST", total_start)

            # return response with no tool calls
            return final_response, [], "" # no tool summary since no tools used

        # only include relevant tools to the llm instead of all tools
        selected_tools = select_tools_for_prompt(user_prompt)
        logger.info(f"TOOL SUBSET: {selected_tools}")

        # first llm call to decide which tool to use from the given subset
        response = client.chat.completions.create(
            name="GET_RESPONSE_WITH_TOOLS::RETRIEVE_TOOLS",
            model=settings.AZURE_DEPLOYMENT_NAME,
            messages=messages,
            tools=selected_tools,
            tool_choice="auto",
        )
    
        # log timing after the llm selects which tool to use
        log_timing("LLM1 - selecting tools from the subset", llm1_start)
        llm1_time = time.perf_counter() - llm1_start
        print(selected_tools)
        tool_summary += f"*We selected subset tools: {', '.join([t.function.name for t in selected_tools])}* "
        tool_summary += f"*The LLM call to select tools from the subset took {llm1_time:.2f}s.* "
    tool_summary += f"*The LLM chose to use {len(response.choices[0].message.tool_calls)} tool(s) from the subset.* "

    # Handle the tool calls
    tool_calls = response.choices[0].message.tool_calls

    messages.append(response.choices[0].message)

    bmkeys = []


    # introduce a fast path: if no tool_calls, return immediately
    if not tool_calls:
       direct_text = response.choices[0].message or ""
       logger.info(f"LLM Response (no tools): {direct_text}")
       return direct_text, bmkeys, ""

    # perform tool calls concurrently rather than sequentially to reduce response time
    if tool_calls:
        import asyncio
        import json

        # execute all tool calls concurrently
        tasks = []
        parsed_calls = []
        tool_timings = [] 

        for tool_call in tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            parsed_calls.append((tool_call, name, args))
            tasks.append(timed_tool_call(name, args))

        # log timing for how long the tool calls take to execute in total 
        tools_total_start = time.perf_counter()
        results = await asyncio.gather(*tasks)

        # log total time for all tool calls together
        tools_total_time = time.perf_counter() - tools_total_start
        log_timing("EXECUTION OF TOOL CALLS", tools_total_start)
        tool_summary += f"*Executing the tool calls took {tools_total_time:.2f}s.* "


        for (tool_call, name, args), result in zip(parsed_calls, results):
            compact_result = summarize_tool_result(result)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(compact_result, ensure_ascii=False),
            })

            # log timing for each individual tool call
            tool_timings.append({
            "tool_name": name,
            "args": args,
            "duration_s": round(time.perf_counter() - tools_total_start, 3)
            })
        logger.info(f"Individual tool call timings: {tool_timings}")
        tool_summary += f"Executing each tool call took: " + ", ".join([f"{t['tool_name']} ({t['duration_s']}s)" for t in tool_timings]) + "."

        # extract the bmkeys
        for tool_call in tool_calls:
            bmkeys = []
            # Extract bmkeys only if result is a dictionary and contains the expected key
            if isinstance(result, dict):
                if database == "vcdb":
                    bmkeys = result.get("unique_model_keys (bmkey)", [])
                elif database == "bmdb":
                    bmdb_models = result.get("data", [])
                    bmkeys = [model.get("id") for model in bmdb_models if model.get("id")]

            
    logger.info("DEBUG100-START")
    print(len(str(messages)))
    print("DEBUG100: ", messages)

    # log timing for the final llm call that uses the tool result
    llm2_start = time.perf_counter()

    # Send back the final response incorporating the tool result
    completion = client.chat.completions.create(
        name="GET_RESPONSE_WITH_TOOLS::PROCESS_TOOL_RESULTS",
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        # metadata={
        #     "tool_calls": tool_calls,
        # },
    )

    llm2_time = time.perf_counter() - llm2_start
    log_timing("LLM2 (final response)", llm2_start)
    tool_summary += f"*The final LLM call took {llm2_time:.2f}s.* "

    logger.info("DEBUG100-END")

    final_response = completion.choices[0].message.content

    logger.info(f"LLM Response: {final_response}")
    log_timing("TOTAL REQUEST TIME (from initial request to final output)", total_start)
    total_time = time.perf_counter() - total_start
    tool_summary += f"*Total request time: {total_time:.2f}s.*"
    tool_summary += f"\n*Max rows fetched for list of biomodels was {default_rows}.*"

    return final_response, bmkeys, tool_summary


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
