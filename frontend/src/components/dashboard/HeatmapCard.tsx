// frontend/src/components/dashboard/HeatmapCard.tsx

import { memo, useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useRecentlyPlayed } from '@/hooks/useHistory'
import { DAY_NAMES } from '@/types/history'
import { useHeatmapData } from '@/lib/chartUtils'

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

function valueToColor(value: number, max: number): string {
  if (value === 0) return 'rgba(255,255,255,0.04)'
  const t = value / max
  return `rgb(${lerp(10,29,t)},${lerp(50,185,t)},${lerp(20,84,t)})`
}

// Memoized single cell to avoid re-rendering all 168 cells on tooltip state change
const HeatCell = memo(function HeatCell({
  fill, onEnter, onLeave,
  x, y, w, h,
}: {
  fill: string
  onEnter: () => void
  onLeave: () => void
  x: number; y: number; w: number; h: number
}) {
  return (
    <rect
      x={x + 1} y={y + 1}
      width={w - 2} height={h - 2}
      rx={3}
      fill={fill}
      style={{ cursor: 'crosshair', transition: 'fill 0.2s' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    />
  )
})

const HeatmapCard = memo(function HeatmapCard() {
  const { data, isLoading } = useRecentlyPlayed()
  const [tooltip, setTooltip] = useState<{ day: string; hour: number; value: number; x: number; y: number } | null>(null)

  const cells  = useHeatmapData(data?.items ?? [])
  const maxVal = useMemo(() => Math.max(...cells.map((c) => c.value), 1), [cells])

  if (isLoading) return <SkeletonCard />

  const CELL_W = 28, CELL_H = 24, LABEL_W = 36, LABEL_H = 20
  const HOURS  = Array.from({ length: 24 }, (_, i) => i)
  const gridW  = HOURS.length * CELL_W + LABEL_W
  const gridH  = DAY_NAMES.length * CELL_H + LABEL_H

  return (
    <Card style={{ gridColumn: '1 / -1', position: 'relative' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Heatmap de escucha
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.03em' }}>
          Actividad por hora × día de la semana
        </div>
      </div>

      <div className="heatmap-scroll">
        <svg width={gridW} height={gridH + 8} style={{ display: 'block', minWidth: gridW }}>
          {/* Hour labels */}
          {HOURS.map((h) =>
            h % 3 === 0 ? (
              <text key={`hl-${h}`}
                x={LABEL_W + h * CELL_W + CELL_W / 2} y={LABEL_H - 4}
                textAnchor="middle"
                style={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              >
                {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
              </text>
            ) : null
          )}

          {/* Day rows */}
          {DAY_NAMES.map((day, di) => (
            <g key={day}>
              <text
                x={LABEL_W - 6} y={LABEL_H + di * CELL_H + CELL_H / 2 + 4}
                textAnchor="end"
                style={{ fill: 'var(--color-text-tertiary)', fontSize: 10, fontFamily: 'var(--font-body)' }}
              >
                {day}
              </text>
              {HOURS.map((h) => {
                const val   = cells.find((c) => c.day === day && c.hour === String(h))?.value ?? 0
                const fillC = valueToColor(val, maxVal)
                const cx    = LABEL_W + h * CELL_W
                const cy    = LABEL_H + di * CELL_H
                return (
                  <HeatCell
                    key={`${day}-${h}`}
                    fill={fillC}
                    x={cx} y={cy} w={CELL_W} h={CELL_H}
                    onEnter={() => {
                      const svgEl = document.querySelector('.heatmap-scroll svg')
                      if (!svgEl) return
                      const rect = svgEl.getBoundingClientRect()
                      setTooltip({ day, hour: h, value: val, x: rect.left + cx + CELL_W, y: rect.top + cy })
                    }}
                    onLeave={() => setTooltip(null)}
                  />
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 8,
          top: tooltip.y - 4,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 10px',
          fontSize: 'var(--text-xs)',
          pointerEvents: 'none',
          zIndex: 200,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.1s var(--ease-out) both',
        }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{tooltip.day} · {tooltip.hour}:00</span>
          <br />
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {tooltip.value} reproduccion{tooltip.value !== 1 ? 'es' : ''}
          </span>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'var(--space-4)' }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Menos</span>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <div key={t} style={{
            width: 16, height: 16, borderRadius: 3,
            background: t === 0 ? 'rgba(255,255,255,0.04)' : `rgb(${lerp(10,29,t)},${lerp(50,185,t)},${lerp(20,84,t)})`,
            border: '1px solid rgba(255,255,255,0.05)',
          }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Más</span>
      </div>
    </Card>
  )
})

export default HeatmapCard
