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
  const [user, setUser] = useState(null)

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
    onError: (err) => {
      // At this point interceptors haven't been initialized yet
      if (err?.response.status === 401) {
        logout()
      }
    },
    // At this point interceptors haven't been initialized yet
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {},
    // If it fails (mostly due to expired / invalid tokens), we don't want to delay
    // the user from navigating to the login page.
    retry: false
  })

  // This is our supposed flow:
  // Login -> Load User -> Set User and Token -> Navigate (?)
  // Our current problem with the approach above is the race condition
  // with RouteGuard running its own navigation based on token / user.
  // Instead, we'll take the easy way out and refresh
  const { mutate: loginMutation, isLoading: isLoggingIn } = useMutation<OauthCredentials>('oauth/token', 'post', {
    onSuccess: (data) => {
      setToken(data.access_token)

      if (location.state?.from?.pathname) {
        window.location.replace(location.state.from.pathname)
      } else {
        window.location.pathname = '/'
      }
    },
    onError: () => {}
  })

  const login = (credentials: OauthCredentials) => {
    loginMutation({
      client_id: config.oauth.clientId,
      client_secret: config.oauth.clientSecret,
      grant_type: 'password',
      ...credentials
    })
  }

  const { mutate: register, isLoading: isRegistering } = useMutation<RegisterMutationVariables>(
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

  const value = {
    user,
    setUser,
    token,
    register,
    isRegistering: isRegistering || isLoggingIn,
    login,
    isLoggingIn,
    logout
  }

  if (token && !user) {
    return null
  }

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

const useAuthUser = () => {
  return useContext(AuthUserContext)
}

export { useAuthUser, AuthUserProvider }
