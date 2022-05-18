import immer from 'immer'
import { Category } from '~/src/types/api'
import { getCategoryHeight } from '~/src/contexts/BoardList/utils'
import { DivdedQueryAndMutationProps } from './types'

interface PretendMutationReturnType {
  mutate: (v: { container: Category; width: number }) => void
}

const useResizeCategoryFn = ({
  board,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): PretendMutationReturnType => {
  const mutate = ({ container, width }) => {
    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((category) => category.id === container.id)
        boardCategory.width = width
        boardCategory.height = getCategoryHeight({
          categoryWidth: width,
          heroCount: boardCategory.heroes.length
        })
      })
    )
  }

  return { mutate }
}

export { useResizeCategoryFn }
