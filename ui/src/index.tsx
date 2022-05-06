import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'

import { AuthUserProvider } from '~/src/contexts/AuthUser'
import { AxiosProvider } from '~/src/contexts/Axios'
import { QueryProvider } from '~/src/contexts/Query'
import { BoardListProvider } from '~/src/contexts/BoardList'
import { HeroListProvider } from '~/src/contexts/HeroList'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GuardedRoute } from '~/src/components'
import { AppRoute } from './routes/app'
import { HomeRoute } from './routes/app.home'
import { BoardsIdRoute } from './routes/app.boards.id'
import { AboutRoute } from './routes/app.about'
import { AccountRoute } from './routes/app.account'
import { LoginRoute } from './routes/login'
import { LogoutRoute } from './routes/logout'
import { theme } from './theme'

const App = () => {
  return (
    <>
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
                      <Route path="/boards/:boardId" element={<BoardsIdRoute />} />
                    </Route>

                    <Route
                      path="/login"
                      element={
                        <GuardedRoute type="guest">
                          <LoginRoute />
                        </GuardedRoute>
                      }
                    />

                    <Route path="/logout" element={<LogoutRoute />} />
                  </Routes>
                </BoardListProvider>
              </HeroListProvider>
            </AxiosProvider>
          </AuthUserProvider>
        </QueryProvider>
      </BrowserRouter>

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
