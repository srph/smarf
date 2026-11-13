import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

interface MoveCategoryVariables {
  category_id: ID
  x_position: number
  y_position: number
}

/** Save where a category was dropped. */
const useMoveCategoryMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (variables: MoveCategoryVariables) =>
      http(`categories/${variables.category_id}/move`, { method: 'PUT', body: variables }),
    onMutate: ({ category_id, x_position, y_position }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === category_id)
        if (!category) return
        category.x_position = x_position
        category.y_position = y_position
      })
  })
}

export { useMoveCategoryMutation }
