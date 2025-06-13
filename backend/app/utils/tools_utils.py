from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
)
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.core.logger import get_logger

logger = get_logger("tools_utils")

# Function calling Definitions
ToolsDefinitions = [
    {
        "type": "function",
        "function": {
            "name": "fetch_biomodels",
            "description": "Retrieves a list of biomodels from the VCell database based on various filtering criteria such as the biomodel name, category, owner, and saved date range. This allows to search for specific biomodels based on their attributes and retrieve the results.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bmId": {
                        "type": "string",
                        "default": "",
                        "description": "The unique identifier of the biomodel. This can be used to retrieve specific biomodels directly by their ID.",
                    },
                    "bmName": {
                        "type": "string",
                        "default": "",
                        "description": "The name or part of the name of the biomodel you are searching for. This can be used to find biomodels that match the provided name or keyword.",
                    },
                    "category": {
                        "type": "string",
                        "enum": ["all", "public", "shared", "tutorial", "educational"],
                        "description": "The category under which the biomodels are classified. Options include: 'all', 'public', 'shared', 'tutorial', and 'educational'.",
                    },
                    "owner": {
                        "type": "string",
                        "default": "",
                        "description": "The owner of the biomodel. This filter allows users to search for biomodels owned by a specific user.",
                    },
                    "savedLow": {
                        "type": "string",
                        "default": "",
                        "format": "date",
                        "description": "The lower bound of the saved date range for biomodels. Only biomodels saved after this date will be included in the results (format: YYYY-MM-DD).",
                    },
                    "savedHigh": {
                        "type": "string",
                        "default": "",
                        "format": "date",
                        "description": "The upper bound of the saved date range for biomodels. Only biomodels saved before this date will be included in the results (format: YYYY-MM-DD).",
                    },
                    "startRow": {
                        "type": "integer",
                        "default": 1,
                        "description": "The starting row for pagination. This determines the first result to be included in the response.",
                    },
                    "maxRows": {
                        "type": "integer",
                        "default": 1000,
                        "description": "The maximum number of results to return per page.",
                    },
                    "orderBy": {
                        "type": "string",
                        "enum": ["date_desc", "date_asc", "name_desc", "name_asc"],
                        "default": "date_desc",
                        "description": "The order in which the biomodels should be sorted.",
                    },
                },
                "required": [
                    "bmId",
                    "bmName",
                    "category",
                    "owner",
                    "savedLow",
                    "savedHigh",
                    "startRow",
                    "maxRows",
                    "orderBy",
                ],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_simulation_details",
            "description": "Fetches detailed information about a specific simulation id. This function allows to retrieve all available details about a simulation, including simulation parameters, solver information, and result data. Use only when biomodel id and simulation id are given.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bmId": {
                        "type": "string",
                        "description": "Biomodel ID for which simulations will be fetched",
                    },
                    "simId": {
                        "type": "string",
                        "description": "Simulation ID to fetch specific simulation details",
                    },
                },
                "required": ["bmId", "simId"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_vcml_file",
            "description": "Retrieves the VCML (Virtual Cell Markup Language) file content for a specified biomodel. VCML files provide a detailed, machine-readable description of a biomodel’s structure and behavior, which is used for simulation and model analysis. This function allows to download the VCML representation of a biomodel for further analysis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "biomodel_id": {
                        "type": "string",
                        "description": "ID of the biomodel to retrieve VCML",
                    }
                },
                "required": ["biomodel_id"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
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
    try:
        if name == "fetch_biomodels":
            logger.info(f"Executing tool: {name}")
            # Handle empty fields and validate
            if args.get("savedLow") == "":
                args["savedLow"] = None
            if args.get("savedHigh") == "":
                args["savedHigh"] = None
            args["maxRows"] = 1000
            params = BiomodelRequestParams(**args)
            return await fetch_biomodels(params)

        elif name == "fetch_simulation_details":
            params = SimulationRequestParams(**args)
            return await fetch_simulation_details(params)

        elif name == "get_vcml_file":
            return await get_vcml_file(args["biomodel_id"])

        else:
            return {}

    except Exception as e:
        if name == "fetch_biomodels" or name == "fetch_simulation_details":
            return []
        else:
            return {}
