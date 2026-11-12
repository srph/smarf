import React, { useMemo, useRef } from 'react'
import { Container } from '~/src/components/container/container'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useQueryClient } from '@tanstack/react-query'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { useBoardDraft } from '~/src/routes/app.boards.id/board-draft-context'
import { useMoveHeroMutation, moveHeroVariables, type HeroPosition } from '../queries/use-move-hero-mutation'
import { useMoveCategoryMutation } from '../queries/use-move-category-mutation'
import { CategoryBody } from './category-body'
import { Board, Category } from '~/src/types/api'
import { Translate } from '~/src/types/board-operations'

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
  const { board, setDraft } = useBoardDraft()

  const queryClient = useQueryClient()

  const { mutate: moveHero } = useMoveHeroMutation(board.id)

  const { mutate: moveCategory } = useMoveCategoryMutation(board.id)

  // The cached board, read when called: a drag can fire several moves before React re-renders with the last one.
  const getSavedBoard = () => queryClient.getQueryData<Board>(boardKeys.detail(board.id))

  const handleMoveHero = (from: HeroPosition, to: HeroPosition) => {
    const savedBoard = getSavedBoard()
    const variables = savedBoard && moveHeroVariables(savedBoard, from, to)
    if (variables) moveHero(variables)
  }

  // While dragging a category: show its position as a draft (saved on drop).
  const handleMoveCategory = ({ container, translate: { x, y } }: { container: Category; translate: Translate }) => {
    const saved = getSavedBoard()?.categories.find((c) => c.id === container.id)

    // Back where it started (e.g. a cancelled drag): nothing to show.
    if (saved && saved.x_position === x && saved.y_position === y) {
      setDraft(null)
      return
    }

    setDraft({ id: container.id, x_position: x, y_position: y })
  }

  // On drop: `container` comes from the shown board, so it already has the dragged position.
  const handleMoveCategoryEnd = ({ container }: { container: Category }) => {
    moveCategory({ category_id: container.id, x_position: container.x_position, y_position: container.y_position })
    setDraft(null)
  }

  const { collisionDetectionStrategy, ...gridCollisionEvents } = useGridCollisionDetection<Category>({
    containers: board.categories,
    containerIdTransformer: getCategoryId,
    containerDataIdTransformer: getCategoryHeroIds,
    onChange: handleMoveHero
  })

  const dragContainerEvents = useDragContainer({
    containers: board.categories,
    getContainerId: getCategoryId,
    getContainerPosition: getCategoryPosition,
    onChange: handleMoveCategory,
    onDragEnd: handleMoveCategoryEnd
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
        <div ref={workspaceRef} className="relative z-(--z-board-workspace)" style={{ height: workspaceHeight }}>
          {board.categories.map((category) => {
            return <CategoryBody key={category.id} category={category} />
          })}
        </div>
      </DndContext>
      <div className="pointer-events-none h-100" />
    </Container>
  )
}

export { BoardWorkspace }
