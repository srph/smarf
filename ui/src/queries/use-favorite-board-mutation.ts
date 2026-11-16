import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '~/src/lib/api/http'
import { type BoardSummary, type Slug } from '~/src/types/api'
import { boardKeys } from './query-keys'
import { useBoardCache } from './use-board-cache'

interface FavoriteBoardVariables {
  is_favorite: boolean
}

/** Star or unstar a board. The board list and the board show the change right away. */
const useFavoriteBoardMutation = (boardSlug: Slug) => {
  const queryClient = useQueryClient()

  const { optimisticSaveOptions, update } = useBoardCache(boardSlug)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ is_favorite }: FavoriteBoardVariables) =>
      http(`boards/${boardSlug}/favorite`, { method: 'PUT', body: { is_favorite } }),
    onMutate: ({ is_favorite }) => {
      // The server stamps its own time; this one just puts a new favorite at the top until the refetch.
      const favorited_at = is_favorite ? new Date().toISOString() : null
      // A refetch already in flight would overwrite this change with older data.
      void queryClient.cancelQueries({ queryKey: boardKeys.list() })
      queryClient.setQueryData<BoardSummary[]>(boardKeys.list(), (boards) =>
        boards?.map((board) => (board.slug === boardSlug ? { ...board, is_favorite, favorited_at } : board))
      )
      update((board) => {
        board.is_favorite = is_favorite
        board.favorited_at = favorited_at
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
