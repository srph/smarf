import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/boards/board-keys'
import { type Board, type ID } from '~/src/types/api'

/** A board with its categories and their heroes. */
const boardQueryOptions = (boardId: ID) =>
  queryOptions({
    queryKey: boardKeys.detail(boardId),
    queryFn: async ({ signal }) => (await http<{ board: Board }>(`boards/${boardId}`, { signal })).board
  })

const useBoardQuery = (boardId: ID) => useQuery(boardQueryOptions(boardId))

export { useBoardQuery }
