import React, { useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Container } from '~/src/components/container/container'
import { PageTitle } from '~/src/components/page-title/page-title'
import { useQueryClient } from '@tanstack/react-query'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { useBoard } from '~/src/routes/app.boards.id/board-context'
import {
  useMoveHeroMutation,
  moveHeroVariables,
  applyMoveHero,
  type HeroPosition
} from '../mutations/use-move-hero-mutation'
import { useMoveCategoryMutation } from '../mutations/use-move-category-mutation'
import { useRemoveHeroMutation, removeHeroVariables } from '../mutations/use-remove-hero-mutation'
import { BoardWorkspaceCategoryBody } from './board-workspace-category-body'
import { BoardWorkspaceDropPoof } from './board-workspace-drop-poof'
import { Board, Category } from '~/src/types/api'
import { Translate } from '~/src/types/board-operations'

import {
  BOARD_WORKSPACE_ALLOWANCE,
  CATEGORY_EDGE_REACH,
  CATEGORY_HEADING_REACH
} from '~/src/contexts/board-list/constants'
import { clampCategoryPosition, getLowestCategoryBottom } from '~/src/contexts/board-list/utils'

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, MeasuringStrategy } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useBoardWorkspaceGridCollisionDetection } from './use-board-workspace-grid-collision-detection'
import { useBoardWorkspaceDragContainer } from './use-board-workspace-drag-container'
import { boardWorkspaceRestrict } from './board-workspace-restrict'
import { mergeEvents } from './board-workspace-utils'

// Module-level so they keep their identity across renders (the drag hooks memoize on them).
const getCategoryId = (category: Category) => category.id
const getCategoryHeroIds = (category: Category) => category.heroes.map((hero) => hero.pivot.id)
const getCategoryPosition = (category: Category) => ({ x: category.x_position, y: category.y_position })
const CATEGORY_REACH = { top: CATEGORY_HEADING_REACH, edge: CATEGORY_EDGE_REACH }

const BoardWorkspace: React.FC = () => {
  const { board, updateDraft, clearDraft } = useBoard()

  const queryClient = useQueryClient()

  const { mutate: moveHero } = useMoveHeroMutation(board.id)

  const { mutate: moveCategory } = useMoveCategoryMutation(board.id)

  const { mutate: removeHero } = useRemoveHeroMutation(board.id)

  // The cached board, read when called: a drag can fire several moves before React re-renders with the last one.
  const getSavedBoard = () => queryClient.getQueryData<Board>(boardKeys.detail(board.id))

  // While dragging a hero into another category: show it there (saved on drop).
  const handleHeroMove = (from: HeroPosition, to: HeroPosition) =>
    updateDraft((draft) => {
      const variables = moveHeroVariables(draft, from, to)
      if (variables) applyMoveHero(draft, variables)
    })

  // On drop: one save, from where the hero started on the cached board to where it ended up.
  const handleHeroDrop = (start: HeroPosition, end: HeroPosition) => {
    const savedBoard = getSavedBoard()
    const variables = savedBoard && moveHeroVariables(savedBoard, start, end)
    if (variables) moveHero(variables)
    clearDraft()
  }

  // A poof for each hero dropped off every category, until its animation ends.
  const [poofs, setPoofs] = useState<{ id: number; x: number; y: number }[]>([])
  const nextPoofId = useRef(0)
  const reduceMotion = useReducedMotion()

  // Dropped off every category: remove the hero from where it started on the cached board.
  const handleHeroRemove = (start: HeroPosition, at: { x: number; y: number } | null) => {
    const savedBoard = getSavedBoard()
    const variables = savedBoard && removeHeroVariables(savedBoard, start)
    if (variables) removeHero(variables)
    clearDraft()
    if (variables && at && !reduceMotion) setPoofs((p) => [...p, { id: nextPoofId.current++, ...at }])
  }

  // While dragging a category: show its position as a draft (saved on drop).
  const handleMoveCategory = ({ container, translate: { x, y } }: { container: Category; translate: Translate }) => {
    const saved = getSavedBoard()?.categories.find((c) => c.id === container.id)

    // Back where it started (e.g. a cancelled drag): nothing to show.
    if (saved && saved.x_position === x && saved.y_position === y) {
      clearDraft()
      return
    }

    updateDraft((draft) => {
      const category = draft.categories.find((c) => c.id === container.id)
      if (!category) return
      category.x_position = x
      category.y_position = y
    })
  }

  // On drop: `container` comes from the shown board, so it already has the dragged position.
  const handleMoveCategoryEnd = ({ container }: { container: Category }) => {
    moveCategory({ category_id: container.id, x_position: container.x_position, y_position: container.y_position })
    clearDraft()
  }

  const { collisionDetectionStrategy, activeId, removingId, ...gridCollisionEvents } =
    useBoardWorkspaceGridCollisionDetection<Category>({
      containers: board.categories,
      containerIdTransformer: getCategoryId,
      containerDataIdTransformer: getCategoryHeroIds,
      onMove: handleHeroMove,
      onDrop: handleHeroDrop,
      onCancel: clearDraft,
      onRemove: handleHeroRemove,
      containerReach: CATEGORY_REACH,
      // Start every hero drag with a draft (a copy of the cached board). Clearing it on drop then re-renders the
      // board in the same batch as dnd-kit's own drop reset, so a reorder never shows the old order for a frame.
      onStart: () => updateDraft(() => {})
    })

  // The workspace element, kept in state so categories can bound their resizing by it.
  const [workspace, setWorkspace] = useState<HTMLDivElement | null>(null)

  // Keep the whole category inside the workspace, not just its drag handle (which is all dnd-kit measures).
  const clampCategory = (category: Category, position: Translate) =>
    workspace
      ? clampCategoryPosition(position, {
          categoryWidth: category.width,
          workspaceWidth: workspace.getBoundingClientRect().width
        })
      : position

  const dragContainerEvents = useBoardWorkspaceDragContainer({
    containers: board.categories,
    getContainerId: getCategoryId,
    getContainerPosition: getCategoryPosition,
    clamp: clampCategory,
    onChange: handleMoveCategory,
    onDragEnd: handleMoveCategoryEnd
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Provide enough space so users are able to move around the workspace freely.
  // We're not able to achieve this via css because of how we position categories (via `position: relative`).
  const workspaceHeight = useMemo(() => {
    if (!board.categories.length) return BOARD_WORKSPACE_ALLOWANCE
    return getLowestCategoryBottom(board) + BOARD_WORKSPACE_ALLOWANCE
  }, [board])

  return (
    // Clips the dots sideways, so they reach the window's edges without a horizontal scrollbar.
    <div className="overflow-x-clip">
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
          modifiers={[boardWorkspaceRestrict({ workspace })]}
          {...mergeEvents(dragContainerEvents, gridCollisionEvents)}>
          {/*
          A dot grid to line categories up by eye: faint dots every 16px, and a brighter dot every 64px. Both grids have
          a dot on the workspace's top-left corner, where category positions start. The dots fill the page from under
          the navigation to the bottom, edge to edge: the layer reaches 48px up (the navigation's margin), 400px down
          (the spacer below) and 2048px to each side. The 64px grid sits at (-32px, 16px): -32px puts a dot on a tile
          corner, and the 48px down makes up for the layer starting 48px above the workspace.
        */}
          <div
            ref={setWorkspace}
            className="relative z-(--z-board-workspace) before:pointer-events-none before:absolute before:-inset-x-512 before:-top-12 before:-bottom-100 before:-z-10 before:bg-[radial-gradient(circle,var(--color-zinc-500)_1.5px,transparent_1.5px),radial-gradient(circle,color-mix(in_oklab,var(--color-zinc-800),var(--color-zinc-700)_40%)_1px,transparent_1px)] before:bg-size-[64px_64px,16px_16px] before:bg-position-[-32px_16px,-8px_-8px]"
            style={{ height: workspaceHeight }}>
            {board.categories.map((category) => {
              return (
                <BoardWorkspaceCategoryBody
                  key={category.id}
                  category={category}
                  workspace={workspace}
                  draggingHeroId={activeId}
                  removingHeroId={removingId}
                />
              )
            })}
          </div>
        </DndContext>
        {poofs.map((poof) => (
          <BoardWorkspaceDropPoof
            key={poof.id}
            x={poof.x}
            y={poof.y}
            onDone={() => setPoofs((p) => p.filter((other) => other.id !== poof.id))}
          />
        ))}
        <div className="pointer-events-none h-100" />
      </Container>
    </div>
  )
}

export { BoardWorkspace }
