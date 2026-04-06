from typing import List
from app.services.databases_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    fetch_publications,
    fetch_bmdb_models,
    get_xml_file
)
from app.services.knowledge_base_service import get_similar_chunks
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from app.schemas.tool_schema import (
    ToolDefinition,
    ToolDefinitions,
    FunctionDefinition,
    ParameterSchema,
)
from app.core.logger import get_logger
import re

logger = get_logger("tools_utils")

# NUMBER OF ROWS TO RETURN:
min_rows = 1
max_rows = 50
default_rows = 25

# Function calling Definitions using Pydantic schema objects
fetch_biomodels_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="fetch_biomodels",
        description="Retrieves a list of biomodels from the VCell database based on various filtering criteria such as the biomodel name, category, owner, and saved date range. This allows to search for specific biomodels based on their attributes and retrieve the results.",
        parameters=ParameterSchema(
            type="object",
            properties={
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
                # "savedLow": {
                #     "type": "string",
                #     "default": "",
                #     "format": "date",
                #     "description": "The lower bound of the saved date range for biomodels. Only biomodels saved after this date will be included in the results (format: YYYY-MM-DD).",
                # },
                # "savedHigh": {
                #     "type": "string",
                #     "default": "",
                #     "format": "date",
                #     "description": "The upper bound of the saved date range for biomodels. Only biomodels saved before this date will be included in the results (format: YYYY-MM-DD).",
                # },
                "startRow": {
                    "type": "integer",
                    "default": 1,
                    "description": "The starting row for pagination. This determines the first result to be included in the response.",
                },
                "maxRows": {
                    "type": "integer",
                    "default": default_rows,
                    "minimum": min_rows,
                    "maximum": max_rows,
                    "description": "The maximum number of results to return per page.",
                },
                "orderBy": {
                    "type": "string",
                    "enum": ["date_desc", "date_asc", "name_desc", "name_asc"],
                    "default": "date_desc",
                    "description": "The order in which the biomodels should be sorted.",
                },
            },
            required=[
                "bmId",
                "bmName",
                "category",
                "owner",
                # "savedLow",
                # "savedHigh",
                "startRow",
                "maxRows",
                "orderBy",
            ],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

fetch_simulation_details_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="fetch_simulation_details",
        description="Fetches detailed information about a specific simulation id. This function allows to retrieve all available details about a simulation, including simulation parameters, solver information, and result data. Use only when biomodel id and simulation id are given.",
        parameters=ParameterSchema(
            type="object",
            properties={
                "bmId": {
                    "type": "string",
                    "description": "Biomodel ID for which simulations will be fetched",
                },
                "simId": {
                    "type": "string",
                    "description": "Simulation ID to fetch specific simulation details",
                },
            },
            required=["bmId", "simId"],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

get_vcml_file_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="get_vcml_file",
        description="Retrieves the VCML (Virtual Cell Markup Language) file content for a specified biomodel. VCML files provide a detailed, machine-readable description of a biomodel's structure and behavior, which is used for simulation and model analysis. This function allows to download the VCML representation of a biomodel for further analysis.",
        parameters=ParameterSchema(
            type="object",
            properties={
                "biomodel_id": {
                    "type": "string",
                    "description": "ID of the biomodel to retrieve VCML",
                }
            },
            required=["biomodel_id"],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

search_vcell_knowledge_base_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="search_vcell_knowledge_base",
        description="Use this tool for ANY query that is NOT about fetching specific biomodels, simulations, or VCML files from the database. This tool searches the VCell knowledge base for general information, concepts, explanations, tutorials, software usage guides, biomodel creation instructions, simulation setup help, and any VCell-related educational content. IMPORTANT: Use this tool when the user asks for knowledge, information, explanations, or help with VCell concepts - NOT when they want to fetch specific data from the database. If the retrieved chunks are not relevant to the user's question, you can discard them and not use them in your response. This tool is your primary source for answering questions about VCell functionality, concepts, and how-to information.",
        parameters=ParameterSchema(
            type="object",
            properties={
                "query": {
                    "type": "string",
                    "description": "The search query to find relevant information in the VCell knowledge base. This should be a natural language question or topic about VCell concepts, usage, tutorials, or general information.",
                },
                "limit": {
                    "type": "integer",
                    "default": 5,
                    "minimum": 1,
                    "maximum": 20,
                    "description": "The maximum number of relevant knowledge base chunks to return. Default is 5.",
                },
            },
            required=["query", "limit"],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

fetch_publications_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="fetch_publications",
        description="Retrieves a list of publications from the VCell database. This function fetches all available publications including their metadata, status information, and associated data. Publications represent research papers, models, and other scientific content available in the VCell system. If asked for publications, research papers, pubmed articles, etc. use this tool. Retrieve publications then use what you need on the user's query.",
        parameters=ParameterSchema(
            type="object",
            properties={},
            required=[],
            additionalProperties=False,
        ),
        strict=True,
    ),
)


fetch_bmdb_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="fetch_bmdb_models",
        description="Retrieves a list of biomodels from the BioModels database based on filtering criteria which is the biomodel name. This allows to search for specific biomodels in the BioModels database based on their attributes and retrieve the results.",
        parameters=ParameterSchema(
            type="object",
            properties={
                "bmId": {
                    "type": "string",
                    "default": "",
                    "description": "The unique identifier of the biomodel. This can be used to retrieve specific biomodels directly by their ID. It is under the format BIOMD followed by 10 numbers",
                },
                "bmName": {
                    "type": "string",
                    "default": "",
                    "description": "The name or part of the name of the biomodel you are searching for. This can be used to find biomodels that match the provided name or keyword.",
                },},
            required=["bmId", "bmName"],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

get_xml_file_tool = ToolDefinition(
    type="function",
    function=FunctionDefinition(
        name="get_xml_file",
        description="Retrieves the SBML XML (eXtensible Markup Language) file content for a specified BioModels model (BIOMD ID). SBML (Systems Biology Markup Language) files provide a detailed, machine-readable representation of a biomodel's structure and behavior, which is used for simulation and model analysis. This function downloads the XML representation of a biomodel for further analysis.",
        parameters=ParameterSchema(
            type="object",
            properties={
                "bmId": {
                    "type": "string",
                    "description": "ID of the biomodel to retrieve VCML",
                }
            },
            required=["bmId"],
            additionalProperties=False,
        ),
        strict=True,
    ),
)

# List of all tool definitions
ToolsDefinitions = [
    fetch_biomodels_tool,
    fetch_simulation_details_tool,
    get_vcml_file_tool,
    search_vcell_knowledge_base_tool,
    fetch_publications_tool,
]
BMDB_TOOLS = [fetch_bmdb_tool,
               get_xml_file_tool]


# IMPLEMENTATION: separating all tool definitions into subsets
DB_TOOLS = [
   fetch_biomodels_tool,
   fetch_simulation_details_tool,
   get_vcml_file_tool,
]
KB_TOOLS = [
   search_vcell_knowledge_base_tool,
]
PUB_TOOLS = [
   fetch_publications_tool,
]

# decide which subset (if any) of tools to send to the llm
# returning false skips tools and directly calls llm
# returning true allows the llm to use tools
def should_use_tools(prompt: str) -> bool:
   if not prompt:
       return False

   p = prompt.lower().strip()

    # common prefixes where tools are unnecessary
   plain_chat_prefixes = (
       "summarize this",
       "improve this",
       "make this clearer",
   )
   if p.startswith(plain_chat_prefixes):
       return False

    # each signal indicates when tools are needed
    # list of patterns that suggest a database lookup/a structured retrieval
   tool_signals = [
       r"\b(list|show|find|get|fetch|search)\b",
       r"\bmodel\b|\bmodels\b|\bbiomodel\b|\bbiomodels\b",
       r"\bsimulation\b|\bsimulations\b",
       r"\bvcml\b|\bxml\b",
       r"\bpublication\b|\bpublications\b|\bpaper\b|\bpapers\b|\bpubmed\b",
       r"\btutorial\b|\beducational\b|\bknowledge base\b",
       r"\bhow do i\b|\bhow to\b|\bwhat is vcell\b",
       r"\bBM\d+\b|\bBIOMD\d+\b",
   ]

   # if any tool signal matches then use tools
   return any(re.search(pattern, p) for pattern in tool_signals)

# select only a subset of tools based on the user prompt
def select_tools_for_prompt(prompt: str):
   p = (prompt or "").lower()

    # tools that the llm will see when making its choice
   selected = []

   # Database/data-fetch intent
   if re.search(r"\b(model|models|biomodel|biomodels|simulation|simulations|vcml|bm\d+)\b", p):
       selected.extend(DB_TOOLS)

   # Publications intent
   if re.search(r"\b(publication|publications|paper|papers|pubmed)\b", p):
       selected.extend(PUB_TOOLS)

   # Knowledge / tutorial / how-to intent
   if re.search(r"\b(tutorial|educational|knowledge base|how do i|how to|what is vcell|explain)\b", p):
       selected.extend(KB_TOOLS)

   # Default fallback: if tools are needed but no bucket matched, keep KB only.
   if not selected:
       selected = KB_TOOLS

   # De-duplicate while preserving order
   deduped = []
   seen = set()
   for tool in selected:
       name = tool.function.name
       if name not in seen:
           deduped.append(tool)
           seen.add(name)

   return deduped



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
            # if args.get("savedLow") == "":
            #     args["savedLow"] = None
            # if args.get("savedHigh") == "":
            #     args["savedHigh"] = None
            args["maxRows"] = default_rows
            params = BiomodelRequestParams(**args)
            print("DEBUG About to call fetch_biomodels()")
            return await fetch_biomodels(params)

        elif name == "fetch_simulation_details":
            params = SimulationRequestParams(**args)
            return await fetch_simulation_details(params)

        elif name == "get_vcml_file":
            return await get_vcml_file(args["biomodel_id"])

        elif name == "search_vcell_knowledge_base":
            query = args["query"]
            limit = args.get("limit", 5)
            logger.info(f"Executing tool: {name} with query {query}")
            print("DEBUG About to call search_vcell_knowledge_base")
            return get_similar_chunks(query=query, limit=limit)

        elif name == "fetch_publications":
            return await fetch_publications()
        
        elif name == "fetch_bmdb_models":
            params = BiomodelRequestParams(**args)
            return await fetch_bmdb_models(params)
        elif name == "get_xml_file":
            return await get_xml_file(args["bmId"])

        else:
            return {}

    except Exception as e:
        if name == "fetch_biomodels" or name == "fetch_simulation_details":
            return []
        else:
            return {}
