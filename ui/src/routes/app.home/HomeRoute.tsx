import React from 'react'
import { useBoardList } from '~/src/contexts/BoardList'
import { BoardList } from './BoardList'
import { Spacer } from '~/src/components'

const HomeRoute = () => {
  const { boards } = useBoardList()

  if (!boards.length) {
    return null
  }

  const favorites = boards.filter((board) => board.is_favorite)

  const recent = boards.filter((board) => !board.is_favorite)

  return (
    <>
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
