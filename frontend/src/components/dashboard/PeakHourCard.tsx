// frontend/src/components/dashboard/PeakHourCard.tsx

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useRecentlyPlayed } from '@/hooks/useHistory'
import { toHourlyData } from '@/lib/chartUtils'

function hourLabel(h: number) {
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

function PeakTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 'var(--text-xs)',
    }}>
      <div style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
        {label !== undefined ? `${label}:00 – ${label}:59` : ''}
      </div>
      <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
        {payload[0].value} reproducciones
      </div>
    </div>
  )
}

export default function PeakHourCard() {
  const { data, isLoading } = useRecentlyPlayed()

  if (isLoading) return <SkeletonCard />

  const hourly = toHourlyData(data?.items ?? [])
  const maxHour = hourly.reduce((m, h) => h.count > m.count ? h : m, hourly[0])
  const avg = Math.round(hourly.reduce((s, h) => s + h.count, 0) / 24)

  return (
    <Card style={{ gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Hora pico
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {maxHour ? `${maxHour.hour}:00` : '—'}
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontWeight: 400, marginLeft: 8 }}>
              hora más activa
            </span>
          </div>
        </div>
        {maxHour && (
          <div style={{
            background: 'var(--color-accent-alpha)',
            border: '1px solid var(--color-accent-dim)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>
              {maxHour.count}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>reproducciones</div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={hourly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tickFormatter={hourLabel}
            tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis hide />
          <Tooltip content={<PeakTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={avg} stroke="var(--color-border-default)" strokeDasharray="3 3" />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={18}>
            {hourly.map((h) => (
              <Cell
                key={h.hour}
                fill={h.hour === maxHour?.hour ? 'var(--color-accent)' : 'var(--color-border-strong)'}
                opacity={h.hour === maxHour?.hour ? 1 : 0.5 + (h.count / (maxHour?.count || 1)) * 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
