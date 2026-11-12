import React, { createContext, useContext, useMemo, useState } from 'react'
import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { Board, Hero, Category } from '~/src/types/api'
import { Translate } from '~/src/types/board-operations'

import { CustomGridCollisionDetectionEvent } from '~/src/routes/app.boards.id/BoardWorkspace/useGridCollisionDetection'
import { useParams } from 'react-router'
import { useQuery } from '~/src/contexts/Query'
import { BoardOperationProps, CategoryDraft } from './types'

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
  isEditing: boolean
  /** Any save for this board in flight (all board mutations share the board's key). */
  isSaving: boolean
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
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  board: null,
  updateBoard: () => {},
  deleteBoard: () => {},
  favoriteBoard: () => {},
  duplicateBoard: () => {},
  setIsEditing: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  moveCategory: () => {},
  moveCategoryEnd: () => {},
  resizeCategory: () => {},
  resizeCategoryEnd: () => {},
  deleteCategory: () => {},
  addHero: () => {},
  moveHero: () => {},
  isEditing: false,
  isSaving: false,
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
  isDeletingCategory: false
})

const BoardWorkspaceContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { boardId } = useParams()

  const queryClient = useQueryClient()

  // Same key useQuery(url) uses by default.
  const boardKey = useMemo(() => [`boards/${boardId}`], [boardId])

  const { data } = useQuery<{ board: Board }>(`boards/${boardId}`)

  // In-progress drag/resize values for one category, applied on top of the cached board.
  const [draft, setDraft] = useState<CategoryDraft | null>(null)

  const [isEditing, setIsEditing] = useState(false)

  const board = useMemo(() => (data ? withDraft(data.board, draft) : undefined), [data, draft])

  const isSaving = useIsMutating({ mutationKey: boardKey }) > 0

  const operationProps: BoardOperationProps = {
    boardId,
    boardKey,
    getBoard: () => queryClient.getQueryData<{ board: Board }>(boardKey)!.board,
    setBoard: (next) => {
      // An in-flight refetch would overwrite this edit with older data.
      queryClient.cancelQueries({ queryKey: boardKey })
      queryClient.setQueryData<{ board: Board }>(boardKey, (old) => (old ? { ...old, board: next } : old))
    },
    setDraft,
    rollback: () => {
      setDraft(null)
      queryClient.invalidateQueries({ queryKey: boardKey })
    },
    setIsEditing
  }

  const { mutate: updateBoard, isPending: isUpdating } = useUpdateBoardMutation(operationProps)

  const { mutate: deleteBoard, isPending: isDeleting } = useDeleteBoardMutation(operationProps)

  const { mutate: favoriteBoard, isPending: isFavoriteLoading } = useFavoriteBoardMutation(operationProps)

  const { mutate: duplicateBoard, isPending: isDuplicating } = useDuplicateBoardMutation(operationProps)

  const { mutate: addCategory, isPending: isAddingCategory } = useAddCategoryMutation(operationProps)

  const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategoryMutation(operationProps)

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useDeleteCategoryMutation(operationProps)

  const { mutate: moveCategory } = useMoveCategoryFn(operationProps)

  const { mutate: moveCategoryEnd, isPending: isMovingCategory } = useMoveEndCategoryMutation(operationProps)

  const { mutate: resizeCategory } = useResizeCategoryFn(operationProps)

  const { mutate: resizeCategoryEnd, isPending: isResizingCategory } = useResizeCategoryMutation(operationProps)

  const { mutate: addHero, isPending: isAddingHero } = useAddHeroMutation(operationProps)

  const { mutate: moveHero, isPending: isMovingHero } = useMoveHeroMutation(operationProps)

  if (!board) {
    return null
  }

  return (
    <BoardWorkspaceContext.Provider
      value={{
        board,
        updateBoard,
        deleteBoard: () => deleteBoard(undefined),
        favoriteBoard,
        duplicateBoard: () => duplicateBoard(undefined),
        setIsEditing,
        addHero,
        moveHero,
        addCategory,
        updateCategory,
        moveCategory,
        moveCategoryEnd,
        resizeCategory,
        resizeCategoryEnd,
        deleteCategory,
        isEditing,
        isSaving,
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
        isDeletingCategory
      }}>
      {children}
    </BoardWorkspaceContext.Provider>
  )
}

function withDraft(board: Board, draft: CategoryDraft | null): Board {
  if (!draft) return board

  const { id, ...changes } = draft

  return {
    ...board,
    categories: board.categories.map((category) => (category.id === id ? { ...category, ...changes } : category))
  }
}

const useBoardWorkspace = () => {
  return useContext(BoardWorkspaceContext)
}

export { BoardWorkspaceContextProvider, useBoardWorkspace }
