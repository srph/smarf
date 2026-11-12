import type { QueryKey } from '@tanstack/react-query'
import { Board, ID } from '~/src/types/api'

/** A category's position or size mid-drag/resize, shown on top of the cached board until it's saved. */
export interface CategoryDraft {
  id: ID
  x_position?: number
  y_position?: number
  width?: number
  height?: number
}

/** What each board operation gets. The query cache is the source of truth for the board. */
export interface BoardOperationProps {
  boardId: ID
  /** The board's query key. Also used as every board mutation's key, so the toolbar can tell when anything is saving. */
  boardKey: QueryKey
  /** The cached board, read when called (never a stale render's copy). */
  getBoard: () => Board
  /** Write the board to the query cache, so every view of it updates. */
  setBoard: (board: Board) => void
  setDraft: (draft: CategoryDraft | null) => void
  /** A save failed: drop any draft and refetch the board so the UI matches the server again. */
  rollback: () => void
  setIsEditing: (isEditing: boolean) => void
}

/** What a board operation gives the workspace: the action, and whether its request is in flight. */
export interface BoardOperation<TMutate> {
  mutate: TMutate
  isPending: boolean
}
