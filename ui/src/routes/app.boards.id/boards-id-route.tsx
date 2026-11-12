import React from 'react'
import { useParams } from 'react-router'
import { Container } from '~/src/components/container/container'
import { ErrorState } from '~/src/components/error-state/error-state'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { useBoardQuery } from './queries/use-board-query'
import { BoardDraftProvider } from './board-draft-context'
import { BoardWorkspace } from './board-workspace/board-workspace'
import { Toolbar } from './toolbar/toolbar'

const BoardsIdRoute = () => {
  // The route is /b/:boardId, so it's always set.
  const boardId = useParams().boardId!

  const {
    data: board,
    status: boardStatus,
    refetch: refetchBoard,
    isFetching: isBoardFetching
  } = useBoardQuery(boardId)

  if (boardStatus === 'pending') {
    return <PageSpinner />
  }

  if (boardStatus === 'error') {
    return (
      <Container>
        <ErrorState
          className="py-12"
          message="Couldn't load this board. Check your connection and try again."
          onRetry={() => refetchBoard()}
          isRetrying={isBoardFetching}
        />
      </Container>
    )
  }

  return (
    // Keyed so switching boards starts with a fresh draft and drag state.
    <BoardDraftProvider key={boardId} board={board}>
      <BoardWorkspace />
      <Toolbar />
    </BoardDraftProvider>
  )
}

export { BoardsIdRoute }
