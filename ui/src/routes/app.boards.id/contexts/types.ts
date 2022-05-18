import { MutableRefObject } from 'react'
import { Board } from '~/src/types/api'
import { MutationReturnType } from '~/src/contexts/Query'

export interface DivdedQueryAndMutationProps {
  board: Board
  boardRef: MutableRefObject<Board>
  setBoard: (b: Board) => void
  setIsEditing: (f: boolean) => void
}

export type CustomMutationReturnType<T> = Omit<MutationReturnType, 'mutate'> & { mutate: T }
