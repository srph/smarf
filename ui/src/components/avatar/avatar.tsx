import React from 'react'
import { cn } from 'cn'

type Sizes = 'sm' | 'md' | 'lg'

interface Props {
  src: string
  size?: Sizes
}

const sizes: Record<Sizes, string> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-9'
}

/** A round photo with a faint dark edge drawn inside it, so a light photo keeps a clean outline on the dark page. */
export const Avatar: React.FC<Props> = ({ src, size = 'md' }) => {
  return (
    <span className={cn('relative block shrink-0 rounded-full', sizes[size])}>
      <img src={src} alt="" className="block size-full rounded-full" />
      <span className="pointer-events-none absolute inset-0 rounded-full inset-ring inset-ring-black/30" />
    </span>
  )
}
