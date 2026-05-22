"""
filename: enrichment_service.py
author: [nombre]
date: 2026-05-22
version: 1.0
description: Servicio de enriquecimiento masivo para dim_artists.
             Busca en Last.fm todos los artistas que tienen
             popularity=0 o genres='{}' en la DB y los actualiza.
             Se ejecuta al final del pipeline ETL.
"""

import asyncio
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.core.lastfm_client import get_artist_info


async def enrich_all_artists(db: Session) -> dict:
    """
    Busca todos los artistas en dim_artists con datos incompletos
    y los enriquece con Last.fm.

    Args:
        db (Session): Sesión de SQLAlchemy.

    Returns:
        dict: Métricas del enriquecimiento.
    """
    # Obtener todos los artistas con datos faltantes
    rows = db.execute(
        text("""
            SELECT artist_id, name, popularity, followers_count, genres
            FROM dwh.dim_artists
            WHERE
                popularity = 0
                OR genres IS NULL
                OR array_length(genres, 1) IS NULL
                OR array_length(genres, 1) = 0
            ORDER BY artist_id
        """)
    ).fetchall()

    total = len(rows)
    enriched = 0
    failed = 0

    for row in rows:
        artist_id = row[0]
        name      = row[1]
        current_popularity     = row[2]
        current_followers      = row[3]
        current_genres         = row[4]

        # Llamar Last.fm con un pequeño delay para no saturar la API
        await asyncio.sleep(0.25)

        lastfm_data = await get_artist_info(name)

        if lastfm_data is None:
            failed += 1
            continue

        new_popularity     = lastfm_data["popularity"]     if current_popularity == 0       else current_popularity
        new_followers      = lastfm_data["followers_count"] if (current_followers or 0) == 0 else current_followers
        new_genres         = lastfm_data["genres"]          if not current_genres             else current_genres

        db.execute(
            text("""
                UPDATE dwh.dim_artists
                SET
                    popularity      = :popularity,
                    followers_count = :followers_count,
                    genres          = :genres
                WHERE artist_id = :artist_id
            """),
            {
                "artist_id":      artist_id,
                "popularity":     new_popularity,
                "followers_count": new_followers,
                "genres":         new_genres,
            },
        )
        enriched += 1

    db.commit()

    return {
        "total_artists_missing": total,
        "enriched": enriched,
        "failed": failed,
    }


async def enrich_all_tracks(db: Session) -> dict:
    """
    Busca todos los tracks en dim_tracks con popularity=0
    y los enriquece usando el popularity del artista asociado
    como aproximación (Last.fm no tiene endpoint de tracks gratuito
    con popularity directa).

    Args:
        db (Session): Sesión de SQLAlchemy.

    Returns:
        dict: Métricas del enriquecimiento.
    """
    # Para tracks usamos el popularity del artista como proxy
    updated = db.execute(
        text("""
            UPDATE dwh.dim_tracks t
            SET popularity = a.popularity
            FROM dwh.dim_artists a
            WHERE t.artist_id = a.artist_id
              AND t.popularity = 0
              AND a.popularity > 0
        """)
    ).rowcount

    db.commit()

    return {
        "tracks_updated": updated,
    }