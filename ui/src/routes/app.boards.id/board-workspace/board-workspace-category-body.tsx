import React, { useMemo, useState } from 'react'
import { Category, Hero } from '~/src/types/api'
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
  CATEGORY_HERO_X_TOTAL_PADDING
} from '~/src/contexts/board-list/constants'
import { ArrowsPointingOutIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/20/solid'

interface Props {
  category: Category
  // Resizing stops at the workspace's right edge.
  workspace: HTMLElement | null
}

const BoardWorkspaceCategoryBody: React.FC<Props> = ({ category, workspace }) => {
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
      <div
        {...attributes}
        className="group absolute inline-block"
        style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div ref={setDraggableNodeRef} {...listeners} className="mr-4 cursor-grabbing text-zinc-400">
              <Icon icon={ArrowsPointingOutIcon} />
            </div>
            <BoardWorkspaceCategoryTitle value={category.name} onChange={handleUpdateCategoryName} />
          </div>

          <div>
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
                  className="inline-block cursor-pointer rounded bg-zinc-700 p-1 text-zinc-400 opacity-0 ring-sky-500 transition-opacity duration-200 group-hover:opacity-100 hover:ring-2 focus:ring-2 focus:outline-none data-popup-open:opacity-100">
                  <Icon icon={TrashIcon} />
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
            className="inline-flex flex-wrap rounded bg-zinc-800"
            // Sizes come from constants the drag-and-drop math also uses, so they stay inline.
            style={{ padding: CATEGORY_HERO_CONTAINER_TOTAL_PADDING / 2, width: category.width }}>
            <SortableContext items={heroIds} strategy={rectSortingStrategy}>
              {category.heroes.map((hero) => (
                <BoardWorkspaceCategoryHero key={hero.pivot.id} category={category} hero={hero} />
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
