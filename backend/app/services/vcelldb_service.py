from app.core.logger import get_logger
import httpx
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from urllib.parse import urlencode

VCELL_API_BASE_URL = "https://vcell.cam.uchc.edu/api/v0"

logger = get_logger("vcelldb_service")


async def fetch_biomodels(params: BiomodelRequestParams) -> dict:
    """
    Fetch a list of biomodels from the VCell API based on filtering and sorting parameters.

    Args:
        params (BiomodelRequestParams): Request parameters for filtering biomodels.

    Returns:
        dict: A dictionary containing a list of biomodels with metadata.
    """
    # Transform None to "" (optional, only if needed for empty fields)
    params_dict = {k: (v if v is not None else "") for k, v in params.dict().items()}

    logger.info(f"Fetching biomodels with parameters: {params_dict}")

    # Construct the query string using urlencoded parameters (params_dict)
    query_string = urlencode(params_dict)

    # Construct the full URL
    url = f"{VCELL_API_BASE_URL}/biomodel?{query_string}"

    # Log the URL being queried
    logger.info(f"Querying URL: {url}")

    # Perform the API request
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        raw_data = response.json()

    # Extract biomodels list (assuming API returns a list directly)
    biomodels = raw_data if isinstance(raw_data, list) else raw_data.get("data", [])

    # Build response with metadata
    return {
        "search_params": params_dict,
        "models_count": len(biomodels),
        "unique_model_keys (bmkey)": [
            model.get("bmKey") for model in biomodels if model.get("bmKey")
        ],
        "data": biomodels,
    }


async def fetch_simulation_details(params: SimulationRequestParams) -> dict:
    """
    Fetch detailed information about a specific simulation for a given biomodel.

    Args:
        params (SimulationRequestParams): Contains both biomodel ID and simulation ID.

    Returns:
        Simulation: A Simulation object containing simulation details.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{VCELL_API_BASE_URL}/biomodel/{params.bmId}/simulation/{params.simId}"
        )
        response.raise_for_status()
        return response.json()


async def get_vcml_file(biomodel_id: str) -> str:
    """
    Fetches the VCML file content for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        str: VCML content of the biomodel.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.vcml"
        )
        response.raise_for_status()
        return response.text


async def get_sbml_file(biomodel_id: str) -> str:
    """
    Fetches the SBML file content for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        str: SBML content of the biomodel.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.sbml"
        )
        response.raise_for_status()
        return response.text


async def get_diagram_url(biomodel_id: str) -> str:
    """
    Gets diagram image URL for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        str: URL pointing to the biomodel's diagram image.
    """
    return f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/diagram"


async def get_diagram_image(biomodel_id: str) -> bytes:
    """
    Fetches the diagram image for a given biomodel from the VCell API and returns the image bytes.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        bytes: The image content (PNG) of the biomodel diagram.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/diagram"
        )
        response.raise_for_status()
        return response.content
