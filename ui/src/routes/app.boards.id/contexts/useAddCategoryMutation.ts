import immer from 'immer'
import { v4 as uuid } from 'uuid'
import { useMutation } from '~/src/contexts/Query'
import { Category, HeroCategoryPivot, ID } from '~/src/types/api'
import { CATEGORY_BODY_INITIAL_WIDTH, CATEGORY_SPACING } from '~/src/contexts/BoardList/constants'
import { getCategoryHeight, getLowestCategoryBottom } from '~/src/contexts/BoardList/utils'
import { DivdedQueryAndMutationProps, CustomMutationReturnType } from './types'

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

type MutationReturnType = CustomMutationReturnType<Function>

const useAddCategoryMutation = ({
  board,
  boardRef,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): MutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<AddCategoryMutationResponse, AddCategoryMutationVariables>(
    `/boards/${board?.id}/categories`,
    'post',
    {
      onSuccess(data, v) {
        // Silently apply so we have the correct uuid
        setBoard(
          immer(boardRef.current, (draft) => {
            const index = draft.categories.findIndex((c) => c.id === v.category_buffer_id)
            if (index === -1) return // @TODO: Throw
            draft.categories[index] = data.category
          })
        )
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  // @TODO: Turn into a reusable function that we may reuse this when
  // adding categories to a new board.
  const mutate = () => {
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
      immer(board, (draft) => {
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

export { useAddCategoryMutation, AddCategoryMutationVariables }
