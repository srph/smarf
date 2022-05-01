import React, { createContext, useContext } from 'react'
import { useQuery } from '~/src/contexts/Query'
import { useAuthUser } from '~/src/contexts/AuthUser'
import { Board, ID } from '~/src/types/api'

interface BoardListContextType {
  boards: Board[]
  isLoading: boolean
  updateBoard: (id: ID, name: string) => void
  removeBoard: (id: ID) => void
}

const BoardListContext = createContext<BoardListContextType>({
  boards: [],
  isLoading: false,
  updateBoard: () => {},
  removeBoard: () => {}
})

const BoardListProvider: React.FC = ({ children }) => {
  const { token } = useAuthUser()

  const { data, isLoading } = useQuery('/boards', {
    enabled: Boolean(token)
  })

  const updateBoard = () => {}

  const removeBoard = () => {}

  return (
    <BoardListContext.Provider value={{ boards: data?.boards || [], isLoading, updateBoard, removeBoard }}>
      {children}
    </BoardListContext.Provider>
  )
}

const useBoardList = () => {
  return useContext(BoardListContext)
}

export { BoardListProvider, useBoardList }
