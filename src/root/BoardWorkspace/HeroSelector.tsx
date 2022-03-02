import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Icon, SearchInput } from '~/src/components'
import hero from '~/src/public/images/hero.png'

const HeroSelector: React.FC = () => {
  const heroes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    thumbnail: hero,
    name: 'Wind Runner'
  }))

  const groups = [
    {
      id: 1,
      title: 'Strength',
      heroes
    },
    {
      id: 2,
      title: 'Agility',
      heroes
    },
    {
      id: 3,
      title: 'Intelligence',
      heroes
    }
  ]

  return (
    <HeroSelectorContainer>
      <HeroSelectorClose>
        <Icon name="x" />
      </HeroSelectorClose>

      <HeroSelectorHeading>
        <HeroSelectorHeadingText>Select Hero</HeroSelectorHeadingText>
        <SearchInput />
      </HeroSelectorHeading>

      <HeroSelectorContent>
        {groups.map((group) => (
          <React.Fragment key={group.id}>
            <HeroSelectorGroupHeading>
              <HeroSelectorGroupHeadingIcon>
                <Icon name="translate" />
              </HeroSelectorGroupHeadingIcon>
              <HeroSelectorGroupHeadingText>{group.title}</HeroSelectorGroupHeadingText>
            </HeroSelectorGroupHeading>

            <HeroSelectorGroupList>
              {group.heroes.map((hero) => (
                <HeroSelectorItem key={hero.id}>
                  <HeroSelectorItemButton type="button">
                    <HeroSelectorItemImg src={hero.thumbnail} />
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
  background: ${theme.colors.neutral[500]};
  border-radius: 4px;
`

const HeroSelectorGroupHeadingText = styled.h4`
  margin: 0;
`

const HeroSelectorGroupList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -8px;
  margin-right: -8px;

  &:not(:last-child) {
    margin-bottom: 48px;
  }
`

const HeroSelectorItem = styled.div`
  padding: 8px;
`

const HeroSelectorItemButton = styled.button`
  display: inline-block;
  padding: 0;
  background: transparent;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover,
  &:focus {
    border-color: ${theme.colors.blue[500]};
  }
`

const HeroSelectorItemImg = styled.img`
  width: 40px;
  height: 50px;
`

export { HeroSelector }
