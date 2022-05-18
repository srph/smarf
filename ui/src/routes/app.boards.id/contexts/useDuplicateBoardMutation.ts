import immer from 'immer'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { DivdedQueryAndMutationProps } from './types'

const useDuplicateBoardMutation = ({
  board,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation(`/boards/${board?.id}/duplicate`, 'post', {
    onSuccess(data) {
      queryClient.invalidateQueries('/boards')

      navigate(`/b/${data.board.id}`)
      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })
}

export { useDuplicateBoardMutation }
