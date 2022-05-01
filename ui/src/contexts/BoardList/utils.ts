import { Category } from '~/src/types/api'
import { CATEGORY_HERO_WIDTH, CATEGORY_ROW_HEIGHT } from './constants'

export const getCategoryHeight = ({ categoryWidth, heroCount }: { categoryWidth: number; heroCount: number }) => {
  const columnCount = heroCount + 1 // The "new" placeholder + new hero added to the card
  const columnsPerRow = Math.floor(categoryWidth / CATEGORY_HERO_WIDTH)
  const rowCount = Math.ceil(columnCount / columnsPerRow)
  return CATEGORY_ROW_HEIGHT * rowCount
}

export const getCategoryBottom = (category: Category): number => {
  return category.y_position + category.height
}
