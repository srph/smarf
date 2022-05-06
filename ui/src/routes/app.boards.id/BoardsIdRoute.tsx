import React from 'react'

import { BoardWorkspaceContextProvider } from './contexts'
import { EditPopover } from './EditPopover'
import { BoardWorkspace } from './BoardWorkspace'
import { Toolbar } from './Toolbar'

const BoardsIdRoute = () => {
  return (
    <>
      <BoardWorkspaceContextProvider>
        <BoardWorkspace />
        <Toolbar />
        <EditPopover />
      </BoardWorkspaceContextProvider>
    </>
  )
}

export { BoardsIdRoute }
