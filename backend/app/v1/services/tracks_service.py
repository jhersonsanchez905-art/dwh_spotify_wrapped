"""
filename: tracks_service.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Servicio para obtener los top tracks del usuario
             desde dwh.dim_tracks.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_top_tracks(db: Session, spotify_id: str, limit: int = 100) -> list[dict]:
    result = db.execute(
        text("""
            SELECT t.track_id, t.spotify_id, t.name, t.artist_id,
                   t.album_name, t.duration_ms, t.popularity,
                   t.explicit, a.name AS artist_name
            FROM dwh.dim_tracks t
            LEFT JOIN dwh.dim_artists a ON a.artist_id = t.artist_id
            ORDER BY t.popularity DESC
            LIMIT :limit
        """),
        {"limit": limit},
    ).fetchall()

    return [
        {
            "id": str(row[0]),
            "spotify_id": row[1],
            "name": row[2],
            "artist_id": str(row[3]) if row[3] else None,
            "album_name": row[4],
            "duration_ms": row[5],
            "popularity": row[6],
            "artist_name": row[8],
            "play_count": 0,
        }
        for row in result
    ]