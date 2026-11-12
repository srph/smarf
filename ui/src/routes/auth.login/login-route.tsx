import React, { useState } from 'react'
import { Button } from '~/src/components/button/button'
import { Input } from '~/src/components/input/input'
import { PageTitle } from '~/src/components/page-title/page-title'
import { Spacer } from '~/src/components/spacer/spacer'
import { useLogin } from '~/src/contexts/auth-user/use-login'

const LoginRoute = () => {
  const { login, isLoggingIn } = useLogin()

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
    <>
      <PageTitle title="Sign in" />
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
    </>
  )
}

export { LoginRoute }
