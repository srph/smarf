import { type ID } from '~/src/types/api'

/** Query and mutation keys for boards. Everything sits under `all`, so one call can invalidate every board query. */
const boardKeys = {
  all: ['boards'] as const,
  list: () => [...boardKeys.all, 'list'] as const,
  detail: (id: ID) => [...boardKeys.all, 'detail', id] as const
}

export { boardKeys }
