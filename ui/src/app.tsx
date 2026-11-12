import React, { StrictMode, useState } from 'react'
import './index.css'

import { AuthUserProvider } from '~/src/contexts/auth-user/auth-user-provider'
import { QueryProvider } from '~/src/contexts/query/query-provider'
import { BoardListProvider } from '~/src/contexts/board-list/board-list-provider'
import { HeroListProvider } from '~/src/contexts/hero-list/hero-list-provider'

import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { GuardedRoute } from '~/src/components/guarded-route/guarded-route'
import { AppRoute } from './routes/app/app-route'
import { HomeRoute } from './routes/app.home/home-route'
import { BoardsIdRoute } from './routes/app.boards.id/boards-id-route'
import { AboutRoute } from './routes/app.about/about-route'
import { AccountRoute } from './routes/app.account/account-route'
import { AuthRoute } from './routes/auth/auth-route'
import { LoginRoute } from './routes/auth.login/login-route'
import { RegisterRoute } from './routes/auth.register/register-route'
import { LogoutRoute } from './routes/logout/logout-route'

// Providers that use router hooks (useNavigate, useLocation) have to render inside the router.
const Root = () => {
  return (
    <AuthUserProvider>
      <HeroListProvider>
        <BoardListProvider>
          <Outlet />
        </BoardListProvider>
      </HeroListProvider>
    </AuthUserProvider>
  )
}

const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: (
          <GuardedRoute type="auth">
            <AppRoute />
          </GuardedRoute>
        ),
        children: [
          { index: true, element: <HomeRoute /> },
          { path: '/account', element: <AccountRoute /> },
          { path: '/about', element: <AboutRoute /> },
          { path: '/b/:boardId', element: <BoardsIdRoute /> }
        ]
      },
      {
        element: <AuthRoute />,
        children: [
          {
            path: '/login',
            element: (
              <GuardedRoute type="guest">
                <LoginRoute />
              </GuardedRoute>
            )
          },
          {
            path: '/register',
            element: (
              <GuardedRoute type="guest">
                <RegisterRoute />
              </GuardedRoute>
            )
          }
        ]
      },
      { path: '/logout', element: <LogoutRoute /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]

const App = () => {
  // Created on mount (not at import) so it reads the current URL; tests render App at different URLs.
  const [router] = useState(() => createBrowserRouter(routes))

  // StrictMode lives here (not in index.tsx) so tests render under it too.
  return (
    <StrictMode>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </StrictMode>
  )
}

export { App }
