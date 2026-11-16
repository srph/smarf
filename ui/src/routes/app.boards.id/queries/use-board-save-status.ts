import { useMutationState } from '@tanstack/react-query'
import { boardKeys } from '~/src/queries/query-keys'
import { type Slug } from '~/src/types/api'

type BoardSaveStatus = 'saving' | 'saved' | 'error'

/** Whether any save for this board is in flight, and otherwise whether the latest one failed. */
const useBoardSaveStatus = (boardSlug: Slug): BoardSaveStatus => {
  const statuses = useMutationState({
    filters: { mutationKey: boardKeys.detail(boardSlug) },
    select: (mutation) => mutation.state.status
  })

  if (statuses.includes('pending')) return 'saving'

  return statuses.at(-1) === 'error' ? 'error' : 'saved'
}

export { useBoardSaveStatus, type BoardSaveStatus }
