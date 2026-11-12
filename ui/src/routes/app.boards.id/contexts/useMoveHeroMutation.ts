import { produce } from 'immer'
import { useMutation } from '~/src/contexts/Query'
import { ID } from '~/src/types/api'
import { arrayMove } from '@dnd-kit/sortable'
import { arrayTransfer } from '~/src/utils'
import { getCategoryHeight, getHeroOrder } from '~/src/contexts/BoardList/utils'
import { CustomGridCollisionDetectionEvent } from '~/src/routes/app.boards.id/BoardWorkspace/useGridCollisionDetection'
import { BoardOperation, BoardOperationProps } from './types'

interface MoveHeroMutationVariables {
  from_category_id: ID
  from_category_height: number
  to_category_id: ID
  to_category_height: number
  hero_pivot_id: ID
  hero_order: number
}

type MutationFn = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => void

type CustomMutationReturnType = BoardOperation<MutationFn>

const useMoveHeroMutation = ({
  boardKey,
  getBoard,
  setBoard,
  rollback
}: BoardOperationProps): CustomMutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<{}, MoveHeroMutationVariables>(
    (v) => `/categories/${v.from_category_id}/heroes/${v.hero_pivot_id}`,
    'put',
    {
      mutationKey: boardKey,
      onError: rollback
    }
  )

  const mutate = (from: CustomGridCollisionDetectionEvent, to: CustomGridCollisionDetectionEvent) => {
    setBoard(
      produce(getBoard(), (draft) => {
        if (from.container === to.container) {
          const category = draft.categories.find((c) => c.id === to.container)
          if (!category) return
          category.heroes = arrayMove(category.heroes, from.index, to.index)

          const order = getHeroOrder(category, to.index)
          category.heroes[to.index].pivot.order = order

          mutateFn({
            from_category_id: category.id,
            from_category_height: category.height,
            to_category_id: category.id,
            to_category_height: category.height,
            hero_pivot_id: category.heroes[to.index].pivot.id,
            hero_order: order
          })
        } else {
          const fromCategory = draft.categories.find((c) => c.id === from.container)

          const toCategory = draft.categories.find((c) => c.id === to.container)

          if (!fromCategory || !toCategory) return

          fromCategory.height = getCategoryHeight({
            categoryWidth: fromCategory.width,
            heroCount: fromCategory.heroes.length - 1
          })

          toCategory.height = getCategoryHeight({
            categoryWidth: toCategory.width,
            heroCount: toCategory.heroes.length + 1
          })

          arrayTransfer(fromCategory.heroes, toCategory.heroes, from.index, to.index)

          const order = getHeroOrder(toCategory, to.index)

          toCategory.heroes[to.index].pivot.order = order

          mutateFn({
            from_category_id: fromCategory.id,
            from_category_height: fromCategory.height,
            to_category_id: toCategory.id,
            to_category_height: toCategory.height,
            hero_pivot_id: toCategory.heroes[to.index].pivot.id,
            hero_order: order
          })
        }
      })
    )
  }

  return {
    mutate,
    ...props
  }
}

export { useMoveHeroMutation, type MoveHeroMutationVariables }
