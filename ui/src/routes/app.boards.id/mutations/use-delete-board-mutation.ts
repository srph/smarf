import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

/** Delete a board and forget its cached copy. */
const useDeleteBoardMutation = (boardId: ID) => {
  const queryClient = useQueryClient()

  const { saveOptions } = useBoardCache(boardId)

  return useMutation({
    ...saveOptions,
    mutationFn: () => http(`boards/${boardId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      queryClient.removeQueries({ queryKey: boardKeys.detail(boardId) })
    }
  })
}

export { useDeleteBoardMutation }
