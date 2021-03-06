import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { theme } from '~/src/theme'
import { Icon, ImageAspectRatio, SearchInput, Popover } from '~/src/components'
import { Hero } from '~/src/types/api'
import { useHeroList } from '~/src/contexts/HeroList'
import { CATEGORY_HERO_ASPECT_RATIO } from '~/src/contexts/BoardList/constants'

interface Props {
  open: boolean
  trigger: React.ReactNode
  container: HTMLDivElement
  onSelectHero: (hero: Hero) => void
  onChangeOpen: (open: boolean) => void
  dependencies?: any[]
}

const HeroSelector: React.FC<Props> = ({ open, onSelectHero, onChangeOpen, trigger, container, dependencies }) => {
  const [search, setSearch] = useState('')

  const { heroAttributeGroups, isLoading } = useHeroList()

  if (isLoading) {
    return null
  }

  const searchInput = search.toLowerCase()

  return (
    <Popover
      open={open}
      trigger={trigger}
      container={container}
      offset={{ x: 0, y: 32 }}
      placement="bottom-start"
      onChangeOpen={onChangeOpen}
      dependencies={dependencies}>
      <HeroSelectorContainer>
        <HeroSelectorClose onClick={() => onChangeOpen(false)}>
          <Icon name="x" />
        </HeroSelectorClose>

        <HeroSelectorHeading>
          <HeroSelectorHeadingText>Select Hero</HeroSelectorHeadingText>
          <SearchInput value={search} onChange={setSearch} autoFocus />
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
                {attribute.heroes.map((hero) => {
                  const name = hero.name.toLowerCase()

                  return (
                    <HeroSelectorItem key={hero.id}>
                      <HeroSelectorItemButton
                        type="button"
                        onClick={() => onSelectHero(hero)}
                        dimmed={searchInput && !name.includes(searchInput)}
                        title={`Select ${hero.name}`}>
                        <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} alt={hero.name} />
                      </HeroSelectorItemButton>
                    </HeroSelectorItem>
                  )
                })}
              </HeroSelectorGroupList>
            </React.Fragment>
          ))}
        </HeroSelectorContent>
      </HeroSelectorContainer>
    </Popover>
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
  width: 960px;
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[700]};
  border-radius: 4px;
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

const HeroSelectorGroupHeadingIcon = styled.div<{ bg: string }>`
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

const HeroSelectorItemButton = styled.button<{ dimmed: boolean }>`
  display: inline-block;
  padding: 0;
  width: 60px;
  background: transparent;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover,
  &:focus {
    border-color: ${theme.colors.blue[500]};
  }

  ${(props) =>
    props.dimmed &&
    css`
      opacity: 0.3;
    `}
`

export { HeroSelector }
