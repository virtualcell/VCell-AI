from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field
from enum import Enum

class ToolDefinitions(BaseModel):
    """Schema for a list of tool definitions"""
    tools: List[ToolDefinition] = Field(..., description="List of available tools")

class ToolDefinition(BaseModel):
    """Schema for tool definition"""
    type: str = "function"
    function: FunctionDefinition

class FunctionDefinition(BaseModel):
    """Schema for function definition within a tool"""
    name: str
    description: str
    parameters: ParameterSchema
    strict: bool = True

class ParameterSchema(BaseModel):
    """Schema for function parameters"""
    type: str = "object"
    properties: Dict[str, Dict[str, Any]]
    required: List[str]
    additionalProperties: bool = False