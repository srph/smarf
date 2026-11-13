import React from 'react'
import { Outlet } from 'react-router'
import { Spacer } from '~/src/components/spacer/spacer'
import { Logo } from '~/src/components/logo/logo'
import loginBg from '~/src/assets/images/login-bg.png'

/** The sign-in pages' layout: art on the left, the page on the right. */
const AuthRoute = () => {
  return (
    <div className="flex h-screen min-h-192">
      <div className="h-full w-1/2 bg-cover" style={{ backgroundImage: `url(${loginBg})` }} />

      <div className="h-full w-1/2 p-8">
        <Logo />

        <Spacer size={24} />

        <div className="flex justify-center">
          <div className="max-w-1/2 min-w-100">
            <h1 className="text-3xl">Hi there, welcome back!</h1>

            <Spacer size={4} />

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export { AuthRoute }
