from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core import spotify_client
from backend.app.v1.dependencies import get_current_user
from backend.app.v1.services import etl_service
from backend.app.v1.schemas.etl import EtlRunResult, EtlStatus

router = APIRouter(prefix="/etl", tags=["ETL"])

async def _get_valid_token(spotify_id: str, db: Session) -> str:
    row = db.execute(
        text("SELECT spotify_access_token, spotify_refresh_token, token_expires_at FROM dwh.dim_users WHERE spotify_id = :spotify_id"),
        {"spotify_id": spotify_id},
    ).fetchone()
    if not row or not row[0]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontraron tokens. Vuelve a iniciar sesion.")
    access_token, refresh_token, token_expires_at = row
    if token_expires_at:
        if token_expires_at.tzinfo is None:
            token_expires_at = token_expires_at.replace(tzinfo=timezone.utc)
        if token_expires_at < datetime.now(timezone.utc) + timedelta(minutes=5):
            token_data = await spotify_client.refresh_access_token(refresh_token)
            access_token = token_data["access_token"]
            db.execute(
                text("UPDATE dwh.dim_users SET spotify_access_token = :t, token_expires_at = :e WHERE spotify_id = :sid"),
                {"t": access_token, "e": datetime.now(timezone.utc) + timedelta(seconds=token_data["expires_in"]), "sid": spotify_id}
            )
            db.commit()
    return access_token

@router.post("/run", response_model=EtlRunResult)
async def run_etl(spotify_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    token = await _get_valid_token(spotify_id, db)
    result = await etl_service.run_etl_pipeline(token, spotify_id, db)
    return result

@router.get("/status")
def get_etl_status(spotify_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    runs = db.execute(
        text("""
            SELECT audit_id, started_at, finished_at, duration_ms, status,
                   history_new, history_skipped, artists_new, tracks_new,
                   cursor_next_ms, error_message
            FROM dwh.etl_audit
            WHERE spotify_user_id = :sid
            ORDER BY started_at DESC LIMIT 10
        """),
        {"sid": spotify_id}
    ).fetchall()

    total_runs = len(runs)
    last_run = None
    last_successful_at = None

    if runs:
        r = runs[0]
        last_run = {
            "audit_id": str(r[0]),
            "status": r[4],
            "started_at": r[1].isoformat() if r[1] else None,
            "finished_at": r[2].isoformat() if r[2] else None,
            "duration_ms": r[3] or 0,
            "history_inserted": r[5] or 0,
            "history_skipped": r[6] or 0,
            "artists_inserted": r[7] or 0,
            "tracks_inserted": r[8] or 0,
            "cursor_next_ms": r[9],
            "error_message": r[10],
        }
        successful = [r for r in runs if r[4] == "success"]
        if successful:
            last_successful_at = successful[0][2].isoformat() if successful[0][2] else None

    return {
        "total_runs": total_runs,
        "last_run": last_run,
        "is_running": False,
        "last_successful_at": last_successful_at,
    }