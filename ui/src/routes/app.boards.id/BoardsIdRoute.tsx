import React from 'react'

import { BoardWorkspaceContextProvider } from './contexts'
import { BoardWorkspace } from './BoardWorkspace'
import { Toolbar } from './Toolbar'

const BoardsIdRoute = () => {
  return (
    <>
      <BoardWorkspaceContextProvider>
        <BoardWorkspace />
        <Toolbar />
      </BoardWorkspaceContextProvider>
    </>
  )
}

export { BoardsIdRoute }
