import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

interface ResizeCategoryVariables {
  category_id: ID
  width: number
  height: number
}

/** Save a category's size once a resize ends. */
const useResizeCategoryMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (variables: ResizeCategoryVariables) =>
      http(`categories/${variables.category_id}/resize`, { method: 'PUT', body: variables }),
    onMutate: ({ category_id, width, height }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === category_id)
        if (!category) return
        category.width = width
        category.height = height
      })
  })
}

export { useResizeCategoryMutation }
