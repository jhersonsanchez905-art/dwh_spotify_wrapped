// frontend/src/pages/Callback.tsx

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Callback() {
  const navigate = useNavigate()
  const { checkAuth } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      setToken(token)
      window.history.replaceState({}, '', '/callback')
      checkAuth()
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, checkAuth])

  return <LoadingSpinner fullScreen />
}
