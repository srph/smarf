import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/root/contexts'
import { HeroSelector } from './HeroSelector'
import { CategoryHero } from './CategoryHero'
import { Board, Hero, HeroCategoryPivot, ID } from '~/src/types/api'

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

// { "container id": ["item id"] }
type Items = Record<ID, ID[]>

type Containers = Array<ID>

const transformBoardCategoriesToDndKitItems = (board: Board): Items => {
  return board.categories.reduce((map, category) => {
    map[category.id] = category.heroes.map((hero) => hero.pivot.id)
    return map
  }, {})
}

const transformBoardCategoriesToDndKitContainers = (board: Board): Containers => {
  return board.categories.map((category) => category.id)
}

const BoardWorkspace: React.FC = () => {
  const { board, addHero, moveHero, deleteCategory } = useBoardWorkspace()
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(true)

  const [containers, setContainers] = useState<Containers>(() => transformBoardCategoriesToDndKitContainers(board))
  const [items, setItems] = useState<Items>(() => transformBoardCategoriesToDndKitItems(board))
  const [clonedItems, setClonedItems] = useState<Items | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef<boolean>(false)

  useEffect(() => {
    setContainers(transformBoardCategoriesToDndKitContainers(board))
    setItems(transformBoardCategoriesToDndKitItems(board))
  }, [board.categories])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const findContainer = (item: ID): ID => {
    return containers.find((container) => {
      return items[container].includes(item)
    })
  }

  const handleDragEnd = ({ active, over }) => {
    const activeContainer = findContainer(active.id)

    if (!activeContainer) {
      setActiveId(null)
      return
    }

    const overId = over?.id

    if (!overId) {
      setActiveId(null)
      return
    }

    const overContainer = findContainer(overId)

    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(activeId)
      const overIndex = items[overContainer].indexOf(overId)

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
        }))

        moveHero(
          {
            category: board.categories.find((c) => c.id === activeContainer),
            index: activeIndex
          },
          {
            category: board.categories.find((c) => c.id === overContainer),
            index: overIndex
          }
        )
      }
    }

    setActiveId(null)
  }

  const handleDragOver = ({ active, over }) => {
    const overId = over?.id
    if (!overId) return
    const overContainer = findContainer(overId)
    const activeContainer = findContainer(active.id)

    if (!overContainer || !activeContainer) {
      return
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer]
        const overItems = items[overContainer]
        const overIndex = overItems.indexOf(overId)
        const activeIndex = activeItems.indexOf(active.id)

        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1

        recentlyMovedToNewContainer.current = true

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(newIndex, items[overContainer].length)
          ]
        }
      })
    }
  }

  const handleDragStart = ({ active }) => {
    setActiveId(active.id)
    setClonedItems(items)
  }

  const handleDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems)
    }

    setActiveId(null)
    setClonedItems(null)
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [board.categories])

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   * @source https://github.com/clauderic/dnd-kit/blob/6f307806c09d4a1147073bf04f7cd15b7de721fc/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx#L180
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId]

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
              )
            })[0]?.id
          }
        }

        lastOverId.current = overId

        return [{ id: overId }]
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, board.categories]
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}>
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
                    <SortableContext items={items[category.id]} strategy={rectSortingStrategy}>
                      {category.heroes.map((hero) => (
                        <CategoryHero key={hero.pivot.id} hero={hero} />
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
