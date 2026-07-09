import httpx
from supabase import Client

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger("litellm_service")


async def provision_user(auth0_sub: str, email: str) -> str:
    """
    Create a user in LiteLLM and return the virtual key it generates.

    Args:
        auth0_sub (str): The Auth0 subject claim, used as LiteLLM's user_id.
        email (str): The user's email, stored on the LiteLLM user record.

    Returns:
        str: The virtual key ("sk-...") LiteLLM generated for this user.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.LITELLM_URL}/user/new",
            headers={"Authorization": f"Bearer {settings.LITELLM_MASTER_KEY}"},
            json={
                "user_id": auth0_sub,
                "user_email": email,
                "max_budget": float(settings.DEFAULT_USER_BUDGET),
                "budget_duration": settings.DEFAULT_BUDGET_DURATION,
            },
        )
        response.raise_for_status()
        data = response.json()

    logger.info(f"Provisioned LiteLLM virtual key for user {auth0_sub}")
    return data["key"]


async def get_or_create_virtual_key(auth0_sub: str, email: str, supabase: Client) -> str:
    """
    Return the user's existing LiteLLM virtual key, provisioning a new one if
    none is stored in Supabase yet.

    Args:
        auth0_sub (str): The Auth0 subject claim, used as LiteLLM's user_id.
        email (str): The user's email, passed to provision_user on first login.
        supabase (Client): Supabase client used to look up / persist the virtual key.

    Returns:
        str: The user's LiteLLM virtual key.
    """
    response = (
        supabase.table("users")
        .select("litellm_virtual_key")
        .eq("auth0_sub", auth0_sub)
        .limit(1)
        .execute()
    )
    existing_key = response.data[0].get("litellm_virtual_key") if response.data else None
    if existing_key:
        return existing_key

    virtual_key = await provision_user(auth0_sub, email)

    supabase.table("users").upsert(
        {"auth0_sub": auth0_sub, "litellm_virtual_key": virtual_key},
        on_conflict="auth0_sub",
    ).execute()

    return virtual_key


async def get_user_budget_info(auth0_sub: str) -> dict:
    """
    Fetch spend and budget details for a user from LiteLLM.

    Args:
        auth0_sub (str): The Auth0 subject claim, used as LiteLLM's user_id.

    Returns:
        dict: spend, max_budget, and remaining_budget for the user.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{settings.LITELLM_URL}/user/info",
            headers={"Authorization": f"Bearer {settings.LITELLM_MASTER_KEY}"},
            params={"user_id": auth0_sub},
        )
        response.raise_for_status()
        user_info = response.json()["user_info"]

    spend = user_info["spend"]
    max_budget = user_info["max_budget"]
    remaining_budget = max_budget - spend if max_budget is not None else None

    return {
        "spend": spend,
        "max_budget": max_budget,
        "remaining_budget": remaining_budget,
    }
