import { useEffect } from 'react'
import { useLatestValue } from '~/src/hooks'
import { AxiosRequestConfig, AxiosError } from 'axios'
import { axios } from '~/src/lib/axios'

type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig

type ResponseInterceptor = (error: AxiosError) => Promise<AxiosError>

const useInterceptor = (req?: RequestInterceptor, res?: ResponseInterceptor) => {
  const reqRef = useLatestValue(req)

  const resRef = useLatestValue(res)

  useEffect(() => {
    const requestEject = axios.interceptors.request.use((config: AxiosRequestConfig) => {
      return reqRef.current ? reqRef.current(config) : config
    })

    const responseEject = axios.interceptors.response.use(null, (error: AxiosError) => {
      return resRef.current ? resRef.current.(error) : Promise.reject(error)
    })

    return () => {
      axios.interceptors.request.eject(requestEject)

      axios.interceptors.response.eject(responseEject)
    }
  }, [])
}

export { useInterceptor }