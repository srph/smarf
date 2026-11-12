import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { clearToken } from '~/src/lib/token'

/** Forget the token and everything cached for this user, then go to the login page. */
function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(() => {
    clearToken()
    queryClient.removeQueries()
    navigate('/login')
  }, [queryClient, navigate])
}

export { useLogout }
