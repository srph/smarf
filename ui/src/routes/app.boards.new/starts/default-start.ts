import { type HeroAttribute } from '~/src/types/api'
import { type Start, startCategory, startCategoryBottom } from './start'

const ATTRIBUTES: { attribute: HeroAttribute; name: string }[] = [
  { attribute: 'strength', name: 'Strength' },
  { attribute: 'agility', name: 'Agility' },
  { attribute: 'intelligence', name: 'Intelligence' },
  { attribute: 'universal', name: 'Universal' }
]

// Five heroes a row, two categories side by side, 32px apart both ways.
const WIDTH = 448
const GAP = 32

/** The in-game hero grid: every hero, in a category per attribute. */
const defaultStart: Start = {
  id: 'default',
  name: 'Default',
  description: 'The in-game grid: every hero, by attribute.',
  glow: 'Axe',
  layout: (heroes) => {
    const [strength, agility, intelligence, universal] = ATTRIBUTES.map(({ attribute, name }) => ({
      name,
      heroes: heroes.filter((hero) => hero.attribute === attribute)
    }))

    const top = [strength, agility].map((group, i) =>
      startCategory(group.name, group.heroes, { width: WIDTH, x: i * (WIDTH + GAP), y: 0 })
    )
    const y = Math.max(...top.map(startCategoryBottom)) + GAP

    return [
      ...top,
      ...[intelligence, universal].map((group, i) =>
        startCategory(group.name, group.heroes, { width: WIDTH, x: i * (WIDTH + GAP), y })
      )
    ]
  }
}

export { defaultStart }
