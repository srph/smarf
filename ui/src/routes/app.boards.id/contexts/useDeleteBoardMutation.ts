import immer from 'immer'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { DivdedQueryAndMutationProps } from './types'

const useDeleteBoardMutation = ({ board, setBoard, setIsEditing }: DivdedQueryAndMutationProps): MutationReturnType => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  return useMutation<{}, null>(`/boards/${board?.id}`, 'delete', {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['/boards'] })

      navigate('/')

      // @TODO: Toast
    },
    onError() {
      // @TODO: Toast
    }
  })
}

export { useDeleteBoardMutation }
