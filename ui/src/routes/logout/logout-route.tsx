import React, { useEffect } from 'react'
import { useLogout } from '~/src/contexts/auth-user/use-logout'

const LogoutRoute = () => {
  const logout = useLogout()

  useEffect(() => {
    logout()
  }, [logout])

  return null
}

export { LogoutRoute }
