import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type ID, type Slug } from '~/src/types/api'

/** Delete a category (by id) and its heroes. */
const useDeleteCategoryMutation = (boardSlug: Slug) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardSlug)

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
