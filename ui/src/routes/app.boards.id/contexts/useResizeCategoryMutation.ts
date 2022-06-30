import immer from 'immer'
import { useMutation } from '~/src/contexts/Query'
import { Board, Category } from '~/src/types/api'
import { DivdedQueryAndMutationProps, CustomMutationReturnType } from './types'

interface ResizeCategoryMutationResponse {
  board: Board
}

interface ResizeCategoryMutationVariables {
  name: string
}

type MutationFn = (v: { container: Category }) => void

type MutationReturnType = CustomMutationReturnType<MutationFn>

const useResizeCategoryMutation = ({
  board,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<ResizeCategoryMutationResponse, ResizeCategoryMutationVariables>(
    (v) => `/categories/${v.category_id}/resize`,
    'put',
    {
      onSuccess() {
        // @TODO: Silently apply so we have the correct uuid
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  const mutate = ({ container }) => {
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

export { useResizeCategoryMutation, ResizeCategoryMutationVariables }
