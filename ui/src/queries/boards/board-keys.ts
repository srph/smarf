import { type Slug } from '~/src/types/api'

/** Query and mutation keys for boards. Everything sits under `all`, so one call can invalidate every board query. */
const boardKeys = {
  all: ['boards'] as const,
  list: () => [...boardKeys.all, 'list'] as const,
  detail: (slug: Slug) => [...boardKeys.all, 'detail', slug] as const
}

export { boardKeys }
