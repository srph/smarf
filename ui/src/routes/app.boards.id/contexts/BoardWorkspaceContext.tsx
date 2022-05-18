import React, { createContext, useContext, useState } from 'react'
import { Board, Hero, Category, ID } from '~/src/types/api'
import immer from 'immer'
import { arrayMove } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'
import { CustomGridCollisionDetectionEvent } from '~/src/routes/app.boards.id/BoardWorkspace/useGridCollisionDetection'
import { getCategoryHeight, getHeroOrder, getLowestCategoryBottom } from '~/src/contexts/BoardList/utils'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { useStateRef } from '~/src/hooks'

import { useUpdateBoardMutation } from './useUpdateBoardMutation'
import { useDeleteBoardMutation } from './useDeleteBoardMutation'
import { useFavoriteBoardMutation } from './useFavoriteBoardMutation'
import { useDuplicateBoardMutation } from './useDuplicateBoardMutation'
import { useAddCategoryMutation } from './useAddCategoryMutation'
import { useAddHeroMutation } from './useAddHeroMutation'
import { useUpdateCategoryMutation } from './useUpdateCategoryMutation'
import { useDeleteCategoryMutation } from './useDeleteCategoryMutation'
import { useMoveEndCategoryMutation } from './useMoveEndCategoryMutation'

interface BoardWorkspaceCategoryMoveEvent {
  x: number
  y: number
}

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
  moveCategory: ({ container, translate }: { container: Category; translate: BoardWorkspaceCategoryMoveEvent }) => void
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

  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)

  // @TODO: Implement loader and board list
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

  const { mutate: moveCategoryEnd, isLoading: isMovingCategory } = useMoveEndCategoryMutation(hookProps)

  interface ResizeCategoryMutationVariables {
    category_id: number
    width: number
    height: number
  }

  const { mutate: resizeCategoryMutation, isLoading: isResizingCategory } =
    useMutation<ResizeCategoryMutationVariables>((v) => `/categories/${v.category_id}/resize`, 'put', {
      onSuccess() {
        // @TODO: Silently apply so we have the correct uuid
      },
      onError() {
        // @TODO: Rollback
      }
    })

  interface MoveHeroMutationVariables {
    from_category_id: number
    from_category_height: number
    to_category_id: number
    to_category_height: number
    hero_pivot_id: number
    hero_buffer_uuid: ID
    order: number
  }

  const { mutate: moveHeroMutation, isLoading: isMovingHero } = useMutation<MoveHeroMutationVariables>(
    (v) => `/categories/${v.from_category_id}/heroes/${v.hero_pivot_id}`,
    'put',
    {
      onSuccess() {
        // @TODO: Silently apply so we have the correct uuid
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  // Mutably swap values array to array
  function arrayTransfer<T>(src: T[], dest: T[], from: number, to: number) {
    const value = src.splice(from, 1)[0]
    dest.splice(to, 0, value)
  }

  const moveHero = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => {
    setBoard(
      immer(board, (draft) => {
        if (from.container === to.container) {
          const category = draft.categories.find((c) => c.id === to.container)
          category.heroes = arrayMove(category.heroes, from.index, to.index)

          const order = getHeroOrder(category, to.index)
          category.heroes[to.index].pivot.order = order

          moveHeroMutation({
            from_category_id: category.id,
            from_category_height: category.height,
            to_category_id: category.id,
            to_category_height: category.height,
            hero_pivot_id: category.heroes[to.index].pivot.id,
            hero_order: order
          })
        } else {
          const fromCategory = draft.categories.find((c) => c.id === from.container)

          const toCategory = draft.categories.find((c) => c.id === to.container)

          fromCategory.height = getCategoryHeight({
            categoryWidth: fromCategory.width,
            heroCount: fromCategory.heroes.length - 1
          })

          toCategory.height = getCategoryHeight({
            categoryWidth: toCategory.width,
            heroCount: toCategory.heroes.length + 1
          })

          arrayTransfer(fromCategory.heroes, toCategory.heroes, from.index, to.index)

          const order = getHeroOrder(toCategory, to.index)

          toCategory.heroes[to.index].pivot.order = order

          moveHeroMutation({
            from_category_id: fromCategory.id,
            from_category_height: fromCategory.height,
            to_category_id: toCategory.id,
            to_category_height: toCategory.height,
            hero_pivot_id: toCategory.heroes[to.index].pivot.id,
            hero_order: order
          })
        }
      })
    )
  }

  const moveHeroEnd = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => {
    // moveHeroMutation({
    //   from_category_id: from.container,
    //   to_category_id: to.category.id,
    //   hero_id: from.catego
    //   order
    // })
  }

  const moveCategory = ({ container, translate: { x, y } }) => {
    setBoard(
      immer(board, (draft) => {
        const selectedCategory = draft.categories.find((c) => c.id === container.id)
        selectedCategory.x_position = x
        selectedCategory.y_position = y
      })
    )
  }

  const resizeCategory = ({ container, width }) => {
    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((category) => category.id === container.id)
        boardCategory.width = width
        boardCategory.height = getCategoryHeight({
          categoryWidth: width,
          heroCount: boardCategory.heroes.length
        })
      })
    )
  }

  const resizeCategoryEnd = ({ container }) => {
    resizeCategoryMutation({
      category_id: container.id,
      width: container.width,
      height: container.height
    })
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
