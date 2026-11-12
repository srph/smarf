import React from 'react'

import { Navigation } from './navigation/navigation'
import { Outlet } from 'react-router'

const AppRoute = () => {
  return (
    <>
      <Navigation />

      <Outlet />
    </>
  )
}

export { AppRoute }
