import React from 'react'

import { Navigation } from './navigation/navigation'
import { Outlet } from 'react-router'

const AppRoute = () => {
  return (
    <>
      {/* Signed out too: only a public board opens signed out, and its navigation offers Sign in. */}
      <Navigation />

      <Outlet />
    </>
  )
}

export { AppRoute }
