import React from 'react'
import { useBoardsQuery } from '~/src/queries/boards/use-boards-query'
import { favoritesFirst } from '~/src/queries/boards/favorites-first'
import { BoardList } from './board-list'
import { BoardListSkeleton } from './board-list-skeleton'
import { HomeEmptyState } from './home-empty-state'
import { PageTitle } from '~/src/components/page-title/page-title'
import { ErrorState } from '~/src/components/error-state/error-state'

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
        <BoardListSkeleton title="Your Boards" />
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
