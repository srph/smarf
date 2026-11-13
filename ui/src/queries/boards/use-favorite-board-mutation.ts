import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type Board, type ID } from '~/src/types/api'
import { boardKeys } from './board-keys'
import { useBoardCache } from './use-board-cache'

interface FavoriteBoardVariables {
  is_favorite: boolean
}

/** Star or unstar a board. The board list and the board show the change right away. */
const useFavoriteBoardMutation = (boardId: ID) => {
  const queryClient = useQueryClient()

  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ is_favorite }: FavoriteBoardVariables) =>
      http(`boards/${boardId}/favorite`, { method: 'PUT', body: { is_favorite } }),
    onMutate: ({ is_favorite }) => {
      // A refetch already in flight would overwrite this change with older data.
      void queryClient.cancelQueries({ queryKey: boardKeys.list() })
      queryClient.setQueryData<Board[]>(boardKeys.list(), (boards) =>
        boards?.map((board) => (board.id === boardId ? { ...board, is_favorite } : board))
      )
      update((board) => {
        board.is_favorite = is_favorite
      })
    },
    onSettled: () => {
      optimisticSaveOptions.onSettled()
      // Refetch the list (which also undoes a failed save) only after the last board save, so it can't undo the others' changes.
      if (queryClient.isMutating({ mutationKey: boardKeys.all }) === 1) {
        void queryClient.invalidateQueries({ queryKey: boardKeys.list() })
      }
    }
  })
}

export { useFavoriteBoardMutation }
