import httpx
from fastapi import HTTPException

from app.services.litellm_service import list_managed_users, update_all_user_budgets


async def list_managed_users_controller() -> dict:
    """
    List the LiteLLM users a bulk budget update would apply to.
    """

    try:
        users = await list_managed_users()

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch users from LiteLLM: {error}",
        )

    return {"users": users, "total": len(users)}


async def update_all_budgets_controller(
    max_budget: float, budget_duration: str
) -> dict:
    """
    Apply the same max budget and reset frequency to every managed LiteLLM user.
    """

    try:
        return await update_all_user_budgets(max_budget, budget_duration)

    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to update budgets in LiteLLM: {error}",
        )
