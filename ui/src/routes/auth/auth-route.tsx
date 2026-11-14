import React from 'react'
import { Outlet } from 'react-router'
import { LockClosedIcon } from '@heroicons/react/20/solid'
import { Icon } from '~/src/components/icon/icon'
import { LogoBadge } from '~/src/components/logo-badge/logo-badge'
import { HeroBackdrop } from './hero-backdrop'

/** The sign-in pages' layout: drifting heroes behind a centered column with the Smarf lockup, the page, and what Discord shares. */
const AuthRoute = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <HeroBackdrop />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-105 text-center">
          <div className="flex items-center justify-center gap-3.5">
            <LogoBadge size="lg" />
            <h1 className="bg-indigo-metal-text bg-clip-text pt-1 text-5xl leading-none font-black tracking-wide text-transparent uppercase">
              Smarf
            </h1>
          </div>

          <p className="mt-4 mb-7 text-xs font-bold tracking-spaced text-primary-200 uppercase">
            Dota 2 hero organizer
          </p>

          <Outlet />

          <p className="mt-4 text-xs leading-normal text-zinc-500">
            <span className="mr-1 inline-block align-text-bottom">
              <Icon icon={LockClosedIcon} size={14} />
            </span>
            Smarf gets your Discord <span className="font-medium text-zinc-300">name, avatar and email</span>, never
            your password. First time? This makes your account.
          </p>
        </div>
      </div>
    </div>
  )
}

export { AuthRoute }
