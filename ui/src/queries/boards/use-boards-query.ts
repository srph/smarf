import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type BoardSummary } from '~/src/types/api'
import { boardKeys } from './board-keys'

/** The logged-in user's boards, newest first. */
const boardsQueryOptions = () =>
  queryOptions({
    queryKey: boardKeys.list(),
    queryFn: async ({ signal }) => (await http<{ boards: BoardSummary[] }>('boards', { signal })).boards,
    // Moving between home and a board within a minute reuses the list. Our own changes invalidate it right away.
    staleTime: 60_000
  })

/** `select` derives what the caller needs; keep it stable (module-level) so it doesn't rerun every render. */
const useBoardsQuery = <T = BoardSummary[]>(select?: (boards: BoardSummary[]) => T) =>
  useQuery({ ...boardsQueryOptions(), select })

export { boardsQueryOptions, useBoardsQuery }
