import React, { useCallback, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useOriginalQuery,
  useMutation as useOriginalMutation,
  UseQueryOptions as UseOriginalQueryOptions,
  UseMutationOptions
} from 'react-query'
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

interface UseQueryOptions<T> extends UseOriginalQueryOptions<T> {
  headers?: Record<string, string>
}

function useQuery<T = any>(url: string, opts: UseQueryOptions<T>) {
  const fetcher = useCallback(() => {
    return http<T>(url, { headers: opts?.headers })
  }, [url, opts?.queryKey])

  return useOriginalQuery<T>(opts?.queryKey || url, fetcher, opts)
}

type MutationOperation = 'post' | 'put' | 'delete'

type Fetcher<T> = string | ((variables: T) => string)

function useMutation<TResponse = {}, TVariables = {}>(
  url: Fetcher<TVariables>,
  operation: MutationOperation,
  opts: UseMutationOptions<TResponse, unknown, TVariables>
) {
  const mutationFn = useCallback(
    (variables: TVariables) => {
      const endpoint = typeof url === 'function' ? url(variables) : url
      // Like axios before: DELETE sends no body.
      return http<TResponse>(endpoint, {
        method: operation === 'post' ? 'POST' : operation === 'put' ? 'PUT' : 'DELETE',
        body: operation === 'delete' ? undefined : variables
      })
    },
    [url, operation]
  )

  return useOriginalMutation<TResponse, unknown, TVariables>(mutationFn, opts)
}

type MutationReturnType = ReturnType<typeof useMutation>

type QueryReturnType = ReturnType<typeof useQuery>

export { QueryProvider, useQuery, useMutation, type QueryReturnType, type MutationReturnType }
