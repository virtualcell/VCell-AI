from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    user_id: str
    auth0_sub: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: str
    token_limit: int
    tokens_used: int
    created_at: datetime
    last_login: datetime
    litellm_virtual_key: Optional[str] = None


class SyncUserResponse(BaseModel):
    status: str
    user: Optional[User] = None


class UserBudgetResponse(BaseModel):
    spend: float
    max_budget: Optional[float] = None
    remaining_budget: Optional[float] = None
