// frontend/src/components/ui/PageTransition.tsx

import { useEffect, useRef, type ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reset then trigger so re-navigating to same route also animates
    el.style.animation = 'none'
    void el.offsetHeight // reflow
    el.style.animation = ''
  }, [])

  return (
    <div
      ref={ref}
      className={`anim-page-enter ${className}`}
      style={{ flex: 1 }}
    >
      {children}
    </div>
  )
}
