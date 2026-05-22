from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import history_service

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/recently-played")
def get_recently_played(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = history_service.get_recently_played(spotify_id, db, limit=500)
    return {"items": items, "total": len(items)}

@router.get("/peak-hour")
def get_peak_hour(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = history_service.get_peak_hour(spotify_id, db)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay datos de reproducciones. Ejecuta el ETL primero.",
        )
    return result

@router.get("/genres")
def get_top_genres(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return history_service.get_top_genres(spotify_id, db)