"""
filename: test_history.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Tests para los endpoints de historial: recently-played,
             peak-hour, genres. Verifica protección JWT.
"""


def test_get_recently_played_without_token_returns_401(client):
    """GET /v1/history/recently-played sin token debe retornar 401."""
    response = client.get("/v1/history/recently-played")
    assert response.status_code == 401 or response.status_code == 403


def test_get_recently_played_with_invalid_token_returns_401(client):
    """GET /v1/history/recently-played con token inválido debe retornar 401."""
    response = client.get(
        "/v1/history/recently-played",
        headers={"Authorization": "Bearer token_falso"},
    )
    assert response.status_code == 401


def test_get_peak_hour_without_token_returns_401(client):
    """GET /v1/history/peak-hour sin token debe retornar 401."""
    response = client.get("/v1/history/peak-hour")
    assert response.status_code == 401 or response.status_code == 403


def test_get_genres_without_token_returns_401(client):
    """GET /v1/history/genres sin token debe retornar 401."""
    response = client.get("/v1/history/genres")
    assert response.status_code == 401 or response.status_code == 403