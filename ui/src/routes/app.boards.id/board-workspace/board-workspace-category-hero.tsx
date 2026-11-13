import React from 'react'
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
}

const BoardWorkspaceCategoryHero: React.FC<Props> = ({ hero }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hero.pivot.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Sizes come from constants the drag-and-drop math also uses, so they stay inline.
    padding: CATEGORY_HERO_X_TOTAL_PADDING / 2
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="shrink-0">
      <div className="overflow-hidden rounded ring-sky-500 hover:ring-2" style={{ width: CATEGORY_HERO_WIDTH }}>
        <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} />
      </div>
    </div>
  )
}

export { BoardWorkspaceCategoryHero }
