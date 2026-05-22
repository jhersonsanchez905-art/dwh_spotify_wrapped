// frontend/src/hooks/index.ts

export { useAuth } from '@/context/AuthContext'
export { useETLContext } from '@/context/ETLContext'

// Re-export TanStack Query hooks for convenience
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
