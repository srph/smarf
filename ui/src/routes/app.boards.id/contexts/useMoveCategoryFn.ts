import immer from 'immer'
import { Category, Translate } from '~/src/types/api'
import { DivdedQueryAndMutationProps } from './types'

interface MutationReturnType {
  mutate: (v: { container: Category; translate: Translate }) => void
}

const useDeleteBoardMutation = ({ board, setBoard, setIsEditing }: DivdedQueryAndMutationProps): MutationReturnType => {
  const mutate = ({ container, translate: { x, y } }) => {
    setBoard(
      immer(board, (draft) => {
        const selectedCategory = draft.categories.find((c) => c.id === container.id)
        selectedCategory.x_position = x
        selectedCategory.y_position = y
      })
    )
  }

  return { mutate }
}

export { useDeleteBoardMutation }
