import { useMutation } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type Board, type Category, type ID } from '~/src/types/api'
import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING } from '~/src/contexts/board-list/constants'
import { getCategoryHeight, getLowestCategoryBottom } from '~/src/contexts/board-list/utils'

/**
 * An empty "Untitled" category under the board's lowest one (or at the top of an empty board), with a temporary id
 * until the server saves it.
 */
const newCategory = (board: Board): Category => {
  const now = new Date().toISOString()

  return {
    id: uuid(),
    name: 'Untitled',
    heroes: [],
    x_position: 0,
    y_position: board.categories.length ? getLowestCategoryBottom(board) + CATEGORY_SPACING : 0,
    width: CATEGORY_BODY_INITIAL_WIDTH,
    height: getCategoryHeight({ categoryWidth: CATEGORY_BODY_INITIAL_WIDTH, heroCount: 0 }),
    created_at: now,
    updated_at: now
  }
}

/** Add a category (from `newCategory`). It shows right away; the saved category replaces it once the server answers. */
const useAddCategoryMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (category: Category) =>
      http<{ category: Category }>(`boards/${boardId}/categories`, {
        method: 'POST',
        body: { ...category, category_buffer_id: category.id }
      }),
    onMutate: (category) =>
      update((board) => {
        board.categories.push(category)
      }),
    // Swap the temporary category for the saved one, so later edits use the real id.
    onSuccess: (data, category) =>
      update((board) => {
        const index = board.categories.findIndex((c) => c.id === category.id)
        if (index !== -1) board.categories[index] = data.category
      })
  })
}

export { useAddCategoryMutation, newCategory }
