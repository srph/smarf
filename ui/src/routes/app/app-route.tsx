import React, { useEffect } from 'react'

import { Navigation } from './navigation/navigation'
import { Outlet, useMatch } from 'react-router'

const AppRoute = () => {
  // Pages take the navigation's colour, so the bar runs into them; a board (and New Board's starts) keeps zinc-900
  // under its dot grid. Set on the body, so overscroll shows the same colour.
  const isBoard = useMatch('/b/*') != null

  useEffect(() => {
    document.body.classList.toggle('bg-nav', !isBoard)
    document.body.classList.toggle('focus-gap-nav', !isBoard)
  }, [isBoard])

  return (
    <>
      {/* Signed out too: only a public board opens signed out, and its navigation offers Sign in. */}
      <Navigation />

      <Outlet />
    </>
  )
}

export { AppRoute }
