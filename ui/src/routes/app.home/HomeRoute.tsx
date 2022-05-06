import React from 'react'
import { Navigate } from 'react-router-dom'
import { useBoardList } from '~/src/contexts/BoardList'

const HomeRoute = () => {
  const { boards } = useBoardList()

  if (!boards.length) {
    return null
  }

  return <Navigate to={`/boards/${boards[0].id}`} />
}

export { HomeRoute }
