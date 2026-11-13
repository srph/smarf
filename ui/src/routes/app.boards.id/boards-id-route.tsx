import React from 'react'
import { useParams } from 'react-router'
import { BoardProvider } from './board-context'
import { BoardWorkspace } from './board-workspace/board-workspace'
import { BoardToolbar } from './board-toolbar'

const BoardsIdRoute = () => {
  // The route is /b/:boardId, so it's always set.
  const boardId = useParams().boardId!

  return (
    // Keyed so switching boards starts with a fresh draft and drag state.
    <BoardProvider key={boardId} boardId={boardId}>
      <BoardWorkspace />
      <BoardToolbar />
    </BoardProvider>
  )
}

export { BoardsIdRoute }
