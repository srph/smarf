import React, { createContext, useContext, useMemo, useState } from 'react'
import { Container } from '~/src/components/container/container'
import { ErrorState } from '~/src/components/error-state/error-state'
import { PageSpinner } from '~/src/components/page-spinner/page-spinner'
import { type Board, type ID } from '~/src/types/api'
import { useBoardQuery } from './queries/use-board-query'

/** A category's position or size mid-drag/resize, shown on top of the saved board until it's saved. */
interface CategoryDraft {
  id: ID
  x_position?: number
  y_position?: number
  width?: number
  height?: number
}

interface BoardContextType {
  /** The board as shown: the cached board with any in-progress drag or resize applied. */
  board: Board
  /** Show a drag or resize in progress. Clear it (null) right after calling the mutation that saves it. */
  setDraft: (draft: CategoryDraft | null) => void
}

const BoardContext = createContext<BoardContextType | null>(null)

interface Props {
  boardId: ID
}

/** Loads the board (with pending and error states) and holds the drag/resize draft shown on top of it. */
const BoardProvider: React.FC<React.PropsWithChildren<Props>> = ({ boardId, children }) => {
  // The query and the draft live in the same component on purpose. Clearing the draft right after mutate()
  // re-renders this component, which then reads the cache fresh, already holding the mutation's change. Passing
  // the board in as a prop instead would show the old position for a frame.
  const { data: savedBoard, status, refetch, isFetching } = useBoardQuery(boardId)

  const [draft, setDraft] = useState<CategoryDraft | null>(null)

  const board = useMemo(() => savedBoard && withDraft(savedBoard, draft), [savedBoard, draft])

  if (status === 'pending') {
    return <PageSpinner />
  }

  if (status === 'error') {
    return (
      <Container>
        <ErrorState
          className="py-12"
          message="Couldn't load this board. Check your connection and try again."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </Container>
    )
  }

  if (!board) return null

  return <BoardContext.Provider value={{ board, setDraft }}>{children}</BoardContext.Provider>
}

function withDraft(board: Board, draft: CategoryDraft | null): Board {
  if (!draft) return board

  const { id, ...changes } = draft

  return {
    ...board,
    categories: board.categories.map((category) => (category.id === id ? { ...category, ...changes } : category))
  }
}

const useBoard = () => {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useBoard must be used inside BoardProvider')
  return context
}

export { BoardProvider, useBoard }
