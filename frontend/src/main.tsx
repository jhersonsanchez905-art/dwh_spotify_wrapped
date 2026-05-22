// frontend/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { ETLProvider } from '@/context/ETLContext'
import App from './App'
import '@/styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
      // Global stale time — individual hooks can override
      staleTime: 5 * 60 * 1000,
      // Keep data in cache 10 min after component unmounts
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ETLProvider>
          <App />
        </ETLProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
