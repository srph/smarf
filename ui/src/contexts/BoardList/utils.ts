import { Category } from '~/src/types/api'
import { CATEGORY_HERO_WIDTH, CATEGORY_ROW_HEIGHT, ORDER_FIRST_BUFFER, ORDER_LAST_BUFFER } from './constants'
import { last } from '~/src/utils'

export const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
  const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
  const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
  const rowCount = Math.ceil(columnCount / columnsPerRow)
  return CATEGORY_ROW_HEIGHT * rowCount
}

export const getCategoryBottom = (category: Category): number => {
  return category.y_position + category.height
}

export const getHeroOrder = (category: Category, index: number) => {
  const heroes = category.heroes

  if (!heroes.length) {
    throw new Error('Unable to calculate hero order. Hero could not be found from the category.')
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
    return last(heroes).pivot.order + ORDER_LAST_BUFFER
  }

  // Middle of the list
  return (heroes[index - 1].pivot.order + heroes[index + 1].pivot.order) / 2
}
