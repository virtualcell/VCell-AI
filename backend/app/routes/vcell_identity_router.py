from fastapi import APIRouter, Depends, Query

from app.controllers.vcell_identity_controller import (
    create_vcell_user_controller,
    get_mapped_vcell_user_controller,
    map_vcell_user_controller,
    request_vcell_recovery_email_controller,
    unmap_vcell_user_controller,
)
from app.core.auth import get_bearer_token, verify_auth0_token
from app.schemas.vcell_identity_schema import (
    MapVCellUserRequest,
    NewVCellUserRequest,
    RecoverVCellAccountRequest,
    VCellIdentityActionResponse,
    VCellMappedUserResponse,
)

router = APIRouter()

# Every route below declares two dependencies: verify_auth0_token to enforce that
# the token is valid, and get_bearer_token to get the raw string to forward on to
# VCell. Both resolve through the same HTTPBearer sub-dependency, which FastAPI
# caches per request, so the Authorization header is parsed once.


@router.get("/users/vcell/mapped", response_model=VCellMappedUserResponse)
async def get_mapped_vcell_account(
    _payload: dict = Depends(verify_auth0_token),
    auth0_token: str = Depends(get_bearer_token),
):
    """
    Endpoint to retrieve the VCell account linked to the authenticated user.
    Returns mapped=false rather than a 404 when no account is linked.
    """

    return await get_mapped_vcell_user_controller(auth0_token)


@router.post("/users/vcell/map", response_model=VCellIdentityActionResponse)
async def map_vcell_account(
    payload: MapVCellUserRequest,
    _claims: dict = Depends(verify_auth0_token),
    auth0_token: str = Depends(get_bearer_token),
):
    """
    Endpoint to link an existing VCell account to the authenticated user.
    """

    return await map_vcell_user_controller(auth0_token, payload)


@router.post("/users/vcell/new", response_model=VCellIdentityActionResponse)
async def create_vcell_account(
    payload: NewVCellUserRequest,
    _claims: dict = Depends(verify_auth0_token),
    auth0_token: str = Depends(get_bearer_token),
):
    """
    Endpoint to create a new VCell account for the authenticated user and link it.
    """

    return await create_vcell_user_controller(auth0_token, payload)


@router.post("/users/vcell/recover", response_model=VCellIdentityActionResponse)
async def recover_vcell_account(
    payload: RecoverVCellAccountRequest,
    _claims: dict = Depends(verify_auth0_token),
    auth0_token: str = Depends(get_bearer_token),
):
    """
    Endpoint to request a VCell email with a link that finishes account linking.
    """

    return await request_vcell_recovery_email_controller(auth0_token, payload)


@router.delete("/users/vcell/mapped", response_model=VCellIdentityActionResponse)
async def unmap_vcell_account(
    userName: str = Query(..., min_length=1, description="VCell username to unlink"),
    _claims: dict = Depends(verify_auth0_token),
    auth0_token: str = Depends(get_bearer_token),
):
    """
    Endpoint to unlink the authenticated user's VCell account.
    """

    return await unmap_vcell_user_controller(auth0_token, userName)
