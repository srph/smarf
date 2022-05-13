import React, { createContext, useContext, useEffect, useState } from 'react'
import { useCookieState } from 'use-cookie-state'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { User } from '~/src/types/api'
import { config } from '~/src/config'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInterceptor } from './useInterceptor'

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

const AuthUserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const [token, setToken] = useCookieState(config.oauth.cookieKey, '')

  const location = useLocation()

  const navigate = useNavigate()

  const logout = () => {
    setUser(null)
    setToken('')
    navigate('/login')
  }

  useInterceptor((config) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  })

  useInterceptor(null, (err) => {
    if (err.response.status === 401 && !err.config.url.includes('/oauth/token')) {
      logout()
    }

    return Promise.reject(err)
  })

  useQuery('auth/me', {
    enabled: Boolean(token),
    onSuccess: (data) => {
      setUser(data.user)
    },
    // If it fails (mostly due to expired / invalid tokens), we don't want to delay
    // the user from navigating to the login page.
    retry: false
  })

  const { mutate: loginMutation, isLoading: isLoggingIn } = useMutation<LoginMutationResponse, LoginMutationVariables>(
    'oauth/token',
    'post',
    {
      onSuccess: (data) => {
        setToken(data.access_token)

        if (location.state?.from?.pathname) {
          window.location.replace(location.state.from.pathname)
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

  const { mutate: register, isLoading: isRegistering } = useMutation<{}, RegisterMutationVariables>(
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
