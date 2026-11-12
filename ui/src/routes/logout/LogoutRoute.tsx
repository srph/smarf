import React, { useEffect } from 'react'
import { useLogout } from '~/src/contexts/AuthUser'

const LogoutRoute = () => {
  const logout = useLogout()

  useEffect(() => {
    logout()
  }, [])

  return null
}

export { LogoutRoute }
