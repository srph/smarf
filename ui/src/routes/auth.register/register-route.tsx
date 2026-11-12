import React, { useState } from 'react'
import { Button } from '~/src/components/button/button'
import { Input } from '~/src/components/input/input'
import { PageTitle } from '~/src/components/page-title/page-title'
import { Spacer } from '~/src/components/spacer/spacer'
import { useRegister } from '~/src/contexts/auth-user/use-register'

const RegisterRoute = () => {
  const { register, isRegistering } = useRegister()

  const [email, setEmail] = useState('')

  const [name, setName] = useState('')

  const [password, setPassword] = useState('')

  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()

    register({
      name,
      username: email,
      password,
      password_confirmation: passwordConfirmation
    })
  }

  return (
    <>
      <PageTitle title="Create an account" />
      <form onSubmit={handleSubmit}>
        <Input label="Email" placeholder="your@email.com" value={email} onChange={setEmail} type="email" />
        <Spacer size={2} />

        <Input label="Name" placeholder="John Doe" value={name} onChange={setName} />
        <Spacer size={2} />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          type="password"
        />
        <Spacer size={2} />

        <Input
          label="Password Confirmation"
          placeholder="Repeat your password above"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          type="password"
        />
        <Spacer size={4} />

        <Button type="submit" block disabled={isRegistering}>
          Create an account
        </Button>
      </form>
    </>
  )
}

export { RegisterRoute }
