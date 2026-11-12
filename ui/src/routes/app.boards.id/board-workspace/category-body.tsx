import React, { useMemo, useState } from 'react'
import { Category, Hero } from '~/src/types/api'
import { Icon } from '~/src/components/icon/icon'
import { DeletePopover } from '~/src/components/delete-popover/delete-popover'
import { HeroSelector } from './hero-selector'
import { CategoryHero } from './category-hero'

import { useDroppable, useDraggable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useBoardWorkspace } from '~/src/routes/app.boards.id/contexts/board-workspace-context'
import { CategoryTitle } from './category-title'

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
}

const CategoryBody: React.FC<Props> = ({ category }) => {
  const { addHero, updateCategory, resizeCategory, resizeCategoryEnd, deleteCategory } = useBoardWorkspace()

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

  const handleResize: ResizeCallback = (_event, _direction, ref) => {
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
      <div
        {...attributes}
        className="group absolute inline-block"
        style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div ref={setDraggableNodeRef} {...listeners} className="mr-4 cursor-grabbing text-zinc-400">
              <Icon icon={ArrowsPointingOutIcon} />
            </div>
            <CategoryTitle value={category.name} onChange={handleUpdateCategoryName} />
          </div>

          <div>
            <DeletePopover
              open={isDeleteConfirmationOpen}
              onOpenChange={setIsDeleteConfirmationOpen}
              onConfirm={() => deleteCategory(category)}
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
                <CategoryHero key={hero.pivot.id} category={category} hero={hero} />
              ))}
            </SortableContext>

            <div className="shrink-0" style={{ padding: CATEGORY_HERO_X_TOTAL_PADDING / 2 }}>
              <HeroSelector
                open={isHeroSelectorOpen}
                onOpenChange={setIsHeroSelectorOpen}
                onSelectHero={(hero: Hero) => {
                  addHero(category, hero)
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

export { CategoryBody }
