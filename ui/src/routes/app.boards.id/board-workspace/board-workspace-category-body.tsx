import React, { useCallback, useMemo, useRef, useState } from 'react'
import { cn } from 'cn'
import { Category, Hero, ID } from '~/src/types/api'
import { Icon } from '~/src/components/icon/icon'
import { BoardWorkspaceHeroSelector } from './board-workspace-hero-selector'
import { BoardWorkspaceCategoryHero } from './board-workspace-category-hero'

import { useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useBoard } from '~/src/routes/app.boards.id/board-context'
import { useAddHeroMutation, addHeroVariables } from '../mutations/use-add-hero-mutation'
import { useUpdateCategoryMutation } from '../mutations/use-update-category-mutation'
import { useResizeCategoryMutation } from '../mutations/use-resize-category-mutation'
import { useDeleteCategoryMutation } from '../mutations/use-delete-category-mutation'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'
import { BoardWorkspaceCategoryTitle } from './board-workspace-category-title'
import { BoardWorkspaceCategoryDeleteConfirm } from './board-workspace-category-delete-confirm'

import { Resizable, type ResizeCallback, type Size } from 're-resizable'
import { mergeRefs } from '~/src/utils'

import {
  CATEGORY_BODY_INITIAL_WIDTH,
  CATEGORY_HERO_HEIGHT,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_CONTAINER_TOTAL_PADDING,
  CATEGORY_HERO_X_TOTAL_PADDING,
  CATEGORY_TRAY_BORDER
} from '~/src/contexts/board-list/constants'
import { Bars2Icon, PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid'

// How long a deleted card takes to fade out. Matches the card's duration-240.
const EXIT_MS = 240

interface Props {
  category: Category
  // Resizing stops at the workspace's right edge.
  workspace: HTMLElement | null
  // The pivot id of the hero being dragged, if any.
  draggingHeroId: ID | null
  // The pivot id of a hero being dragged off every category (dropping it removes it), if any.
  removingHeroId: ID | null
}

const BoardWorkspaceCategoryBody: React.FC<Props> = ({ category, workspace, draggingHeroId, removingHeroId }) => {
  const { board, updateDraft, clearDraft } = useBoard()

  const { mutate: addHero } = useAddHeroMutation(board.id)

  const { mutate: updateCategory } = useUpdateCategoryMutation(board.id)

  const { mutate: resizeCategory } = useResizeCategoryMutation(board.id)

  const { mutate: deleteCategory } = useDeleteCategoryMutation(board.id)

  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false)

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const trashRef = useRef<HTMLButtonElement>(null)

  // Backing out hands focus back to the trash. Stable, since the confirm listens for Escape and outside clicks with it.
  // Set once Delete is pressed: the card fades out, still showing the confirm, then the delete runs.
  const [isLeaving, setIsLeaving] = useState(false)

  const handleCancelDelete = useCallback(() => {
    // Too late once it's leaving; backing out now would flash the normal card before it goes.
    if (isLeaving) return
    setIsConfirmingDelete(false)
    trashRef.current?.focus({ preventScroll: true })
  }, [isLeaving])

  // The delete drops the category from the cache, which unmounts the card. So fade it out first, with the confirm still
  // up, and delete after. With reduced motion there's nothing to wait for.
  const handleConfirmDelete = () => {
    setIsLeaving(true)
    const reducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(() => deleteCategory(category.id), reducedMotion ? 0 : EXIT_MS)
  }

  const [isResizing, setIsResizing] = useState(false)

  const handleUpdateCategoryName = (value: string) => {
    updateCategory({ id: category.id, name: value })
  }

  const [containerElement, setContainerElement] = useState<HTMLDivElement>()

  // SortableContext treats a new array as a changed list and skips the next transition,
  // so the ids must keep their identity while the heroes are unchanged.
  const heroIds = useMemo(() => category.heroes.map((hero) => hero.pivot.id), [category.heroes])

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

  // A dragged hero is previewed in whichever category it's over, so if it's in this one, a drop lands here.
  // Off every category it's being removed instead (its own red state), so no category claims it.
  const isHeroOver = draggingHeroId != null && draggingHeroId !== removingHeroId && heroIds.includes(draggingHeroId)

  // Moving, resizing, or about to receive a hero: the card swaps its dark ring for a sky one.
  const isActive = isDragging || isResizing || isHeroOver

  // While resizing: show the new size as a draft (saved when the resize stops).
  const handleResize: ResizeCallback = (_event, _direction, ref) => {
    const width = ref.getBoundingClientRect().width

    updateDraft((draft) => {
      const resized = draft.categories.find((c) => c.id === category.id)
      if (!resized) return
      resized.width = width
      resized.height = getCategoryHeight({ categoryWidth: width, heroCount: category.heroes.length })
    })
  }

  // `category` comes from the shown board, so it already has the resized width and height.
  const handleResizeStop = () => {
    setIsResizing(false)
    resizeCategory({ category_id: category.id, width: category.width, height: category.height })
    clearDraft()
  }

  return (
    <React.Fragment>
      {/*
        A layer card: a glass header over a hero tray that runs flush to its edges. The rim is an inset ring (not a
        border) so the tray can sit right on it, plus the dock's dark outer ring. The header and the Resizable must stay
        the card's first and second children: the tests' fake layout finds the tray there.
      */}
      <div
        {...attributes}
        className={cn(
          'group absolute inline-block rounded-xl bg-zinc-800/80 shadow-lg inset-ring backdrop-blur-sm transition-shadow focus-visible:ring-focus',
          isActive
            ? 'ring-2 ring-sky-500 inset-ring-white/15'
            : isConfirmingDelete
              ? 'ring-1 ring-black/50 inset-ring-red-500/30'
              : 'ring-1 ring-black/50 inset-ring-white/8 hover:inset-ring-white/15',
          isLeaving &&
            'pointer-events-none scale-96 opacity-0 transition-[box-shadow,opacity,scale] duration-240 motion-reduce:transition-none'
        )}
        // Heroes grey out while the card asks to be deleted (group-data-deleting: in the hero tile).
        data-deleting={isConfirmingDelete || undefined}
        style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
        <div className="relative flex h-9 items-center gap-2 pr-1.5 pl-2 focus-gap-zinc-800">
          <div
            ref={setDraggableNodeRef}
            {...listeners}
            title="Move category"
            className="cursor-grab text-zinc-600 transition-colors group-hover:text-zinc-300">
            <Icon icon={Bars2Icon} size={20} />
          </div>
          <BoardWorkspaceCategoryTitle value={category.name} onChange={handleUpdateCategoryName} />

          <button
            ref={trashRef}
            type="button"
            title="Delete category"
            onClick={() => setIsConfirmingDelete(true)}
            className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/8 hover:text-red-400 focus-visible:opacity-100 focus-visible:ring-focus">
            <Icon icon={TrashIcon} size={16} />
          </button>

          {isConfirmingDelete && (
            <BoardWorkspaceCategoryDeleteConfirm
              name={category.name}
              onCancel={handleCancelDelete}
              onConfirm={handleConfirmDelete}
            />
          )}
        </div>

        <Resizable
          enable={{
            top: false,
            right: !isDragging && !isConfirmingDelete,
            bottom: false,
            // Right edge only: moving the card is how its left edge changes.
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          minWidth={CATEGORY_BODY_INITIAL_WIDTH}
          bounds={workspace ?? undefined}
          // Height is left to re-resizable (auto); only width is controlled.
          size={{ width: category.width } as Size}
          onResizeStart={() => setIsResizing(true)}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          handleClasses={{ right: 'group/handle' }}
          handleComponent={{
            // A pill on the edge: grey while the card is hovered, sky on its own hover or while resizing. It stays
            // 24px tall; the card's sky ring is what marks a resize.
            right: (
              <span
                className={cn(
                  'absolute inset-x-0 top-1/2 mx-auto h-6 w-1 -translate-y-1/2 rounded-full transition-colors',
                  isResizing
                    ? 'bg-sky-500'
                    : 'bg-zinc-500 opacity-0 group-hover:opacity-100 group-hover/handle:bg-sky-500'
                )}
              />
            )
          }}>
          <div
            ref={mergeRefs<HTMLDivElement>(setDroppableNodeRef, setContainerElement)}
            className="flex flex-wrap rounded-t-lg rounded-b-xl border border-white/8 bg-zinc-900 focus-gap-zinc-900"
            // Sizes come from constants the drag-and-drop math also uses, so they stay inline. The border comes out of
            // the padding, so heroes keep their cells.
            style={{
              padding: CATEGORY_HERO_CONTAINER_TOTAL_PADDING / 2 - CATEGORY_TRAY_BORDER,
              width: category.width
            }}>
            <SortableContext items={heroIds} strategy={rectSortingStrategy}>
              {category.heroes.map((hero) => (
                <BoardWorkspaceCategoryHero
                  key={hero.pivot.id}
                  category={category}
                  hero={hero}
                  removing={hero.pivot.id === removingHeroId}
                />
              ))}
            </SortableContext>

            <div className="shrink-0" style={{ padding: CATEGORY_HERO_X_TOTAL_PADDING / 2 }}>
              <BoardWorkspaceHeroSelector
                open={isHeroSelectorOpen}
                onOpenChange={setIsHeroSelectorOpen}
                onSelectHero={(hero: Hero) => {
                  addHero(addHeroVariables(category, hero))
                }}
                trigger={
                  <button
                    className="flex cursor-pointer items-center justify-center rounded-sm border-2 border-dashed border-zinc-500 bg-zinc-700 p-2 focus-visible:ring-focus"
                    style={{ width: CATEGORY_HERO_WIDTH, height: CATEGORY_HERO_HEIGHT }}>
                    <div className="mr-2 text-zinc-500">
                      <Icon icon={PlusCircleIcon} size={16} />
                    </div>
                    <div className="text-xs font-bold tracking-wide">Add</div>
                  </button>
                }
                anchor={containerElement}
              />
            </div>
          </div>
        </Resizable>
      </div>
    </React.Fragment>
  )
}

export { BoardWorkspaceCategoryBody }
