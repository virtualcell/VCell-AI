TOOL_SELECTION_PROMPT = """You have access to the following tools. Based on the user's message, decide if any tool should be called.

Available tools:
1. fetch_biomodels - Search/retrieve biomodels from VCell database. Args: bmId (str), bmName (str), category (str: all|public|shared|tutorial|educational), owner (str), startRow (int, default 1), maxRows (int, default 1000), orderBy (str: date_desc|date_asc|name_desc|name_asc)
2. fetch_simulation_details - Get details of a specific simulation. Args: bmId (str), simId (str)
3. get_vcml_file - Get VCML file content for a biomodel. Args: biomodel_id (str)
4. search_vcell_knowledge_base - Search VCell knowledge base for general info, concepts, tutorials. Args: query (str), limit (int, default 5)
5. fetch_publications - Get list of publications from VCell. No args required.

If the user's question requires a tool, respond with ONLY a JSON object like:
{"tool": "tool_name", "args": {"arg1": "value1"}}

If the user's question is general conversation or doesn't need a tool, respond with:
{"tool": "none"}

IMPORTANT: Respond with ONLY the JSON object, nothing else."""