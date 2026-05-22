# Initial Configuration

## What was configured

This phase covers the complete initial setup of the Spotify Wrapped DWH project before writing any code.

### 1. Neon PostgreSQL

Created a free serverless PostgreSQL 17 instance on [Neon](https://neon.tech):

- Project name: `spotify-dwh`
- Region: AWS US East 1
- Database: `neondb`
- Connection string copied to `.env` as `DATABASE_URL` with `?sslmode=require`

![Neon project dashboard](img/initial_config/1.png)
![Neon connection string](img/initial_config/2.png)

### 2. Spotify Developer App

Registered a new application on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

- App name: `MySpotifyWrapped`
- Description: `DWH Personal with music information`
- Redirect URI: `http://127.0.0.1:8000/v1/auth/callback`
- APIs used: Web API
- Scopes enabled: `user-read-private`, `user-read-email`, `user-top-read`, `user-read-recently-played`
- Copied `Client ID` and `Client Secret` to `.env`

![Spotify Developer Dashboard](img/initial_config/3.png)
![Spotify app configuration](img/initial_config/4.png)

### 3. Python Virtual Environment

```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Key dependencies installed: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `psycopg2-binary`, `alembic`, `httpx`, `python-jose[cryptography]`, `pydantic-settings`, `python-dotenv`

> **Note:** `httpx` is used instead of `requests` — required by the project stack for async compatibility with FastAPI.

### 4. Environment Variables

Created `.env` at the project root (excluded from git via `.gitignore`):

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/v1/auth/callback
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require
APP_NAME=Spotify DWH API
APP_VERSION=1.0.0
SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:3000
```

`.env.example` was created as a safe template and committed to the repo.

### 5. Project Structure

Initialized the directory structure following the professor's conventions:

```
project/
├── backend/
│   ├── main.py
│   └── app/
│       ├── core/          ← config.py, database.py, spotify_client.py
│       └── v1/            ← routers/, schemas/, services/
├── alembic/
├── docs/
├── notebooks/
├── .env.example
├── .gitignore
└── requirements.txt
```

### 6. Health Check

Verified the server starts correctly:

```bash
uvicorn backend.main:app --reload
# → GET / returns {"status": "ok"}
```

![Health check response](img/initial_config/5.png)

## Prompt used

```
You are a senior backend engineer. Analyze the exam requirements and workshop_definitions.md.
Create the initial project configuration for a Spotify Wrapped DWH backend using FastAPI:
- config.py using pydantic-settings to load all environment variables from .env
- database.py with SQLAlchemy engine, SessionLocal, Base declarative, and get_db() dependency
- main.py with FastAPI app, CORS middleware allowing FRONTEND_URL, and health check GET /
- .env.example as a safe template (never the real .env)
- .gitignore excluding .venv, .env, __pycache__, .pytest_cache, *.pyc
- requirements.txt using httpx (not requests) as the HTTP client
Follow all naming conventions from workshop_definitions.md. All imports must use
the backend.app prefix since uvicorn runs from the project root.
```

## Prompting technique applied

**Role Prompting** — The AI was given the role of a senior backend engineer reviewing the professor's exact requirements. This ensured all conventions (file structure, naming, dependency choices like `httpx` over `requests`) matched the workshop definitions precisely rather than following generic FastAPI boilerplate.