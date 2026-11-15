import React from 'react'

import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { Navigation } from './navigation/navigation'
import { Outlet } from 'react-router'

const AppRoute = () => {
  const { user } = useAuthUser()

  return (
    <>
      {/* Only a public board opens signed out; its banner stands in for the navigation. */}
      {user && <Navigation />}

      <Outlet />
    </>
  )
}

export { AppRoute }
