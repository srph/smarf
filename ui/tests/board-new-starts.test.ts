import { describe, expect, test } from 'vitest'
import { type Hero, type HeroAttribute } from '~/src/types/api'
import { CATEGORY_HEADER_HEIGHT } from '~/src/contexts/board-list/constants'
import { BLANK_SLATE_NAMES } from '~/src/routes/app.boards.new/starts/blank-slate-start'
import { TIER_LIST_NAMES } from '~/src/routes/app.boards.new/starts/tier-list-start'
import { STARTS } from '~/src/routes/app.boards.new/starts/starts'
import { resolveStart, type StartCategory } from '~/src/routes/app.boards.new/starts/start'
import { DOTA_HERO_NAMES } from './support/dota-hero-names'

const ATTRIBUTES: HeroAttribute[] = ['strength', 'agility', 'intelligence', 'universal']

// Every real hero, with attributes taken in turn so each group has some
const HEROES: Hero[] = DOTA_HERO_NAMES.map((name, i) => ({
  id: `hero-${i}`,
  name,
  thumbnail: `https://cdn.test/${i}.png`,
  attribute: ATTRIBUTES[i % ATTRIBUTES.length]
}))

const overlaps = (a: StartCategory, b: StartCategory) =>
  a.x_position < b.x_position + b.width &&
  b.x_position < a.x_position + a.width &&
  a.y_position < b.y_position + CATEGORY_HEADER_HEIGHT + b.height &&
  b.y_position < a.y_position + CATEGORY_HEADER_HEIGHT + a.height

describe('new board starts', () => {
  // A start skips a name the hero list lacks, so a renamed hero would quietly go missing from it.
  test.each([
    ['Tier List', TIER_LIST_NAMES],
    ['Blank Slate', BLANK_SLATE_NAMES]
  ])('%s names only heroes that exist', (_, names) => {
    expect(names.filter((name) => !DOTA_HERO_NAMES.includes(name))).toEqual([])
  })

  test.each(STARTS.map((start) => [start.name, start] as const))("%s's categories don't overlap", (_, start) => {
    const { categories } = resolveStart(start, HEROES)
    const pairs = categories.flatMap((a, i) => categories.slice(i + 1).map((b) => [a, b] as const))
    expect(pairs.filter(([a, b]) => overlaps(a, b)).map(([a, b]) => `${a.name} / ${b.name}`)).toEqual([])
  })

  test('Default places every hero once, by attribute', () => {
    const { categories } = resolveStart(STARTS[0], HEROES)
    expect(categories.map((c) => c.name)).toEqual(['Strength', 'Agility', 'Intelligence', 'Universal'])
    expect(categories.flatMap((c) => c.heroes).length).toBe(HEROES.length)
  })

  test('Tier List runs S and F, then A to D', () => {
    const { categories, glow } = resolveStart(STARTS[1], HEROES)
    expect(categories.map((c) => c.name)).toEqual(['S Tier', 'F Tier', 'A Tier', 'B Tier', 'C Tier', 'D Tier'])
    expect(glow?.name).toBe('Bounty Hunter')
  })
})
