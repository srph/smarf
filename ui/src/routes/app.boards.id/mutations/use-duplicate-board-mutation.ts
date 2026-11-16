import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/api/http'
import { boardKeys } from '~/src/queries/query-keys'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type Board, type Slug } from '~/src/types/api'

/** Copy a board. Resolves to the copy. */
const useDuplicateBoardMutation = (boardSlug: Slug) => {
  const queryClient = useQueryClient()

  const { saveOptions } = useBoardCache(boardSlug)

  return useMutation({
    ...saveOptions,
    mutationFn: async () => (await http<{ board: Board }>(`boards/${boardSlug}/duplicate`, { method: 'POST' })).board,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
    }
  })
}

export { useDuplicateBoardMutation }
