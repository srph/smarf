import React from 'react'
import { cn } from 'cn'
import { useBoardList } from '~/src/contexts/board-list/board-list-provider'
import { Icon } from '~/src/components/icon/icon'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { TimeAgo } from '~/src/components/time-ago/time-ago'
import { Link } from 'react-router'
import { Board } from '~/src/types/api'
import { StarIcon } from '@heroicons/react/20/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface Props {
  title: string
  boards: Board[]
}

const BoardList: React.FC<Props> = ({ title, boards }) => {
  const { favoriteBoard } = useBoardList()

  return (
    <div className="mx-auto w-120">
      <h5 className="mt-5 mb-4 text-xs font-bold text-zinc-300">{title}</h5>

      {boards.map((board) => (
        <div
          key={board.id}
          className="flex items-center rounded bg-zinc-700 ring-2 ring-transparent transition-all duration-200 not-last:mb-4 hover:ring-sky-500">
          <Link to={`/b/${board.id}`} className="flex w-full items-center justify-between p-4 pr-0">
            <h3 className="my-4.5 text-lg font-medium">{board.name}</h3>
            <span className="text-xs text-zinc-400">
              <TimeAgo time={board.updated_at} />
            </span>
          </Link>

          <PlainButton type="button" onClick={() => favoriteBoard(board.id)}>
            <div className={cn('p-4', board.is_favorite ? 'text-yellow-500' : 'text-zinc-400')}>
              <Icon icon={board.is_favorite ? StarIcon : StarOutlineIcon} size={24} />
            </div>
          </PlainButton>
        </div>
      ))}
    </div>
  )
}

export { BoardList }
