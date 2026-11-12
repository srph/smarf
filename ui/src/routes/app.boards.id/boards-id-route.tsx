import React from 'react'

import { BoardWorkspaceContextProvider } from './contexts/board-workspace-context'
import { BoardWorkspace } from './board-workspace/board-workspace'
import { Toolbar } from './toolbar/toolbar'

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
