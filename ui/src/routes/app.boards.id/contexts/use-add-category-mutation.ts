import { produce } from 'immer'
import { v4 as uuid } from 'uuid'
import { useMutation } from '~/src/contexts/query/query-provider'
import { Category, HeroCategoryPivot, ID } from '~/src/types/api'
import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING } from '~/src/contexts/board-list/constants'
import { getCategoryHeight, getLowestCategoryBottom } from '~/src/contexts/board-list/utils'
import { BoardOperationProps, BoardOperation } from './types'

interface AddCategoryMutationResponse {
  category: Category
}

interface AddCategoryMutationVariables {
  category_buffer_id: ID
  name: string
  width: number
  height: number
  x_position: number
  y_position: number
}

type MutationReturnType = BoardOperation<() => void>

const useAddCategoryMutation = ({
  boardId,
  boardKey,
  getBoard,
  setBoard,
  rollback
}: BoardOperationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<AddCategoryMutationResponse, AddCategoryMutationVariables>(
    `/boards/${boardId}/categories`,
    'post',
    {
      mutationKey: boardKey,
      onSuccess(data, v) {
        // Swap the temporary category for the saved one, so later edits use the real id.
        setBoard(
          produce(getBoard(), (draft) => {
            const index = draft.categories.findIndex((c) => c.id === v.category_buffer_id)
            if (index === -1) return
            draft.categories[index] = data.category
          })
        )
      },
      onError: rollback
    }
  )

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const mutate = () => {
    const board = getBoard()

    const now = new Date().toISOString()

    const heroes: HeroCategoryPivot[] = []

    const category = {
      id: uuid(),
      name: 'Untitled',
      heroes,
      x_position: 0,
      y_position: getLowestCategoryBottom(board) + CATEGORY_SPACING,
      width: CATEGORY_BODY_INITIAL_WIDTH,
      height: getCategoryHeight({
        categoryWidth: CATEGORY_BODY_INITIAL_WIDTH,
        heroCount: 0
      }),
      created_at: now,
      updated_at: now
    }

    setBoard(
      produce(board, (draft) => {
        draft.categories.push(category)
      })
    )

    mutateFn({
      ...category,
      category_buffer_id: category.id
    })
  }

  return {
    mutate,
    ...props
  }
}

export { useAddCategoryMutation, type AddCategoryMutationVariables }
