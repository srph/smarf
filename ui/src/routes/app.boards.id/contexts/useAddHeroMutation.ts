import immer from 'immer'
import { v4 as uuid } from 'uuid'
import { useMutation, MutationReturnType } from '~/src/contexts/Query'
import { ORDER_FIRST_BUFFER, ORDER_LAST_BUFFER } from '~/src/contexts/BoardList/constants'
import { last } from '~/src/utils'
import { Category, Hero, HeroCategoryPivot, ID } from '~/src/types/api'
import { getCategoryHeight } from '~/src/contexts/BoardList/utils'
import { DivdedQueryAndMutationProps } from './types'

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

const useAddHeroMutation = ({
  board,
  boardRef,
  setBoard,
  setIsEditing
}: DivdedQueryAndMutationProps): CustomMutationReturnType => {
  const { mutate: mutateFn, ...props } = useMutation<AddHeroMutationResponse, AddHeroMutationVariables>(
    (v) => `/categories/${v.category_id}/heroes`,
    'post',
    {
      onSuccess(data, v) {
        // Silently apply so we have the correct uuid. Otherwise, adding a hero then moving it
        // would fail when we try to persist it to the API.
        // Also, we are using ref here as this fires way before board state gets updated.
        setBoard(
          immer(boardRef.current, (draft) => {
            const category = draft.categories.find((c) => c.id === v.category_id)
            const hero = category.heroes.find((h) => h.pivot.id === v.hero_buffer_id)
            hero.pivot = data.hero.pivot
          })
        )
      },
      onError() {
        // @TODO: Rollback
      }
    }
  )

  const mutate = (category: Category, hero: Hero) => {
    const categoryHeight = getCategoryHeight({
      categoryWidth: category.width,
      heroCount: category.heroes.length + 1
    })

    // @TODO: Use getHeroOrder utility
    const heroOrder = category.heroes.length
      ? last(category.heroes).pivot.order + ORDER_LAST_BUFFER
      : ORDER_FIRST_BUFFER

    const heroBufferId = uuid()

    setBoard(
      immer(board, (draft) => {
        const boardCategory = draft.categories.find((c) => c.id === category.id)

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

export { useAddHeroMutation, AddHeroMutationVariables }
