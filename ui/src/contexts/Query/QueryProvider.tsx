import React, { useCallback } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useOriginalQuery,
  useMutation as useOriginalMutation,
  UseQueryOptions,
  UseMutationOptions
} from 'react-query'
import { axios } from '~/src/contexts/Axios'

const client = new QueryClient()

const QueryProvider: React.FC = ({ children }) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function useQuery<T = any>(url: string, opts: UseQueryOptions<T>) {
  const fetcher = useCallback(() => {
    return axios.get(url).then((res) => res.data)
  }, [url, opts?.queryKey])

  return useOriginalQuery<T>(opts?.queryKey || url, fetcher, opts)
}

type MutationOperation = 'post' | 'put'

function useMutation<T = any, U = any>(url: string, operation: MutationOperation, opts: UseMutationOptions<T>) {
  const mutationFn = useCallback(
    (variables) => {
      return axios[operation](url, variables).then((res) => res.data)
    },
    [url, operation]
  )

  return useOriginalMutation<T>(mutationFn, opts)
}

export { QueryProvider, useQuery, useMutation }
