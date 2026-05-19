"""
filename: test_etl.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Tests para los endpoints del ETL: POST /v1/etl/run
             y GET /v1/etl/status. Verifica protección JWT.
"""


def test_run_etl_without_token_returns_401(client):
    """POST /v1/etl/run sin token debe retornar 401."""
    response = client.post("/v1/etl/run")
    assert response.status_code == 401 or response.status_code == 403


def test_run_etl_with_invalid_token_returns_401(client):
    """POST /v1/etl/run con token inválido debe retornar 401."""
    response = client.post(
        "/v1/etl/run",
        headers={"Authorization": "Bearer token_falso"},
    )
    assert response.status_code == 401


def test_get_etl_status_without_token_returns_401(client):
    """GET /v1/etl/status sin token debe retornar 401."""
    response = client.get("/v1/etl/status")
    assert response.status_code == 401 or response.status_code == 403


def test_get_etl_status_with_invalid_token_returns_401(client):
    """GET /v1/etl/status con token inválido debe retornar 401."""
    response = client.get(
        "/v1/etl/status",
        headers={"Authorization": "Bearer token_falso"},
    )
    assert response.status_code == 401