from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import profile_service

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/me")
def get_my_profile(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = profile_service.get_user_profile(spotify_id, db)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return profile