// frontend/src/components/ui/LoadingSpinner.tsx

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  label?: string
}

const sizeMap = { sm: 16, md: 28, lg: 48 }

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  label,
}: LoadingSpinnerProps) {
  const px = sizeMap[size]
  const stroke = px > 30 ? 2.5 : 2

  const spinner = (
    <div
      role="status"
      aria-label={label ?? 'Cargando'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <svg
        width={px} height={px}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" stroke="var(--color-border-default)" strokeWidth={stroke} />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>
          {label}
        </span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-base)',
        animation: 'fadeIn 0.3s var(--ease-out) both',
      }}>
        {spinner}
      </div>
    )
  }

  return spinner
}
