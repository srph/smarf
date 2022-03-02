import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, Icon } from '~/src/components'
import { HeroSelector } from './HeroSelector'
import hero from '~/src/public/images/hero.png'

const BoardWorkspace: React.FC = () => {
  return (
    <Container>
      <Workspace>
        <HeroSelector />

        <div>
          <CategoryHeading>
            <CategoryHeadingInfo>
              <CategoryHeadingDragIcon>
                <Icon name="arrows-expand" />
              </CategoryHeadingDragIcon>
              <CategoryHeadingTitle>Mid Farming</CategoryHeadingTitle>
            </CategoryHeadingInfo>
          </CategoryHeading>

          <CategoryBody>
            <CategoryHero>
              <CategoryHeroImage src={hero} />
            </CategoryHero>
            <CategoryHero>
              <CategoryHeroImage src={hero} />
            </CategoryHero>
            <CategoryHero>
              <CategoryHeroImage src={hero} />
            </CategoryHero>
            <CategoryHero>
              <NewCategory>
                <NewCategoryIcon>
                  <Icon name="plus-circle" width={48} />
                </NewCategoryIcon>
                <NewCategoryText>New Hero</NewCategoryText>
              </NewCategory>
            </CategoryHero>
          </CategoryBody>
        </div>
      </Workspace>
    </Container>
  )
}

const NewCategory = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 240px;
  height: 300px;
  background: ${theme.colors.neutral[700]};
  border: 2px dashed ${theme.colors.neutral[500]};
  border-radius: 4px;
  cursor: pointer;
`

const NewCategoryIcon = styled.div`
  margin-bottom: 16px;
  color: ${theme.colors.neutral[500]};
`

const NewCategoryText = styled.div`
  color: ${theme.colors.text};
  font-weight: bold;
  letter-spacing: 0.5px;
  font-size: ${theme.fontSizes.sm};
`

const Workspace = styled.div`
  position: relative;
  padding-top: 24px;
  padding-bottom: 320px;
`

const CategoryHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`

const CategoryHeadingInfo = styled.div`
  display: flex;
  align-items: center;
`

const CategoryHeadingDragIcon = styled.div`
  margin-right: 16px;
  color: ${theme.colors.neutral[400]};
  cursor: grabbing;
`

const CategoryHeadingTitle = styled.h4`
  margin: 0;
  font-size: ${theme.fontSizes.md};
`

const CategoryBody = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 16px 8px;
  background: ${theme.colors.neutral[800]};
  border-radius: 4px;
`

const CategoryHero = styled.div`
  padding: 0 8px;
`

const CategoryHeroImage = styled.img`
  height: 300px;
  width: 240px;
  border: 2px solid transparent;
  border-radius: 4px;

  &:hover {
    border-color: ${theme.colors.blue[500]};
  }
`

export { BoardWorkspace }
