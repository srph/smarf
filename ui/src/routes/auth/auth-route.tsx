import React from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Spacer } from '~/src/components/spacer/spacer'
import { Logo } from '~/src/components/logo/logo'
import loginBg from '~/src/assets/images/login-bg.png'
import registerBg from '~/src/assets/images/register-bg.jpg'

const sublink = 'border-b border-transparent pb-1 text-zinc-400 transition-colors duration-200 hover:border-zinc-500'

const AuthRoute = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen min-h-192">
      <div
        className="h-full w-1/2 bg-cover"
        style={{ backgroundImage: `url(${pathname === '/login' ? loginBg : registerBg})` }}
      />

      <div className="h-full w-1/2 p-8">
        <Logo />

        <Spacer size={24} />

        <div className="flex justify-center">
          <div className="max-w-1/2 min-w-100">
            <h1 className="text-3xl">{pathname === '/login' ? 'Hi there, welcome back!' : 'Create an account'}</h1>

            <Spacer size={4} />

            <Outlet />

            <Spacer size={3} />

            <div className="text-center">
              {pathname === '/login' ? (
                <Link to="/register" className={sublink}>
                  New? Create an account here →
                </Link>
              ) : (
                <Link to="/login" className={sublink}>
                  ← I'd like to login instead
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AuthRoute }
