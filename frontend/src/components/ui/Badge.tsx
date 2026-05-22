// frontend/src/components/ui/Badge.tsx

import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  danger:  { bg: 'var(--color-danger-bg)',  color: 'var(--color-danger)' },
  info:    { bg: 'var(--color-info-bg)',    color: 'var(--color-info)' },
  accent:  { bg: 'var(--color-accent-alpha)', color: 'var(--color-accent)' },
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const { bg, color } = variantStyles[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        background: bg,
        color,
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
