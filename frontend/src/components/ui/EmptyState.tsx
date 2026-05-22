// frontend/src/components/ui/EmptyState.tsx

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <span style={{ fontSize: '48px', lineHeight: 1 }}>{icon}</span>

      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '360px',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            transition: 'background var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = 'var(--color-accent-hover)')
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = 'var(--color-accent)')
          }
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
