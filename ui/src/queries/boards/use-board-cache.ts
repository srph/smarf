import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { produce, type Draft } from 'immer'
import { type Board, type ID } from '~/src/types/api'
import { boardKeys } from './board-keys'

// Boards with a failed save, waiting for their other saves to finish before refetching. Per client, so tests don't share it.
const needsRefetch = new WeakMap<QueryClient, Set<ID>>()

/**
 * What every mutation that saves a board shares. The cached board (`boardKeys.detail`) is the source of truth:
 * mutations change it in `onMutate`, before the request.
 */
const useBoardCache = (boardId: ID) => {
  const queryClient = useQueryClient()

  const queryKey = boardKeys.detail(boardId)

  const saveOptions = {
    // Shared by every save for this board, so the toolbar can show the latest one's status.
    mutationKey: queryKey,
    // One board's saves run one at a time, so they reach the API in the order they were made.
    scope: { id: `board:${boardId}` }
  }

  const optimisticSaveOptions = {
    ...saveOptions,
    onError: () => {
      const boards = needsRefetch.get(queryClient) ?? new Set<ID>()
      needsRefetch.set(queryClient, boards.add(boardId))
    },
    // After a failed save, refetch so the board matches the server again. Wait for the last queued save:
    // refetching earlier would drop the changes of saves that haven't reached the server yet.
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: queryKey }) > 1) return
      if (!needsRefetch.get(queryClient)?.delete(boardId)) return
      void queryClient.invalidateQueries({ queryKey })
    }
  }

  /**
   * Change the cached board. Synchronous on purpose: called from `onMutate` (before any `await`), it lands in
   * the same tick as `mutate()`, so a caller can drop its drag draft right after without the board flickering.
   */
  const update = (recipe: (board: Draft<Board>) => void) => {
    // A refetch already in flight would overwrite this change with older data.
    void queryClient.cancelQueries({ queryKey })
    queryClient.setQueryData<Board>(queryKey, (board) => board && produce(board, recipe))
  }

  return { saveOptions, optimisticSaveOptions, update }
}

export { useBoardCache }
