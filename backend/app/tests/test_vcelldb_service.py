import pytest
import httpx
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.services.vcelldb_service import (
    fetch_biomodels,
    fetch_simulation_details,
    get_vcml_file,
    get_sbml_file,
    get_diagram_url,
    get_diagram_image,
    fetch_biomodel_applications_files,
)
from app.schemas.vcelldb_schema import BiomodelRequestParams, SimulationRequestParams


class TestVCellDBService:
    """Test class for VCell DB service functions."""

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_success(self, mock_async_client):
        """Test successful biomodel fetching."""
        # Mock the async client context manager
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        # Mock the response
        mock_response = Mock()
        mock_response.json.return_value = [
            {"bmKey": "123", "name": "Test Model 1"},
            {"bmKey": "456", "name": "Test Model 2"}
        ]
        mock_client.get.return_value = mock_response
        
        # Create test parameters
        params = BiomodelRequestParams(
            bmId="123",
            bmName="Test",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        result = await fetch_biomodels(params)
        
        # Verify the result structure
        assert result["status"] == "success" if "status" in result else True
        assert len(result["data"]) == 2
        assert result["models_count"] == 2
        assert "123" in result["unique_model_keys (bmkey)"]
        assert "456" in result["unique_model_keys (bmkey)"]
        assert result["search_params"]["bmName"] == "Test"
        
        # Verify the API call
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args[0][0]
        assert "biomodel" in call_args
        assert "bmName=Test" in call_args

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_with_none_params(self, mock_async_client):
        """Test biomodel fetching with None parameters converted to empty strings."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.json.return_value = []
        mock_client.get.return_value = mock_response
        
        params = BiomodelRequestParams(
            bmId=None,
            bmName=None,
            category=None,
            owner=None,
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        result = await fetch_biomodels(params)
        
        # Verify None values were converted to empty strings
        assert result["search_params"]["bmId"] == ""
        assert result["search_params"]["bmName"] == ""
        assert result["search_params"]["category"] == ""
        assert result["search_params"]["owner"] == ""

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_api_error(self, mock_async_client):
        """Test biomodel fetching when API returns an error."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        # Mock HTTP error
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "500 Internal Server Error", request=Mock(), response=Mock()
        )
        mock_client.get.return_value = mock_response
        
        params = BiomodelRequestParams(
            bmId="",
            bmName="",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        with pytest.raises(httpx.HTTPStatusError):
            await fetch_biomodels(params)

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_connection_error(self, mock_async_client):
        """Test biomodel fetching when connection fails."""
        mock_async_client.return_value.__aenter__.side_effect = Exception("Connection failed")
        
        params = BiomodelRequestParams(
            bmId="",
            bmName="",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        with pytest.raises(Exception):
            await fetch_biomodels(params)

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_non_list_response(self, mock_async_client):
        """Test biomodel fetching when API returns non-list response."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        # Mock response with data wrapper
        mock_response = Mock()
        mock_response.json.return_value = {
            "data": [
                {"bmKey": "123", "name": "Test Model"}
            ]
        }
        mock_client.get.return_value = mock_response
        
        params = BiomodelRequestParams(
            bmId="",
            bmName="",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        result = await fetch_biomodels(params)
        
        assert len(result["data"]) == 1
        assert result["models_count"] == 1

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_simulation_details_success(self, mock_async_client):
        """Test successful simulation details fetching."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.json.return_value = {
            "key": "sim123",
            "name": "Test Simulation",
            "solverName": "Test Solver"
        }
        mock_client.get.return_value = mock_response
        
        params = SimulationRequestParams(bmId="123", simId="sim123")
        
        result = await fetch_simulation_details(params)
        
        assert result["key"] == "sim123"
        assert result["name"] == "Test Simulation"
        assert result["solverName"] == "Test Solver"
        
        # Verify the API call
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args[0][0]
        assert "biomodel/123/simulation/sim123" in call_args

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_simulation_details_error(self, mock_async_client):
        """Test simulation details fetching when API returns an error."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "404 Not Found", request=Mock(), response=Mock()
        )
        mock_client.get.return_value = mock_response
        
        params = SimulationRequestParams(bmId="123", simId="nonexistent")
        
        with pytest.raises(httpx.HTTPStatusError):
            await fetch_simulation_details(params)

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_vcml_file_success(self, mock_async_client):
        """Test successful VCML file fetching."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.text = "<?xml version='1.0'><vcml>Test VCML content</vcml>"
        mock_client.get.return_value = mock_response
        
        result = await get_vcml_file("123")
        
        assert "<?xml version='1.0'" in result
        assert "Test VCML content" in result
        
        # Verify the API call
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args[0][0]
        assert "biomodel/123/biomodel.vcml" in call_args

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_vcml_file_truncated(self, mock_async_client):
        """Test VCML file fetching with truncation."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.text = "Very long VCML content " * 100
        mock_client.get.return_value = mock_response
        
        result = await get_vcml_file("123", truncate=True)
        
        assert len(result) == 500  # Should be truncated to 500 characters
        
        # Verify the API call
        mock_client.get.assert_called_once()

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_vcml_file_error(self, mock_async_client):
        """Test VCML file fetching when API returns an error."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "404 Not Found", request=Mock(), response=Mock()
        )
        mock_client.get.return_value = mock_response
        
        with pytest.raises(httpx.HTTPStatusError):
            await get_vcml_file("nonexistent")

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_sbml_file_success(self, mock_async_client):
        """Test successful SBML file fetching."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.text = "<?xml version='1.0'><sbml>Test SBML content</sbml>"
        mock_client.get.return_value = mock_response
        
        result = await get_sbml_file("123")
        
        assert "<?xml version='1.0'" in result
        assert "Test SBML content" in result
        
        # Verify the API call
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args[0][0]
        assert "biomodel/123/biomodel.sbml" in call_args

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_sbml_file_error(self, mock_async_client):
        """Test SBML file fetching when API returns an error."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "404 Not Found", request=Mock(), response=Mock()
        )
        mock_client.get.return_value = mock_response
        
        with pytest.raises(httpx.HTTPStatusError):
            await get_sbml_file("nonexistent")

    def test_get_diagram_url(self):
        """Test diagram URL generation."""
        result = get_diagram_url("123")
        
        expected_url = "https://vcell.cam.uchc.edu/api/v0/biomodel/123/diagram"
        assert result == expected_url

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_diagram_image_success(self, mock_async_client):
        """Test successful diagram image fetching."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.content = b"fake_image_bytes"
        mock_client.get.return_value = mock_response
        
        result = await get_diagram_image("123")
        
        assert result == b"fake_image_bytes"
        
        # Verify the API call
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args[0][0]
        assert "biomodel/123/diagram" in call_args

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_get_diagram_image_error(self, mock_async_client):
        """Test diagram image fetching when API returns an error."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "404 Not Found", request=Mock(), response=Mock()
        )
        mock_client.get.return_value = mock_response
        
        with pytest.raises(httpx.HTTPStatusError):
            await get_diagram_image("nonexistent")

    @patch('app.services.vcelldb_service.fetch_biomodels')
    async def test_fetch_biomodel_applications_files_success(self, mock_fetch_biomodels):
        """Test successful biomodel applications files fetching."""
        # Mock the fetch_biomodels response
        mock_fetch_biomodels.return_value = {
            "data": [{
                "bmKey": "123",
                "name": "Test Model",
                "applications": [
                    {"name": "App1", "type": "deterministic"},
                    {"name": "App2", "type": "stochastic"}
                ]
            }]
        }
        
        result = await fetch_biomodel_applications_files("123")
        
        assert result["biomodel_id"] == "123"
        assert len(result["applications"]) == 2
        assert result["total_applications"] == 2
        
        # Check that file URLs were generated
        app1 = result["applications"][0]
        assert "bngl_url" in app1
        assert "sbml_url" in app1
        assert "App1" in app1["bngl_url"]
        assert "App1" in app1["sbml_url"]
        
        app2 = result["applications"][1]
        assert "bngl_url" in app2
        assert "sbml_url" in app2
        assert "App2" in app2["bngl_url"]
        assert "App2" in app2["sbml_url"]

    @patch('app.services.vcelldb_service.fetch_biomodels')
    async def test_fetch_biomodel_applications_files_no_applications(self, mock_fetch_biomodels):
        """Test biomodel applications files fetching when no applications exist."""
        mock_fetch_biomodels.return_value = {
            "data": [{
                "bmKey": "123",
                "name": "Test Model",
                "applications": []
            }]
        }
        
        result = await fetch_biomodel_applications_files("123")
        
        assert result["biomodel_id"] == "123"
        assert len(result["applications"]) == 0
        assert result["total_applications"] == 0

    @patch('app.services.vcelldb_service.fetch_biomodels')
    async def test_fetch_biomodel_applications_files_no_data(self, mock_fetch_biomodels):
        """Test biomodel applications files fetching when no data exists."""
        mock_fetch_biomodels.return_value = {
            "data": []
        }
        
        result = await fetch_biomodel_applications_files("123")
        
        assert result["biomodel_id"] == "123"
        assert len(result["applications"]) == 0
        assert result["total_applications"] == 0

    @patch('app.services.vcelldb_service.fetch_biomodels')
    async def test_fetch_biomodel_applications_files_error(self, mock_fetch_biomodels):
        """Test biomodel applications files fetching when fetch_biomodels fails."""
        mock_fetch_biomodels.side_effect = Exception("Fetch failed")
        
        with pytest.raises(Exception):
            await fetch_biomodel_applications_files("123")

    @patch('app.services.vcelldb_service.fetch_biomodels')
    async def test_fetch_biomodel_applications_files_special_characters(self, mock_fetch_biomodels):
        """Test biomodel applications files fetching with special characters in app names."""
        mock_fetch_biomodels.return_value = {
            "data": [{
                "bmKey": "123",
                "name": "Test Model",
                "applications": [
                    {"name": "App with spaces & symbols!", "type": "deterministic"}
                ]
            }]
        }
        
        result = await fetch_biomodel_applications_files("123")
        
        assert len(result["applications"]) == 1
        app = result["applications"][0]
        
        # Check that special characters are properly URL encoded
        assert "App%20with%20spaces%20%26%20symbols!" in app["bngl_url"]
        assert "App%20with%20spaces%20%26%20symbols!" in app["sbml_url"]

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_empty_response(self, mock_async_client):
        """Test biomodel fetching when API returns empty response."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.json.return_value = []
        mock_client.get.return_value = mock_response
        
        params = BiomodelRequestParams(
            bmId="",
            bmName="NonexistentModel",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        result = await fetch_biomodels(params)
        
        assert result["data"] == []
        assert result["models_count"] == 0
        assert result["unique_model_keys (bmkey)"] == []

    @patch('app.services.vcelldb_service.httpx.AsyncClient')
    async def test_fetch_biomodels_missing_bmkey(self, mock_async_client):
        """Test biomodel fetching when some models don't have bmKey."""
        mock_client = AsyncMock()
        mock_async_client.return_value.__aenter__.return_value = mock_client
        
        mock_response = Mock()
        mock_response.json.return_value = [
            {"bmKey": "123", "name": "Test Model 1"},
            {"name": "Test Model 2"},  # Missing bmKey
            {"bmKey": "456", "name": "Test Model 3"}
        ]
        mock_client.get.return_value = mock_response
        
        params = BiomodelRequestParams(
            bmId="",
            bmName="",
            category="all",
            owner="",
            savedLow=None,
            savedHigh=None,
            startRow=1,
            maxRows=10,
            orderBy="date_desc"
        )
        
        result = await fetch_biomodels(params)
        
        assert len(result["data"]) == 3
        assert result["models_count"] == 3
        # Should only include models with bmKey
        assert "123" in result["unique_model_keys (bmkey)"]
        assert "456" in result["unique_model_keys (bmkey)"]
        assert len(result["unique_model_keys (bmkey)"]) == 2
