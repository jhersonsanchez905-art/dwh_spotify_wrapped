"""
filename: test_auth.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Tests para los endpoints de autenticación OAuth PKCE.
             Verifica el flujo de login (redirect a Spotify) y
             el manejo de errores en callback.
"""


def test_login_redirects_to_spotify(client):
    """GET /v1/auth/login debe retornar 302 redirect a accounts.spotify.com."""
    response = client.get("/v1/auth/login", follow_redirects=False)
    assert response.status_code == 302
    assert "accounts.spotify.com/authorize" in response.headers["location"]


def test_login_includes_pkce_params(client):
    """La URL de redirect debe incluir code_challenge y state."""
    response = client.get("/v1/auth/login", follow_redirects=False)
    location = response.headers["location"]
    assert "code_challenge=" in location
    assert "code_challenge_method=S256" in location
    assert "state=" in location


def test_login_includes_required_scopes(client):
    """La URL de redirect debe incluir los 4 scopes requeridos."""
    response = client.get("/v1/auth/login", follow_redirects=False)
    location = response.headers["location"]
    assert "user-read-private" in location
    assert "user-read-email" in location
    assert "user-top-read" in location
    assert "user-read-recently-played" in location


def test_callback_without_params_returns_400(client):
    """GET /v1/auth/callback sin code ni state debe retornar 400."""
    response = client.get("/v1/auth/callback")
    assert response.status_code == 400


def test_callback_with_error_returns_400(client):
    """GET /v1/auth/callback con error de Spotify debe retornar 400."""
    response = client.get("/v1/auth/callback?error=access_denied")
    assert response.status_code == 400


def test_callback_with_invalid_state_returns_400(client):
    """GET /v1/auth/callback con state inválido debe retornar 400."""
    response = client.get("/v1/auth/callback?code=fake_code&state=invalid_state")
    assert response.status_code == 400