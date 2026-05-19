from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import artists_service

router = APIRouter(prefix="/artists", tags=["Artists"])

@router.get("/top")
def get_top_artists(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return artists_service.get_top_artists(db)