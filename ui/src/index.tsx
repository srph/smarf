import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'

import { AuthUserProvider } from '~/src/contexts/AuthUser'
import { AxiosProvider } from '~/src/contexts/Axios'
import { QueryProvider } from '~/src/contexts/Query'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GuardedRoute } from '~/src/components'
import { BoardRoute } from './routes/board'
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
              <Routes>
                <Route
                  path="/"
                  element={
                    <GuardedRoute type="auth">
                      <BoardRoute />
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
