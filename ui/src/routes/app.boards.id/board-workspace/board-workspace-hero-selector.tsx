import React, { useRef, useState } from 'react'
import { cn } from 'cn'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { ImageAspectRatio } from '~/src/components/image-aspect-ratio/image-aspect-ratio'
import { Popover } from '~/src/components/popover/popover'
import { Hero, HeroAttribute } from '~/src/types/api'
import { useHeroesQuery } from '~/src/queries/use-heroes-query'
import { ErrorState } from '~/src/components/error-state/error-state'
import { CATEGORY_HERO_ASPECT_RATIO } from '~/src/contexts/board-list/constants'
import strengthIcon from '~/src/assets/images/attributes/strength.png'
import agilityIcon from '~/src/assets/images/attributes/agility.png'
import intelligenceIcon from '~/src/assets/images/attributes/intelligence.png'
import universalIcon from '~/src/assets/images/attributes/universal.png'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  // A <button>. Base UI makes it toggle the selector and adds `data-popup-open` while open.
  trigger: React.ReactElement
  // The selector lines up under this (the category's tray) instead of the trigger.
  anchor: Element | null | undefined
  onSelectHero: (hero: Hero) => void
}

interface AttributeGroup {
  attribute: HeroAttribute
  name: string
  icon: string
  heroes: Hero[]
}

// Each attribute's quadrant: a coloured top edge, its colour fading down from it, and a lighter label.
const QUADRANT_CLASS: Record<HeroAttribute, string> = {
  strength: 'border-t-red-500/70 from-red-500/12',
  agility: 'border-t-green-500/70 from-green-500/12',
  intelligence: 'border-t-sky-500/70 from-sky-500/12',
  universal: 'border-t-amber-500/70 from-amber-500/12'
}

const LABEL_CLASS: Record<HeroAttribute, string> = {
  strength: 'text-red-300',
  agility: 'text-green-300',
  intelligence: 'text-sky-300',
  universal: 'text-amber-300'
}

/**
 * Every hero at once, in four quadrants by attribute, like the in-game grid. Searching greys out the heroes whose
 * names don't match and rings the first one that does, which Enter adds. Picking a hero keeps the selector open, so
 * several can go in a row.
 */
const BoardWorkspaceHeroSelector: React.FC<Props> = ({ open, onOpenChange, onSelectHero, trigger, anchor }) => {
  const [search, setSearch] = useState('')

  const searchRef = useRef<HTMLInputElement>(null)

  const {
    data: attributeGroups,
    status: heroesStatus,
    refetch: refetchHeroes,
    isFetching: isHeroesFetching
  } = useHeroesQuery(groupByAttribute)

  // No Add button until the heroes are in.
  if (heroesStatus === 'pending') {
    return null
  }

  const query = search.trim().toLowerCase()

  const matches = (hero: Hero) => query === '' || hero.name.toLowerCase().includes(query)

  // Only while searching: the hero Enter adds.
  const firstMatch =
    query !== '' && heroesStatus === 'success'
      ? attributeGroups.flatMap((group) => group.heroes).find(matches)
      : undefined

  const handleSearchKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key !== 'Enter' || !firstMatch) return
    evt.preventDefault()
    onSelectHero(firstMatch)
  }

  return (
    <Popover.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Popover.Trigger render={trigger} />

      <Popover.Popup
        anchor={anchor}
        side="bottom"
        align="start"
        sideOffset={32}
        initialFocus={searchRef}
        className="w-240">
        <div className="flex items-center gap-4 border-b border-white/7 py-3 pr-3 pl-4">
          <h4 className="flex-1 text-base font-bold">Select a hero</h4>

          <label className="flex h-9 w-60 shrink-0 items-center gap-2 rounded-lg border border-white/8 bg-black/25 px-2.5 text-zinc-400 transition duration-150 hover:border-white/16 has-focus:border-primary-400 has-focus:ring-3 has-focus:ring-primary-400/25">
            <Icon icon={MagnifyingGlassIcon} size={16} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(evt) => setSearch(evt.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search heroes"
              aria-label="Search heroes"
              className="h-full min-w-0 flex-1 bg-transparent text-zinc-50 outline-none placeholder:text-zinc-500"
            />
          </label>

          <Popover.Close
            title="Close"
            aria-label="Close"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-white/7 hover:text-zinc-50 focus-visible:ring-focus">
            <Icon icon={XMarkIcon} />
          </Popover.Close>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          {heroesStatus === 'error' && (
            <ErrorState
              className="col-span-2 py-12"
              message="Couldn't load the heroes. Check your connection and try again."
              onRetry={() => refetchHeroes()}
              isRetrying={isHeroesFetching}
            />
          )}

          {heroesStatus === 'success' &&
            attributeGroups.map((group) => (
              <section
                key={group.attribute}
                aria-label={group.name}
                className={cn(
                  'rounded-xl border border-t-2 border-white/6 bg-linear-to-b to-transparent to-35% px-3 pt-2.5 pb-3',
                  QUADRANT_CLASS[group.attribute]
                )}>
                <div className="mb-2.5 flex items-center gap-2">
                  <img src={group.icon} alt="" className="size-5" />
                  <h4 className={cn('text-xs font-bold tracking-widest uppercase', LABEL_CLASS[group.attribute])}>
                    {group.name}
                  </h4>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {group.heroes.map((hero) => (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => onSelectHero(hero)}
                      title={`Select ${hero.name}`}
                      className={cn(
                        'relative block cursor-pointer overflow-hidden rounded-sm transition duration-150',
                        'hover:z-2 hover:scale-110 hover:shadow-lg hover:ring-2 hover:shadow-black/70 hover:ring-primary-500',
                        'focus-visible:z-2 focus-visible:scale-110 focus-visible:ring-focus',
                        !matches(hero) && 'opacity-12 grayscale',
                        hero === firstMatch && 'z-1 ring-2 ring-primary-400'
                      )}>
                      <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} alt={hero.name} />
                    </button>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </Popover.Popup>
    </Popover.Root>
  )
}

const ATTRIBUTES: Omit<AttributeGroup, 'heroes'>[] = [
  { attribute: 'strength', name: 'Strength', icon: strengthIcon },
  { attribute: 'agility', name: 'Agility', icon: agilityIcon },
  { attribute: 'intelligence', name: 'Intelligence', icon: intelligenceIcon },
  { attribute: 'universal', name: 'Universal', icon: universalIcon }
]

const groupByAttribute = (heroes: Hero[]): AttributeGroup[] =>
  ATTRIBUTES.map((group) => ({ ...group, heroes: heroes.filter((hero) => hero.attribute === group.attribute) }))

export { BoardWorkspaceHeroSelector }
