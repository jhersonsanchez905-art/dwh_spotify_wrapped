// frontend/src/context/ETLContext.tsx

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ETLLogStep, ETLRunResult } from '@/types/etl'

interface ETLContextValue {
  isRunning: boolean
  logSteps: ETLLogStep[]
  lastResult: ETLRunResult | null
  startRun: () => void
  finishRun: (result: ETLRunResult) => void
  failRun: (error: string) => void
  addStep: (step: ETLLogStep) => void
  updateStep: (step: string, update: Partial<ETLLogStep>) => void
  clearLog: () => void
}

const ETLContext = createContext<ETLContextValue | null>(null)

const INITIAL_STEPS: ETLLogStep[] = [
  { step: 'Verificando token de Spotify', status: 'pending' },
  { step: 'Extrayendo datos del usuario',  status: 'pending' },
  { step: 'Extrayendo top artistas',       status: 'pending' },
  { step: 'Extrayendo top tracks',         status: 'pending' },
  { step: 'Extrayendo historial reciente', status: 'pending' },
  { step: 'Transformando registros',       status: 'pending' },
  { step: 'Cargando al DWH',              status: 'pending' },
  { step: 'Registrando auditoría',         status: 'pending' },
]

export function ETLProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false)
  const [logSteps, setLogSteps] = useState<ETLLogStep[]>([])
  const [lastResult, setLastResult] = useState<ETLRunResult | null>(null)

  const startRun = useCallback(() => {
    setIsRunning(true)
    setLogSteps(INITIAL_STEPS.map((s) => ({ ...s })))
  }, [])

  const finishRun = useCallback((result: ETLRunResult) => {
    setIsRunning(false)
    setLastResult(result)
    setLogSteps((prev) =>
      prev.map((s) => (s.status === 'running' ? { ...s, status: 'done' } : s))
    )
  }, [])

  const failRun = useCallback((error: string) => {
    setIsRunning(false)
    setLogSteps((prev) =>
      prev.map((s) =>
        s.status === 'running' ? { ...s, status: 'error', message: error } : s
      )
    )
  }, [])

  const addStep = useCallback((step: ETLLogStep) => {
    setLogSteps((prev) => [...prev, step])
  }, [])

  const updateStep = useCallback((stepName: string, update: Partial<ETLLogStep>) => {
    setLogSteps((prev) =>
      prev.map((s) => (s.step === stepName ? { ...s, ...update } : s))
    )
  }, [])

  const clearLog = useCallback(() => {
    setLogSteps([])
  }, [])

  return (
    <ETLContext.Provider
      value={{ isRunning, logSteps, lastResult, startRun, finishRun, failRun, addStep, updateStep, clearLog }}
    >
      {children}
    </ETLContext.Provider>
  )
}

export function useETLContext(): ETLContextValue {
  const ctx = useContext(ETLContext)
  if (!ctx) throw new Error('useETLContext must be used within ETLProvider')
  return ctx
}
