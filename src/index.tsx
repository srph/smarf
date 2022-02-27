import React from 'react'
import ReactDOM from 'react-dom'
import styled, { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'
import { theme } from './theme'
import { Avatar, Button, Icon } from './components'
import logo from '../public/images/logo.png'
import avatar from '../public/images/avatar.png'

const App = () => {
  return (
    <>
      <Nav>
        <NavContainer>
          <NavLogo>
            <NavLogoImage src={logo}></NavLogoImage>
            <NavLogoText>Smarf</NavLogoText>
          </NavLogo>

          <NavMenu>
            <NavMenuSection>
              <Button icon={<Icon name="view-grid-add" />}>New Board</Button>
            </NavMenuSection>

            <Avatar src={avatar} size="lg"></Avatar>
          </NavMenu>
        </NavContainer>
      </Nav>

      <GlobalStyle />
    </>
  )
}

const Nav = styled.div`
  border-bottom: 1px solid ${theme.colors.neutral[700]};
`

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 16px;
`

const NavLogo = styled.div`
  display: flex;
  align-items: center;
`

const NavLogoImage = styled.img`
  margin-right: 16px;
`

const NavLogoText = styled.h1`
  margin: 0;
  font-size: ${theme.fontSizes.lg};
`

const NavMenu = styled.div`
  display: flex;
  align-items: center;
`

const NavMenuSection = styled.div`
  margin-right: 24px;
`

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
