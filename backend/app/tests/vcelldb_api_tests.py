import pytest
from fastapi.testclient import TestClient

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.main import app


client = TestClient(app)


def test_get_biomodels_success():
    response = client.get("/biomodel?bmName=Calcium&category=all&startRow=1&maxRows=10&orderBy=date_desc")
    
    assert response.status_code == 200

    # Check that the response is a list
    data = response.json()
    assert isinstance(data, list)
    
    # Check that the first biomodel has expected fields
    biomodel = data[0]
    assert 'bmKey' in biomodel
    assert 'name' in biomodel
    assert 'simulations' in biomodel
    
    # Check that simulations list is present
    simulations = biomodel['simulations']
    assert isinstance(simulations, list)
    if simulations:
        assert 'key' in simulations[0]
        assert 'name' in simulations[0]
        assert 'solverName' in simulations[0]


def test_get_biomodel_invalid_query():
    # Send a request with an invalid parameter
    response = client.get("/biomodel?bmName=InvalidModel&category=all&startRow=1&maxRows=10&orderBy=date_desc")
    
    # Check for valid response but with empty list
    assert response.status_code == 200
    data = response.json()
    assert data == [] 


def test_get_simulation_details_success():
    response = client.get("/biomodel/271993644/simulations?bmId=271993644&simId=271993642")
    
    assert response.status_code == 200
    
    data = response.json()
    assert 'key' in data
    assert 'name' in data
    assert 'solverName' in data
    assert 'parameters' in data
    assert isinstance(data['parameters'], list)

    parameter_names = [param['name'] for param in data['parameters']]
    expected_params = ['_F_', '_F_nmol_', '_N_pmol_', '_PI_', '_R_', '_T_']
    for param in expected_params:
        assert param in parameter_names


def test_get_simulation_details_invalid_simulation():
    # Send a request to get a non-existent simulation
    response = client.get("/biomodel/271993644/simulations?bmId=271993644&simId=999999999")
    assert response.status_code == 500


def test_get_simulation_details_missing_param():
    # Send a request with missing parameters (simId)
    response = client.get("/biomodel/271993644/simulations?bmId=271993644")
    assert response.status_code == 422


def test_get_vcml_success():
    # Send request to get VCML for the given biomodel
    response = client.get("/biomodel/271993644/biomodel.vcml")
    
    assert response.status_code == 200
    
    # Check for specific XML content
    vcml_content = response.text
    assert '<?xml' in vcml_content
    assert 'Tutorial_Nephrin_Nick_Nwasp' in vcml_content
    assert '<?xml version=\\"1.0\\"' in vcml_content


def test_get_vcml_invalid_biomodel():
    # Send request for a non-existent biomodel
    response = client.get("/biomodel/999999999/biomodel.vcml")
    assert response.status_code == 500