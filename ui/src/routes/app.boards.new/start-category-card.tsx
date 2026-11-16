import React from 'react'
import { cn } from 'cn'
import { Bars2Icon, PlusCircleIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import {
  CATEGORY_HERO_CONTAINER_TOTAL_PADDING,
  CATEGORY_HERO_HEIGHT,
  CATEGORY_HERO_WIDTH,
  CATEGORY_HERO_X_TOTAL_PADDING,
  CATEGORY_TRAY_BORDER
} from '~/src/contexts/board-list/constants'
import { CATEGORY_HEADER_FADE, categoryColorClass } from '~/src/lib/category-colors'
import { type StartCategory } from './starts/start'

type Variant = 'ghost' | 'preview'

interface Props {
  category: StartCategory
  /**
   * ghost: on the board, where the start will land, so it matches the real card (BoardWorkspaceCategoryBody). preview:
   * in a start's tilted preview: solid (there's no backdrop blur to hide the dots), with a shadow on the floor, and
   * heroes grey until the start is hovered or focused (its button is the `group`).
   */
  variant: Variant
}

const cards: Record<Variant, string> = {
  ghost: 'bg-zinc-800/80 shadow-lg ring-1 ring-black/50 inset-ring inset-ring-white/8 backdrop-blur-sm',
  preview: 'bg-zinc-800 shadow-2xl shadow-black/75 ring-1 ring-black/50 inset-ring inset-ring-white/12'
}

/** A category that isn't saved yet: the real card's look, with nothing to drag, rename or add to. */
const StartCategoryCard: React.FC<Props> = ({ category, variant }) => (
  <div
    className={cn(
      'absolute top-0 left-0 inline-block rounded-xl',
      cards[variant],
      category.color && categoryColorClass[category.color]
    )}
    data-color={category.color ?? undefined}
    style={{ transform: `translate3d(${category.x_position}px, ${category.y_position}px, 0)` }}>
    <div
      className={cn(
        'relative isolate flex h-9 items-center gap-2 pr-1.5 pl-2',
        category.color && CATEGORY_HEADER_FADE
      )}>
      <span className="text-white/30">
        <Icon icon={Bars2Icon} size={20} />
      </span>
      <span className="font-semibold whitespace-nowrap">{category.name}</span>
    </div>

    {/* `relative`, so the tray paints over the fade's last 12px, which then only shows at its rounded top corners. */}
    <div
      className="relative flex flex-wrap rounded-t-lg rounded-b-xl border border-white/8 bg-zinc-900"
      style={{ padding: CATEGORY_HERO_CONTAINER_TOTAL_PADDING / 2 - CATEGORY_TRAY_BORDER, width: category.width }}>
      {category.heroes.map((hero, i) => (
        // A start can place the same hero twice, so the index keeps keys apart.
        <div key={`${hero.id}-${i}`} className="shrink-0" style={{ padding: CATEGORY_HERO_X_TOTAL_PADDING / 2 }}>
          <img
            src={hero.thumbnail}
            alt=""
            loading="lazy"
            draggable={false}
            className={cn(
              'rounded-sm bg-zinc-700 object-cover',
              variant === 'preview' &&
                'brightness-62 grayscale-90 transition-[filter] duration-250 group-hover:brightness-100 group-hover:grayscale-0 group-focus-visible:brightness-100 group-focus-visible:grayscale-0'
            )}
            style={{ width: CATEGORY_HERO_WIDTH, height: CATEGORY_HERO_HEIGHT }}
          />
        </div>
      ))}

      <div className="shrink-0" style={{ padding: CATEGORY_HERO_X_TOTAL_PADDING / 2 }}>
        <div
          className="flex items-center justify-center rounded-sm border-2 border-dashed border-zinc-500 bg-zinc-700 p-2"
          style={{ width: CATEGORY_HERO_WIDTH, height: CATEGORY_HERO_HEIGHT }}>
          <div className="mr-2 text-zinc-500">
            <Icon icon={PlusCircleIcon} size={16} />
          </div>
          <div className="text-xs font-bold tracking-wide">Add</div>
        </div>
      </div>
    </div>
  </div>
)

export { StartCategoryCard }
