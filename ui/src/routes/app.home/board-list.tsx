import React from 'react'
import { type BoardSummary } from '~/src/types/api'
import { BoardListItem } from './board-list-item'

interface Props {
  title: string
  boards: BoardSummary[]
}

const BoardList: React.FC<Props> = ({ title, boards }) => {
  return (
    <div className="mx-auto w-120 pb-12">
      <h5 className="mt-5 mb-4 text-xs font-bold text-zinc-300">{title}</h5>

      {boards.map((board) => (
        <BoardListItem key={board.id} board={board} />
      ))}
    </div>
  )
}

export { BoardList }
