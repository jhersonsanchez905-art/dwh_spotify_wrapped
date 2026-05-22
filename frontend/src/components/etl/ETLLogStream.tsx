// frontend/src/components/etl/ETLLogStream.tsx

import type { ETLLogStep } from '@/types/etl'

interface ETLLogStreamProps {
  steps: ETLLogStep[]
  isRunning: boolean
}

const stepIcons: Record<ETLLogStep['status'], string> = {
  pending: '○',
  running: '◉',
  done:    '✓',
  error:   '✗',
}

const stepColors: Record<ETLLogStep['status'], string> = {
  pending: 'var(--color-text-tertiary)',
  running: 'var(--color-warning)',
  done:    'var(--color-success)',
  error:   'var(--color-danger)',
}

export default function ETLLogStream({ steps, isRunning }: ETLLogStreamProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isRunning ? 'var(--color-warning)' : 'var(--color-success)',
            animation: isRunning ? 'pulse 1.2s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {isRunning ? 'ETL en progreso' : 'Log de ejecución'}
        </span>
      </div>

      {/* Steps */}
      <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) 0',
              opacity: step.status === 'pending' ? 0.4 : 1,
              transition: 'opacity var(--duration-normal) var(--ease-out)',
            }}
          >
            {/* Icon */}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: stepColors[step.status],
                animation: step.status === 'running' ? 'pulse 1s ease-in-out infinite' : 'none',
                flexShrink: 0,
                width: 16,
                textAlign: 'center',
                marginTop: 2,
              }}
            >
              {stepIcons[step.status]}
            </span>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: step.status === 'done'
                    ? 'var(--color-text-secondary)'
                    : step.status === 'running'
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-tertiary)',
                }}
              >
                {step.step}
              </span>
              {step.message && (
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: step.status === 'error' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
                    marginTop: 2,
                  }}
                >
                  {step.message}
                </span>
              )}
            </div>

            {/* Timestamp */}
            {step.timestamp && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--color-text-tertiary)',
                  flexShrink: 0,
                }}
              >
                {new Date(step.timestamp).toLocaleTimeString('es-CO')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
