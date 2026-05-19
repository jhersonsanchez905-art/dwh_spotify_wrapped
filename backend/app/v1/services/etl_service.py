"""
filename: etl_service.py
author: [nombre]
date: 2026-05-14
version: 1.0
description: Servicio ETL que orquesta extract, transform y load desde
             Spotify hacia el DWH en PostgreSQL. Contiene las 3 fases
             separadas con funciones individuales por entidad, auditoría
             completa y carga incremental con cursor.
"""

import time
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.core import spotify_client


# ═══════════════════════════════════════════════════════════════
# EXTRACT — Solo llama a Spotify, retorna JSON crudo. Sin lógica.
# ═══════════════════════════════════════════════════════════════

async def extract_user(token: str) -> dict:
    return await spotify_client.get_current_user(token)


async def extract_top_artists(token: str) -> list[dict]:
    return await spotify_client.get_top_artists(token)


async def extract_top_tracks(token: str) -> list[dict]:
    return await spotify_client.get_top_tracks(token)


async def extract_recently_played(token: str, after: int | None = None) -> list[dict]:
    data = await spotify_client.get_recently_played(token, after=after)
    return data.get("items", [])


# ═══════════════════════════════════════════════════════════════
# TRANSFORM — Normaliza datos para el modelo dimensional.
# ═══════════════════════════════════════════════════════════════

def transform_user(raw: dict) -> dict:
    return {
        "spotify_id": raw["id"],
        "display_name": raw.get("display_name"),
        "email": raw.get("email"),
        "country": raw.get("country"),
        "followers": raw.get("followers", {}).get("total", 0),
        "product": raw.get("product"),
    }


def transform_artists(raw_list: list[dict]) -> list[dict]:
    return [
        {
            "spotify_id": artist["id"],
            "name": artist["name"],
            "popularity": artist.get("popularity", 0),
            "followers_count": artist.get("followers", {}).get("total", 0),
            "genres": artist.get("genres", []),
        }
        for artist in raw_list
    ]


def transform_tracks(raw_list: list[dict]) -> list[dict]:
    return [
        {
            "spotify_id": track["id"],
            "name": track["name"],
            "artist_spotify_id": track["artists"][0]["id"] if track.get("artists") else None,
            "album_name": track.get("album", {}).get("name"),
            "duration_ms": track.get("duration_ms", 0),
            "popularity": track.get("popularity", 0),
            "explicit": track.get("explicit", False),
        }
        for track in raw_list
    ]


def transform_history(raw_items: list[dict]) -> list[dict]:
    transformed = []
    for item in raw_items:
        played_at_str = item["played_at"]
        played_at = datetime.fromisoformat(played_at_str.replace("Z", "+00:00"))
        track = item.get("track", {})
        artists = track.get("artists", [])
        transformed.append({
            "track_spotify_id": track.get("id"),
            "artist_spotify_id": artists[0]["id"] if artists else None,
            "played_at": played_at,
            "hour_of_day": played_at.hour,
            "day_of_week": played_at.strftime("%A"),
            "context_type": (item.get("context") or {}).get("type") or "unknown",
        })
    return transformed


# ═══════════════════════════════════════════════════════════════
# LOAD — Inserta en PostgreSQL con idempotencia (ON CONFLICT).
# ═══════════════════════════════════════════════════════════════

def load_user(data: dict, db: Session) -> dict:
    result = db.execute(
        text("""
            INSERT INTO dwh.dim_users (spotify_id, display_name, email, country, followers, product)
            VALUES (:spotify_id, :display_name, :email, :country, :followers, :product)
            ON CONFLICT (spotify_id) DO UPDATE SET
                display_name = EXCLUDED.display_name,
                email = EXCLUDED.email,
                country = EXCLUDED.country,
                followers = EXCLUDED.followers,
                product = EXCLUDED.product
            RETURNING (xmax = 0) AS inserted
        """),
        data,
    )
    row = result.fetchone()
    return {"users_new": 1 if row and row[0] else 0}


def load_artists(data_list: list[dict], db: Session) -> dict:
    new = 0
    skipped = 0

    for data in data_list:
        result = db.execute(
            text("""
                INSERT INTO dwh.dim_artists (spotify_id, name, popularity, followers_count, genres)
                VALUES (:spotify_id, :name, :popularity, :followers_count, :genres)
                ON CONFLICT (spotify_id) DO UPDATE SET
                    popularity = EXCLUDED.popularity,
                    followers_count = EXCLUDED.followers_count,
                    genres = EXCLUDED.genres
                WHERE dwh.dim_artists.popularity = 0
                RETURNING artist_id
            """),
            {
                "spotify_id": data["spotify_id"],
                "name": data["name"],
                "popularity": data["popularity"],
                "followers_count": data["followers_count"],
                "genres": data["genres"],
            },
        )
        if result.fetchone():
            new += 1
        else:
            skipped += 1

    return {"artists_new": new, "artists_skipped": skipped}


def load_tracks(data_list: list[dict], db: Session) -> dict:
    new = 0
    skipped = 0

    for data in data_list:
        artist_id = None
        if data["artist_spotify_id"]:
            artist_row = db.execute(
                text("SELECT artist_id FROM dwh.dim_artists WHERE spotify_id = :sid"),
                {"sid": data["artist_spotify_id"]},
            ).fetchone()
            if artist_row:
                artist_id = artist_row[0]

        result = db.execute(
            text("""
                INSERT INTO dwh.dim_tracks
                    (spotify_id, name, artist_id, album_name, duration_ms, popularity, explicit)
                VALUES
                    (:spotify_id, :name, :artist_id, :album_name, :duration_ms, :popularity, :explicit)
                ON CONFLICT (spotify_id) DO UPDATE SET
                    popularity = EXCLUDED.popularity,
                    duration_ms = EXCLUDED.duration_ms,
                    album_name = EXCLUDED.album_name
                WHERE dwh.dim_tracks.popularity = 0
                RETURNING track_id
            """),
            {
                "spotify_id": data["spotify_id"],
                "name": data["name"],
                "artist_id": artist_id,
                "album_name": data["album_name"],
                "duration_ms": data["duration_ms"],
                "popularity": data["popularity"],
                "explicit": data["explicit"],
            },
        )
        if result.fetchone():
            new += 1
        else:
            skipped += 1

    return {"tracks_new": new, "tracks_skipped": skipped}


def load_history(data_list: list[dict], spotify_id: str, db: Session) -> dict:
    user_row = db.execute(
        text("SELECT user_id FROM dwh.dim_users WHERE spotify_id = :sid"),
        {"sid": spotify_id},
    ).fetchone()

    if not user_row:
        return {"history_new": 0, "history_skipped": len(data_list)}

    user_id = user_row[0]
    new = 0
    skipped = 0

    for data in data_list:
        track_row = db.execute(
            text("SELECT track_id FROM dwh.dim_tracks WHERE spotify_id = :sid"),
            {"sid": data["track_spotify_id"]},
        ).fetchone()

        artist_row = db.execute(
            text("SELECT artist_id FROM dwh.dim_artists WHERE spotify_id = :sid"),
            {"sid": data["artist_spotify_id"]},
        ).fetchone()

        if not track_row or not artist_row:
            skipped += 1
            continue

        result = db.execute(
            text("""
                INSERT INTO dwh.fact_listening_history
                    (user_id, track_id, artist_id, played_at, hour_of_day, day_of_week, context_type)
                VALUES
                    (:user_id, :track_id, :artist_id, :played_at, :hour_of_day, :day_of_week, :context_type)
                ON CONFLICT (user_id, played_at) DO NOTHING
                RETURNING id
            """),
            {
                "user_id": user_id,
                "track_id": track_row[0],
                "artist_id": artist_row[0],
                "played_at": data["played_at"],
                "hour_of_day": data["hour_of_day"],
                "day_of_week": data["day_of_week"],
                "context_type": data["context_type"],
            },
        )
        if result.fetchone():
            new += 1
        else:
            skipped += 1

    return {"history_new": new, "history_skipped": skipped}


# ═══════════════════════════════════════════════════════════════
# AUDIT
# ═══════════════════════════════════════════════════════════════

def insert_audit_start(spotify_user_id: str, db: Session) -> int:
    result = db.execute(
        text("""
            INSERT INTO dwh.etl_audit (spotify_user_id, started_at, status)
            VALUES (:spotify_user_id, :started_at, 'running')
            RETURNING audit_id
        """),
        {"spotify_user_id": spotify_user_id, "started_at": datetime.now(timezone.utc)},
    )
    db.commit()
    return result.fetchone()[0]


def get_last_cursor(spotify_user_id: str, db: Session) -> int | None:
    result = db.execute(
        text("""
            SELECT cursor_next_ms FROM dwh.etl_audit
            WHERE spotify_user_id = :spotify_user_id AND status = 'success'
            ORDER BY started_at DESC LIMIT 1
        """),
        {"spotify_user_id": spotify_user_id},
    ).fetchone()
    return result[0] if result else None


def played_at_to_unix_ms(played_at: datetime) -> int:
    return int(played_at.timestamp() * 1000)


def update_audit_success(audit_id, duration_ms, cursor_after_ms, cursor_next_ms, metrics, db):
    db.execute(
        text("""
            UPDATE dwh.etl_audit SET
                finished_at = :finished_at, duration_ms = :duration_ms,
                status = 'success',
                users_new = :users_new, artists_new = :artists_new,
                artists_skipped = :artists_skipped, tracks_new = :tracks_new,
                tracks_skipped = :tracks_skipped, history_new = :history_new,
                history_skipped = :history_skipped,
                cursor_after_ms = :cursor_after_ms, cursor_next_ms = :cursor_next_ms
            WHERE audit_id = :audit_id
        """),
        {"finished_at": datetime.now(timezone.utc), "duration_ms": duration_ms,
         "audit_id": audit_id, "cursor_after_ms": cursor_after_ms,
         "cursor_next_ms": cursor_next_ms, **metrics},
    )
    db.commit()


def update_audit_error(audit_id, duration_ms, error_message, db):
    db.execute(
        text("""
            UPDATE dwh.etl_audit SET
                finished_at = :finished_at, duration_ms = :duration_ms,
                status = 'error', error_message = :error_message
            WHERE audit_id = :audit_id
        """),
        {"finished_at": datetime.now(timezone.utc), "duration_ms": duration_ms,
         "error_message": error_message, "audit_id": audit_id},
    )
    db.commit()


# ═══════════════════════════════════════════════════════════════
# PIPELINE
# ═══════════════════════════════════════════════════════════════

async def run_etl_pipeline(token: str, spotify_id: str, db: Session) -> dict:
    audit_id = insert_audit_start(spotify_id, db)
    t0 = time.time()
    steps = []
    metrics = {
        "users_new": 0, "artists_new": 0, "artists_skipped": 0,
        "tracks_new": 0, "tracks_skipped": 0,
        "history_new": 0, "history_skipped": 0,
    }

    try:
        # ── 1. User ───────────────────────────────────────────
        raw_user = await extract_user(token)
        steps.append({"phase": "Extract", "detail": "Perfil de usuario obtenido", "ok": True})
        user_data = transform_user(raw_user)
        user_metrics = load_user(user_data, db)
        metrics["users_new"] = user_metrics["users_new"]
        steps.append({"phase": "Load", "detail": f"dim_users — {user_metrics['users_new']} nuevo / {1 - user_metrics['users_new']} ya existía", "ok": True})

        # ── 2. Artists ────────────────────────────────────────
        raw_artists = await extract_top_artists(token)
        steps.append({"phase": "Extract", "detail": f"{len(raw_artists)} artistas obtenidos", "ok": True})
        artists_data = transform_artists(raw_artists)
        artists_metrics = load_artists(artists_data, db)
        metrics["artists_new"] = artists_metrics["artists_new"]
        metrics["artists_skipped"] = artists_metrics["artists_skipped"]
        steps.append({"phase": "Load", "detail": f"dim_artists — {artists_metrics['artists_new']} nuevos / {artists_metrics['artists_skipped']} ya existían", "ok": True})

        # ── 3. Tracks ─────────────────────────────────────────
        raw_tracks = await extract_top_tracks(token)
        steps.append({"phase": "Extract", "detail": f"{len(raw_tracks)} canciones obtenidas", "ok": True})
        tracks_data = transform_tracks(raw_tracks)
        tracks_metrics = load_tracks(tracks_data, db)
        metrics["tracks_new"] = tracks_metrics["tracks_new"]
        metrics["tracks_skipped"] = tracks_metrics["tracks_skipped"]
        steps.append({"phase": "Load", "detail": f"dim_tracks — {tracks_metrics['tracks_new']} nuevos / {tracks_metrics['tracks_skipped']} ya existían", "ok": True})

        # ── 4. History ────────────────────────────────────────
        cursor_after_ms = get_last_cursor(spotify_id, db)
        raw_history = await extract_recently_played(token, after=cursor_after_ms)
        steps.append({"phase": "Extract", "detail": f"{len(raw_history)} reproducciones recientes obtenidas", "ok": True})

        for item in raw_history:
            track = item.get("track", {})
            artists = track.get("artists", [])
            if artists:
                artist = artists[0]
                db.execute(
                    text("""
                        INSERT INTO dwh.dim_artists (spotify_id, name, popularity, followers_count, genres)
                        VALUES (:spotify_id, :name, 0, 0, '{}')
                        ON CONFLICT (spotify_id) DO NOTHING
                    """),
                    {"spotify_id": artist["id"], "name": artist.get("name", "Unknown")},
                )
            if track.get("id"):
                artist_row = db.execute(
                    text("SELECT artist_id FROM dwh.dim_artists WHERE spotify_id = :sid"),
                    {"sid": artists[0]["id"] if artists else None},
                ).fetchone()
                db.execute(
                    text("""
                        INSERT INTO dwh.dim_tracks (spotify_id, name, artist_id, album_name, duration_ms, popularity, explicit)
                        VALUES (:spotify_id, :name, :artist_id, :album_name, :duration_ms, :popularity, :explicit)
                        ON CONFLICT (spotify_id) DO NOTHING
                    """),
                    {
                        "spotify_id": track["id"],
                        "name": track.get("name", "Unknown"),
                        "artist_id": artist_row[0] if artist_row else None,
                        "album_name": track.get("album", {}).get("name"),
                        "duration_ms": track.get("duration_ms", 0),
                        "popularity": track.get("popularity", 0),
                        "explicit": track.get("explicit", False),
                    },
                )
        db.commit()
        steps.append({"phase": "Transform", "detail": "Artistas y tracks del historial asegurados en dimensiones", "ok": True})

        history_data = transform_history(raw_history)
        steps.append({"phase": "Transform", "detail": "Timestamps normalizados, géneros procesados", "ok": True})

        history_metrics = load_history(history_data, spotify_id, db)
        metrics["history_new"] = history_metrics["history_new"]
        metrics["history_skipped"] = history_metrics["history_skipped"]
        steps.append({"phase": "Load", "detail": f"fact_listening_history — {history_metrics['history_new']} nuevos / {history_metrics['history_skipped']} ya existían", "ok": True})

        # ── 5. Cursor ─────────────────────────────────────────
        cursor_next_ms = None
        if history_data:
            max_played_at = max(item["played_at"] for item in history_data)
            cursor_next_ms = played_at_to_unix_ms(max_played_at)

        # ── 6. Audit ──────────────────────────────────────────
        db.commit()
        duration_ms = int((time.time() - t0) * 1000)
        update_audit_success(audit_id, duration_ms, cursor_after_ms, cursor_next_ms, metrics, db)
        steps.append({"phase": "Audit", "detail": f"Auditoría registrada — duración: {duration_ms / 1000:.2f} s", "ok": True})

        return {"audit_id": audit_id, "duration_ms": duration_ms, "status": "success", "steps": steps, "metrics": metrics}

    except Exception as e:
        db.rollback()
        duration_ms = int((time.time() - t0) * 1000)
        update_audit_error(audit_id, duration_ms, str(e), db)
        steps.append({"phase": "Error", "detail": str(e), "ok": False})
        return {"audit_id": audit_id, "duration_ms": duration_ms, "status": "error", "steps": steps, "metrics": metrics}