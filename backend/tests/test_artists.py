"""
filename: test_artists.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Tests para el endpoint GET /v1/artists/top.
             Verifica protección JWT y respuestas.
"""


def test_get_top_artists_without_token_returns_401(client):
    """GET /v1/artists/top sin token debe retornar 401."""
    response = client.get("/v1/artists/top")
    assert response.status_code == 401 or response.status_code == 403


def test_get_top_artists_with_invalid_token_returns_401(client):
    """GET /v1/artists/top con token inválido debe retornar 401."""
    response = client.get(
        "/v1/artists/top",
        headers={"Authorization": "Bearer token_falso"},
    )
    assert response.status_code == 401