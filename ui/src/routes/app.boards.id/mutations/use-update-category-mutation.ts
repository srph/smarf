import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type CategoryColor, type ID, type Slug } from '~/src/types/api'

interface UpdateCategoryVariables {
  id: ID
  // Send only what changes: a rename and a recolour are separate saves. A null colour clears it.
  name?: string
  color?: CategoryColor | null
}

/** Rename or recolour a category. */
const useUpdateCategoryMutation = (boardSlug: Slug) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardSlug)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: (variables: UpdateCategoryVariables) =>
      http(`categories/${variables.id}`, { method: 'PUT', body: variables }),
    onMutate: ({ id, ...changes }) =>
      update((board) => {
        const category = board.categories.find((c) => c.id === id)
        if (category) Object.assign(category, changes)
      })
  })
}

export { useUpdateCategoryMutation }
