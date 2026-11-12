import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'

interface RegisterVariables {
  name: string
  username: string
  password: string
  password_confirmation: string
}

/** Create an account. It doesn't log in; follow it with useLoginMutation. */
const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (variables: RegisterVariables) => http('auth/register', { method: 'POST', body: variables })
  })
}

export { useRegisterMutation, type RegisterVariables }
