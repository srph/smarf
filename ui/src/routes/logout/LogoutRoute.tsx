import React, { useEffect } from 'react'
import { useAuthUser } from '~/src/contexts/AuthUser'

const LogoutRoute = () => {
  const { logout } = useAuthUser()

  useEffect(() => {
    logout()
  }, [])

  return null
}

export { LogoutRoute }
