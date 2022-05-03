import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Container, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/boards.id/contexts'
import { CategoryBody } from './CategoryBody'
import { Category } from '~/src/types/api'

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useGridCollisionDetection } from './useGridCollisionDetection'
import { useDragContainer } from './useDragContainer'
import { mergeEvents } from './utils'

// Board functionality
// -
const BoardWorkspace: React.FC = () => {
  const { board, moveHero, moveCategory, moveCategoryEnd } = useBoardWorkspace()

  const { collisionDetectionStrategy, ...gridCollisionEvents } = useGridCollisionDetection<Category>({
    containers: board.categories,
    containerIdTransformer: (container) => container.id,
    containerDataIdTransformer: (container) => container.heroes.map((hero) => hero.pivot.id),
    onChange: moveHero
  })

  const dragContainerEvents = useDragContainer({
    containers: board.categories,
    getContainerId: (container) => container.id,
    getContainerPosition: (container) => {
      return { x: container.x_position, y: container.y_position }
    },
    onChange: moveCategory,
    onDragEnd: moveCategoryEnd
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
          {...mergeEvents(dragContainerEvents, gridCollisionEvents)}>
          {board.categories.map((category) => {
            return <CategoryBody key={category.id} category={category} />
          })}
        </DndContext>
      </Workspace>
      <WorkspacePadding />
    </Container>
  )
}

const Workspace = styled.div`
  position: relative;
  padding-top: 24px;
  z-index: ${theme.zIndex.boardWorkspace};
`

const WorkspacePadding = styled.div`
  height: 400px;
  pointer-events: none;
`

export { BoardWorkspace }
