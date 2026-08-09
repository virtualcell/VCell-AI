from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError

from app.core.config import settings
from app.services.users_service import get_user_role

bearer_scheme = HTTPBearer(auto_error=False)
_jwks_client: PyJWKClient | None = None


def _get_auth0_config() -> tuple[str, str, PyJWKClient]:
    if not settings.AUTH0_DOMAIN or not settings.AUTH0_AUDIENCE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth0 configuration is missing",
        )

    issuer = f"https://{settings.AUTH0_DOMAIN}/"
    jwks_url = f"{issuer}.well-known/jwks.json"

    global _jwks_client
    if _jwks_client is None:
        # PyJWKClient downloads and caches Auth0 signing keys lazily,
        # so missing network access does not block app startup.
        _jwks_client = PyJWKClient(jwks_url)

    return issuer, settings.AUTH0_AUDIENCE, _jwks_client


async def get_bearer_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    Extract raw bearer token from Authorization header.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return credentials.credentials


def _decode_and_verify(access_token: str) -> dict[str, Any]:
    try:
        issuer, audience, jwks_client = _get_auth0_config()
        signing_key = jwks_client.get_signing_key_from_jwt(
            access_token
        ).key

        return jwt.decode(
            access_token,
            signing_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )

    except (jwt.InvalidTokenError, PyJWKClientError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


async def verify_auth0_token(
    access_token: str = Depends(get_bearer_token),
) -> dict[str, Any]:
    """
    Verify Auth0 JWT access token and return decoded payload.
    """
    return _decode_and_verify(access_token)


async def require_admin(
    payload: dict = Depends(verify_auth0_token),
) -> dict[str, Any]:
    """
    Require the authenticated user to have the "admin" role in Supabase.
    """
    if get_user_role(payload["sub"]) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )

    return payload


async def get_optional_auth0_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str | None:
    """
    Extract and verify an Auth0 access token if one was sent, without
    requiring one.

    Returns None when no Authorization header is present at all, so routes
    can serve logged-out users public-only results. Still raises 401 if a
    token IS present but invalid/expired, rather than silently treating a
    bad token the same as being logged out.
    """
    if credentials is None:
        return None

    _decode_and_verify(credentials.credentials)
    return credentials.credentials
