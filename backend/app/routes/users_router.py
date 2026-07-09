from fastapi import APIRouter, Depends

from app.controllers.users_controller import (
    get_current_user_budget_controller,
    sync_current_user_controller,
)
from app.core.auth import verify_auth0_token
from app.schemas.users_schema import SyncUserResponse, UserBudgetResponse

router = APIRouter()


@router.post("/users/me", response_model=SyncUserResponse)
async def sync_current_user(
    payload: dict = Depends(verify_auth0_token),
):
    """
    endpoint to Sync authenticated Auth0 user into Supabase.
    """

    return await sync_current_user_controller(payload)


@router.get("/users/me/budget", response_model=UserBudgetResponse)
async def get_current_user_budget(
    payload: dict = Depends(verify_auth0_token),
):
    """
    Endpoint to retrieve authenticated user's LiteLLM spend and budget.
    """

    return await get_current_user_budget_controller(payload)