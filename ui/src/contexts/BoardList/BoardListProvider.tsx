import React, { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQueryClient } from 'react-query'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { useAuthUser } from '~/src/contexts/AuthUser'
import { useHeroList } from '~/src/contexts/HeroList'
import { Board, Category, HeroCategoryPivot, ID } from '~/src/types/api'

import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING, ORDER_BUFFER } from './constants'
import { getCategoryHeight } from './utils'

interface CreateBoardMutationResponse {
  board: Board
}

interface CreateBoardMutationVariables {
  name: string
  categories: Omit<Category, 'created_at' | 'updated_at'> & {
    heroes: HeroCategoryPivot['pivot'][]
  }
}

interface FavoriteBoardMutationVariables {
  board_id: string
  is_favorite: boolean
}

interface BoardListContextType {
  boards: Board[]
  isBoardListLoading: boolean
  isBoardCreating: boolean
  createBoard: () => void
  favoriteBoard: (id: ID) => void
}

const BoardListContext = createContext<BoardListContextType>({
  boards: [],
  isBoardListLoading: false,
  isBoardCreating: false,
  favoriteBoard: () => {},
  createBoard: () => {}
})

const BoardListProvider: React.FC = ({ children }) => {
  const { token } = useAuthUser()

  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { data, isLoading: isBoardListLoading } = useQuery('/boards', {
    enabled: Boolean(token)
  })

  const { heroes, isLoading: isHeroListLoading } = useHeroList()

  const { mutate: createBoardMutation, isLoading: isBoardCreating } = useMutation<
    CreateBoardMutationResponse,
    CreateBoardMutationVariables
  >('/boards', 'post', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('/boards')
      navigate(`/b/${data.board.id}`)
    }
  })

  const { mutate: favoriteBoardMutation } = useMutation<{}, FavoriteBoardMutationVariables>(
    (v) => `/boards/${v.board_id}/favorite`,
    'put',
    {
      onSuccess() {
        // @TODO: Toast
        queryClient.invalidateQueries('/boards')
      }
    }
  )

  const boards = data?.boards || []

  const favoriteBoard = (id: ID) => {
    if (!boards) return null
    const board = boards.find((board) => board.id === id)
    favoriteBoardMutation({ board_id: id, is_favorite: !board.is_favorite })
  }

  const createBoard = () => {
    if (isBoardCreating || isHeroListLoading) {
      return
    }

    const initialHeroes = heroes.slice(0, 2).map((hero, i) => {
      return {
        id: hero.id,
        order: (i + 1) * ORDER_BUFFER
      }
    })

    const board = {
      name: 'Untitled',
      categories: [
        {
          name: 'Mid Farming',
          heroes: initialHeroes,
          x_position: 0,
          y_position: 0,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: initialHeroes.length })
        },
        {
          name: 'Suntukan Offlane',
          heroes: initialHeroes,
          x_position: 0,
          y_position:
            getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: initialHeroes.length }) +
            CATEGORY_SPACING,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: initialHeroes.length })
        }
      ]
    }

    createBoardMutation(board)
  }

  return (
    <BoardListContext.Provider
      value={{
        boards: boards,
        isBoardListLoading,
        isBoardCreating,
        favoriteBoard,
        createBoard
      }}>
      {children}
    </BoardListContext.Provider>
  )
}

const useBoardList = () => {
  return useContext(BoardListContext)
}

export { BoardListProvider, useBoardList }
