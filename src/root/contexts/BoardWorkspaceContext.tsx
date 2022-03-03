import React, { createContext, useContext, useState, useMemo } from 'react'
import { ID, Board, Hero, HeroAttributeGroup, Category } from '~/src/types/api'
import immer from 'immer'
import heroThumbnail from '~/src/public/images/hero.png'
import { arrayMove } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'

interface HeroMovement {
  category: Category
  index: number
}

interface BoardWorkspaceContextType {
  heroes: Hero[]
  heroAttributeGroups: HeroAttributeGroup[]
  board: Board
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (category: Category, hero: Hero) => void
  moveHero: (from: HeroMovement, to: HeroMovement) => void
  addCategory: () => void
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
        ]
      },
      {
        id: uuid(),
        name: 'Mid Farming',
        heroes: [
          { ...heroes[0], pivot: { id: uuid() } },
          { ...heroes[1], pivot: { id: uuid() } },
          { ...heroes[2], pivot: { id: uuid() } }
        ]
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
      })
    )
  }

  // Mutably swap values array to array
  function arrayTransfer(src, dest, start, end) {
    const value = src.splice(start, 1)[0]
    dest.splice(end, 0, value)
  }

  const moveHero = (from: HeroMovement, to: HeroMovement) => {
    setBoard(
      immer(board, (draft) => {
        if (from.category.id === to.category.id) {
          const category = draft.categories.find((c) => c.id === to.category.id)
          category.heroes = arrayMove(category.heroes, from.index, to.index)
        } else {
          const fromCategory = draft.categories.find((c) => c.id === from.category.id)
          const toCategory = draft.categories.find((c) => c.id === to.category.id)
          arrayTransfer(fromCategory, toCategory, from.index, to.index)
        }
      })
    )
  }

  const addCategory = () => {
    setBoard(
      immer(board, (draft) => {
        const category = {
          id: uuid(),
          name: 'Untitled',
          heroes: []
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
