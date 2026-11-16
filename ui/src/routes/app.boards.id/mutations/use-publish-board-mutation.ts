import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/use-board-cache'
import { type Slug } from '~/src/types/api'

interface PublishBoardVariables {
  is_public: boolean
}

/** Make a board public (anyone with its link can view it) or private again. The board shows the change right away. */
const usePublishBoardMutation = (boardSlug: Slug) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardSlug)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ is_public }: PublishBoardVariables) =>
      http(`boards/${boardSlug}/public`, { method: 'PUT', body: { is_public } }),
    onMutate: ({ is_public }) => {
      update((board) => {
        board.is_public = is_public
      })
    }
  })
}

export { usePublishBoardMutation }
