from datetime import datetime, timezone

from app.core.singleton import get_supabase_client


def sync_auth0_user(payload: dict) -> dict | None:
    """
    Create or update the local Supabase user row from verified Auth0 claims.
    """
    auth0_sub = payload["sub"]
    email = payload.get("email")

    user_values = {
        "auth0_sub": auth0_sub,
        "last_login": datetime.now(timezone.utc).isoformat(),
    }
    if email is not None:
        user_values["email"] = email
    if payload.get("name") is not None:
        user_values["name"] = payload.get("name")

    supabase = get_supabase_client()

    # AuthSync can run more than once during client hydration; upsert keeps this idempotent.
    response = (
        supabase.table("users")
        .upsert(
            user_values,
            on_conflict="auth0_sub",
        )
        .execute()
    )

    return response.data[0] if response.data else None
