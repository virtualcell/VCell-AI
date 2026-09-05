from urllib.parse import quote

import httpx

from app.core.logger import get_logger
from app.services.vcelldb_service import VCELL_API_V1_BASE_URL

logger = get_logger("vcell_identity_service")

def _auth_headers(auth0_token: str) -> dict:
    """
    Build the headers used to forward the caller's identity to VCell.

    VCell grants the "user" role to any authenticated identity, so the verified
    Auth0 token is accepted as-is on every /users endpoint — no scope or token
    exchange is needed.
    """
    return {
        "Authorization": f"Bearer {auth0_token}",
        "accept": "application/json",
    }


def _check_response(response: httpx.Response) -> None:
    """
    Raise for an unsuccessful VCell response.

    VCell answers a request whose token its authorizer never accepted with a 302
    to the Auth0 login page instead of a 401. httpx doesn't follow redirects and
    raise_for_status() ignores 3xx, so that would otherwise slip through and fail
    later as a JSON parse error. Report it as what it means: not authenticated.
    """
    if 300 <= response.status_code < 400:
        raise httpx.HTTPStatusError(
            "VCell redirected to the login page",
            request=response.request,
            response=httpx.Response(401, request=response.request),
        )

    response.raise_for_status()


async def get_mapped_vcell_user(auth0_token: str) -> dict:
    """
    Fetch the VCell identity currently linked to the caller's login.

    Args:
        auth0_token (str): Verified Auth0 access token to forward to VCell.

    Returns:
        dict: VCell's UserIdentityJSONSafe body. An unlinked caller comes back as
            a 200 with mapped=false rather than a 404, so the caller should branch
            on the "mapped" flag instead of on the status code.
    """
    url = f"{VCELL_API_V1_BASE_URL}/users/mappedUser"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=_auth_headers(auth0_token))
        _check_response(response)
        return response.json()


async def map_vcell_user(auth0_token: str, user_id: str, password: str) -> bool:
    """
    Link an existing VCell account to the caller's login.

    Args:
        auth0_token (str): Verified Auth0 access token to forward to VCell.
        user_id (str): Existing VCell username.
        password (str): Password for that VCell account.

    Returns:
        bool: VCell's answer. False covers both a bad password and a login that is
            already linked to a different VCell account — the API gives back a bare
            boolean, so the two cases are indistinguishable from here.
    """
    url = f"{VCELL_API_V1_BASE_URL}/users/mapUser"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=_auth_headers(auth0_token),
            json={"userID": user_id, "password": password},
        )
        _check_response(response)
        return response.json() is True


async def create_vcell_user(auth0_token: str, user_id: str) -> None:
    """
    Create a new VCell account and link it to the caller's login.

    VCell's mapNewUser returns void, so there is no body to read — a 2xx is the
    whole answer, and the resulting identity has to be read back separately.

    Args:
        auth0_token (str): Verified Auth0 access token to forward to VCell.
        user_id (str): Desired VCell username.
    """
    url = f"{VCELL_API_V1_BASE_URL}/users/newUser"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            url,
            headers=_auth_headers(auth0_token),
            json={"userID": user_id},
        )
        _check_response(response)

    logger.info(f"Created VCell account {user_id}")


async def request_vcell_recovery_email(
    auth0_token: str, user_id: str, email: str
) -> None:
    """
    Ask VCell to email a magic link that finishes linking an existing account.

    The link is redeemed against VCell directly, so nothing further happens on our
    side once the email is sent.

    Args:
        auth0_token (str): Verified Auth0 access token to forward to VCell.
        user_id (str): Existing VCell username.
        email (str): Email registered with that VCell account.
    """
    url = f"{VCELL_API_V1_BASE_URL}/users/requestRecoveryEmail"

    async with httpx.AsyncClient(timeout=30.0) as client:
        # VCell takes both of these as query parameters, not as a request body.
        response = await client.post(
            url,
            headers=_auth_headers(auth0_token),
            params={"userID": user_id, "email": email},
        )
        _check_response(response)

    logger.info(f"Requested VCell recovery email for {user_id}")


async def unmap_vcell_user(auth0_token: str, user_name: str) -> bool:
    """
    Unlink a VCell account from the caller's login.

    Args:
        auth0_token (str): Verified Auth0 access token to forward to VCell.
        user_name (str): VCell username to unlink.

    Returns:
        bool: False when the supplied name is not the one currently linked, or
            when the account was already unlinked.
    """
    # VCell exposes the unlink as a PUT with the username in the path, and expects
    # no request body.
    url = f"{VCELL_API_V1_BASE_URL}/users/unmapUser/{quote(user_name, safe='')}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.put(url, headers=_auth_headers(auth0_token))
        _check_response(response)
        return response.json() is True
