"""
filename: enrichment.py (router)
author: [nombre]
date: 2026-05-22
version: 1.0
description: Router para disparar el enriquecimiento masivo
             de dim_artists y dim_tracks con Last.fm.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import enrichment_service

router = APIRouter(prefix="/enrichment", tags=["Enrichment"])


@router.post("/artists")
async def enrich_artists(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Enriquece todos los artistas en dim_artists que tienen
    popularity=0 o genres vacío usando Last.fm.
    """
    result = await enrichment_service.enrich_all_artists(db)
    return {
        "ok": True,
        "message": f"Enriquecidos {result['enriched']} de {result['total_artists_missing']} artistas",
        **result,
    }


@router.post("/tracks")
async def enrich_tracks(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Actualiza popularity en dim_tracks usando el popularity
    del artista asociado como proxy.
    """
    result = await enrichment_service.enrich_all_tracks(db)
    return {
        "ok": True,
        "message": f"{result['tracks_updated']} tracks actualizados",
        **result,
    }


@router.post("/run")
async def enrich_all(
    spotify_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Corre el enriquecimiento completo: artistas primero, luego tracks.
    """
    artists_result = await enrichment_service.enrich_all_artists(db)
    tracks_result  = await enrichment_service.enrich_all_tracks(db)

    return {
        "ok": True,
        "artists": artists_result,
        "tracks":  tracks_result,
    }