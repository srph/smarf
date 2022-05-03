import React, { createContext, useContext, useState, useMemo } from 'react'
import { Board, Hero, Category } from '~/src/types/api'
import immer from 'immer'
import { arrayMove } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'
import { CustomGridCollisionDetectionEvent } from '~/src/routes/boards.id/BoardWorkspace/useGridCollisionDetection'
import {
  CATEGORY_HERO_WIDTH,
  CATEGORY_ROW_HEIGHT,
  CATEGORY_BODY_INITIAL_WIDTH,
  CATEGORY_SPACING,
  ORDER_FIRST_BUFFER,
  ORDER_LAST_BUFFER
} from '~/src/contexts/BoardList/constants'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { useHeroList } from '~/src/contexts/HeroList'
import { useParams } from 'react-router-dom'

interface BoardWorkspaceCategoryMoveEvent {
  x: number
  y: number
}

interface BoardWorkspaceContextType {
  board: Board
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (category: Category, hero: Hero) => void
  moveHero: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  addCategory: () => void
  moveCategory: ({ container, translate }: { container: Category; translate: BoardWorkspaceCategoryMoveEvent }) => void
  moveCategoryEnd: ({ container }: { container: Category }) => void
  resizeCategory: ({ container, width }: { container: Category; width: number }) => void
  resizeCategoryEnd: ({ container }: { container: Category }) => void
  deleteCategory: (category: Category) => void
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  board: {},
  isEditing: false,
  setIsEditing: () => {},
  addHero: () => {},
  moveHero: () => {},
  addCategory: () => {},
  deleteCategory: (category: Category) => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const { heroes } = useHeroList()

  const { boardId } = useParams()

  const [isEditing, setIsEditing] = useState(false)

  const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
    const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
    const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
    const rowCount = Math.ceil(columnCount / columnsPerRow)
    return CATEGORY_ROW_HEIGHT * rowCount
  }

  // @TODO: Implement loader and board list
  const [board, setBoard] = useState<Board>(() => ({
    id: uuid(),
    name: 'v7.30 Patch',
    categories: [
      {
        id: uuid(),
        name: 'Mid Farming',
        heroes: [
          { ...heroes[0], pivot: { id: uuid() } },
          { ...heroes[1], pivot: { id: uuid() } },
          { ...heroes[2], pivot: { id: uuid() } }
        ],
        x_position: 0,
        y_position: 0,
        width: CATEGORY_BODY_INITIAL_WIDTH,
        height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 })
      },
      {
        id: uuid(),
        name: 'Mid Farming',
        heroes: [
          { ...heroes[0], pivot: { id: uuid() } },
          { ...heroes[1], pivot: { id: uuid() } },
          { ...heroes[2], pivot: { id: uuid() } }
        ],
        x_position: 0,
        y_position: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 }) + CATEGORY_SPACING,
        width: CATEGORY_BODY_INITIAL_WIDTH,
        height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 3 })
      }
    ]
  }))

  const { isLoading } = useQuery(`boards/${boardId}`, {
    onSuccess: (data) => {
      setBoard(data.board)
    }
  })

  interface AddHeroMutationVariables {
    hero_id: number
    hero_order: number
    category_id: number
    category_height: number
  }

  const { mutate: addHeroMutation } = useMutation<AddHeroMutationVariables>(
    (v) => `/categories/${v.category_id}/heroes`,
    'post',
    {
      onSuccess() {
        // @TODO: Silently apply so we have the correct uuid
      },
      onError() {
        // @TODO: Rollback
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

  const addHero = (category: Category, hero: Hero) => {
    const categoryHeight = getCategoryHeight({
      categoryWidth: category.width,
      heroCount: category.heroes.length + 1
    })

    const heroOrder = category.heroes.length
      ? last(category.heroes).pivot.order + ORDER_LAST_BUFFER
      : ORDER_FIRST_BUFFER

    addHeroMutation({
      hero_id: hero.id,
      hero_order: heroOrder,
      category_id: category.id,
      category_height: categoryHeight
    })

    function last<T>(arr: T[]): T {
      return arr[arr.length - 1]
    }

    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)

        boardCategory.heroes.push({
          ...hero,
          pivot: {
            id: uuid(),
            order: heroOrder
          }
        })

        boardCategory.height = categoryHeight
      })
    )
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
          const category = draft.categories.find((c) => c.id === to.container)
          category.heroes = arrayMove(category.heroes, from.index, to.index)
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
        }
      })
    )
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

  const getCategoryBottom = (category: Category): number => {
    return category.y_position + category.height
  }

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const addCategory = () => {
    const lowestCategory = [...board.categories].sort((a, b) => {
      return getCategoryBottom(b) - getCategoryBottom(a)
    })[0]

    // Bottom position + allowance
    const yPosition = getCategoryBottom(lowestCategory) + CATEGORY_SPACING

    setBoard(
      immer(board, (draft) => {
        const category = {
          id: uuid(),
          name: 'Untitled',
          heroes: [],
          x_position: 0,
          y_position: yPosition,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: getCategoryHeight({
            categoryWidth: CATEGORY_BODY_INITIAL_WIDTH,
            heroCount: 0
          })
        }

        draft.categories.push(category)
      })
    )
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
  }

  return (
    <BoardWorkspaceContext.Provider
      value={{
        board,
        isEditing,
        setIsEditing,
        addHero,
        moveHero,
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
