from typing import Literal

from pydantic import BaseModel, Field

LLMModel = Literal["openai-model", "local-model"]


class ChatRequest(BaseModel):
    conversation_history: list[dict] = Field(..., min_length=1)
    model: LLMModel = "openai-model"


class ChatResponse(BaseModel):
    response: str
    bmkeys: list = Field(default_factory=list)
    model_used: str


class AnalysisResponse(BaseModel):
    response: str
