import { Category } from '~/src/types/api'
import { getCategoryHeight } from '~/src/contexts/board-list/utils'
import { BoardOperationProps } from './types'

interface PretendMutationReturnType {
  mutate: (v: { container: Category; width: number }) => void
}

/** While resizing a category: track its size as a draft (saved by useResizeCategoryMutation). */
const useResizeCategoryFn = ({ setDraft }: BoardOperationProps): PretendMutationReturnType => {
  const mutate = ({ container, width }: { container: Category; width: number }) => {
    setDraft({
      id: container.id,
      width,
      height: getCategoryHeight({
        categoryWidth: width,
        heroCount: container.heroes.length
      })
    })
  }

  return { mutate }
}

export { useResizeCategoryFn }
