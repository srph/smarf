import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/root/contexts'
import { HeroSelector } from './HeroSelector'
import { CategoryHero } from './CategoryHero'
import { Board, Category, Hero, HeroCategoryPivot, ID } from '~/src/types/api'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  pointerWithin,
  CollisionDetection,
  rectIntersection,
  getFirstCollision,
  MeasuringStrategy
} from '@dnd-kit/core'

import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'

import { useGridCollisionDetection } from './useGridCollisionDetection'

const BoardWorkspace: React.FC = () => {
  const { board, addHero, moveHero, deleteCategory } = useBoardWorkspace()
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(true)

  const { collisionDetectionStrategy, ...events } = useGridCollisionDetection<Category>({
    containers: board.categories,
    containerIdTransformer: (container) => container.id,
    containerDataIdTransformer: (container) => container.heroes.map((hero) => hero.pivot.id),
    onChange: moveHero
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  return (
    <Container>
      <Workspace>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
          {...events}>
          {board.categories.map((category) => {
            return (
              <React.Fragment key={category.id}>
                <Category>
                  <CategoryHeading>
                    <CategoryHeadingInfo>
                      <CategoryHeadingDragIcon>
                        <Icon name="arrows-expand" />
                      </CategoryHeadingDragIcon>
                      <CategoryHeadingTitle>{category.name}</CategoryHeadingTitle>
                    </CategoryHeadingInfo>

                    <div>
                      <CategoryRemove onClick={() => deleteCategory(category)}>
                        <Icon name="trash" />
                      </CategoryRemove>
                    </div>
                  </CategoryHeading>

                  <CategoryBody>
                    <SortableContext
                      items={category.heroes.map((hero) => hero.pivot.id)}
                      strategy={rectSortingStrategy}>
                      {category.heroes.map((hero) => (
                        <CategoryHero key={hero.pivot.id} hero={hero} />
                      ))}
                    </SortableContext>
                    q
                    <NewHeroContainer>
                      <NewHero onClick={() => setIsHeroSelectorOpen(true)}>
                        <NewCategoryIcon>
                          <Icon name="plus-circle" width={48} />
                        </NewCategoryIcon>
                        <NewCategoryText>New Hero</NewCategoryText>
                      </NewHero>
                    </NewHeroContainer>
                  </CategoryBody>
                </Category>

                {isHeroSelectorOpen && (
                  <HeroSelector
                    selectedHeroes={category.heroes}
                    onSelectHero={(hero: Hero) => {
                      addHero(category, hero)
                      setIsHeroSelectorOpen(false)
                    }}
                    onClose={() => {
                      setIsHeroSelectorOpen(false)
                    }}
                  />
                )}
              </React.Fragment>
            )
          })}
        </DndContext>
      </Workspace>
    </Container>
  )
}

const NewHeroContainer = styled.div`
  padding: 8px;
`

const NewHero = styled.button`
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
  z-index: ${theme.zIndex.boardWorkspace};
`

const Category = styled.div`
  display: inline-block;
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

const CategoryRemove = styled.button`
  display: inline-block;
  padding: 4px;
  font-size: 12px;
  color: ${theme.colors.neutral[400]};
  background: ${theme.colors.neutral[700]};
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: 200ms opacity ease;

  &:hover,
  &:focus {
    box-shadow: 0px 0px 0px 2px ${theme.colors.blue[500]};
  }

  &:focus {
    outline: 0;
  }

  ${Category}:hover & {
    opacity: 1;
  }
`

const CategoryBody = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 16px 8px;
  background: ${theme.colors.neutral[800]};
  border-radius: 4px;
`

export { BoardWorkspace }
