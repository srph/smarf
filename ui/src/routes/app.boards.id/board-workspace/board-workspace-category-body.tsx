import React, { useMemo, useState } from 'react'
import { Category, Hero, ID } from '~/src/types/api'
import { Icon } from '~/src/components/icon/icon'
import { DeletePopover } from '~/src/components/delete-popover/delete-popover'
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

interface Props {
  category: Category
  // Resizing stops at the workspace's right edge.
  workspace: HTMLElement | null
  // The pivot id of a hero being dragged off every category (dropping it removes it), if any.
  removingHeroId: ID | null
}

const BoardWorkspaceCategoryBody: React.FC<Props> = ({ category, workspace, removingHeroId }) => {
  const { board, updateDraft, clearDraft } = useBoard()

  const { mutate: addHero } = useAddHeroMutation(board.id)

  const { mutate: updateCategory } = useUpdateCategoryMutation(board.id)

  const { mutate: resizeCategory } = useResizeCategoryMutation(board.id)

  const { mutate: deleteCategory } = useDeleteCategoryMutation(board.id)

  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false)

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

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
        className="group absolute inline-block rounded-xl bg-zinc-800/80 shadow-lg ring-1 inset-ring ring-black/50 inset-ring-white/8 backdrop-blur-sm transition-shadow hover:inset-ring-white/15"
        style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
        <div className="relative flex h-9 items-center gap-2 pr-1.5 pl-2">
          <div
            ref={setDraggableNodeRef}
            {...listeners}
            title="Move category"
            className="cursor-grab text-zinc-600 transition-colors group-hover:text-zinc-300">
            <Icon icon={Bars2Icon} size={20} />
          </div>
          <BoardWorkspaceCategoryTitle value={category.name} onChange={handleUpdateCategoryName} />

          <div className="ml-auto">
            <DeletePopover
              open={isDeleteConfirmationOpen}
              onOpenChange={setIsDeleteConfirmationOpen}
              onConfirm={() => deleteCategory(category.id)}
              side="bottom"
              align="end"
              sideOffset={16}
              trigger={
                <button
                  title="Delete category"
                  className="grid size-7 cursor-pointer place-items-center rounded-lg text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/8 hover:text-red-400 focus-visible:opacity-100 data-popup-open:opacity-100">
                  <Icon icon={TrashIcon} size={16} />
                </button>
              }
            />
          </div>
        </div>

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
          bounds={workspace ?? undefined}
          // Height is left to re-resizable (auto); only width is controlled.
          size={{ width: category.width } as Size}
          onResize={handleResize}
          onResizeStop={handleResizeStop}>
          <div
            ref={mergeRefs<HTMLDivElement>(setDroppableNodeRef, setContainerElement)}
            className="flex flex-wrap rounded-t-lg rounded-b-xl border border-white/8 bg-zinc-900"
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
                    className="flex cursor-pointer items-center justify-center rounded border-2 border-dashed border-zinc-500 bg-zinc-700 p-2"
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
