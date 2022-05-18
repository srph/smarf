import immer from 'immer'
import { useQueryClient } from 'react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { DivdedQueryAndMutationProps } from './types'

interface FavoriteBoardMutationVariables {
  is_favorite: boolean
}

const useFavoriteBoardMutation = ({
  board,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  return useMutation<FavoriteBoardMutationVariables>((v) => `/boards/${board?.id}/favorite`, 'put', {
    onSuccess: (data) => {
      // @TODO: Toast
      queryClient.invalidateQueries('/boards')
    }
  })
}

export { useFavoriteBoardMutation, FavoriteBoardMutationVariables }
