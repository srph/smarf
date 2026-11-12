import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type Board, type ID } from '~/src/types/api'
import { boardKeys } from './board-keys'

interface FavoriteBoardVariables {
  is_favorite: boolean
}

/** Star or unstar a board. The board list shows the change right away and refetches once the save settles. */
const useFavoriteBoardMutation = (boardId: ID) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: boardKeys.detail(boardId),
    // One board's saves run one at a time, so they reach the API in the order they were made.
    scope: { id: `board:${boardId}` },
    mutationFn: ({ is_favorite }: FavoriteBoardVariables) =>
      http(`boards/${boardId}/favorite`, { method: 'PUT', body: { is_favorite } }),
    onMutate: async ({ is_favorite }) => {
      // A refetch already in flight would overwrite this change with older data.
      await queryClient.cancelQueries({ queryKey: boardKeys.list() })
      queryClient.setQueryData<Board[]>(boardKeys.list(), (boards) =>
        boards?.map((board) => (board.id === boardId ? { ...board, is_favorite } : board))
      )
    },
    onSettled: () => {
      // Refetch (which also undoes a failed save) only after the last board save, so it can't undo the others' changes.
      if (queryClient.isMutating({ mutationKey: boardKeys.all }) === 1) {
        return queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      }
    }
  })
}

export { useFavoriteBoardMutation }
