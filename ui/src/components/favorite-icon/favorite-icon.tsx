import React, { useState } from 'react'
import { cn } from 'cn'
import { StarIcon } from '@heroicons/react/20/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { Icon } from '~/src/components/icon/icon'

interface Props {
  value: boolean
  size?: number
}

// One dot every 45°, around the star.
const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * A star: an outline when off, a yellow star when on. Turning it on pops the star with a small burst.
 * Only a change from off to on animates, not the first render, so a list of favorites doesn't burst on load.
 */
const FavoriteIcon: React.FC<Props> = ({ value, size }) => {
  // Counts each change to on. It keys the animated parts, so favoriting again replays the animation.
  const [popCount, setPopCount] = useState(0)

  const [previousValue, setPreviousValue] = useState(value)

  if (value !== previousValue) {
    setPreviousValue(value)
    if (value) setPopCount((count) => count + 1)
  }

  if (!value) {
    return <Icon icon={StarOutlineIcon} size={size} />
  }

  const isPopping = popCount > 0

  return (
    <span className="relative inline-grid text-yellow-500">
      <span key={popCount} className={cn('inline-grid', isPopping && 'motion-safe:animate-favorite-pop')}>
        <Icon icon={StarIcon} size={size} />
      </span>

      {isPopping ? (
        <span key={`burst-${popCount}`} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2">
          {BURST_ANGLES.map((angle) => (
            <i
              key={angle}
              className="absolute -top-0.5 -left-0.5 size-1 rounded-full bg-yellow-500 opacity-0 even:size-0.75 even:bg-yellow-200 motion-safe:animate-favorite-burst"
              style={{ '--angle': `${angle}deg` } as React.CSSProperties}
            />
          ))}
        </span>
      ) : null}
    </span>
  )
}

export { FavoriteIcon }
