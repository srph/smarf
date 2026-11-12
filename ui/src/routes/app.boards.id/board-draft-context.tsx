import React, { createContext, useContext, useMemo, useState } from 'react'
import { type Board, type ID } from '~/src/types/api'

/** A category's position or size mid-drag/resize, shown on top of the saved board until it's saved. */
interface CategoryDraft {
  id: ID
  x_position?: number
  y_position?: number
  width?: number
  height?: number
}

interface BoardDraftContextType {
  /** The board as shown: the cached board with any in-progress drag or resize applied. */
  board: Board
  /** Show a drag or resize in progress. Clear it (null) in the same tick as the mutation that saves it. */
  setDraft: (draft: CategoryDraft | null) => void
}

const BoardDraftContext = createContext<BoardDraftContextType | null>(null)

interface Props {
  /** The cached board (from useBoardQuery). */
  board: Board
}

const BoardDraftProvider: React.FC<React.PropsWithChildren<Props>> = ({ board: savedBoard, children }) => {
  const [draft, setDraft] = useState<CategoryDraft | null>(null)

  const board = useMemo(() => withDraft(savedBoard, draft), [savedBoard, draft])

  return <BoardDraftContext.Provider value={{ board, setDraft }}>{children}</BoardDraftContext.Provider>
}

function withDraft(board: Board, draft: CategoryDraft | null): Board {
  if (!draft) return board

  const { id, ...changes } = draft

  return {
    ...board,
    categories: board.categories.map((category) => (category.id === id ? { ...category, ...changes } : category))
  }
}

const useBoardDraft = () => {
  const context = useContext(BoardDraftContext)
  if (!context) throw new Error('useBoardDraft must be used inside BoardDraftProvider')
  return context
}

export { BoardDraftProvider, useBoardDraft }
