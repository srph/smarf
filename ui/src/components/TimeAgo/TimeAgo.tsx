import React, { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { useInterval } from '~/src/hooks'

interface Props {
  time: string
  interval?: number
}

const TimeAgo: React.FC<Props> = ({ time, interval = 1000 * 60 }) => {
  const [timeAgo, setTimeAgo] = useState(() => {
    return formatDistanceToNowStrict(new Date(time))
  })

  useInterval(() => {
    setTimeAgo(formatDistanceToNowStrict(new Date(time)))
  }, interval)

  return <span>{timeAgo} ago</span>
}

export { TimeAgo }
