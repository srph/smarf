import React from 'react'
import { useBoardsQuery } from '~/src/queries/boards/use-boards-query'
import { Board } from '~/src/types/api'
import { BoardList } from './board-list'
import { BoardListSkeleton } from './board-list-skeleton'
import { HomeEmptyState } from './home-empty-state'
import { PageTitle } from '~/src/components/page-title/page-title'
import { ErrorState } from '~/src/components/error-state/error-state'

// Favorites first. toSorted is stable, so each group stays newest first (the API's order).
const favoritesFirst = (boards: Board[]) => boards.toSorted((a, b) => Number(b.is_favorite) - Number(a.is_favorite))

const HomeRoute = () => {
  const {
    data: boards,
    status: boardsStatus,
    refetch: refetchBoards,
    isFetching: isBoardsFetching
  } = useBoardsQuery(favoritesFirst)

  if (boardsStatus === 'pending') {
    return (
      <>
        <PageTitle title="Your Boards" />
        <BoardListSkeleton />
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

  if (!boards.length) {
    return (
      <>
        <PageTitle title="Your Boards" />
        <HomeEmptyState />
      </>
    )
  }

  return (
    <>
      <PageTitle title="Your Boards" />

      <BoardList title="Your Boards" boards={boards} />
    </>
  )
}

export { HomeRoute }
