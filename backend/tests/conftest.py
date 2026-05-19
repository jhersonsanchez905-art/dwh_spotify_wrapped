"""
filename: conftest.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Fixtures compartidos para los tests. Provee un TestClient
             de FastAPI y un token JWT mock para probar endpoints protegidos.
"""

import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from jose import jwt

from backend.app.core.config import settings
from backend.main import app


@pytest.fixture
def client():
    """
    Provee un TestClient de FastAPI para hacer requests de prueba.

    Returns:
        TestClient: Cliente HTTP sincrónico para testing.
    """
    return TestClient(app)


@pytest.fixture
def mock_token():
    """
    Genera un JWT válido de prueba con un spotify_id ficticio.

    Returns:
        str: JWT firmado con el SECRET_KEY de la app.
    """
    payload = {
        "sub": "test_spotify_user_123",
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


@pytest.fixture
def auth_headers(mock_token):
    """
    Provee headers de autorización con el token mock.

    Returns:
        dict: Headers con Authorization Bearer.
    """
    return {"Authorization": f"Bearer {mock_token}"}


@pytest.fixture
def expired_token():
    """
    Genera un JWT expirado para probar rechazo de tokens.

    Returns:
        str: JWT firmado pero ya expirado.
    """
    payload = {
        "sub": "test_spotify_user_123",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")