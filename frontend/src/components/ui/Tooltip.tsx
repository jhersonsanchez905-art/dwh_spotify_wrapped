// frontend/src/components/ui/Tooltip.tsx

import { useState, useRef, useCallback, type ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({ content, children, placement = 'top', delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const triggerRef = useRef<HTMLDivElement>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = placement === 'bottom' ? rect.bottom + 8 : rect.top - 8
      setPos({ x, y })
      setVisible(true)
    }, delay)
  }, [delay, placement])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: 'contents' }}
      >
        {children}
      </div>

      {visible && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            transform: placement === 'bottom'
              ? 'translateX(-50%)'
              : 'translateX(-50%) translateY(-100%)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
            fontSize: 12,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'fadeIn 0.12s var(--ease-out) both',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {content}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(placement === 'bottom'
              ? { top: -4, borderBottom: '4px solid var(--color-border-default)', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }
              : { bottom: -4, borderTop: '4px solid var(--color-border-default)', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }
            ),
            width: 0, height: 0,
          }} />
        </div>
      )}
    </>
  )
}
