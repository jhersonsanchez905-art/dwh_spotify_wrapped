"""
filename: tracks_service.py
author: [nombre]
date: 2026-05-22
version: 2.0
description: Servicio para obtener los top tracks del usuario
             desde dwh.dim_tracks, filtrado por usuario autenticado
             y con play_count real desde fact_listening_history.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_top_tracks(db: Session, spotify_id: str, limit: int = 100) -> list[dict]:
    """
    Retorna los tracks más escuchados del usuario autenticado,
    ordenados por cantidad real de reproducciones en fact_listening_history.

    Args:
        db (Session): Sesión de SQLAlchemy.
        spotify_id (str): ID de Spotify del usuario autenticado.
        limit (int): Cantidad máxima de tracks a retornar.

    Returns:
        list[dict]: Lista de tracks con play_count real.
    """
    result = db.execute(
        text("""
            SELECT
                t.track_id,
                t.spotify_id,
                t.name,
                t.artist_id,
                t.album_name,
                t.duration_ms,
                t.popularity,
                t.explicit,
                a.name AS artist_name,
                COUNT(f.id) AS play_count
            FROM dwh.dim_tracks t
            LEFT JOIN dwh.dim_artists a ON a.artist_id = t.artist_id
            JOIN dwh.fact_listening_history f ON f.track_id = t.track_id
            JOIN dwh.dim_users u ON u.user_id = f.user_id
            WHERE u.spotify_id = :spotify_id
            GROUP BY
                t.track_id, t.spotify_id, t.name, t.artist_id,
                t.album_name, t.duration_ms, t.popularity,
                t.explicit, a.name
            ORDER BY play_count DESC
            LIMIT :limit
        """),
        {"spotify_id": spotify_id, "limit": limit},
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
            "explicit": row[7],
            "artist_name": row[8],
            "play_count": row[9],
        }
        for row in result
    ]