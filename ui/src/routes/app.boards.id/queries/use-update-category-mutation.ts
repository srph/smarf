import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

interface UpdateCategoryVariables {
  id: ID
  name: string
}

/** Rename a category. */
const useUpdateCategoryMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (variables: UpdateCategoryVariables) =>
      http(`categories/${variables.id}`, { method: 'PUT', body: variables }),
    onMutate: ({ id, name }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === id)
        if (category) category.name = name
      })
  })
}

export { useUpdateCategoryMutation }
