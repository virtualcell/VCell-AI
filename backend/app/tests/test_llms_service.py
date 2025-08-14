import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.services.llms_service import (
    get_llm_response,
    get_response_with_tools,
    analyse_vcml,
    analyse_diagram,
)


class TestLLMsService:
    """Test class for LLMs service functions."""

    async def test_get_llm_response_success(self):
        """Test successful LLM response generation."""
        result = await get_llm_response(
            system_prompt="Answer with a single word, say yes or no, nothing else. no matter what the user asks or says.",
            user_prompt="Is the sky blue?",
        )

        assert isinstance(result, str)
        assert "yes" in result.lower()
        assert len(result) < 5

    async def test_get_response_with_tools_no_tool_calls(self):
        """Test response generation when no tools are called."""
        conversation_history = [{"role": "user", "content": "Hello"}]

        result, bmkeys = await get_response_with_tools(conversation_history)

        assert isinstance(result, str)
        assert bmkeys == []

    async def test_get_response_with_tools_with_tool_calls(self):
        """Test response generation when tools are called."""
        conversation_history = [{"role": "user", "content": "Hello"}]

        result, bmkeys = await get_response_with_tools(conversation_history)

        assert isinstance(result, str)
        assert bmkeys == []

        conversation_history = [{"role": "user", "content": "List all calcium models."}]

        result, bmkeys = await get_response_with_tools(conversation_history)

        assert bmkeys == [
            "273924831",
            "271989751",
            "254507626",
            "211839191",
            "211211962",
            "191137435",
            "114597194",
            "13737035",
            "2917788",
        ]
        assert "273924831" in result
        assert "271989751" in result
        assert "254507626" in result
        assert "211839191" in result
        assert "211211962" in result
        assert "191137435" in result
        assert "114597194" in result
        assert "13737035" in result
        assert "2917788" in result

    async def test_analyse_vcml_success(self):
        """Test successful VCML analysis."""
        result = await analyse_vcml("273924831")

        assert isinstance(result, str)
        assert "MouseSpermCalcium" in result

    async def test_analyse_diagram_success(self):
        """Test successful diagram analysis."""
        result = await analyse_diagram("273924831")

        assert isinstance(result, str)
        assert "diagram" in result.lower()
        assert "mousespermcalcium" in result.lower()
