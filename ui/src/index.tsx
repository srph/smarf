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
import { BoardsIdRoute } from './routes/boards.id'
import { LoginRoute } from './routes/login'
import { LogoutRoute } from './routes/logout'
import { AboutRoute } from './routes/about'
import { AccountRoute } from './routes/account'
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
                    <Route index element={<Navigate to="/boards/23c54ddc-7868-4917-b5e5-5fc1e2f37f5f" replace />} />

                    <Route
                      path="/account"
                      element={
                        <GuardedRoute type="auth">
                          <AccountRoute />
                        </GuardedRoute>
                      }
                    />

                    <Route
                      path="/about"
                      element={
                        <GuardedRoute type="auth">
                          <AboutRoute />
                        </GuardedRoute>
                      }
                    />
                    <Route
                      path="/boards/:boardId"
                      element={
                        <GuardedRoute type="auth">
                          <BoardsIdRoute />
                        </GuardedRoute>
                      }
                    />

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
