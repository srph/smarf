import { useMutation } from '@tanstack/react-query'
import { http } from '~/src/lib/http'
import { setToken } from '~/src/lib/token'

interface DiscordLoginVariables {
  /** The code Discord sent back. It works once. */
  code: string
  /** The redirect the code was issued for; Discord checks it matches. */
  redirect_uri: string
}

/**
 * Trades Discord's code for a Smarf token and stores it; AuthUserProvider then loads the user and
 * GuardedRoute sends them on to the page they came from.
 */
const useDiscordLoginMutation = () => {
  return useMutation({
    mutationFn: (variables: DiscordLoginVariables) =>
      http<{ access_token: string }>('auth/discord', { method: 'POST', body: variables }),
    onSuccess: (data) => setToken(data.access_token)
  })
}

export { useDiscordLoginMutation, type DiscordLoginVariables }
