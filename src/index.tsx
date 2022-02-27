import React from 'react'
import ReactDOM from 'react-dom'
import styled, { createGlobalStyle } from 'styled-components'
import 'modern-normalize/modern-normalize.css'
import { theme } from './theme'
import { Avatar, Button, Container, Icon } from './components'
import logo from '../public/images/logo.png'
import avatar from '../public/images/avatar.png'

const App = () => {
  return (
    <>
      <Nav>
        <Container>
          <NavContainer>
            <NavLogo>
              <NavLogoImage src={logo}></NavLogoImage>
              <NavLogoText>Smarf</NavLogoText>
            </NavLogo>

            <NavMenu>
              <NavMenuSection>
                <Button icon="view-grid-add">New Board</Button>
              </NavMenuSection>

              <Avatar src={avatar} size="lg"></Avatar>
            </NavMenu>
          </NavContainer>
        </Container>
      </Nav>

      <ToolbarContainer>
        <Container>
          <StatusIndicatorContainer>
            <StatusIndicator>
              <StatusIndicatorIcon>
                <Icon name="check-circle" />
              </StatusIndicatorIcon>
              Saved
            </StatusIndicator>
          </StatusIndicatorContainer>
        </Container>

        <Container>
          <Toolbar>
            <SelectContainer>
              <SelectIcon>
                <Icon name="template" />
              </SelectIcon>
              <Select>
                <option>Kaldag v7.31</option>
              </Select>
              <SelectCaret>
                <Icon name="chevron-double-down" />
              </SelectCaret>
            </SelectContainer>

            <ToolbarActions>
              <Button icon="plus-circle">New Category</Button>

              <IconGroup>
                <IconGroupButton>
                  <Icon name="pencil" />
                </IconGroupButton>

                <IconGroupButton>
                  <Icon name="trash" />
                </IconGroupButton>
              </IconGroup>
            </ToolbarActions>
          </Toolbar>
        </Container>
      </ToolbarContainer>

      <GlobalStyle />
    </>
  )
}

const StatusIndicatorContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`

const StatusIndicator = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: ${theme.fontSizes.sm};
`

const StatusIndicatorIcon = styled.div`
  margin-right: 8px;
  color: ${theme.colors.green[500]};
`

const SelectContainer = styled.div`
  position: relative;
  width: 320px;
  border: 2px solid transparent;
  border-radius: 4px;

  &:hover,
  &:focus-within {
    border-color: ${theme.colors.indigo[300]};
  }
`

const Select = styled.select`
  display: block;
  width: 100%;
  padding: 8px;
  padding-left: 32px;
  color: ${theme.colors.text};
  background: ${theme.colors.neutral[900]};
  border: 1px solid ${theme.colors.neutral[600]};
  border-radius: 4px;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
`

const SelectIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 8px;
  color: ${theme.colors.neutral[500]};
`

const SelectCaret = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 8px;
  color: ${theme.colors.neutral[500]};
`

const ToolbarContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 24px;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: ${theme.colors.neutral[700]};
  border-radius: 4px;
`

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
`

const IconGroup = styled.div`
  display: flex;
  margin-left: 16px;
`

const IconGroupButton = styled.button`
  position: relative;
  padding: 8px 12px;
  color: ${theme.colors.neutral[500]};
  background: ${theme.colors.neutral[900]};
  border: 0;
  cursor: pointer;

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:not(:last-child) {
    border-right: 1px solid ${theme.colors.neutral[700]};
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 4px;
    border: 2px solid transparent;
  }

  &:hover::after,
  &:focus::after {
    border-color: ${theme.colors.indigo[300]};
  }
`

const Nav = styled.div`
  border-bottom: 1px solid ${theme.colors.neutral[700]};
`

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 24px;
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
