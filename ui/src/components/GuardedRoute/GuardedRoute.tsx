import React from 'react'
import { useAuthUser } from '~/src/contexts/AuthUser'
import { Navigate } from 'react-router-dom'

interface Props {
  type: 'guest' | 'auth'
}

const GuardedRoute: React.FC<Props> = ({ children, type }) => {
  const { user } = useAuthUser()

  if (type === 'auth' && !user) {
    return <Navigate to="/login" />
  }

  if (type === 'guest' && user) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

export { GuardedRoute }
