import React, { useRef, useState } from 'react'
import { cn } from 'cn'
import { AcademicCapIcon, BoltIcon, FireIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { ImageAspectRatio } from '~/src/components/image-aspect-ratio/image-aspect-ratio'
import { SearchInput } from '~/src/components/search-input/search-input'
import { Popover, PopoverClose, type PopoverProps } from '~/src/components/popover/popover'
import { Hero, HeroAttributeGroup } from '~/src/types/api'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'
import { ErrorState } from '~/src/components/error-state/error-state'
import { CATEGORY_HERO_ASPECT_RATIO } from '~/src/contexts/board-list/constants'

interface Props extends Pick<PopoverProps, 'open' | 'onOpenChange' | 'trigger' | 'anchor'> {
  onSelectHero: (hero: Hero) => void
}

const BoardWorkspaceHeroSelector: React.FC<Props> = ({ open, onOpenChange, onSelectHero, trigger, anchor }) => {
  const [search, setSearch] = useState('')

  const searchRef = useRef<HTMLInputElement>(null)

  const {
    data: heroAttributeGroups,
    status: heroesStatus,
    refetch: refetchHeroes,
    isFetching: isHeroesFetching
  } = useHeroesQuery(groupByAttribute)

  // No Add button until the heroes are in.
  if (heroesStatus === 'pending') {
    return null
  }

  const searchInput = search.toLowerCase()

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      anchor={anchor}
      side="bottom"
      align="start"
      sideOffset={32}
      initialFocus={searchRef}>
      <div className="w-240 rounded border border-zinc-700 bg-zinc-900">
        <PopoverClose title="Close" className="absolute -top-8 right-0 cursor-pointer text-zinc-500">
          <Icon icon={XMarkIcon} />
        </PopoverClose>

        <div className="flex items-center justify-between border-b border-zinc-700 p-4">
          <h4 className="font-bold">Select Hero</h4>
          <SearchInput ref={searchRef} value={search} onChange={setSearch} />
        </div>

        <div className="h-90 overflow-y-scroll p-4">
          {heroesStatus === 'error' && (
            <ErrorState
              className="py-12"
              message="Couldn't load the heroes. Check your connection and try again."
              onRetry={() => refetchHeroes()}
              isRetrying={isHeroesFetching}
            />
          )}

          {heroesStatus === 'success' &&
            heroAttributeGroups.map((attribute) => (
              <React.Fragment key={attribute.id}>
                <div className="mb-4 flex items-center">
                  <div className={cn('mr-3 rounded p-1', getAttributeIconColor(attribute.name))}>
                    <Icon icon={getAttributeIcon(attribute.name)} />
                  </div>
                  <h4 className="font-bold">{attribute.name}</h4>
                </div>

                <div className="-mx-1 flex flex-wrap not-last:mb-12">
                  {attribute.heroes.map((hero) => {
                    const name = hero.name.toLowerCase()

                    return (
                      <div key={hero.id} className="p-1">
                        <button
                          type="button"
                          onClick={() => onSelectHero(hero)}
                          title={`Select ${hero.name}`}
                          className={cn(
                            'inline-block w-15 cursor-pointer rounded border-2 border-transparent hover:border-sky-500 focus:border-sky-500',
                            searchInput !== '' && !name.includes(searchInput) && 'opacity-30'
                          )}>
                          <ImageAspectRatio src={hero.thumbnail} value={CATEGORY_HERO_ASPECT_RATIO} alt={hero.name} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </React.Fragment>
            ))}
        </div>
      </div>
    </Popover>
  )
}

const groupByAttribute = (heroes: Hero[]): HeroAttributeGroup[] => [
  { id: '1', name: 'Strength', heroes: heroes.filter((hero) => hero.attribute === 'strength') },
  { id: '2', name: 'Agility', heroes: heroes.filter((hero) => hero.attribute === 'agility') },
  { id: '3', name: 'Intelligence', heroes: heroes.filter((hero) => hero.attribute === 'intelligence') }
]

const getAttributeIconColor = (name: string) => {
  switch (name) {
    case 'Strength':
      return 'bg-red-500'
    case 'Agility':
      return 'bg-green-500'
    case 'Intelligence':
      return 'bg-sky-500'
    default:
      return 'bg-zinc-500'
  }
}

const getAttributeIcon = (name: string) => {
  switch (name) {
    case 'Strength':
      return FireIcon
    case 'Agility':
      return BoltIcon
    case 'Intelligence':
      return AcademicCapIcon
    default:
      return BoltIcon
  }
}

export { BoardWorkspaceHeroSelector }
