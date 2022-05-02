import React, { createContext, useContext, useMemo } from 'react'
import { useAuthUser } from '~/src/contexts/AuthUser'
import { useQuery } from '~/src/contexts/Query'
import { Hero, HeroAttributeGroup } from '~/src/types/api'

interface HeroListContextType {
  heroes: Hero[]
  heroAttributeGroups: HeroAttributeGroup[]
  isLoading: boolean
}

const HeroListContext = createContext<HeroListContextType>({
  heroes: [],
  heroAttributeGroups: [],
  isLoading: false
})

const HeroListProvider: React.FC = ({ children }) => {
  const { token } = useAuthUser()

  const { data: heroData, isLoading } = useQuery('/heroes', {
    enabled: Boolean(token)
  })

  const heroes = heroData?.heroes || []

  const heroAttributeGroups: HeroAttributeGroup[] = useMemo(
    () => [
      {
        id: 1,
        name: 'Strength',
        heroes: heroes.filter((hero) => hero.attribute === 'strength')
      },
      {
        id: 2,
        name: 'Agility',
        heroes: heroes.filter((hero) => hero.attribute === 'agility')
      },
      {
        id: 3,
        name: 'Intelligence',
        heroes: heroes.filter((hero) => hero.attribute === 'intelligence')
      }
    ],
    [heroes]
  )
  return (
    <HeroListContext.Provider
      value={{
        heroes,
        heroAttributeGroups,
        isLoading
      }}>
      {children}
    </HeroListContext.Provider>
  )
}

const useHeroList = () => {
  return useContext(HeroListContext)
}

export { HeroListProvider, useHeroList }
