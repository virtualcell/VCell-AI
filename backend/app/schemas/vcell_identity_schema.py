from typing import Optional

from pydantic import BaseModel, Field


class MapVCellUserRequest(BaseModel):
    """Schema for linking an existing VCell account to the current login."""

    userID: str = Field(..., min_length=1, description="Existing VCell username")
    # VCell digests the password unconditionally and raises an unhandled 500 on an
    # empty one, so an empty password is rejected here before the call is made.
    password: str = Field(
        ..., min_length=1, description="Password for that VCell account"
    )


class NewVCellUserRequest(BaseModel):
    """Schema for creating a new VCell account for the current login."""

    # VCell's UserRegistrationInfo also accepts title/organization/country, but
    # createUserIdentity reads the email and full name off the JWT instead, so the
    # username is the only field that carries any weight.
    userID: str = Field(..., min_length=1, description="Desired VCell username")


class RecoverVCellAccountRequest(BaseModel):
    """Schema for requesting a VCell account-recovery email."""

    userID: str = Field(..., min_length=1, description="Existing VCell username")
    email: str = Field(
        ..., min_length=1, description="Email registered with that VCell account"
    )


class VCellMappedUserResponse(BaseModel):
    """VCell's UserIdentityJSONSafe, passed through unchanged.

    An unlinked caller is not an error: VCell answers 200 with mapped=false and
    every other field null.
    """

    mapped: bool
    userName: Optional[str] = None
    id: Optional[float] = None
    subject: Optional[str] = None
    insertDate: Optional[str] = None


class VCellIdentityActionResponse(BaseModel):
    """Result of a link / create / recover / unlink action."""

    status: str
    message: str
