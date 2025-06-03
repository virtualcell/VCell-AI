import httpx
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams

VCELL_API_BASE_URL = "https://vcell.cam.uchc.edu/api/v0"


async def fetch_biomodels(params: BiomodelRequestParams) -> dict:
    """
    Fetch a list of biomodels from the VCell API based on filtering and sorting parameters.

    Args:
        params (BiomodelRequestParams): Request parameters for filtering biomodels.

    Returns:
        dict: A dictionary containing a list of biomodels and total count.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{VCELL_API_BASE_URL}/biomodel", params=params.dict(exclude_none=True)
        )
        response.raise_for_status()
        return response.json()


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
        response = await client.get(f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.vcml")
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
        response = await client.get(f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.sbml")
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
