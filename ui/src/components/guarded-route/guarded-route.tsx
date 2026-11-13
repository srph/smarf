import React from 'react'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { Navigate, useLocation, type Location } from 'react-router'

interface Props {
  type: 'guest' | 'auth'
}

const GuardedRoute: React.FC<React.PropsWithChildren<Props>> = ({ children, type }) => {
  const { user } = useAuthUser()
  const location = useLocation()

  if (type === 'auth' && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Includes just after login: back to the page that sent the visitor to log in.
  if (type === 'guest' && user) {
    return <Navigate to={getReturnPath(location) || '/'} replace />
  }

  return <>{children}</>
}

/** The page an auth route bounced a logged-out visitor from (it's in location.state). */
const getReturnPath = (location: Location) =>
  (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

export { GuardedRoute, getReturnPath }
