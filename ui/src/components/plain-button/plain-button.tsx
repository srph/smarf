import React from 'react'
import { cn } from 'cn'

// A button with no styles of its own (Preflight already strips the browser's).
const PlainButton: React.FC<React.ComponentProps<'button'>> = ({ className, ...props }) => (
  <button {...props} className={cn('inline-block cursor-pointer', className)} />
)

export { PlainButton }
