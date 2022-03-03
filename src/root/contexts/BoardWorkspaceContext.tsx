import React, { createContext, useContext, useState } from 'react'
import { ID, Board, Hero, HeroAttributeGroup } from '~/src/types/api'
import immer from 'immer'
import heroThumbnail from '~/src/public/images/hero.png'

interface BoardWorkspaceContextType {
  heroes: Hero[]
  heroAttributeGroups: HeroAttributeGroup[]
  board: Board
  addHero: (categoryId: ID, hero: Hero) => void
}

const BoardWorkspaceContext = createContext<BoardWorkspaceContextType>({
  heroes: [],
  heroAttributeGroups: [],
  board: {},
  addHero: () => {}
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

  return (
    <BoardWorkspaceContext.Provider
      value={{
        heroes,
        heroAttributeGroups,
        board,
        addHero
      }}>
      {children}
    </BoardWorkspaceContext.Provider>
  )
}

const useBoardWorkspace = () => {
  return useContext(BoardWorkspaceContext)
}

export { BoardWorkspaceContextProvider, useBoardWorkspace }
