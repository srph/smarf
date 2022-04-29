import React, { useContext, useCallback } from 'react'
import { useEffect, useState } from 'react'
import { useAuthUser } from '~/src/contexts/AuthUser'

import axios, { AxiosInstance } from 'axios'
import useSWR from 'swr'
import { config } from '~/src/config'
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
 * Setup axios interceptors
 */
const AxiosProvider: React.FC = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const [instance, setInstance] = useState<AxiosInstance | null>()

  const auth = useAuthUser()

  useEffect(() => {
    const instance = axios.create({
      baseURL: config.api.baseUrl
    })

    const requests = [appInit, oauthToken].map((interceptor) => {
      return interceptor.setup(instance, auth)
    })

    const responses = [expiredToken].map((interceptor) => {
      return interceptor.setup(instance, auth)
    })

    setInstance(instance)

    setIsInitialized(true)

    return () => {
      requests.forEach((interceptor) => {
        instance.interceptors.request.eject(interceptor)
      })

      responses.forEach((interceptor) => {
        instance.interceptors.response.eject(interceptor)
      })

      setInstance(null)

      setIsInitialized(false)
    }
  }, [auth.token])

  return <AxiosContext.Provider value={{ axios: instance }}>{isInitialized ? children : null}</AxiosContext.Provider>
}

const useAxios = () => {
  return useContext(AxiosContext)
}

interface RequestOptions {
  skip: false
}

const useRequest = (url, opts) => {
  const { axios } = useAxios()

  const fetcher = useCallback((resource) => {
    console.log(resource)
    return Promise.resolve('tite')
    // return axios.get(resource).then(res => res.data)
  }, [])

  const { data, error } = useSWR(opts.skip ? null : url, fetcher)

  return {
    user: data,
    isLoading: !error && !data,
    isError: error
  }
}

export { AxiosProvider, useAxios, useRequest }
