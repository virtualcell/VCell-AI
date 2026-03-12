from datetime import datetime
from typing import Any, Dict, Optional, Union
from fastapi import Response
from fastapi.responses import JSONResponse


class ResponseFormatter:
    """
    Utility class for standardizing API response formats across the VCell-AI backend.
    
    Provides consistent response structure with success indicators, messages, timestamps,
    and metadata for better API usability and debugging.
    """
    
    @staticmethod
    def _generate_timestamp() -> str:
        """Generate ISO format timestamp for response tracking."""
        return datetime.utcnow().isoformat() + "Z"
    
    @staticmethod
    def success_response(
        data: Any = None,
        message: str = "Request completed successfully",
        meta: Optional[Dict[str, Any]] = None,
        status_code: int = 200
    ) -> JSONResponse:
        """
        Create a standardized success response.
        
        Args:
            data: The response data payload
            message: Human-readable success message
            meta: Additional metadata (pagination, counts, etc.)
            status_code: HTTP status code (default: 200)
            
        Returns:
            JSONResponse with standardized format
        """
        response_body = {
            "success": True,
            "data": data,
            "message": message,
            "timestamp": ResponseFormatter._generate_timestamp()
        }
        
        if meta is not None:
            response_body["meta"] = meta
            
        return JSONResponse(content=response_body, status_code=status_code)
    
    @staticmethod
    def error_response(
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ) -> JSONResponse:
        """
        Create a standardized error response.
        
        Args:
            message: Human-readable error message
            error_code: Specific error code for categorization
            details: Additional error details and context
            status_code: HTTP status code (default: 500)
            
        Returns:
            JSONResponse with standardized error format
        """
        response_body = {
            "success": False,
            "data": None,
            "message": message,
            "timestamp": ResponseFormatter._generate_timestamp()
        }
        
        if error_code is not None or details is not None:
            response_body["error"] = {}
            if error_code:
                response_body["error"]["code"] = error_code
            if details:
                response_body["error"]["details"] = details
                
        return JSONResponse(content=response_body, status_code=status_code)
    
