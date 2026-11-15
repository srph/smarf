import React from 'react'
import { useParams } from 'react-router'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { BoardProvider, useBoard } from './board-context'
import { BoardWorkspace } from './board-workspace/board-workspace'
import { BoardToolbar } from './board-toolbar'
import { BoardVisitorView } from './board-visitor-view'

const BoardsIdRoute = () => {
  // The route is /b/:boardId, so it's always set.
  const boardId = useParams().boardId!

  return (
    // Keyed so switching boards starts with a fresh draft and drag state.
    <BoardProvider key={boardId} boardId={boardId}>
      <BoardView />
    </BoardProvider>
  )
}

/** The owner edits the board; anyone else (a public board's visitor, signed in or not) only views it. */
const BoardView = () => {
  const { user } = useAuthUser()

  const { board } = useBoard()

  if (board.user_id !== user?.id) {
    return <BoardVisitorView />
  }

  return (
    <>
      <BoardWorkspace />
      <BoardToolbar />
    </>
  )
}

export { BoardsIdRoute }
