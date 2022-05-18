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
import { useAddHeroMutation } from './useAddHeroMutation'
import { useUpdateCategoryMutation } from './useUpdateCategoryMutation'
import { useDeleteCategoryMutation } from './useDeleteCategoryMutation'
import { useMoveCategoryFn } from './useMoveCategoryFn'
import { useMoveEndCategoryMutation } from './useMoveEndCategoryMutation'
import { useResizeCategoryFn } from './useResizeCategoryFn'
import { useResizeCategoryMutation } from './useResizeCategoryMutation'
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
  moveHeroEnd: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
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
  moveHeroEnd: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  moveCategory: () => {},
  moveCategoryEnd: () => {},
  resizeCategory: () => {},
  resizeCategoryEnd: () => {},
  deleteCategory: (category: Category) => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const { boardId } = useParams()

  const [isEditing, setIsEditing] = useState(false)

  const [board, setBoard, boardRef] = useStateRef<Board>()

  const { isLoading } = useQuery(`boards/${boardId}`, {
    onSuccess: (data) => {
      setBoard(data.board)
    }
  })

  const hookProps = {
    board,
    boardRef,
    setBoard,
    setIsEditing
  }

  const { mutate: updateBoard, isLoading: isUpdating } = useUpdateBoardMutation(hookProps)

  const { mutate: deleteBoard, isLoading: isDeleting } = useDeleteBoardMutation(hookProps)

  const { mutate: favoriteBoard, isLoading: isFavoriteLoading } = useFavoriteBoardMutation(hookProps)

  const { mutate: duplicateBoard, isLoading: isDuplicating } = useDuplicateBoardMutation(hookProps)

  const { mutate: addHero, isLoading: isAddingHero } = useAddHeroMutation(hookProps)

  const { mutate: addCategory, isLoading: isAddingCategory } = useAddCategoryMutation(hookProps)

  const { mutate: updateCategory, isLoading: isUpdatingCategory } = useUpdateCategoryMutation(hookProps)

  const { mutate: deleteCategory, isLoading: isDeletingCategory } = useDeleteCategoryMutation(hookProps)

  const { mutate: moveCategory } = useMoveCategoryFn(hookProps)

  const { mutate: moveCategoryEnd, isLoading: isMovingCategory } = useMoveEndCategoryMutation(hookProps)

  const { mutate: resizeCategory } = useResizeCategoryFn(hookProps)

  const { mutate: resizeCategoryEnd, isLoading: isResizingCategory } = useResizeCategoryMutation(hookProps)

  const { mutate: moveHero, isLoading: isMovingHero } = useMoveHeroMutation(hookProps)

  const moveHeroEnd = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => {
    // moveHeroMutation({
    //   from_category_id: from.container,
    //   to_category_id: to.category.id,
    //   hero_id: from.catego
    //   order
    // })
  }

  if (!board || isLoading) {
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
        moveHeroEnd,
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
