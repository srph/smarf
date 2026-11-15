import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { useBoardCache } from '~/src/queries/boards/use-board-cache'
import { type ID } from '~/src/types/api'

interface PublishBoardVariables {
  is_public: boolean
}

/** Make a board public (anyone with its link can view it) or private again. The board shows the change right away. */
const usePublishBoardMutation = (boardId: ID) => {
  const { optimisticSaveOptions, update } = useBoardCache(boardId)

  return useMutation({
    ...optimisticSaveOptions,
    mutationFn: ({ is_public }: PublishBoardVariables) =>
      http(`boards/${boardId}/public`, { method: 'PUT', body: { is_public } }),
    onMutate: ({ is_public }) => {
      update((board) => {
        board.is_public = is_public
      })
    }
  })
}

export { usePublishBoardMutation }
