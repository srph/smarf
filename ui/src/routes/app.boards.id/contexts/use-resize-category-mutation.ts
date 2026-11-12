import { produce } from 'immer'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Category, ID } from '~/src/types/api'
import { BoardOperationProps, BoardOperation } from './types'

interface ResizeCategoryMutationVariables {
  category_id: ID
  width: number
  height: number
}

type MutationFn = (v: { container: Category }) => void

type MutationReturnType = BoardOperation<MutationFn>

/** On resize end: write the new size to the cache, drop the draft, and save it. */
const useResizeCategoryMutation = ({
  boardKey,
  getBoard,
  setBoard,
  setDraft,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, ResizeCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/resize`,
    'put',
    {
      mutationKey: boardKey,
      onError: rollback
    }
  )

  // `container` comes from the rendered board, so it already has the resized width and height.
  const mutate: MutationFn = ({ container }) => {
    setBoard(
      produce(getBoard(), (draft) => {
        const category = draft.categories.find((c) => c.id === container.id)
        if (!category) return
        category.width = container.width
        category.height = container.height
      })
    )
    setDraft(null)

    mutateFn({
      category_id: container.id,
      width: container.width,
      height: container.height
    })
  }

  return {
    mutate,
    ...props
  }
}

export { useResizeCategoryMutation, type ResizeCategoryMutationVariables }
