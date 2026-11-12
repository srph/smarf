import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// No MutationCache `onMutate` here: board mutations rely on their own `onMutate` running synchronously inside
// `mutate()`, and a cache-level one would add an `await` before it.
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

export { QueryProvider }
