import React from 'react'
import {
  CATEGORY_HERO_CONTAINER_TOTAL_PADDING,
  CATEGORY_HERO_HEIGHT,
  CATEGORY_HERO_TOTAL_HEIGHT,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_X_TOTAL_PADDING,
  CATEGORY_TRAY_BORDER
} from '~/src/contexts/board-list/constants'
import { type Category } from '~/src/types/api'

interface Props {
  category: Category
}

/** A category on someone else's public board: the real card's look, with nothing to drag, rename, add or delete. */
const BoardVisitorCategory: React.FC<Props> = ({ category }) => (
  <section
    aria-label={category.name}
    className="absolute top-0 left-0 inline-block rounded-xl bg-zinc-800/80 shadow-lg ring-1 inset-ring ring-black/50 inset-ring-white/8 backdrop-blur-sm"
    style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
    <h2 className="flex h-9 items-center px-3 font-semibold whitespace-nowrap">{category.name}</h2>

    <ul
      className="flex flex-wrap rounded-t-lg rounded-b-xl border border-white/8 bg-zinc-900"
      style={{ padding: CATEGORY_HERO_CONTAINER_TOTAL_PADDING / 2 - CATEGORY_TRAY_BORDER, width: category.width }}>
      {category.heroes.map((hero) => (
        <li key={hero.pivot.id} className="shrink-0" style={{ padding: CATEGORY_HERO_X_TOTAL_PADDING / 2 }}>
          <img
            src={hero.thumbnail}
            alt={hero.name}
            title={hero.name}
            loading="lazy"
            draggable={false}
            className="rounded-sm bg-zinc-700 object-cover"
            style={{ width: CATEGORY_HERO_WIDTH, height: CATEGORY_HERO_HEIGHT }}
          />
        </li>
      ))}

      {!category.heroes.length && (
        <li className="flex items-center px-2 text-xs text-zinc-500" style={{ height: CATEGORY_HERO_TOTAL_HEIGHT }}>
          No heroes yet
        </li>
      )}
    </ul>
  </section>
)

export { BoardVisitorCategory }
