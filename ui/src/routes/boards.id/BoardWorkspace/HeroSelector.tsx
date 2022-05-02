import React, { useMemo } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Icon, ImageAspectRatio, SearchInput } from '~/src/components'
import { Hero, ID } from '~/src/types/api'
import { useHeroList } from '~/src/contexts/HeroList'
import { CATEGORY_HERO_ASPECT_RATIO } from '~/src/contexts/BoardList/constants'

interface Props {
  selectedHeroes: Hero[]
  onSelectHero: (hero: Hero) => void
  onClose: () => void
}

type SelectedHeroMap = Record<ID, boolean>

const HeroSelector: React.FC<Props> = ({ selectedHeroes, onSelectHero, onClose }) => {
  const { heroAttributeGroups, isLoading } = useHeroList()

  const selectedHeroesMap: SelectedHeroMap = useMemo(() => {
    return selectedHeroes.reduce((heroes, hero) => {
      heroes[hero.id] = true
      return heroes
    }, {})
  }, [selectedHeroes])

  if (isLoading) {
    return null
  }

  return (
    <HeroSelectorContainer>
      <HeroSelectorClose onClick={onClose}>
        <Icon name="x" />
      </HeroSelectorClose>

      <HeroSelectorHeading>
        <HeroSelectorHeadingText>Select Hero</HeroSelectorHeadingText>
        <SearchInput />
      </HeroSelectorHeading>

      <HeroSelectorContent>
        {heroAttributeGroups.map((attribute) => (
          <React.Fragment key={attribute.id}>
            <HeroSelectorGroupHeading>
              <HeroSelectorGroupHeadingIcon bg={getAttributeIconColor(attribute.name)}>
                <Icon name={getAttributeIcon(attribute.name)} />
              </HeroSelectorGroupHeadingIcon>
              <HeroSelectorGroupHeadingText>{attribute.name}</HeroSelectorGroupHeadingText>
            </HeroSelectorGroupHeading>

            <HeroSelectorGroupList>
              {attribute.heroes.map((hero) => (
                <HeroSelectorItem key={hero.id}>
                  <HeroSelectorItemButton
                    type="button"
                    onClick={() => onSelectHero(hero)}
                    disabled={selectedHeroesMap[hero.id]}
                    title={`Select ${hero.name}`}>
                    <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} alt={hero.name} />
                  </HeroSelectorItemButton>
                </HeroSelectorItem>
              ))}
            </HeroSelectorGroupList>
          </React.Fragment>
        ))}
      </HeroSelectorContent>
    </HeroSelectorContainer>
  )
}

const getAttributeIconColor = (name: string) => {
  switch (name) {
    case 'Strength':
      return theme.colors.red[500]
    case 'Agility':
      return theme.colors.green[500]
    case 'Intelligence':
      return theme.colors.blue[500]
    default:
      return theme.colors.neutral[500]
  }
}

const getAttributeIcon = (name: string) => {
  switch (name) {
    case 'Strength':
      return 'fire'
    case 'Agility':
      return 'lightning-bolt'
    case 'Intelligence':
      return 'academic-cap'
    default:
      return 'lightning-bolt'
  }
}

const HeroSelectorContainer = styled.div`
  position: absolute;
  top: 120px;
  left: 120px;
  width: 960px;
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;
  z-index: ${theme.zIndex.heroSelector};
`

const HeroSelectorClose = styled.button`
  position: absolute;
  right: 0;
  top: -32px;
  padding: 0;
  color: ${theme.colors.neutral[500]};
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
`

const HeroSelectorHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.neutral[700]};
`

const HeroSelectorHeadingText = styled.h4`
  margin: 0;
`

const HeroSelectorContent = styled.div`
  padding: 16px;
  height: 360px;
  overflow-y: scroll;
`

const HeroSelectorGroupHeading = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`

const HeroSelectorGroupHeadingIcon = styled.div`
  padding: 4px;
  margin-right: 12px;
  background: ${(props) => props.bg};
  border-radius: 4px;
`

const HeroSelectorGroupHeadingText = styled.h4`
  margin: 0;
`

const HeroSelectorGroupList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -4px;
  margin-right: -4px;

  &:not(:last-child) {
    margin-bottom: 48px;
  }
`

const HeroSelectorItem = styled.div`
  padding: 4px;
`

const HeroSelectorItemButton = styled.button`
  display: inline-block;
  padding: 0;
  width: 60px;
  background: transparent;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: ${theme.colors.blue[500]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

export { HeroSelector }
