import { queryOptions, useQuery } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { type Hero } from '~/src/types/api'

/** Every hero, sorted by name. The list never changes while the app is open, so it's fetched once. */
const heroesQueryOptions = () =>
  queryOptions({
    queryKey: ['heroes'],
    queryFn: async ({ signal }) => (await http<{ heroes: Hero[] }>('heroes', { signal })).heroes,
    staleTime: Infinity
  })

/** `select` derives what the caller needs; keep it stable (module-level) so it doesn't rerun every render. */
const useHeroesQuery = <T = Hero[]>(select?: (heroes: Hero[]) => T) => useQuery({ ...heroesQueryOptions(), select })

export { heroesQueryOptions, useHeroesQuery }
