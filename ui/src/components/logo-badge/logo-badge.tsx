import React from 'react'
import { cn } from 'cn'
import logoMark from '~/src/assets/images/logo-mark.svg'

type Size = 'md' | 'lg'

// lg is the sign-in lockup's badge; md sits in the navigation, with a tighter glow. The mark is about half the badge.
const sizes: Record<Size, { badge: string; mark: string }> = {
  md: { badge: 'size-9 rounded-lg drop-shadow-glow-sm', mark: 'size-5' },
  lg: { badge: 'size-11 rounded-xl drop-shadow-glow', mark: 'size-6' }
}

/** Smarf's badge: the white mark on indigo metal, with a faint edge, a lit top and a glow. Matches public/favicon/favicon.svg. */
const LogoBadge: React.FC<{ size?: Size }> = ({ size = 'md' }) => {
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center border border-primary-200/40 bg-indigo-metal inset-shadow-xs inset-shadow-white/50',
        sizes[size].badge
      )}>
      <img src={logoMark} alt="" className={sizes[size].mark} />
    </div>
  )
}

export { LogoBadge }
