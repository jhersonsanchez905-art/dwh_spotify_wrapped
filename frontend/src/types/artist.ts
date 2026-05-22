// frontend/src/types/artist.ts

export interface Artist {
  id: string
  spotify_id: string
  name: string
  genres: string[]
  popularity: number
  followers: number
  images?: { url: string; height: number; width: number }[]
  play_count?: number
  rank?: number
}

export interface TopArtistsResponse {
  artists: Artist[]
  total: number
  time_range?: 'short_term' | 'medium_term' | 'long_term'
}
