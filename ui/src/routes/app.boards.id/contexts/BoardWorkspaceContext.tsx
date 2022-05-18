import React, { createContext, useContext, useState } from 'react'
import { Board, Hero, Category } from '~/src/types/api'
import { Translate } from '~/src/types/board-operations'

import { CustomGridCollisionDetectionEvent } from '~/src/routes/app.boards.id/BoardWorkspace/useGridCollisionDetection'
import { useParams } from 'react-router-dom'
import { useQuery } from '~/src/contexts/Query'
import { useStateRef } from '~/src/hooks'

import { useUpdateBoardMutation } from './useUpdateBoardMutation'
import { useDeleteBoardMutation } from './useDeleteBoardMutation'
import { useFavoriteBoardMutation } from './useFavoriteBoardMutation'
import { useDuplicateBoardMutation } from './useDuplicateBoardMutation'
import { useAddCategoryMutation } from './useAddCategoryMutation'
import { useUpdateCategoryMutation } from './useUpdateCategoryMutation'
import { useDeleteCategoryMutation } from './useDeleteCategoryMutation'
import { useMoveCategoryFn } from './useMoveCategoryFn'
import { useMoveEndCategoryMutation } from './useMoveEndCategoryMutation'
import { useResizeCategoryFn } from './useResizeCategoryFn'
import { useResizeCategoryMutation } from './useResizeCategoryMutation'
import { useAddHeroMutation } from './useAddHeroMutation'
import { useMoveHeroMutation } from './useMoveHeroMutation'

interface BoardWorkspaceContextType {
  board: Board
  updateBoard: (b: Pick<Board, 'name'>) => void
  deleteBoard: () => void
  favoriteBoard: () => void
  duplicateBoard: () => void
  isEditing: boolean
  isUpdating: boolean
  isDeleting: boolean
  isFavoriteLoading: boolean
  isDuplicating: boolean
  isAddingHero: boolean
  isMovingHero: boolean
  isAddingCategory: boolean
  isUpdatingCategory: boolean
  isMovingCategory: boolean
  isResizingCategory: boolean
  isDeletingCategory: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (category: Category, hero: Hero) => void
  moveHero: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  addCategory: () => void
  updateCategory: (category: Pick<Category, 'id' | 'name'>) => void
  moveCategory: ({ container, translate }: { container: Category; translate: Translate }) => void
  moveCategoryEnd: ({ container }: { container: Category }) => void
  resizeCategory: ({ container, width }: { container: Category; width: number }) => void
  resizeCategoryEnd: ({ container }: { container: Category }) => void
  deleteCategory: (category: Category) => void
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  board: null,
  updateBoard: () => {},
  deleteBoard: () => {},
  favoriteBoard: () => {},
  duplicateBoard: () => {},
  isEditing: false,
  isUpdating: false,
  isDeleting: false,
  isFavoriteLoading: false,
  isDuplicating: false,
  isAddingHero: false,
  isMovingHero: false,
  isAddingCategory: false,
  isUpdatingCategory: false,
  isMovingCategory: false,
  isResizingCategory: false,
  isDeletingCategory: false,
  setIsEditing: () => {},
  addHero: () => {},
  moveHero: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  moveCategory: () => {},
  moveCategoryEnd: () => {},
  resizeCategory: () => {},
  resizeCategoryEnd: () => {},
  deleteCategory: () => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const { boardId } = useParams()

  const [board, setBoard, boardRef] = useStateRef<Board>()

  const [isEditing, setIsEditing] = useState(false)

  useQuery(`boards/${boardId}`, {
    onSuccess: (data) => setBoard(data.board)
  })

  const operationProps = {
    board,
    boardRef,
    setBoard,
    setIsEditing
  }

  const { mutate: updateBoard, isLoading: isUpdating } = useUpdateBoardMutation(operationProps)

  const { mutate: deleteBoard, isLoading: isDeleting } = useDeleteBoardMutation(operationProps)

  const { mutate: favoriteBoard, isLoading: isFavoriteLoading } = useFavoriteBoardMutation(operationProps)

  const { mutate: duplicateBoard, isLoading: isDuplicating } = useDuplicateBoardMutation(operationProps)

  const { mutate: addCategory, isLoading: isAddingCategory } = useAddCategoryMutation(operationProps)

  const { mutate: updateCategory, isLoading: isUpdatingCategory } = useUpdateCategoryMutation(operationProps)

  const { mutate: deleteCategory, isLoading: isDeletingCategory } = useDeleteCategoryMutation(operationProps)

  const { mutate: moveCategory } = useMoveCategoryFn(operationProps)

  const { mutate: moveCategoryEnd, isLoading: isMovingCategory } = useMoveEndCategoryMutation(operationProps)

  const { mutate: resizeCategory } = useResizeCategoryFn(operationProps)

  const { mutate: resizeCategoryEnd, isLoading: isResizingCategory } = useResizeCategoryMutation(operationProps)

  const { mutate: addHero, isLoading: isAddingHero } = useAddHeroMutation(operationProps)

  const { mutate: moveHero, isLoading: isMovingHero } = useMoveHeroMutation(operationProps)

  if (!board) {
    return null
  }

  return (
    <BoardWorkspaceContext.Provider
      value={{
        board,
        updateBoard,
        deleteBoard,
        favoriteBoard,
        duplicateBoard,
        isEditing,
        isUpdating,
        isFavoriteLoading,
        isDuplicating,
        isDeleting,
        isAddingHero,
        isMovingHero,
        isAddingCategory,
        isUpdatingCategory,
        isMovingCategory,
        isResizingCategory,
        isDeletingCategory,
        setIsEditing,
        addHero,
        moveHero,
        addCategory,
        updateCategory,
        moveCategory,
        moveCategoryEnd,
        resizeCategory,
        resizeCategoryEnd,
        deleteCategory
      }}>
      {children}
    </BoardWorkspaceContext.Provider>
  )
}

const useBoardWorkspace = () => {
  return useContext(BoardWorkspaceContext)
}

export { BoardWorkspaceContextProvider, useBoardWorkspace }
