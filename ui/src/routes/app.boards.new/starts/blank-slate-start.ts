import { CATEGORY_BODY_INITIAL_WIDTH } from '~/src/contexts/board-list/constants'
import { type Start, byName, startCategory } from './start'

const CATEGORIES = [
  ['Pubstomp', ['Lion', 'Bounty Hunter']],
  ['Grief Squad', ['Keeper of the Light', 'Techies']]
] as const

// New category's width, side by side, 32px apart
const GAP = 32

/** Two small categories to make your own. */
const blankSlateStart: Start = {
  id: 'blank-slate',
  name: 'Blank Slate',
  description: 'Two small categories to rename, fill or delete.',
  glow: 'Lion',
  layout: (heroes) =>
    CATEGORIES.map(([name, names], i) =>
      startCategory(name, byName(heroes, names), {
        width: CATEGORY_BODY_INITIAL_WIDTH,
        x: i * (CATEGORY_BODY_INITIAL_WIDTH + GAP),
        y: 0
      })
    )
}

/** Every hero name the blank slate places, for the test that checks they all exist. */
const BLANK_SLATE_NAMES = CATEGORIES.flatMap(([, names]) => names)

export { BLANK_SLATE_NAMES, blankSlateStart }
