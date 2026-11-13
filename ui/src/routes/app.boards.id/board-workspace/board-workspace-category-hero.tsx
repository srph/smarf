import React from 'react'
import { cn } from 'cn'
import { TrashIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { ImageAspectRatio } from '~/src/components/image-aspect-ratio/image-aspect-ratio'
import { useSortable } from '@dnd-kit/sortable'
import { Category, HeroCategoryPivot } from '~/src/types/api'
import { CSS } from '@dnd-kit/utilities'
import {
  CATEGORY_HERO_ASPECT_RATIO,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_X_TOTAL_PADDING
} from '~/src/contexts/board-list/constants'

interface Props {
  category: Category
  hero: HeroCategoryPivot
  // Being dragged, off every category: dropping it now removes it.
  removing?: boolean
}

const BoardWorkspaceCategoryHero: React.FC<Props> = ({ hero, removing = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hero.pivot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Sizes come from constants the drag-and-drop math also uses, so they stay inline.
    padding: CATEGORY_HERO_X_TOTAL_PADDING / 2
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="shrink-0">
      <div className="relative" style={{ width: CATEGORY_HERO_WIDTH }}>
        {/* Off a category: a red outline with a gap, so it reads around the portrait rather than on it. */}
        <div
          className={cn(
            'overflow-hidden rounded ring-sky-500',
            removing ? 'outline-3 outline-offset-3 outline-red-500' : 'hover:ring-2'
          )}>
          {/* Greyed out while its category asks to be deleted (the card sets data-deleting). */}
          <div
            className={cn(
              'transition-[opacity,filter] duration-150 group-data-deleting:opacity-35 group-data-deleting:grayscale',
              removing && 'opacity-75 grayscale'
            )}>
            <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} />
          </div>
        </div>

        {/* Centered on the outline's top edge. */}
        {removing && (
          <span className="absolute -top-4 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-red-500 text-white ring-2 ring-zinc-900">
            <Icon icon={TrashIcon} size={14} />
          </span>
        )}
      </div>
    </div>
  )
}

export { BoardWorkspaceCategoryHero }
