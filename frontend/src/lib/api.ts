// frontend/src/lib/api.ts

import { getToken, logout } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    logout()
    throw new ApiError(401, 'Sesión expirada. Por favor, vuelve a iniciar sesión.')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      (errorData as { detail?: string }).detail ?? `Error ${response.status}`,
      errorData
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// ── HTTP verbs ──

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

// ── Typed endpoint helpers ──

import type { UserProfile } from '@/types/user'
import type { TopArtistsResponse } from '@/types/artist'
import type { TopTracksResponse } from '@/types/track'
import type { RecentlyPlayedResponse } from '@/types/history'
import type { ETLRunResult, ETLStatusResponse } from '@/types/etl'

export const endpoints = {
  profile: {
    me: () => api.get<UserProfile>('/v1/profile/me'),
  },
  artists: {
    top: () => api.get<TopArtistsResponse>('/v1/artists/top'),
  },
  tracks: {
    top: () => api.get<TopTracksResponse>('/v1/tracks/top'),
  },
  history: {
    recentlyPlayed: () => api.get<RecentlyPlayedResponse>('/v1/history/recently-played'),
  },
  etl: {
    run: () => api.post<ETLRunResult>('/v1/etl/run'),
    status: () => api.get<ETLStatusResponse>('/v1/etl/status'),
  },
}
