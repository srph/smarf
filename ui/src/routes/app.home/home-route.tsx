import React from 'react'
import { useBoardsQuery } from '~/src/queries/boards/use-boards-query'
import { Board } from '~/src/types/api'
import { BoardList } from './board-list'
import { PageTitle } from '~/src/components/page-title/page-title'
import { Spacer } from '~/src/components/spacer/spacer'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { ErrorState } from '~/src/components/error-state/error-state'

const partitionByFavorite = (boards: Board[]) => ({
  favorites: boards.filter((board) => board.is_favorite),
  recent: boards.filter((board) => !board.is_favorite)
})

const HomeRoute = () => {
  const {
    data: boards,
    status: boardsStatus,
    refetch: refetchBoards,
    isFetching: isBoardsFetching
  } = useBoardsQuery(partitionByFavorite)

  if (boardsStatus === 'pending') {
    return (
      <>
        <PageTitle title="Your Boards" />
        <PageSpinner />
      </>
    )
  }

  if (boardsStatus === 'error') {
    return (
      <>
        <PageTitle title="Your Boards" />
        <ErrorState
          className="py-12"
          message="Couldn't load your boards. Check your connection and try again."
          onRetry={() => refetchBoards()}
          isRetrying={isBoardsFetching}
        />
      </>
    )
  }

  return (
    <>
      <PageTitle title="Your Boards" />

      {boards.favorites.length ? <BoardList title="Favorite Boards" boards={boards.favorites} /> : null}

      {boards.recent.length ? (
        <>
          <Spacer size={4} />
          <BoardList title="Recent Boards" boards={boards.recent} />
        </>
      ) : null}
    </>
  )
}

export { HomeRoute }
