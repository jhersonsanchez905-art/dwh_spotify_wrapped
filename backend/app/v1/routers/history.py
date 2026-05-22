"""
filename: history.py (router)
author: [nombre]
date: 2026-05-22
version: 2.0
description: Router para endpoints de historial de reproducciones.
             Incluye recently-played, peak-hour y genres.
"""

from fastapi import APIRouter, Depends
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
    """Retorna el historial reciente del usuario con day_of_week normalizado."""
    items = history_service.get_recently_played(spotify_id, db)
    return {"items": items, "total": len(items)}


@router.get("/peak-hour")
def get_peak_hour(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna la hora del día con más reproducciones del usuario."""
    result = history_service.get_peak_hour(spotify_id, db)
    if result is None:
        return {"hour_of_day": None, "play_count": 0}
    return result


@router.get("/genres")
def get_top_genres(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna los géneros dominantes basados en artistas escuchados por el usuario."""
    genres = history_service.get_top_genres(spotify_id, db)
    return {"genres": genres, "total": len(genres)}