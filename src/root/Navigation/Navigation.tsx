import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Avatar, Button, Container, PlainButton } from '~/src/components'
import logo from '~/src/public/images/logo.png'
import avatar from '~/src/public/images/avatar.png'
import { UserDropdown } from './UserDropdown'

const Navigation: React.FC = () => {
  return (
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

            <PlainButton>
              <Avatar src={avatar} size="lg"></Avatar>
            </PlainButton>
          </NavMenu>
        </NavContainer>

        <UserDropdown />
      </Container>
    </Nav>
  )
}

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
  text-transform: uppercase;
  font-size: ${theme.fontSizes.lg};
`

const NavMenu = styled.div`
  display: flex;
  align-items: center;
`

const NavMenuSection = styled.div`
  margin-right: 24px;
`

export { Navigation }
