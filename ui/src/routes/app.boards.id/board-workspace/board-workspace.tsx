import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { theme } from '~/src/theme'
import { Container } from '~/src/components/container/container'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts/board-workspace-context'
import { CategoryBody } from './category-body'
import { Category } from '~/src/types/api'

import { BOARD_WORKSPACE_ALLOWANCE } from '~/src/contexts/board-list/constants'
import { getLowestCategoryBottom } from '~/src/contexts/board-list/utils'

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useGridCollisionDetection } from './use-grid-collision-detection'
import { useDragContainer } from './use-drag-container'
import { restrictWithinWorkspace } from './restrict-within-workspace'
import { mergeEvents } from './utils'

// Module-level so they keep their identity across renders (the drag hooks memoize on them).
const getCategoryId = (category: Category) => category.id
const getCategoryHeroIds = (category: Category) => category.heroes.map((hero) => hero.pivot.id)
const getCategoryPosition = (category: Category) => ({ x: category.x_position, y: category.y_position })

const BoardWorkspace: React.FC = () => {
  const { board, moveHero, moveCategory, moveCategoryEnd } = useBoardWorkspace()

  const { collisionDetectionStrategy, ...gridCollisionEvents } = useGridCollisionDetection<Category>({
    containers: board.categories,
    containerIdTransformer: getCategoryId,
    containerDataIdTransformer: getCategoryHeroIds,
    onChange: moveHero
  })

  const dragContainerEvents = useDragContainer({
    containers: board.categories,
    getContainerId: getCategoryId,
    getContainerPosition: getCategoryPosition,
    onChange: moveCategory,
    onDragEnd: moveCategoryEnd
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const workspaceRef = useRef<HTMLDivElement>(null)

  // Provide enough space so users are able to move around the workspace freely.
  // We're not able to achieve this via css because of how we position categories (via `position: relative`).
  const workspaceHeight = useMemo(() => {
    if (!board.categories.length) return BOARD_WORKSPACE_ALLOWANCE
    return getLowestCategoryBottom(board) + BOARD_WORKSPACE_ALLOWANCE
  }, [board])

  return (
    <Container>
      <PageTitle title={`${board.name} Board`} />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        // The modifier reads workspaceRef while dragging, not during render.
        // oxlint-disable-next-line react/refs
        modifiers={[restrictWithinWorkspace({ workspaceRef })]}
        {...mergeEvents(dragContainerEvents, gridCollisionEvents)}>
        <Workspace ref={workspaceRef} $height={workspaceHeight}>
          {board.categories.map((category) => {
            return <CategoryBody key={category.id} category={category} />
          })}
        </Workspace>
      </DndContext>
      <WorkspacePadding />
    </Container>
  )
}

const Workspace = styled.div<{ $height: number }>`
  position: relative;
  height: ${(props) => props.$height}px;
  z-index: ${theme.zIndex.boardWorkspace};
`

const WorkspacePadding = styled.div`
  height: 400px;
  pointer-events: none;
`

export { BoardWorkspace }
