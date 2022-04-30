import React, { useState } from 'react'
import styled from 'styled-components'
import { Button, Input, Spacer, Logo } from '~/src/components'
import { theme } from '~/src/theme'
import bg from '~/src/public/images/login-bg.png'

import { useAuthUser } from '~/src/contexts/AuthUser'
import { useMutation } from '~/src/contexts/Query'

const LoginRoute = () => {
  const { login } = useAuthUser()

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    login({ email, password })
  }

  return (
    <Layout>
      <LayoutBg />
      <LayoutContent>
        <Logo />

        <Spacer size={24} />

        <LayoutContentContainer>
          <LayoutContentForm>
            <LayoutContentFormHeading>Hi there, welcome back!</LayoutContentFormHeading>
            <Spacer size={4} />
            <form onSubmit={handleSubmit}>
              <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
              <Spacer size={2} />
              <Input label="Password" placeholder="Enter your password" value={password} onChange={setPassword} />
              <Spacer size={4} />
              <Button type="submit" block>
                Sign in
              </Button>
              <Spacer size={3} />
              <SublinkContainer>
                <Sublink href="/register">New? Create an account here →</Sublink>
              </SublinkContainer>
            </form>
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

const LayoutBg = styled.div`
  height: 100%;
  width: 50%;
  background-image: url(${bg});
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

const Sublink = styled.a`
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

export { LoginRoute }
