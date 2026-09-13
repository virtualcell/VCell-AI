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


# LiteLLM's built-in proxy admin. Its budget must stay unlimited, so it is
# always excluded from bulk budget updates.
LITELLM_EXCLUDED_USER_IDS = {"default_user_id"}
LITELLM_EXCLUDED_ROLES = {"proxy_admin", "proxy_admin_viewer"}

# /user/list caps page_size at 100.
_USER_LIST_PAGE_SIZE = 100


def _is_excluded_from_bulk_update(user: dict) -> bool:
    """
    Return True for LiteLLM users that must never be touched by a bulk budget
    update (the proxy admin / default user).
    """
    return (
        user.get("user_id") in LITELLM_EXCLUDED_USER_IDS
        or user.get("user_role") in LITELLM_EXCLUDED_ROLES
    )


async def list_managed_users() -> list[dict]:
    """
    List every LiteLLM user eligible for bulk budget updates, i.e. all users
    except the proxy admin / default user.

    Returns:
        list[dict]: user_id, user_email, spend, max_budget and budget_duration
            for each managed user.
    """
    users: list[dict] = []
    page = 1

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            response = await client.get(
                f"{settings.LITELLM_URL}/user/list",
                headers={"Authorization": f"Bearer {settings.LITELLM_MASTER_KEY}"},
                params={"page": page, "page_size": _USER_LIST_PAGE_SIZE},
            )
            response.raise_for_status()
            data = response.json()

            users.extend(data.get("users") or [])

            if page >= (data.get("total_pages") or 1):
                break
            page += 1

    return [
        {
            "user_id": user.get("user_id"),
            "user_email": user.get("user_email"),
            "spend": user.get("spend") or 0.0,
            "max_budget": user.get("max_budget"),
            "budget_duration": user.get("budget_duration"),
        }
        for user in users
        if not _is_excluded_from_bulk_update(user)
    ]


async def update_all_user_budgets(max_budget: float, budget_duration: str) -> dict:
    """
    Set the same max budget and reset frequency on every managed LiteLLM user.

    LiteLLM's own "update all users" option would also overwrite the proxy
    admin's unlimited budget, so the user list is fetched and filtered first and
    the updates are sent as an explicit per-user batch.

    Args:
        max_budget (float): Max budget in USD to apply to each managed user.
        budget_duration (str): LiteLLM duration string the budget resets on
            (e.g. "1h", "24h", "7d", "30d").

    Returns:
        dict: total_users, successful_updates, failed_updates and the user_ids
            of any users that could not be updated.
    """
    managed_users = await list_managed_users()

    if not managed_users:
        return {
            "total_users": 0,
            "successful_updates": 0,
            "failed_updates": 0,
            "failed_user_ids": [],
        }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.LITELLM_URL}/user/bulk_update",
            headers={"Authorization": f"Bearer {settings.LITELLM_MASTER_KEY}"},
            json={
                "users": [
                    {
                        "user_id": user["user_id"],
                        "max_budget": max_budget,
                        "budget_duration": budget_duration,
                    }
                    for user in managed_users
                ]
            },
        )
        response.raise_for_status()
        data = response.json()

    failed_user_ids = [
        result.get("user_id")
        for result in (data.get("results") or [])
        if not result.get("success")
    ]

    logger.info(
        f"Bulk budget update: {data.get('successful_updates')} succeeded, "
        f"{data.get('failed_updates')} failed "
        f"(max_budget={max_budget}, budget_duration={budget_duration})"
    )

    return {
        "total_users": data.get("total_requested") or len(managed_users),
        "successful_updates": data.get("successful_updates") or 0,
        "failed_updates": data.get("failed_updates") or 0,
        "failed_user_ids": failed_user_ids,
    }
