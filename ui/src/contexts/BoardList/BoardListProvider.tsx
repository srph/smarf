import React, { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuery, useMutation } from '~/src/contexts/Query'
import { useAuthUser } from '~/src/contexts/AuthUser'
import { useHeroList } from '~/src/contexts/HeroList'
import { Board, ID } from '~/src/types/api'

import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING } from './constants'
import { getCategoryHeight } from './utils'

interface BoardListContextType {
  boards: Board[]
  isBoardListLoading: boolean
  isBoardCreating: boolean
  createBoard: () => void
  updateBoard: (id: ID, name: string) => void
  removeBoard: (id: ID) => void
}

const BoardListContext = createContext<BoardListContextType>({
  boards: [],
  isBoardListLoading: false,
  isBoardCreating: false,
  createBoard: () => {},
  updateBoard: () => {},
  removeBoard: () => {}
})

const BoardListProvider: React.FC = ({ children }) => {
  const { token } = useAuthUser()

  const navigate = useNavigate()

  const { data, isLoading: isBoardListLoading } = useQuery('/boards', {
    enabled: Boolean(token)
  })

  const { heroes, isLoading: isHeroListLoading } = useHeroList()

  const { mutate: createBoardMutation, isLoading: isBoardCreating } = useMutation('/boards', 'post', {
    onSuccess: (data) => {
      navigate(`/boards/${data.board.id}`)
    }
  })

  const createBoard = () => {
    if (isBoardCreating || isHeroListLoading) {
      return
    }

    const initialHeroes = heroes.slice(0, 2).map((hero, i) => {
      return {
        id: hero.id,
        order: i * 1024
      }
    })

    const board = {
      name: 'v7.30 Patch',
      categories: [
        {
          name: 'Mid Farming',
          heroes: initialHeroes,
          x_position: 0,
          y_position: 0,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 })
        },
        {
          name: 'Mid Farming',
          heroes: initialHeroes,
          x_position: 0,
          y_position:
            getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 }) + CATEGORY_SPACING,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 })
        }
      ]
    }

    createBoardMutation(board)
  }

  const updateBoard = () => {}

  const removeBoard = () => {}

  return (
    <BoardListContext.Provider
      value={{
        boards: data?.boards || [],
        isBoardListLoading,
        isBoardCreating,
        createBoard,
        updateBoard,
        removeBoard
      }}>
      {children}
    </BoardListContext.Provider>
  )
}

const useBoardList = () => {
  return useContext(BoardListContext)
}

export { BoardListProvider, useBoardList }
