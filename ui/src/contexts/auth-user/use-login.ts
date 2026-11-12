import { useLocation, useNavigate } from 'react-router'
import { useMutation } from '~/src/contexts/query/query-provider'
import { config } from '~/src/config'
import { setToken } from '~/src/lib/token'

interface OauthCredentials {
  username: string
  password: string
}

interface LoginMutationResponse {
  access_token: string
}

interface LoginMutationVariables extends OauthCredentials {
  client_id: string
  client_secret: string
  grant_type: string
}

/** Passport password-grant login. On success, stores the token and goes to the page the user came from. */
function useLogin() {
  const location = useLocation()

  const navigate = useNavigate()

  const { mutate, isPending } = useMutation<LoginMutationResponse, LoginMutationVariables>('oauth/token', 'post', {
    onSuccess: (data) => {
      setToken(data.access_token)

      // GuardedRoute puts the page it bounced from in location.state.
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from || '/', { replace: true })
    }
  })

  const login = (credentials: OauthCredentials) => {
    mutate({
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
      grant_type: 'password',
      ...credentials
    })
  }

  return { login, isLoggingIn: isPending }
}

export { useLogin, type OauthCredentials }
