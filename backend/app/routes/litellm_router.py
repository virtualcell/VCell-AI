from fastapi import APIRouter, Depends

from app.controllers.litellm_controller import (
    list_managed_users_controller,
    update_all_budgets_controller,
)
from app.core.auth import require_admin
from app.schemas.litellm_schema import (
    ManagedUsersResponse,
    UpdateAllBudgetsRequest,
    UpdateAllBudgetsResponse,
)

# All LiteLLM management endpoints are admin-only.
router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/users", response_model=ManagedUsersResponse)
async def list_litellm_users():
    """
    Endpoint to list the LiteLLM users a bulk budget update applies to.

    Excludes the LiteLLM proxy admin / default user, whose budget stays
    unlimited.
    """

    return await list_managed_users_controller()


@router.post("/budgets", response_model=UpdateAllBudgetsResponse)
async def update_all_litellm_budgets(request: UpdateAllBudgetsRequest):
    """
    Endpoint to set the same max budget and reset frequency on every LiteLLM
    user except the proxy admin / default user.
    """

    return await update_all_budgets_controller(
        request.max_budget, request.budget_duration
    )
