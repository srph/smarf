import React, { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from 'cn'
import { Link } from 'react-router'
import { useFavoriteBoardMutation } from '~/src/queries/boards/use-favorite-board-mutation'
import { FavoriteIcon } from '~/src/components/favorite-icon/favorite-icon'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { TimeAgo } from '~/src/components/time-ago/time-ago'
import { type BoardSummary } from '~/src/types/api'

// Starts after the star's pop has begun (FavoriteIcon), so the pop is seen before the row slides away.
const moveTransition = { duration: 0.3, ease: [0.2, 0.8, 0.3, 1], delay: 0.15 } as const

interface Props {
  board: BoardSummary
}

const BoardListItem: React.FC<Props> = ({ board }) => {
  const { mutate: favoriteBoard } = useFavoriteBoardMutation(board.id)

  // The row whose star was just toggled slides past the others; keep it on top of them until it lands.
  const [isMoving, setIsMoving] = useState(false)

  const [previousIsFavorite, setPreviousIsFavorite] = useState(board.is_favorite)

  if (board.is_favorite !== previousIsFavorite) {
    setPreviousIsFavorite(board.is_favorite)
    setIsMoving(true)
  }

  return (
    // layout="position": when favoriting re-sorts the list, rows slide to their new places instead of jumping.
    <motion.div
      layout="position"
      transition={moveTransition}
      onLayoutAnimationComplete={() => setIsMoving(false)}
      className={cn(
        'relative flex items-center rounded bg-zinc-700 ring-2 ring-transparent transition-shadow duration-200 not-last:mb-4 hover:ring-sky-500',
        isMoving && 'z-(--z-board-list-moving-item)'
      )}>
      <Link to={`/b/${board.id}`} className="flex w-full items-center justify-between p-4 pr-0">
        <h3 className="my-4.5 text-lg font-medium">{board.name}</h3>
        <span className="text-xs text-zinc-400">
          <TimeAgo time={board.updated_at} />
        </span>
      </Link>

      <PlainButton
        type="button"
        title={board.is_favorite ? 'Unfavorite board' : 'Favorite board'}
        onClick={() => favoriteBoard({ is_favorite: !board.is_favorite })}>
        <div className="p-4 text-zinc-400">
          <FavoriteIcon value={board.is_favorite} size={24} />
        </div>
      </PlainButton>
    </motion.div>
  )
}

export { BoardListItem }
