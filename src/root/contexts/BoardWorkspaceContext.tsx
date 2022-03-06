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
  CATEGORY_SPACING,
  CATEGORY_HERO_TOTAL_WIDTH,
  CATEGORY_HERO_TOTAL_HEIGHT
} from '~/src/root/constants'

interface BoardWorkspaceCategoryMoveEvent {
  x: number
  y: number
  // width: number
  // height: number
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
        height: CATEGORY_BODY_INITIAL_HEIGHT
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
        y_position: CATEGORY_BODY_INITIAL_HEIGHT + CATEGORY_SPACING,
        width: CATEGORY_BODY_INITIAL_WIDTH,
        height: CATEGORY_BODY_INITIAL_HEIGHT
      }
    ]
  }))

  const shouldDecreaseWidth = (category: Category) => {
    return true
    const CATEGORY_BODY_PLACEHOLDERS = 2 // The "new" placeholder + new hero removed from the card
    return category.width / (CATEGORY_HERO_WIDTH * (category.heroes.length + CATEGORY_BODY_PLACEHOLDERS)) > 1
  }

  const shouldDecreaseHeight = (category: Category) => {
    const CATEGORY_BODY_PLACEHOLDERS = 2 // The "new" placeholder + new hero removed from the card
    return category.width / (CATEGORY_HERO_WIDTH * (category.heroes.length + CATEGORY_BODY_PLACEHOLDERS)) > 1
  }

  const shouldIncreaseHeight = (category: Category) => {
    const CATEGORY_BODY_PLACEHOLDERS = 2 // The "new" placeholder + new hero added to the card
    return category.width / (CATEGORY_HERO_WIDTH * (category.heroes.length + CATEGORY_BODY_PLACEHOLDERS)) < 1
  }

  const addHero = (category: Category, hero: Hero) => {
    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)

        boardCategory.heroes.push({
          ...hero,
          pivot: { id: uuid() }
        })

        if (shouldIncreaseHeight(category)) {
          boardCategory.height += CATEGORY_ROW_HEIGHT
        }
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

          // This is only used so we can accurately position the new category
          // Let's increase the height of the new category if needed.

          if (shouldDecreaseHeight(fromCategory)) {
            fromCategory.height -= CATEGORY_ROW_HEIGHT
          }

          if (shouldDecreaseWidth(fromCategory)) {
            fromCategory.width -= CATEGORY_HERO_TOTAL_WIDTH
          }

          if (shouldIncreaseHeight(toCategory)) {
            toCategory.height += CATEGORY_ROW_HEIGHT
          }

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

  const addCategory = () => {
    const lowestCategory = [...board.categories].sort((a, b) => {
      return b.y_position - a.y_position
    })[0]

    // Bottom position + allowance
    const yPosition = lowestCategory.y_position + lowestCategory.height + CATEGORY_SPACING

    setBoard(
      immer(board, (draft) => {
        const category = {
          id: uuid(),
          name: 'Untitled',
          heroes: [],
          x_position: 0,
          y_position: yPosition,
          width: CATEGORY_BODY_INITIAL_WIDTH,
          height: CATEGORY_BODY_INITIAL_HEIGHT
        }

        draft.categories.push(category)
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
