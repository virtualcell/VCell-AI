import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    fetch_biomodel_applications_files,
)
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams


class TestVCellDBService:
    """Test class for VCell DB service functions."""

    async def test_fetch_biomodels_success(self):
        """Test successful biomodel fetching."""
        # Create test parameters
        params = BiomodelRequestParams(
            bmId="",
            bmName="calcium",
            category="all",
            owner="",
            savedLow="",
            savedHigh="",
            startRow=1,
            maxRows=1000,
            orderBy="date_desc",
        )

        result = await fetch_biomodels(params)

        # Verify the result structure
        assert result["models_count"] == 9
        assert "273924831" in result["unique_model_keys (bmkey)"]
        assert "271989751" in result["unique_model_keys (bmkey)"]
        assert result["data"][0]["bmName"] == "MouseSpermCalcium"

    async def test_fetch_simulation_details_success(self):
        """Test successful simulation details fetching."""
        params = SimulationRequestParams(bmId="273924831", simId="263874941")

        result = await fetch_simulation_details(params)

        assert result["key"] == "263874941"
        assert result["ownerName"] == "Juliajessica"
        assert result["ownerKey"] == "121396185"
        assert result["mathKey"] == "263874891"

    async def test_get_vcml_file_truncated(self):
        """Test VCML file fetching with truncation."""
        result = await get_vcml_file("273924831", truncate=True)

        assert len(result) == 500
        assert "MouseSpermCalcium" in result
        assert "<?xml version=" in result

    async def test_fetch_biomodel_applications_files_success(self):
        """Test successful biomodel applications files fetching."""

        result = await fetch_biomodel_applications_files("273924831")

        assert result["biomodel_id"] == "273924831"
        assert result["total_applications"] == 2
        assert len(result["applications"]) == 2

        # Check that file URLs were generated
        app0 = result["applications"][0]
        assert "bngl_url" in app0
        assert "sbml_url" in app0
        assert "263874893" in app0["key"]
        assert "Application0" in app0["name"]
