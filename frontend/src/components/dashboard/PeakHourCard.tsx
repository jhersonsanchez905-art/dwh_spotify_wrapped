// frontend/src/components/dashboard/PeakHourCard.tsx
// v2.0 — consume /v1/history/peak-hour en lugar de calcular en cliente

import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { usePeakHour } from '@/hooks/useHistory'

export default function PeakHourCard() {
  const { data, isLoading } = usePeakHour()

  if (isLoading) return <SkeletonCard />

  const hour      = data?.hour_of_day
  const playCount = data?.play_count ?? 0
  const hasData   = hour !== null && hour !== undefined

  return (
    <Card>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}>
          Hora pico
        </div>

        {hasData ? (
          <>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--color-accent)',
            }}>
              {String(hour).padStart(2, '0')}:00
            </div>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
            }}>
              {playCount} reproducciones — tu hora más activa
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
            Sin datos aún
          </div>
        )}
      </div>
    </Card>
  )
}