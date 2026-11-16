import { CATEGORY_HEADER_HEIGHT } from '~/src/contexts/board-list/constants'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'
import { type Category, type CategoryColor, type Hero } from '~/src/types/api'

/** A category a start lays out: what POST /boards takes, with whole heroes so the previews can show them. */
type StartCategory = Pick<Category, 'name' | 'color' | 'x_position' | 'y_position' | 'width' | 'height'> & {
  heroes: Hero[]
}

/** A way to start a new board. `layout` places its categories once the hero list has loaded. */
interface Start {
  id: 'default' | 'tier-list' | 'blank-slate'
  name: string
  description: string
  /** The hero whose portrait glows, blurred, behind the start's preview. */
  glow: string
  layout: (heroes: Hero[]) => StartCategory[]
}

/** A start laid out with the loaded heroes. */
type ResolvedStart = Omit<Start, 'layout' | 'glow'> & { glow: Hero | undefined; categories: StartCategory[] }

/** The space between a start's categories. */
const START_GAP = 12

/** A category `width` wide at (x, y), as tall as its heroes need. Grey unless it's given a colour. */
const startCategory = (
  name: string,
  heroes: Hero[],
  { width, x, y, color = null }: { width: number; x: number; y: number; color?: CategoryColor | null }
): StartCategory => ({
  name,
  color,
  heroes,
  x_position: x,
  y_position: y,
  width,
  height: getCategoryHeight({ categoryWidth: width, heroCount: heroes.length })
})

/** Where a category's card ends: its header, then its hero tray. */
const startCategoryBottom = (category: StartCategory) => category.y_position + CATEGORY_HEADER_HEIGHT + category.height

/** Heroes by name, in the order given. A name the hero list lacks is skipped; a test checks every name resolves. */
const byName = (heroes: Hero[], names: readonly string[]) =>
  names.flatMap((name) => heroes.find((hero) => hero.name === name) ?? [])

const resolveStart = ({ layout, glow, ...start }: Start, heroes: Hero[]): ResolvedStart => ({
  ...start,
  glow: heroes.find((hero) => hero.name === glow),
  categories: layout(heroes)
})

export {
  type ResolvedStart,
  type Start,
  type StartCategory,
  START_GAP,
  byName,
  resolveStart,
  startCategory,
  startCategoryBottom
}
