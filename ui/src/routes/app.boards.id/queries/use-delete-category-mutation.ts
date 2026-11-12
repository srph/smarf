import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

/** Delete a category (by id) and its heroes. */
const useDeleteCategoryMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (categoryId: ID) => http(`categories/${categoryId}`, { method: 'DELETE' }),
    onMutate: (categoryId) =>
      update((board) => {
        board.categories = board.categories.filter((c) => c.id !== categoryId)
      })
  })
}

export { useDeleteCategoryMutation }
