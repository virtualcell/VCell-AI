from fastapi import HTTPException

from app.services.litellm_service import get_user_budget_info
from app.services.users_service import sync_current_user


async def sync_current_user_controller(
    payload: dict,
) -> dict:
    """
    Sync authenticated Auth0 user into Supabase.
    """

    auth0_sub = payload.get("sub")

    if not auth0_sub:
        raise HTTPException(
            status_code=400,
            detail="Missing Auth0 subject claim",
        )

    return await sync_current_user(payload)


async def get_current_user_budget_controller(payload: dict) -> dict:
    """
    Fetch the authenticated user's LiteLLM spend and budget.
    """

    auth0_sub = payload.get("sub")

    if not auth0_sub:
        raise HTTPException(
            status_code=400,
            detail="Missing Auth0 subject claim",
        )

    return await get_user_budget_info(auth0_sub)
