// frontend/src/components/etl/RunHistory.tsx

import Badge from '@/components/ui/Badge'
import type { ETLRunResult } from '@/types/etl'

interface RunHistoryProps {
  lastRun?: ETLRunResult
  totalRuns: number
}

export default function RunHistory({ lastRun, totalRuns }: RunHistoryProps) {
  if (totalRuns === 0 || !lastRun) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        No hay ejecuciones registradas. Corre el ETL por primera vez.
      </div>
    )
  }

  return (
    <div>
      {/* Last run row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: 'var(--space-4)',
          alignItems: 'center',
          padding: 'var(--space-3) 0',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Date */}
        <div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {new Date(lastRun.started_at).toLocaleString('es-CO', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {lastRun.history_inserted} nuevos · {lastRun.history_skipped} saltados
          </div>
        </div>

        {/* Duration */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {(lastRun.duration_ms / 1000).toFixed(2)}s
        </div>

        {/* Status */}
        <Badge
          variant={
            lastRun.status === 'success' ? 'success'
            : lastRun.status === 'error'   ? 'danger'
            : lastRun.status === 'running' ? 'warning'
            : 'default'
          }
        >
          {lastRun.status === 'success' ? '✓ Exitoso'
           : lastRun.status === 'error'  ? '✗ Error'
           : lastRun.status === 'running'? '⟳ Corriendo'
           : lastRun.status}
        </Badge>

        {/* Cursor */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
          }}
        >
          cursor: {lastRun.cursor_next_ms ?? '—'}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        Mostrando última ejecución de {totalRuns} totales
      </div>
    </div>
  )
}
