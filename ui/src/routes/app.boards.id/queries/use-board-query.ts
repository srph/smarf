import { queryOptions, useQuery } from '@tanstack/react-query'
import { http, HttpError } from '~/src/lib/http'
import { boardKeys } from '~/src/queries/query-keys'
import { type Board, type Slug } from '~/src/types/api'

/** A board with its categories and their heroes. */
const boardQueryOptions = (boardSlug: Slug) =>
  queryOptions({
    queryKey: boardKeys.detail(boardSlug),
    queryFn: async ({ signal }) => (await http<{ board: Board }>(`boards/${boardSlug}`, { signal })).board,
    // A 404 (missing, or private and not theirs) won't change on a retry; anything else gets the usual three.
    retry: (failureCount, error) => !(error instanceof HttpError && error.status === 404) && failureCount < 3
  })

const useBoardQuery = (boardSlug: Slug) => useQuery(boardQueryOptions(boardSlug))

export { useBoardQuery }
