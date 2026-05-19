"""
filename: test_health.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Test para el endpoint de health check.
"""


def test_health_returns_200(client):
    """GET / debe retornar 200 con status ok."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}