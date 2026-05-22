// frontend/src/components/etl/DwhStatusTable.tsx

import type { ETLStatusResponse } from '@/types/etl'
import { SkeletonCard } from '@/components/ui/Skeleton'

interface DwhStatusTableProps {
  status?: ETLStatusResponse
  isLoading: boolean
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: accent ? '1px solid var(--color-accent-dim)' : '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 'var(--space-2)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)',
          letterSpacing: '-0.03em',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function DwhStatusTable({ status, isLoading }: DwhStatusTableProps) {
  if (isLoading) return <SkeletonCard />

  const lastRun = status?.last_run
  const lastSyncText = status?.last_successful_at
    ? new Date(status.last_successful_at).toLocaleString('es-CO', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Nunca'

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 'var(--space-4)',
        }}
      >
        Estado del DWH
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <StatCard label="Ejecuciones" value={status?.total_runs ?? 0} accent />
        <StatCard label="Última sync" value={lastSyncText} />
        {lastRun && (
          <>
            <StatCard
              label="Registros hist."
              value={lastRun.history_inserted}
              sub={`${lastRun.history_skipped} ya existían`}
            />
            <StatCard label="Artistas" value={lastRun.artists_inserted} />
            <StatCard label="Tracks" value={lastRun.tracks_inserted} />
            <StatCard
              label="Duración"
              value={`${(lastRun.duration_ms / 1000).toFixed(1)}s`}
            />
          </>
        )}
      </div>
    </div>
  )
}
