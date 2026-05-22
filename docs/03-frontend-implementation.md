# 03 — Frontend Implementation

## What was implemented

The frontend is a React + Vite (TypeScript) single-page application that
consumes the FastAPI backend. It covers five routes: `/login`, `/callback`,
`/dashboard`, `/profile`, and `/etl`.

### Pages

**`/login`**
Single "Connect with Spotify" button centered on a dark background. Clicking
it calls `GET /v1/auth/login` on the backend, which redirects the browser to
Spotify's PKCE authorization URL. No token is copied manually.

**`/callback`**
Receives the JWT from the backend via query param (`?token=...`), saves it
to `localStorage`, and immediately redirects to `/dashboard`. No UI — purely
logic.

**`/dashboard`**
Main analytics view. Widgets included:
- `StatsSummaryRow` — six stat cards: total plays, top artists count, top
  tracks count, avg popularity, avg duration, peak hour.
- `TopArtistsCard` — bar chart of most-played artists with real play counts.
- `TopTracksCard` — ranked list of most-played tracks with duration.
- `GenresCard` — treemap of dominant genres with explicit empty state.
- `HeatmapCard` — activity grid by hour × day of week.
- `PeakHourCard` — large display of the user's most active hour.
- `PopularityCard` — distribution chart of track popularity scores.

All data comes from the backend — no direct Spotify API calls from the
frontend.

**`/profile`**
Shows the authenticated user's Spotify profile: avatar, display name, email,
country, account type (Free/Premium badge), and follower count. Data sourced
from `GET /v1/profile/me`.

**`/etl`**
DWH status panel showing table row counts, last sync time, and status badge
per table. Includes a "Sync Now" button that calls `POST /v1/etl/run` and
displays a step-by-step text log. Recent executions history pulled from
`GET /v1/etl/status`.

---

### Authentication flow

1. User clicks "Connect with Spotify" → backend generates PKCE verifier +
   challenge, redirects to Spotify.
2. Spotify redirects back to `/callback?token=<jwt>`.
3. JWT is saved to `localStorage`. All subsequent API requests send it as
   `Authorization: Bearer <token>`.
4. Protected routes (`/dashboard`, `/profile`, `/etl`) check token validity
   via `ProtectedRoute` — redirect to `/login` if missing or expired.

---

### Data layer

All API calls are centralized in `src/lib/api.ts` using a typed `endpoints`
object. Server state is managed with **TanStack Query (React Query)**:
useTopArtists()        → GET /v1/artists/top
useTopTracks()         → GET /v1/tracks/top
useRecentlyPlayed()    → GET /v1/history/recently-played
usePeakHour()          → GET /v1/history/peak-hour
useGenres()            → GET /v1/history/genres
useProfile()           → GET /v1/profile/me
useETLStatus()         → GET /v1/etl/status

Each hook sets `staleTime` to avoid redundant refetches and only activates
when `isAuthenticated()` is true.

---

### Dashboard data consistency fixes (feature/backend-updates)

During development several visual bugs were identified and corrected:

| Component | Bug | Fix |
|-----------|-----|-----|
| `GenresCard` | Rendered a solid green block when genres were empty | Added explicit empty state; genres now sourced from `GET /v1/history/genres` |
| `PeakHourCard` | Calculated peak hour from the 50-item client-side history | Now consumes `GET /v1/history/peak-hour` (full DWH aggregation) |
| `HeatmapCard` | Rendered empty — `'Monday' % 7 = NaN` in JS | Backend normalizes `day_of_week` to integer before returning |
| `StatsSummaryRow` | Avg popularity always showed 0 | Backend ETL fixed to always update artist popularity on conflict |
| `TopArtistsCard` | Artists 1–3 showed as "Unknown" | Backend query filters `name != 'Unknown'` and filters by authenticated user |

---

### Design decisions

**`/login`** — Minimal by design. One action, no distractions. Dark
background with Spotify green accent mirrors the brand and sets the tone
for the rest of the app.

**`/dashboard`** — Card-based grid layout. Each widget is self-contained
with its own loading skeleton and empty state, so partial data never breaks
the full view. Stats summary at the top gives a quick numerical overview
before the user scrolls into charts.

**`/profile`** — Kept simple: avatar + key facts. The account type badge
(Free vs Premium) is visually distinct because it affects what data Spotify
provides.

**`/etl`** — The step-by-step log on sync was intentional: it gives the
user confidence that something is happening and shows exactly what the
pipeline is doing. Table row counts update after sync completes.

**Empty states** — Every widget that depends on ETL data shows a clear
message before the first sync instead of a blank area or broken chart.
This was a hard requirement per the project spec.

---

## Screenshots

> Add screenshots here after running the app:
> - `docs/assets/dashboard.png`
> - `docs/assets/profile.png`
> - `docs/assets/etl-page.png`
> - `docs/assets/login.png`
> - `docs/assets/genres-empty-state.png`

---

## AI prompt used
Design a personal Spotify analytics dashboard web app. 4 pages:

Login: single 'Connect with Spotify' button, centered, dark background.
Profile: circular avatar, display name, email, country, account type
badge (Free/Premium), followers count, external Spotify link.
Dashboard: top 5 artists (name + play count bar), top 5 tracks
(name + artist + duration), peak listening hour (large number),
dominant genres (treemap), listening heatmap by hour and day of week.
ETL Runner: DWH status table (table name, record count, last sync,
status badge), recent executions history, 'Sync Now' button with
step-by-step text log.
Dark theme, Spotify green accent #1DB954, card-based layout,
responsive for laptop.
## AI prompting technique applied

**Role Prompting + Few-shot** — The prompt establishes the context
("personal Spotify analytics dashboard") and provides concrete examples
of each page's content. This guided the AI tool to generate layouts
consistent with the data model without requiring multiple iterations.

For component-level generation (individual cards, hooks, utility functions),
**Chain-of-Thought prompting** was used: first describing the data shape
returned by the backend, then asking the AI to derive the correct
transformation and render logic from it.