import React from 'react'
import { LogoBadge } from '~/src/components/logo-badge/logo-badge'

/** The navigation's lockup: the small metal badge with a plain white wordmark (the metal wordmark is kept for sign-in). */
const Logo = () => {
  return (
    <div className="flex items-center gap-2.5">
      <LogoBadge size="sm" />
      <h1 className="pt-1 text-lg leading-none font-black tracking-wide uppercase">Smarf</h1>
    </div>
  )
}

export { Logo }
