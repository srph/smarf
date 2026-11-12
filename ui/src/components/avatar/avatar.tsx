import React from 'react'

type Sizes = 'sm' | 'md' | 'lg'

interface Props {
  src: string
  size?: Sizes
}

const sizes: Record<Sizes, string> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10'
}

export const Avatar: React.FC<Props> = ({ src, size = 'md' }) => {
  return (
    <div className="rounded-full border-2 border-zinc-700 p-1.5">
      <img src={src} alt="" className={`block rounded-full ${sizes[size]}`} />
    </div>
  )
}
