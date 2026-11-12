import React from 'react'

// Vertical gap in steps of 8px. Tailwind only ships classes it finds written out, so each size is listed.
const sizes = {
  1: 'h-2',
  2: 'h-4',
  3: 'h-6',
  4: 'h-8',
  24: 'h-48'
}

interface Props {
  size?: keyof typeof sizes
}

const Spacer: React.FC<Props> = ({ size = 1 }) => <div className={sizes[size]} />

export { Spacer }
