import React, { useMemo } from 'react'
import styled from 'styled-components'
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

        <Container>
          <Spinner />
        </Container>
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

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  padding: 48px;
`

export { HomeRoute }
