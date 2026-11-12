import React from 'react'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { Navigate, useLocation } from 'react-router'

interface Props {
  type: 'guest' | 'auth'
}

const GuardedRoute: React.FC<React.PropsWithChildren<Props>> = ({ children, type }) => {
  const { user } = useAuthUser()
  const location = useLocation()

  if (type === 'auth' && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (type === 'guest' && user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export { GuardedRoute }
