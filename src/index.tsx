import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'
import { theme } from './theme'
import { EditPopover } from './root/EditPopover'
import { BoardWorkspace } from './root/BoardWorkspace'
import { Navigation } from './root/Navigation'
import { Toolbar } from './root/Toolbar'

const App = () => {
  return (
    <>
      <Navigation />
      <BoardWorkspace />
      <Toolbar />
      <EditPopover />
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
