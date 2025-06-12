from app.utils.tools_utils import (
    ToolsDefinitions as tools,
    execute_tool,
)
from app.core.singleton import get_openai_client
from app.core.config import settings
import json
from app.core.logger import get_logger

logger = get_logger("llm_service")

client = get_openai_client()

SYSTEM_PROMPT = """
You are a VCell BioModel Assistant, designed to help users understand and interact with biological models in VCell. Your task is to provide human-readable, accurate, detailed, and contextually appropriate responses based on the tools available. The following are specific instructions and guidelines you must follow to perform your role effectively:

### Guidelines
* Stick strictly to the user’s query.
* Do not make assumptions or inferences about missing or incomplete information in the user's input.
* Provide elaborate, fact-based responses based solely on the available tool results.
* You can call tools multiple times if needed to gather sufficient data or refine your answer.
* If asked about irrelevant topics, politely decline to answer.
"""


async def get_response_with_tools(user_prompt: str):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {"role": "user", "content": user_prompt},
    ]

    logger.info(f"User prompt: {user_prompt}")

    response = client.chat.completions.create(
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )

    # Handle the tool calls
    tool_calls = response.choices[0].message.tool_calls

    messages.append(response.choices[0].message)

    if tool_calls:
        for tool_call in tool_calls:
            # Extract the function name and arguments
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            logger.info(f"Tool Call: {name} with args: {args}")

            # Execute the tool function
            result = await execute_tool(name, args)

            logger.info(f"Tool Result: {str(result)[:500]}")

            # Send the result back to the model
            messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": str(result)}
            )

    # Send back the final response incorporating the tool result
    completion = client.chat.completions.create(
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        tools=tools,
        max_tokens=10000,
    )

    final_response = completion.choices[0].message.content

    logger.info(f"LLM Response: {final_response}")

    return final_response
