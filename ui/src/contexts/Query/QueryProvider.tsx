import React, { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useTanstackQuery,
  useMutation as useTanstackMutation,
  type QueryKey,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query'
import { http } from '~/src/lib/http'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      }
    }
  })

// One client per provider, so each mounted app (and each test) gets its own cache.
const QueryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [client] = useState(createQueryClient)

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

interface UseQueryOptionsWithUrl<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  /** Defaults to `[url]`. */
  queryKey?: QueryKey
  headers?: Record<string, string>
}

/** GET `url` from the API. */
function useQuery<T = any>(url: string, { queryKey, headers, ...opts }: UseQueryOptionsWithUrl<T> = {}) {
  return useTanstackQuery<T>({
    queryKey: queryKey ?? [url],
    queryFn: ({ signal }) => http<T>(url, { headers, signal }),
    ...opts
  })
}

type MutationOperation = 'post' | 'put' | 'delete'

type Fetcher<T> = string | ((variables: T) => string)

const METHODS = { post: 'POST', put: 'PUT', delete: 'DELETE' } as const

/** POST/PUT/DELETE to the API. `url` can depend on the variables. DELETE sends no body. */
function useMutation<TResponse = {}, TVariables = {}>(
  url: Fetcher<TVariables>,
  operation: MutationOperation,
  opts: Omit<UseMutationOptions<TResponse, unknown, TVariables>, 'mutationFn'> = {}
) {
  return useTanstackMutation<TResponse, unknown, TVariables>({
    mutationFn: (variables: TVariables) =>
      http<TResponse>(typeof url === 'function' ? url(variables) : url, {
        method: METHODS[operation],
        body: operation === 'delete' ? undefined : variables
      }),
    ...opts
  })
}

type MutationReturnType = ReturnType<typeof useMutation>

type QueryReturnType = ReturnType<typeof useQuery>

export { QueryProvider, useQuery, useMutation, type QueryReturnType, type MutationReturnType }
