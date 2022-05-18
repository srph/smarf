import immer from 'immer'
import { useQueryClient } from 'react-query'
import { useMutation } from '~/src/contexts/Query'
import { DivdedQueryAndMutationProps, CustomMutationReturnType } from './types'

interface FavoriteBoardMutationVariables {
  is_favorite: boolean
}

type MutationReturnType = CustomMutationReturnType<Function>

const useFavoriteBoardMutation = ({
  board,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const { mutate: mutateFn, ...props } = useMutation<{}, FavoriteBoardMutationVariables>(
    (v) => `/boards/${board?.id}/favorite`,
    'put',
    {
      onSuccess: () => {
        // @TODO: Toast
        queryClient.invalidateQueries('/boards')
      }
    }
  )

  const mutate = () => {
    const updatedFavoriteStatus = !board.is_favorite

    setBoard(
      immer(board, (draft) => {
        draft.is_favorite = updatedFavoriteStatus
      })
    )

    mutateFn({ is_favorite: updatedFavoriteStatus })
  }

  return {
    mutate,
    ...props
  }
}

export { useFavoriteBoardMutation, FavoriteBoardMutationVariables }
