import React, { createContext, useContext, useState } from 'react'
import { ID, Board, Hero, HeroAttributeGroup } from '~/src/types/api'
import immer from 'immer'
import heroThumbnail from '~/src/public/images/hero.png'
import { arraySwap } from '@dnd-kit/sortable'
import { v4 as uuid } from 'uuid'

interface BoardWorkspaceContextType {
  heroes: Hero[]
  heroAttributeGroups: HeroAttributeGroup[]
  board: Board
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  addHero: (categoryId: ID, hero: Hero) => void
  moveHero: (event) => void
  addCategory: () => void
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  heroes: [],
  heroAttributeGroups: [],
  board: {},
  isEditing: false,
  setIsEditing: () => {},
  addHero: () => {},
  moveHero: () => {},
  addCategory: () => {}
})

const BoardWorkspaceContextProvider: React.FC = ({ children }) => {
  const heroes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    thumbnail: heroThumbnail,
    name: 'Wind Runner'
  }))

  const heroAttributeGroups: HeroAttributeGroup[] = [
    {
      id: 1,
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
  ]

  const [isEditing, setIsEditing] = useState(false)

  const [board, setBoard] = useState<Board>({
    id: 1,
    name: 'v7.30 Patch',
    categories: [
      {
        id: 1,
        name: 'Mid Farming',
        heroes: [{ ...heroes[0] }, { ...heroes[1] }, { ...heroes[2] }]
      }
    ]
  })

  const addHero = (categoryId: ID, hero: Hero) => {
    setBoard(
      immer(board, (draft) => {
        const category = draft.categories.find((category) => category.id === categoryId)
        category.heroes.push(hero)
      })
    )
  }

  const moveHero = (event) => {
    setBoard(
      immer(board, (draft) => {
        const category = draft.categories[0]
        const { active, over } = event
        const oldIndex = category.heroes.findIndex((hero) => hero.id === active.id)
        const newIndex = category.heroes.findIndex((hero) => hero.id === over.id)
        category.heroes = arraySwap(category.heroes, oldIndex, newIndex)
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
        addCategory
      }}>
      {children}
    </BoardWorkspaceContext.Provider>
  )
}

const useBoardWorkspace = () => {
  return useContext(BoardWorkspaceContext)
}

export { BoardWorkspaceContextProvider, useBoardWorkspace }
