import React from 'react'

import { BoardWorkspaceContextProvider } from './contexts'
import { EditPopover } from './EditPopover'
import { BoardWorkspace } from './BoardWorkspace'
import { Navigation } from './Navigation'
import { Toolbar } from './Toolbar'

const BoardRoute = () => {
  return (
    <>
      <Navigation />

      <BoardWorkspaceContextProvider>
        <BoardWorkspace />
        <Toolbar />
        <EditPopover />
      </BoardWorkspaceContextProvider>
    </>
  )
}

export { BoardRoute }