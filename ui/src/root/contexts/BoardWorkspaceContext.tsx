import React, { createContext, useContext, useState, useMemo } from 'react'
import { ID, Board, Hero, HeroAttributeGroup, Category } from '~/src/types/api'
import immer from 'immer'
import heroThumbnail from '~/src/public/images/hero.png'
import { arrayMove } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'
import { CustomGridCollisionDetectionEvent } from '~/src/root/BoardWorkspace/useGridCollisionDetection'
import {
  CATEGORY_HERO_WIDTH,
  CATEGORY_ROW_HEIGHT,
  CATEGORY_BODY_INITIAL_HEIGHT,
  CATEGORY_BODY_INITIAL_WIDTH,
  CATEGORY_SPACING
} from '~/src/root/constants'

interface BoardWorkspaceCategoryMoveEvent {
  x: number
  y: number
}

interface BoardWorkspaceContextType {
  heroes: Hero[]
  heroAttributeGroups: HeroAttributeGroup[]
  board: Board
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (category: Category, hero: Hero) => void
  moveHero: (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void
  addCategory: () => void
  moveCategory: ({ container, translate }: { container: Category; translate: BoardWorkspaceCategoryMoveEvent }) => void
  resizeCategory: ({ container, width }: { container: Category; width: number }) => void
  deleteCategory: (category: Category) => void
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  heroes: [],
  heroAttributeGroups: [],
  board: {},
  isEditing: false,
  setIsEditing: () => {},
  addHero: () => {},
  moveHero: () => {},
  addCategory: () => {},
  deleteCategory: (category: Category) => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const heroes = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: uuid(),
        thumbnail: heroThumbnail,
        name: 'Wind Runner'
      })),
    []
  )

  const heroAttributeGroups: HeroAttributeGroup[] = useMemo(
    () => [
      {
        id: uuid(),
        name: 'Strength',
        heroes
      },
      {
        id: 2,
        name: 'Agility',
        heroes
      },
      {
        id: 3,
        name: 'Intelligence',
        heroes
      }
    ],
    [heroes]
  )

  const [isEditing, setIsEditing] = useState(false)

  const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
    const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
    const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
    const rowCount = Math.ceil(columnCount / columnsPerRow)
    return CATEGORY_ROW_HEIGHT * rowCount
  }

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

  const addHero = (category: Category, hero: Hero) => {
    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)

        boardCategory.heroes.push({
          ...hero,
          pivot: { id: uuid() }
        })

        boardCategory.height = getCategoryHeight({
          categoryWidth: boardCategory.width,
          heroCount: boardCategory.heroes.length + 1
        })
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

  const getCategoryBottom = (category: Category): number => {
    return category.y_position + category.height
  }

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
        heroes,
        heroAttributeGroups,
        board,
        isEditing,
        setIsEditing,
        addHero,
        moveHero,
        addCategory,
        moveCategory,
        resizeCategory,
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
