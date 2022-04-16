import React, { useState } from 'react'
import styled from 'styled-components'

import { theme } from '~/src/theme'
import { Category, Hero } from '~/src/types/api'
import { Icon } from '~/src/components'
import { HeroSelector } from './HeroSelector'
import { CategoryHero } from './CategoryHero'

import { useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useBoardWorkspace } from '~/src/root/contexts'
import { Translate } from './useDragContainer'

import { Resizable } from 're-resizable'

import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_HERO_HEIGHT, CATEGORY_HERO_WIDTH } from '~/src/root/constants'

interface Props {
  category: Category
}

const CategoryBody: React.FC<Props> = ({ category }) => {
  const { addHero, resizeCategory, deleteCategory } = useBoardWorkspace()
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false)

  // This is important to allow an item to be dropped to an empty category
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: category.id
  })

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef: setDraggableNodeRef
  } = useDraggable({
    id: category.id
  })

  const handleResize = (e, dir, ref) => {
    resizeCategory({
      container: category,
      width: ref.getBoundingClientRect().width
    })
  }

  return (
    <React.Fragment>
      <CategoryContainer {...attributes} x={category.x_position} y={category.y_position}>
        <CategoryHeading>
          <CategoryHeadingInfo>
            <CategoryHeadingDragIcon ref={setDraggableNodeRef} {...listeners}>
              <Icon name="arrows-expand" />
            </CategoryHeadingDragIcon>
            <CategoryHeadingTitle>
              {category.name} ({category.width} x {category.height}) ({isDragging ? 'Dragging' : 'No'})
            </CategoryHeadingTitle>
          </CategoryHeadingInfo>

          <div>
            <CategoryRemove onClick={() => deleteCategory(category)}>
              <Icon name="trash" />
            </CategoryRemove>
          </div>
        </CategoryHeading>

        <Resizable
          enable={{
            top: false,
            right: !isDragging,
            bottom: false,
            left: !isDragging,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          minWidth={CATEGORY_BODY_INITIAL_WIDTH}
          size={{ width: category.width, height: category.height }}
          onResize={handleResize}>
          <Body ref={setDroppableNodeRef} width={category.width}>
            <SortableContext items={category.heroes.map((hero) => hero.pivot.id)} strategy={rectSortingStrategy}>
              {category.heroes.map((hero) => (
                <CategoryHero key={hero.pivot.id} category={category} hero={hero} />
              ))}
            </SortableContext>

            <NewHeroContainer>
              <NewHero onClick={() => setIsHeroSelectorOpen(true)}>
                <NewCategoryIcon>
                  <Icon name="plus-circle" width={48} />
                </NewCategoryIcon>
                <NewCategoryText>New Hero</NewCategoryText>
              </NewHero>
            </NewHeroContainer>
          </Body>
        </Resizable>
      </CategoryContainer>

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
}

const NewHeroContainer = styled.div`
  padding: 8px;
  flex-shrink: 0;
`

const NewHero = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: ${CATEGORY_HERO_WIDTH}px;
  height: ${CATEGORY_HERO_HEIGHT}px;
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

const Body = styled.div<{ width: number }>`
  display: inline-flex;
  flex-wrap: wrap;
  padding: 16px 8px;
  background: ${theme.colors.neutral[800]};
  border-radius: 4px;

  width: ${(props) => props.width}px;
`

const CategoryContainer = styled.div<Translate>`
  --translate-x: ${(props) => props.x}px;
  --translate-y: ${(props) => props.y}px;
  display: inline-block;
  position: absolute;
  transform: translate3d(var(--translate-x, 0), var(--translate-y, 0), 0);
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

  ${CategoryContainer}:hover & {
    opacity: 1;
  }
`

export { CategoryBody }
