import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet-async'

import { theme } from '~/src/theme'
import { Container, Icon } from '~/src/components'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts'
import { CategoryBody } from './CategoryBody'
import { Category } from '~/src/types/api'

import { BOARD_WORKSPACE_ALLOWANCE } from '~/src/contexts/BoardList/constants'
import { getLowestCategoryBottom } from '~/src/contexts/BoardList/utils'

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { useGridCollisionDetection } from './useGridCollisionDetection'
import { useDragContainer } from './useDragContainer'
import { restrictWithinWorkspace } from './restrictWithinWorkspace'
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

  const workspaceRef = useRef<HTMLDivElement>()

  // Provide enough space so users are able to move around the workspace freely.
  // We're not able to achieve this via css because of how we position categories (via `position: relative`).
  const workspaceHeight = useMemo(() => {
    if (!board.categories.length) return BOARD_WORKSPACE_ALLOWANCE
    return getLowestCategoryBottom(board) + BOARD_WORKSPACE_ALLOWANCE
  }, [board])

  return (
    <Container>
      <Helmet title={`${board.name} Board`} />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        modifiers={[restrictWithinWorkspace({ workspaceRef })]}
        {...mergeEvents(dragContainerEvents, gridCollisionEvents)}>
        <Workspace ref={workspaceRef} height={workspaceHeight}>
          {board.categories.map((category) => {
            return <CategoryBody key={category.id} category={category} />
          })}
        </Workspace>
      </DndContext>
      <WorkspacePadding />
    </Container>
  )
}

const Workspace = styled.div<{ height: number }>`
  position: relative;
  height: ${(props) => props.height}px;
  z-index: ${theme.zIndex.boardWorkspace};
`

const WorkspacePadding = styled.div`
  height: 400px;
  pointer-events: none;
`

export { BoardWorkspace }
