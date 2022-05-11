import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'

import { HelmetProvider, Helmet } from 'react-helmet-async'
import { AuthUserProvider } from '~/src/contexts/AuthUser'
import { AxiosProvider } from '~/src/contexts/Axios'
import { QueryProvider } from '~/src/contexts/Query'
import { BoardListProvider } from '~/src/contexts/BoardList'
import { HeroListProvider } from '~/src/contexts/HeroList'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuardedRoute, PopoverPortal } from '~/src/components'
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
import { config } from './config'

const App = () => {
  return (
    <>
      <HelmetProvider>
        <Helmet titleTemplate={`${config.app.title} — %s`} />

        <BrowserRouter>
          <QueryProvider>
            <AuthUserProvider>
              <AxiosProvider>
                <HeroListProvider>
                  <BoardListProvider>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <GuardedRoute type="auth">
                            <AppRoute />
                          </GuardedRoute>
                        }>
                        <Route index element={<HomeRoute />} />
                        <Route path="/account" element={<AccountRoute />} />
                        <Route path="/about" element={<AboutRoute />} />
                        <Route path="/b/:boardId" element={<BoardsIdRoute />} />
                      </Route>

                      <Route element={<AuthRoute />}>
                        <Route
                          path="/login"
                          element={
                            <GuardedRoute type="guest">
                              <LoginRoute />
                            </GuardedRoute>
                          }
                        />

                        <Route
                          path="/register"
                          element={
                            <GuardedRoute type="guest">
                              <RegisterRoute />
                            </GuardedRoute>
                          }
                        />
                      </Route>

                      <Route path="/logout" element={<LogoutRoute />} />
                    </Routes>
                  </BoardListProvider>
                </HeroListProvider>
              </AxiosProvider>
            </AuthUserProvider>
          </QueryProvider>
        </BrowserRouter>
      </HelmetProvider>

      <PopoverPortal />

      <GlobalStyle />
    </>
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

ReactDOM.render(<App />, document.getElementById('root'))
