# 🎵 Mi Spotify Wrapped — Personal Data Warehouse

**Universidad de Pamplona · Bases de Datos II · 2026-I**

Pipeline ETL completo que consume la Spotify Web API, construye un Data
Warehouse personal en PostgreSQL (Neon) y lo visualiza en un dashboard
web con React + FastAPI.

---

## 📸 Screenshots

> Reemplaza con tus capturas reales antes de entregar.

| Dashboard | Perfil | ETL |
|-----------|--------|-----|
| `docs/assets/dashboard.png` | `docs/assets/profile.png` | `docs/assets/etl.png` |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Technical Architecture                    │
├──────────────────┬──────────────────┬───────────────────────┤
│    Frontend      │     Backend      │    Spotify Web API    │
│  React + Vite    │  FastAPI Python  │                       │
│  /login          │  /v1/auth        │  GET /v1/me           │
│  /dashboard      │  /v1/artists/top │  GET /v1/me/top/…     │
│  /profile        │  /v1/tracks/top  │  GET /v1/me/player/…  │
│  /etl            │  /v1/history     │                       │
│                  │  /v1/etl/run     │  Last.fm API          │
│                  │  /v1/enrichment  │  artist.getinfo       │
└──────────────────┴──────────────────┴───────────────────────┘
                          │
                ┌─────────▼─────────┐
                │  PostgreSQL Neon  │
                │  dwh.dim_users    │
                │  dwh.dim_artists  │
                │  dwh.dim_tracks   │
                │  dwh.fact_listen… │
                │  dwh.etl_audit    │
                └───────────────────┘
```

---

## 🗃️ Modelo dimensional

**Star Schema** con elemento snowflake en `dim_tracks.artist_id → dim_artists`.

| Tabla | Tipo | Descripción |
|-------|------|-------------|
| `dim_users` | Dimensión | Perfil del usuario autenticado con Spotify |
| `dim_artists` | Dimensión | Artistas enriquecidos con Spotify + Last.fm |
| `dim_tracks` | Dimensión | Canciones con metadata de Spotify |
| `fact_listening_history` | Hecho | Una fila por reproducción (granularidad: canción × momento) |
| `etl_audit` | Auditoría | Registro de cada ejecución del pipeline |

---

## 🔐 Autenticación

Flujo **OAuth 2.0 Authorization Code + PKCE**:

```
Frontend → GET /v1/auth/login
        → Spotify authorization URL (con code_challenge)
        → Usuario aprueba
        → Spotify redirect → GET /v1/auth/callback?code=...
        → Backend intercambia code por tokens
        → Backend emite JWT propio (8h)
        → Frontend guarda JWT en localStorage
        → Todas las peticiones: Authorization: Bearer <jwt>
```

Scopes requeridos:
- `user-read-private`
- `user-read-email`
- `user-top-read`
- `user-read-recently-played`

---

## 🔄 Pipeline ETL

Orden de ejecución en cada sincronización:

```
1. Extract User        → dim_users
2. Extract Top Artists → dim_artists (enriquecido con Last.fm)
3. Extract Top Tracks  → dim_tracks
4. Extract Recently Played → fact_listening_history
5. Enrichment (Last.fm) → actualiza artistas con popularity=0 o genres=[]
6. Audit               → etl_audit
```

Características:
- **Incremental**: cursor basado en `played_at` para no recargar lo ya procesado
- **Idempotente**: `ON CONFLICT DO UPDATE / DO NOTHING` en todas las inserciones
- **Enriquecimiento**: artistas sin géneros o popularidad se complementan con Last.fm `artist.getinfo`

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Base de datos | PostgreSQL 17 en Neon (serverless) |
| Backend | Python 3.12 + FastAPI |
| ORM / Migraciones | SQLAlchemy 2.0 + Alembic |
| Frontend | React + Vite (TypeScript) |
| Estado servidor | TanStack Query (React Query) |
| Autenticación | Spotify OAuth PKCE + JWT |
| HTTP client | httpx (async) |
| Enriquecimiento | Last.fm API (`artist.getinfo`) |
| Documentación API | OpenAPI / Swagger (auto-generado) |

---

## 🚀 Instalación y ejecución local

### Prerrequisitos
- Python 3.12+
- Node.js 20+
- Cuenta en [Neon](https://neon.tech) con una DB creada
- App registrada en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- API key de [Last.fm](https://www.last.fm/api/account/create)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/dwh_spotify_wrapped.git
cd dwh_spotify_wrapped
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
# Spotify
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/v1/auth/callback

# PostgreSQL Neon
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# App
APP_NAME=Spotify Wrapped DWH API
APP_VERSION=1.0.0
SECRET_KEY=tu_secret_key_aleatorio

# Frontend
FRONTEND_URL=http://localhost:3000

# Last.fm
LASTFM_API_KEY=tu_api_key_de_lastfm
```

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Correr migraciones
alembic upgrade head

# Iniciar servidor
uvicorn backend.main:app --reload
# → http://localhost:8000
# → Swagger: http://localhost:8000/docs
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 5. Primer uso

1. Abre `http://localhost:3000/login`
2. Click en **Conectar con Spotify**
3. Autoriza los permisos
4. Serás redirigido al dashboard (vacío aún)
5. Ve a `/etl` y presiona **Sincronizar**
6. Espera el log completo — el dashboard se llenará con tus datos

---

## 📁 Estructura del repositorio

```
dwh_spotify_wrapped/
│
├── backend/
│   ├── main.py
│   └── app/
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── security.py
│       │   ├── spotify_client.py
│       │   └── lastfm_client.py        ← enriquecimiento
│       ├── v1/
│       │   ├── routers/
│       │   │   ├── auth.py
│       │   │   ├── artists.py
│       │   │   ├── tracks.py
│       │   │   ├── history.py
│       │   │   ├── etl.py
│       │   │   └── enrichment.py       ← nuevo
│       │   └── services/
│       │       ├── etl_service.py
│       │       ├── artists_service.py
│       │       ├── tracks_service.py
│       │       ├── history_service.py
│       │       └── enrichment_service.py ← nuevo
│       └── models/
│
├── frontend/
│   └── src/
│       ├── components/dashboard/
│       ├── hooks/
│       ├── lib/
│       └── types/
│
├── alembic/
├── notebooks/
│   └── eda_spotify_wrapped.ipynb
│
├── docs/
│   ├── assets/
│   ├── 00-initial-config.md
│   ├── 01-ddl-migrations.md
│   ├── 02-backend-implementation.md
│   ├── 03-frontend-implementation.md
│   ├── 04-etl-pipeline.md
│   └── 05-analytical-queries.md
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 📊 EDA — Hallazgos principales

Análisis completo en `notebooks/eda_spotify_wrapped.ipynb`.

**Hallazgo 1 — Hora pico inesperada:**
El pico de escucha ocurre a las **11:00 hs**, no de noche como se esperaba.
Esto revela un patrón de escucha matutino ligado a estudio/trabajo.

**Hallazgo 2 — Perfil de nicho:**
La mayoría de artistas en el historial tienen `popularity < 10` en Spotify,
pero millones de oyentes en Last.fm. Indica un gusto orientado a reggaeton
latinoamericano regional más que al pop mainstream global.

**Hallazgo 3 — Pregunta sin respuesta:**
El modelo actual no permite analizar evolución temporal del gusto musical
porque `recently-played` solo devuelve las últimas 50 reproducciones.
Se requeriría una tabla `dim_time` y un sistema de scrobbling continuo.

---

## 📝 Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/00-initial-config.md` | Configuración Neon, Spotify Dashboard, `.env` |
| `docs/01-ddl-migrations.md` | Scripts DDL y migraciones Alembic |
| `docs/02-backend-implementation.md` | Desarrollo FastAPI, ETL, endpoints |
| `docs/03-frontend-implementation.md` | React, diseño con IA, componentes |
| `docs/04-etl-pipeline.md` | Pipeline ETL, enriquecimiento Last.fm |
| `docs/05-analytical-queries.md` | 5 queries analíticas con resultados reales |

---

## ⚠️ Notas importantes

- El archivo `.env` **nunca** se versiona (está en `.gitignore`)
- El notebook EDA usa datos reales de la cuenta de Spotify del autor
- Las credenciales de Spotify expiran — si el login falla, re-autoriza en `/login`

---

## 👤 Autores

- **Sebastián [Apellido]** — Frontend, diseño, EDA
- **[Nombre Integrante A]** — Backend, ETL, base de datos
