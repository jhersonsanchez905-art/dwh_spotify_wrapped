"""
filename: artists_service.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Servicio para obtener los top artistas del usuario
             desde dwh.dim_artists.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_top_artists(db: Session, spotify_id: str, limit: int = 100) -> list[dict]:
    result = db.execute(
        text("""
            SELECT a.artist_id, a.spotify_id, a.name, a.popularity,
                   a.followers_count, a.genres
            FROM dwh.dim_artists a
            ORDER BY a.popularity DESC
            LIMIT :limit
        """),
        {"limit": limit},
    ).fetchall()

    return [
        {
            "id": str(row[0]),
            "spotify_id": row[1],
            "name": row[2],
            "popularity": row[3],
            "followers": row[4],
            "genres": row[5] if row[5] else [],
            "play_count": 0,
        }
        for row in result
    ]
    