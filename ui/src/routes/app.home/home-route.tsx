import React, { useMemo } from 'react'
import { useBoardList } from '~/src/contexts/board-list/board-list-provider'
import { BoardList } from './board-list'
import { PageTitle } from '~/src/components/page-title/page-title'
import { Spacer } from '~/src/components/spacer/spacer'
import { Spinner } from '~/src/components/spinner/spinner'

const HomeRoute = () => {
  const { boards, isBoardListLoading } = useBoardList()

  const favorites = useMemo(() => {
    return boards.filter((board) => board.is_favorite)
  }, [boards])

  const recent = useMemo(() => {
    return boards.filter((board) => !board.is_favorite)
  }, [boards])

  if (isBoardListLoading) {
    return (
      <>
        <PageTitle title="Your Boards" />

        <div className="mx-auto flex justify-center p-12">
          <Spinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Your Boards" />

      {favorites.length ? <BoardList title="Favorite Boards" boards={favorites} /> : null}

      {recent.length ? (
        <>
          <Spacer size={4} />
          <BoardList title="Recent Boards" boards={recent} />
        </>
      ) : null}
    </>
  )
}

export { HomeRoute }
