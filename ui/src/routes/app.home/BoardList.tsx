import React from 'react'
import styled from 'styled-components'
import { useBoardList } from '~/src/contexts/BoardList'
import { Icon, PlainButton } from '~/src/components'
import { Link } from 'react-router-dom'
import { theme } from '~/src/theme'
import { Board } from '~/src/types/api'

interface Props {
  title: string
  boards: Board[]
}

const BoardList: React.FC<Props> = ({ title, boards }) => {
  const { favoriteBoard } = useBoardList()

  return (
    <Container>
      <Heading>Recent Boards</Heading>

      {boards.map((board) => (
        <Item key={board.id}>
          <ItemLink to={`/boards/${board.id}`}>
            <ItemTitle>{board.name}</ItemTitle>
            <ItemLastUpdate>5 minutes ago</ItemLastUpdate>
          </ItemLink>

          <PlainButton type="button" onClick={() => favoriteBoard(board.id)}>
            <ItemFavorite color={board.is_favorite ? theme.colors.red[500] : theme.colors.neutral[400]}>
              <Icon name={board.is_favorite ? 'star' : 'starOutline'} width={24} />
            </ItemFavorite>
          </PlainButton>
        </Item>
      ))}
    </Container>
  )
}

const Container = styled.div`
  margin: 0 auto;
  width: 480px;
`

const Heading = styled.h5`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.neutral[300]};
  margin-bottom: 16px;
`

const Item = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.neutral[700]};
  border-radius: 4px;
  box-shadow: 0px 0px 0px 2px transparent;
  transition: all 200ms ease;

  &:hover {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

const ItemLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-right: 0;
  width: 100%;
  text-decoration: none;
`

const ItemTitle = styled.h3`
  color: ${theme.colors.text};
  font-size: ${theme.fontSizes.lg};
  font-weight: 500;
`

const ItemLastUpdate = styled.span`
  font-size: ${theme.fontSizes.sm};
  font-weight: 400;
  color: ${theme.colors.neutral[400]};
`

const ItemFavorite = styled.div<{ color: string }>`
  padding: 16px;
  color: ${(props) => props.color};
`

export { BoardList }
