import React, { StrictMode, useState } from 'react'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'

import { AuthUserProvider } from '~/src/contexts/AuthUser'
import { QueryProvider } from '~/src/contexts/Query'
import { BoardListProvider } from '~/src/contexts/BoardList'
import { HeroListProvider } from '~/src/contexts/HeroList'

import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { GuardedRoute } from '~/src/components'
import { AppRoute } from './routes/app'
import { HomeRoute } from './routes/app.home'
import { BoardsIdRoute } from './routes/app.boards.id'
import { AboutRoute } from './routes/app.about'
import { AccountRoute } from './routes/app.account'
import { AuthRoute } from './routes/auth'
import { LoginRoute } from './routes/auth.login'
import { RegisterRoute } from './routes/auth.register'
import { LogoutRoute } from './routes/logout'

import { theme } from './theme'

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

      <GlobalStyle />
    </StrictMode>
  )
}

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.fontFamily.sans};
    font-size: ${theme.fontSizes.md}px;
    color: ${theme.colors.text};
    background: ${theme.colors.neutral[900]};
  }
`

export { App }
