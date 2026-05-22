"""
filename: artists_service.py
author: [nombre]
date: 2026-05-22
version: 2.0
description: Servicio para obtener los top artistas del usuario
             desde dwh.dim_artists, filtrado por usuario autenticado
             y con play_count real desde fact_listening_history.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_top_artists(db: Session, spotify_id: str, limit: int = 100) -> list[dict]:
    """
    Retorna los artistas más escuchados del usuario autenticado,
    ordenados por cantidad real de reproducciones en fact_listening_history.

    Args:
        db (Session): Sesión de SQLAlchemy.
        spotify_id (str): ID de Spotify del usuario autenticado.
        limit (int): Cantidad máxima de artistas a retornar.

    Returns:
        list[dict]: Lista de artistas con play_count real.
    """
    result = db.execute(
        text("""
            SELECT
                a.artist_id,
                a.spotify_id,
                a.name,
                a.popularity,
                a.followers_count,
                a.genres,
                COUNT(f.id) AS play_count
            FROM dwh.dim_artists a
            JOIN dwh.fact_listening_history f ON f.artist_id = a.artist_id
            JOIN dwh.dim_users u ON u.user_id = f.user_id
            WHERE u.spotify_id = :spotify_id
              AND a.name != 'Unknown'
              AND a.name IS NOT NULL
            GROUP BY
                a.artist_id, a.spotify_id, a.name,
                a.popularity, a.followers_count, a.genres
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
            "popularity": row[3],
            "followers": row[4],
            "genres": row[5] if row[5] else [],
            "play_count": row[6],
        }
        for row in result
    ]