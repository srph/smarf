import { Board, Category } from '~/src/types/api'
import {
  CATEGORY_HERO_CONTAINER_TOTAL_PADDING,
  CATEGORY_HERO_TOTAL_WIDTH,
  CATEGORY_ROW_HEIGHT,
  ORDER_FIRST_BUFFER,
  ORDER_LAST_BUFFER
} from './constants'

export const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
  const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
  const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_TOTAL_WIDTH)
  const rowCount = Math.ceil(columnCount / columnsPerRow)
  return CATEGORY_ROW_HEIGHT * rowCount + CATEGORY_HERO_CONTAINER_TOTAL_PADDING
}

/**
 * Keeps a dragged category inside the workspace: its whole width within the workspace's width, and its top at or
 * below the workspace's top. The bottom is open, since the workspace grows to fit. A category wider than the
 * workspace sits at its left edge.
 */
export const clampCategoryPosition = (
  { x, y }: { x: number; y: number },
  { categoryWidth, workspaceWidth }: { categoryWidth: number; workspaceWidth: number }
) => ({
  x: Math.max(0, Math.min(x, workspaceWidth - categoryWidth)),
  y: Math.max(0, y)
})

export const getCategoryBottom = (category: Category): number => {
  return category.y_position + category.height
}

/** The bottom edge of the board's lowest category, or 0 for a board with no categories. */
export const getLowestCategoryBottom = (board: Board): number => {
  return Math.max(0, ...board.categories.map(getCategoryBottom))
}

/**
 * Calculate the `order` value of the hero in the specified index
 */
export const getHeroOrder = (category: Category, index: number): number => {
  const heroes = category.heroes

  if (!heroes.length) {
    throw new Error('Unable to calculate hero order. The category does not contain any hero.')
  }

  // Only item in the list
  if (heroes.length === 1) {
    return ORDER_FIRST_BUFFER
  }

  // First in the list
  if (index === 0) {
    return heroes[1].pivot.order / 2
  }

  // Last in the list
  if (index === heroes.length - 1) {
    return heroes[index - 1].pivot.order + ORDER_LAST_BUFFER
  }

  // Middle of the list
  return (heroes[index - 1].pivot.order + heroes[index + 1].pivot.order) / 2
}
