import { produce } from 'immer'
import { v4 as uuid } from 'uuid'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { ORDER_FIRST_BUFFER, ORDER_LAST_BUFFER } from '~/src/contexts/BoardList/constants'
import { last } from '~/src/utils'
import { Category, Hero, HeroCategoryPivot, ID } from '~/src/types/api'
import { getCategoryHeight } from '~/src/contexts/BoardList/utils'
import { BoardOperationProps } from './types'

interface AddHeroMutationVariables {
  hero_id: ID
  hero_buffer_id: ID
  hero_order: number
  category_id: ID
  category_height: number
}

interface AddHeroMutationResponse {
  hero: HeroCategoryPivot
}

type MutationFn = (category: Category, hero: Hero) => void

type CustomMutationReturnType = Omit<MutationReturnType, 'mutate'> & { mutate: MutationFn }

const useAddHeroMutation = ({ boardKey, getBoard, setBoard, rollback }: BoardOperationProps): CustomMutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<AddHeroMutationResponse, AddHeroMutationVariables>(
    (v) => `/categories/${v.category_id}/heroes`,
    'post',
    {
      mutationKey: boardKey,
      onSuccess(data, v) {
        // Swap the temporary pivot for the saved one; moving the hero later needs the real id.
        setBoard(
          produce(getBoard(), (draft) => {
            const category = draft.categories.find((c) => c.id === v.category_id)
            const hero = category?.heroes.find((h) => h.pivot.id === v.hero_buffer_id)
            if (hero) hero.pivot = data.hero.pivot
          })
        )
      },
      onError: rollback
    }
  )

  const mutate = (category: Category, hero: Hero) => {
    const board = getBoard()
    const current = board.categories.find((c) => c.id === category.id) ?? category

    const categoryHeight = getCategoryHeight({
      categoryWidth: current.width,
      heroCount: current.heroes.length + 1
    })

    // @TODO: Use getHeroOrder utility
    const heroOrder = current.heroes.length ? last(current.heroes).pivot.order + ORDER_LAST_BUFFER : ORDER_FIRST_BUFFER

    const heroBufferId = uuid()

    setBoard(
      produce(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)
        if (!boardCategory) return
        boardCategory.heroes.push({
          ...hero,
          pivot: {
            id: heroBufferId,
            order: heroOrder
          }
        })
        boardCategory.height = categoryHeight
      })
    )

    mutateFn({
      hero_id: hero.id,
      hero_buffer_id: heroBufferId,
      hero_order: heroOrder,
      category_id: category.id,
      category_height: categoryHeight
    })
  }

  return {
    mutate,
    ...props
  }
}

export { useAddHeroMutation, type AddHeroMutationVariables }
