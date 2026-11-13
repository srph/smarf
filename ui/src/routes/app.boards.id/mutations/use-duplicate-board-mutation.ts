import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type Board, type ID } from '~/src/types/api'

/** Copy a board. Resolves to the copy. */
const useDuplicateBoardMutation = (boardId: ID) => {
  const queryClient = useQueryClient()

  const { saveOptions } = useBoardCache(boardId)

  return useMutation({
    ...saveOptions,
    mutationFn: async () => (await http<{ board: Board }>(`boards/${boardId}/duplicate`, { method: 'POST' })).board,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
    }
  })
}

export { useDuplicateBoardMutation }
