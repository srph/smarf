import React, { useState } from 'react'
import styled from 'styled-components'

import { theme } from '~/src/theme'
import { Category, Hero } from '~/src/types/api'
import { Icon, DeletePopover } from '~/src/components'
import { HeroSelector } from './HeroSelector'
import { CategoryHero } from './CategoryHero'

import { useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'
import { Translate } from './useDragContainer'

import { Resizable } from 're-resizable'
import { mergeRefs } from '~/src/utils'

import {
  CATEGORY_BODY_INITIAL_WIDTH,
  CATEGORY_HERO_HEIGHT,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_CONTAINER_TOTAL_PADDING,
  CATEGORY_HERO_X_TOTAL_PADDING
} from '~/src/contexts/BoardList/constants'

interface Props {
  category: Category
}

const CategoryBody: React.FC<Props> = ({ category }) => {
  const { addHero, resizeCategory, resizeCategoryEnd, deleteCategory } = useBoardWorkspace()

  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false)

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const handleToggleDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(!isDeleteConfirmationOpen)
  }

  const handleDismissDeleteConfirmation = () => {
    setIsDeleteConfirmationOpen(false)
  }

  const [containerElement, setContainerElement] = useState<HTMLDivElement>()

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

  const handleResizeStop = () => {
    resizeCategoryEnd({
      container: category
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
            <CategoryHeadingTitle>{category.name}</CategoryHeadingTitle>
          </CategoryHeadingInfo>

          <div>
            <DeletePopover
              open={isDeleteConfirmationOpen}
              onConfirm={() => deleteCategory(category)}
              onDismiss={handleDismissDeleteConfirmation}
              offset={{ x: 0, y: 16 }}
              placement="top-end"
              trigger={({ ref }) => (
                <CategoryRemove
                  ref={ref}
                  onClick={handleToggleDeleteConfirmation}
                  isConfirming={isDeleteConfirmationOpen}>
                  <Icon name="trash" />
                </CategoryRemove>
              )}
            />
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
          size={{ width: category.width }}
          onResize={handleResize}
          onResizeStop={handleResizeStop}>
          <Body ref={mergeRefs<HTMLDivElement>(setDroppableNodeRef, setContainerElement)} width={category.width}>
            <SortableContext items={category.heroes.map((hero) => hero.pivot.id)} strategy={rectSortingStrategy}>
              {category.heroes.map((hero) => (
                <CategoryHero key={hero.pivot.id} category={category} hero={hero} />
              ))}
            </SortableContext>

            <HeroSelector
              open={isHeroSelectorOpen}
              onSelectHero={(hero: Hero) => {
                addHero(category, hero)
              }}
              onChangeOpen={() => {
                setIsHeroSelectorOpen(false)
              }}
              trigger={
                <NewHeroContainer>
                  <NewHero onClick={() => setIsHeroSelectorOpen(!isHeroSelectorOpen)}>
                    <NewCategoryIcon>
                      <Icon name="plus-circle" width={16} />
                    </NewCategoryIcon>
                    <NewCategoryText>Add</NewCategoryText>
                  </NewHero>
                </NewHeroContainer>
              }
              container={containerElement}
              dependencies={[category.height]}
            />
          </Body>
        </Resizable>
      </CategoryContainer>
    </React.Fragment>
  )
}

const NewHeroContainer = styled.div`
  padding: ${CATEGORY_HERO_X_TOTAL_PADDING / 2}px;
  flex-shrink: 0;
`

const NewHero = styled.button`
  display: flex;
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
  margin-right: 8px;
  color: ${theme.colors.neutral[500]};
`

const NewCategoryText = styled.div`
  color: ${theme.colors.text};
  font-weight: bold;
  letter-spacing: 0.5px;
  font-size: ${theme.fontSizes.sm}px;
`

const Body = styled.div<{ width: number }>`
  display: inline-flex;
  flex-wrap: wrap;
  padding: ${CATEGORY_HERO_CONTAINER_TOTAL_PADDING / 2}px;
  background: ${theme.colors.neutral[800]};
  border-radius: 4px;

  width: ${(props) => props.width}px;
`

const CategoryContainer = styled.div<Translate>`
  position: absolute;
  --translate-x: ${(props) => props.x}px;
  --translate-y: ${(props) => props.y}px;
  display: inline-block;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
`

const CategoryRemove = styled.button<{ isConfirming: boolean }>`
  display: inline-block;
  padding: 4px;
  font-size: 12px;
  color: ${theme.colors.neutral[400]};
  background: ${theme.colors.neutral[700]};
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  ${(props) => (props.isConfirming ? 'opacity: 1;' : 'opacity: 0;')};
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
