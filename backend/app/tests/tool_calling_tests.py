import pytest
from fastapi.testclient import TestClient

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.main import app

client = TestClient(app)


def test_llm_query_for_calcium_models():
    user_prompt = "List calcium models"
    response = client.post(f"/query?user_prompt={user_prompt}")

    assert response.status_code == 200
    result = response.json()

    # Ensure that the response contains the "response" key and the value is a string
    assert "response" in result
    assert isinstance(result["response"], str)

    # Check if the response contains relevant calcium model names
    response = result["response"].lower()
    assert "mousespermcalcium" in response
    assert "spermcalcium" in response
    assert "dupontcellcalcium" in response


def test_llm_query_for_invalid_model():
    user_prompt = "List models for an invalid query"
    response = client.post(f"/query?user_prompt={user_prompt}")

    assert response.status_code == 200
    result = response.json()

    # Ensure that the response contains the "response" key and the value is a string
    assert "response" in result
    assert isinstance(result["response"], str)

    # Check if the response indicates no models found
    response = result["response"].lower()
    assert (
        "no models" in response
        or "no results" in response
        or "invalid" in response
        or "error" in response
    )
