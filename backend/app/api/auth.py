from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str | None
    clerk_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user session details.
    """
    return current_user
