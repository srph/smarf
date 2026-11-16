import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/query-keys'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type Slug } from '~/src/types/api'

/** Delete a board and forget its cached copy. */
const useDeleteBoardMutation = (boardSlug: Slug) => {
  const queryClient = useQueryClient()

  const { saveOptions } = useBoardCache(boardSlug)

  return useMutation({
    ...saveOptions,
    mutationFn: () => http(`boards/${boardSlug}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      queryClient.removeQueries({ queryKey: boardKeys.detail(boardSlug) })
    }
  })
}

export { useDeleteBoardMutation }
