import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type User } from '~/src/types/api'

/** The logged-in user. */
const meQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: async ({ signal }) => (await http<{ user: User }>('auth/me', { signal })).user,
    // An expired token should send the user to login right away, not after retries.
    retry: false
  })

/** Pass `enabled: false` while there's no token to ask with. */
const useMeQuery = ({ enabled }: { enabled: boolean }) => useQuery({ ...meQueryOptions(), enabled })

export { useMeQuery }
