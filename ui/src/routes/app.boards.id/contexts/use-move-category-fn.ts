import { Category } from '~/src/types/api'
import { Translate } from '~/src/types/board-operations'
import { BoardOperationProps } from './types'

interface MutationReturnType {
  mutate: (v: { container: Category; translate: Translate }) => void
}

/** While dragging a category: track its position as a draft (saved on drop by useMoveEndCategoryMutation). */
const useMoveCategoryFn = ({ getBoard, setDraft }: BoardOperationProps): MutationReturnType => {
  const mutate = ({ container, translate: { x, y } }: { container: Category; translate: Translate }) => {
    const saved = getBoard().categories.find((c) => c.id === container.id)

    // Back where it started (e.g. a cancelled drag): nothing to show.
    if (saved && saved.x_position === x && saved.y_position === y) {
      setDraft(null)
      return
    }

    setDraft({ id: container.id, x_position: x, y_position: y })
  }

  return { mutate }
}

export { useMoveCategoryFn }
