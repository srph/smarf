import React from 'react'
import styled from 'styled-components'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Spacer, Logo } from '~/src/components'
import { theme } from '~/src/theme'
import loginBg from '~/src/public/images/login-bg.png'
import registerBg from '~/src/public/images/register-bg.jpg'

const AuthRoute = () => {
  const { pathname } = useLocation()

  return (
    <Layout>
      <LayoutBg bg={pathname === '/login' ? loginBg : registerBg} />

      <LayoutContent>
        <Logo />

        <Spacer size={24} />

        <LayoutContentContainer>
          <LayoutContentForm>
            <LayoutContentFormHeading>
              {pathname === '/login' ? 'Hi there, welcome back!' : 'Create an account'}
            </LayoutContentFormHeading>

            <Spacer size={4} />

            <Outlet />

            <Spacer size={3} />

            <SublinkContainer>
              {pathname === '/login' ? (
                <Sublink to="/register">New? Create an account here →</Sublink>
              ) : (
                <Sublink to="/login">← I'd like to login instead</Sublink>
              )}
            </SublinkContainer>
          </LayoutContentForm>
        </LayoutContentContainer>
      </LayoutContent>
    </Layout>
  )
}

const Layout = styled.div`
  display: flex;
  height: 100vh;
  min-height: 768px;
`

const LayoutBg = styled.div<{ bg: string }>`
  height: 100%;
  width: 50%;
  background-image: url(${(props) => props.bg});
  background-size: cover;
`

const LayoutContent = styled.div`
  padding: 32px;
  height: 100%;
  width: 50%;
`

const LayoutContentContainer = styled.div`
  display: flex;
  justify-content: center;
`

const LayoutContentForm = styled.div`
  max-width: 50%;
  min-width: 400px;
`

const LayoutContentFormHeading = styled.h1`
  font-weight: 400;
  margin: 0;
`

const SublinkContainer = styled.div`
  text-align: center;
`

const Sublink = styled(Link)`
  padding-bottom: 4px;
  text-decoration: none;
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.neutral[400]};
  border-bottom: 1px solid transparent;

  &:hover {
    transition: 200ms border-bottom-color ease;
    border-bottom-color: ${theme.colors.neutral[500]};
  }
`

export { AuthRoute }
