import { queryOptions, useQuery } from '@tanstack/react-query'
import { http, HttpError } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { type Board, type ID } from '~/src/types/api'

/** A board with its categories and their heroes. */
const boardQueryOptions = (boardId: ID) =>
  queryOptions({
    queryKey: boardKeys.detail(boardId),
    queryFn: async ({ signal }) => (await http<{ board: Board }>(`boards/${boardId}`, { signal })).board,
    // A 404 (missing, or private and not theirs) won't change on a retry; anything else gets the usual three.
    retry: (failureCount, error) => !(error instanceof HttpError && error.status === 404) && failureCount < 3
  })

const useBoardQuery = (boardId: ID) => useQuery(boardQueryOptions(boardId))

export { useBoardQuery }
