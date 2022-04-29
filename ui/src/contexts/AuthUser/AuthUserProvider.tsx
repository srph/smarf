import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '~/src/types/api'

interface Credentials {
  email: string
  password: string
}

interface ContextType {
  user: User | null
  token: string
  login: (user: Credentials) => void
  logout: () => void
}

const AuthUserContext = createContext<ContextType>({} as ContextType)

const AuthUserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null)

  const [token, setToken] = useState('')

  const login = () => {}

  const logout = () => {}

  const value = {
    user,
    setUser,
    token,
    login,
    logout
  }

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

const useAuthUser = () => {
  return useContext(AuthUserContext)
}

export { useAuthUser, AuthUserProvider }
