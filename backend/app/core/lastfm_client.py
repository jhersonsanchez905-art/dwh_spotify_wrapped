"""
filename: lastfm_client.py
author: [nombre]
date: 2026-05-22
version: 1.0
description: Cliente HTTP para la Last.fm API.
             Usado exclusivamente para enriquecer dim_artists
             con popularity (listeners), followers_count (playcount)
             y genres (tags) cuando Spotify no los provee.
"""

import httpx
from backend.app.core.config import settings

LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/"


async def get_artist_info(artist_name: str) -> dict | None:
    """
    Obtiene información de un artista desde Last.fm por nombre.

    Args:
        artist_name (str): Nombre del artista a buscar.

    Returns:
        dict | None: Datos del artista o None si no se encuentra.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                LASTFM_API_URL,
                params={
                    "method": "artist.getinfo",
                    "artist": artist_name,
                    "api_key": settings.LASTFM_API_KEY,
                    "format": "json",
                    "autocorrect": 1,
                },
            )
            response.raise_for_status()
            data = response.json()

            if "error" in data:
                return None

            artist = data.get("artist", {})
            stats = artist.get("stats", {})
            tags = artist.get("tags", {}).get("tag", [])

            # listeners → usamos como proxy de popularity (0–100 normalizado)
            listeners = int(stats.get("listeners", 0))
            playcount = int(stats.get("playcount", 0))

            # Normalizar listeners a escala 0–100
            # Top artistas de Last.fm tienen ~10M listeners
            MAX_LISTENERS = 10_000_000
            normalized_popularity = min(100, int((listeners / MAX_LISTENERS) * 100))

            genres = [tag["name"].lower() for tag in tags[:5]] if tags else []

            return {
                "popularity": normalized_popularity,
                "followers_count": playcount,
                "genres": genres,
            }

    except Exception:
        return None