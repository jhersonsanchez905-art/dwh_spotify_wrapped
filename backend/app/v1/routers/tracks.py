from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import tracks_service

router = APIRouter(prefix="/tracks", tags=["Tracks"])

@router.get("/top")
def get_top_tracks(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return tracks_service.get_top_tracks(db)