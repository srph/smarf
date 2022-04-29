import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'

import { AuthUserProvider, AuthUserLoader } from '~/src/contexts/AuthUser'
import { AxiosProvider } from '~/src/contexts/Axios'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GuardedRoute } from '~/src/components'
import { BoardRoute } from './routes/board'
import { LoginRoute } from './routes/login'
import { theme } from './theme'

const App = () => {
  return (
    <>
      <AuthUserProvider>
        <AxiosProvider>
          <AuthUserLoader>
            <BrowserRouter>
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
              </Routes>
            </BrowserRouter>
          </AuthUserLoader>
        </AxiosProvider>
      </AuthUserProvider>

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
