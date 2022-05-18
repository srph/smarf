import immer from 'immer'
import { useQueryClient } from 'react-query'
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
  const queryClient = useQueryClient()

  const { mutate: mutateFn, ...props } = useMutation<ResizeCategoryMutationResponse, ResizeCategoryMutationVariables>(
    `/boards/${board?.id}`,
    'put',
    {
      onSuccess(data) {
        queryClient.invalidateQueries('/boards')

        setBoard({
          ...board,
          name: data.board.name
        })

        setIsEditing(false)
      },

      onError() {
        // Toast
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
