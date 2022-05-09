import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useBoardList } from '~/src/contexts/BoardList'
import { BoardList } from './BoardList'
import { Spacer, Spinner } from '~/src/components'

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
      <Container>
        <Spinner />
      </Container>
    )
  }

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

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  padding: 48px;
`

export { HomeRoute }
