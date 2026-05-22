// frontend/src/types/user.ts

export interface UserProfile {
  spotify_id: string
  display_name: string
  email: string
  country: string
  followers: number
  product: 'free' | 'premium'
  images?: { url: string; height: number; width: number }[]
  created_at?: string
  updated_at?: string
}
