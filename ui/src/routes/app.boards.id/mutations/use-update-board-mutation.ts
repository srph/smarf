import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type Board, type ID } from '~/src/types/api'

interface UpdateBoardVariables {
  name: string
}

/** Rename a board. The new name shows once the server has saved it. */
const useUpdateBoardMutation = (boardId: ID) => {
  const queryClient = useQueryClient()

  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ name }: UpdateBoardVariables) =>
      http<{ board: Board }>(`boards/${boardId}`, { method: 'PUT', body: { name } }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      update((board) => {
        board.name = data.board.name
      })
    }
  })
}

export { useUpdateBoardMutation }
