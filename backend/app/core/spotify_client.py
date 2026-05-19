"""
filename: spotify_client.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Cliente HTTP centralizado para la Spotify Web API.
             Todas las llamadas a Spotify pasan por este módulo.
             Usa httpx (async) como lo exige el stack del proyecto.
"""

import httpx

from backend.app.core.config import settings

# ── URLs base de Spotify ───────────────────────────────────────
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"


def _auth_headers(token: str) -> dict:
    """
    Construye los headers de autorización para la Spotify API.

    Args:
        token (str): Access token de Spotify.

    Returns:
        dict: Headers con Authorization Bearer.
    """
    return {"Authorization": f"Bearer {token}"}


async def get_current_user(token: str) -> dict:
    """
    Obtiene el perfil del usuario autenticado desde Spotify.

    Args:
        token (str): Access token de Spotify (Bearer).

    Returns:
        dict: Perfil del usuario en formato JSON crudo de Spotify.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_URL}/me",
            headers=_auth_headers(token),
        )
        response.raise_for_status()
        return response.json()


async def get_top_artists(token: str, limit: int = 50, time_range: str = "medium_term") -> list[dict]:
    """
    Obtiene los top artistas del usuario desde Spotify.

    Args:
        token (str): Access token de Spotify (Bearer).
        limit (int): Cantidad máxima de artistas (1-50). Default: 50.
        time_range (str): Período de tiempo (short_term, medium_term, long_term).

    Returns:
        list[dict]: Lista de objetos artista en formato JSON crudo de Spotify.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_URL}/me/top/artists",
            headers=_auth_headers(token),
            params={"limit": limit, "time_range": time_range},
        )
        response.raise_for_status()
        return response.json()["items"]


async def get_top_tracks(token: str, limit: int = 50, time_range: str = "medium_term") -> list[dict]:
    """
    Obtiene los top tracks del usuario desde Spotify.

    Args:
        token (str): Access token de Spotify (Bearer).
        limit (int): Cantidad máxima de tracks (1-50). Default: 50.
        time_range (str): Período de tiempo (short_term, medium_term, long_term).

    Returns:
        list[dict]: Lista de objetos track en formato JSON crudo de Spotify.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_URL}/me/top/tracks",
            headers=_auth_headers(token),
            params={"limit": limit, "time_range": time_range},
        )
        response.raise_for_status()
        return response.json()["items"]


async def get_recently_played(token: str, limit: int = 50, after: int | None = None) -> dict:
    """
    Obtiene las reproducciones recientes del usuario desde Spotify.

    Args:
        token (str): Access token de Spotify (Bearer).
        limit (int): Cantidad máxima de reproducciones (1-50). Default: 50.
        after (int | None): Cursor Unix ms. Si se pasa, retorna solo
                            reproducciones después de ese momento.

    Returns:
        dict: Respuesta completa con items[] y cursors{} de Spotify.
    """
    params = {"limit": limit}
    if after is not None:
        params["after"] = after

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SPOTIFY_API_URL}/me/player/recently-played",
            headers=_auth_headers(token),
            params=params,
        )
        response.raise_for_status()
        return response.json()


async def exchange_code_for_tokens(code: str, code_verifier: str) -> dict:
    """
    Intercambia el authorization code por access_token y refresh_token.

    Args:
        code (str): Authorization code recibido de Spotify en el callback.
        code_verifier (str): PKCE code_verifier generado en /auth/login.

    Returns:
        dict: Respuesta con access_token, refresh_token, expires_in.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
                "client_id": settings.SPOTIFY_CLIENT_ID,
                "code_verifier": code_verifier,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()


async def refresh_access_token(refresh_token: str) -> dict:
    """
    Renueva el access_token usando el refresh_token.

    Args:
        refresh_token (str): Refresh token almacenado en dim_users.

    Returns:
        dict: Respuesta con nuevo access_token y expires_in.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.SPOTIFY_CLIENT_ID,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()