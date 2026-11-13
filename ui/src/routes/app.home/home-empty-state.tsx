import React from 'react'
import { cn } from 'cn'
import { useNavigate } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { Button } from '~/src/components/button/button'
import { useCreateBoardMutation, useIsBoardCreating } from '~/src/queries/boards/use-create-board-mutation'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'
import { type Hero } from '~/src/types/api'
import { CATEGORY_HERO_HEIGHT, CATEGORY_HERO_WIDTH } from '~/src/contexts/board-list/constants'

const FEATURED_HEROES = ['Crystal Maiden', 'Juggernaut', 'Void Spirit']

/** Three heroes for the art: the featured ones, or the first three if those names aren't in the list. */
const pickFeatured = (heroes: Hero[]) => {
  const featured = FEATURED_HEROES.flatMap((name) => heroes.find((hero) => hero.name === name) ?? [])
  return featured.length === FEATURED_HEROES.length ? featured : heroes.slice(0, FEATURED_HEROES.length)
}

// Fanned out like a hand of cards; the middle one sits on top.
const tilt = [
  'translate-x-3 translate-y-2 -rotate-6',
  'relative z-10 -translate-y-1',
  '-translate-x-3 translate-y-2 rotate-6'
]

/** What the board list shows before the user has any boards: what a board is, and a button to make one. */
const HomeEmptyState: React.FC = () => {
  const navigate = useNavigate()
  const { mutate: createBoard } = useCreateBoardMutation()
  const isBoardCreating = useIsBoardCreating()
  const { data: featured, status: heroesStatus } = useHeroesQuery(pickFeatured)

  return (
    <div className="mx-auto w-120 py-16 text-center">
      <div className="mb-8 flex justify-center" aria-hidden="true">
        {tilt.map((className, i) => {
          const hero = featured?.[i]
          return (
            <div
              key={hero?.id ?? i}
              className={cn('overflow-hidden rounded bg-zinc-700 ring-3 ring-zinc-900', className)}
              style={{ width: CATEGORY_HERO_WIDTH, height: CATEGORY_HERO_HEIGHT }}>
              {hero ? <img src={hero.thumbnail} alt="" className="size-full object-cover" /> : null}
            </div>
          )
        })}
      </div>

      <h3 className="mb-3 text-lg font-medium">No boards yet</h3>
      <p className="mx-auto mb-8 max-w-90 text-zinc-400">
        A board is your own hero grid: categories you size and arrange, each filled with heroes.
      </p>

      {/* inline-block so the full-width Button shrinks to its label */}
      <div className="inline-block">
        <Button
          icon={SquaresPlusIcon}
          loading={isBoardCreating}
          disabled={heroesStatus === 'pending'}
          onClick={() => createBoard(undefined, { onSuccess: (board) => navigate(`/b/${board.id}`) })}>
          {isBoardCreating ? 'Creating…' : 'Create your first board'}
        </Button>
      </div>
    </div>
  )
}

export { HomeEmptyState }
