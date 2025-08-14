from app.core.logger import get_logger
import httpx
import asyncio
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams
from urllib.parse import urlencode, quote
from langfuse import observe

VCELL_API_BASE_URL = "https://vcell.cam.uchc.edu/api/v0"

logger = get_logger("vcelldb_service")

async def check_vcell_connectivity() -> bool:
    """
    Check if the VCell API is reachable by attempting to resolve the hostname.
    
    Returns:
        bool: True if the API is reachable, False otherwise.
    """
    try:
        import socket
        hostname = "vcell.cam.uchc.edu"
        logger.info(f"Checking connectivity to {hostname}")
        
        # Try to resolve the hostname
        ip_address = socket.gethostbyname(hostname)
        logger.info(f"Successfully resolved {hostname} to {ip_address}")
        return True
    except socket.gaierror as e:
        logger.error(f"DNS resolution failed for {hostname}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error checking connectivity: {e}")
        return False


@observe(name="FETCH_BIOMODELS")
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


@observe(name="FETCH_SIMULATION_DETAILS")
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


@observe(name="GET_VCML_FILE")
async def get_vcml_file(biomodel_id: str, truncate: bool = False, max_retries: int = 3) -> str:
    """
    Fetches the VCML file content for a given biomodel with retry logic.

    Args:
        biomodel_id (str): ID of the biomodel.
        truncate (bool): Whether to truncate the VCML file.
        max_retries (int): Maximum number of retry attempts.
    Returns:
        str: VCML content of the biomodel.
    """
    logger.info(f"Fetching VCML file for biomodel: {biomodel_id}")
    
    # Check connectivity first
    if not await check_vcell_connectivity():
        logger.error("VCell API is not reachable. Please check your network connection and DNS settings.")
        raise Exception("VCell API is not reachable. Please check your network connection and DNS settings.")
    
    for attempt in range(max_retries + 1):
        try:
            url = f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.vcml"
            logger.info(f"Requesting URL: {url} (attempt {attempt + 1}/{max_retries + 1})")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                logger.info(f"Response status: {response.status_code}")
                logger.info(f"Response headers: {dict(response.headers)}")
                response.raise_for_status()
                
                if truncate:
                    return response.text[:500]
                else:
                    return response.text
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching VCML file for biomodel {biomodel_id}: {e.response.status_code} - {e.response.text}")
            if attempt == max_retries:
                raise e
            logger.warning(f"Retrying in {2 ** attempt} seconds...")
            await asyncio.sleep(2 ** attempt)
            
        except httpx.RequestError as e:
            logger.error(f"Request error fetching VCML file for biomodel {biomodel_id}: {str(e)}")
            if attempt == max_retries:
                raise e
            logger.warning(f"Retrying in {2 ** attempt} seconds...")
            await asyncio.sleep(2 ** attempt)
            
        except Exception as e:
            logger.error(f"Unexpected error fetching VCML file for biomodel {biomodel_id}: {str(e)}")
            if attempt == max_retries:
                raise e
            logger.warning(f"Retrying in {2 ** attempt} seconds...")
            await asyncio.sleep(2 ** attempt)
    
    # This should never be reached, but just in case
    raise Exception(f"Failed to fetch VCML file for biomodel {biomodel_id} after {max_retries + 1} attempts")


@observe(name="GET_SBML_FILE")
async def get_sbml_file(biomodel_id: str) -> str:
    """
    Fetches the SBML file content for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        str: SBML content of the biomodel.
    """
    try:
        url = f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.sbml"
        logger.info(f"Requesting SBML file URL: {url}")
        
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching SBML file for biomodel {biomodel_id}: {e.response.status_code} - {e.response.text}")
        raise e
    except httpx.RequestError as e:
        logger.error(f"Request error fetching SBML file for biomodel {biomodel_id}: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error fetching SBML file for biomodel {biomodel_id}: {str(e)}")
        raise e


@observe(name="GET_DIAGRAM_URL")
async def get_diagram_url(biomodel_id: str) -> str:
    """
    Gets diagram image URL for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        str: URL pointing to the biomodel's diagram image.
    """
    return f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/diagram"


@observe(name="GET_DIAGRAM_IMAGE")
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


@observe(name="FETCH_BIOMODEL_APPLICATIONS_FILES")
async def fetch_biomodel_applications_files(biomodel_id: str) -> dict:
    """
    Fetch applications data along with SBML and BNGL file URLs for a given biomodel.

    Args:
        biomodel_id (str): ID of the biomodel.

    Returns:
        dict: A dictionary containing applications data and file URLs for each application.
    """
    params = BiomodelRequestParams(bmId=biomodel_id)
    logger.info(f"Fetching biomodel applications files for biomodel: {biomodel_id}")
    biomodel_data = await fetch_biomodels(params)
    logger.info(f"Biomodel data: {biomodel_data}")
    applications = []
    if biomodel_data.get("data") and len(biomodel_data["data"]) > 0:
        biomodel = biomodel_data["data"][0]
        applications = biomodel.get("applications", [])
    logger.info(f"Applications: {applications}")
    # Generate file URLs for each application
    applications_with_files = []
    for app in applications:
        app_name = app.get("name", "")
        # URL encode the app name for use in query parameters
        encoded_app_name = quote(app_name)

        # Create file URLs
        bngl_url = f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.bngl?appname={encoded_app_name}"
        sbml_url = f"{VCELL_API_BASE_URL}/biomodel/{biomodel_id}/biomodel.sbml?appname={encoded_app_name}"

        # Add file URLs to the application data
        app_with_files = {**app, "bngl_url": bngl_url, "sbml_url": sbml_url}
        logger.info(f"Application with files: {app_with_files}")
        applications_with_files.append(app_with_files)
    logger.info(f"Applications with files: {applications_with_files}")
    return {
        "biomodel_id": biomodel_id,
        "applications": applications_with_files,
        "total_applications": len(applications_with_files),
    }
