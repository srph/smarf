import React, { useState } from 'react'
import styled from 'styled-components'
import { Button, Input, Spacer } from '~/src/components'
import { useAuthUser } from '~/src/contexts/AuthUser'

const LoginRoute = () => {
  const { login, isLoggingIn } = useAuthUser()

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()

    login({
      username: email,
      password
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
      <Spacer size={2} />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={setPassword}
        type="password"
      />
      <Spacer size={4} />
      <Button type="submit" block disabled={isLoggingIn}>
        Sign in
      </Button>
    </form>
  )
}

export { LoginRoute }
