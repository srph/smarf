import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import logo from '~/src/public/images/logo.png'

const Logo = () => {
  return (
    <NavLogo>
      <NavLogoImage src={logo}></NavLogoImage>
      <NavLogoText>Smarf</NavLogoText>
    </NavLogo>
  )
}

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
  letter-spacing: 0.5px;
  font-weight: 800;
  font-size: ${theme.fontSizes.lg};
`

export { Logo }
