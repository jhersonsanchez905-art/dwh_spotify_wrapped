// frontend/src/components/etl/SyncButton.tsx

import { useETLRun } from '@/hooks/useETL'

interface SyncButtonProps {
  isRunning: boolean
}

export default function SyncButton({ isRunning }: SyncButtonProps) {
  const { mutate: runETL, isPending } = useETLRun()
  const disabled = isRunning || isPending

  return (
    <button
      onClick={() => runETL()}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 'var(--space-3) var(--space-6)',
        background: disabled ? 'var(--color-bg-elevated)' : 'var(--color-accent)',
        color: disabled ? 'var(--color-text-tertiary)' : '#000',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--text-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--duration-normal) var(--ease-out)',
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--color-accent-hover)'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--color-accent)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {disabled ? (
        <>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Sincronizando...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Sincronizar datos
        </>
      )}
    </button>
  )
}
