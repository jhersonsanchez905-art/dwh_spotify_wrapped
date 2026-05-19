"""
filename: test_profile.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Tests para el endpoint GET /v1/profile/me.
             Verifica protección JWT y manejo de errores.
"""


def test_get_profile_without_token_returns_401(client):
    """GET /v1/profile/me sin token debe retornar 401."""
    response = client.get("/v1/profile/me")
    assert response.status_code == 401 or response.status_code == 403


def test_get_profile_with_invalid_token_returns_401(client):
    """GET /v1/profile/me con token basura debe retornar 401."""
    response = client.get(
        "/v1/profile/me",
        headers={"Authorization": "Bearer token_invalido_basura"},
    )
    assert response.status_code == 401


def test_get_profile_with_expired_token_returns_401(client, expired_token):
    """GET /v1/profile/me con token expirado debe retornar 401."""
    response = client.get(
        "/v1/profile/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401