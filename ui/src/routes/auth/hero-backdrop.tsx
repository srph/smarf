import React from 'react'
import { useHeroesQuery } from '~/src/queries/heroes/use-heroes-query'
import { type Hero } from '~/src/types/api'

// Columns of hero portraits, tilted, scrolling up and down behind the sign-in page. Each column is one
// set of heroes repeated, and scrolls by exactly one set per loop, so the wrap can't be seen. Sized to
// cover a 2560×1440 screen at the tilt: 20 columns wide, and 5 sets tall (4 still showing at the loop's end).
const COLUMNS = 20
const HEROES_PER_COLUMN = 7
const REPEATS = 5
const TILE_WIDTH = 128
const TILE_HEIGHT = 72
const TILE_GAP = 12
/** One set's height, tile gaps included: what hero-drift scrolls per loop. */
const SET_HEIGHT = HEROES_PER_COLUMN * (TILE_HEIGHT + TILE_GAP)

/** A new order each time the list loads, so the backdrop differs between visits. */
const shuffle = (heroes: Hero[]) => {
  const shuffled = heroes.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** The decorative hero wall behind the sign-in pages. Shows nothing until the hero list loads. */
const HeroBackdrop: React.FC = () => {
  const { data: heroes } = useHeroesQuery(shuffle)

  if (!heroes?.length) return null

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 -rotate-12 gap-3">
        {Array.from({ length: COLUMNS }, (_, column) => {
          // Heroes wrap around when there are fewer than the columns need.
          const set = Array.from(
            { length: HEROES_PER_COLUMN },
            (_slot, i) => heroes[(column * HEROES_PER_COLUMN + i) % heroes.length]
          )
          return (
            <div
              key={column}
              className="flex shrink-0 animate-hero-drift flex-col motion-reduce:animate-none"
              style={
                {
                  '--drift-set': `${SET_HEIGHT}px`,
                  // Neighbours move at different speeds, every other one downwards, each starting partway in.
                  animationDuration: `${36 + (column % 3) * 6}s`,
                  animationDelay: `${-column * 5}s`,
                  animationDirection: column % 2 ? 'reverse' : 'normal'
                } as React.CSSProperties
              }>
              {Array.from({ length: REPEATS }, (_copy, repeat) =>
                set.map((hero, i) => (
                  <img
                    key={`${repeat}-${i}`}
                    src={hero.thumbnail}
                    alt=""
                    className="shrink-0 rounded-md object-cover opacity-55"
                    style={{ width: TILE_WIDTH, height: TILE_HEIGHT, marginBottom: TILE_GAP }}
                  />
                ))
              )}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 bg-auth-veil" />
    </div>
  )
}

export { HeroBackdrop }
