import httpx
from fastapi import HTTPException

from app.schemas.vcell_identity_schema import (
    MapVCellUserRequest,
    NewVCellUserRequest,
    RecoverVCellAccountRequest,
)
from app.services.vcell_identity_service import (
    create_vcell_user,
    get_mapped_vcell_user,
    map_vcell_user,
    request_vcell_recovery_email,
    unmap_vcell_user,
)

# mapUser answers with a bare boolean, so a wrong password and a login that is
# already linked to a different VCell account arrive here identically. The message
# has to cover both.
MAP_FAILED_DETAIL = (
    "Could not link. Check your VCell username and password, and note that this "
    "login may already be linked to a different VCell account."
)


async def get_mapped_vcell_user_controller(auth0_token: str) -> dict:
    """
    Controller function to fetch the VCell identity linked to the caller.
    Raises:
        HTTPException: If the VCell API request fails.
    """
    try:
        return await get_mapped_vcell_user(auth0_token)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail="Error fetching linked VCell account.",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def map_vcell_user_controller(
    auth0_token: str, payload: MapVCellUserRequest
) -> dict:
    """
    Controller function to link an existing VCell account to the caller.
    Raises:
        HTTPException: If the VCell API request fails, or if VCell declines the link.
    """
    try:
        mapped = await map_vcell_user(auth0_token, payload.userID, payload.password)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail="Error linking VCell account."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Raised outside the try so the generic handlers above don't swallow it.
    if not mapped:
        raise HTTPException(status_code=400, detail=MAP_FAILED_DETAIL)

    return {
        "status": "success",
        "message": "Your VCell account is now linked.",
    }


async def create_vcell_user_controller(
    auth0_token: str, payload: NewVCellUserRequest
) -> dict:
    """
    Controller function to create a new VCell account for the caller.
    Raises:
        HTTPException: If the VCell API request fails, or the username is taken.
    """
    try:
        await create_vcell_user(auth0_token, payload.userID)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 409:
            raise HTTPException(
                status_code=409, detail="That VCell username is already taken."
            )
        raise HTTPException(
            status_code=e.response.status_code, detail="Error creating VCell account."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "status": "success",
        "message": "Your VCell account was created and linked.",
    }


async def request_vcell_recovery_email_controller(
    auth0_token: str, payload: RecoverVCellAccountRequest
) -> dict:
    """
    Controller function to request a VCell account-recovery email.
    Raises:
        HTTPException: If the VCell API request fails, or the details don't match.
    """
    try:
        await request_vcell_recovery_email(auth0_token, payload.userID, payload.email)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Couldn't send the recovery email. Check that the username and "
                    "email match your VCell account."
                ),
            )
        raise HTTPException(
            status_code=e.response.status_code, detail="Error sending recovery email."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "status": "success",
        "message": "Check your email for a link to finish linking your account.",
    }


async def unmap_vcell_user_controller(auth0_token: str, user_name: str) -> dict:
    """
    Controller function to unlink a VCell account from the caller.
    Raises:
        HTTPException: If the VCell API request fails, or if VCell declines the unlink.
    """
    try:
        unmapped = await unmap_vcell_user(auth0_token, user_name)
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code, detail="Error unlinking VCell account."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, detail="Error communicating with VCell API."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Raised outside the try so the generic handlers above don't swallow it.
    if not unmapped:
        raise HTTPException(status_code=400, detail="Could not unlink.")

    return {
        "status": "success",
        "message": "Your VCell account is no longer linked.",
    }
