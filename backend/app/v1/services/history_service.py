"""
filename: history_service.py
author: [nombre]
date: 2026-05-22
version: 2.0
description: Servicio para consultar el historial de reproducciones
             desde dwh.fact_listening_history. Todos los métodos
             filtran correctamente por usuario autenticado.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_recently_played(spotify_id: str, db: Session, limit: int = 50) -> list[dict]:
    """
    Consulta las reproducciones recientes del usuario desde el DWH.

    Args:
        spotify_id (str): ID de Spotify del usuario autenticado.
        db (Session): Sesión de SQLAlchemy.
        limit (int): Cantidad máxima de reproducciones a retornar.

    Returns:
        list[dict]: Lista de reproducciones con datos de track y artista.
    """
    result = db.execute(
        text("""
            SELECT
                f.id,
                f.user_id,
                f.track_id,
                f.artist_id,
                f.played_at,
                f.hour_of_day,
                f.day_of_week,
                f.context_type,
                t.name AS track_name,
                a.name AS artist_name
            FROM dwh.fact_listening_history f
            JOIN dwh.dim_users u ON u.user_id = f.user_id
            JOIN dwh.dim_tracks t ON t.track_id = f.track_id
            JOIN dwh.dim_artists a ON a.artist_id = f.artist_id
            WHERE u.spotify_id = :spotify_id
            ORDER BY f.played_at DESC
            LIMIT :limit
        """),
        {"spotify_id": spotify_id, "limit": limit},
    ).fetchall()

    # Mapa de nombre de día en inglés a índice numérico (0=Monday … 6=Sunday)
    # Necesario porque el ETL guarda day_of_week como VARCHAR ("Monday", etc.)
    DAY_NAME_TO_INT = {
        "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
        "Friday": 4, "Saturday": 5, "Sunday": 6,
    }

    return [
        {
            "id": row[0],
            "user_id": row[1],
            "track_id": row[2],
            "artist_id": row[3],
            "played_at": row[4],
            "hour_of_day": row[5],
            # Normalizar: si es string lo convertimos a int; si ya es int lo dejamos
            "day_of_week": (
                DAY_NAME_TO_INT.get(row[6], 0)
                if isinstance(row[6], str)
                else row[6]
            ),
            "context_type": row[7],
            "track_name": row[8],
            "artist_name": row[9],
        }
        for row in result
    ]


def get_peak_hour(spotify_id: str, db: Session) -> dict | None:
    """
    Encuentra la hora del día con más reproducciones del usuario.

    Args:
        spotify_id (str): ID de Spotify del usuario autenticado.
        db (Session): Sesión de SQLAlchemy.

    Returns:
        dict | None: Hora pico con conteo, o None si no hay datos.
    """
    result = db.execute(
        text("""
            SELECT f.hour_of_day, COUNT(*) AS play_count
            FROM dwh.fact_listening_history f
            JOIN dwh.dim_users u ON u.user_id = f.user_id
            WHERE u.spotify_id = :spotify_id
            GROUP BY f.hour_of_day
            ORDER BY play_count DESC
            LIMIT 1
        """),
        {"spotify_id": spotify_id},
    ).fetchone()

    if result is None:
        return None

    return {
        "hour_of_day": result[0],
        "play_count": result[1],
    }


def get_top_genres(spotify_id: str, db: Session, limit: int = 10) -> list[dict]:
    """
    Obtiene los géneros dominantes del usuario usando UNNEST sobre
    dim_artists.genres, filtrado por artistas que el usuario ha escuchado.

    Args:
        spotify_id (str): ID de Spotify del usuario autenticado.
        db (Session): Sesión de SQLAlchemy.
        limit (int): Cantidad de géneros a retornar.

    Returns:
        list[dict]: Lista de géneros con conteo de artistas.
    """
    result = db.execute(
        text("""
            SELECT UNNEST(a.genres) AS genre, COUNT(DISTINCT a.artist_id) AS artist_count
            FROM dwh.dim_artists a
            JOIN dwh.fact_listening_history f ON f.artist_id = a.artist_id
            JOIN dwh.dim_users u ON u.user_id = f.user_id
            WHERE u.spotify_id = :spotify_id
              AND a.genres IS NOT NULL
              AND array_length(a.genres, 1) > 0
            GROUP BY genre
            ORDER BY artist_count DESC
            LIMIT :limit
        """),
        {"spotify_id": spotify_id, "limit": limit},
    ).fetchall()

    return [
        {
            "genre": row[0],
            "artist_count": row[1],
        }
        for row in result
    ]