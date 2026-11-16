import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/api/http'
import { boardKeys } from '~/src/queries/query-keys'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type Board, type Slug } from '~/src/types/api'

interface UpdateBoardVariables {
  name: string
}

/** Rename a board. The new name shows once the server has saved it. */
const useUpdateBoardMutation = (boardSlug: Slug) => {
  const queryClient = useQueryClient()

  const { optimisticSaveOptions, update } = useBoardCache(boardSlug)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ name }: UpdateBoardVariables) =>
      http<{ board: Board }>(`boards/${boardSlug}`, { method: 'PUT', body: { name } }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      update((board) => {
        board.name = data.board.name
      })
    }
  })
}

export { useUpdateBoardMutation }
