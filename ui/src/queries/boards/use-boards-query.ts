import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type Board } from '~/src/types/api'
import { boardKeys } from './board-keys'

/** The logged-in user's boards, newest first. */
const boardsQueryOptions = () =>
  queryOptions({
    queryKey: boardKeys.list(),
    queryFn: async ({ signal }) => (await http<{ boards: Board[] }>('boards', { signal })).boards
  })

/** `select` derives what the caller needs; keep it stable (module-level) so it doesn't rerun every render. */
const useBoardsQuery = <T = Board[]>(select?: (boards: Board[]) => T) => useQuery({ ...boardsQueryOptions(), select })

export { boardsQueryOptions, useBoardsQuery }
