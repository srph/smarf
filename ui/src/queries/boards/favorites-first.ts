import { type BoardSummary } from '~/src/types/api'

/**
 * A `select` for `useBoardsQuery`: favorites first, the latest favorited on top.
 * The rest keep the API's order (newest first); toSorted is stable.
 */
const favoritesFirst = (boards: BoardSummary[]) =>
  boards.toSorted((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || favoritedTime(b) - favoritedTime(a))

const favoritedTime = (board: BoardSummary) =>
  board.is_favorite && board.favorited_at ? Date.parse(board.favorited_at) : 0

export { favoritesFirst }
