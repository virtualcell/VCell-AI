from app.services.vcelldb_service import fetch_biomodels, fetch_simulation_details, get_vcml_file

# Function calling Definitions
ToolsDefinitions = [
    {
        "type": "function",
        "function": {
            "name": "fetch_biomodels",
            "description": "Fetch a list of biomodels based on user query parameters like name, category, and owner.",
            "stric": True,
            "parameters": {
                "type": "object",
                "properties": {
                    "bmName": {"type": "string", "description": "Name of the biomodel"},
                    "category": {"type": "string", "enum": ["all", "public", "shared", "tutorials", "educational"], "description": "Category of biomodel"},
                    "owner": {"type": "string", "description": "Owner of the biomodel"},
                    "savedLow": {"type": "string", "format": "date", "description": "Lower bound of the saved date range (YYYY-MM-DD)"},
                    "savedHigh": {"type": "string", "format": "date", "description": "Upper bound of the saved date range (YYYY-MM-DD)"},
                    "startRow": {"type": "integer", "default": 1, "description": "Starting row for pagination"},
                    "maxRows": {"type": "integer", "default": 10, "description": "Maximum number of results to return"},
                    "orderBy": {"type": "string", "enum": ["date_desc", "date_asc", "name_desc", "name_asc"], "default": "date_desc", "description": "Sort order"}
                },
                "required": ["bmName", "category", "owner", "savedLow", "savedHigh", "startRow", "maxRows", "orderBy"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_simulation_details",
            "description": "Fetch detailed information about a specific simulation for a given biomodel.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bmId": {"type": "string", "description": "Biomodel ID for which simulations will be fetched"},
                    "simId": {"type": "string", "description": "Simulation ID to fetch specific simulation details"}
                },
                "required": ["bmId", "simId"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_vcml_file",
            "description": "Fetches the VCML file content for a given biomodel to obtain more details on that biomodel.",
            "parameters": {
                "type": "object",
                "properties": {
                    "biomodel_id": {"type": "string", "description": "ID of the biomodel to retrieve VCML"}
                },
                "required": ["biomodel_id"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
]
  

# Tool Executor Function
async def execute_tool(name, args):
    """
    Executes a function based on the provided tool name and arguments.
    Args:
        name (str): The name of the function to call (tool).
        args (dict): The arguments to pass to the function.
    Returns:
        The result of the function call.
    """
    if name == "fetch_biomodels":
        return await fetch_biomodels(args)
    elif name == "fetch_simulation_details":
        return await fetch_simulation_details(args)
    elif name == "get_vcml_file":
        return await get_vcml_file(args["biomodel_id"])
    else:
        return {"Error": "Function Failed to Execute."}