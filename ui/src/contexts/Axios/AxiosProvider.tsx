import React, { useContext, useCallback } from 'react'
import { useEffect, useState } from 'react'
import { useAuthUser } from '~/src/contexts/AuthUser'

import { AxiosInstance } from 'axios'
import { axios } from './axios'
import { appInit } from './interceptor-app-init'
import { oauthToken } from './interceptor-oauth-token'
import { expiredToken } from './interceptor-expired-token'

interface ContextType {
  axios: AxiosInstance | null
}

const AxiosContext = React.createContext<ContextType>({
  axios: null
})

/**
 * Setup axios interceptors to work with auth
 */
const AxiosProvider: React.FC = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const auth = useAuthUser()

  useEffect(() => {
    const requests = [appInit, oauthToken].map((interceptor) => {
      return interceptor.setup(auth)
    })

    const responses = [expiredToken].map((interceptor) => {
      return interceptor.setup(auth)
    })

    setIsInitialized(true)

    return () => {
      requests.forEach((interceptor) => {
        axios.interceptors.request.eject(interceptor)
      })

      responses.forEach((interceptor) => {
        axios.interceptors.response.eject(interceptor)
      })

      setIsInitialized(false)
    }
  }, [auth.token])

  if (!isInitialized) {
    return null
  }

  return <>{isInitialized ? children : null}</>
}

const useAxios = () => {
  return useContext(AxiosContext)
}

export { AxiosProvider, useAxios }
