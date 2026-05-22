// frontend/src/hooks/useETL.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { useETLContext } from '@/context/ETLContext'

export function useETLStatus() {
  return useQuery({
    queryKey: ['etl', 'status'],
    queryFn: endpoints.etl.status,
    enabled: isAuthenticated(),
    refetchInterval: (query) => {
      // Poll every 3s while running, every 30s otherwise
      return query.state.data?.is_running ? 3000 : 30_000
    },
  })
}

export function useETLRun() {
  const queryClient = useQueryClient()
  const { startRun, finishRun, failRun } = useETLContext()

  return useMutation({
    mutationFn: endpoints.etl.run,
    onMutate: () => {
      startRun()
    },
    onSuccess: (result) => {
      finishRun(result)
      // Invalidate all data queries after successful sync
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
      queryClient.invalidateQueries({ queryKey: ['etl'] })
    },
    onError: (error: Error) => {
      failRun(error.message)
    },
  })
}
