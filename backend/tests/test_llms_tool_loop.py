"""
Unit tests for the tool-calling loop in get_response_with_tools.

These run in CI: the LiteLLM call and the tool executor are replaced with
fakes, so no network, proxy, or credentials are involved. Settings still
have to construct at import time, hence the placeholder env defaults below
(CI writes a real backend/.env; locally there may be none).
"""

import os
from types import SimpleNamespace

for _name, _value in {
    "FRONTEND_URL": "http://localhost:3000",
    "PROVIDER": "local",
    "AZURE_API_VERSION": "x",
    "AZURE_ENDPOINT": "http://azure.invalid",
    "AZURE_API_KEY": "x",
    "AZURE_DEPLOYMENT_NAME": "x",
    "AZURE_EMBEDDING_DEPLOYMENT_NAME": "x",
    "QDRANT_URL": "http://qdrant.invalid",
    "QDRANT_COLLECTION_NAME": "x",
    "LANGFUSE_SECRET_KEY": "x",
    "LANGFUSE_PUBLIC_KEY": "x",
    "LANGFUSE_HOST": "http://langfuse.invalid",
}.items():
    os.environ.setdefault(_name, _value)

import pytest
from openai.types.chat import ChatCompletionMessage, ChatCompletionMessageToolCall
from openai.types.chat.chat_completion_message_tool_call import Function

from app.services import llms_service
from app.services.llms_service import MAX_TOOL_ROUNDS, get_response_with_tools

pytestmark = pytest.mark.asyncio

MODEL = "gemini-model"


def _tool_call(call_id: str, name: str, arguments: str) -> ChatCompletionMessageToolCall:
    return ChatCompletionMessageToolCall(
        id=call_id, type="function", function=Function(name=name, arguments=arguments)
    )


def _completion(content=None, tool_calls=None):
    message = ChatCompletionMessage(role="assistant", content=content, tool_calls=tool_calls)
    return SimpleNamespace(choices=[SimpleNamespace(message=message)], model=MODEL)


class FakeLLM:
    """Returns scripted completions in order and records every request."""

    def __init__(self, completions):
        self.completions = list(completions)
        self.requests = []

    async def __call__(self, virtual_key, model, **kwargs):
        self.requests.append(kwargs)
        if not self.completions:
            raise AssertionError("LLM called more times than scripted")
        return self.completions.pop(0)


@pytest.fixture
def fake_tool(monkeypatch):
    calls = []

    async def execute_tool(name, args, auth0_token):
        calls.append((name, args))
        return {"unique_model_keys (bmkey)": [f"key-for-{args.get('owner', args.get('bm_name'))}"]}

    monkeypatch.setattr(llms_service, "execute_tool", execute_tool)
    return calls


def _install(monkeypatch, completions) -> FakeLLM:
    llm = FakeLLM(completions)
    monkeypatch.setattr(llms_service, "_create_chat_completion", llm)
    return llm


async def test_plain_answer_without_tools(monkeypatch, fake_tool):
    llm = _install(monkeypatch, [_completion(content="VCell simulates cells.")])

    text, bmkeys, model = await get_response_with_tools(
        [{"role": "user", "content": "can vcell simulate cells"}], "vk", MODEL
    )

    assert text == "VCell simulates cells."
    assert bmkeys == []
    assert model == MODEL
    assert fake_tool == []
    assert len(llm.requests) == 1
    assert llm.requests[0]["tools"] is llms_service.tools


async def test_single_tool_round(monkeypatch, fake_tool):
    llm = _install(
        monkeypatch,
        [
            _completion(tool_calls=[_tool_call("c1", "fetch_biomodels", '{"owner": "schaff"}')]),
            _completion(content="Found one model."),
        ],
    )

    text, bmkeys, _ = await get_response_with_tools(
        [{"role": "user", "content": "find models by schaff"}], "vk", MODEL
    )

    assert text == "Found one model."
    assert bmkeys == ["key-for-schaff"]
    assert fake_tool == [("fetch_biomodels", {"owner": "schaff"})]
    # The follow-up request carries the assistant tool call and the tool result.
    roles = [m["role"] for m in llm.requests[1]["messages"]]
    assert roles[-2:] == ["assistant", "tool"]
    assert llm.requests[1]["messages"][-1]["tool_call_id"] == "c1"


async def test_second_tool_round_is_executed_not_returned_as_answer(monkeypatch, fake_tool):
    """
    The production failure: an empty first result made Gemini retry the search
    with different arguments. The old code took that retry as the final
    answer, so content was None and the route raised a validation error.
    """
    llm = _install(
        monkeypatch,
        [
            _completion(tool_calls=[_tool_call("c1", "fetch_biomodels", '{"owner": "schaff"}')]),
            _completion(tool_calls=[_tool_call("c2", "fetch_biomodels", '{"bm_name": "schaff"}')]),
            _completion(content="Here is what I found."),
        ],
    )

    text, bmkeys, _ = await get_response_with_tools(
        [{"role": "user", "content": "find the solver suite model by schaff"}], "vk", MODEL
    )

    assert text == "Here is what I found."
    assert [name for name, _ in fake_tool] == ["fetch_biomodels", "fetch_biomodels"]
    assert bmkeys == ["key-for-schaff"]
    assert len(llm.requests) == 3
    # Tools stay available on every round, so a retry is a real request, not a hallucinated one.
    assert all(r["tools"] is llms_service.tools for r in llm.requests)
    assert all(r["tool_choice"] == "auto" for r in llm.requests)


async def test_round_cap_forces_a_text_answer(monkeypatch, fake_tool):
    endless = [
        _completion(tool_calls=[_tool_call(f"c{i}", "fetch_biomodels", '{"owner": "x"}')])
        for i in range(MAX_TOOL_ROUNDS)
    ]
    llm = _install(monkeypatch, endless + [_completion(content="Best effort answer.")])

    text, _, _ = await get_response_with_tools(
        [{"role": "user", "content": "loop forever"}], "vk", MODEL
    )

    assert text == "Best effort answer."
    assert len(fake_tool) == MAX_TOOL_ROUNDS
    assert len(llm.requests) == MAX_TOOL_ROUNDS + 1
    assert llm.requests[-1]["tool_choice"] == "none"


async def test_none_content_becomes_empty_string(monkeypatch, fake_tool):
    _install(monkeypatch, [_completion(content=None)])

    text, _, _ = await get_response_with_tools(
        [{"role": "user", "content": "hi"}], "vk", MODEL
    )

    assert text == ""
