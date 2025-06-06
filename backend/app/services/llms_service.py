from app.utils.tools_utils import (
    ToolsDefinitions as tools,
    execute_tool,
)
from app.core.singleton import get_openai_client
from app.core.config import settings
import json

client = get_openai_client()

async def get_response_with_tools(user_prompt: str): 
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Stick strictly to the user's query and provide precise answers. Do not make assumptions or infer missing information; if details are missing, just leave it empty."},
        {"role": "user", "content": user_prompt}
    ]

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
            print(name)
            print(args)
            # Execute the tool function
            result = await execute_tool(name, args)
            
            # Send the result back to the model
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })

    # Send back the final response incorporating the tool result
    completion = client.chat.completions.create(
        model=settings.AZURE_DEPLOYMENT_NAME,
        messages=messages,
        tools=tools,
    )

    return completion.choices[0].message.content