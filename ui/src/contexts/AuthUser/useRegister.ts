import { useMutation } from '~/src/contexts/Query'
import { useLogin } from './useLogin'

interface RegisterMutationVariables {
  name: string
  username: string
  password: string
  password_confirmation: string
}

/** Create an account, then log straight in. */
function useRegister() {
  const { login, isLoggingIn } = useLogin()

  const { mutate: register, isPending } = useMutation<{}, RegisterMutationVariables>('auth/register', 'post', {
    onSuccess: (_data, variables) => {
      login({ username: variables.username, password: variables.password })
    }
  })

  return { register, isRegistering: isPending || isLoggingIn }
}

export { useRegister, type RegisterMutationVariables }
