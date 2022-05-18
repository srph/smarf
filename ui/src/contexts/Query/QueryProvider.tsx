import React, { useCallback } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useOriginalQuery,
  useMutation as useOriginalMutation,
  UseQueryOptions as UseOriginalQueryOptions,
  UseMutationOptions
} from 'react-query'
import { axios } from '~/src/lib/axios'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const QueryProvider: React.FC = ({ children }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

interface UseQueryOptions<T> extends UseOriginalQueryOptions<T> {
  headers?: Record<string, string>
}

function useQuery<T = any>(url: string, opts: UseQueryOptions<T>) {
  const fetcher = useCallback(() => {
    const axiosOptions = opts?.headers ? { headers: opts.headers } : null
    return axios.get(url, axiosOptions).then((res) => res.data)
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
      return axios[operation](endpoint, variables).then((res) => res.data)
    },
    [url, operation]
  )

  return useOriginalMutation<TResponse, unknown, TVariables>(mutationFn, opts)
}

type MutationReturnType = ReturnType<typeof useMutation>

type QueryReturnType = ReturnType<typeof useQuery>

export { QueryProvider, useQuery, useMutation, QueryReturnType, MutationReturnType }
