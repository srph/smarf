import React from 'react'

import { Navigation } from './Navigation'
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
