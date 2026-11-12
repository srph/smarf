import { useMutation } from '@tanstack/react-query'
import { config } from '~/src/config'
import { http } from '~/src/lib/http'
import { setToken } from '~/src/lib/token'

interface OauthCredentials {
  username: string
  password: string
}

/**
 * Passport password-grant login. On success it stores the token; AuthUserProvider then loads the user and
 * GuardedRoute sends them on to the page they came from.
 */
const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: OauthCredentials) =>
      http<{ access_token: string }>('oauth/token', {
        method: 'POST',
        body: {
          client_id: config.oauth.clientId,
          client_secret: config.oauth.clientSecret,
          grant_type: 'password',
          ...credentials
        }
      }),
    onSuccess: (data) => setToken(data.access_token)
  })
}

export { useLoginMutation, type OauthCredentials }
