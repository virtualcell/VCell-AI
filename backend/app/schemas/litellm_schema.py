from typing import Literal, Optional

from pydantic import BaseModel, Field

# Mirrors LiteLLM's budget reset options (hourly / daily / weekly / monthly).
BudgetDuration = Literal["1h", "24h", "7d", "30d"]


class UpdateAllBudgetsRequest(BaseModel):
    max_budget: float = Field(ge=0, description="Max budget in USD per user")
    budget_duration: BudgetDuration = Field(
        description="How often each user's budget resets"
    )


class ManagedUser(BaseModel):
    user_id: str
    user_email: Optional[str] = None
    spend: float
    max_budget: Optional[float] = None
    budget_duration: Optional[str] = None


class ManagedUsersResponse(BaseModel):
    users: list[ManagedUser]
    total: int


class UpdateAllBudgetsResponse(BaseModel):
    total_users: int
    successful_updates: int
    failed_updates: int
    failed_user_ids: list[str] = []
