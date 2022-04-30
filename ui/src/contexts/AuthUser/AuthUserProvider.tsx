import React, { createContext, useContext, useEffect, useState } from 'react'
import { useCookieState } from 'use-cookie-state'
import { useQuery, useMutation } from '~/src/contexts/Query'
import { User } from '~/src/types/api'
import { config } from '~/src/config'

interface OauthCredentials {
  username: string
  password: string
  client_id: string
  client_secret: string
  grant_type: string
}

interface ContextType {
  user: User | null
  token: string
  login: (user: OauthCredentials) => void
  logout: () => void
}

const AuthUserContext = createContext<ContextType>({} as ContextType)

const AuthUserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null)

  const [token, setToken] = useCookieState(config.oauth.cookieKey, '')

  const { isLoading } = useQuery('auth/me', {
    enabled: Boolean(token),
    onSuccess: (data) => setUser(data)
  })

  const { mutate: login } = useMutation<OauthCredentials>('oauth/token', 'post', {
    onSuccess: (data) => {
      setToken(data.access_token)
    },
    onError: () => {}
  })

  const logout = () => {
    setUser(null)
    setToken('')
  }

  const value = {
    user,
    setUser,
    token,
    login,
    logout
  }

  if (token && isLoading) {
    return null
  }

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

const useAuthUser = () => {
  return useContext(AuthUserContext)
}

export { useAuthUser, AuthUserProvider }
