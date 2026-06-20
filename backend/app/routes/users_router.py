from fastapi import APIRouter, Depends

from app.controllers.users_controller import (
    sync_current_user_controller,
)
from app.core.auth import verify_auth0_token

router = APIRouter()


@router.post("/users/me", response_model=dict)
async def sync_current_user(
    payload: dict = Depends(verify_auth0_token),
):
    """
    endpoint to Sync authenticated Auth0 user into Supabase.
    """

    return await sync_current_user_controller(payload)