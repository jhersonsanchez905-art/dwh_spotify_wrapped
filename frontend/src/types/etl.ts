// frontend/src/types/etl.ts

export type ETLStatus = 'idle' | 'running' | 'success' | 'error'

export interface ETLRunResult {
  audit_id: string
  status: ETLStatus
  started_at: string
  finished_at: string
  duration_ms: number
  users_inserted: number
  artists_inserted: number
  tracks_inserted: number
  history_inserted: number
  history_skipped: number
  cursor_next_ms: number
  error_message?: string
}

export interface ETLStatusResponse {
  last_run?: ETLRunResult
  total_runs: number
  last_successful_at?: string
  is_running: boolean
}

export interface ETLLogStep {
  step: string
  status: 'pending' | 'running' | 'done' | 'error'
  message?: string
  timestamp?: string
}

export interface DwhStats {
  users_count: number
  artists_count: number
  tracks_count: number
  history_count: number
  last_sync_at?: string
}
