// frontend/src/components/ui/AnimatedNumber.tsx

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export default function AnimatedNumber({
  value,
  duration = 900,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>()
  const prevValue = useRef(0)

  useEffect(() => {
    const from = prevValue.current
    prevValue.current = value

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      setDisplay(from + (value - from) * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
        startRef.current = null
      }
    }

    cancelAnimationFrame(rafRef.current!)
    startRef.current = null
    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current!)
  }, [value, duration])

  return (
    <span className={`stat-number ${className ?? ''}`}>
      {format(display)}
    </span>
  )
}
