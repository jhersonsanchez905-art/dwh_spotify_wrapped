// frontend/src/components/ui/StatusBadge.tsx

type Status = 'online' | 'offline' | 'running' | 'error' | 'idle'

const config: Record<Status, { label: string; color: string; bg: string }> = {
  online:  { label: 'Conectado',    color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  offline: { label: 'Desconectado', color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' },
  running: { label: 'Corriendo',    color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  error:   { label: 'Error',        color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)' },
  idle:    { label: 'Inactivo',     color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-elevated)' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, color, bg } = config[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        background: bg,
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          animation: status === 'running' ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </span>
  )
}
