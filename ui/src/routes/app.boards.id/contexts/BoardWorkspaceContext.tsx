import React, { createContext, useContext, useState } from 'react'
import { Board, Hero, Category, ID } from '~/src/types/api'
import immer from 'immer'
import { arrayMove } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'
import { CustomGridCollisionDetectionEvent } from '~/src/routes/app.boards.id/BoardWorkspace/useGridCollisionDetection'
import {
  CATEGORY_HERO_WIDTH,
  CATEGORY_ROW_HEIGHT,
  CATEGORY_BODY_INITIAL_WIDTH,
  CATEGORY_SPACING,
  ORDER_FIRST_BUFFER,
  ORDER_LAST_BUFFER
} from '~/src/contexts/BoardList/constants'
import { getHeroOrder, getLowestCategoryBottom } from '~/src/contexts/BoardList/utils'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { useHeroList } from '~/src/contexts/HeroList'
import { useStateRef } from '~/src/hooks'
import { last } from '~/src/utils'
import { HeroCategoryPivot } from '~/src/types/api'

interface BoardWorkspaceCategoryMoveEvent {
  x: number
  y: number
}

interface BoardWorkspaceContextType {
  board: Board
  updateBoard: (b: Pick<Board, 'name'>) => void
  deleteBoard: () => void
  isEditing: boolean
  isDeleting: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (category: Category, hero: Hero) => void
  moveHero: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  moveHeroEnd: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  addCategory: () => void
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
  isEditing: false,
  isDeleting: false,
  setIsEditing: () => {},
  addHero: () => {},
  moveHero: () => {},
  moveHeroEnd: () => {},
  addCategory: () => {},
  moveCategory: () => {},
  moveCategoryEnd: () => {},
  resizeCategory: () => {},
  resizeCategoryEnd: () => {},
  deleteCategory: (category: Category) => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const { heroes } = useHeroList()

  const { boardId } = useParams()

  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)

  const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
    const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
    const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
    const rowCount = Math.ceil(columnCount / columnsPerRow)
    return CATEGORY_ROW_HEIGHT * rowCount
  }

  // @TODO: Implement loader and board list
  const [board, setBoard, boardRef] = useStateRef<Board>()

  const { isLoading } = useQuery(`boards/${boardId}`, {
    onSuccess: (data) => {
      setBoard(data.board)
    }
  })

  interface UpdateBoardMutationVariables {
    name: string
  }

  const { mutate: updateBoard, isLoading: isBoardUpdating } = useMutation<UpdateBoardMutationVariables>(
    `/boards/${board?.id}`,
    'put',
    {
      onSuccess(data) {
        queryClient.invalidateQueries('/boards')

        setBoard({
          ...board,
          name: data.board.name
        })

        setIsEditing(false)
      },

      onError() {
        // Toast
      }
    }
  )

  const { mutate: deleteBoard, isLoading: isDeleting } = useMutation(`/boards/${board?.id}`, 'delete', {
    onSuccess() {
      queryClient.invalidateQueries('/boards')

      navigate('/')

      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })

  interface AddHeroMutationVariables {
    hero_id: number
    hero_buffer_id: number
    hero_order: number
    category_id: number
    category_height: number
  }

  const { mutate: addHeroMutation } = useMutation<AddHeroMutationVariables>(
    (v) => `/categories/${v.category_id}/heroes`,
    'post',
    {
      onSuccess(data, v) {
        // Silently apply so we have the correct uuid. Otherwise, adding a hero then moving it
        // would fail when we try to persist it to the API.
        // Also, we are using ref here as this fires way before board state gets updated.
        setBoard(
          immer(boardRef.current, (draft) => {
            const category = draft.categories.find((c) => c.id === v.category_id)
            const hero = category.heroes.find((h) => h.pivot.id === v.hero_buffer_id)
            console.log('Here', JSON.stringify(category.heroes, null, 2), data, v)
            hero.pivot = data.hero.pivot
          })
        )
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  interface AddCategoryMutationVariables {
    category_buffer_id: ID
    name: string
    width: number
    height: number
    x_position: number
    y_position: number
    heroes: HeroCategoryPivot['pivot']
  }

  const { mutate: addCategoryMutation } = useMutation<AddCategoryMutationVariables>(
    `/boards/${board?.id}/categories`,
    'post',
    {
      onSuccess(data, v) {
        // Silently apply so we have the correct uuid
        setBoard(
          immer(boardRef.current, (draft) => {
            const index = draft.categories.findIndex((c) => c.id === v.category_buffer_id)
            if (index === -1) return // @TODO: Throw
            draft.categories[index] = data.category
          })
        )
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  interface DeleteCategoryMutationVariables {
    category_id: ID
  }

  const { mutate: deleteCategoryMutation } = useMutation<DeleteCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}`,
    'delete',
    {
      onSuccess(data, v) {
        // @TODO: Toast
      },
      onError() {
        // @TODO: Rollback (?)
      }
    }
  )

  interface MoveCategoryMutationVariables {
    category_id: number
    x_position: number
    y_position: number
  }

  const { mutate: moveCategoryMutation } = useMutation<MoveCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/move`,
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

  interface ResizeCategoryMutationVariables {
    category_id: number
    width: number
  }

  const { mutate: resizeCategoryMutation } = useMutation<ResizeCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/resize`,
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

  interface MoveHeroMutationVariables {
    from_category_id: number
    from_category_height: number
    to_category_id: number
    to_category_height: number
    hero_pivot_id: number
    hero_buffer_uuid: ID
    order: number
  }

  const { mutate: moveHeroMutation } = useMutation<MoveHeroMutationVariables>(
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

  const addHero = (category: Category, hero: Hero) => {
    const categoryHeight = getCategoryHeight({
      categoryWidth: category.width,
      heroCount: category.heroes.length + 1
    })

    // @TODO: Use getHeroOrder utility
    const heroOrder = category.heroes.length
      ? last(category.heroes).pivot.order + ORDER_LAST_BUFFER
      : ORDER_FIRST_BUFFER

    const heroBufferId = uuid()

    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)

        boardCategory.heroes.push({
          ...hero,
          pivot: {
            id: heroBufferId,
            order: heroOrder
          }
        })

        boardCategory.height = categoryHeight
      })
    )

    addHeroMutation({
      hero_id: hero.id,
      hero_buffer_id: heroBufferId,
      hero_order: heroOrder,
      category_id: category.id,
      category_height: categoryHeight
    })
  }

  // Mutably swap values array to array
  function arrayTransfer<T>(src: T[], dest: T[], from: number, to: number) {
    const value = src.splice(from, 1)[0]
    dest.splice(to, 0, value)
  }

  const moveHero = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => {
    setBoard(
      immer(board, (draft) => {
        if (from.container === to.container) {
          console.log(to.container, to.index)
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
            categoryWidth: toCategory.width,
            heroCount: toCategory.heroes.length - 1
          })

          toCategory.height = getCategoryHeight({
            categoryWidth: toCategory.width,
            heroCount: toCategory.heroes.length + 1
          })

          arrayTransfer(fromCategory.heroes, toCategory.heroes, from.index, to.index)

          const order = getHeroOrder(toCategory, to.index)
          toCategory.heroes[to.index].pivot.order = getHeroOrder(toCategory, to.index)

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

  const moveCategoryEnd = ({ container }) => {
    moveCategoryMutation({
      category_id: container.id,
      x_position: container.x_position,
      y_position: container.y_position
    })
  }

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const addCategory = () => {
    const category = {
      id: uuid(),
      name: 'Untitled',
      heroes: [],
      x_position: 0,
      y_position: getLowestCategoryBottom(board) + CATEGORY_SPACING,
      width: CATEGORY_BODY_INITIAL_WIDTH,
      height: getCategoryHeight({
        categoryWidth: CATEGORY_BODY_INITIAL_WIDTH,
        heroCount: 0
      })
    }

    setBoard(
      immer(board, (draft) => {
        draft.categories.push(category)
      })
    )

    addCategoryMutation({
      ...category,
      category_buffer_id: category.id
    })
  }

  const resizeCategory = ({ container, width }) => {
    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((category) => category.id === container.id)
        boardCategory.width = width
      })
    )
  }

  const resizeCategoryEnd = ({ container }) => {
    resizeCategoryMutation({
      category_id: container.id,
      width: container.width
    })
  }

  const deleteCategory = (category) => {
    setBoard(
      immer(board, (draft) => {
        const categoryId = category.id
        draft.categories = draft.categories.filter((category) => category.id !== categoryId)
      })
    )

    deleteCategoryMutation({ category_id: category.id })
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
        isEditing,
        isDeleting,
        setIsEditing,
        addHero,
        moveHero,
        moveHeroEnd,
        addCategory,
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
