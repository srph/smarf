import { Board, Category } from '~/src/types/api'
import { CATEGORY_HERO_WIDTH, CATEGORY_ROW_HEIGHT, ORDER_FIRST_BUFFER, ORDER_LAST_BUFFER } from './constants'

export const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
  const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
  const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
  const rowCount = Math.ceil(columnCount / columnsPerRow)
  return CATEGORY_ROW_HEIGHT * rowCount
}

export const getCategoryBottom = (category: Category): number => {
  return category.y_position + category.height
}

export const getLowestCategoryBottom = (board: Board): number => {
  const lowestCategory = [...board.categories].sort((a, b) => {
    return getCategoryBottom(b) - getCategoryBottom(a)
  })[0]

  return getCategoryBottom(lowestCategory)
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
