import React, { createContext, useContext, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { User } from '~/src/types/api'
import { config } from '~/src/config'
import { useLocation, useNavigate } from 'react-router'
import { onUnauthorized } from '~/src/lib/http'
import { setToken, useToken } from '~/src/lib/token'
import { useLatestValue } from '~/src/hooks'

interface OauthCredentials {
  username: string
  password: string
}

interface LoginMutationResponse {
  access_token: string
}

interface LoginMutationVariables {
  username: string
  password: string
  client_id: string
  client_secret: string
  grant_type: string
}

interface RegisterMutationVariables {
  name: string
  username: string
  password: string
  password_confirmation: string
}

interface ContextType {
  user: User | null
  token: string
  login: (user: OauthCredentials) => void
  isLoggingIn: boolean
  register: (user: RegisterMutationVariables) => void
  isRegistering: boolean
  logout: () => void
}

const AuthUserContext = createContext<ContextType>({} as ContextType)

const AuthUserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = useToken()

  const queryClient = useQueryClient()

  const location = useLocation()

  const navigate = useNavigate()

  const logout = () => {
    setToken('')
    // Drop everything cached for this user, including auth/me.
    queryClient.removeQueries()
    navigate('/login')
  }

  // Any 401 (outside login) means the token expired or was revoked.
  const logoutRef = useLatestValue(logout)
  useEffect(() => onUnauthorized(() => logoutRef.current()), [])

  const { data: me } = useQuery<{ user: User }>('auth/me', {
    enabled: Boolean(token),
    // If it fails (mostly due to expired / invalid tokens), we don't want to delay
    // the user from navigating to the login page.
    retry: false
  })

  const { mutate: loginMutation, isPending: isLoggingIn } = useMutation<LoginMutationResponse, LoginMutationVariables>(
    'oauth/token',
    'post',
    {
      onSuccess: (data) => {
        setToken(data.access_token)

        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

        if (from) {
          window.location.replace(from)
        } else {
          window.location.pathname = '/'
        }
      },
      onError: () => {}
    }
  )

  // Login -> Success -> Hard-redirect
  const login = (credentials: OauthCredentials) => {
    loginMutation({
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
      grant_type: 'password',
      ...credentials
    })
  }

  const { mutate: register, isPending: isRegistering } = useMutation<{}, RegisterMutationVariables>(
    'auth/register',
    'post',
    {
      onSuccess: (data, variables) => {
        login({
          username: variables.username,
          password: variables.password
        })
      },
      onError: () => {}
    }
  )

  const user = token ? (me?.user ?? null) : null

  if (token && !user) {
    return null
  }

  return (
    <AuthUserContext.Provider
      value={{
        user,
        token,
        register,
        isRegistering: isRegistering || isLoggingIn,
        login,
        isLoggingIn,
        logout
      }}>
      {children}
    </AuthUserContext.Provider>
  )
}

const useAuthUser = () => {
  return useContext(AuthUserContext)
}

export { useAuthUser, AuthUserProvider }
