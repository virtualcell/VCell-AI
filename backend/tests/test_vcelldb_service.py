import pytest

# This tells pytest that all tests in the file should run in asyncio mode.
pytestmark = pytest.mark.asyncio

from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    fetch_biomodel_applications_files,
    fetch_biomodel_publications,
    _index_publications_by_bmkey,
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
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=1000,
            orderBy="date_desc",
        )

        result = await fetch_biomodels(params)

        # Verify the result structure
        assert result["models_count"] == 9
        assert "273924831" in result["unique_model_keys (bmkey)"]
        assert "271989751" in result["unique_model_keys (bmkey)"]

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

    async def test_fetch_biomodel_publications_success(self):
        """Test fetching the publications that reference a biomodel."""
        result = await fetch_biomodel_publications("203656156")

        assert len(result) == 1
        publication = result[0]
        assert publication["pubKey"] == "203679830"
        assert publication["doi"] == "10.1371/journal.pone.0248293"
        assert publication["pubmedid"] == "33735291"
        # pubKey, date and url must survive sanitization — the UI needs them.
        assert "date" in publication
        # Authors arrive split across array elements and must be rejoined.
        assert publication["authors"].startswith("Eroumé, K., Vasilevich, A.")
        # A biomodel's own page has no use for the other models a paper cites.
        assert "biomodelReferences" not in publication

    async def test_fetch_biomodel_publications_none(self):
        """Test a biomodel that no publication references."""
        assert await fetch_biomodel_publications("211211962") == []

    def test_index_publications_by_bmkey_fans_out(self):
        """A publication referencing several biomodels is indexed under each."""
        index = _index_publications_by_bmkey(
            [
                {
                    "pubKey": "1",
                    "title": "Two models",
                    "biomodelReferences": [{"bmKey": "10"}, {"bmKey": "20"}],
                },
                {
                    "pubKey": "2",
                    "title": "Also cites 10",
                    "biomodelReferences": [{"bmKey": "10"}],
                },
                {"pubKey": "3", "title": "No models", "biomodelReferences": []},
            ]
        )

        assert sorted(index) == ["10", "20"]
        assert [p["pubKey"] for p in index["10"]] == ["1", "2"]
        assert [p["pubKey"] for p in index["20"]] == ["1"]
